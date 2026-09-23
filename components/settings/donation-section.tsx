"use client"

import { useState } from "react"
import { HeartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DonationThanksDialog } from "@/components/settings/donation-thanks-dialog"
import { selectableChipClass } from "@/lib/styles"
import { cn } from "cn"

const DONATION_PRESETS = [5, 15, 50]
/** Preset selected on load, and the amount used when the custom field is not a usable number. */
const DEFAULT_DONATION = 15

export function DonationSection() {
  const [selectedDonation, setSelectedDonation] = useState<number>(DEFAULT_DONATION)
  const [customDonation, setCustomDonation] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const amount =
    (customDonation.trim() !== "" ? Number(customDonation) : selectedDonation) || DEFAULT_DONATION

  return (
    <Card className="border-primary/30 bg-accent/30 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartIcon className="size-4 text-primary fill-primary/20" />
          Donate to Philos
        </CardTitle>
        <CardDescription>
          Directly funds emergency vet clinic bills, recovery food, and medical supplies in Colombo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {DONATION_PRESETS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setSelectedDonation(amt)
                setCustomDonation("")
              }}
              className={cn(
                "flex-1 rounded-xl border py-2 text-xs font-bold transition-all",
                selectableChipClass(selectedDonation === amt && customDonation === "")
              )}
            >
              ${amt}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="custom-donation" className="text-xs text-muted-foreground shrink-0">
            Custom ($)
          </Label>
          <Input
            id="custom-donation"
            type="number"
            min="1"
            placeholder="Other amount"
            value={customDonation}
            onChange={(e) => setCustomDonation(e.target.value)}
            className="h-8 text-xs bg-card"
          />
        </div>
        <Button className="w-full font-bold shadow-md" onClick={() => setDialogOpen(true)}>
          Donate ${amount}
        </Button>
      </CardContent>
      <DonationThanksDialog open={dialogOpen} amount={amount} onOpenChange={setDialogOpen} />
    </Card>
  )
}
