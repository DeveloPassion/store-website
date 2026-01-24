import { useEffect, useRef } from 'react'
import { trackTimeOnPage } from '@/lib/analytics'

type TimeBracket = '30s' | '1min' | '2min' | '5min'

interface UseTimeOnPageOptions {
    pageType: string
    brackets?: TimeBracket[]
    skip?: boolean
}

const BRACKET_MS: Record<TimeBracket, number> = {
    '30s': 30_000,
    '1min': 60_000,
    '2min': 120_000,
    '5min': 300_000
}

/**
 * Track time on page at specific brackets
 * Fires once per bracket per page load
 */
export function useTimeOnPage({
    pageType,
    brackets = ['30s', '1min', '2min', '5min'],
    skip = false
}: UseTimeOnPageOptions): void {
    const trackedRef = useRef<Set<TimeBracket>>(new Set())
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

    useEffect(() => {
        if (skip) return

        // Reset on mount
        trackedRef.current = new Set()
        timersRef.current = []

        // Set up timers for each bracket
        brackets.forEach((bracket) => {
            const timer = setTimeout(() => {
                if (!trackedRef.current.has(bracket)) {
                    trackedRef.current.add(bracket)
                    trackTimeOnPage(bracket, pageType)
                }
            }, BRACKET_MS[bracket])

            timersRef.current.push(timer)
        })

        // Cleanup on unmount
        return () => {
            timersRef.current.forEach((timer) => clearTimeout(timer))
        }
    }, [pageType, brackets, skip])
}
