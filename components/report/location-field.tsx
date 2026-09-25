"use client"

import { CrosshairIcon, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const SAMPLE_COLOMBO_LOCATIONS = [
  "Galle Road, Bambalapitiya, Colombo 04",
  "Duplication Road, Kollupitiya, Colombo 03",
  "Bauddhaloka Mawatha, Colombo 07",
  "Vauxhall Street, Slave Island, Colombo 02",
]

type LocationFieldProps = {
  value: string
  onChange: (value: string) => void
}

export function LocationField({ value, onChange }: LocationFieldProps) {
  // Mock "Use my location": pick a sample Colombo address.
  function handleUseMyLocation() {
    const randomLoc =
      SAMPLE_COLOMBO_LOCATIONS[
        Math.floor(Math.random() * SAMPLE_COLOMBO_LOCATIONS.length)
      ]
    onChange(randomLoc)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-bold">
          <span className="flex items-center gap-2">
            <MapPinIcon className="size-4 text-primary" />
            Location in Colombo
          </span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleUseMyLocation}
            className="gap-1 text-primary hover:text-primary/80"
          >
            <CrosshairIcon className="size-3.5" />
            Use my location
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Input
          required
          placeholder="e.g. Galle Road near Majestic City, Bambalapitiya"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <p className="text-[11px] text-muted-foreground">
          Be as specific as possible (street name, nearby landmark or building).
        </p>
      </CardContent>
    </Card>
  )
}
