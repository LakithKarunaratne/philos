/**
 * Route handlers run on the Web `Request`/`Response` APIs, which jsdom does not
 * provide. Node supplies both.
 *
 * @jest-environment node
 */
import { verifyWebhook } from "@clerk/nextjs/webhooks"
import { POST } from "@/app/api/webhooks/clerk/route"
import { softDeleteClerkUser, syncClerkUser } from "@/lib/user-sync"

jest.mock("@clerk/nextjs/webhooks", () => ({ verifyWebhook: jest.fn() }))
jest.mock("@/lib/user-sync", () => ({
  syncClerkUser: jest.fn(),
  softDeleteClerkUser: jest.fn(),
}))

const mockVerify = jest.mocked(verifyWebhook)
const mockSync = jest.mocked(syncClerkUser)
const mockSoftDelete = jest.mocked(softDeleteClerkUser)

type Event = Awaited<ReturnType<typeof verifyWebhook>>

const CLERK_ID = "user_2abc"

const USER_PAYLOAD = {
  id: CLERK_ID,
  username: "ada",
  first_name: "Ada",
  last_name: "Lovelace",
  email_addresses: [{ id: "idn_1", email_address: "ada@example.com" }],
  primary_email_address_id: "idn_1",
  public_metadata: { role: "DISPATCHER" },
}

function delivers(event: unknown): void {
  mockVerify.mockResolvedValue(event as Event)
}

/** The handler never reads the body itself — `verifyWebhook` is mocked. */
function request(): Parameters<typeof POST>[0] {
  return new Request("https://philos.test/api/webhooks/clerk", {
    method: "POST",
  }) as Parameters<typeof POST>[0]
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSync.mockResolvedValue("db-user-1")
  mockSoftDelete.mockResolvedValue(undefined)
})

describe("POST /api/webhooks/clerk", () => {
  it("rejects a request Clerk did not sign, and writes nothing", async () => {
    mockVerify.mockRejectedValue(new Error("No matching signature found"))

    const response = await POST(request())

    expect(response.status).toBe(400)
    expect(mockSync).not.toHaveBeenCalled()
    expect(mockSoftDelete).not.toHaveBeenCalled()
  })

  it("does not leak the verification failure to the caller", async () => {
    // The message names headers and whether the signing secret is configured.
    mockVerify.mockRejectedValue(new Error("CLERK_WEBHOOK_SIGNING_SECRET is missing"))

    const response = await POST(request())

    await expect(response.text()).resolves.not.toContain("SIGNING_SECRET")
  })

  it.each(["user.created", "user.updated"])("mirrors the user on %s", async (type) => {
    delivers({ type, data: USER_PAYLOAD })

    const response = await POST(request())

    expect(response.status).toBe(204)
    expect(mockSync).toHaveBeenCalledWith(USER_PAYLOAD)
  })

  it("soft-deletes the mirrored row on user.deleted", async () => {
    delivers({ type: "user.deleted", data: { id: CLERK_ID, deleted: true } })

    const response = await POST(request())

    expect(response.status).toBe(204)
    expect(mockSoftDelete).toHaveBeenCalledWith(CLERK_ID)
    expect(mockSync).not.toHaveBeenCalled()
  })

  it("acknowledges a user.deleted that carries no id", async () => {
    // `id` is optional on Clerk's deleted-object payload.
    delivers({ type: "user.deleted", data: { deleted: true } })

    const response = await POST(request())

    expect(response.status).toBe(204)
    expect(mockSoftDelete).not.toHaveBeenCalled()
  })

  it("acknowledges an event type it does not handle, so Clerk stops retrying", async () => {
    delivers({ type: "session.created", data: { id: "sess_1" } })

    const response = await POST(request())

    expect(response.status).toBe(204)
    expect(mockSync).not.toHaveBeenCalled()
    expect(mockSoftDelete).not.toHaveBeenCalled()
  })

  it("asks Clerk to retry when the write fails", async () => {
    // A 5xx is what keeps a transient outage from losing the sync silently.
    mockSync.mockRejectedValue(new Error("connection terminated"))
    delivers({ type: "user.created", data: USER_PAYLOAD })

    const response = await POST(request())

    expect(response.status).toBe(500)
  })
})
