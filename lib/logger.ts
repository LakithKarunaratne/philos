import "server-only"

// Structured server-side logging.
//
// Why a `console` wrapper and not Pino: REVIEW.md §7 asks for a native API or a
// tiny dependency before a heavy one. Every runtime this app targets — the Node
// server, Vercel's serverless functions, `next dev` — already captures
// stdout/stderr and treats a single-line JSON object as a structured record, so
// `console` plus `JSON.stringify` is the whole transport. Pino would add a
// dependency, a worker-thread transport that needs care when bundled for
// serverless, and a second place where log formatting is configured, in
// exchange for features (levels, serializers, redaction) that are a few dozen
// lines here. Revisit if we ever need sampling, child loggers or a direct
// shipper to a log service.
//
// `no-console` is enabled repo-wide (REVIEW.md §5) and overridden for this file
// alone in `eslint.config.mjs`; this module is the only sanctioned way to write
// a log line.
//
// `import "server-only"` makes a client-side import a build error, so a stray
// import from a Client Component cannot ship this (or the operational detail it
// logs) to the browser.
//
// Redaction: every value in a context object is scrubbed by key name before it
// is serialised, so a field that holds personal data (a submitter's name, phone
// number or free-text note) or a credential is replaced with "[redacted]" even
// if a caller passes it by mistake. The deny list is deliberately blunt —
// `name` is redacted outright, because the only `name` this app handles is a
// person's. Use `event`, `action` or a domain-specific key such as `caseSlug`
// for identifiers worth reading in a log. Scrubbing is a backstop, not a
// licence: call sites should not pass personal data in the first place.

/** Arbitrary structured fields attached to a log line. Scrubbed before output. */
export type LogContext = Record<string, unknown>

export type LogLevel = "debug" | "info" | "warn" | "error"

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

/**
 * Accepted `LOG_LEVEL` values. `silent` is a threshold only — nothing writes at
 * it — and is what the test suite sets so an expected failure path does not
 * print a stack trace into the run.
 */
const THRESHOLDS: Record<LogLevel | "silent", number> = {
  ...LEVEL_ORDER,
  silent: Number.MAX_SAFE_INTEGER,
}

const REDACTED = "[redacted]"

/** Substrings that mark a key as personal data or a credential. */
const SENSITIVE_KEY_FRAGMENTS = [
  "address",
  "apikey",
  "authorization",
  "cookie",
  "credential",
  "displayname",
  "email",
  "firstname",
  "fullname",
  "lastname",
  "mobile",
  "note",
  "passwd",
  "password",
  "phone",
  "secret",
  "sessionid",
  "telephone",
  "token",
  "username",
]

/** Keys whose value is always run through the error serialiser. */
const ERROR_KEYS = new Set(["error", "err", "cause"])

/** Keys too short to match as substrings without false positives. */
const SENSITIVE_KEY_EXACT = new Set([
  "auth",
  "dob",
  "name",
  "nic",
  "otp",
  "pin",
  "ssn",
])

// Caps so one oversized value cannot flood the log or stall serialisation.
const MAX_DEPTH = 4
const MAX_ARRAY_ITEMS = 20
const MAX_STRING_LENGTH = 512
const MAX_STACK_LENGTH = 1000

/** Lower-cased and stripped of separators, so `API_KEY` and `apiKey` match alike. */
function normaliseKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function isSensitiveKey(normalisedKey: string): boolean {
  if (SENSITIVE_KEY_EXACT.has(normalisedKey)) return true
  return SENSITIVE_KEY_FRAGMENTS.some((fragment) => normalisedKey.includes(fragment))
}

