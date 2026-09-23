import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { CaseShareButton } from "@/components/cases/case-share-button"

interface CaseProfileHeaderProps {
  caseName: string
}

export function CaseProfileHeader({ caseName }: CaseProfileHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </Link>
      <span className="text-base font-bold">{caseName}</span>
      <CaseShareButton caseName={caseName} />
    </header>
  )
}
