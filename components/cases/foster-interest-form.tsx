"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { UserCheckIcon } from "lucide-react"
import {
  FOSTER_INTEREST_IDLE,
  submitFosterInterest,
  type FosterInterestState,
} from "@/app/(app)/cases/[id]/actions"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FosterInterestFormProps {
  caseSlug: string
  caseName: string
  onDone: () => void
}

/** Submit button, split out so `useFormStatus` can see the enclosing form. */
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Submitting..." : "Submit Interest"}
    </Button>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-xs font-medium text-destructive">
      {message}
    </p>
  )
}

export function FosterInterestForm({ caseSlug, caseName, onDone }: FosterInterestFormProps) {
  // Bound rather than posted as a hidden field, so the form cannot retarget
  // the write to another case.
  const [state, formAction] = useActionState<FosterInterestState, FormData>(
    submitFosterInterest.bind(null, caseSlug),
    FOSTER_INTEREST_IDLE
  )

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-primary/20 text-primary">
          <UserCheckIcon className="size-6" />
        </span>
        <DialogTitle>Interest Registered!</DialogTitle>
        <DialogDescription className="max-w-xs">
          Thank you! Our volunteer coordinator in Colombo will reach out to you within 24 hours to
          coordinate care for {caseName}.
        </DialogDescription>
        <Button className="mt-2 w-full" onClick={onDone}>
          Done
        </Button>
      </div>
    )
  }

  const { fieldErrors, values } = state

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Express Foster or Adoption Interest</DialogTitle>
        <DialogDescription>
          Help give {caseName} a loving environment while recovering or seeking a permanent home.
        </DialogDescription>
      </DialogHeader>

      {state.message && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="foster-name">Your Full Name</Label>
          <Input
            id="foster-name"
            name="name"
            required
            defaultValue={values?.name}
            aria-invalid={Boolean(fieldErrors?.name)}
            aria-describedby={fieldErrors?.name ? "foster-name-error" : undefined}
            placeholder="e.g. Priyantha Silva"
          />
          <FieldError id="foster-name-error" message={fieldErrors?.name} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="foster-phone">Phone / WhatsApp</Label>
          <Input
            id="foster-phone"
            name="phone"
            type="tel"
            required
            defaultValue={values?.phone}
            aria-invalid={Boolean(fieldErrors?.phone)}
            aria-describedby={fieldErrors?.phone ? "foster-phone-error" : undefined}
            placeholder="+94 77 123 4567"
          />
          <FieldError id="foster-phone-error" message={fieldErrors?.phone} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="foster-notes">Home situation or questions</Label>
          <Textarea
            id="foster-notes"
            name="note"
            defaultValue={values?.note}
            aria-invalid={Boolean(fieldErrors?.note)}
            aria-describedby={fieldErrors?.note ? "foster-notes-error" : undefined}
            placeholder="Do you have other pets, a garden, or specific availability?"
            className="min-h-16"
          />
          <FieldError id="foster-notes-error" message={fieldErrors?.note} />
        </div>
      </div>

      <DialogFooter>
        <SubmitButton />
      </DialogFooter>
    </form>
  )
}
