import { notFound } from "next/navigation"
import { CaseActionBar } from "@/components/cases/case-action-bar"
import { CaseHealthCard, CaseNotesCard, CaseTemperamentCard } from "@/components/cases/case-detail-cards"
import { CaseHero, CaseQuickInfo } from "@/components/cases/case-hero"
import { CaseProfileHeader } from "@/components/cases/case-profile-header"
import { CaseTimeline } from "@/components/cases/case-timeline"
import { getCaseBySlug } from "@/lib/queries/cases"

interface CasePageProps {
  params: Promise<{ id: string }>
}

// The DB is not reachable at build time, so render per request.
export const dynamic = "force-dynamic"

export default async function CaseProfilePage({ params }: CasePageProps) {
  const { id } = await params
  const dog = await getCaseBySlug(id)

  if (!dog) {
    notFound()
  }

  return (
    <>
      <CaseProfileHeader caseName={dog.name} />

      <main className="flex flex-1 flex-col gap-5 px-4 py-5 pb-24">
        <CaseHero dog={dog} />
        <CaseQuickInfo dog={dog} />
        <CaseNotesCard name={dog.name} notes={dog.notes} />
        <CaseTimeline steps={dog.timelineSteps} />
        <CaseTemperamentCard traits={dog.temperament} />
        <CaseHealthCard notes={dog.healthNotes} />
      </main>

      <CaseActionBar caseSlug={dog.id} caseName={dog.name} />
    </>
  )
}
