"use client"

import { useRouter } from "next/navigation"
import { CheckCircle2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { DEMO_CASE_ID } from "@/lib/constants"

type ReportSuccessDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dogName: string
  locationText: string
}

export function ReportSuccessDialog({
  open,
  onOpenChange,
  dogName,
  locationText,
}: ReportSuccessDialogProps) {
  const router = useRouter()

  function goTo(href: string) {
    onOpenChange(false)
    router.push(href)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-primary/20 text-primary">
            <CheckCircle2Icon className="size-8" />
          </span>
          <DialogTitle className="text-xl">Report Broadcasted!</DialogTitle>
          <DialogDescription className="max-w-xs text-sm">
            Volunteers and rescue partners in Colombo have been notified about{" "}
            <strong>{dogName.trim() || "this dog"}</strong> at {locationText}.
          </DialogDescription>
          <div className="mt-3 flex w-full flex-col gap-2">
            {/* Reports are not persisted yet, so there is no new case to open.
                The spec prefers landing on a profile, so show the demo case. */}
            <Button
              onClick={() => goTo(`/cases/${DEMO_CASE_ID}`)}
              className="w-full"
            >
              View Case Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => goTo("/map")}
              className="w-full"
            >
              Open Rescue Map
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
