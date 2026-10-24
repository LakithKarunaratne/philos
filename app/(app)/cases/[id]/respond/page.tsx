import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { RespondCaseBanner } from "@/components/cases/respond-case-banner"
import { RespondForm } from "@/components/cases/respond-form"
import { NEARBY_CASES } from "@/lib/mock-data"

interface RespondPageProps {
  params: Promise<{ id: string }>
}

export default async function RespondEmergencyPage({ params }: RespondPageProps) {
  const { id } = await params
  const dog = NEARBY_CASES.find((c) => c.id === id)

  if (!dog) {
    notFound()
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <Link
          href={`/cases/${dog.id}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
        <span className="text-base font-bold truncate">Respond to {dog.name}</span>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 py-5 pb-24">
        <RespondCaseBanner dog={dog} />
        <RespondForm
          caseId={dog.id}
          caseName={dog.name}
          placeName={dog.locationName.split(",")[0]}
        />
      </main>
    </>
  )
}
