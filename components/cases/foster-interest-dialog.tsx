"use client"

import { useState } from "react"
import { HeartIcon, UserCheckIcon } from "lucide-react"
import { FosterInterestForm } from "@/components/cases/foster-interest-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useFosterForm } from "@/hooks/use-foster-form"

interface FosterInterestDialogProps {
  caseName: string
}

export function FosterInterestDialog({ caseName }: FosterInterestDialogProps) {
  const [open, setOpen] = useState(false)
  const form = useFosterForm()

  return (
    <>
      <Button
        variant="outline"
        className="flex-1 gap-1.5"
        onClick={() => {
          form.reopen()
          setOpen(true)
        }}
      >
        <HeartIcon className="size-4 text-primary" />
        Foster / Adopt
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {form.submitted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-primary/20 text-primary">
                <UserCheckIcon className="size-6" />
              </span>
              <DialogTitle>Interest Registered!</DialogTitle>
              <DialogDescription className="max-w-xs">
                Thank you! Our volunteer coordinator in Colombo will reach out to you within 24 hours to coordinate care for {caseName}.
              </DialogDescription>
              <Button className="mt-2 w-full" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          ) : (
            <FosterInterestForm
              caseName={caseName}
              values={form.values}
              onFieldChange={form.setField}
              onSubmit={form.submit}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
