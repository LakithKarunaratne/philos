"use client"

import { useEffect, useRef, useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConditionChips } from "@/components/report/condition-chips"
import { LocationField } from "@/components/report/location-field"
import { PhotoPicker, type ReportPhoto } from "@/components/report/photo-picker"
import { ReportDetailsFields } from "@/components/report/report-details-fields"
import { ReportSuccessDialog } from "@/components/report/report-success-dialog"

/** Fake network latency for the mock submit. */
const MOCK_SUBMIT_DELAY_MS = 400

export default function ReportPage() {
  const [photos, setPhotos] = useState<ReportPhoto[]>([])
  const [locationText, setLocationText] = useState("")
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [dogName, setDogName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (submitTimer.current) clearTimeout(submitTimer.current)
    }
  }, [])

  function toggleCondition(condition: string) {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    )
  }

  const isValid =
    locationText.trim().length > 0 &&
    selectedConditions.length > 0 &&
    notes.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setIsSubmitting(true)
    submitTimer.current = setTimeout(() => {
      setIsSubmitting(false)
      setSuccessOpen(true)
    }, MOCK_SUBMIT_DELAY_MS)
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight">Report a dog</h1>
        <p className="text-xs text-muted-foreground">
          Alert volunteers and rescuers across Colombo in real time.
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 py-5 pb-24">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <PhotoPicker photos={photos} onChange={setPhotos} />
          <LocationField value={locationText} onChange={setLocationText} />
          <ConditionChips
            selected={selectedConditions}
            onToggle={toggleCondition}
          />
          <ReportDetailsFields
            dogName={dogName}
            onDogNameChange={setDogName}
            notes={notes}
            onNotesChange={setNotes}
          />
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            size="lg"
            className="w-full gap-2 text-base font-bold shadow-lg"
          >
            <PlusIcon className="size-5" />
            {isSubmitting ? "Submitting Report..." : "Submit Rescue Report"}
          </Button>
        </form>
      </main>

      <ReportSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        dogName={dogName}
        locationText={locationText}
      />
    </>
  )
}
