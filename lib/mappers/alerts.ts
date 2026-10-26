// Prisma `Alert` rows → the feed items the alerts screen renders.
//
// Read state is per user and lives in a separate table, so it comes in as a
// flag rather than on the row.

import { AlertCategory as DbAlertCategory } from "@/generated/prisma/enums"
import { formatDayGroup, formatRelativeTime } from "@/lib/format"
import type { AlertCategory, AlertItem } from "@/lib/view-types"

/** Where a row points when the alert has no link and no case. */
const ALERTS_FALLBACK_LINK = "/alerts"

export type AlertRow = {
  id: string
  title: string
  description: string
  category: DbAlertCategory
  link: string | null
  publishedAt: Date
  case: { slug: string } | null
}

export function toViewCategory(category: DbAlertCategory): AlertCategory {
  return category.toLowerCase() as AlertCategory
}

export function toAlertItem(
  row: AlertRow,
  { read, now = new Date() }: { read: boolean; now?: Date }
): AlertItem {
  const caseLink = row.case ? `/cases/${row.case.slug}` : null

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    time: formatRelativeTime(row.publishedAt, now),
    day: formatDayGroup(row.publishedAt, now),
    category: toViewCategory(row.category),
    read,
    caseId: row.case?.slug,
    link: row.link ?? caseLink ?? ALERTS_FALLBACK_LINK,
  }
}
