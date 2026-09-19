import Link from "next/link"
import { ChevronRightIcon, PawPrintIcon, SearchIcon, TriangleAlertIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DISPLAY_NAME, NEARBY_CASES } from "@/lib/mock-data"
import { cn } from "cn"

function salutation() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function statusVariant(status: string) {
  if (status === "reported") return "destructive" as const
  if (status === "foster") return "default" as const
  return "secondary" as const
}

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <div className="flex flex-1 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <PawPrintIcon className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">Philos</span>
        </div>
        <Button variant="outline" size="icon" aria-label="Search cases" className="rounded-full">
          <SearchIcon />
        </Button>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 py-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {salutation()}
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight">{DISPLAY_NAME}</h1>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-foreground px-4 py-3.5 text-background">
          <TriangleAlertIcon className="size-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">2 urgent cases nearby</p>
            <p className="text-sm text-background/75">
              Volunteers within 3 km are needed for transport.
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            nativeButton={false}
            render={<Link href="/map" />}
          >
            View
          </Button>
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

          <Card className="gap-0 py-0">
            {NEARBY_CASES.map((dog, index) => (
              <Link
                key={dog.id}
                href="#"
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 text-inherit no-underline transition-colors hover:bg-muted/50",
                  index < NEARBY_CASES.length - 1 && "border-b border-border"
                )}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <PawPrintIcon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{dog.name}</span>
                    <Badge variant={statusVariant(dog.status)}>{dog.statusLabel}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{dog.detail}</p>
                </div>
                <ChevronRightIcon className="size-4.5 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </Card>
        </section>
      </main>
    </>
  )
}
