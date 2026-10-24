import Link from "next/link"
import { TriangleAlertIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { DEMO_CASE_ID } from "@/lib/constants"
import { cn } from "cn"

export function UrgentBanner() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-foreground px-4 py-3.5 text-background">
      <TriangleAlertIcon className="size-6 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">2 urgent cases nearby</p>
        <p className="text-sm text-background/75">
          Volunteers in Colombo needed for emergency transport.
        </p>
      </div>
      <Link
        href={`/cases/${DEMO_CASE_ID}/respond`}
        className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
      >
        Respond
      </Link>
    </div>
  )
}
