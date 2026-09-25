import { notFound } from "next/navigation"
import { CaseActionBar } from "@/components/cases/case-action-bar"
import { CaseHealthCard, CaseNotesCard, CaseTemperamentCard } from "@/components/cases/case-detail-cards"
import { CaseHero, CaseQuickInfo } from "@/components/cases/case-hero"
import { CaseProfileHeader } from "@/components/cases/case-profile-header"
import { CaseTimeline } from "@/components/cases/case-timeline"
import { NEARBY_CASES } from "@/lib/mock-data"

interface CasePageProps {
  params: Promise<{ id: string }>
}

export default async function CaseProfilePage({ params }: CasePageProps) {
  const { id } = await params
  const dog = NEARBY_CASES.find((c) => c.id === id)

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

      <CaseActionBar caseId={dog.id} caseName={dog.name} />
    </>
  )
}
