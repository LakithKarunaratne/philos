"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { selectableChipClass } from "@/lib/styles"
import { cn } from "cn"

const CONDITION_OPTIONS = [
  "Injured / Limping",
  "Sick / Lethargic",
  "Malnourished",
  "Abandoned Puppies",
  "Skin Infection / Mange",
  "Friendly / Docile",
  "Trapped / In Danger",
]

type ConditionChipsProps = {
  selected: string[]
  onToggle: (condition: string) => void
}

export function ConditionChips({ selected, onToggle }: ConditionChipsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold">
          Dog condition & severity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {CONDITION_OPTIONS.map((cond) => (
            <button
              key={cond}
              type="button"
              onClick={() => onToggle(cond)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                selectableChipClass(selected.includes(cond))
              )}
            >
              {cond}
            </button>
          ))}
        </div>
        {selected.length === 0 && (
          <p className="mt-2 text-[11px] text-destructive">
            * Select at least one condition tag.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
