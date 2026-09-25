"use client"

import { useCallback, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { MapEmptyState } from "@/components/map/map-empty-state"
import { MapHeader } from "@/components/map/map-header"
import { SelectedCaseCard } from "@/components/map/selected-case-card"
import { StatusFilterSheet } from "@/components/map/status-filter-sheet"
import { StatusLegend } from "@/components/map/status-legend"
import { useStatusFilters } from "@/components/map/use-status-filters"
import { FILTER_ALL } from "@/lib/constants"
import { NEARBY_CASES } from "@/lib/mock-data"

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

export function RescueMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { activeStatuses, toggleStatus, resetStatuses } = useStatusFilters()

  const visibleCases = useMemo(() => {
    let result = NEARBY_CASES

    if (!activeStatuses.has(FILTER_ALL)) {
      result = result.filter((c) => activeStatuses.has(c.status))
    }

    const q = searchQuery.trim().toLowerCase()
    if (q) {
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

  const closeSearch = useCallback(() => {
    setSearchQuery("")
    setSearchOpen(false)
  }, [])

  function resetFilters() {
    resetStatuses()
    setSearchQuery("")
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <MapHeader
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onOpenSearch={() => setSearchOpen(true)}
        onCloseSearch={closeSearch}
      />

      <div className="absolute inset-0 z-0">
        <LeafletMap
          cases={visibleCases}
          selectedId={selected?.id ?? null}
          onSelectCase={setSelectedId}
        />
      </div>

      <StatusFilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        activeStatuses={activeStatuses}
        onToggleStatus={toggleStatus}
      />

      {visibleCases.length === 0 && <MapEmptyState onReset={resetFilters} />}

      <StatusLegend />

      {selected ? <SelectedCaseCard dog={selected} onClose={() => setSelectedId(null)} /> : null}
    </div>
  )
}
