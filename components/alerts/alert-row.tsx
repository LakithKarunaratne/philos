import Link from "next/link"
import { ChevronRightIcon, ClockIcon } from "lucide-react"
import { ALERT_CATEGORY_META } from "@/components/alerts/alert-category"
import { DEMO_CASE_ID } from "@/lib/constants"
import type { AlertItem } from "@/lib/mock-data"
import { cn } from "cn"

interface AlertRowProps {
  alert: AlertItem
  isLast: boolean
  onOpen: (id: string) => void
}

export function AlertRow({ alert, isLast, onOpen }: AlertRowProps) {
  const { icon: Icon, iconClass } = ALERT_CATEGORY_META[alert.category]

  return (
    <Link
      href={alert.link || `/cases/${alert.caseId || DEMO_CASE_ID}`}
      onClick={() => onOpen(alert.id)}
      className={cn(
        "flex items-start gap-3 p-3.5 text-inherit no-underline transition-colors hover:bg-muted/50",
        !alert.read && "bg-accent/25",
        !isLast && "border-b border-border"
      )}
    >
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-secondary">
        <Icon className={cn("size-4", iconClass)} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-sm",
              !alert.read ? "font-bold text-foreground" : "font-medium text-foreground/90"
            )}
          >
            {alert.title}
          </p>
          {!alert.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <ClockIcon className="size-3" />
          <span>{alert.time}</span>
        </div>
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground self-center" />
    </Link>
  )
}
