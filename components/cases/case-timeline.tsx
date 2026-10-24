import { CheckCircle2Icon, CircleDotIcon, CircleIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimelineStep } from "@/lib/mock-data"
import { cn } from "cn"

function StepIcon({ status }: { status: TimelineStep["status"] }) {
  if (status === "completed") return <CheckCircle2Icon className="size-5 text-primary" />
  if (status === "current") return <CircleDotIcon className="size-5 text-primary animate-pulse" />
  return <CircleIcon className="size-5 text-muted-foreground/40" />
}

function TimelineRow({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
  return (
    <div className="relative flex items-start gap-3">
      {!isLast && (
        <span
          aria-hidden
          className={cn(
            "absolute top-5 left-2.5 -bottom-3 w-0.5",
            step.status === "completed" ? "bg-primary" : "bg-border"
          )}
        />
      )}
      <span className="relative z-10 grid size-5 shrink-0 place-items-center rounded-full bg-background mt-0.5">
        <StepIcon status={step.status} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold",
            step.status === "current" && "text-primary",
            step.status === "pending" && "text-muted-foreground"
          )}
        >
          {step.label}
        </p>
        <p className="text-xs text-muted-foreground">{step.date}</p>
      </div>
    </div>
  )
}

interface CaseTimelineProps {
  steps: TimelineStep[]
}

export function CaseTimeline({ steps }: CaseTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Rescue & Care Tracker</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <TimelineRow key={step.label} step={step} isLast={index === steps.length - 1} />
        ))}
      </CardContent>
    </Card>
  )
}
