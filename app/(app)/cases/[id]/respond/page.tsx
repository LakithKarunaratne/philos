"use client"

import { use, useState } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  MapPinIcon,
  ShieldAlertIcon,
  TruckIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NEARBY_CASES } from "@/lib/mock-data"
import { cn } from "cn"

interface RespondPageProps {
  params: Promise<{ id: string }>
}

const HELP_TYPES = [
  { id: "transport", label: "Emergency Transport", desc: "Vehicle available to take dog to clinic" },
  { id: "first-aid", label: "First Aid On-Site", desc: "Bandages, antiseptic, comfort until help arrives" },
  { id: "foster-hold", label: "Temporary Holding", desc: "Safe yard or room for tonight" },
  { id: "supplies", label: "Food & Water", desc: "High-protein meal, clean hydration" },
]

const ETA_OPTIONS = ["15 mins", "30 mins", "45 mins", "1 hour", "2+ hours"]

export default function RespondEmergencyPage({ params }: RespondPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const dog = NEARBY_CASES.find((c) => c.id === id)

  const [selectedHelp, setSelectedHelp] = useState("transport")
  const [selectedEta, setSelectedEta] = useState("30 mins")
  const [phone, setPhone] = useState("")
  const [note, setNote] = useState("")
  const [successOpen, setSuccessOpen] = useState(false)

  if (!dog) {
    notFound()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccessOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <Link
          href={`/cases/${dog.id}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
        <span className="text-base font-bold truncate">Respond to {dog.name}</span>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 py-5 pb-24">
        {/* Case Alert Banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-foreground">
          <ShieldAlertIcon className="size-5 shrink-0 text-destructive mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{dog.name}</span>
              <span className="rounded-full bg-destructive px-2 py-0.2 text-[10px] font-bold text-destructive-foreground">
                Urgent
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{dog.blurb}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPinIcon className="size-3.5 text-primary" />
              <span className="font-medium text-foreground">{dog.locationName}</span>
            </div>
          </div>
        </div>

        {/* Respond Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Help Type */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-bold">How can you help?</Label>
            <div className="flex flex-col gap-2">
              {HELP_TYPES.map((type) => {
                const isSelected = selectedHelp === type.id
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedHelp(type.id)}
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
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground font-bold"
                          : "border-muted-foreground/40"
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

          {/* Estimated Arrival (ETA) */}
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
                    onClick={() => setSelectedEta(eta)}
                    className={cn(
                      "rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                      selectedEta === eta
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {eta}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Volunteer Phone / Contact */}
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
              Shared with local rescuer on ground at {dog.locationName.split(",")[0]}.
            </p>
          </div>

          {/* Additional Notes */}
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

          {/* Submit CTA */}
          <Button type="submit" size="lg" className="w-full gap-2 text-base font-bold">
            <TruckIcon className="size-5" />
            Confirm Response
          </Button>
        </form>
      </main>

      {/* Confirmation Success Modal Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent showCloseButton={false}>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-primary/20 text-primary">
              <CheckCircle2Icon className="size-8" />
            </span>
            <DialogTitle className="text-xl">Response Confirmed!</DialogTitle>
            <DialogDescription className="max-w-xs text-sm">
              Thank you for stepping up! The report team for <strong>{dog.name}</strong> has been notified that you are arriving in <strong>{selectedEta}</strong>.
            </DialogDescription>
            <div className="mt-2 flex w-full flex-col gap-2">
              <Button
                onClick={() => {
                  setSuccessOpen(false)
                  router.push(`/cases/${dog.id}`)
                }}
                className="w-full"
              >
                Back to Case Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccessOpen(false)
                  router.push("/map")
                }}
                className="w-full"
              >
                Open Map
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
