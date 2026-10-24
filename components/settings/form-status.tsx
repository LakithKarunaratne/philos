import { CheckCircle2Icon } from "lucide-react"

interface FormStatusProps {
  error?: string | null
  success?: string | null
}

/** Inline error / success line shared by the settings forms. */
export function FormStatus({ error, success }: FormStatusProps) {
  if (error) {
    return (
      <p role="alert" className="text-xs font-medium text-destructive">
        {error}
      </p>
    )
  }
  if (success) {
    return (
      <p
        role="status"
        className="flex items-center gap-1 text-xs font-medium text-primary animate-in fade-in"
      >
        <CheckCircle2Icon className="size-3.5" /> {success}
      </p>
    )
  }
  return null
}
