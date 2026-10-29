// Bridge between the Clerk session and the local `users` mirror.
//
// Scope note: PHI-13 owns the full Clerk → DB sync (webhook, roles, server-side
// role gating). What lives here is the minimum PHI-14 needs to attribute writes
// and to read per-user state:
//
//   - `getCurrentDbUser()` — lookup only, used on read paths so a GET never writes.
//   - `ensureCurrentDbUser()` — lazy upsert by `clerkId`, used by server actions.
//
// Neither touches `role`; new rows keep the schema default (REPORTER). When
// PHI-13 lands, the webhook becomes the source of truth and the upsert here
// stays as the first-request fallback.

import { cache } from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import type { UserModel } from "@/generated/prisma/models"
import { prisma } from "@/lib/prisma"

type DbUser = Pick<UserModel, "id" | "clerkId" | "username" | "displayName" | "email" | "role">

const dbUserSelect = {
  id: true,
  clerkId: true,
  username: true,
  displayName: true,
  email: true,
  role: true,
} as const

/**
 * The signed-in user's row, or null when nobody is signed in or Clerk's user
 * has not been mirrored yet. Read paths use this and degrade gracefully.
 */
export const getCurrentDbUser = cache(async (): Promise<DbUser | null> => {
  const { userId } = await auth()
  if (!userId) return null

  return prisma.user.findFirst({
    where: { clerkId: userId, deletedAt: null },
    select: dbUserSelect,
  })
})

/** Convenience for read paths that only need the id to filter on. */
export async function getCurrentDbUserId(): Promise<string | null> {
  const user = await getCurrentDbUser()
  return user?.id ?? null
}

/**
 * The signed-in user's row, creating it on first use. Server actions call this
 * so a write can be attributed before PHI-13's webhook exists. Returns null
 * when nobody is signed in — callers decide whether that is an error.
 */
export async function ensureCurrentDbUser(): Promise<DbUser | null> {
  const { userId } = await auth()
  if (!userId) return null

  const existing = await prisma.user.findFirst({
    where: { clerkId: userId, deletedAt: null },
    select: dbUserSelect,
  })
  if (existing) return existing

  const clerkUser = await currentUser()
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null
  const displayName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: { email, displayName, deletedAt: null },
    create: {
      clerkId: userId,
      // `username` is unique and required; Clerk's own handle is preferred,
      // with the Clerk id as a collision-proof fallback.
      username: clerkUser?.username ?? `user_${userId.slice(-12)}`,
      displayName,
      email,
    },
    select: dbUserSelect,
  })
}
