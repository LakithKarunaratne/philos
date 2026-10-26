import { UserRole } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import {
  displayNameOf,
  emailOf,
  fallbackUsername,
  phoneOf,
  roleFromMetadata,
  softDeleteClerkUser,
  syncClerkUser,
  uniqueUsername,
  type ClerkUserPayload,
} from "@/lib/user-sync"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { upsert: jest.fn(), updateMany: jest.fn() },
  },
}))

type UpsertArgs = {
  where: { clerkId: string }
  update: Record<string, unknown>
  create: Record<string, unknown>
}

const mockUpsert = prisma.user.upsert as unknown as jest.Mock<
  Promise<{ id: string }>,
  [UpsertArgs]
>
const mockUpdateMany = prisma.user.updateMany as unknown as jest.Mock

const CLERK_ID = "user_2abcdefghijklmnop"

function clerkUser(overrides: Partial<ClerkUserPayload> = {}): ClerkUserPayload {
  return {
    id: CLERK_ID,
    username: "ada",
    first_name: "Ada",
    last_name: "Lovelace",
    primary_email_address_id: "idn_primary",
    email_addresses: [
      { id: "idn_other", email_address: "other@example.com" },
      { id: "idn_primary", email_address: "ada@example.com" },
    ],
    ...overrides,
  }
}

