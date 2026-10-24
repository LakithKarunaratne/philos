import { AlertRow } from "@/components/alerts/alert-row"
import { Card } from "@/components/ui/card"
import type { AlertItem } from "@/lib/mock-data"

interface AlertGroupProps {
  title: string
  alerts: AlertItem[]
  onOpenAlert: (id: string) => void
}

/** A day heading plus its alerts; renders nothing when the group is empty. */
export function AlertGroup({ title, alerts, onOpenAlert }: AlertGroupProps) {
  if (alerts.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <Card className="gap-0 py-0 overflow-hidden">
        {alerts.map((alert, idx) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            isLast={idx === alerts.length - 1}
            onOpen={onOpenAlert}
          />
        ))}
      </Card>
    </section>
  )
}
