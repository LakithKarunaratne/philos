"use client"

import { Button } from "@/components/ui/button"
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FosterFormValues } from "@/hooks/use-foster-form"

interface FosterInterestFormProps {
  caseName: string
  values: FosterFormValues
  onFieldChange: (field: keyof FosterFormValues, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function FosterInterestForm({ caseName, values, onFieldChange, onSubmit }: FosterInterestFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Express Foster or Adoption Interest</DialogTitle>
        <DialogDescription>
          Help give {caseName} a loving environment while recovering or seeking a permanent home.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="foster-name">Your Full Name</Label>
          <Input
            id="foster-name"
            required
            value={values.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            placeholder="e.g. Priyantha Silva"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="foster-phone">Phone / WhatsApp</Label>
          <Input
            id="foster-phone"
            type="tel"
            required
            value={values.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            placeholder="+94 77 123 4567"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="foster-notes">Home situation or questions</Label>
          <Textarea
            id="foster-notes"
            value={values.note}
            onChange={(e) => onFieldChange("note", e.target.value)}
            placeholder="Do you have other pets, a garden, or specific availability?"
            className="min-h-16"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" className="w-full">
          Submit Interest
        </Button>
      </DialogFooter>
    </form>
  )
}
