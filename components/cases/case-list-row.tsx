import Link from "next/link"
import { ChevronRightIcon, PawPrintIcon } from "lucide-react"
import { StatusBadge } from "@/components/cases/status-badge"
import type { RescueCase } from "@/lib/mock-data"
import { cn } from "cn"

interface CaseListRowProps {
  dog: RescueCase
  isLast?: boolean
  className?: string
}

export function CaseListRow({ dog, isLast = false, className }: CaseListRowProps) {
  return (
    <Link
      href={`/cases/${dog.id}`}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 text-inherit no-underline transition-colors hover:bg-muted/50",
        !isLast && "border-b border-border",
        className
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground font-bold">
        {dog.name ? dog.name[0] : <PawPrintIcon className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{dog.name}</span>
          <StatusBadge status={dog.status} label={dog.statusLabel} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{dog.detail}</p>
      </div>
      <ChevronRightIcon className="size-4.5 shrink-0 text-muted-foreground" />
    </Link>
  )
}
