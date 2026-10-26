import Link from "next/link"
import { TriangleAlertIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import type { UrgentSummary } from "@/lib/view-types"
import { cn } from "cn"

export function UrgentBanner({ urgent }: { urgent: UrgentSummary }) {
  if (urgent.count === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-foreground px-4 py-3.5 text-background">
      <TriangleAlertIcon className="size-6 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {urgent.count} urgent {urgent.count === 1 ? "case" : "cases"} nearby
        </p>
        <p className="text-sm text-background/75">
          Volunteers in Colombo needed for emergency transport.
        </p>
      </div>
      {urgent.respondSlug && (
        <Link
          href={`/cases/${urgent.respondSlug}/respond`}
          className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
        >
          Respond
        </Link>
      )}
    </div>
  )
}
