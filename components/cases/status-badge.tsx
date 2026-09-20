import { Badge } from "@/components/ui/badge"
import type { CaseStatus } from "@/lib/mock-data"
import { cn } from "cn"

interface StatusBadgeProps {
  status: CaseStatus
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  let displayLabel = label
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
  let customStyle = ""

  switch (status) {
    case "reported":
      variant = "destructive"
      displayLabel = label || "Reported"
      break
    case "rescued":
      displayLabel = label || "Rescued"
      customStyle = "bg-primary/15 text-primary border-primary/20"
      break
    case "vet":
      displayLabel = label || "Vet care"
      customStyle = "bg-[#9a5cf0]/15 text-[#9a5cf0] border-[#9a5cf0]/20"
      break
    case "foster":
      displayLabel = label || "Foster"
      customStyle = "bg-[#2e9d57]/15 text-[#2e9d57] border-[#2e9d57]/20"
      break
    case "adopted":
      displayLabel = label || "Adopted"
      customStyle = "bg-[#796f91]/15 text-[#796f91] border-[#796f91]/20"
      break
  }

  return (
    <Badge
      variant={variant}
      className={cn("capitalize font-semibold text-[11px]", customStyle, className)}
    >
      {displayLabel}
    </Badge>
  )
}
