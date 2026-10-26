// Read path for Settings → Contributions.

import { cache } from "react"
import { toContributionItem, type ContributionRow } from "@/lib/mappers/contributions"
import { prisma } from "@/lib/prisma"
import type { ContributionItem } from "@/lib/view-types"

/** A user's logged activity, most recent first. */
export const listContributions = cache(
  async (userId: string): Promise<ContributionItem[]> => {
    const rows = await prisma.contribution.findMany({
      where: { userId, deletedAt: null },
      orderBy: { occurredAt: "desc" },
      select: {
        id: true,
        title: true,
        detail: true,
        occurredAt: true,
        case: { select: { name: true } },
      },
    })

    const now = new Date()
    return rows.map((row: ContributionRow) => toContributionItem(row, now))
  }
)
