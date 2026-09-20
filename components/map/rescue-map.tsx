"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { FilterIcon, SearchIcon, XIcon, RotateCcwIcon } from "lucide-react"
import { StatusBadge } from "@/components/cases/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  NEARBY_CASES,
  STATUS_FILTERS,
  type CaseStatus,
} from "@/lib/mock-data"
import { cn } from "cn"

const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs font-medium">Loading Colombo map...</p>
      </div>
    </div>
  ),
})

const STORAGE_KEY = "philos_map_filters"

export function RescueMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [activeStatuses, setActiveStatuses] = useState<Set<CaseStatus | "all">>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as (CaseStatus | "all")[]
          return new Set(parsed)
        }
      } catch {
        // Fall back to default
      }
    }
    return new Set(["all"])
  })

  // Save filters to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(activeStatuses)))
    } catch {
      // Ignore sessionStorage errors
    }
  }, [activeStatuses])

  const visibleCases = useMemo(() => {
    let result = NEARBY_CASES

    // Filter by status
    if (!activeStatuses.has("all") && activeStatuses.size > 0) {
      result = result.filter((c) => activeStatuses.has(c.status))
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.locationName.toLowerCase().includes(q) ||
          c.detail.toLowerCase().includes(q)
      )
    }

    return result
  }, [activeStatuses, searchQuery])

  const selected = visibleCases.find((c) => c.id === selectedId) ?? null

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

  function resetFilters() {
    setActiveStatuses(new Set(["all"]))
    setSearchQuery("")
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Header bar with blur and expandable search */}
      <header className="absolute inset-x-0 top-0 z-20 flex flex-col gap-2 bg-gradient-to-b from-background/95 via-background/80 to-transparent px-4 pt-3 pb-6 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          {searchOpen ? (
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-3 py-1 shadow-md">
              <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
              <Input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dog or Colombo location..."
                className="h-7 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setSearchQuery("")
                  setSearchOpen(false)
                }}
                aria-label="Close search"
              >
                <XIcon className="size-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <h1 className="text-lg font-bold tracking-tight text-foreground">Rescue map</h1>
                <p className="text-[11px] font-medium text-muted-foreground">Colombo, Sri Lanka</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Search cases and locations"
                aria-expanded={searchOpen}
                className="rounded-full bg-card shadow-sm"
              >
                <SearchIcon className="size-4" />
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Interactive Map */}
      <div className="absolute inset-0 z-0">
        <LeafletMap
          cases={visibleCases}
          selectedId={selected?.id ?? null}
          onSelectCase={(id) => setSelectedId(id)}
        />
      </div>

      {/* Filter FAB button */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetTrigger
          render={
            <Button
              size="icon-lg"
              className="absolute top-16 right-4 z-20 size-12 rounded-full shadow-lg"
              aria-label="Filter cases by status"
              aria-expanded={filtersOpen}
            />
          }
        >
          <FilterIcon className="size-5" />
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Filter by status</SheetTitle>
            <SheetDescription>Show rescue pins that match selected statuses.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-6">
            {STATUS_FILTERS.map((filter) => {
              const checked = activeStatuses.has(filter.id)
              return (
                <label
                  key={filter.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-muted/40 transition-colors"
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

      {/* Empty State Banner */}
      {visibleCases.length === 0 && (
        <div className="absolute top-28 inset-x-4 z-20 flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/95 p-4 text-center shadow-lg backdrop-blur-sm">
          <p className="text-sm font-semibold">No cases match your filters</p>
          <p className="text-xs text-muted-foreground">Try clearing search or selecting other statuses.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={resetFilters}
            className="mt-1 flex items-center gap-1.5"
          >
            <RotateCcwIcon className="size-3.5" />
            Reset filters
          </Button>
        </div>
      )}

      {/* Compact Status Legend */}
      <div className="absolute bottom-24 left-3 z-10 flex flex-col gap-1 rounded-xl bg-card/95 px-3 py-2 text-[11px] font-semibold text-muted-foreground shadow-md ring-1 ring-border/50 backdrop-blur-xs">
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-full bg-[#e5484d]" /> Reported
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-full bg-[#e67e22]" /> Rescued
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

      {/* Floating Selected Pin Card */}
      {selected ? (
        <Card className="absolute inset-x-3 bottom-3 z-30 gap-0 shadow-2xl border-border bg-card/98 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <span className="text-2xl font-bold">{selected.name[0]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-base font-bold">{selected.name}</strong>
                    <StatusBadge status={selected.status} label={selected.statusLabel} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Close case preview"
                    onClick={() => setSelectedId(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {selected.blurb}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-2.5 border-0 pt-0 bg-transparent">
            <Link
              href={`/cases/${selected.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
            >
              View profile
            </Link>
            {selected.actions.includes("respond") && (
              <Link
                href={`/cases/${selected.id}/respond`}
                className={cn(buttonVariants({ size: "sm" }), "flex-1")}
              >
                Respond
              </Link>
            )}
          </CardFooter>
        </Card>
      ) : null}
    </div>
  )
}
