// Minimal form-field validation for server actions.
//
// Server actions are reachable directly over POST, so `FormData` is untrusted
// input and every action validates its own fields rather than trusting the
// form that rendered them. Kept dependency-free: the rules we need are a
// handful of string checks, so there is no case for pulling in a schema
// library yet.

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>

/** A trimmed string field, or "" when absent or not a string. */
export function readText(formData: FormData, field: string): string {
  const value = formData.get(field)
  return typeof value === "string" ? value.trim() : ""
}

/** Error message for a required field, or undefined when it passes. */
export function requiredText(
  value: string,
  label: string,
  maxLength: number
): string | undefined {
  if (value.length === 0) return `${label} is required.`
  if (value.length > maxLength) return `${label} must be ${maxLength} characters or fewer.`
  return undefined
}

/** Error message for an optional field, or undefined when it passes. */
export function optionalText(
  value: string,
  label: string,
  maxLength: number
): string | undefined {
  if (value.length > maxLength) return `${label} must be ${maxLength} characters or fewer.`
  return undefined
}

/** Drops the undefined entries so callers can test the result with a key count. */
export function collectErrors<Field extends string>(
  entries: Record<Field, string | undefined>
): FieldErrors<Field> {
  const errors: FieldErrors<Field> = {}
  for (const [field, message] of Object.entries(entries) as [Field, string | undefined][]) {
    if (message) errors[field] = message
  }
  return errors
}
