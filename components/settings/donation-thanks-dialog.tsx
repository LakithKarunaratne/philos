"use client"

import { HeartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

interface DonationThanksDialogProps {
  open: boolean
  amount: number
  onOpenChange: (open: boolean) => void
}

export function DonationThanksDialog({ open, amount, onOpenChange }: DonationThanksDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-primary/20 text-primary">
            <HeartIcon className="size-8 fill-primary" />
          </span>
          <DialogTitle className="text-xl">Thank you for your support!</DialogTitle>
          <DialogDescription className="max-w-xs text-sm">
            Your mock donation of <strong>${amount}</strong> helps provide food, veterinary care, and emergency response for street dogs across Colombo.
          </DialogDescription>
          <Button className="mt-3 w-full" onClick={() => onOpenChange(false)}>
            Back to Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
