"use client"

import { useMemo, useOptimistic, useState, useTransition } from "react"
import { BellIcon, CheckCheckIcon } from "lucide-react"
import { markAlertRead, markAllAlertsRead } from "@/app/(app)/alerts/actions"
import { AlertGroup } from "@/components/alerts/alert-group"
import { ALERT_CATEGORIES, ALERT_CATEGORY_META } from "@/components/alerts/alert-category"
import { Button } from "@/components/ui/button"
import { FILTER_ALL } from "@/lib/constants"
import type { AlertCategory, AlertItem } from "@/lib/view-types"
import { selectableChipClass } from "@/lib/styles"
import { cn } from "cn"

type CategoryFilter = AlertCategory | typeof FILTER_ALL

type ReadUpdate = { type: "one"; id: string } | { type: "all" }

const CATEGORY_FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: FILTER_ALL, label: "All" },
  ...ALERT_CATEGORIES.map((id) => ({ id, label: ALERT_CATEGORY_META[id].label })),
]

function applyReadUpdate(alerts: AlertItem[], update: ReadUpdate): AlertItem[] {
  return alerts.map((a) =>
    update.type === "all" || a.id === update.id ? { ...a, read: true } : a
  )
}

export function AlertsFeed({ alerts }: { alerts: AlertItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(FILTER_ALL)
  // Reverts to the server's truth once the action settles and the page revalidates.
  const [optimisticAlerts, addReadUpdate] = useOptimistic(alerts, applyReadUpdate)
  const [, startTransition] = useTransition()

  const unreadCount = useMemo(() => optimisticAlerts.filter((a) => !a.read).length, [optimisticAlerts])

  const filteredAlerts = useMemo(() => {
    if (selectedCategory === FILTER_ALL) return optimisticAlerts
    return optimisticAlerts.filter((a) => a.category === selectedCategory)
  }, [optimisticAlerts, selectedCategory])

  // The query is newest-first, so first-seen order keeps the headings chronological.
  const days = useMemo(() => [...new Set(filteredAlerts.map((a) => a.day))], [filteredAlerts])

  function markAllAsRead() {
    startTransition(async () => {
      addReadUpdate({ type: "all" })
      await markAllAlertsRead()
    })
  }

  // Not awaited by the caller: the row's <Link> navigates while the write runs.
  function handleAlertClick(id: string) {
    startTransition(async () => {
      addReadUpdate({ type: "one", id })
      await markAlertRead(id)
    })
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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedCategory(f.id)}
              className={cn(
                "rounded-full border px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition-all",
                selectableChipClass(selectedCategory === f.id)
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredAlerts.length === 0 && <AlertsEmptyState />}

        {days.map((day) => (
          <AlertGroup
            key={day}
            title={day}
            alerts={filteredAlerts.filter((a) => a.day === day)}
            onOpenAlert={handleAlertClick}
          />
        ))}
      </main>
    </>
  )
}

function AlertsEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
      <span className="grid size-12 place-items-center rounded-full bg-muted">
        <BellIcon className="size-6 opacity-40" />
      </span>
      <p className="text-sm font-semibold">No alerts found</p>
      <p className="text-xs">You&apos;re completely caught up with community updates.</p>
    </div>
  )
}
