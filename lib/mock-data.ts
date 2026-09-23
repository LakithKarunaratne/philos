import { CASE_STATUSES, FILTER_ALL, STATUS_META } from "@/lib/constants"

export type CaseStatus =
  | "reported"
  | "rescued"
  | "vet"
  | "foster"
  | "adopted"

export type TimelineStep = {
  label: string
  date: string
  status: "completed" | "current" | "pending"
}

export type RescueCase = {
  id: string
  name: string
  status: CaseStatus
  statusLabel: string
  detail: string
  locationName: string
  lat: number
  lng: number
  distance: string
  urgent?: boolean
  age?: string
  breed?: string
  gender?: "Male" | "Female"
  photos?: string[]
  temperament?: string[]
  healthNotes?: string[]
  timelineSteps: TimelineStep[]
  blurb: string
  actions: ("profile" | "respond")[]
  notes?: string
}

export const NEARBY_CASES: RescueCase[] = [
  {
    id: "bruno",
    name: "Bruno",
    status: "reported",
    statusLabel: "Injured",
    detail: "Galle Road, Kollupitiya · Reported 40 min ago",
    locationName: "Galle Road, Kollupitiya, Colombo 03",
    lat: 6.9147,
    lng: 79.8528,
    distance: "0.4 km away",
    urgent: true,
    age: "~2 years",
    breed: "Sri Lankan Street Dog (Hound mix)",
    gender: "Male",
    photos: ["/placeholder-dog-1.jpg"],
    temperament: ["Friendly once calm", "Loves treats", "Responsive to gentle voices"],
    healthNotes: [
      "Limping on front-left paw, possible strain or fracture",
      "Dehydrated and exhausted",
      "Needs transport to Riverside Clinic immediately",
    ],
    timelineSteps: [
      { label: "Reported", date: "Today 10:15 AM", status: "completed" },
      { label: "Volunteer Transport", date: "Dispatched", status: "current" },
      { label: "Vet Examination", date: "Pending", status: "pending" },
      { label: "Foster Care", date: "Pending", status: "pending" },
      { label: "Forever Home", date: "Pending", status: "pending" },
    ],
    blurb: "Galle Road, 0.4 km away · needs emergency transport to clinic",
    actions: ["profile", "respond"],
    notes: "Spotted resting near the bus stand. Alert and gentle, but unable to bear weight on the front-left paw.",
  },
  {
    id: "milo",
    name: "Milo",
    status: "foster",
    statusLabel: "Foster",
    detail: "Bambalapitiya · Fostered by J. Alvarez for 2 weeks",
    locationName: "Duplication Road, Bambalapitiya, Colombo 04",
    lat: 6.892,
    lng: 79.856,
    distance: "1.8 km away",
    urgent: false,
    age: "~1 year",
    breed: "Indie Terrier mix",
    gender: "Male",
    photos: ["/placeholder-dog-2.jpg"],
    temperament: ["Playful", "Good with kids", "House trained", "High energy"],
    healthNotes: [
      "Vaccinated (DHPP & Rabies)",
      "Neutered last week, incision fully healed",
      "Cleared for permanent adoption",
    ],
    timelineSteps: [
      { label: "Reported", date: "Sep 2", status: "completed" },
      { label: "Rescued & Vet Care", date: "Sep 5", status: "completed" },
      { label: "Foster Placement", date: "Sep 10", status: "completed" },
      { label: "Ready for Adoption", date: "Active now", status: "current" },
    ],
    blurb: "Duplication Road · Doing great in foster care, ready to meet adopters",
    actions: ["profile"],
    notes: "Very affectionate boy rescued from an abandoned alleyway. Thriving with basic leash commands.",
  },
  {
    id: "coco",
    name: "Coco",
    status: "vet",
    statusLabel: "Vet care",
    detail: "Riverside Clinic, Borella · Deworming & skin treatment",
    locationName: "Cotta Road, Borella, Colombo 08",
    lat: 6.918,
    lng: 79.879,
    distance: "2.6 km away",
    urgent: false,
    age: "~6 months",
    breed: "Puppy cross",
    gender: "Female",
    photos: ["/placeholder-dog-3.jpg"],
    temperament: ["Gentle", "Quiet", "Eager to please"],
    healthNotes: [
      "Mange treatment round 2 in progress",
      "Receiving high-protein recovery diet",
      "Next vet review in 4 days",
    ],
    timelineSteps: [
      { label: "Reported", date: "Sep 14", status: "completed" },
      { label: "Admitted to Vet", date: "Sep 15", status: "completed" },
      { label: "Treatment Course", date: "In progress", status: "current" },
      { label: "Foster Placement", date: "Upcoming", status: "pending" },
    ],
    blurb: "Riverside Clinic, Borella · Deworming and skin treatment, review in 4 days",
    actions: ["profile"],
    notes: "Found weak in a cardboard box near Borella junction. Gaining strength each day.",
  },
  {
    id: "bella",
    name: "Bella",
    status: "rescued",
    statusLabel: "Rescued",
    detail: "Slave Island · Resting at holding shelter",
    locationName: "Vauxhall Street, Slave Island, Colombo 02",
    lat: 6.923,
    lng: 79.851,
    distance: "1.1 km away",
    urgent: false,
    age: "~3 years",
    breed: "Mixed breed",
    gender: "Female",
    photos: ["/placeholder-dog-4.jpg"],
    temperament: ["Calm", "Observant", "Sweet tempered"],
    healthNotes: ["Underwent health check, no major injuries", "Scheduled for vaccination tomorrow"],
    timelineSteps: [
      { label: "Reported", date: "Yesterday", status: "completed" },
      { label: "Rescued by Team", date: "Today 8:00 AM", status: "completed" },
      { label: "Vet Evaluation", date: "Today 3:00 PM", status: "current" },
      { label: "Foster Search", date: "Pending", status: "pending" },
    ],
    blurb: "Vauxhall Street · Safe at holding shelter, vet checkup scheduled today",
    actions: ["profile"],
    notes: "Rescued after getting stranded during heavy rain near Beira Lake.",
  },
  {
    id: "luna",
    name: "Luna",
    status: "adopted",
    statusLabel: "Ready to adopt",
    detail: "Cinnamon Gardens · Adoption trial with Reyes family",
    locationName: "Albert Crescent, Cinnamon Gardens, Colombo 07",
    lat: 6.908,
    lng: 79.87,
    distance: "2.1 km away",
    urgent: false,
    age: "~4 years",
    breed: "Golden shepherd mix",
    gender: "Female",
    photos: ["/placeholder-dog-5.jpg"],
    temperament: ["Loyal", "Well socialized", "Calm around other dogs"],
    healthNotes: ["Fully vaccinated, microchipped, spayed", "Excellent dental health"],
    timelineSteps: [
      { label: "Reported", date: "Aug 15", status: "completed" },
      { label: "Foster Care", date: "Aug 20", status: "completed" },
      { label: "Forever Home Trial", date: "Finalizing", status: "completed" },
    ],
    blurb: "Albert Crescent · Found her forever home trial with the Reyes family",
    actions: ["profile"],
    notes: "A beloved community rescue who found a loving family after 3 weeks in care.",
  },
]

