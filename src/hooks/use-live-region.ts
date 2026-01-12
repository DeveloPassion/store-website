import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Politeness levels for ARIA live regions
 * - 'polite': Announces when screen reader is idle (default, use for most updates)
 * - 'assertive': Announces immediately, interrupting current speech (use sparingly)
 * - 'off': Disables announcements
 */
export type LiveRegionPoliteness = 'polite' | 'assertive' | 'off'

interface UseLiveRegionOptions {
    /**
     * Debounce delay in milliseconds to prevent announcement spam
     * @default 150
     */
    debounceMs?: number
    /**
     * How long to keep the message visible before clearing
     * @default 1000
     */
    clearDelayMs?: number
}

interface UseLiveRegionReturn {
    /**
     * Current message being announced
     */
    message: string
    /**
     * Current politeness level
     */
    politeness: LiveRegionPoliteness
    /**
     * Announce a message to screen readers
     */
    announce: (message: string, politeness?: LiveRegionPoliteness) => void
    /**
     * Clear the current message
     */
    clear: () => void
}

/**
 * Custom hook for managing ARIA live region announcements
 *
 * Provides a way to announce dynamic content changes to screen reader users.
 * Automatically debounces announcements and clears messages after a delay.
 *
 * @example
 * ```tsx
 * const { message, politeness, announce } = useLiveRegion()
 *
 * // Announce when search results change
 * useEffect(() => {
 *   if (results.length > 0) {
 *     announce(`${results.length} results found`)
 *   }
 * }, [results])
 *
 * return <LiveRegion message={message} politeness={politeness} />
 * ```
 *
 * WCAG 2.1 AA - Success Criterion 4.1.3 (Status Messages)
 */
export const useLiveRegion = (options: UseLiveRegionOptions = {}): UseLiveRegionReturn => {
    const { debounceMs = 150, clearDelayMs = 1000 } = options

    const [message, setMessage] = useState('')
    const [politeness, setPoliteness] = useState<LiveRegionPoliteness>('polite')

    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
            if (clearTimerRef.current) {
                clearTimeout(clearTimerRef.current)
            }
        }
    }, [])

    const clear = useCallback(() => {
        setMessage('')
        if (clearTimerRef.current) {
            clearTimeout(clearTimerRef.current)
            clearTimerRef.current = null
        }
    }, [])

    const announce = useCallback(
        (newMessage: string, newPoliteness: LiveRegionPoliteness = 'polite') => {
            // Clear existing timers
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
            if (clearTimerRef.current) {
                clearTimeout(clearTimerRef.current)
            }

            // Debounce the announcement
            debounceTimerRef.current = setTimeout(() => {
                setMessage(newMessage)
                setPoliteness(newPoliteness)

                // Auto-clear after delay
                clearTimerRef.current = setTimeout(() => {
                    setMessage('')
                }, clearDelayMs)
            }, debounceMs)
        },
        [debounceMs, clearDelayMs]
    )

    return {
        message,
        politeness,
        announce,
        clear
    }
}
