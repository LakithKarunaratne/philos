import { auth, currentUser } from "@clerk/nextjs/server"
import { UserRole } from "@/generated/prisma/enums"
import {
  AuthorizationError,
  ensureCurrentDbUser,
  getCurrentDbUser,
  getCurrentDbUserId,
  getCurrentRole,
  hasRole,
  requireRole,
} from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { syncClerkUser } from "@/lib/user-sync"

jest.mock("@clerk/nextjs/server", () => ({ auth: jest.fn(), currentUser: jest.fn() }))
jest.mock("@/lib/user-sync", () => ({ syncClerkUser: jest.fn() }))
jest.mock("@/lib/prisma", () => ({ prisma: { user: { findFirst: jest.fn() } } }))

// `getCurrentDbUser` is wrapped in React's `cache`, which memoises per request.
// Jest has no request scope, so the memo would leak across tests — stub `cache`
// to the identity function and let each test control the mocked query itself.
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}))

type AuthResult = Awaited<ReturnType<typeof auth>>
type DbRow = { id: string; role: UserRole }

const mockAuth = jest.mocked(auth)
const mockCurrentUser = jest.mocked(currentUser)
const mockSyncClerkUser = jest.mocked(syncClerkUser)
const mockFindFirst = prisma.user.findFirst as unknown as jest.Mock<
  Promise<DbRow | null>,
  [{ where: { clerkId: string; deletedAt: null } }]
>

const CLERK_ID = "user_2abc"

function signedIn(userId: string | null): void {
  mockAuth.mockResolvedValue({ userId } as unknown as AuthResult)
}

function mirrored(role: UserRole): DbRow {
  return { id: "db-user-1", role }
}

beforeEach(() => {
  jest.clearAllMocks()
  signedIn(CLERK_ID)
})

describe("getCurrentDbUser", () => {
  it("looks the row up by clerkId, skipping soft-deleted rows", async () => {
    mockFindFirst.mockResolvedValue(mirrored(UserRole.REPORTER))

    await getCurrentDbUser()

    expect(mockFindFirst.mock.calls[0][0].where).toEqual({
      clerkId: CLERK_ID,
      deletedAt: null,
    })
  })

  it("returns null without querying when nobody is signed in", async () => {
    signedIn(null)

    await expect(getCurrentDbUser()).resolves.toBeNull()
    expect(mockFindFirst).not.toHaveBeenCalled()
  })

  it("never writes on a read path", async () => {
    mockFindFirst.mockResolvedValue(null)

    await getCurrentDbUser()

    expect(mockSyncClerkUser).not.toHaveBeenCalled()
  })

  it("exposes just the id for callers that only filter on it", async () => {
    mockFindFirst.mockResolvedValue(mirrored(UserRole.REPORTER))

    await expect(getCurrentDbUserId()).resolves.toBe("db-user-1")
  })
})

describe("ensureCurrentDbUser", () => {
  it("returns the existing row without mirroring again", async () => {
    mockFindFirst.mockResolvedValue(mirrored(UserRole.VOLUNTEER))

    await expect(ensureCurrentDbUser()).resolves.toEqual(mirrored(UserRole.VOLUNTEER))
    expect(mockSyncClerkUser).not.toHaveBeenCalled()
  })

  it("mirrors the Clerk user when no row exists yet", async () => {
    // Covers the window before the webhook lands, or a dropped delivery.
    mockFindFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(mirrored(UserRole.REPORTER))
    mockCurrentUser.mockResolvedValue({
      id: CLERK_ID,
      username: "ada",
      firstName: "Ada",
      lastName: "Lovelace",
      primaryEmailAddressId: "idn_1",
      emailAddresses: [{ id: "idn_1", emailAddress: "ada@example.com" }],
      primaryPhoneNumberId: null,
      phoneNumbers: [],
      publicMetadata: {},
    } as unknown as Awaited<ReturnType<typeof currentUser>>)

    await expect(ensureCurrentDbUser()).resolves.toEqual(mirrored(UserRole.REPORTER))

    expect(mockSyncClerkUser).toHaveBeenCalledTimes(1)
    // Clerk's resource is camelCase; the mirror speaks the webhook's snake_case.
    expect(mockSyncClerkUser.mock.calls[0][0]).toMatchObject({
      id: CLERK_ID,
      username: "ada",
      first_name: "Ada",
      last_name: "Lovelace",
      primary_email_address_id: "idn_1",
      email_addresses: [{ id: "idn_1", email_address: "ada@example.com" }],
    })
  })

  it("returns null when nobody is signed in", async () => {
    signedIn(null)

    await expect(ensureCurrentDbUser()).resolves.toBeNull()
    expect(mockSyncClerkUser).not.toHaveBeenCalled()
  })
})

