"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { clerkErrorMessage } from "@/components/settings/clerk-error"
import { FormStatus } from "@/components/settings/form-status"

export function SignOutButton() {
  const router = useRouter()
  const { signOut } = useClerk()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignOut() {
    setBusy(true)
    setError(null)
    try {
      await signOut()
      router.push("/sign-in")
    } catch (err) {
      setError(clerkErrorMessage(err, "Could not sign out. Check your connection and try again."))
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 pt-2">
      <Button
        variant="destructive"
        className="w-full gap-2 font-bold"
        disabled={busy}
        onClick={handleSignOut}
      >
        <LogOutIcon className="size-4" />
        {busy ? "Signing out…" : "Sign Out"}
      </Button>
      <FormStatus error={error} />
    </div>
  )
}
