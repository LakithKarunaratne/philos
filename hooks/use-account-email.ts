import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import type { EmailAddressResource } from "@clerk/nextjs/types"
import { clerkErrorMessage } from "@/components/settings/clerk-error"
import { useSettingsFeedback } from "@/hooks/use-settings-feedback"

/**
 * Change the signed-in user's primary email through Clerk:
 * create the address, verify it with an emailed code, then make it primary.
 */
export function useAccountEmail() {
  const { user, isLoaded } = useUser()
  const saved = useSettingsFeedback()

  const [draft, setDraft] = useState<string | null>(null)
  const [pending, setPending] = useState<EmailAddressResource | null>(null)
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? ""
  const email = draft ?? primaryEmail

  async function run(action: () => Promise<void>, fallback: string) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(clerkErrorMessage(err, fallback))
    } finally {
      setBusy(false)
    }
  }

  function sendCode() {
    if (!user) return
    const next = email.trim()
    if (next.toLowerCase() === primaryEmail.toLowerCase()) {
      setError("That is already your email address.")
      return
    }
    return run(async () => {
      // Reuse an unverified address from an earlier attempt instead of failing on a duplicate.
      const existing = user.emailAddresses.find(
        (e) => e.emailAddress.toLowerCase() === next.toLowerCase()
      )
      const address = existing ?? (await user.createEmailAddress({ email: next }))
      await address.prepareVerification({ strategy: "email_code" })
      setPending(address)
      setCode("")
    }, "Could not send a verification code.")
  }

  function verifyCode() {
    if (!user || !pending) return
    return run(async () => {
      const verified = await pending.attemptVerification({ code: code.trim() })
      if (verified.verification.status !== "verified") {
        throw new Error("Verification incomplete")
      }
      await user.update({ primaryEmailAddressId: verified.id })
      setPending(null)
      setDraft(null)
      setCode("")
      saved.show()
    }, "That code did not work. Check it and try again.")
  }

  function cancel() {
    setPending(null)
    setCode("")
    setError(null)
  }

  return {
    isLoaded,
    email,
    setEmail: setDraft,
    pendingEmail: pending?.emailAddress ?? null,
    code,
    setCode,
    busy,
    error,
    saved: saved.visible,
    sendCode,
    verifyCode,
    cancel,
  }
}
