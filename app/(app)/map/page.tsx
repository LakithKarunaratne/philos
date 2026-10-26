import { RescueMap } from "@/components/map/rescue-map"
import { listCases } from "@/lib/queries/cases"

// The DB is not reachable at build time, so render per request.
export const dynamic = "force-dynamic"

export default async function MapPage() {
  const cases = await listCases()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <RescueMap cases={cases} />
    </div>
  )
}
