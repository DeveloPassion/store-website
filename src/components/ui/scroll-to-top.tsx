import { useEffect } from 'react'
import { useLocation } from 'react-router'

const ScrollToTop: React.FC = () => {
    const { pathname, hash } = useLocation()

    // Disable browser's automatic scroll restoration on page refresh
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }
    }, [])

    // Scroll to anchor or top on route change and initial mount
    useEffect(() => {
        if (hash) {
            // If there's a hash, wait for the element to appear in the DOM
            // This handles lazy-loaded content and React rendering delays
            const elementId = hash.slice(1)
            let attempts = 0
            const maxAttempts = 50 // 50 * 100ms = 5 seconds max wait

            const scrollToElement = () => {
                const element = document.getElementById(elementId)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                    return true
                }
                return false
            }

            // Try immediately first
            if (scrollToElement()) {
                return undefined
            }

            // If not found, poll until element appears or timeout
            const intervalId = setInterval(() => {
                attempts++
                if (scrollToElement() || attempts >= maxAttempts) {
                    clearInterval(intervalId)
                }
            }, 100)

            return () => clearInterval(intervalId)
        } else {
            // No hash, scroll to top
            window.scrollTo(0, 0)
            return undefined
        }
    }, [pathname, hash])

    return null
}

export default ScrollToTop
