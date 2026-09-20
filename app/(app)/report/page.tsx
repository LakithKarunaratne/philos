"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  CameraIcon,
  CheckCircle2Icon,
  CrosshairIcon,
  ImagePlusIcon,
  MapPinIcon,
  PlusIcon,
  Trash2Icon,
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

const SAMPLE_COLOMBO_LOCATIONS = [
  "Galle Road, Bambalapitiya, Colombo 04",
  "Duplication Road, Kollupitiya, Colombo 03",
  "Bauddhaloka Mawatha, Colombo 07",
  "Vauxhall Street, Slave Island, Colombo 02",
]

export default function ReportPage() {
  const router = useRouter()

  const [photos, setPhotos] = useState<string[]>([])
  const [locationText, setLocationText] = useState("")
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [dogName, setDogName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  // Toggle condition chip
  function toggleCondition(condition: string) {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    )
  }

  // Use my location mock
  function handleUseMyLocation() {
    const randomLoc =
      SAMPLE_COLOMBO_LOCATIONS[
        Math.floor(Math.random() * SAMPLE_COLOMBO_LOCATIONS.length)
      ]
    setLocationText(randomLoc)
  }

  // Mock add photo
  function handleAddPhoto() {
    if (photos.length >= 4) return
    const mockThumbnails = [
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
      "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400&q=80",
    ]
    const nextPhoto = mockThumbnails[photos.length % mockThumbnails.length]
    setPhotos((prev) => [...prev, nextPhoto])
  }

  function handleRemovePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const isValid =
    locationText.trim().length > 0 &&
    selectedConditions.length > 0 &&
    notes.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccessOpen(true)
    }, 400)
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
          {/* Photo Upload Zone */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-bold">
                <span className="flex items-center gap-2">
                  <CameraIcon className="size-4 text-primary" />
                  Photos
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {photos.length}/4 added
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((src, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    <Image
                      src={src}
                      alt={`Dog preview ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/60 text-white transition-opacity hover:bg-destructive"
                    >
                      <Trash2Icon className="size-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <ImagePlusIcon className="size-5" />
                    <span className="text-[10px] font-semibold">Add</span>
                  </button>
                )}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Clear photos help volunteers identify the dog and assess immediate medical needs.
              </p>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-bold">
                <span className="flex items-center gap-2">
                  <MapPinIcon className="size-4 text-primary" />
                  Location in Colombo
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleUseMyLocation}
                  className="gap-1 text-primary hover:text-primary/80"
                >
                  <CrosshairIcon className="size-3.5" />
                  Use my location
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Input
                required
                placeholder="e.g. Galle Road near Majestic City, Bambalapitiya"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Be as specific as possible (street name, nearby landmark or building).
              </p>
            </CardContent>
          </Card>

          {/* Condition / Severity Chips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">
                Dog condition & severity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CONDITION_OPTIONS.map((cond) => {
                  const active = selectedConditions.includes(cond)
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {cond}
                    </button>
                  )
                })}
              </div>
              {selectedConditions.length === 0 && (
                <p className="mt-2 text-[11px] text-destructive">
                  * Select at least one condition tag.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Dog Name / Identifier (Optional) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dog-name" className="text-sm font-bold">
              Temporary Name or Nickname (optional)
            </Label>
            <Input
              id="dog-name"
              placeholder="e.g. Brownie, Street pup, Spot"
              value={dogName}
              onChange={(e) => setDogName(e.target.value)}
            />
          </div>

          {/* Additional Notes & Observations */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-notes" className="text-sm font-bold">
              Description & Emergency Notes
            </Label>
            <Textarea
              id="report-notes"
              required
              placeholder="Describe the dog's size, coat color, demeanor, immediate injuries, or if anyone is currently watching over them..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Submit Action */}
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

      {/* Success Modal Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent showCloseButton={false}>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-primary/20 text-primary">
              <CheckCircle2Icon className="size-8" />
            </span>
            <DialogTitle className="text-xl">Report Broadcasted!</DialogTitle>
            <DialogDescription className="max-w-xs text-sm">
              Volunteers and rescue partners in Colombo have been notified about{" "}
              <strong>{dogName.trim() || "this dog"}</strong> at {locationText}.
            </DialogDescription>
            <div className="mt-3 flex w-full flex-col gap-2">
              <Button
                onClick={() => {
                  setSuccessOpen(false)
                  router.push("/cases/bruno")
                }}
                className="w-full"
              >
                View Case Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccessOpen(false)
                  router.push("/map")
                }}
                className="w-full"
              >
                Open Rescue Map
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
