import { AlertCategory, CaseStatus, DogGender } from "@/generated/prisma/enums"
import { toAlertItem, type AlertRow } from "@/lib/mappers/alerts"
import {
  buildTimeline,
  toCaseSummary,
  toRescueCase,
  toViewStatus,
  type CaseDetailRow,
  type CaseSummaryRow,
} from "@/lib/mappers/cases"
import { toContributionItem } from "@/lib/mappers/contributions"

/** Fixed reference point so every date expectation below is deterministic. */
const NOW = new Date(2026, 9, 26, 14, 30)

const summaryRow: CaseSummaryRow = {
  slug: "bruno",
  name: "Bruno",
  status: CaseStatus.REPORTED,
  statusNote: "Injured",
  summary: "Galle Road · needs emergency transport to clinic",
  locationName: "Galle Road, Kollupitiya, Colombo 03",
  lat: 6.9147,
  lng: 79.8528,
  urgent: true,
  createdAt: new Date(2026, 9, 26, 13, 50),
  statusEvents: [{ status: CaseStatus.REPORTED, occurredAt: new Date(2026, 9, 26, 13, 50) }],
}

describe("toViewStatus", () => {
  it("lowercases the DB enum into the status the UI keys on", () => {
    expect(toViewStatus(CaseStatus.VET)).toBe("vet")
    expect(toViewStatus(CaseStatus.ADOPTED)).toBe("adopted")
  })
})

describe("toCaseSummary", () => {
  it("maps a row to the shape list rows and map pins take", () => {
    const summary = toCaseSummary(summaryRow, NOW)

    expect(summary.id).toBe("bruno")
    expect(summary.status).toBe("reported")
    expect(summary.blurb).toBe(summaryRow.summary)
    expect(summary.distance).toMatch(/away$/)
  })

  it("prefers the case's status note over the status's own label", () => {
    expect(toCaseSummary(summaryRow, NOW).statusLabel).toBe("Injured")
    expect(toCaseSummary({ ...summaryRow, statusNote: null }, NOW).statusLabel).toBe("Reported")
  })

  it("builds the list detail from the location and the latest status change", () => {
    expect(toCaseSummary(summaryRow, NOW).detail).toBe(
      "Galle Road, Kollupitiya · Reported 40 min ago"
    )
  })

  it("falls back to createdAt when the case has no status events", () => {
    const row = { ...summaryRow, statusEvents: [] }
    expect(toCaseSummary(row, NOW).detail).toContain("40 min ago")
  })

  it("times the detail from the current status, not from a later logged stage", () => {
    // A dispatch is logged as a RESCUED event while the case is still only
    // reported; the row must still read "Reported 40 min ago".
    const row: CaseSummaryRow = {
      ...summaryRow,
      statusEvents: [
        { status: CaseStatus.REPORTED, occurredAt: new Date(2026, 9, 26, 13, 50) },
        { status: CaseStatus.RESCUED, occurredAt: new Date(2026, 9, 26, 14, 25) },
      ],
    }

    expect(toCaseSummary(row, NOW).detail).toBe("Galle Road, Kollupitiya · Reported 40 min ago")
  })

  it("offers the respond action only on urgent cases", () => {
    expect(toCaseSummary(summaryRow, NOW).actions).toEqual(["profile", "respond"])
    expect(toCaseSummary({ ...summaryRow, urgent: false }, NOW).actions).toEqual(["profile"])
  })
})

describe("buildTimeline", () => {
  it("marks the newest logged event current and fills the rest in as pending", () => {
    const steps = buildTimeline(
      [
        {
          status: CaseStatus.REPORTED,
          label: null,
          note: null,
          occurredAt: new Date(2026, 9, 26, 10, 15),
        },
        {
          status: CaseStatus.RESCUED,
          label: "Volunteer Transport",
          note: "Dispatched",
          occurredAt: new Date(2026, 9, 26, 11, 0),
        },
      ],
      CaseStatus.REPORTED,
      NOW
    )

    expect(steps).toEqual([
      { label: "Reported", date: "Today 10:15 AM", status: "completed" },
      { label: "Volunteer Transport", date: "Dispatched", status: "current" },
      { label: "Vet Examination", date: "Pending", status: "pending" },
      { label: "Foster Care", date: "Pending", status: "pending" },
      { label: "Forever Home", date: "Pending", status: "pending" },
    ])
  })

  it("leaves no current or pending step once a case is adopted", () => {
    const steps = buildTimeline(
      [
        {
          status: CaseStatus.ADOPTED,
          label: "Forever Home Trial",
          note: null,
          occurredAt: new Date(2026, 7, 15, 9, 0),
        },
      ],
      CaseStatus.ADOPTED,
      NOW
    )

    expect(steps).toEqual([
      { label: "Forever Home Trial", date: "Aug 15", status: "completed" },
    ])
  })

  it("shows every stage as pending for a case with no events yet", () => {
    const steps = buildTimeline([], CaseStatus.REPORTED, NOW)
    expect(steps).toHaveLength(5)
    expect(steps.every((step) => step.status === "pending")).toBe(true)
  })
})

