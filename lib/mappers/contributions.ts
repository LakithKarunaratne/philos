// Prisma `Contribution` rows → the Settings → Contributions log.

import { formatDayAgo } from "@/lib/format"
import type { ContributionItem } from "@/lib/view-types"

export type ContributionRow = {
  id: string
  title: string
  detail: string | null
  occurredAt: Date
  case: { name: string } | null
}

export function toContributionItem(
  row: ContributionRow,
  now: Date = new Date()
): ContributionItem {
  return {
    id: row.id,
    title: row.title,
    detail: row.detail ?? row.case?.name ?? "",
    date: formatDayAgo(row.occurredAt, now),
  }
}
