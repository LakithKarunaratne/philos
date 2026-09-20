"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  BellIcon,
  CheckCheckIcon,
  ChevronRightIcon,
  ClockIcon,
  HeartHandshakeIcon,
  PawPrintIcon,
  ShieldAlertIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  INITIAL_ALERTS,
  type AlertCategory,
  type AlertItem,
} from "@/lib/mock-data"
import { cn } from "cn"

const CATEGORY_FILTERS: { id: AlertCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "urgent", label: "Urgent" },
  { id: "update", label: "Updates" },
  { id: "foster", label: "Foster" },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS)
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | "all">("all")

  const unreadCount = useMemo(
    () => alerts.filter((a) => !a.read).length,
    [alerts]
  )

  const filteredAlerts = useMemo(() => {
    if (selectedCategory === "all") return alerts
    return alerts.filter((a) => a.category === selectedCategory)
  }, [alerts, selectedCategory])

  const todayAlerts = useMemo(
    () => filteredAlerts.filter((a) => a.day === "Today"),
    [filteredAlerts]
  )

  const yesterdayAlerts = useMemo(
    () => filteredAlerts.filter((a) => a.day === "Yesterday"),
    [filteredAlerts]
  )

  function markAllAsRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }

  function handleAlertClick(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    )
  }

  function getCategoryIcon(category: AlertCategory) {
    switch (category) {
      case "urgent":
        return <ShieldAlertIcon className="size-4 text-destructive" />
      case "foster":
        return <HeartHandshakeIcon className="size-4 text-[#2e9d57]" />
      case "update":
      default:
        return <PawPrintIcon className="size-4 text-primary" />
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight">Alerts</h1>
          {unreadCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <CheckCheckIcon className="size-3.5" />
            Mark all as read
          </Button>
        )}
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-4 pb-20">
        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_FILTERS.map((f) => {
            const active = selectedCategory === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedCategory(f.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition-all",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <span className="grid size-12 place-items-center rounded-full bg-muted">
              <BellIcon className="size-6 opacity-40" />
            </span>
            <p className="text-sm font-semibold">No alerts found</p>
            <p className="text-xs">You&apos;re completely caught up with community updates.</p>
          </div>
        )}

        {/* Today Group */}
        {todayAlerts.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Today
            </h2>
            <Card className="gap-0 py-0 overflow-hidden">
              {todayAlerts.map((alert, idx) => (
                <Link
                  key={alert.id}
                  href={alert.link || `/cases/${alert.caseId || "bruno"}`}
                  onClick={() => handleAlertClick(alert.id)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 text-inherit no-underline transition-colors hover:bg-muted/50",
                    !alert.read && "bg-accent/25",
                    idx < todayAlerts.length - 1 && "border-b border-border"
                  )}
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-secondary">
                    {getCategoryIcon(alert.category)}
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
                      {!alert.read && (
                        <span className="size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {alert.description}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <ClockIcon className="size-3" />
                      <span>{alert.time}</span>
                    </div>
                  </div>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground self-center" />
                </Link>
              ))}
            </Card>
          </section>
        )}

        {/* Yesterday Group */}
        {yesterdayAlerts.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Yesterday
            </h2>
            <Card className="gap-0 py-0 overflow-hidden">
              {yesterdayAlerts.map((alert, idx) => (
                <Link
                  key={alert.id}
                  href={alert.link || `/cases/${alert.caseId || "bruno"}`}
                  onClick={() => handleAlertClick(alert.id)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 text-inherit no-underline transition-colors hover:bg-muted/50",
                    !alert.read && "bg-accent/25",
                    idx < yesterdayAlerts.length - 1 && "border-b border-border"
                  )}
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-secondary">
                    {getCategoryIcon(alert.category)}
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
                      {!alert.read && (
                        <span className="size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {alert.description}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <ClockIcon className="size-3" />
                      <span>{alert.time}</span>
                    </div>
                  </div>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground self-center" />
                </Link>
              ))}
            </Card>
          </section>
        )}
      </main>
    </>
  )
}
