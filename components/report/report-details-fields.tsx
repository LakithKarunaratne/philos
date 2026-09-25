"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ReportDetailsFieldsProps = {
  dogName: string
  onDogNameChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
}

export function ReportDetailsFields({
  dogName,
  onDogNameChange,
  notes,
  onNotesChange,
}: ReportDetailsFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dog-name" className="text-sm font-bold">
          Temporary Name or Nickname (optional)
        </Label>
        <Input
          id="dog-name"
          placeholder="e.g. Brownie, Street pup, Spot"
          value={dogName}
          onChange={(e) => onDogNameChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="report-notes" className="text-sm font-bold">
          Description & Emergency Notes
        </Label>
        <Textarea
          id="report-notes"
          required
          placeholder="Describe the dog's size, coat color, demeanor, immediate injuries, or if anyone is currently watching over them..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-24"
        />
      </div>
    </>
  )
}
