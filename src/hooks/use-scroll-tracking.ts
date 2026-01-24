import { useEffect, useRef } from 'react'
import { trackScrollDepth } from '@/lib/analytics'

interface UseScrollTrackingOptions {
    pageType: string
    thresholds?: (25 | 50 | 75 | 100)[]
    skip?: boolean
}

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%)
 * Fires once per milestone per page load
 */
export function useScrollTracking({
    pageType,
    thresholds = [25, 50, 75, 100],
    skip = false
}: UseScrollTrackingOptions): void {
    const trackedRef = useRef<Set<number>>(new Set())

    useEffect(() => {
        if (skip) return

        // Reset tracked milestones on mount (new page)
        trackedRef.current = new Set()

        let ticking = false

        const handleScroll = () => {
            if (ticking) return
            ticking = true

            requestAnimationFrame(() => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
                if (scrollHeight <= 0) {
                    ticking = false
                    return
                }

                const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100)

                thresholds.forEach((threshold) => {
                    if (scrollPercent >= threshold && !trackedRef.current.has(threshold)) {
                        trackedRef.current.add(threshold)
                        trackScrollDepth(threshold, pageType)
                    }
                })

                ticking = false
            })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })

        // Initial check in case page is already scrolled
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [pageType, thresholds, skip])
}
