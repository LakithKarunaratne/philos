"use client"

import { FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { STATUS_FILTERS } from "@/lib/mock-data"
import type { StatusFilterId } from "@/components/map/use-status-filters"

interface StatusFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeStatuses: Set<StatusFilterId>
  onToggleStatus: (id: StatusFilterId) => void
}

export function StatusFilterSheet({
  open,
  onOpenChange,
  activeStatuses,
  onToggleStatus,
}: StatusFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <Button
            size="icon-lg"
            className="absolute top-16 right-4 z-20 size-12 rounded-full shadow-lg"
            aria-label="Filter cases by status"
            aria-expanded={open}
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
          {STATUS_FILTERS.map((filter) => (
            <label
              key={filter.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-muted/40 transition-colors"
            >
              <Checkbox
                checked={activeStatuses.has(filter.id)}
                onCheckedChange={() => onToggleStatus(filter.id)}
              />
              <span className="text-sm font-medium">{filter.label}</span>
            </label>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