/** Shaped like Prisma's known-request error, without loading its runtime. */
function uniqueViolation(): Error & { code: string } {
  return Object.assign(new Error("Unique constraint failed on the fields: (`username`)"), {
    code: "P2002",
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUpsert.mockResolvedValue({ id: "db-user-1" })
})

describe("roleFromMetadata", () => {
  it("reads a role Clerk's public metadata names", () => {
    expect(roleFromMetadata({ role: "DISPATCHER" })).toBe(UserRole.DISPATCHER)
  })

  it("forgives the case and spacing an operator types by hand", () => {
    expect(roleFromMetadata({ role: " dispatcher " })).toBe(UserRole.DISPATCHER)
  })

  it.each([
    ["no metadata", null],
    ["a non-object", "ADMIN"],
    ["metadata without a role", { plan: "pro" }],
    ["a non-string role", { role: 3 }],
  ])("returns null for %s", (_label, metadata) => {
    expect(roleFromMetadata(metadata)).toBeNull()
  })

  it("ignores an unrecognised role rather than guessing at it", () => {
    // A typo must not silently grant or drop access.
    expect(roleFromMetadata({ role: "DISPATHCER" })).toBeNull()
    expect(roleFromMetadata({ role: "SUPERUSER" })).toBeNull()
  })
})

describe("field mapping", () => {
  it("prefers the address Clerk marks primary", () => {
    expect(emailOf(clerkUser())).toBe("ada@example.com")
  })

  it("falls back to the first address when no primary is flagged", () => {
    expect(emailOf(clerkUser({ primary_email_address_id: null }))).toBe("other@example.com")
  })

  it("returns null when Clerk sent no addresses", () => {
    expect(emailOf(clerkUser({ email_addresses: [] }))).toBeNull()
    expect(phoneOf(clerkUser())).toBeNull()
  })

  it("reads the primary phone number", () => {
    const user = clerkUser({
      primary_phone_number_id: "idn_phone",
      phone_numbers: [{ id: "idn_phone", phone_number: "+94 77 000 0000" }],
    })
    expect(phoneOf(user)).toBe("+94 77 000 0000")
  })

  it("joins the name parts Clerk holds, or returns null for none", () => {
    expect(displayNameOf(clerkUser())).toBe("Ada Lovelace")
    expect(displayNameOf(clerkUser({ last_name: null }))).toBe("Ada")
    expect(displayNameOf(clerkUser({ first_name: null, last_name: null }))).toBeNull()
  })

  it("derives a collision-proof username from the Clerk id", () => {
    expect(fallbackUsername(CLERK_ID)).toBe("user_efghijklmnop")
  })
})

describe("syncClerkUser", () => {
  it("upserts on clerkId with the fields Clerk owns", async () => {
    await syncClerkUser(clerkUser())

    const [args] = mockUpsert.mock.calls[0]
    expect(args.where).toEqual({ clerkId: CLERK_ID })
    expect(args.create).toMatchObject({
      clerkId: CLERK_ID,
      username: "ada",
      email: "ada@example.com",
      displayName: "Ada Lovelace",
    })
  })

  it("returns the mirrored row's id", async () => {
    await expect(syncClerkUser(clerkUser())).resolves.toBe("db-user-1")
  })

  it("mirrors a role named in public metadata", async () => {
    await syncClerkUser(clerkUser({ public_metadata: { role: "ADMIN" } }))

    const [args] = mockUpsert.mock.calls[0]
    expect(args.create.role).toBe(UserRole.ADMIN)
    expect(args.update.role).toBe(UserRole.ADMIN)
  })

  it("leaves the role column alone when metadata names none", async () => {
    // A role granted directly in the DB must survive an unrelated profile edit.
    await syncClerkUser(clerkUser({ public_metadata: { plan: "pro" } }))

    const [args] = mockUpsert.mock.calls[0]
    expect(args.update).not.toHaveProperty("role")
    expect(args.create).not.toHaveProperty("role")
  })

  it("revives a soft-deleted row, since Clerk considers the account live", async () => {
    await syncClerkUser(clerkUser())

    expect(mockUpsert.mock.calls[0][0].update.deletedAt).toBeNull()
  })

  it("names a user who never set a Clerk handle after their id", async () => {
    await syncClerkUser(clerkUser({ username: null }))

    expect(mockUpsert.mock.calls[0][0].create.username).toBe(fallbackUsername(CLERK_ID))
    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })

  it("treats a blank handle as no handle", async () => {
    await syncClerkUser(clerkUser({ username: "   " }))

    expect(mockUpsert.mock.calls[0][0].create.username).toBe(fallbackUsername(CLERK_ID))
  })

  it("retries with the id-derived handle when the claimed one is taken", async () => {
    // The unique index spans soft-deleted rows, so a departed user can still
    // hold the handle. Losing the sync over a display detail is not acceptable.
    mockUpsert.mockRejectedValueOnce(uniqueViolation())

    await expect(syncClerkUser(clerkUser())).resolves.toBe("db-user-1")

    expect(mockUpsert).toHaveBeenCalledTimes(2)
    expect(mockUpsert.mock.calls[0][0].create.username).toBe("ada")
    expect(mockUpsert.mock.calls[1][0].create.username).toBe(fallbackUsername(CLERK_ID))
  })

  it("falls through to a suffixed handle when the id-derived one is taken too", async () => {
    // Clerk handles are user-chosen, so someone can claim the id-derived name
    // before its owner first syncs. Without this the upsert would throw, the
    // webhook would 500, and Clerk would retry it forever.
    mockUpsert.mockRejectedValueOnce(uniqueViolation()).mockRejectedValueOnce(uniqueViolation())

    await expect(syncClerkUser(clerkUser())).resolves.toBe("db-user-1")

    expect(mockUpsert).toHaveBeenCalledTimes(3)
    const last = mockUpsert.mock.calls[2][0].create.username as string
    expect(last).toMatch(new RegExp(`^${fallbackUsername(CLERK_ID)}_[0-9a-f]{8}$`))
  })

  it("retries a user with no Clerk handle whose derived name is taken", async () => {
    // This path skipped the collision handling entirely before — the first
    // write was not wrapped, so a taken name threw straight out.
    mockUpsert.mockRejectedValueOnce(uniqueViolation())

    await expect(syncClerkUser(clerkUser({ username: null }))).resolves.toBe("db-user-1")

    expect(mockUpsert).toHaveBeenCalledTimes(2)
    expect(mockUpsert.mock.calls[0][0].create.username).toBe(fallbackUsername(CLERK_ID))
    expect(mockUpsert.mock.calls[1][0].create.username).toMatch(
      new RegExp(`^${fallbackUsername(CLERK_ID)}_`)
    )
  })

  it("gives up when even the suffixed handle collides", async () => {
    mockUpsert.mockRejectedValue(uniqueViolation())

    await expect(syncClerkUser(clerkUser())).rejects.toMatchObject({ code: "P2002" })
    expect(mockUpsert).toHaveBeenCalledTimes(3)
  })

  it("mints a fresh suffix each time, so a retry does not collide again", () => {
    expect(uniqueUsername(CLERK_ID)).not.toBe(uniqueUsername(CLERK_ID))
    expect(uniqueUsername(CLERK_ID)).toMatch(
      new RegExp(`^${fallbackUsername(CLERK_ID)}_[0-9a-f]{8}$`)
    )
  })

  it("rethrows a failure that is not a unique violation", async () => {
    const outage = new Error("connection terminated")
    mockUpsert.mockRejectedValueOnce(outage)

    await expect(syncClerkUser(clerkUser())).rejects.toThrow(outage)
    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })
})

describe("softDeleteClerkUser", () => {
  it("stamps deletedAt rather than removing the row", async () => {
    await softDeleteClerkUser(CLERK_ID)

    const [args] = mockUpdateMany.mock.calls[0]
    expect(args.where).toEqual({ clerkId: CLERK_ID, deletedAt: null })
    expect(args.data.deletedAt).toBeInstanceOf(Date)
  })
})
