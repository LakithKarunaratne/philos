import { MapPinIcon, ShieldAlertIcon } from "lucide-react"
import type { RescueCase } from "@/lib/mock-data"

interface RespondCaseBannerProps {
  dog: Pick<RescueCase, "name" | "blurb" | "locationName">
}

export function RespondCaseBanner({ dog }: RespondCaseBannerProps) {
  return (
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
  )
}