describe("getCurrentRole / hasRole", () => {
  it("reads the role off the mirrored row, not the session token", async () => {
    mockFindFirst.mockResolvedValue(mirrored(UserRole.DISPATCHER))

    await expect(getCurrentRole()).resolves.toBe(UserRole.DISPATCHER)
  })

  it("is null when the user has not been mirrored", async () => {
    mockFindFirst.mockResolvedValue(null)

    await expect(getCurrentRole()).resolves.toBeNull()
    await expect(hasRole(UserRole.REPORTER)).resolves.toBe(false)
  })

  it("matches any of the roles it is given", async () => {
    mockFindFirst.mockResolvedValue(mirrored(UserRole.ADMIN))

    await expect(hasRole(UserRole.DISPATCHER, UserRole.ADMIN)).resolves.toBe(true)
  })

  it("is false for a role the user does not hold", async () => {
    mockFindFirst.mockResolvedValue(mirrored(UserRole.REPORTER))

    await expect(hasRole(UserRole.DISPATCHER, UserRole.ADMIN)).resolves.toBe(false)
  })
})

describe("requireRole", () => {
  it("returns the row for a user who holds the role", async () => {
    mockFindFirst.mockResolvedValue(mirrored(UserRole.DISPATCHER))

    await expect(requireRole(UserRole.DISPATCHER, UserRole.ADMIN)).resolves.toEqual(
      mirrored(UserRole.DISPATCHER)
    )
  })

  it("throws `unauthenticated` when nobody is signed in", async () => {
    signedIn(null)

    await expect(requireRole(UserRole.ADMIN)).rejects.toMatchObject({
      name: "AuthorizationError",
      reason: "unauthenticated",
    })
  })

  it("throws `forbidden` for a signed-in user without the role", async () => {
    mockFindFirst.mockResolvedValue(mirrored(UserRole.REPORTER))

    await expect(requireRole(UserRole.DISPATCHER, UserRole.ADMIN)).rejects.toBeInstanceOf(
      AuthorizationError
    )
  })

  it("refuses every role but the ones named", async () => {
    // The default role must not reach a dispatcher-only action.
    for (const role of [UserRole.REPORTER, UserRole.VOLUNTEER, UserRole.FOSTER]) {
      mockFindFirst.mockResolvedValue(mirrored(role))
      await expect(requireRole(UserRole.DISPATCHER, UserRole.ADMIN)).rejects.toMatchObject({
        reason: "forbidden",
      })
    }
  })

  it("mirrors a privileged user whose webhook has not landed yet", async () => {
    mockFindFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mirrored(UserRole.DISPATCHER))
    mockCurrentUser.mockResolvedValue({
      id: CLERK_ID,
      username: "dispatch",
      firstName: null,
      lastName: null,
      primaryEmailAddressId: null,
      emailAddresses: [],
      primaryPhoneNumberId: null,
      phoneNumbers: [],
      publicMetadata: { role: "DISPATCHER" },
    } as unknown as Awaited<ReturnType<typeof currentUser>>)

    await expect(requireRole(UserRole.DISPATCHER)).resolves.toEqual(
      mirrored(UserRole.DISPATCHER)
    )
  })
})
