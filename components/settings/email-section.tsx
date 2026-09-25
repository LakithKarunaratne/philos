"use client"

import { MailIcon } from "lucide-react"
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
import { useAccountEmail } from "@/hooks/use-account-email"

type EmailForm = ReturnType<typeof useAccountEmail>

function submitWith(action: () => unknown) {
  return (e: React.FormEvent) => {
    e.preventDefault()
    void action()
  }
}

function EmailAddressForm({ form }: { form: EmailForm }) {
  return (
    <form onSubmit={submitWith(form.sendCode)} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          required
          disabled={!form.isLoaded}
          value={form.email}
          onChange={(e) => form.setEmail(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={form.busy || !form.isLoaded}
        className="self-start"
      >
        {form.busy ? "Sending code…" : "Save email"}
      </Button>
      <FormStatus error={form.error} success={form.saved ? "Saved!" : null} />
    </form>
  )
}

function EmailCodeForm({ form }: { form: EmailForm }) {
  return (
    <form onSubmit={submitWith(form.verifyCode)} className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Check your inbox. We sent a code to <strong>{form.pendingEmail}</strong>.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-code">Verification code</Label>
        <Input
          id="email-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={form.code}
          onChange={(e) => form.setCode(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" variant="outline" size="sm" disabled={form.busy}>
          {form.busy ? "Verifying…" : "Verify and save"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={form.cancel}>
          Cancel
        </Button>
      </div>
      <FormStatus error={form.error} />
    </form>
  )
}

export function EmailSection() {
  const form = useAccountEmail()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailIcon className="size-4 text-primary" />
          Email
        </CardTitle>
        <CardDescription>The address used for account and rescue alerts.</CardDescription>
      </CardHeader>
      <CardContent>
        {form.pendingEmail ? <EmailCodeForm form={form} /> : <EmailAddressForm form={form} />}
      </CardContent>
    </Card>
  )
}
