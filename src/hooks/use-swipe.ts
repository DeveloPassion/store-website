import { useRef, useCallback } from 'react'

interface UseSwipeOptions {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    threshold?: number
}

/**
 * Hook to detect horizontal swipe gestures via pointer events.
 * Returns handlers to spread onto the swipeable container element.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: UseSwipeOptions) {
    const startX = useRef<number | null>(null)
    const startY = useRef<number | null>(null)

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        startX.current = e.clientX
        startY.current = e.clientY
    }, [])

    const onPointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (startX.current === null || startY.current === null) return

            const deltaX = e.clientX - startX.current
            const deltaY = e.clientY - startY.current

            // Only trigger if horizontal movement exceeds vertical (avoid hijacking scroll)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= threshold) {
                if (deltaX < 0) {
                    onSwipeLeft?.()
                } else {
                    onSwipeRight?.()
                }
            }

            startX.current = null
            startY.current = null
        },
        [onSwipeLeft, onSwipeRight, threshold]
    )

    return { onPointerDown, onPointerUp }
}
