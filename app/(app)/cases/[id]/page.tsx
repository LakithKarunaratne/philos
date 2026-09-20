"use client"

import { use, useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CircleDotIcon,
  CircleIcon,
  HeartIcon,
  MapPinIcon,
  Share2Icon,
  ShieldAlertIcon,
  UserCheckIcon,
} from "lucide-react"
import { StatusBadge } from "@/components/cases/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NEARBY_CASES } from "@/lib/mock-data"
import { cn } from "cn"

interface CasePageProps {
  params: Promise<{ id: string }>
}

export default function CaseProfilePage({ params }: CasePageProps) {
  const { id } = use(params)
  const dog = NEARBY_CASES.find((c) => c.id === id)

  const [fosterDialogOpen, setFosterDialogOpen] = useState(false)
  const [fosterSubmitted, setFosterSubmitted] = useState(false)
  const [fosterName, setFosterName] = useState("")
  const [fosterPhone, setFosterPhone] = useState("")
  const [fosterNote, setFosterNote] = useState("")

  if (!dog) {
    notFound()
  }

  function handleFosterSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFosterSubmitted(true)
  }

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
        <span className="text-base font-bold">{dog.name}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: `Rescue case: ${dog.name}`, url: window.location.href })
            }
          }}
          aria-label="Share case"
        >
          <Share2Icon className="size-4" />
        </Button>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 py-5 pb-24">
        {/* Hero Photo / Avatar Placeholder */}
        <div className="relative flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-secondary/80 text-secondary-foreground border border-border shadow-inner">
          <div className="flex flex-col items-center gap-2">
            <span className="grid size-20 place-items-center rounded-full bg-accent text-3xl font-bold text-accent-foreground shadow-md">
              {dog.name[0]}
            </span>
            <p className="text-sm font-semibold text-muted-foreground">{dog.breed}</p>
          </div>
          <div className="absolute top-3 left-3">
            <StatusBadge status={dog.status} label={dog.statusLabel} className="shadow-sm" />
          </div>
          {dog.urgent && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-destructive/90 px-2.5 py-0.5 text-[11px] font-bold text-destructive-foreground shadow-sm">
              <ShieldAlertIcon className="size-3" /> Urgent
            </div>
          )}
        </div>

        {/* Name & Quick Info */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-bold tracking-tight">{dog.name}</h1>
            <span className="text-sm font-medium text-muted-foreground">{dog.distance}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPinIcon className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{dog.locationName}</span>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="flex flex-col rounded-xl border border-border bg-card p-2.5 text-center">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Age</span>
              <span className="text-sm font-bold mt-0.5">{dog.age || "~2 yrs"}</span>
            </div>
            <div className="flex flex-col rounded-xl border border-border bg-card p-2.5 text-center">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Gender</span>
              <span className="text-sm font-bold mt-0.5">{dog.gender || "Male"}</span>
            </div>
            <div className="flex flex-col rounded-xl border border-border bg-card p-2.5 text-center">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Status</span>
              <span className="text-sm font-bold mt-0.5 capitalize">{dog.status}</span>
            </div>
          </div>
        </div>

        {/* Story / Notes */}
        {dog.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">About {dog.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{dog.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Timeline Tracker */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rescue & Care Tracker</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {dog.timelineSteps.map((step, index) => {
              const isLast = index === dog.timelineSteps.length - 1
              return (
                <div key={step.label} className="relative flex items-start gap-3">
                  {!isLast && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-5 left-2.5 -bottom-3 w-0.5",
                        step.status === "completed" ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                  <span className="relative z-10 grid size-5 shrink-0 place-items-center rounded-full bg-background mt-0.5">
                    {step.status === "completed" ? (
                      <CheckCircle2Icon className="size-5 text-primary" />
                    ) : step.status === "current" ? (
                      <CircleDotIcon className="size-5 text-primary animate-pulse" />
                    ) : (
                      <CircleIcon className="size-5 text-muted-foreground/40" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        step.status === "current" && "text-primary",
                        step.status === "pending" && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.date}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Temperament */}
        {dog.temperament && dog.temperament.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Temperament & Traits</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {dog.temperament.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-accent/70 px-3 py-1 text-xs font-semibold text-accent-foreground"
                >
                  {trait}
                </span>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Health Notes */}
        {dog.healthNotes && dog.healthNotes.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Medical & Health Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {dog.healthNotes.map((note) => (
                <div key={note} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{note}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Floating Bottom Action Bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto w-full max-w-lg border-t border-border bg-card/95 p-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => {
              setFosterSubmitted(false)
              setFosterDialogOpen(true)
            }}
          >
            <HeartIcon className="size-4 text-primary" />
            Foster / Adopt
          </Button>
          <Link
            href={`/cases/${dog.id}/respond`}
            className={cn(buttonVariants(), "flex-1")}
          >
            Respond / Help
          </Link>
        </div>
      </div>

      {/* Foster / Adopt Interest Modal Dialog */}
      <Dialog open={fosterDialogOpen} onOpenChange={setFosterDialogOpen}>
        <DialogContent>
          {fosterSubmitted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-primary/20 text-primary">
                <UserCheckIcon className="size-6" />
              </span>
              <DialogTitle>Interest Registered!</DialogTitle>
              <DialogDescription className="max-w-xs">
                Thank you! Our volunteer coordinator in Colombo will reach out to you within 24 hours to coordinate care for {dog.name}.
              </DialogDescription>
              <Button className="mt-2 w-full" onClick={() => setFosterDialogOpen(false)}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleFosterSubmit} className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>Express Foster or Adoption Interest</DialogTitle>
                <DialogDescription>
                  Help give {dog.name} a loving environment while recovering or seeking a permanent home.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="foster-name">Your Full Name</Label>
                  <Input
                    id="foster-name"
                    required
                    value={fosterName}
                    onChange={(e) => setFosterName(e.target.value)}
                    placeholder="e.g. Priyantha Silva"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="foster-phone">Phone / WhatsApp</Label>
                  <Input
                    id="foster-phone"
                    type="tel"
                    required
                    value={fosterPhone}
                    onChange={(e) => setFosterPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="foster-notes">Home situation or questions</Label>
                  <Textarea
                    id="foster-notes"
                    value={fosterNote}
                    onChange={(e) => setFosterNote(e.target.value)}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
