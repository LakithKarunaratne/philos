import Link from "next/link"
import { PawPrintIcon, SearchIcon } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CaseListRow } from "@/components/cases/case-list-row"
import { StatsGrid } from "@/components/home/stats-grid"
import { UrgentBanner } from "@/components/home/urgent-banner"
import { NEARBY_CASES } from "@/lib/mock-data"
import { cn } from "cn"

/** Shown when the signed-in user has no first name, username or email. */
const FALLBACK_NAME = "there"

function salutation() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default async function HomePage() {
  const user = await currentUser()
  const emailHandle = user?.primaryEmailAddress?.emailAddress.split("@")[0]
  const greetingName = user?.firstName || user?.username || emailHandle || FALLBACK_NAME

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <div className="flex flex-1 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <PawPrintIcon className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">Philos</span>
        </div>
        <UserButton />
        <Link
          href="/map"
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-full")}
          aria-label="Search cases on map"
        >
          <SearchIcon className="size-4" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 py-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {salutation()}
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight">{greetingName}</h1>
        </div>

        <UrgentBanner />
        <StatsGrid />

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Nearby cases</h2>
            <Link href="/map" className="text-sm font-bold text-primary hover:underline">
              Map view →
            </Link>
          </div>

          <Card className="gap-0 py-0 overflow-hidden">
            {NEARBY_CASES.map((dog, index) => (
              <CaseListRow key={dog.id} dog={dog} isLast={index === NEARBY_CASES.length - 1} />
            ))}
          </Card>
        </section>
      </main>
    </>
  )
}
