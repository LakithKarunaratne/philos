import { Card, CardContent } from "@/components/ui/card"
import type { CaseStats } from "@/lib/view-types"

export function StatsGrid({ stats }: { stats: CaseStats }) {
  const items = [
    { num: stats.active, label: "Active cases" },
    { num: stats.inFoster, label: "In foster care" },
    { num: stats.adoptedThisYear, label: "Adopted this year" },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((stat) => (
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
  )
}
