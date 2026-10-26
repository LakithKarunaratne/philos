// View types the screens render. Previously declared alongside the fixtures in
// `lib/mock-data`; they now live here so components depend on a stable shape
// rather than on the fixtures, and `lib/mappers/*` turns Prisma rows into them.

export type CaseStatus = "reported" | "rescued" | "vet" | "foster" | "adopted"

export type TimelineStep = {
  label: string
  date: string
  status: "completed" | "current" | "pending"
}

/** Everything the list rows, map pins and preview cards need. */
export type CaseSummary = {
  /** The case slug — what `/cases/[id]` routes on. */
  id: string
  name: string
  status: CaseStatus
  statusLabel: string
  detail: string
  locationName: string
  lat: number
  lng: number
  distance: string
  urgent?: boolean
  blurb: string
  actions: ("profile" | "respond")[]
}

/** A summary plus the fields only the profile page renders. */
export type RescueCase = CaseSummary & {
  age?: string
  breed?: string
  gender?: "Male" | "Female"
  photos?: string[]
  temperament?: string[]
  healthNotes?: string[]
  timelineSteps: TimelineStep[]
  notes?: string
}

export type AlertCategory = "urgent" | "update" | "foster"

export type AlertItem = {
  id: string
  title: string
  description: string
  /** Relative stamp for the row ("40 min ago"). */
  time: string
  /** Heading the row is grouped under ("Today", "Yesterday", "12 Sep"). */
  day: string
  category: AlertCategory
  read: boolean
  caseId?: string
  /** Always resolved by the mapper, so rows never need a fallback. */
  link: string
}

export type ContributionItem = {
  id: string
  title: string
  detail: string
  date: string
}

/** Counts behind the home stats grid. */
export type CaseStats = {
  active: number
  inFoster: number
  adoptedThisYear: number
}

/** Drives the home urgent banner. */
export type UrgentSummary = {
  count: number
  /** Slug of the case the "Respond" button opens; null when nothing is urgent. */
  respondSlug: string | null
}
