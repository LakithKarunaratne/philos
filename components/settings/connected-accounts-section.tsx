import { AppleIcon, ShieldCheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const PROVIDERS = [
  { id: "google", name: "Google", icon: <span className="text-sm font-bold">G</span> },
  { id: "apple", name: "Apple", icon: <AppleIcon className="size-4" /> },
]

/** Social sign-in is out of scope for this pass (see spec non-goals), so these are honest placeholders. */
export function ConnectedAccountsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheckIcon className="size-4 text-primary" />
          Connected accounts
        </CardTitle>
        <CardDescription>Fast sign-in with third-party providers.</CardDescription>
      </CardHeader>
      <CardContent className="gap-0 p-0">
        {PROVIDERS.map((provider, idx) => (
          <div key={provider.id}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-secondary text-foreground">
                  {provider.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold">{provider.name}</p>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs" disabled>
                Connect
              </Button>
            </div>
            {idx < PROVIDERS.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
