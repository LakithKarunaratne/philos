"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { FilterIcon, SearchIcon, XIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  MAP_CASE_DETAILS,
  NEARBY_CASES,
  STATUS_FILTERS,
  type CaseStatus,
} from "@/lib/mock-data"
import { cn } from "cn"

export function RescueMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeStatuses, setActiveStatuses] = useState<Set<CaseStatus | "all">>(
    () => new Set(["all"])
  )

  const visibleCases = useMemo(() => {
    if (activeStatuses.has("all") || activeStatuses.size === 0) return NEARBY_CASES
    return NEARBY_CASES.filter((c) => activeStatuses.has(c.status))
  }, [activeStatuses])

  const selected = visibleCases.find((c) => c.id === selectedId) ?? null
  const selectedMeta = selected ? MAP_CASE_DETAILS[selected.id] : null

  function toggleStatus(id: CaseStatus | "all") {
    setActiveStatuses((prev) => {
      const next = new Set(prev)
      if (id === "all") return new Set(["all"])
      next.delete("all")
      if (next.has(id)) next.delete(id)
      else next.add(id)
      if (next.size === 0) return new Set(["all"])
      return next
    })
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-background via-background/90 to-transparent px-4 pt-3 pb-8">
        <h1 className="flex-1 text-lg font-bold tracking-tight">Rescue map</h1>
        <Button variant="outline" size="icon" aria-label="Search a location" className="rounded-full bg-card">
          <SearchIcon />
        </Button>
      </header>

      <div
        className="absolute inset-0 bg-secondary"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--border) 70%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--border) 70%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        role="img"
        aria-label="Rescue map"
      >
        {visibleCases.map((pin) => (
          <button
            key={pin.id}
            type="button"
            aria-label={`${pin.name}, ${pin.statusLabel}`}
            aria-pressed={selectedId === pin.id}
            onClick={() => setSelectedId(pin.id)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-full transition-transform",
              selectedId === pin.id && "scale-110 drop-shadow-md"
            )}
            style={{ top: pin.top, left: pin.left }}
          >
            <svg viewBox="0 0 24 30" className="h-9 w-7" fill="none" aria-hidden>
              <path
                d="M12 0C5.4 0 0 5.4 0 12c0 8 12 18 12 18s12-10 12-18c0-6.6-5.4-12-12-12Z"
                fill={pin.pinColor}
              />
              <circle cx="12" cy="12" r="4.5" fill="#fff" />
            </svg>
          </button>
        ))}

        <div
          className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary shadow"
          style={{ top: "48%", left: "44%" }}
          aria-label="Your location"
        />

        <div className="absolute bottom-28 left-3 flex flex-col gap-1 rounded-xl bg-card/95 px-3 py-2 text-[11px] font-semibold text-muted-foreground shadow-sm ring-1 ring-foreground/10">
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-full bg-[#e5484d]" /> Reported
          </span>
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-full bg-[#9a5cf0]" /> Vet care
          </span>
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-full bg-[#2e9d57]" /> Foster
          </span>
          <span className="flex items-center gap-1.5">
            <i className="size-2 rounded-full bg-[#796f91]" /> Adopted
          </span>
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetTrigger
          render={
            <Button
              size="icon-lg"
              className="absolute top-16 right-4 z-20 size-12 rounded-full shadow-lg"
              aria-label="Filter cases"
            />
          }
        >
          <FilterIcon className="size-5" />
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Filter by status</SheetTitle>
            <SheetDescription>Show pins that match one or more statuses.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-6">
            {STATUS_FILTERS.map((filter) => {
              const checked = activeStatuses.has(filter.id)
              return (
                <label
                  key={filter.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleStatus(filter.id)}
                  />
                  <span className="text-sm font-medium">{filter.label}</span>
                </label>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      {selected && selectedMeta ? (
        <Card className="absolute inset-x-3 bottom-3 z-30 gap-0 shadow-xl">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <span className="text-2xl font-bold">{selected.name[0]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-base">{selected.name}</strong>
                    <Badge variant={selected.urgent ? "destructive" : "secondary"}>
                      {selected.statusLabel}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close"
                    onClick={() => setSelectedId(null)}
                  >
                    <XIcon />
                  </Button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{selectedMeta.blurb}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-3 border-0 bg-transparent">
            {selectedMeta.actions.includes("profile") ? (
              <Link
                href="#"
                className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
              >
                View profile
              </Link>
            ) : null}
            {selectedMeta.actions.includes("respond") ? (
              <Link href="#" className={cn(buttonVariants(), "flex-1")}>
                Respond
              </Link>
            ) : null}
          </CardFooter>
        </Card>
      ) : null}
    </div>
  )
}
