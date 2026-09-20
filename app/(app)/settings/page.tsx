"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClerk, useUser } from "@clerk/nextjs"
import {
  AppleIcon,
  CheckCircle2Icon,
  HeartIcon,
  KeyRoundIcon,
  LogOutIcon,
  MailIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  INITIAL_CONTRIBUTIONS,
  type ContributionItem,
} from "@/lib/mock-data"
import { cn } from "cn"

const DONATION_PRESETS = [5, 15, 50]

export default function SettingsPage() {
  const router = useRouter()
  const { signOut } = useClerk()
  const { user, isLoaded } = useUser()

  const [customEmail, setCustomEmail] = useState<string | null>(null)
  const [emailSaved, setEmailSaved] = useState(false)

  const email =
    customEmail ??
    (isLoaded && user?.primaryEmailAddress?.emailAddress
      ? user.primaryEmailAddress.emailAddress
      : "alex@example.com")

  const [passwordResetSent, setPasswordResetSent] = useState(false)

  const [contributions, setContributions] = useState<ContributionItem[]>(
    INITIAL_CONTRIBUTIONS
  )

  const [selectedDonation, setSelectedDonation] = useState<number>(15)
  const [customDonation, setCustomDonation] = useState<string>("")
  const [donationDialogOpen, setDonationDialogOpen] = useState(false)

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      // If Clerk is not reachable, still redirect
    }
    router.push("/sign-in")
  }

  function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailSaved(true)
    setTimeout(() => setEmailSaved(false), 3000)
  }

  function handleResetPassword() {
    setPasswordResetSent(true)
    setTimeout(() => setPasswordResetSent(false), 5000)
  }

  function handleClearContributions() {
    setContributions([])
  }

  const finalDonationAmount =
    customDonation.trim() !== "" ? Number(customDonation) : selectedDonation

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground">Account and preferences</p>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-5 pb-24">
        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailIcon className="size-4 text-primary" />
              Email
            </CardTitle>
            <CardDescription>The address used for account and rescue alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveEmail} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setCustomEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Button type="submit" variant="outline" size="sm">
                  Save email
                </Button>
                {emailSaved && (
                  <span className="flex items-center gap-1 text-xs text-primary font-medium animate-in fade-in">
                    <CheckCircle2Icon className="size-3.5" /> Saved!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Reset */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRoundIcon className="size-4 text-primary" />
              Password
            </CardTitle>
            <CardDescription>Send a reset link to your email address.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetPassword}
              className="self-start"
            >
              Reset password
            </Button>
            {passwordResetSent && (
              <p className="text-xs text-primary font-medium animate-in fade-in">
                ✓ Password reset instructions dispatched to {email}.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4 text-primary" />
              Connected accounts
            </CardTitle>
            <CardDescription>Fast sign-in with third-party providers.</CardDescription>
          </CardHeader>
          <CardContent className="gap-0 p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-bold text-foreground">
                  G
                </span>
                <div>
                  <p className="text-sm font-semibold">Google</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                Disconnect
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-secondary">
                  <AppleIcon className="size-4 text-foreground" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Apple</p>
                  <p className="text-xs text-muted-foreground">Not connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contributions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Contributions</CardTitle>
              <CardDescription>Your recent rescue and volunteer activity.</CardDescription>
            </div>
            {contributions.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleClearContributions}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2Icon className="size-3" />
                Clear
              </Button>
            )}
          </CardHeader>
          <CardContent className="gap-0 p-0">
            {contributions.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No past contributions recorded yet.
              </div>
            ) : (
              contributions.map((c, idx) => (
                <div key={c.id}>
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.date} · {c.detail}
                    </p>
                  </div>
                  {idx < contributions.length - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Donate */}
        <Card className="border-primary/30 bg-accent/30 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartIcon className="size-4 text-primary fill-primary/20" />
              Donate to Philos
            </CardTitle>
            <CardDescription>
              Directly funds emergency vet clinic bills, recovery food, and medical supplies in Colombo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {DONATION_PRESETS.map((amt) => {
                const isSelected = selectedDonation === amt && customDonation === ""
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedDonation(amt)
                      setCustomDonation("")
                    }}
                    className={cn(
                      "flex-1 rounded-xl border py-2 text-xs font-bold transition-all",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    )}
                  >
                    ${amt}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-donation" className="text-xs text-muted-foreground shrink-0">
                Custom ($)
              </Label>
              <Input
                id="custom-donation"
                type="number"
                min="1"
                placeholder="Other amount"
                value={customDonation}
                onChange={(e) => setCustomDonation(e.target.value)}
                className="h-8 text-xs bg-card"
              />
            </div>
            <Button
              className="w-full font-bold shadow-md"
              onClick={() => setDonationDialogOpen(true)}
            >
              Donate ${finalDonationAmount || 15}
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out Action */}
        <div className="pt-2">
          <Button
            variant="destructive"
            className="w-full gap-2 font-bold"
            onClick={handleSignOut}
          >
            <LogOutIcon className="size-4" />
            Sign Out
          </Button>
        </div>
      </main>

      {/* Donation Thank You Dialog */}
      <Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen}>
        <DialogContent>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-primary/20 text-primary">
              <HeartIcon className="size-8 fill-primary" />
            </span>
            <DialogTitle className="text-xl">Thank you for your support!</DialogTitle>
            <DialogDescription className="max-w-xs text-sm">
              Your mock donation of <strong>${finalDonationAmount || 15}</strong> helps provide food, veterinary care, and emergency response for street dogs across Colombo.
            </DialogDescription>
            <Button
              className="mt-3 w-full"
              onClick={() => setDonationDialogOpen(false)}
            >
              Back to Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
