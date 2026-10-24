import { RotateCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MapEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute top-28 inset-x-4 z-20 flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/95 p-4 text-center shadow-lg backdrop-blur-sm">
      <p className="text-sm font-semibold">No cases match your filters</p>
      <p className="text-xs text-muted-foreground">Try clearing search or selecting other statuses.</p>
      <Button size="sm" variant="outline" onClick={onReset} className="mt-1 flex items-center gap-1.5">
        <RotateCcwIcon className="size-3.5" />
        Reset filters
      </Button>
    </div>
  )
}
