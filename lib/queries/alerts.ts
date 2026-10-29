// Read path for the alerts feed. Read state is per user (`AlertRead`), so the
// caller passes the current DB user id; a signed-in user with no synced row
// yet (see `lib/auth.ts`) simply sees everything as unread.

import { cache } from "react"
import { toAlertItem, type AlertRow } from "@/lib/mappers/alerts"
import { prisma } from "@/lib/prisma"
import type { AlertItem } from "@/lib/view-types"

/** Newest first; `userId` only decides which rows come back marked read. */
export const listAlerts = cache(async (userId: string | null): Promise<AlertItem[]> => {
  const [rows, reads] = await Promise.all([
    prisma.alert.findMany({
      where: { deletedAt: null },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        link: true,
        publishedAt: true,
        case: { select: { slug: true } },
      },
    }),
    userId
      ? prisma.alertRead.findMany({
          where: { userId, deletedAt: null },
          select: { alertId: true },
        })
      : Promise.resolve([]),
  ])

  const readIds = new Set(reads.map((read: { alertId: string }) => read.alertId))
  const now = new Date()
  return rows.map((row: AlertRow) => toAlertItem(row, { read: readIds.has(row.id), now }))
})
