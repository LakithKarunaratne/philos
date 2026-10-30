# Philos

A coordination network for street dogs — from first report to forever home.

[![DeepSource](https://app.deepsource.com/gh/LakithKarunaratne/philos.svg/?label=code+coverage&show_trend=false&token=2jCppPJRelz4s3qa0MwE91PH)](https://app.deepsource.com/gh/LakithKarunaratne/philos/)

## Overview

Philos connects local animal rescuers, veterinarians, foster parents, and volunteers in Colombo, Sri Lanka. It provides real-time emergency reporting, interactive mapping, case tracking, and volunteer response dispatch.

### Core Features

- **Rescue Map**: Full-screen interactive map powered by Leaflet.js centered on Colombo, Sri Lanka (`[6.9271, 79.8612]`). Real-time pin filtering by status (Reported, Rescued, Vet care, Foster, Adopted), search expansion, and tab-session filter persistence.
- **Dog Profile & Progress Tracker**: Dynamic profile pages (`/cases/[id]`) showing medical records, temperament tags, and a multi-stage rescue/care timeline.
- **Emergency Response**: Volunteer dispatch flow (`/cases/[id]/respond`) with ETA selection, vehicle details, and instant coordinator notification.
- **Report a Dog**: Client-side reporting form (`/report`) with mock photo upload, Colombo location autofill, condition chip selector, and description.
- **Alerts Feed**: Community update notifications (`/alerts`) grouped by day with category filters (Urgent, Updates, Foster) and read tracking.
- **Authentication**: Powered by Clerk (`@clerk/nextjs` with shadcn theme) supporting username/password sign-in and sign-up, route gating, and identity integration.
- **Settings**: Clerk-connected profile email, password reset requests, donation tiers ($5 / $15 / $50 / Custom), and contribution logs.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### 1. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Clerk API credentials and your Neon connection string:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

DATABASE_URL=postgresql://user:password@ep-...-pooler.us-east-2.aws.neon.tech/philos?sslmode=require
```

Create a Postgres project at [neon.com](https://neon.com), then copy the **pooled** connection string (the host contains `-pooler`) from the **Connect** dialog on the project dashboard into `DATABASE_URL`.

### 1b. Clerk User Sync and Roles

Clerk owns identity; the `users` table is a local mirror so cases, responses and
contributions have a row to point at. A webhook keeps the two in step, and
carries the role an operator grants:

```
Clerk dashboard  →  webhook  →  users.role  →  requireRole() in server actions
 (public metadata)
```

#### Create the endpoint

1. In the Clerk dashboard, go to **Webhooks → Add Endpoint**.
2. Point it at `https://<your-host>/api/webhooks/clerk` and subscribe to
   `user.created`, `user.updated` and `user.deleted`.
3. Copy the endpoint's **Signing Secret** into `CLERK_WEBHOOK_SIGNING_SECRET`.

The secret is per endpoint, and Clerk's development and production instances are
separate — so each environment needs its own endpoint and its own secret.

The endpoint is public in `proxy.ts` because Clerk calls it without a session —
the signature check is what authenticates it. Without the secret set, every
delivery is rejected and the app falls back to a lazy upsert on the first
authenticated request, so sign-in still works but role changes do not arrive.

#### Check it works

The endpoint's **Testing** tab sends a real signed delivery: pick `user.created`
and click **Send Example**, and the handler should answer `204`.

Note that the sample payload carries a made-up user id, so a successful test
leaves a junk row in `users`. Clear it with `npm run db:studio`.

#### Grant a role

Set `role` in the user's Clerk **public metadata** (dashboard → **Users** → a
user → **Metadata** → *Public*):

```json
{ "role": "DISPATCHER" }
```

Valid values are `REPORTER` (the default), `VOLUNTEER`, `FOSTER`, `DISPATCHER`
and `ADMIN`. Saving fires `user.updated`, so the role reaches `users.role` in a
second or two — reload a case page and the dispatcher controls appear.

Use *public* metadata, not `unsafeMetadata`: the latter is writable by the user
themselves, which would let anyone promote their own account. An unrecognised
value (a typo like `DISPATHCER`) is ignored rather than guessed at, so the user
keeps the role they had — if a grant seems not to take, check `users.role`.

#### Local development

Clerk cannot reach `localhost`, so deliveries need a tunnel:

```bash
clerk webhooks listen --forward-to http://localhost:3000/api/webhooks/clerk
```

`--token` pins the URL across restarts. ngrok, Cloudflare Tunnel and
`svix listen` work too; with those, update the endpoint URL in the dashboard
whenever the tunnel URL changes.

The tunnel is only needed to test role propagation. Without one, sign-in still
works — the lazy upsert creates the row on the first authenticated request — and
you can set `users.role` by hand with `npm run db:studio`.

### 2. Install Dependencies

```bash
npm install
```

The `postinstall` hook runs `prisma generate`, so the Prisma client is ready after a fresh install. It is written to `generated/`, which is gitignored.

### 3. Database Setup

The app reads everything from Postgres through Prisma (`prisma/schema.prisma`). There is no fixture fallback, so an unseeded database renders empty screens rather than demo dogs.

```bash
# Apply migrations (interactive, for local development)
npm run db:migrate

# Load the development fixtures (users, cases, photos, health records, status events, alerts and contributions)
npm run db:seed
```

- `npm run db:migrate` runs `prisma migrate dev`: it applies pending migrations, creates a new one if the schema changed, and regenerates the client.
- `npm run db:deploy` runs `prisma migrate deploy`: it applies pending migrations without prompting, so use it in CI and production.
- `npm run db:seed` is idempotent. Every row has a deterministic id, so re-running it updates the fixtures in place instead of duplicating them.
- `npm run db:studio` opens Prisma Studio to browse the data.
- `npm run db:generate` regenerates the client on demand (for example after editing `prisma/schema.prisma`).

Prisma commands read `DATABASE_URL` from `.env.local`, then `.env`.

### 4. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access Philos.

---

## Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router with Proxy convention)
- **UI & Design**: React 19, Tailwind CSS v4, Base UI (`@base-ui/react`), `happy-philo` warm theme (Quicksand font, radius 1rem, earthy oranges)
- **Auth**: Clerk (`@clerk/nextjs`, `@clerk/ui`)
- **Maps**: Leaflet.js with OpenStreetMap tiles
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library

## Verification Commands

```bash
# Run unit & component tests
npm test

# Run code linter
npm run lint

# Run type checker
npx tsc --noEmit
```
