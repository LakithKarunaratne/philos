// Prisma rows → the case view types the screens render.
//
// Mappers take plain objects rather than Prisma payload generics so they stay
// easy to unit-test, and they take an explicit `now` so date copy is pinnable.

import {
  CaseStatus as DbCaseStatus,
  DogGender,
} from "@/generated/prisma/enums"
import { STATUS_META } from "@/lib/constants"
import { formatRelativeTime, formatTimelineDate, shortLocation } from "@/lib/format"
import { distanceLabel } from "@/lib/geo"
import type { CaseStatus, CaseSummary, RescueCase, TimelineStep } from "@/lib/view-types"

/** The five rescue stages, in tracker order. */
export const CASE_STAGES: DbCaseStatus[] = [
  DbCaseStatus.REPORTED,
  DbCaseStatus.RESCUED,
  DbCaseStatus.VET,
  DbCaseStatus.FOSTER,
  DbCaseStatus.ADOPTED,
]

/** Tracker label for a stage with no `label` of its own on its status event. */
const STAGE_LABELS: Record<DbCaseStatus, string> = {
  REPORTED: "Reported",
  RESCUED: "Rescued",
  VET: "Vet Examination",
  FOSTER: "Foster Care",
  ADOPTED: "Forever Home",
}

/** Shown beside a stage the case has not reached yet. */
const PENDING_DATE = "Pending"

export function toViewStatus(status: DbCaseStatus): CaseStatus {
  return status.toLowerCase() as CaseStatus
}

function toViewGender(gender: DogGender): "Male" | "Female" | undefined {
  if (gender === DogGender.MALE) return "Male"
  if (gender === DogGender.FEMALE) return "Female"
  return undefined
}

export type CaseSummaryRow = {
  slug: string
  name: string
  status: DbCaseStatus
  statusNote: string | null
  summary: string
  locationName: string
  lat: number
  lng: number
  urgent: boolean
  createdAt: Date
  statusEvents?: { status: DbCaseStatus; occurredAt: Date }[]
}

export type CaseDetailRow = CaseSummaryRow & {
  ageLabel: string | null
  breed: string | null
  gender: DogGender
  temperament: string[]
  notes: string | null
  photos: { url: string | null }[]
  healthRecords: { note: string }[]
  statusEvents: { status: DbCaseStatus; label: string | null; note: string | null; occurredAt: Date }[]
}

export function toCaseSummary(row: CaseSummaryRow, now: Date = new Date()): CaseSummary {
  const statusLabel = row.statusNote ?? STATUS_META[toViewStatus(row.status)].label

  // The list detail reads "<Status> <when>", so the stamp has to be when the
  // case entered *that* status — not the newest event, which may already be a
  // later stage (a dispatch logged while the case is still only reported).
  const enteredStatusAt =
    row.statusEvents?.findLast((event) => event.status === row.status)?.occurredAt ??
    row.createdAt

  return {
    id: row.slug,
    name: row.name,
    status: toViewStatus(row.status),
    statusLabel,
    detail: `${shortLocation(row.locationName)} · ${STATUS_META[toViewStatus(row.status)].label} ${formatRelativeTime(enteredStatusAt, now)}`,
    locationName: row.locationName,
    lat: row.lat,
    lng: row.lng,
    distance: distanceLabel(row.lat, row.lng),
    urgent: row.urgent,
    blurb: row.summary,
    actions: row.urgent ? ["profile", "respond"] : ["profile"],
  }
}

/**
 * Tracker steps for a case. Logged status events become completed steps, the
 * most recent one is "current" unless the case is already adopted, and the
 * stages above it are filled in as pending.
 */
export function buildTimeline(
  events: { status: DbCaseStatus; label: string | null; note: string | null; occurredAt: Date }[],
  caseStatus: DbCaseStatus,
  now: Date = new Date()
): TimelineStep[] {
  const isClosed = caseStatus === DbCaseStatus.ADOPTED

  const logged: TimelineStep[] = events.map((event, index) => ({
    label: event.label ?? STAGE_LABELS[event.status],
    date: event.note ?? formatTimelineDate(event.occurredAt, now),
    status: !isClosed && index === events.length - 1 ? "current" : "completed",
  }))

  const lastStage = events.at(-1)?.status
  const reachedIndex = lastStage ? CASE_STAGES.indexOf(lastStage) : -1
  const pending: TimelineStep[] = CASE_STAGES.slice(reachedIndex + 1).map((stage) => ({
    label: STAGE_LABELS[stage],
    date: PENDING_DATE,
    status: "pending",
  }))

  return [...logged, ...pending]
}

export function toRescueCase(row: CaseDetailRow, now: Date = new Date()): RescueCase {
  return {
    ...toCaseSummary(row, now),
    age: row.ageLabel ?? undefined,
    breed: row.breed ?? undefined,
    gender: toViewGender(row.gender),
    photos: row.photos.map((photo) => photo.url).filter((url): url is string => Boolean(url)),
    temperament: row.temperament,
    healthNotes: row.healthRecords.map((record) => record.note),
    timelineSteps: buildTimeline(row.statusEvents, row.status, now),
    notes: row.notes ?? undefined,
  }
}