describe("toRescueCase", () => {
  const detailRow: CaseDetailRow = {
    ...summaryRow,
    ageLabel: "~2 years",
    breed: "Sri Lankan Street Dog",
    gender: DogGender.MALE,
    temperament: ["Friendly once calm"],
    notes: "Spotted resting near the bus stand.",
    photos: [{ url: "https://cdn.example/bruno.jpg" }, { url: null }],
    healthRecords: [{ note: "Limping on front-left paw" }],
    statusEvents: [
      {
        status: CaseStatus.REPORTED,
        label: null,
        note: null,
        occurredAt: new Date(2026, 9, 26, 10, 15),
      },
    ],
  }

  it("carries the profile-only fields through", () => {
    const detail = toRescueCase(detailRow, NOW)

    expect(detail.age).toBe("~2 years")
    expect(detail.gender).toBe("Male")
    expect(detail.healthNotes).toEqual(["Limping on front-left paw"])
    expect(detail.timelineSteps).toHaveLength(5)
  })

  it("drops photos that have no resolved URL yet", () => {
    expect(toRescueCase(detailRow, NOW).photos).toEqual(["https://cdn.example/bruno.jpg"])
  })

  it("leaves gender undefined when it is unknown, so the UI does not guess", () => {
    const row = { ...detailRow, gender: DogGender.UNKNOWN }
    expect(toRescueCase(row, NOW).gender).toBeUndefined()
  })

  it("maps absent optional columns to undefined rather than null", () => {
    const row = { ...detailRow, ageLabel: null, breed: null, notes: null }
    const detail = toRescueCase(row, NOW)

    expect(detail.age).toBeUndefined()
    expect(detail.breed).toBeUndefined()
    expect(detail.notes).toBeUndefined()
  })
})

describe("toAlertItem", () => {
  const alertRow: AlertRow = {
    id: "alert-uuid",
    title: "Urgent: Transport needed for Bruno",
    description: "Volunteer with vehicle needed.",
    category: AlertCategory.URGENT,
    link: null,
    publishedAt: new Date(2026, 9, 26, 13, 50),
    case: { slug: "bruno" },
  }

  it("maps the row and takes read state from the caller", () => {
    const item = toAlertItem(alertRow, { read: true, now: NOW })

    expect(item.category).toBe("urgent")
    expect(item.time).toBe("40 min ago")
    expect(item.day).toBe("Today")
    expect(item.read).toBe(true)
    expect(item.caseId).toBe("bruno")
  })

  it("resolves the link so rows never need a fallback", () => {
    expect(toAlertItem(alertRow, { read: false, now: NOW }).link).toBe("/cases/bruno")
    expect(
      toAlertItem({ ...alertRow, link: "/cases/bruno/respond" }, { read: false, now: NOW }).link
    ).toBe("/cases/bruno/respond")
    expect(toAlertItem({ ...alertRow, case: null }, { read: false, now: NOW }).link).toBe("/alerts")
  })
})

describe("toContributionItem", () => {
  const base = {
    id: "contribution-uuid",
    title: "Transport for Bruno",
    occurredAt: new Date(2026, 9, 23, 9, 0),
  }

  it("maps a row to the settings log entry", () => {
    const item = toContributionItem(
      { ...base, detail: "Riverside Clinic · Assigned volunteer", case: null },
      NOW
    )

    expect(item.title).toBe("Transport for Bruno")
    expect(item.detail).toBe("Riverside Clinic · Assigned volunteer")
    expect(item.date).toBe("3 days ago")
  })

  it("falls back to the linked case name when there is no detail", () => {
    expect(toContributionItem({ ...base, detail: null, case: { name: "Bruno" } }, NOW).detail).toBe(
      "Bruno"
    )
  })

  it("renders an empty detail rather than null when there is neither", () => {
    expect(toContributionItem({ ...base, detail: null, case: null }, NOW).detail).toBe("")
  })
})
