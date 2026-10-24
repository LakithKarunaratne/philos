import Link from "next/link"
import { FosterInterestDialog } from "@/components/cases/foster-interest-dialog"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

interface CaseActionBarProps {
  caseId: string
  caseName: string
}

export function CaseActionBar({ caseId, caseName }: CaseActionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 mx-auto w-full max-w-lg border-t border-border bg-card/95 p-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <FosterInterestDialog caseName={caseName} />
        <Link href={`/cases/${caseId}/respond`} className={cn(buttonVariants(), "flex-1")}>
          Respond / Help
        </Link>
      </div>
    </div>
  )
}
