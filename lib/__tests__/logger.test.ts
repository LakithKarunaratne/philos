import { logger } from "@/lib/logger"

// The logger writes one JSON object per line, so a test can read the record
// back exactly as an operator's log aggregator would.
type LogRecord = Record<string, unknown>

const writers = {
  log: jest.spyOn(console, "log").mockImplementation(() => {}),
  warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
  error: jest.spyOn(console, "error").mockImplementation(() => {}),
} as const

type Writer = keyof typeof writers

function lastRecord(writer: Writer = "error"): LogRecord {
  const spy = writers[writer]
  expect(spy).toHaveBeenCalled()
  const [line] = spy.mock.calls[spy.mock.calls.length - 1]
  expect(typeof line).toBe("string")
  return JSON.parse(line as string) as LogRecord
}

const REDACTED = "[redacted]"

beforeEach(() => {
  jest.clearAllMocks()
  // jest.setup.js silences the logger for the rest of the suite.
  process.env.LOG_LEVEL = "debug"
})

afterAll(() => {
  for (const spy of Object.values(writers)) spy.mockRestore()
})

describe("logger record shape", () => {
  it("writes a single JSON line carrying the level, event and timestamp", () => {
    logger.error("foster_interest.write_failed", { caseSlug: "biscuit-2026" })

    const record = lastRecord()
    expect(record).toMatchObject({
      level: "error",
      event: "foster_interest.write_failed",
      caseSlug: "biscuit-2026",
    })
    expect(Date.parse(record.time as string)).not.toBeNaN()
    expect(writers.error).toHaveBeenCalledTimes(1)
  })

  it("routes each level to the matching console method", () => {
    logger.info("a")
    logger.warn("b")
    logger.error("c")

    expect(lastRecord("log")).toMatchObject({ level: "info", event: "a" })
    expect(lastRecord("warn")).toMatchObject({ level: "warn", event: "b" })
    expect(lastRecord("error")).toMatchObject({ level: "error", event: "c" })
  })

  it("does not let a context key shadow the reserved fields", () => {
    logger.warn("real_event", { level: "debug", event: "spoofed", time: "yesterday" })

    expect(lastRecord("warn")).toMatchObject({ level: "warn", event: "real_event" })
    expect(lastRecord("warn").time).not.toBe("yesterday")
  })

  it("drops lines below the configured level", () => {
    process.env.LOG_LEVEL = "warn"
    logger.debug("quiet")
    logger.info("also quiet")

    expect(writers.log).not.toHaveBeenCalled()

    logger.warn("loud")
    expect(writers.warn).toHaveBeenCalledTimes(1)
  })
})

describe("logger redaction", () => {
  it("redacts the fields the foster-interest form collects", () => {
    logger.error("foster_interest.write_failed", {
      name: "Ada Lovelace",
      phone: "0400 000 000",
      note: "I have a fenced yard.",
      caseSlug: "biscuit-2026",
    })

    const record = lastRecord()
    expect(record).toEqual(
      expect.objectContaining({
        name: REDACTED,
        phone: REDACTED,
        note: REDACTED,
        caseSlug: "biscuit-2026",
      })
    )
    const line = JSON.stringify(record)
    expect(line).not.toContain("Ada Lovelace")
    expect(line).not.toContain("0400 000 000")
    expect(line).not.toContain("fenced yard")
  })

  it("redacts credentials and contact details whatever the key's casing or separator", () => {
    logger.error("redaction_probe", {
      DATABASE_PASSWORD: "hunter2",
      "api-key": "sk_live_1",
      sessionId: "sess_1",
      Authorization: "Bearer abc",
      userEmail: "ada@example.com",
      mobileNumber: "0400 000 000",
      displayName: "Ada",
      homeAddress: "1 Mill Lane",
      NIC: "991234567V",
    })

    const record = lastRecord()
    for (const value of Object.values(record)) {
      if (typeof value === "string" && ["error", "redaction_probe"].includes(value)) continue
      if (value === record.time) continue
      expect(value).toBe(REDACTED)
    }
    expect(JSON.stringify(record)).not.toContain("hunter2")
  })

  it("redacts sensitive keys nested inside objects and arrays", () => {
    logger.error("nested", {
      submission: { phone: "0400 000 000", caseSlug: "biscuit-2026" },
      people: [{ name: "Ada" }, { name: "Grace" }],
    })

    const record = lastRecord()
    expect(record.submission).toEqual({ phone: REDACTED, caseSlug: "biscuit-2026" })
    expect(record.people).toEqual([{ name: REDACTED }, { name: REDACTED }])
    expect(JSON.stringify(record)).not.toContain("Ada")
  })

  it("keeps non-sensitive keys that merely look similar", () => {
    logger.error("keep", { alertId: "a-1", userId: "u-1", kind: "FOSTER", count: 3 })

    expect(lastRecord()).toMatchObject({
      alertId: "a-1",
      userId: "u-1",
      kind: "FOSTER",
      count: 3,
    })
  })
})

