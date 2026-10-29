import {
  formatDayAgo,
  formatDayGroup,
  formatRelativeTime,
  formatTimelineDate,
  shortLocation,
} from "@/lib/format"

/** Fixed reference point so every expectation below is deterministic. */
const NOW = new Date(2026, 9, 26, 14, 30)

function minutesBefore(minutes: number) {
  return new Date(NOW.getTime() - minutes * 60 * 1000)
}

describe("formatRelativeTime", () => {
  it("counts minutes and hours within the same day", () => {
    expect(formatRelativeTime(minutesBefore(0), NOW)).toBe("Just now")
    expect(formatRelativeTime(minutesBefore(40), NOW)).toBe("40 min ago")
    expect(formatRelativeTime(minutesBefore(60), NOW)).toBe("1 hour ago")
    expect(formatRelativeTime(minutesBefore(150), NOW)).toBe("2 hours ago")
  })

  it("names the day once the alert is no longer today", () => {
    expect(formatRelativeTime(new Date(2026, 9, 25, 16, 30), NOW)).toBe("Yesterday 4:30 PM")
    expect(formatRelativeTime(new Date(2026, 8, 14, 9, 0), NOW)).toBe("Sep 14 9:00 AM")
  })

  it("uses calendar days, not elapsed hours", () => {
    // 15 hours earlier, but the previous calendar day — "15 hours ago" would
    // read as if it were still today.
    expect(formatRelativeTime(new Date(2026, 9, 25, 23, 30), NOW)).toBe("Yesterday 11:30 PM")
  })
})

describe("formatDayGroup", () => {
  it("labels the feed's day headings", () => {
    expect(formatDayGroup(new Date(2026, 9, 26, 8, 0), NOW)).toBe("Today")
    expect(formatDayGroup(new Date(2026, 9, 25, 8, 0), NOW)).toBe("Yesterday")
    expect(formatDayGroup(new Date(2026, 8, 14, 8, 0), NOW)).toBe("Sep 14")
  })
})

describe("formatDayAgo", () => {
  it("counts whole days up to a week, then falls back to a date", () => {
    expect(formatDayAgo(new Date(2026, 9, 26, 1, 0), NOW)).toBe("Today")
    expect(formatDayAgo(new Date(2026, 9, 25, 1, 0), NOW)).toBe("Yesterday")
    expect(formatDayAgo(new Date(2026, 9, 23, 1, 0), NOW)).toBe("3 days ago")
    expect(formatDayAgo(new Date(2026, 9, 1, 1, 0), NOW)).toBe("Oct 1")
  })

  it("treats a future timestamp as today rather than a negative count", () => {
    expect(formatDayAgo(new Date(2026, 9, 27, 1, 0), NOW)).toBe("Today")
  })
})

describe("formatTimelineDate", () => {
  it("keeps the time for recent steps and drops it for older ones", () => {
    expect(formatTimelineDate(new Date(2026, 9, 26, 10, 15), NOW)).toBe("Today 10:15 AM")
    expect(formatTimelineDate(new Date(2026, 9, 25, 8, 0), NOW)).toBe("Yesterday 8:00 AM")
    expect(formatTimelineDate(new Date(2026, 8, 5, 8, 0), NOW)).toBe("Sep 5")
  })
})

describe("shortLocation", () => {
  it("keeps the first two parts of an address", () => {
    expect(shortLocation("Galle Road, Kollupitiya, Colombo 03")).toBe("Galle Road, Kollupitiya")
  })

  it("passes through shorter addresses unchanged", () => {
    expect(shortLocation("Bambalapitiya")).toBe("Bambalapitiya")
  })

  it("drops empty segments", () => {
    expect(shortLocation("Borella, , Colombo 08")).toBe("Borella")
  })
})
