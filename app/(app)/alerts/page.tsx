import { AlertsFeed } from "@/components/alerts/alerts-feed"
import { getCurrentDbUserId } from "@/lib/auth"
import { listAlerts } from "@/lib/queries/alerts"

// The DB is not reachable at build time, so this must render per request.
export const dynamic = "force-dynamic"

export default async function AlertsPage() {
  const userId = await getCurrentDbUserId()
  const alerts = await listAlerts(userId)

  return <AlertsFeed alerts={alerts} />
}
