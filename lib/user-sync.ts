// Clerk → `users` mirror (PHI-13).
//
// Clerk owns identity; this module owns the local row that cases, responses and
// contributions point at. Two callers share it so both paths agree on the
// mapping: the `user.*` webhook (app/api/webhooks/clerk/route.ts) and the lazy
// upsert in lib/auth.ts that covers the window before a webhook lands.
//
// Role: `publicMetadata.role` in Clerk is the control plane — only the Clerk
// dashboard and Backend API can write it, never the user themselves. It is
// mirrored here into `users.role`, which is the single thing authorization
// reads (lib/auth.ts). Metadata without a usable role leaves the column alone,
// so a role granted directly in the database is not clobbered by an unrelated
// profile edit.

import { UserRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

/** Prisma's code for "a unique constraint rejected this write". */
const UNIQUE_VIOLATION = "P2002"

/**
 * Read as a shape rather than with `instanceof PrismaClientKnownRequestError`,
 * so this module never pulls the Prisma query engine in — it is imported by
 * unit tests that have no database and no Node crypto.
 */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  )
}

const USER_ROLES = new Set<string>(Object.values(UserRole))

/** The Clerk fields the mirror reads. Matches `UserJSON` structurally. */
export type ClerkUserPayload = {
  id: string
  username?: string | null
  first_name?: string | null
  last_name?: string | null
  primary_email_address_id?: string | null
  email_addresses?: { id: string; email_address: string }[]
  primary_phone_number_id?: string | null
  phone_numbers?: { id: string; phone_number: string }[]
  public_metadata?: unknown
}

/**
 * The role named in Clerk's `publicMetadata`, or null when there is none to
 * mirror. Operators type this by hand in the dashboard, so case and surrounding
 * whitespace are forgiven — but an unrecognised value is ignored rather than
 * guessed at, which keeps a typo from silently granting or dropping access.
 */
export function roleFromMetadata(metadata: unknown): UserRole | null {
  if (typeof metadata !== "object" || metadata === null) return null

  const { role } = metadata as { role?: unknown }
  if (typeof role !== "string") return null

  const normalised = role.trim().toUpperCase()
  return USER_ROLES.has(normalised) ? (normalised as UserRole) : null
}

/** Clerk marks one address primary; fall back to the first it sent. */
function primaryOf<T extends { id: string }>(
  items: T[] | undefined,
  primaryId: string | null | undefined
): T | undefined {
  if (!items?.length) return undefined
  return items.find((item) => item.id === primaryId) ?? items[0]
}

export function emailOf(user: ClerkUserPayload): string | null {
  return primaryOf(user.email_addresses, user.primary_email_address_id)?.email_address ?? null
}

export function phoneOf(user: ClerkUserPayload): string | null {
  return primaryOf(user.phone_numbers, user.primary_phone_number_id)?.phone_number ?? null
}

export function displayNameOf(user: ClerkUserPayload): string | null {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || null
}

/**
 * `username` is unique and required, so a user who never set one in Clerk still
 * needs a value. The Clerk id is unique, which makes this collision-proof, and
 * deterministic, so retries land on the same name.
 */
export function fallbackUsername(clerkId: string): string {
  return `user_${clerkId.slice(-12)}`
}

/**
 * Create or refresh the row for a Clerk user and return its id.
 *
 * `deletedAt` is cleared because reaching here means Clerk considers the
 * account live — a user deleted and re-created under the same id is the same
 * person, and their cases should reattach rather than orphan.
 */
export async function syncClerkUser(user: ClerkUserPayload): Promise<string> {
  const role = roleFromMetadata(user.public_metadata)

  // Only the fields Clerk actually owns are written, so a column it knows
  // nothing about (`role`, when metadata carries none) keeps its value.
  const shared = {
    email: emailOf(user),
    phone: phoneOf(user),
    displayName: displayNameOf(user),
    ...(role ? { role } : {}),
  }

  const write = (username: string) =>
    prisma.user.upsert({
      where: { clerkId: user.id },
      update: { ...shared, username, deletedAt: null },
      create: { clerkId: user.id, username, ...shared },
      select: { id: true },
    })

  const claimed = user.username?.trim()
  if (!claimed) return (await write(fallbackUsername(user.id))).id

  try {
    return (await write(claimed)).id
  } catch (error) {
    // A soft-deleted row can still hold the handle this user just claimed —
    // the unique index spans deleted rows too. Fall back rather than lose the
    // sync over a display detail.
    if (isUniqueViolation(error)) {
      return (await write(fallbackUsername(user.id))).id
    }
    throw error
  }
}

/**
 * Soft-delete the row for a deleted Clerk account, per the schema's no-hard-
 * deletes rule. Cases and contributions keep pointing at it so history
 * survives; nothing can sign in as them again, since Clerk is gone.
 */
export async function softDeleteClerkUser(clerkId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { clerkId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
}