function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength)}…[truncated]`
}

type SerialisedError = { type: string; message: string; stack?: string }

/**
 * Errors are logged by type and message — the operational detail the user-facing
 * message deliberately withholds. Nothing here is scrubbed: a driver message is
 * not personal data, and redacting it would defeat the point of logging it.
 */
function serialiseError(error: unknown): SerialisedError {
  if (error instanceof Error) {
    const serialised: SerialisedError = {
      type: error.name,
      message: truncate(error.message, MAX_STRING_LENGTH),
    }
    if (error.stack) serialised.stack = truncate(error.stack, MAX_STACK_LENGTH)
    return serialised
  }
  return { type: typeof error, message: truncate(String(error), MAX_STRING_LENGTH) }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function scrubValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === null) return null

  switch (typeof value) {
    case "string":
      return truncate(value, MAX_STRING_LENGTH)
    case "number":
      return Number.isFinite(value) ? value : String(value)
    case "boolean":
      return value
    case "bigint":
      return value.toString()
    case "undefined":
      return undefined
    case "function":
      return "[function]"
    case "symbol":
      return value.toString()
  }

  if (value instanceof Error) return serialiseError(value)
  // `toISOString` throws on an invalid Date, and a logger must never throw
  // inside the catch block that called it.
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "[invalid date]" : value.toISOString()
  }

  const object = value as object
  if (seen.has(object)) return "[circular]"
  if (depth >= MAX_DEPTH) return "[truncated]"
  seen.add(object)

  try {
    if (Array.isArray(value)) {
      const items = value
        .slice(0, MAX_ARRAY_ITEMS)
        .map((item) => scrubValue(item, depth + 1, seen))
      if (value.length > MAX_ARRAY_ITEMS) {
        items.push(`[${value.length - MAX_ARRAY_ITEMS} more]`)
      }
      return items
    }

    if (isPlainObject(value)) return scrubContext(value, depth + 1, seen)

    // Class instances and exotic objects (Map, Set, Prisma rows) are not worth
    // walking: their shape is unknown, so they could carry anything.
    return truncate(Object.prototype.toString.call(value), MAX_STRING_LENGTH)
  } finally {
    seen.delete(object)
  }
}

function scrubContext(
  context: Record<string, unknown>,
  depth: number,
  seen: WeakSet<object>
): Record<string, unknown> {
  const scrubbed: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(context)) {
    if (value === undefined) continue
    const normalisedKey = normaliseKey(key)
    if (isSensitiveKey(normalisedKey)) {
      scrubbed[key] = REDACTED
      continue
    }
    // A thrown value is not always an `Error`; normalise it either way so
    // `{ error }` always reads the same in the log.
    scrubbed[key] = ERROR_KEYS.has(normalisedKey)
      ? serialiseError(value)
      : scrubValue(value, depth, seen)
  }
  return scrubbed
}

/**
 * The lowest level that is written. `LOG_LEVEL` overrides it; otherwise debug
 * lines are dropped in production and kept in development. Read per call so a
 * deployment can change the level without a rebuild.
 */
function threshold(): number {
  const configured = process.env.LOG_LEVEL?.toLowerCase()
  if (configured && Object.hasOwn(THRESHOLDS, configured)) {
    return THRESHOLDS[configured as keyof typeof THRESHOLDS]
  }
  return process.env.NODE_ENV === "production" ? LEVEL_ORDER.info : LEVEL_ORDER.debug
}

function write(level: LogLevel, event: string, context?: LogContext): void {
  if (LEVEL_ORDER[level] < threshold()) return

  const record = {
    // Depth 1: the context's own values sit one level below the record.
    ...(context ? scrubContext(context, 1, new WeakSet()) : {}),
    // Reserved fields are assigned last so a stray context key cannot shadow them.
    level,
    event,
    time: new Date().toISOString(),
  }

  let line: string
  try {
    line = JSON.stringify(record)
  } catch {
    // Scrubbing already replaces cycles and exotic values, so this is a
    // last resort (a throwing `toJSON`, say) — losing the line would be worse.
    line = JSON.stringify({ level, event, time: record.time, context: "[unserialisable]" })
  }

  // `no-console` is switched off for this file alone in eslint.config.mjs.
  if (level === "error") console.error(line)
  else if (level === "warn") console.warn(line)
  else console.log(line)
}

/**
 * The application logger. `event` is a stable, greppable identifier
 * (`foster_interest.write_failed`), not a sentence; everything variable belongs
 * in `context`.
 */
export const logger = {
  debug: (event: string, context?: LogContext): void => write("debug", event, context),
  info: (event: string, context?: LogContext): void => write("info", event, context),
  warn: (event: string, context?: LogContext): void => write("warn", event, context),
  error: (event: string, context?: LogContext): void => write("error", event, context),
}
