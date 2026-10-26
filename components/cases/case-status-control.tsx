"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { ShieldCheckIcon } from "lucide-react"
import { updateCaseStatus } from "@/app/(app)/cases/[id]/actions"
import {
  CASE_STATUS_IDLE,
  STATUS_NOTE_MAX_LENGTH,
  type CaseStatusState,
} from "@/app/(app)/cases/[id]/status-options"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { STATUS_META } from "@/lib/constants"
import { CASE_STAGES, toViewStatus } from "@/lib/mappers/cases"
import { selectableChipClass } from "@/lib/styles"
import type { CaseStatus } from "@/lib/view-types"
import type { CaseStatus as DbCaseStatus } from "@/generated/prisma/enums"
import { cn } from "cn"

interface CaseStatusControlProps {
  caseSlug: string
  caseName: string
  /** The stage the case is in now, in the view vocabulary the screens use. */
  currentStatus: CaseStatus
}

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={disabled || pending}>
      {pending ? "Updating..." : "Update stage"}
    </Button>
  )
}

/**
 * Dispatcher/admin control for moving a case between rescue stages.
 *
 * The page only renders this for users who hold one of those roles — a
 * convenience, not the boundary. `updateCaseStatus` re-checks the role itself.
 */
export function CaseStatusControl({
  caseSlug,
  caseName,
  currentStatus,
}: CaseStatusControlProps) {
  const [selected, setSelected] = useState<DbCaseStatus | null>(null)
  const [state, formAction] = useActionState<CaseStatusState, FormData>(
    updateCaseStatus.bind(null, caseSlug),
    CASE_STATUS_IDLE
  )

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <ShieldCheckIcon className="size-4 text-primary" />
          Dispatcher controls
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="pb-2 text-sm font-bold">
              Move {caseName} to a new stage
            </legend>

            <div className="flex flex-wrap gap-2">
              {CASE_STAGES.map((stage) => {
                const isCurrent = toViewStatus(stage) === currentStatus
                return (
                  <label
                    key={stage}
                    className={cn(
                      "cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                      selectableChipClass(selected === stage),
                      isCurrent && "cursor-not-allowed opacity-40"
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={stage}
                      disabled={isCurrent}
                      checked={selected === stage}
                      onChange={() => setSelected(stage)}
                      className="sr-only"
                    />
                    {STATUS_META[toViewStatus(stage)].label}
                    {isCurrent ? " (current)" : ""}
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status-note" className="text-sm font-bold">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="status-note"
              name="note"
              placeholder="Collected by volunteer transport"
              maxLength={STATUS_NOTE_MAX_LENGTH}
            />
          </div>

          {state.status === "error" && state.message ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {state.message}
            </p>
          ) : null}

          {state.status === "success" ? (
            <p role="status" className="text-xs font-medium text-primary">
              Stage updated.
            </p>
          ) : null}

          <SaveButton disabled={selected === null} />
        </form>
      </CardContent>
    </Card>
  )
}
