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

Fill in your Clerk API credentials:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 2. Install Dependencies & Start Dev Server

```bash
npm install
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
