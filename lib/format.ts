// Date formatting for server-rendered copy. Every helper takes an explicit
// `now` so tests can pin it, and returns a plain string — the pages render on
// the server, so nothing here needs to agree with the client's clock.

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

/**
 * The one locale every date helper formats in. en-US matches the app's
 * existing copy ("4:30 PM", "Sep 14") rather than the en-GB forms ("4:30 pm",
 * "14 Sept"). Swap this single constant when the app grows real i18n.
 */
const LOCALE = "en-US"

const TIME_FORMAT = new Intl.DateTimeFormat(LOCALE, {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

const DATE_FORMAT = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  day: "numeric",
})

/** Calendar days between two instants, ignoring the time of day. */
function calendarDaysApart(date: Date, now: Date): number {
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((b.getTime() - a.getTime()) / DAY_MS)
}

/**
 * Row stamp for alerts: "40 min ago" and "2 hours ago" within the day,
 * "Yesterday 4:30 PM" the day before, then an absolute date.
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const days = calendarDaysApart(date, now)

  if (days === 0) {
    const elapsed = now.getTime() - date.getTime()
    if (elapsed < MINUTE_MS) return "Just now"
    if (elapsed < HOUR_MS) {
      const minutes = Math.floor(elapsed / MINUTE_MS)
      return `${minutes} min ago`
    }
    const hours = Math.floor(elapsed / HOUR_MS)
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  }

  if (days === 1) return `Yesterday ${TIME_FORMAT.format(date)}`

  return `${DATE_FORMAT.format(date)} ${TIME_FORMAT.format(date)}`
}

/** Heading an alert is grouped under in the feed. */
export function formatDayGroup(date: Date, now: Date = new Date()): string {
  const days = calendarDaysApart(date, now)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return DATE_FORMAT.format(date)
}

/** Coarse stamp for the contributions log: "Today", "Yesterday", "3 days ago". */
export function formatDayAgo(date: Date, now: Date = new Date()): string {
  const days = calendarDaysApart(date, now)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return DATE_FORMAT.format(date)
}

/** Stamp beside a tracker step: "Today 10:15 AM", "Yesterday 8:00 AM", "5 Sep". */
export function formatTimelineDate(date: Date, now: Date = new Date()): string {
  const days = calendarDaysApart(date, now)
  if (days === 0) return `Today ${TIME_FORMAT.format(date)}`
  if (days === 1) return `Yesterday ${TIME_FORMAT.format(date)}`
  return DATE_FORMAT.format(date)
}

/**
 * First two parts of a case location ("Galle Road, Kollupitiya, Colombo 03" →
 * "Galle Road, Kollupitiya"), for list rows that have no room for the rest.
 */
export function shortLocation(locationName: string): string {
  return locationName
    .split(",")
    .slice(0, 2)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ")
}
