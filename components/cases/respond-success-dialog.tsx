"use client"

import { useRouter } from "next/navigation"
import { CheckCircle2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

interface RespondSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: string
  caseName: string
  eta: string
}

export function RespondSuccessDialog({ open, onOpenChange, caseId, caseName, eta }: RespondSuccessDialogProps) {
  const router = useRouter()

  function closeAndGo(href: string) {
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
          <DialogTitle className="text-xl">Response Confirmed!</DialogTitle>
          <DialogDescription className="max-w-xs text-sm">
            Thank you for stepping up! The report team for <strong>{caseName}</strong> has been notified that you are arriving in <strong>{eta}</strong>.
          </DialogDescription>
          <div className="mt-2 flex w-full flex-col gap-2">
            <Button onClick={() => closeAndGo(`/cases/${caseId}`)} className="w-full">
              Back to Case Profile
            </Button>
            <Button variant="outline" onClick={() => closeAndGo("/map")} className="w-full">
              Open Map
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
