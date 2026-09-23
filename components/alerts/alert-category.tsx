import { HeartHandshakeIcon, PawPrintIcon, ShieldAlertIcon, type LucideIcon } from "lucide-react"
import type { AlertCategory } from "@/lib/mock-data"

/** Label (filter chip) and icon styling for each alert category. */
export const ALERT_CATEGORY_META: Record<
  AlertCategory,
  { label: string; icon: LucideIcon; iconClass: string }
> = {
  urgent: { label: "Urgent", icon: ShieldAlertIcon, iconClass: "text-destructive" },
  update: { label: "Updates", icon: PawPrintIcon, iconClass: "text-primary" },
  foster: { label: "Foster", icon: HeartHandshakeIcon, iconClass: "text-status-foster" },
}

export const ALERT_CATEGORIES = Object.keys(ALERT_CATEGORY_META) as AlertCategory[]
