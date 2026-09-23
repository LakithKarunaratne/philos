import { Badge } from "@/components/ui/badge"
import { STATUS_META } from "@/lib/constants"
import type { CaseStatus } from "@/lib/mock-data"
import { cn } from "cn"

interface StatusBadgeProps {
  status: CaseStatus
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const meta = STATUS_META[status]

  return (
    <Badge
      variant="secondary"
      className={cn("capitalize font-semibold text-[11px]", meta.badgeClass, className)}
    >
      {label || meta.label}
    </Badge>
  )
}
