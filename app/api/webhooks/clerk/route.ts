// Clerk user webhook (PHI-13).
//
// Clerk POSTs here on `user.created`, `user.updated` and `user.deleted`, and
// this keeps the `users` mirror in step — including the role an operator sets
// in Clerk's dashboard (see lib/user-sync.ts).
//
// The route is public in proxy.ts because Clerk calls it without a session;
// `verifyWebhook` is what authenticates it, checking the Standard Webhooks
// signature against CLERK_WEBHOOK_SIGNING_SECRET. Without that secret set,
// verification fails and nothing is written, so the endpoint is never an
// unauthenticated write path.

import type { NextRequest } from "next/server"
import { verifyWebhook } from "@clerk/nextjs/webhooks"
import { softDeleteClerkUser, syncClerkUser } from "@/lib/user-sync"

export async function POST(request: NextRequest): Promise<Response> {
  let event: Awaited<ReturnType<typeof verifyWebhook>>

  try {
    event = await verifyWebhook(request)
  } catch {
    // Never echo the verification error — it names headers and the secret's
    // configuration state. Clerk does not retry a 400, which is what we want
    // for a request that was not signed by Clerk.
    return new Response("Invalid webhook signature", { status: 400 })
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await syncClerkUser(event.data)
        break

      case "user.deleted":
        // `id` is optional on Clerk's deleted-object payload.
        if (event.data.id) await softDeleteClerkUser(event.data.id)
        break

      default:
        // Clerk delivers whatever the endpoint is subscribed to; acknowledge
        // the rest so it is not retried forever.
        break
    }
  } catch (error) {
    // Only a correctly signed delivery reaches here, so logging cannot be
    // spammed from outside. Clerk's dashboard records the 500 but not its
    // cause, and the response must not carry one — without this line a
    // schema mismatch and a dropped connection look identical.
    console.error("[clerk-webhook] failed to process", event.type, error)

    // A 5xx asks Clerk to retry, which is right for a transient database
    // failure — the alternative is a user row that silently never syncs.
    return new Response("Failed to process webhook", { status: 500 })
  }

  return new Response(null, { status: 204 })
}
