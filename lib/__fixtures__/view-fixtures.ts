// View-type fixtures for component tests.
//
// These replace what `lib/mock-data` used to provide. They are test data only:
// screens read from the database (see `lib/queries/*`), so nothing in `app/`
// or `components/` may import this file.

import type { AlertItem, CaseSummary, ContributionItem, RescueCase } from "@/lib/view-types"

export const CASE_SUMMARY_FIXTURE: CaseSummary = {
  id: "bruno",
  name: "Bruno",
  status: "reported",
  statusLabel: "Injured",
  detail: "Galle Road, Kollupitiya · Reported 40 min ago",
  locationName: "Galle Road, Kollupitiya, Colombo 03",
  lat: 6.9147,
  lng: 79.8528,
  distance: "700 m away",
  urgent: true,
  blurb: "Galle Road, 0.4 km away · needs emergency transport to clinic",
  actions: ["profile", "respond"],
}

export const RESCUE_CASE_FIXTURE: RescueCase = {
  ...CASE_SUMMARY_FIXTURE,
  age: "~2 years",
  breed: "Sri Lankan Street Dog (Hound mix)",
  gender: "Male",
  photos: [],
  temperament: ["Friendly once calm", "Loves treats"],
  healthNotes: ["Limping on front-left paw, possible strain or fracture"],
  timelineSteps: [
    { label: "Reported", date: "Today 10:15 AM", status: "completed" },
    { label: "Volunteer Transport", date: "Dispatched", status: "current" },
    { label: "Vet Examination", date: "Pending", status: "pending" },
  ],
  notes: "Spotted resting near the bus stand.",
}

export const ALERT_FIXTURE: AlertItem = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Urgent: Transport needed for Bruno",
  description: "Bruno is injured on Galle Road, Kollupitiya. Volunteer with vehicle needed.",
  time: "40 min ago",
  day: "Today",
  category: "urgent",
  read: false,
  caseId: "bruno",
  link: "/cases/bruno/respond",
}

export const CONTRIBUTION_FIXTURE: ContributionItem = {
  id: "22222222-2222-4222-8222-222222222222",
  title: "Transport for Bruno",
  detail: "Riverside Clinic · Assigned volunteer",
  date: "Today",
}
