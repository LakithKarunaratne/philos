"use client"

import { useState } from "react"
import { HeartIcon } from "lucide-react"
import { FosterInterestForm } from "@/components/cases/foster-interest-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface FosterInterestDialogProps {
  caseSlug: string
  caseName: string
}

export function FosterInterestDialog({ caseSlug, caseName }: FosterInterestDialogProps) {
  const [open, setOpen] = useState(false)
  // Action state lives inside the form, so a fresh key is what resets it back
  // to a blank form after a successful submit.
  const [formKey, setFormKey] = useState(0)

  function closeAndReset() {
    setOpen(false)
    setFormKey((key) => key + 1)
  }

  return (
    <>
      <Button variant="outline" className="flex-1 gap-1.5" onClick={() => setOpen(true)}>
        <HeartIcon className="size-4 text-primary" />
        Foster / Adopt
      </Button>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : closeAndReset())}>
        <DialogContent>
          <FosterInterestForm
            key={formKey}
            caseSlug={caseSlug}
            caseName={caseName}
            onDone={closeAndReset}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
