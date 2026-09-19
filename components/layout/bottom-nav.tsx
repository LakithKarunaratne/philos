"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BellIcon,
  HomeIcon,
  MapPinIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react"
import { cn } from "cn"

const tabs = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/map", label: "Map", icon: MapPinIcon },
  { href: "/report", label: "Report", icon: PlusIcon, report: true },
  { href: "/alerts", label: "Alerts", icon: BellIcon, badge: true },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto flex h-16 w-full max-w-lg items-stretch">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href)
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {"badge" in tab && tab.badge ? (
                <span
                  aria-hidden
                  className="absolute top-1.5 right-[calc(50%-14px)] size-2 rounded-full border-2 border-card bg-destructive"
                />
              ) : null}
              {"report" in tab && tab.report ? (
                <span
                  className={cn(
                    "mb-0.5 grid size-10 place-items-center rounded-full text-primary-foreground transition-colors",
                    active ? "bg-primary" : "bg-foreground"
                  )}
                >
                  <Icon className="size-[18px]" strokeWidth={2.4} />
                </span>
              ) : (
                <Icon className="size-[22px]" strokeWidth={2} />
              )}
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
