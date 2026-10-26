// Constants and types for the case status transition (PHI-13).
//
// These live beside `actions.ts` rather than in it because a "use server" file
// may only export async functions — anything else is treated as a malformed
// server reference. Server Components reading `CASE_STATUS_ROLES` to decide
// what to render import it from here.

import { UserRole } from "@/generated/prisma/enums"

/** Roles allowed to move a case between rescue stages. */
export const CASE_STATUS_ROLES: UserRole[] = [UserRole.DISPATCHER, UserRole.ADMIN]

/** Longest note that can ride along with a transition. */
export const STATUS_NOTE_MAX_LENGTH = 200

export type CaseStatusState = {
  status: "idle" | "success" | "error"
  message?: string
}

export const CASE_STATUS_IDLE: CaseStatusState = { status: "idle" }
