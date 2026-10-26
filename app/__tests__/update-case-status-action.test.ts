import { revalidatePath } from "next/cache"
import { CaseStatus, UserRole } from "@/generated/prisma/enums"
import { AuthorizationError, requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateCaseStatus } from "@/app/(app)/cases/[id]/actions"
import {
  CASE_STATUS_IDLE,
  CASE_STATUS_ROLES,
} from "@/app/(app)/cases/[id]/status-options"

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }))
jest.mock("@clerk/nextjs/server", () => ({ auth: jest.fn() }))
jest.mock("@/lib/auth", () => {
  const actual = jest.requireActual("@/lib/auth")
  return { ...actual, requireRole: jest.fn(), ensureCurrentDbUser: jest.fn() }
})
jest.mock("@/lib/prisma", () => ({
  prisma: {
    rescueCase: { findFirst: jest.fn(), update: jest.fn() },
    caseStatusEvent: { create: jest.fn() },
    caseInterest: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}))

const mockRequireRole = jest.mocked(requireRole)
const mockRevalidatePath = jest.mocked(revalidatePath)
const mockFindFirst = prisma.rescueCase.findFirst as unknown as jest.Mock<
  Promise<{ id: string; status: CaseStatus } | null>,
  [{ where: { slug: string; deletedAt: null } }]
>
const mockTransaction = prisma.$transaction as unknown as jest.Mock
const mockUpdate = prisma.rescueCase.update as unknown as jest.Mock
const mockCreateEvent = prisma.caseStatusEvent.create as unknown as jest.Mock

const SLUG = "bruno"
const DISPATCHER = { id: "db-user-1", role: UserRole.DISPATCHER }

function buildForm(fields: Record<string, string>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) formData.set(key, value)
  return formData
}

function submit(fields: Record<string, string> = { status: CaseStatus.RESCUED }) {
  return updateCaseStatus(SLUG, CASE_STATUS_IDLE, buildForm(fields))
}

function expectNothingWritten(): void {
  expect(mockTransaction).not.toHaveBeenCalled()
  expect(mockRevalidatePath).not.toHaveBeenCalled()
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRequireRole.mockResolvedValue(DISPATCHER as Awaited<ReturnType<typeof requireRole>>)
  mockFindFirst.mockResolvedValue({ id: "case-1", status: CaseStatus.REPORTED })
  mockTransaction.mockResolvedValue([])
})

describe("role enforcement", () => {
  it("is restricted to dispatchers and admins", () => {
    expect(CASE_STATUS_ROLES).toEqual([UserRole.DISPATCHER, UserRole.ADMIN])
  })

  it("checks the role on every call", async () => {
    await submit()

    expect(mockRequireRole).toHaveBeenCalledWith(UserRole.DISPATCHER, UserRole.ADMIN)
  })

  it("refuses a signed-in user without the role, and writes nothing", async () => {
    // The hidden control is not the boundary — this action is a POST endpoint
    // anyone can call directly.
    mockRequireRole.mockRejectedValue(new AuthorizationError("forbidden"))

    const result = await submit()

    expect(result.status).toBe("error")
    expect(result.message).toBe("You do not have permission to do that.")
    expectNothingWritten()
  })

  it("refuses an unauthenticated caller, and writes nothing", async () => {
    mockRequireRole.mockRejectedValue(new AuthorizationError("unauthenticated"))

    const result = await submit()

    expect(result.status).toBe("error")
    expect(result.message).toBe("Sign in to continue.")
    expectNothingWritten()
  })

  it("lets an unexpected failure bubble rather than reporting a tidy error", async () => {
    const outage = new Error("connection terminated")
    mockRequireRole.mockRejectedValue(outage)

    await expect(submit()).rejects.toThrow(outage)
  })

  it("checks the role before touching the database", async () => {
    mockRequireRole.mockRejectedValue(new AuthorizationError("forbidden"))

    await submit()

    expect(mockFindFirst).not.toHaveBeenCalled()
  })
})

describe("input validation", () => {
  it.each([
    ["a missing status", {}],
    ["a status that is not a stage", { status: "DELETED" }],
    ["a lowercase status", { status: "rescued" }],
    ["a prototype key posted as a status", { status: "constructor" }],
  ])("rejects %s", async (_label, fields) => {
    const result = await submit(fields as Record<string, string>)

    expect(result.status).toBe("error")
    expectNothingWritten()
    expect(mockRequireRole).not.toHaveBeenCalled()
  })

  it("rejects a note longer than the column expects", async () => {
    const result = await submit({ status: CaseStatus.RESCUED, note: "x".repeat(201) })

    expect(result.status).toBe("error")
    expectNothingWritten()
  })
})

describe("the transition", () => {
  it("moves the case and logs the event in one transaction", async () => {
    const result = await submit({ status: CaseStatus.RESCUED, note: "Collected by transport" })

    expect(result.status).toBe("success")
    expect(mockTransaction).toHaveBeenCalledTimes(1)

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "case-1" },
      data: { status: CaseStatus.RESCUED },
    })
    expect(mockCreateEvent).toHaveBeenCalledWith({
      data: {
        caseId: "case-1",
        status: CaseStatus.RESCUED,
        note: "Collected by transport",
        actorId: DISPATCHER.id,
      },
    })
  })

  it("attributes the event to the dispatcher who made it", async () => {
    mockRequireRole.mockResolvedValue({
      id: "db-admin-9",
      role: UserRole.ADMIN,
    } as Awaited<ReturnType<typeof requireRole>>)

    await submit()

    expect(mockCreateEvent.mock.calls[0][0].data.actorId).toBe("db-admin-9")
  })

  it("stores an omitted note as null rather than an empty string", async () => {
    await submit({ status: CaseStatus.VET, note: "   " })

    expect(mockCreateEvent.mock.calls[0][0].data.note).toBeNull()
  })

  it("resolves the case by slug, skipping soft-deleted rows", async () => {
    await submit()

    expect(mockFindFirst.mock.calls[0][0].where).toEqual({ slug: SLUG, deletedAt: null })
  })

  it("reports a case that is gone without writing", async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await submit()

    expect(result).toEqual({
      status: "error",
      message: "This case is no longer available.",
    })
    expectNothingWritten()
  })

  it("refuses a no-op move to the stage the case is already in", async () => {
    mockFindFirst.mockResolvedValue({ id: "case-1", status: CaseStatus.RESCUED })

    const result = await submit({ status: CaseStatus.RESCUED })

    expect(result.status).toBe("error")
    expectNothingWritten()
  })

  it("never surfaces the driver's message on a write failure", async () => {
    mockTransaction.mockRejectedValue(new Error("postgres://user:pw@host rejected"))

    const result = await submit()

    expect(result).toEqual({
      status: "error",
      message: "We could not save that just now. Please try again.",
    })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it("refreshes every screen the stage shows on", async () => {
    await submit()

    const paths = mockRevalidatePath.mock.calls.map(([path]) => path)
    expect(paths).toEqual(expect.arrayContaining([`/cases/${SLUG}`, "/", "/map"]))
  })
})
