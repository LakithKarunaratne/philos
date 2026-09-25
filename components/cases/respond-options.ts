// Options for the respond / emergency flow (`/cases/[id]/respond`).

export const HELP_TYPES = [
  { id: "transport", label: "Emergency Transport", desc: "Vehicle available to take dog to clinic" },
  { id: "first-aid", label: "First Aid On-Site", desc: "Bandages, antiseptic, comfort until help arrives" },
  { id: "foster-hold", label: "Temporary Holding", desc: "Safe yard or room for tonight" },
  { id: "supplies", label: "Food & Water", desc: "High-protein meal, clean hydration" },
] as const

export type HelpTypeId = (typeof HELP_TYPES)[number]["id"]

export const DEFAULT_HELP_TYPE: HelpTypeId = "transport"

export const ETA_OPTIONS = ["15 mins", "30 mins", "45 mins", "1 hour", "2+ hours"] as const

export type EtaOption = (typeof ETA_OPTIONS)[number]

export const DEFAULT_ETA: EtaOption = "30 mins"
