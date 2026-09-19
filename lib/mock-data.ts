export type CaseStatus =
  | "reported"
  | "rescued"
  | "vet"
  | "foster"
  | "adopted"

export type RescueCase = {
  id: string
  name: string
  status: CaseStatus
  statusLabel: string
  detail: string
  top: string
  left: string
  pinColor: string
  urgent?: boolean
}

export const DISPLAY_NAME = "Alex"

export const NEARBY_CASES: RescueCase[] = [
  {
    id: "bruno",
    name: "Bruno",
    status: "reported",
    statusLabel: "Injured",
    detail: "Elm Street · reported 40 min ago",
    top: "38%",
    left: "28%",
    pinColor: "#e5484d",
    urgent: true,
  },
  {
    id: "milo",
    name: "Milo",
    status: "foster",
    statusLabel: "Foster",
    detail: "Fostered by J. Alvarez · 2 weeks",
    top: "55%",
    left: "52%",
    pinColor: "#2e9d57",
  },
  {
    id: "luna",
    name: "Luna",
    status: "adopted",
    statusLabel: "Ready to adopt",
    detail: "Vaccinated · Vet cleared 3 days ago",
    top: "68%",
    left: "20%",
    pinColor: "#796f91",
  },
  {
    id: "coco",
    name: "Coco",
    status: "vet",
    statusLabel: "Vet care",
    detail: "Riverside Clinic · deworming course",
    top: "22%",
    left: "64%",
    pinColor: "#9a5cf0",
  },
]

export const MAP_CASE_DETAILS: Record<
  string,
  { blurb: string; actions: ("profile" | "respond")[] }
> = {
  bruno: {
    blurb: "Elm Street, 0.4 km away · needs transport to the clinic",
    actions: ["profile", "respond"],
  },
  milo: {
    blurb: "Fostered nearby · doing well, ready for adopters to meet him",
    actions: ["profile"],
  },
  coco: {
    blurb: "Riverside Clinic · deworming course, cleared in 4 days",
    actions: ["profile"],
  },
  luna: {
    blurb: "Found her forever home last week with the Reyes family",
    actions: ["profile"],
  },
}

export const STATUS_FILTERS: { id: CaseStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reported", label: "Reported" },
  { id: "rescued", label: "Rescued" },
  { id: "vet", label: "Vet care" },
  { id: "foster", label: "Foster" },
  { id: "adopted", label: "Adopted" },
]
