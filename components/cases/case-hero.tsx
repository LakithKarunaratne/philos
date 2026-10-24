import { MapPinIcon, ShieldAlertIcon } from "lucide-react"
import { StatusBadge } from "@/components/cases/status-badge"
import type { RescueCase } from "@/lib/mock-data"

/** Placeholder values shown until every mock case has age / gender filled in. */
const FALLBACK_AGE = "~2 yrs"
const FALLBACK_GENDER = "Male"

interface CaseHeroProps {
  dog: RescueCase
}

export function CaseHero({ dog }: CaseHeroProps) {
  return (
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
  )
}

function QuickFact({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-2.5 text-center">
      <span className="text-[10px] uppercase font-semibold text-muted-foreground">{label}</span>
      <span className={className ?? "text-sm font-bold mt-0.5"}>{value}</span>
    </div>
  )
}

export function CaseQuickInfo({ dog }: CaseHeroProps) {
  return (
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
        <QuickFact label="Age" value={dog.age || FALLBACK_AGE} />
        <QuickFact label="Gender" value={dog.gender || FALLBACK_GENDER} />
        <QuickFact label="Status" value={dog.status} className="text-sm font-bold mt-0.5 capitalize" />
      </div>
    </div>
  )
}
