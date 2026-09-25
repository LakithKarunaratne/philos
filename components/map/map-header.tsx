"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MapHeaderProps {
  searchOpen: boolean
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onOpenSearch: () => void
  onCloseSearch: () => void
}

/** Header bar with blur and expandable search. */
export function MapHeader({
  searchOpen,
  searchQuery,
  onSearchQueryChange,
  onOpenSearch,
  onCloseSearch,
}: MapHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex flex-col gap-2 bg-gradient-to-b from-background/95 via-background/80 to-transparent px-4 pt-3 pb-6 pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
        {searchOpen ? (
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-3 py-1 shadow-md">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <Input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search dog or Colombo location..."
              className="h-7 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
            />
            <Button variant="ghost" size="icon-xs" onClick={onCloseSearch} aria-label="Close search">
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
              onClick={onOpenSearch}
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
  )
}
