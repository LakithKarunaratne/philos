import { useState } from "react"

export interface FosterFormValues {
  name: string
  phone: string
  note: string
}

const EMPTY_FOSTER_FORM: FosterFormValues = { name: "", phone: "", note: "" }

/** State for the foster / adopt interest form: field values plus submitted flag. */
export function useFosterForm() {
  const [values, setValues] = useState<FosterFormValues>(EMPTY_FOSTER_FORM)
  const [submitted, setSubmitted] = useState(false)

  function setField(field: keyof FosterFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  /** Show the form again (keeps typed values, matching the original behaviour). */
  function reopen() {
    setSubmitted(false)
  }

  return { values, setField, submitted, submit, reopen }
}
