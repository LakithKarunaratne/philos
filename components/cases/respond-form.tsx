"use client"

import { useState } from "react"
import { TruckIcon } from "lucide-react"
import {
  DEFAULT_ETA,
  DEFAULT_HELP_TYPE,
  type EtaOption,
  type HelpTypeId,
} from "@/components/cases/respond-options"
import { EtaPicker, HelpTypePicker } from "@/components/cases/respond-pickers"
import { RespondSuccessDialog } from "@/components/cases/respond-success-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface RespondFormProps {
  caseId: string
  caseName: string
  /** Short place name (first part of the case location) shown to the volunteer. */
  placeName: string
}

export function RespondForm({ caseId, caseName, placeName }: RespondFormProps) {
  const [selectedHelp, setSelectedHelp] = useState<HelpTypeId>(DEFAULT_HELP_TYPE)
  const [selectedEta, setSelectedEta] = useState<EtaOption>(DEFAULT_ETA)
  const [phone, setPhone] = useState("")
  const [note, setNote] = useState("")
  const [successOpen, setSuccessOpen] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccessOpen(true)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <HelpTypePicker value={selectedHelp} onChange={setSelectedHelp} />
        <EtaPicker value={selectedEta} onChange={setSelectedEta} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="respond-phone" className="text-sm font-bold">
            Your Phone / WhatsApp
          </Label>
          <Input
            id="respond-phone"
            type="tel"
            required
            placeholder="+94 77 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            Shared with local rescuer on ground at {placeName}.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="respond-notes" className="text-sm font-bold">
            Notes / Vehicle details (optional)
          </Label>
          <Textarea
            id="respond-notes"
            placeholder="e.g. Driving a silver Suzuki, arriving via Galle Road with dog crate and towels."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-20"
          />
        </div>

        <Button type="submit" size="lg" className="w-full gap-2 text-base font-bold">
          <TruckIcon className="size-5" />
          Confirm Response
        </Button>
      </form>

      <RespondSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        caseId={caseId}
        caseName={caseName}
        eta={selectedEta}
      />
    </>
  )
}
