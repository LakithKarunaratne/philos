import { ConnectedAccountsSection } from "@/components/settings/connected-accounts-section"
import { ContributionsSection } from "@/components/settings/contributions-section"
import { DonationSection } from "@/components/settings/donation-section"
import { EmailSection } from "@/components/settings/email-section"
import { PasswordSection } from "@/components/settings/password-section"
import { SignOutButton } from "@/components/settings/sign-out-button"

export default function SettingsPage() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground">Account and preferences</p>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-5 pb-24">
        <EmailSection />
        <PasswordSection />
        <ConnectedAccountsSection />
        <ContributionsSection />
        <DonationSection />
        <SignOutButton />
      </main>
    </>
  )
}
