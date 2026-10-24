import { isClerkAPIResponseError } from "@clerk/nextjs/errors"

/** Best human-readable message from a Clerk call failure. */
export function clerkErrorMessage(err: unknown, fallback: string): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0]
    return first?.longMessage ?? first?.message ?? fallback
  }
  return fallback
}
