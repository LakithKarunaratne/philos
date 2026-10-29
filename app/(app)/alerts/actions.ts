"use server"

import { revalidatePath } from "next/cache"
import { ensureCurrentDbUser } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

// `alert_id` is a uuid column, so anything else would throw inside Prisma.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Each early return in these actions leaves the client's optimistic "read"
// state wrong with nothing on screen to say so, so each one logs. Alert and
// user ids are opaque uuids, never personal data.

/** Actions are directly reachable, so auth and input are checked here, not in the page. */
export async function markAlertRead(alertId: string): Promise<void> {
  if (typeof alertId !== "string" || !UUID_PATTERN.test(alertId)) {
    logger.warn("alerts.mark_read.invalid_id", { alertId })
    return
  }

  const user = await ensureCurrentDbUser()
  if (!user) {
    logger.warn("alerts.mark_read.unauthenticated", { alertId })
    return
  }

  // A stale tab can hold a deleted alert; the FK would reject it.
  const alert = await prisma.alert.findFirst({
    where: { id: alertId, deletedAt: null },
    select: { id: true },
  })
  if (!alert) {
    logger.warn("alerts.mark_read.alert_missing", { alertId, userId: user.id })
    return
  }

  // Soft-deleted rows are revived rather than duplicated (`@@unique([alertId, userId])`).
  await prisma.alertRead.upsert({
    where: { alertId_userId: { alertId, userId: user.id } },
    update: { readAt: new Date(), deletedAt: null },
    create: { alertId, userId: user.id },
  })

  revalidatePath("/alerts")
}

export async function markAllAlertsRead(): Promise<void> {
  const user = await ensureCurrentDbUser()
  if (!user) {
    logger.warn("alerts.mark_all_read.unauthenticated")
    return
  }

  const alerts = await prisma.alert.findMany({
    where: { deletedAt: null },
    select: { id: true },
  })

  // Revive soft-deleted reads first, since skipDuplicates would leave them deleted.
  await prisma.$transaction([
    prisma.alertRead.updateMany({
      where: { userId: user.id, deletedAt: { not: null } },
      data: { deletedAt: null, readAt: new Date() },
    }),
    prisma.alertRead.createMany({
      data: alerts.map(({ id }) => ({ alertId: id, userId: user.id })),
      skipDuplicates: true,
    }),
  ])

  revalidatePath("/alerts")
}