describe("logger error serialisation", () => {
  it("keeps the error type and message an operator needs", () => {
    const error = new TypeError("connect ECONNREFUSED 10.0.0.1:5432")
    logger.error("db_failed", { error })

    const serialised = lastRecord().error as Record<string, unknown>
    expect(serialised.type).toBe("TypeError")
    expect(serialised.message).toBe("connect ECONNREFUSED 10.0.0.1:5432")
    expect(typeof serialised.stack).toBe("string")
  })

  // Verified against Prisma 7: one wrong-typed field makes
  // PrismaClientValidationError print the whole `data` object, so every other
  // field on the foster-interest form lands in the message.
  it("redacts personal data Prisma embeds in a validation error message", () => {
    const error = new Error(
      [
        "Invalid `prisma.caseInterest.create()` invocation",
        "           data: {",
        '             caseId: "case_1",',
        '             kind: "FOSTER",',
        '             name: "Ada Lovelace",',
        '             phone: "0400 000 000",',
        '             note: "I have a fenced yard.",',
        "             createdAt: 12345",
        "           }",
        "Argument `createdAt`: Invalid value provided. Expected DateTime, provided Int.",
      ].join("\n")
    )

    logger.error("foster_interest.write_failed", { error })

    const { message } = lastRecord().error as Record<string, string>
    expect(message).not.toContain("Ada Lovelace")
    expect(message).not.toContain("0400 000 000")
    expect(message).not.toContain("fenced yard")
    // The operational detail an operator needs survives.
    expect(message).toContain("prisma.caseInterest.create()")
    expect(message).toContain("Expected DateTime, provided Int")
    expect(message).toContain('caseId: "case_1"')
    expect(message).toContain('name: "[redacted]"')
  })

  it("redacts the value Postgres embeds in a constraint violation", () => {
    logger.error("db_failed", {
      error: new Error(
        'duplicate key value violates unique constraint "case_interests_phone_key"\n' +
          "Key (phone)=(0400 000 000) already exists."
      ),
    })

    const { message } = lastRecord().error as Record<string, string>
    expect(message).not.toContain("0400 000 000")
    expect(message).toContain("Key (phone)=([redacted])")
    expect(message).toContain("already exists")
  })

  it("leaves a constraint violation on a non-sensitive column alone", () => {
    logger.error("db_failed", {
      error: new Error("Key (slug)=(biscuit-2026) already exists."),
    })

    expect((lastRecord().error as Record<string, string>).message).toContain(
      "Key (slug)=(biscuit-2026)"
    )
  })

  it("scrubs the stack as well as the message", () => {
    const error = new Error('failed with phone: "0400 000 000"')

    logger.error("db_failed", { error })

    const serialised = lastRecord().error as Record<string, string>
    expect(serialised.stack).toBeDefined()
    expect(serialised.stack).not.toContain("0400 000 000")
  })

  it("redacts an unquoted value in a dumped argument object", () => {
    logger.error("db_failed", {
      error: new Error("data: {\n  caseId: case_1,\n  phone: 0400000000\n}"),
    })

    const { message } = lastRecord().error as Record<string, string>
    expect(message).not.toContain("0400000000")
    expect(message).toContain("phone: [redacted]")
    expect(message).toContain("caseId: case_1")
  })

  it("does not mangle a message with no sensitive keys", () => {
    const message = "connect ECONNREFUSED 10.0.0.1:5432"
    logger.error("db_failed", { error: new Error(message) })

    expect((lastRecord().error as Record<string, string>).message).toBe(message)
  })

  it("serialises a thrown non-Error", () => {
    logger.error("db_failed", { error: "just a string" })

    expect(lastRecord().error).toMatchObject({ type: "string", message: "just a string" })
  })
})

describe("logger hostile input", () => {
  it("survives a circular context", () => {
    const circular: Record<string, unknown> = { caseSlug: "biscuit-2026" }
    circular.self = circular

    expect(() => logger.error("cycle", { circular })).not.toThrow()
    expect((lastRecord().circular as Record<string, unknown>).self).toBe("[circular]")
  })

  it("truncates an oversized string and a long array", () => {
    logger.error("big", { blob: "x".repeat(5_000), items: Array.from({ length: 50 }, (_, i) => i) })

    const record = lastRecord()
    expect((record.blob as string).length).toBeLessThan(600)
    expect(record.blob).toContain("[truncated]")
    expect((record.items as unknown[]).length).toBe(21)
    expect((record.items as unknown[])[20]).toBe("[30 more]")
  })

  it("does not walk class instances whose shape is unknown", () => {
    class PrismaRow {
      constructor(readonly phone: string) {}
    }

    logger.error("instance", { row: new PrismaRow("0400 000 000") })

    expect(JSON.stringify(lastRecord())).not.toContain("0400 000 000")
  })

  it("does not throw on an invalid Date", () => {
    expect(() => logger.error("bad_date", { when: new Date("nope") })).not.toThrow()
    expect(lastRecord().when).toBe("[invalid date]")
  })

  it("ignores a LOG_LEVEL that only matches an inherited property", () => {
    process.env.LOG_LEVEL = "toString"
    logger.error("still_written")

    expect(lastRecord()).toMatchObject({ event: "still_written" })
  })

  it("stops recursing past the depth cap", () => {
    logger.error("deep", { a: { b: { c: { d: { e: "too far" } } } } })

    expect(JSON.stringify(lastRecord())).not.toContain("too far")
  })
})
