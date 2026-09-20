import Link from "next/link"
import { PawPrintIcon, SearchIcon, TriangleAlertIcon } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { currentUser } from "@clerk/nextjs/server"
import { CaseListRow } from "@/components/cases/case-list-row"
import { DISPLAY_NAME, NEARBY_CASES } from "@/lib/mock-data"
import { cn } from "cn"
import { Show } from "@clerk/nextjs"

function salutation() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default async function HomePage() {
  let user = null
  try {
    user = await currentUser()
  } catch {
    // If Clerk is not configured or in offline mode, fall back to mock name
    user = null
  }

  const greetingName = user?.firstName || user?.username || DISPLAY_NAME

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <div className="flex flex-1 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <PawPrintIcon className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">Philos</span>
        </div>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">Sign in</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">Sign up</Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
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

        <div className="flex items-center gap-3 rounded-2xl bg-foreground px-4 py-3.5 text-background">
          <TriangleAlertIcon className="size-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">2 urgent cases nearby</p>
            <p className="text-sm text-background/75">
              Volunteers in Colombo needed for emergency transport.
            </p>
          </div>
          <Link
            href="/cases/bruno/respond"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
          >
            Respond
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { num: "14", label: "Active cases" },
            { num: "6", label: "In foster care" },
            { num: "31", label: "Adopted this year" },
          ].map((stat) => (
            <Card key={stat.label} size="sm" className="items-center py-3 text-center">
              <CardContent className="px-2">
                <div className="text-xl font-bold">{stat.num}</div>
                <div className="mt-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Nearby cases</h2>
            <Link href="/map" className="text-sm font-bold text-primary hover:underline">
              Map view →
            </Link>
          </div>

          <Card className="gap-0 py-0 overflow-hidden">
            {NEARBY_CASES.map((dog, index) => (
              <CaseListRow
                key={dog.id}
                dog={dog}
                isLast={index === NEARBY_CASES.length - 1}
              />
            ))}
          </Card>
        </section>
      </main>
    </>
  )
}
