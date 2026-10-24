import Link from "next/link"
import { XIcon } from "lucide-react"
import { StatusBadge } from "@/components/cases/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { RescueCase } from "@/lib/mock-data"
import { cn } from "cn"

interface SelectedCaseCardProps {
  dog: RescueCase
  onClose: () => void
}

/** Floating preview card for the pin the user tapped. */
export function SelectedCaseCard({ dog, onClose }: SelectedCaseCardProps) {
  return (
    <Card className="absolute inset-x-3 bottom-3 z-30 gap-0 shadow-2xl border-border bg-card/98 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
            <span className="text-2xl font-bold">{dog.name[0]}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-base font-bold">{dog.name}</strong>
                <StatusBadge status={dog.status} label={dog.statusLabel} />
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Close case preview"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{dog.blurb}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2.5 border-0 pt-0 bg-transparent">
        <Link
          href={`/cases/${dog.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
        >
          View profile
        </Link>
        {dog.actions.includes("respond") && (
          <Link
            href={`/cases/${dog.id}/respond`}
            className={cn(buttonVariants({ size: "sm" }), "flex-1")}
          >
            Respond
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
