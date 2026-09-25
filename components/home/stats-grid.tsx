import { Card, CardContent } from "@/components/ui/card"

// Prototype figures until case counts come from the backend.
const HOME_STATS = [
  { num: "14", label: "Active cases" },
  { num: "6", label: "In foster care" },
  { num: "31", label: "Adopted this year" },
]

export function StatsGrid() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {HOME_STATS.map((stat) => (
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
