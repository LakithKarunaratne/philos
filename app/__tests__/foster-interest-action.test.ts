import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { ensureCurrentDbUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  FOSTER_INTEREST_IDLE,
  submitFosterInterest,
} from "@/app/(app)/cases/[id]/actions"

jest.mock("@clerk/nextjs/server", () => ({ auth: jest.fn() }))
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }))
jest.mock("@/lib/auth", () => ({ ensureCurrentDbUser: jest.fn() }))
jest.mock("@/lib/prisma", () => ({
  prisma: {
    rescueCase: { findFirst: jest.fn() },
    caseInterest: { create: jest.fn() },
  },
}))

type AuthResult = Awaited<ReturnType<typeof auth>>
type FindFirstArgs = { where: { slug: string; deletedAt: null } }
type CreateArgs = {
  data: {
    caseId: string
    userId: string | null
    kind: string
    name: string
    phone: string
    note: string | null
  }
}

const mockAuth = jest.mocked(auth)
const mockRevalidatePath = jest.mocked(revalidatePath)
const mockEnsureUser = jest.mocked(ensureCurrentDbUser)
// The Prisma delegate types are heavily generic; narrow them to what the action uses.
const mockFindFirst = prisma.rescueCase.findFirst as unknown as jest.Mock<
  Promise<{ id: string } | null>,
  [FindFirstArgs]
>
const mockCreate = prisma.caseInterest.create as unknown as jest.Mock<
  Promise<unknown>,
  [CreateArgs]
>

const SLUG = "biscuit-2026"

function signedIn(userId: string | null): void {
  mockAuth.mockResolvedValue({ userId } as unknown as AuthResult)
}

function buildForm(fields: Record<string, string>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) formData.set(key, value)
  return formData
}

const VALID_FIELDS = {
  name: "Ada Lovelace",
  phone: "0400 000 000",
  note: "I have a fenced yard.",
}

function submit(fields: Record<string, string> = VALID_FIELDS) {
  return submitFosterInterest(SLUG, FOSTER_INTEREST_IDLE, buildForm(fields))
}

function expectNothingTouched(): void {
  expect(mockAuth).not.toHaveBeenCalled()
  expect(mockFindFirst).not.toHaveBeenCalled()
  expect(mockCreate).not.toHaveBeenCalled()
  expect(mockRevalidatePath).not.toHaveBeenCalled()
}

describe("submitFosterInterest", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    signedIn("user_123")
    mockFindFirst.mockResolvedValue({ id: "case_1" })
    mockEnsureUser.mockResolvedValue(null)
    mockCreate.mockResolvedValue({})
  })

  describe("validation", () => {
    it("rejects a missing name and echoes the values back", async () => {
      const fields = { ...VALID_FIELDS, name: "   " }
      const result = await submit(fields)

      expect(result.status).toBe("error")
      expect(result.fieldErrors?.name).toEqual(expect.any(String))
      expect(result.fieldErrors?.phone).toBeUndefined()
      expect(result.values).toEqual({ ...fields, name: "" })
      expectNothingTouched()
    })

    it("rejects a missing phone", async () => {
      const result = await submit({ name: "Ada Lovelace", note: "Hi" })

      expect(result.status).toBe("error")
      expect(result.fieldErrors?.phone).toEqual(expect.any(String))
      expect(result.fieldErrors?.name).toBeUndefined()
      expect(result.values).toEqual({ name: "Ada Lovelace", phone: "", note: "Hi" })
      expectNothingTouched()
    })

    it("rejects a note over 1000 characters but accepts exactly 1000", async () => {
      const tooLong = await submit({ ...VALID_FIELDS, note: "a".repeat(1001) })

      expect(tooLong.status).toBe("error")
      expect(tooLong.fieldErrors?.note).toEqual(expect.any(String))
      expect(mockCreate).not.toHaveBeenCalled()

      const atLimit = await submit({ ...VALID_FIELDS, note: "a".repeat(1000) })

      expect(atLimit.status).toBe("success")
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })

    it("ignores a non-string form entry such as a file upload", async () => {
      const formData = buildForm({ phone: VALID_FIELDS.phone })
      formData.set("name", new File(["x"], "name.txt"))
      const result = await submitFosterInterest(SLUG, FOSTER_INTEREST_IDLE, formData)

      expect(result.status).toBe("error")
      expect(result.fieldErrors?.name).toEqual(expect.any(String))
      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  describe("authentication", () => {
    // Actions are reachable by direct POST, so this check is the security boundary.
    it("rejects a signed-out caller even with valid fields", async () => {
      signedIn(null)
      const result = await submit()

      expect(result.status).toBe("error")
      expect(result.message).toEqual(expect.any(String))
      expect(result.values).toEqual(VALID_FIELDS)
      expect(mockFindFirst).not.toHaveBeenCalled()
      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  describe("case lookup", () => {
    it("rejects an unknown or soft-deleted case and filters on deletedAt", async () => {
      mockFindFirst.mockResolvedValue(null)
      const result = await submit()

      expect(result.status).toBe("error")
      expect(result.message).toEqual(expect.any(String))
      expect(mockFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: SLUG, deletedAt: null } })
      )
      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  describe("writing", () => {
    it("records the interest, revalidates the case page and reports success", async () => {
      mockEnsureUser.mockResolvedValue({ id: "db_user_1" } as unknown as Awaited<
        ReturnType<typeof ensureCurrentDbUser>
      >)
      const result = await submit()

      expect(result).toEqual({ status: "success" })
      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          caseId: "case_1",
          userId: "db_user_1",
          kind: "FOSTER",
          name: VALID_FIELDS.name,
          phone: VALID_FIELDS.phone,
          note: VALID_FIELDS.note,
        },
      })
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/cases/${SLUG}`)
    })

    it("stores a null note when the note is left blank", async () => {
      await submit({ ...VALID_FIELDS, note: "" })

      expect(mockCreate.mock.calls[0][0].data.note).toBeNull()
    })

    // PHI-13 has not landed, so a Clerk user with no mirrored row is a normal case.
    it("still records interest with a null userId when no DB user row exists", async () => {
      mockEnsureUser.mockResolvedValue(null)
      const result = await submit()

      expect(result.status).toBe("success")
      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate.mock.calls[0][0].data.userId).toBeNull()
    })

    it("reports a database failure without leaking the driver message", async () => {
      const driverMessage = "connect ECONNREFUSED 10.0.0.1:5432"
      mockCreate.mockRejectedValue(new Error(driverMessage))
      const result = await submit()

      expect(result.status).toBe("error")
      expect(result.message).toEqual(expect.any(String))
      expect(result.message).not.toContain(driverMessage)
      expect(result.message).not.toContain("ECONNREFUSED")
      expect(result.values).toEqual(VALID_FIELDS)
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it("still records the interest when the user lookup fails", async () => {
      // Attribution is best-effort: the coordinator calls the name and phone
      // on the row, so a mirroring failure must not lose the submission.
      mockEnsureUser.mockRejectedValue(new Error("clerk upstream 10.0.0.2"))
      const result = await submit()

      expect(result.status).toBe("success")
      expect(mockCreate).toHaveBeenCalledTimes(1)
      expect(mockCreate.mock.calls[0][0].data.userId).toBeNull()
    })
  })
})
