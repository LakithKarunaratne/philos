// Shared app-wide constants. Keep page-specific values colocated with their page.

import type { CaseStatus } from "@/lib/mock-data"

/** Case opened when a mock flow has no real case to link to (prototype only). */
export const DEMO_CASE_ID = "bruno"

/** How long transient "Saved!" / "Sent!" style feedback stays visible. */
export const FEEDBACK_DURATION_MS = 3000

/** Filter value that matches every status or category. */
export const FILTER_ALL = "all" as const

/**
 * Single source for how each case status looks: label, badge classes, legend
 * dot class, and a CSS colour for places Tailwind can't reach (Leaflet pins).
 * Colours come from the `--status-*` theme tokens in app/globals.css.
 */
export const STATUS_META = {
  reported: {
    label: "Reported",
    badgeClass: "bg-status-reported/10 text-status-reported dark:bg-status-reported/20",
    dotClass: "bg-status-reported",
    color: "var(--status-reported)",
  },
  rescued: {
    label: "Rescued",
    badgeClass: "bg-status-rescued/15 text-status-rescued border-status-rescued/20",
    dotClass: "bg-status-rescued",
    color: "var(--status-rescued)",
  },
  vet: {
    label: "Vet care",
    badgeClass: "bg-status-vet/15 text-status-vet border-status-vet/20",
    dotClass: "bg-status-vet",
    color: "var(--status-vet)",
  },
  foster: {
    label: "Foster",
    badgeClass: "bg-status-foster/15 text-status-foster border-status-foster/20",
    dotClass: "bg-status-foster",
    color: "var(--status-foster)",
  },
  adopted: {
    label: "Adopted",
    badgeClass: "bg-status-adopted/15 text-status-adopted border-status-adopted/20",
    dotClass: "bg-status-adopted",
    color: "var(--status-adopted)",
  },
} as const satisfies Record<
  CaseStatus,
  { label: string; badgeClass: string; dotClass: string; color: string }
>

/** Statuses in display order (legend, filters). */
export const CASE_STATUSES = Object.keys(STATUS_META) as CaseStatus[]
