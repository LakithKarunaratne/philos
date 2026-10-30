// Bridge between the Clerk session and the local `users` mirror, and the single
// place authorization is decided (PHI-13).
//
// Where role lives: Clerk `publicMetadata.role` is the control plane — an
// operator grants a role from the Clerk dashboard and the `user.*` webhook
// mirrors it into `users.role` (lib/user-sync.ts). Every check below reads that
// column rather than the session token, for two reasons: the DB row is already
// loaded on any path that writes (it supplies `userId` for attribution), and a
// revoked role takes effect on the next request instead of waiting out the
// lifetime of an already-issued JWT.
//
// `requireRole` is the server-side boundary. UI that hides a control is a
// convenience, not a defence: server actions are POST endpoints anyone can call
// directly, so every privileged action calls `requireRole` itself.

import { cache } from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import type { UserRole } from "@/generated/prisma/enums"
import type { UserModel } from "@/generated/prisma/models"
import { prisma } from "@/lib/prisma"
import { syncClerkUser, type ClerkUserPayload } from "@/lib/user-sync"

type DbUser = Pick<UserModel, "id" | "clerkId" | "username" | "displayName" | "email" | "role">

const dbUserSelect = {
  id: true,
  clerkId: true,
  username: true,
  displayName: true,
  email: true,
  role: true,
} as const

/** Why an authorization check failed — callers map this to 401 vs 403. */
export type AuthFailure = "unauthenticated" | "forbidden"

/**
 * Thrown by `requireRole`. Actions that render their own error state catch it;
 * anywhere else it bubbles to the nearest error boundary, which fails closed.
 */
export class AuthorizationError extends Error {
  readonly reason: AuthFailure

  constructor(reason: AuthFailure) {
    super(
      reason === "unauthenticated"
        ? "Sign in to continue."
        : "You do not have permission to do that."
    )
    this.name = "AuthorizationError"
    this.reason = reason
  }
}

/**
 * The signed-in user's row, or null when nobody is signed in or Clerk's user
 * has not been mirrored yet. Read paths use this and degrade gracefully.
 *
 * Cached per request, so several components may ask without extra queries.
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
 * The signed-in user's row, creating it on first use.
 *
 * The webhook is the normal path, but it is asynchronous and can be missed —
 * a dropped delivery, or a Clerk account that predates the endpoint. This keeps
 * the first authenticated write from failing for want of a row, and reuses the
 * webhook's own mapping so both paths agree. Returns null when nobody is signed
 * in; callers decide whether that is an error.
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
  if (!clerkUser) return null

  // `currentUser()` returns the camelCase resource; the mirror speaks Clerk's
  // snake_case webhook payload, so adapt rather than duplicate the mapping.
  await syncClerkUser(toPayload(clerkUser))

  return prisma.user.findFirst({
    where: { clerkId: userId, deletedAt: null },
    select: dbUserSelect,
  })
}

type ClerkResourceUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>

function toPayload(user: ClerkResourceUser): ClerkUserPayload {
  return {
    id: user.id,
    username: user.username,
    first_name: user.firstName,
    last_name: user.lastName,
    primary_email_address_id: user.primaryEmailAddressId,
    email_addresses: user.emailAddresses.map((address) => ({
      id: address.id,
      email_address: address.emailAddress,
    })),
    primary_phone_number_id: user.primaryPhoneNumberId,
    phone_numbers: user.phoneNumbers.map((number) => ({
      id: number.id,
      phone_number: number.phoneNumber,
    })),
    public_metadata: user.publicMetadata,
  }
}

/** The signed-in user's role, or null when there is no mirrored user. */
export async function getCurrentRole(): Promise<UserRole | null> {
  return (await getCurrentDbUser())?.role ?? null
}

/**
 * Whether the signed-in user holds one of `roles`. For deciding what to render
 * — a control the user cannot use is noise. Never use it *instead* of
 * `requireRole` in the action behind that control.
 */
export async function hasRole(...roles: UserRole[]): Promise<boolean> {
  const role = await getCurrentRole()
  return role !== null && roles.includes(role)
}

/**
 * Assert the signed-in user holds one of `roles`, and return their row.
 *
 * Throws `AuthorizationError` rather than returning a flag so a caller that
 * forgets to check the result still fails closed. Uses `ensureCurrentDbUser`,
 * so a privileged user whose webhook has not landed is mirrored here instead of
 * being refused.
 */
export async function requireRole(...roles: UserRole[]): Promise<DbUser> {
  const user = await ensureCurrentDbUser()
  if (!user) throw new AuthorizationError("unauthenticated")
  if (!roles.includes(user.role)) throw new AuthorizationError("forbidden")
  return user
}
