import { useCallback, useEffect, useRef, useState } from "react"
import { FEEDBACK_DURATION_MS } from "@/lib/constants"

/**
 * A flag that turns on when `show()` is called and turns off again after
 * `durationMs`. The pending timer is cleared on re-trigger and on unmount.
 */
export function useSettingsFeedback(durationMs: number = FEEDBACK_DURATION_MS) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(true)
    timerRef.current = setTimeout(() => setVisible(false), durationMs)
  }, [durationMs])

  return { visible, show }
}
