"use server"

// Write path for a case. This is the first server action in the app, so it is
// also the pattern PHI-3/4/5 follow: validate, authenticate, resolve the row,
// write, revalidate, and return state the form can render — never a raw Prisma
// row, which would be serialised to the browser.
//
// Server actions are POST endpoints anyone can call directly, so the checks
// here are the security boundary; the fact that the dialog only renders on an
// authenticated page is not.

import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import {
  CASE_STATUS_ROLES,
  STATUS_NOTE_MAX_LENGTH,
  type CaseStatusState,
} from "@/app/(app)/cases/[id]/status-options"
import { CaseStatus, InterestKind } from "@/generated/prisma/enums"
import { AuthorizationError, ensureCurrentDbUser, requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  collectErrors,
  optionalText,
  readText,
  requiredText,
  type FieldErrors,
} from "@/lib/validation"

const NAME_MAX_LENGTH = 120
const PHONE_MAX_LENGTH = 40
const NOTE_MAX_LENGTH = 1000

type FosterInterestField = "name" | "phone" | "note"

export type FosterInterestValues = Record<FosterInterestField, string>

export type FosterInterestState = {
  status: "idle" | "success" | "error"
  /** Shown above the form when the failure is not tied to one field. */
  message?: string
  fieldErrors?: FieldErrors<FosterInterestField>
  /** Echoed back so a rejected submit does not discard what was typed. */
  values?: FosterInterestValues
}

export const FOSTER_INTEREST_IDLE: FosterInterestState = { status: "idle" }

/**
 * Register foster or adoption interest in a case.
 *
 * `caseSlug` is bound by the caller rather than posted as a hidden field, so
 * the form cannot retarget the write. Interest is accepted from signed-in
 * users; `userId` stays null until PHI-13 mirrors the Clerk account, and the
 * name and phone on the row are what the coordinator actually calls.
 */
export async function submitFosterInterest(
  caseSlug: string,
  _prevState: FosterInterestState,
  formData: FormData
): Promise<FosterInterestState> {
  const values: FosterInterestValues = {
    name: readText(formData, "name"),
    phone: readText(formData, "phone"),
    note: readText(formData, "note"),
  }

  const fieldErrors = collectErrors<FosterInterestField>({
    name: requiredText(values.name, "Your full name", NAME_MAX_LENGTH),
    phone: requiredText(values.phone, "A phone number", PHONE_MAX_LENGTH),
    note: optionalText(values.note, "The note", NOTE_MAX_LENGTH),
  })

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values }
  }

  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) {
    return { status: "error", message: "Sign in to register interest.", values }
  }

  const rescueCase = await prisma.rescueCase.findFirst({
    where: { slug: caseSlug, deletedAt: null },
    select: { id: true },
  })

  if (!rescueCase) {
    return { status: "error", message: "This case is no longer available.", values }
  }

  // Attribution is best-effort — the row carries the name and phone the
  // coordinator actually calls, so a mirroring failure must not lose the
  // interest. `userId` stays null until PHI-13 syncs the Clerk account.
  let userId: string | null = null
  try {
    userId = (await ensureCurrentDbUser())?.id ?? null
  } catch {
    userId = null
  }

  try {
    await prisma.caseInterest.create({
      data: {
        caseId: rescueCase.id,
        userId,
        kind: InterestKind.FOSTER,
        name: values.name,
        phone: values.phone,
        note: values.note || null,
      },
    })
  } catch {
    // Never surface the driver's message — it can carry connection details.
    return {
      status: "error",
      message: "We could not save that just now. Please try again.",
      values,
    }
  }

  revalidatePath(`/cases/${caseSlug}`)
  return { status: "success" }
}

// ---------------------------------------------------------------------------
// Status transitions (PHI-13)
// ---------------------------------------------------------------------------

function isCaseStatus(value: string): value is CaseStatus {
  return Object.hasOwn(CaseStatus, value)
}

/**
 * Move a case to another rescue stage and log the event behind it.
 *
 * Dispatcher/admin only. The control that posts here is hidden from everyone
 * else, but this action is a POST endpoint anyone can call directly, so
 * `requireRole` — not the hidden control — is what enforces that.
 *
 * `caseSlug` is bound by the caller rather than posted, so the form cannot
 * retarget the write to another case.
 */
export async function updateCaseStatus(
  caseSlug: string,
  _prevState: CaseStatusState,
  formData: FormData
): Promise<CaseStatusState> {
  const next = readText(formData, "status")
  const note = readText(formData, "note")

  if (!isCaseStatus(next)) {
    return { status: "error", message: "Pick a stage to move this case to." }
  }

  const noteError = optionalText(note, "The note", STATUS_NOTE_MAX_LENGTH)
  if (noteError) {
    return { status: "error", message: noteError }
  }

  let actor: Awaited<ReturnType<typeof requireRole>>
  try {
    actor = await requireRole(...CASE_STATUS_ROLES)
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { status: "error", message: error.message }
    }
    throw error
  }

  const rescueCase = await prisma.rescueCase.findFirst({
    where: { slug: caseSlug, deletedAt: null },
    select: { id: true, status: true },
  })

  if (!rescueCase) {
    return { status: "error", message: "This case is no longer available." }
  }

  if (rescueCase.status === next) {
    return { status: "error", message: "This case is already at that stage." }
  }

  try {
    // The row's status and its history have to move together — the profile
    // tracker reads the events, so a half-applied change would render a stage
    // the case is not in.
    await prisma.$transaction([
      prisma.rescueCase.update({
        where: { id: rescueCase.id },
        data: { status: next },
      }),
      prisma.caseStatusEvent.create({
        data: {
          caseId: rescueCase.id,
          status: next,
          note: note || null,
          actorId: actor.id,
        },
      }),
    ])
  } catch {
    // Never surface the driver's message — it can carry connection details.
    return { status: "error", message: "We could not save that just now. Please try again." }
  }

  // The stage shows on the profile, the home list and the map pins.
  revalidatePath(`/cases/${caseSlug}`)
  revalidatePath("/")
  revalidatePath("/map")

  return { status: "success" }
}
