"use client"

import { KeyRoundIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormStatus } from "@/components/settings/form-status"
import { useAccountPassword } from "@/hooks/use-account-password"

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  autoComplete: "current-password" | "new-password"
  onChange: (value: string) => void
}

function PasswordField({ id, label, value, autoComplete, onChange }: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function PasswordSection() {
  const form = useAccountPassword()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void form.submit()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRoundIcon className="size-4 text-primary" />
          Password
        </CardTitle>
        <CardDescription>
          {form.hasPassword ? "Change your password." : "Set a password for your account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {form.hasPassword && (
            <PasswordField
              id="current-password"
              label="Current password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={form.setCurrentPassword}
            />
          )}
          <PasswordField
            id="new-password"
            label="New password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={form.setNewPassword}
          />
          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={form.setConfirmPassword}
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={form.busy || !form.isLoaded}
            className="self-start"
          >
            {form.busy ? "Updating…" : "Update password"}
          </Button>
          <FormStatus error={form.error} success={form.saved ? "Password updated." : null} />
        </form>
      </CardContent>
    </Card>
  )
}
