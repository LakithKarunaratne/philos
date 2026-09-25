import { CASE_STATUSES, STATUS_META } from "@/lib/constants"

export function StatusLegend() {
  return (
    <div className="absolute bottom-24 left-3 z-10 flex flex-col gap-1 rounded-xl bg-card/95 px-3 py-2 text-[11px] font-semibold text-muted-foreground shadow-md ring-1 ring-border/50 backdrop-blur-xs">
      {CASE_STATUSES.map((status) => (
        <span key={status} className="flex items-center gap-1.5">
          <i className={`size-2 rounded-full ${STATUS_META[status].dotClass}`} />{" "}
          {STATUS_META[status].label}
        </span>
      ))}
    </div>
  )
}
