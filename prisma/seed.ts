// Development seed for Philos (PHI-9 follow-up).
//
// Mirrors the fixture cases the prototype screens render from `lib/mock-data`
// so the app can be pointed at a real database without the UI changing shape.
// Safe to re-run: every row is upserted under a deterministic id derived from
// a stable key, so a second run updates in place rather than duplicating.
// Timestamps are deliberately relative to the run (see `daysAgo`), so a re-run
// also refreshes them — that keeps "reported 40 min ago" true for the urgent
// fixtures instead of letting them age into staleness.

import { createHash } from "node:crypto";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../generated/prisma/client";
import {
  AlertCategory,
  CaseStatus,
  ContributionKind,
  DogGender,
  UserRole,
} from "../generated/prisma/enums";

/**
 * Deterministic UUIDv5-style id from a namespaced key, so re-running the seed
 * targets the same rows instead of inserting new ones.
 */
function seedId(key: string): string {
  const hash = createHash("sha1").update(`philos-seed:${key}`).digest();
  // Set the version (5) and RFC 4122 variant bits.
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

/**
 * Days before now, as a Date — keeps the fixtures relative to the run.
 *
 * `minute` separates entries that fall on the same day: several status events
 * can share a `daysAgo`, and the tracker orders by `occurredAt`, so without it
 * their order would be arbitrary.
 */
function daysAgo(days: number, hour = 9, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

const USERS = [
  {
    key: "alex",
    clerkId: "user_seed_alex",
    username: "alex",
    displayName: "Alex Fernando",
    email: "alex@example.com",
    phone: "+94 77 123 4567",
    role: UserRole.VOLUNTEER,
  },
  {
    key: "jalvarez",
    clerkId: "user_seed_jalvarez",
    username: "jalvarez",
    displayName: "J. Alvarez",
    email: "j.alvarez@example.com",
    phone: "+94 71 987 6543",
    role: UserRole.FOSTER,
  },
  {
    key: "dispatch",
    clerkId: "user_seed_dispatch",
    username: "colombo-dispatch",
    displayName: "Colombo Dispatch",
    email: "dispatch@example.com",
    phone: "+94 11 234 5678",
    role: UserRole.DISPATCHER,
  },
] as const;

type SeedUserKey = (typeof USERS)[number]["key"];

/** Status events are attributed to the dispatch desk unless they are the
 *  initial report, which belongs to whoever reported the case. */
const DISPATCH_USER_KEY: SeedUserKey = "dispatch";

type SeedCase = {
  slug: string;
  name: string;
  status: CaseStatus;
  statusNote: string | null;
  summary: string;
  locationName: string;
  lat: number;
  lng: number;
  urgent: boolean;
  ageLabel: string;
  breed: string;
  gender: DogGender;
  temperament: string[];
  conditions: string[];
  notes: string;
  reporterKey: SeedUserKey;
  reporterPhone: string;
  photos: { storageKey: string; alt: string }[];
  health: { note: string; vaccine?: string; recordedBy: string; daysAgo: number }[];
  timeline: { status: CaseStatus; label?: string; note?: string; daysAgo: number }[];
};

const CASES: SeedCase[] = [
  {
    slug: "bruno",
    name: "Bruno",
    status: CaseStatus.REPORTED,
    statusNote: "Injured",
    summary: "Galle Road, 0.4 km away · needs emergency transport to clinic",
    locationName: "Galle Road, Kollupitiya, Colombo 03",
    lat: 6.9147,
    lng: 79.8528,
    urgent: true,
    ageLabel: "~2 years",
    breed: "Sri Lankan Street Dog (Hound mix)",
    gender: DogGender.MALE,
    temperament: ["Friendly once calm", "Loves treats", "Responsive to gentle voices"],
    conditions: ["Injured / Limping", "Friendly / Docile"],
    notes:
      "Spotted resting near the bus stand. Alert and gentle, but unable to bear weight on the front-left paw.",
    reporterKey: "alex",
    reporterPhone: "+94 77 123 4567",
    photos: [{ storageKey: "seed/bruno-1.jpg", alt: "Bruno resting near a bus stand" }],
    health: [
      {
        note: "Limping on front-left paw, possible strain or fracture",
        recordedBy: "Volunteer on scene",
        daysAgo: 0,
      },
      { note: "Dehydrated and exhausted", recordedBy: "Volunteer on scene", daysAgo: 0 },
      {
        note: "Needs transport to Riverside Clinic immediately",
        recordedBy: "Colombo Dispatch",
        daysAgo: 0,
      },
    ],
    timeline: [
      { status: CaseStatus.REPORTED, daysAgo: 0 },
      {
        status: CaseStatus.RESCUED,
        label: "Volunteer Transport",
        note: "Dispatched",
        daysAgo: 0,
      },
    ],
  },
  {
    slug: "milo",
    name: "Milo",
    status: CaseStatus.FOSTER,
    statusNote: null,
    summary: "Duplication Road · Doing great in foster care, ready to meet adopters",
    locationName: "Duplication Road, Bambalapitiya, Colombo 04",
    lat: 6.892,
    lng: 79.856,
    urgent: false,
    ageLabel: "~1 year",
    breed: "Indie Terrier mix",
    gender: DogGender.MALE,
    temperament: ["Playful", "Good with kids", "House trained", "High energy"],
    conditions: ["Abandoned Puppies"],
    notes:
      "Very affectionate boy rescued from an abandoned alleyway. Thriving with basic leash commands.",
    reporterKey: "jalvarez",
    reporterPhone: "+94 71 987 6543",
    photos: [{ storageKey: "seed/milo-1.jpg", alt: "Milo playing in a foster home garden" }],
    health: [
      {
        note: "Vaccinated (DHPP & Rabies)",
        vaccine: "DHPP + Rabies",
        recordedBy: "Dr. Perera",
        daysAgo: 45,
      },
      {
        note: "Neutered last week, incision fully healed",
        recordedBy: "Dr. Perera",
        daysAgo: 7,
      },
      { note: "Cleared for permanent adoption", recordedBy: "Dr. Perera", daysAgo: 2 },
    ],
    timeline: [
      { status: CaseStatus.REPORTED, daysAgo: 52 },
      { status: CaseStatus.RESCUED, label: "Rescued & Vet Care", daysAgo: 49 },
      { status: CaseStatus.VET, daysAgo: 48 },
      { status: CaseStatus.FOSTER, label: "Foster Placement", daysAgo: 44 },
    ],
  },
  {
    slug: "coco",
    name: "Coco",
    status: CaseStatus.VET,
    statusNote: null,
    summary: "Riverside Clinic, Borella · Deworming and skin treatment, review in 4 days",
    locationName: "Cotta Road, Borella, Colombo 08",
    lat: 6.918,
    lng: 79.879,
    urgent: false,
    ageLabel: "~6 months",
    breed: "Puppy cross",
    gender: DogGender.FEMALE,
    temperament: ["Gentle", "Quiet", "Eager to please"],
    conditions: ["Skin Infection / Mange", "Malnourished"],
    notes: "Found weak in a cardboard box near Borella junction. Gaining strength each day.",
    reporterKey: "alex",
    reporterPhone: "+94 77 123 4567",
    photos: [{ storageKey: "seed/coco-1.jpg", alt: "Coco resting at Riverside Clinic" }],
    health: [
      {
        note: "Mange treatment round 2 in progress",
        recordedBy: "Riverside Clinic",
        daysAgo: 3,
      },
      {
        note: "Receiving high-protein recovery diet",
        recordedBy: "Riverside Clinic",
        daysAgo: 3,
      },
      { note: "Next vet review in 4 days", recordedBy: "Riverside Clinic", daysAgo: 1 },
    ],
    timeline: [
      { status: CaseStatus.REPORTED, daysAgo: 12 },
      { status: CaseStatus.RESCUED, daysAgo: 11 },
      { status: CaseStatus.VET, label: "Admitted to Vet", daysAgo: 11 },
    ],
  },
  {
    slug: "bella",
    name: "Bella",
    status: CaseStatus.RESCUED,
    statusNote: null,
    summary: "Vauxhall Street · Safe at holding shelter, vet checkup scheduled today",
    locationName: "Vauxhall Street, Slave Island, Colombo 02",
    lat: 6.923,
    lng: 79.851,
    urgent: false,
    ageLabel: "~3 years",
    breed: "Mixed breed",
    gender: DogGender.FEMALE,
    temperament: ["Calm", "Observant", "Sweet tempered"],
    conditions: ["Trapped / In Danger"],
    notes: "Rescued after getting stranded during heavy rain near Beira Lake.",
    reporterKey: "dispatch",
    reporterPhone: "+94 11 234 5678",
    photos: [{ storageKey: "seed/bella-1.jpg", alt: "Bella at the Colombo holding shelter" }],
    health: [
      {
        note: "Underwent health check, no major injuries",
        recordedBy: "Colombo Holding Shelter",
        daysAgo: 0,
      },
      {
        note: "Scheduled for vaccination tomorrow",
        recordedBy: "Colombo Holding Shelter",
        daysAgo: 0,
      },
    ],
    timeline: [
      { status: CaseStatus.REPORTED, daysAgo: 1 },
      { status: CaseStatus.RESCUED, label: "Rescued by Team", daysAgo: 0 },
    ],
  },
  {
    slug: "luna",
    name: "Luna",
    status: CaseStatus.ADOPTED,
    statusNote: "Ready to adopt",
    summary: "Albert Crescent · Found her forever home trial with the Reyes family",
    locationName: "Albert Crescent, Cinnamon Gardens, Colombo 07",
    lat: 6.908,
    lng: 79.87,
    urgent: false,
    ageLabel: "~4 years",
    breed: "Golden shepherd mix",
    gender: DogGender.FEMALE,
    temperament: ["Loyal", "Well socialized", "Calm around other dogs"],
    conditions: ["Friendly / Docile"],
    notes: "A beloved community rescue who found a loving family after 3 weeks in care.",
    reporterKey: "jalvarez",
    reporterPhone: "+94 71 987 6543",
    photos: [{ storageKey: "seed/luna-1.jpg", alt: "Luna with the Reyes family" }],
    health: [
      {
        note: "Fully vaccinated, microchipped, spayed",
        vaccine: "DHPP + Rabies",
        recordedBy: "Riverside Clinic",
        daysAgo: 60,
      },
      { note: "Excellent dental health", recordedBy: "Riverside Clinic", daysAgo: 30 },
    ],
    timeline: [
      { status: CaseStatus.REPORTED, daysAgo: 70 },
      { status: CaseStatus.RESCUED, daysAgo: 68 },
      { status: CaseStatus.FOSTER, label: "Foster Care", daysAgo: 65 },
      { status: CaseStatus.ADOPTED, label: "Forever Home Trial", daysAgo: 5 },
    ],
  },
];

const ALERTS = [
  {
    key: "alert-1",
    title: "Urgent: Transport needed for Bruno",
    description: "Bruno is injured on Galle Road, Kollupitiya. Volunteer with vehicle needed.",
    category: AlertCategory.URGENT,
    caseSlug: "bruno",
    link: "/cases/bruno/respond",
    publishedAt: hoursAgo(1),
  },
  {
    key: "alert-2",
    title: "Bella successfully brought to safety",
    description: "Slave Island rescue completed. Bella is now at the Colombo holding shelter.",
    category: AlertCategory.UPDATE,
    caseSlug: "bella",
    link: null,
    publishedAt: hoursAgo(2),
  },
  {
    key: "alert-3",
    title: "Foster update: Milo's stitches removed",
    description: "Dr. Perera cleared Milo for permanent adoption! Meet & greets open.",
    category: AlertCategory.FOSTER,
    caseSlug: "milo",
    link: null,
    publishedAt: hoursAgo(5),
  },
  {
    key: "alert-4",
    title: "Coco started course of medication",
    description:
      "Riverside Clinic has begun Coco's deworming and specialized skin recovery plan.",
    category: AlertCategory.UPDATE,
    caseSlug: "coco",
    link: null,
    publishedAt: hoursAgo(28),
  },
  {
    key: "alert-5",
    title: "Luna adoption finalized",
    description: "The Reyes family completed the adoption protocol for Luna in Cinnamon Gardens.",
    category: AlertCategory.UPDATE,
    caseSlug: "luna",
    link: null,
    publishedAt: hoursAgo(34),
  },
] as const;

const CONTRIBUTIONS = [
  {
    key: "c-1",
    userKey: "alex" as SeedUserKey,
    caseSlug: "bruno",
    kind: ContributionKind.TRANSPORT,
    title: "Transport for Bruno",
    detail: "Riverside Clinic · Assigned volunteer",
    daysAgo: 0,
  },
  {
    key: "c-2",
    userKey: "alex",
    caseSlug: null,
    kind: ContributionKind.FEEDING,
    title: "Evening feeding round",
    detail: "Shelter Block C · Colombo 02",
    daysAgo: 1,
  },
  {
    key: "c-3",
    userKey: "alex",
    caseSlug: "milo",
    kind: ContributionKind.FOSTER_CHECK_IN,
    title: "Foster check-in for Milo",
    detail: "Duplication Road · Home visit complete",
    daysAgo: 3,
  },
] as const;

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local or your environment.");
  }

  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

async function main() {
  const prisma = createClient();

  try {
    for (const user of USERS) {
      const id = seedId(`user:${user.key}`);
      const data = {
        clerkId: user.clerkId,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        deletedAt: null,
      };
      await prisma.user.upsert({ where: { id }, create: { id, ...data }, update: data });
    }

    for (const seedCase of CASES) {
      const id = seedId(`case:${seedCase.slug}`);
      const data = {
        slug: seedCase.slug,
        name: seedCase.name,
        status: seedCase.status,
        statusNote: seedCase.statusNote,
        summary: seedCase.summary,
        locationName: seedCase.locationName,
        lat: seedCase.lat,
        lng: seedCase.lng,
        urgent: seedCase.urgent,
        ageLabel: seedCase.ageLabel,
        breed: seedCase.breed,
        gender: seedCase.gender,
        temperament: seedCase.temperament,
        conditions: seedCase.conditions,
        notes: seedCase.notes,
        reportedById: seedId(`user:${seedCase.reporterKey}`),
        reporterPhone: seedCase.reporterPhone,
        deletedAt: null,
      };
      await prisma.rescueCase.upsert({ where: { id }, create: { id, ...data }, update: data });

      for (const [index, photo] of seedCase.photos.entries()) {
        const photoId = seedId(`photo:${seedCase.slug}:${index}`);
        const photoData = {
          caseId: id,
          storageKey: photo.storageKey,
          url: null,
          alt: photo.alt,
          sortOrder: index,
          deletedAt: null,
        };
        await prisma.casePhoto.upsert({
          where: { id: photoId },
          create: { id: photoId, ...photoData },
          update: photoData,
        });
      }

      for (const [index, record] of seedCase.health.entries()) {
        const recordId = seedId(`health:${seedCase.slug}:${index}`);
        const recordData = {
          caseId: id,
          note: record.note,
          vaccine: record.vaccine ?? null,
          recordedAt: daysAgo(record.daysAgo, 11, index),
          recordedBy: record.recordedBy,
          deletedAt: null,
        };
        await prisma.healthRecord.upsert({
          where: { id: recordId },
          create: { id: recordId, ...recordData },
          update: recordData,
        });
      }

      for (const [index, event] of seedCase.timeline.entries()) {
        const eventId = seedId(`event:${seedCase.slug}:${index}`);
        const eventData = {
          caseId: id,
          status: event.status,
          label: event.label ?? null,
          note: event.note ?? null,
          occurredAt: daysAgo(event.daysAgo, 10, index),
          actorId: seedId(
            `user:${
              event.status === CaseStatus.REPORTED ? seedCase.reporterKey : DISPATCH_USER_KEY
            }`
          ),
          deletedAt: null,
        };
        await prisma.caseStatusEvent.upsert({
          where: { id: eventId },
          create: { id: eventId, ...eventData },
          update: eventData,
        });
      }
    }

    for (const alert of ALERTS) {
      const id = seedId(`alert:${alert.key}`);
      const data = {
        title: alert.title,
        description: alert.description,
        category: alert.category,
        caseId: seedId(`case:${alert.caseSlug}`),
        link: alert.link,
        publishedAt: alert.publishedAt,
        deletedAt: null,
      };
      await prisma.alert.upsert({ where: { id }, create: { id, ...data }, update: data });
    }

    // Alex has already read the three older alerts.
    for (const alertKey of ["alert-3", "alert-4", "alert-5"]) {
      const alertId = seedId(`alert:${alertKey}`);
      const userId = seedId("user:alex");
      await prisma.alertRead.upsert({
        where: { alertId_userId: { alertId, userId } },
        create: { id: seedId(`alert-read:${alertKey}:alex`), alertId, userId },
        update: { deletedAt: null },
      });
    }

    for (const contribution of CONTRIBUTIONS) {
      const id = seedId(`contribution:${contribution.key}`);
      const data = {
        userId: seedId(`user:${contribution.userKey}`),
        caseId: contribution.caseSlug ? seedId(`case:${contribution.caseSlug}`) : null,
        kind: contribution.kind,
        title: contribution.title,
        detail: contribution.detail,
        occurredAt: daysAgo(contribution.daysAgo, 17),
        deletedAt: null,
      };
      await prisma.contribution.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
    }

    process.stdout.write(
      `Seeded ${USERS.length} users, ${CASES.length} cases, ${ALERTS.length} alerts, ` +
        `${CONTRIBUTIONS.length} contributions.\n`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`Seed failed: ${detail}\n`);
  process.exitCode = 1;
});
