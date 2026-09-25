"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import { FILTER_ALL } from "@/lib/constants"
import type { CaseStatus } from "@/lib/mock-data"

export type StatusFilterId = CaseStatus | typeof FILTER_ALL

const STORAGE_KEY = "philos_map_filters"
const DEFAULT_FILTERS: StatusFilterId[] = [FILTER_ALL]

// sessionStorage has no change event within the same tab, so notify manually.
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function readStored(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStored(value: Set<StatusFilterId>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(value)))
  } catch {
    // Ignore sessionStorage errors (private mode, quota)
  }
  listeners.forEach((listener) => listener())
}

function parseStored(raw: string | null): Set<StatusFilterId> {
  if (!raw) return new Set(DEFAULT_FILTERS)
  try {
    const parsed = JSON.parse(raw) as StatusFilterId[]
    return parsed.length > 0 ? new Set(parsed) : new Set(DEFAULT_FILTERS)
  } catch {
    return new Set(DEFAULT_FILTERS)
  }
}

/**
 * Map status filters persisted in sessionStorage. The server snapshot is the
 * default, so hydration matches and the stored value is applied after mount.
 */
export function useStatusFilters() {
  const raw = useSyncExternalStore(subscribe, readStored, () => null)
  const activeStatuses = useMemo(() => parseStored(raw), [raw])

  const toggleStatus = useCallback(
    (id: StatusFilterId) => {
      const next = new Set(activeStatuses)
      if (id === FILTER_ALL) {
        writeStored(new Set(DEFAULT_FILTERS))
        return
      }
      next.delete(FILTER_ALL)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeStored(next.size === 0 ? new Set(DEFAULT_FILTERS) : next)
    },
    [activeStatuses]
  )

  const resetStatuses = useCallback(() => writeStored(new Set(DEFAULT_FILTERS)), [])

  return { activeStatuses, toggleStatus, resetStatuses }
}
