/**
 * Colour classes for a selectable pill/chip (filters, amounts, ETAs).
 * Combine with layout classes via `cn(...)` at the call site.
 */
export function selectableChipClass(active: boolean) {
  return active
    ? "border-primary bg-primary text-primary-foreground shadow-sm"
    : "border-border bg-card text-muted-foreground hover:bg-muted"
}
