import { useEffect } from 'react'
import { useLocation } from 'react-router'

const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation()

    // Disable browser's automatic scroll restoration on page refresh
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }
    }, [])

    // Scroll to top on route change and initial mount
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}

export default ScrollToTop
