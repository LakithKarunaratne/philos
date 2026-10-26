// Read path for cases. Every query filters `deletedAt: null` (soft deletes,
// see the schema header) and returns view types, never raw Prisma rows — the
// screens pass these straight to client components, so they must be plain and
// serialisable.
//
// Wrapped in `React.cache` so a route that needs the same data in several
// places (page + metadata, say) hits the database once per request.

import { cache } from "react"
import { CaseStatus as DbCaseStatus } from "@/generated/prisma/enums"
import {
  toCaseSummary,
  toRescueCase,
  type CaseDetailRow,
  type CaseSummaryRow,
} from "@/lib/mappers/cases"
import { prisma } from "@/lib/prisma"
import type { CaseStats, CaseSummary, RescueCase, UrgentSummary } from "@/lib/view-types"

/** Statuses that still need volunteer attention. */
const ACTIVE_STATUSES: DbCaseStatus[] = [
  DbCaseStatus.REPORTED,
  DbCaseStatus.RESCUED,
  DbCaseStatus.VET,
]

const summarySelect = {
  slug: true,
  name: true,
  status: true,
  statusNote: true,
  summary: true,
  locationName: true,
  lat: true,
  lng: true,
  urgent: true,
  createdAt: true,
  statusEvents: {
    where: { deletedAt: null },
    orderBy: { occurredAt: "asc" },
    select: { status: true, occurredAt: true },
  },
} as const

/**
 * Cases for the home list and the map, urgent first then most recent.
 * Mapped to summaries, so this is safe to hand to a client component.
 */
export const listCases = cache(async (): Promise<CaseSummary[]> => {
  const rows = await prisma.rescueCase.findMany({
    where: { deletedAt: null },
    orderBy: [{ urgent: "desc" }, { createdAt: "desc" }],
    select: summarySelect,
  })

  const now = new Date()
  return rows.map((row: CaseSummaryRow) => toCaseSummary(row, now))
})

/** Full profile for `/cases/[slug]`, or null when there is no such case. */
export const getCaseBySlug = cache(async (slug: string): Promise<RescueCase | null> => {
  const row = await prisma.rescueCase.findFirst({
    where: { slug, deletedAt: null },
    select: {
      ...summarySelect,
      ageLabel: true,
      breed: true,
      gender: true,
      temperament: true,
      notes: true,
      photos: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        select: { url: true },
      },
      healthRecords: {
        where: { deletedAt: null },
        orderBy: { recordedAt: "asc" },
        select: { note: true },
      },
      statusEvents: {
        where: { deletedAt: null },
        orderBy: { occurredAt: "asc" },
        select: { status: true, label: true, note: true, occurredAt: true },
      },
    },
  })

  return row ? toRescueCase(row as CaseDetailRow) : null
})

/** Counts behind the home stats grid. */
export const getCaseStats = cache(async (): Promise<CaseStats> => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1)

  const [active, inFoster, adoptedThisYear] = await Promise.all([
    prisma.rescueCase.count({
      where: { deletedAt: null, status: { in: ACTIVE_STATUSES } },
    }),
    prisma.rescueCase.count({
      where: { deletedAt: null, status: DbCaseStatus.FOSTER },
    }),
    prisma.rescueCase.count({
      where: {
        deletedAt: null,
        status: DbCaseStatus.ADOPTED,
        statusEvents: {
          some: {
            deletedAt: null,
            status: DbCaseStatus.ADOPTED,
            occurredAt: { gte: startOfYear },
          },
        },
      },
    }),
  ])

  return { active, inFoster, adoptedThisYear }
})

/** Urgent case count plus the case the home banner's "Respond" opens. */
export const getUrgentSummary = cache(async (): Promise<UrgentSummary> => {
  const where = { deletedAt: null, urgent: true, status: { in: ACTIVE_STATUSES } }

  const [count, next] = await Promise.all([
    prisma.rescueCase.count({ where }),
    prisma.rescueCase.findFirst({
      where,
      orderBy: { createdAt: "desc" },
      select: { slug: true },
    }),
  ])

  return { count, respondSlug: next?.slug ?? null }
})
