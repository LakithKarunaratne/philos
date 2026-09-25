"use client"

import { useState } from "react"
import { Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { INITIAL_CONTRIBUTIONS, type ContributionItem } from "@/lib/mock-data"

export function ContributionsSection() {
  const [contributions, setContributions] = useState<ContributionItem[]>(INITIAL_CONTRIBUTIONS)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Contributions</CardTitle>
          <CardDescription>Your recent rescue and volunteer activity.</CardDescription>
        </div>
        {contributions.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setContributions([])}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon className="size-3" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="gap-0 p-0">
        {contributions.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No past contributions recorded yet.
          </div>
        ) : (
          contributions.map((c, idx) => (
            <div key={c.id}>
              <div className="px-4 py-3">
                <p className="text-sm font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c.date} · {c.detail}
                </p>
              </div>
              {idx < contributions.length - 1 && <Separator />}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
