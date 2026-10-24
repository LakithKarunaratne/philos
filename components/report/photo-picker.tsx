"use client"

import { useRef } from "react"
import Image from "next/image"
import { CameraIcon, ImagePlusIcon, Trash2Icon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const MAX_REPORT_PHOTOS = 4

// Placeholder thumbnails: the prototype has no real upload (see docs/feat-PHI-1-design.md §3).
const MOCK_THUMBNAILS = [
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
  "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400&q=80",
]

export type ReportPhoto = { id: number; src: string }

type PhotoPickerProps = {
  photos: ReportPhoto[]
  onChange: (photos: ReportPhoto[]) => void
}

export function PhotoPicker({ photos, onChange }: PhotoPickerProps) {
  const nextId = useRef(0)

  function handleAddPhoto() {
    if (photos.length >= MAX_REPORT_PHOTOS) return
    const src = MOCK_THUMBNAILS[photos.length % MOCK_THUMBNAILS.length]
    onChange([...photos, { id: nextId.current++, src }])
  }

  function handleRemovePhoto(id: number) {
    onChange(photos.filter((photo) => photo.id !== id))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-bold">
          <span className="flex items-center gap-2">
            <CameraIcon className="size-4 text-primary" />
            Photos
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {photos.length}/{MAX_REPORT_PHOTOS} added
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, idx) => (
            <PhotoThumbnail
              key={photo.id}
              photo={photo}
              position={idx + 1}
              onRemove={() => handleRemovePhoto(photo.id)}
            />
          ))}
          {photos.length < MAX_REPORT_PHOTOS && (
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
  )
}

function PhotoThumbnail({
  photo,
  position,
  onRemove,
}: {
  photo: ReportPhoto
  position: number
  onRemove: () => void
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
      <Image
        src={photo.src}
        alt={`Dog preview ${position}`}
        fill
        unoptimized
        className="object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/60 text-white transition-opacity hover:bg-destructive"
      >
        <Trash2Icon className="size-3" />
      </button>
    </div>
  )
}
