import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RescueCase } from "@/lib/mock-data"

export function CaseNotesCard({ name, notes }: { name: string; notes?: string }) {
  if (!notes) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">About {name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{notes}</p>
      </CardContent>
    </Card>
  )
}

export function CaseTemperamentCard({ traits }: { traits: RescueCase["temperament"] }) {
  if (!traits || traits.length === 0) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Temperament & Traits</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {traits.map((trait) => (
          <span
            key={trait}
            className="rounded-full bg-accent/70 px-3 py-1 text-xs font-semibold text-accent-foreground"
          >
            {trait}
          </span>
        ))}
      </CardContent>
    </Card>
  )
}

export function CaseHealthCard({ notes }: { notes: RescueCase["healthNotes"] }) {
  if (!notes || notes.length === 0) return null
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Medical & Health Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {notes.map((note) => (
          <div key={note} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{note}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
