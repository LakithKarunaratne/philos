import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { clerkErrorMessage } from "@/components/settings/clerk-error"
import { useSettingsFeedback } from "@/hooks/use-settings-feedback"

/** Change (or first set) the signed-in user's password through Clerk. */
export function useAccountPassword() {
  const { user, isLoaded } = useUser()
  const saved = useSettingsFeedback()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasPassword = user?.passwordEnabled ?? false

  async function submit() {
    if (!user) return
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      await user.updatePassword({
        newPassword,
        currentPassword: hasPassword ? currentPassword : undefined,
        signOutOfOtherSessions: true,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      saved.show()
    } catch (err) {
      setError(clerkErrorMessage(err, "Could not update your password."))
    } finally {
      setBusy(false)
    }
  }

  return {
    isLoaded,
    hasPassword,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    busy,
    error,
    saved: saved.visible,
    submit,
  }
}