export const STATUS_FILTERS: { id: CaseStatus | typeof FILTER_ALL; label: string }[] = [
  { id: FILTER_ALL, label: "All" },
  ...CASE_STATUSES.map((id) => ({ id, label: STATUS_META[id].label })),
]

export type AlertCategory = "urgent" | "update" | "foster"

export type AlertItem = {
  id: string
  title: string
  description: string
  time: string
  day: "Today" | "Yesterday"
  category: AlertCategory
  read: boolean
  caseId?: string
  link?: string
}

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "alert-1",
    title: "Urgent: Transport needed for Bruno",
    description: "Bruno is injured on Galle Road, Kollupitiya. Volunteer with vehicle needed.",
    time: "40 min ago",
    day: "Today",
    category: "urgent",
    read: false,
    caseId: "bruno",
    link: "/cases/bruno/respond",
  },
  {
    id: "alert-2",
    title: "Bella successfully brought to safety",
    description: "Slave Island rescue completed. Bella is now at the Colombo holding shelter.",
    time: "2 hours ago",
    day: "Today",
    category: "update",
    read: false,
    caseId: "bella",
    link: "/cases/bella",
  },
  {
    id: "alert-3",
    title: "Foster update: Milo's stitches removed",
    description: "Dr. Perera cleared Milo for permanent adoption! Meet & greets open.",
    time: "5 hours ago",
    day: "Today",
    category: "foster",
    read: true,
    caseId: "milo",
    link: "/cases/milo",
  },
  {
    id: "alert-4",
    title: "Coco started course of medication",
    description: "Riverside Clinic has begun Coco's deworming and specialized skin recovery plan.",
    time: "Yesterday 4:30 PM",
    day: "Yesterday",
    category: "update",
    read: true,
    caseId: "coco",
    link: "/cases/coco",
  },
  {
    id: "alert-5",
    title: "Luna adoption finalized",
    description: "The Reyes family completed the adoption protocol for Luna in Cinnamon Gardens.",
    time: "Yesterday 11:00 AM",
    day: "Yesterday",
    category: "update",
    read: true,
    caseId: "luna",
    link: "/cases/luna",
  },
]

export type ContributionItem = {
  id: string
  title: string
  detail: string
  date: string
}

export const INITIAL_CONTRIBUTIONS: ContributionItem[] = [
  {
    id: "c-1",
    title: "Transport for Bruno",
    detail: "Riverside Clinic · Assigned volunteer",
    date: "Today",
  },
  {
    id: "c-2",
    title: "Evening feeding round",
    detail: "Shelter Block C · Colombo 02",
    date: "Yesterday",
  },
  {
    id: "c-3",
    title: "Foster check-in for Milo",
    detail: "Duplication Road · Home visit complete",
    date: "3 days ago",
  },
]
