"use client"

import { ClockIcon } from "lucide-react"
import {
  ETA_OPTIONS,
  HELP_TYPES,
  type EtaOption,
  type HelpTypeId,
} from "@/components/cases/respond-options"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { selectableChipClass } from "@/lib/styles"
import { cn } from "cn"

interface HelpTypePickerProps {
  value: HelpTypeId
  onChange: (value: HelpTypeId) => void
}

export function HelpTypePicker({ value, onChange }: HelpTypePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-bold">How can you help?</Label>
      <div className="flex flex-col gap-2">
        {HELP_TYPES.map((type) => {
          const isSelected = value === type.id
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                  : "border-border bg-card hover:bg-muted/40"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[10px]",
                  selectableChipClass(isSelected),
                  isSelected ? "font-bold" : "border-muted-foreground/40"
                )}
              >
                {isSelected ? "✓" : ""}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface EtaPickerProps {
  value: EtaOption
  onChange: (value: EtaOption) => void
}

export function EtaPicker({ value, onChange }: EtaPickerProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <ClockIcon className="size-4 text-primary" />
          Estimated time of arrival (ETA)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {ETA_OPTIONS.map((eta) => (
            <button
              key={eta}
              type="button"
              onClick={() => onChange(eta)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                selectableChipClass(value === eta)
              )}
            >
              {eta}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
