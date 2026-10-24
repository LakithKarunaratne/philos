"use client"

import { useEffect, useRef, useState } from "react"
import { CheckIcon, Share2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FEEDBACK_DURATION_MS } from "@/lib/constants"

type ShareFeedback = "copied" | "failed" | null

const FEEDBACK_TEXT: Record<Exclude<ShareFeedback, null>, string> = {
  copied: "Link copied",
  failed: "Couldn't copy link",
}

function isShareCancel(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError"
}

interface CaseShareButtonProps {
  caseName: string
}

export function CaseShareButton({ caseName }: CaseShareButtonProps) {
  const [feedback, setFeedback] = useState<ShareFeedback>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function showFeedback(next: Exclude<ShareFeedback, null>) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setFeedback(next)
    timerRef.current = setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS)
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: `Rescue case: ${caseName}`, url })
        return
      } catch (err) {
        // User dismissed the share sheet: nothing to do.
        if (isShareCancel(err)) return
        // Any other share failure falls through to the clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      showFeedback("copied")
    } catch {
      showFeedback("failed")
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon-sm" onClick={handleShare} aria-label="Share case">
        {feedback === "copied" ? (
          <CheckIcon className="size-4 text-primary" />
        ) : (
          <Share2Icon className="size-4" />
        )}
      </Button>
      <span
        role="status"
        className="pointer-events-none absolute top-full right-0 mt-1 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-semibold text-background shadow-sm empty:hidden"
      >
        {feedback ? FEEDBACK_TEXT[feedback] : ""}
      </span>
    </div>
  )
}
