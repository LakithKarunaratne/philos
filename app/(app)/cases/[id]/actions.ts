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
import { InterestKind } from "@/generated/prisma/enums"
import { ensureCurrentDbUser } from "@/lib/auth"
import { logger } from "@/lib/logger"
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
  } catch (error) {
    // Logged rather than swallowed: the interest is still recorded, but a run
    // of these means attribution is silently broken and PHI-13's sync is down.
    // The submitter's name and phone stay out of the line — see lib/logger.ts.
    logger.warn("foster_interest.attribution_failed", { caseSlug, error })
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
  } catch (error) {
    // Never surface the driver's message — it can carry connection details.
    // The operator gets it in the log instead; the user keeps the generic copy.
    logger.error("foster_interest.write_failed", { caseSlug, caseId: rescueCase.id, error })
    return {
      status: "error",
      message: "We could not save that just now. Please try again.",
      values,
    }
  }

  revalidatePath(`/cases/${caseSlug}`)
  return { status: "success" }
}
