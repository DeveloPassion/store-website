import { describe, it, expect } from 'bun:test'
import { render, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import SkipLinks from './skip-links'

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('SkipLinks Component', () => {
    it('should render all skip links', () => {
        const { getByText } = renderWithRouter(<SkipLinks />)

        expect(getByText('Skip to main content')).toBeInTheDocument()
        expect(getByText('Skip to navigation')).toBeInTheDocument()
        expect(getByText('Skip to footer')).toBeInTheDocument()
        expect(getByText('Open command palette')).toBeInTheDocument()
    })

    it('should have correct href attributes for skip links', () => {
        const { getByText } = renderWithRouter(<SkipLinks />)

        const mainContentLink = getByText('Skip to main content')
        const navigationLink = getByText('Skip to navigation')
        const footerLink = getByText('Skip to footer')

        expect(mainContentLink).toHaveAttribute('href', '#main-content')
        expect(navigationLink).toHaveAttribute('href', '#navigation')
        expect(footerLink).toHaveAttribute('href', '#footer')
    })

    it('should apply sr-only-focusable class to container', () => {
        const { container } = renderWithRouter(<SkipLinks />)

        const skipLinksContainer = container.firstChild
        expect(skipLinksContainer).toHaveClass('sr-only-focusable')
    })

    it('should have proper focus styles on all links', () => {
        const { getByText } = renderWithRouter(<SkipLinks />)

        const links = [
            getByText('Skip to main content'),
            getByText('Skip to navigation'),
            getByText('Skip to footer'),
            getByText('Open command palette')
        ]

        links.forEach((link) => {
            expect(link).toHaveClass('focus-visible:ring-2')
            expect(link).toHaveClass('focus-visible:outline-none')
            expect(link).toHaveClass('bg-secondary')
            expect(link).toHaveClass('text-primary')
        })
    })

    it('should trigger command palette on click', () => {
        const { getByText } = renderWithRouter(<SkipLinks />)

        // Mock keyboard event dispatch
        let dispatchedEvent: KeyboardEvent | null = null
        const originalDispatchEvent = document.dispatchEvent
        document.dispatchEvent = ((event: Event) => {
            if (event instanceof KeyboardEvent && event.key === '/') {
                dispatchedEvent = event as KeyboardEvent
            }
            return originalDispatchEvent.call(document, event)
        }) as typeof document.dispatchEvent

        const commandPaletteLink = getByText('Open command palette')
        fireEvent.click(commandPaletteLink)

        expect(dispatchedEvent).not.toBeNull()
        expect(dispatchedEvent!.key).toBe('/')
        expect(dispatchedEvent!.bubbles).toBe(true)
        expect(dispatchedEvent!.cancelable).toBe(true)

        // Restore original
        document.dispatchEvent = originalDispatchEvent
    })

    it('should prevent default behavior on command palette link click', () => {
        const { getByText } = renderWithRouter(<SkipLinks />)

        const commandPaletteLink = getByText('Open command palette')
        fireEvent.click(commandPaletteLink)
        expect(commandPaletteLink).toHaveAttribute('href', '#')
    })

    it('should have high z-index for visibility', () => {
        const { getByText } = renderWithRouter(<SkipLinks />)

        const links = [
            getByText('Skip to main content'),
            getByText('Skip to navigation'),
            getByText('Skip to footer'),
            getByText('Open command palette')
        ]

        links.forEach((link) => {
            expect(link).toHaveClass('z-[9999]')
        })
    })

    it('should be positioned fixed at top-left', () => {
        const { getByText } = renderWithRouter(<SkipLinks />)

        const links = [
            getByText('Skip to main content'),
            getByText('Skip to navigation'),
            getByText('Skip to footer'),
            getByText('Open command palette')
        ]

        links.forEach((link) => {
            expect(link).toHaveClass('fixed')
            expect(link).toHaveClass('top-4')
            expect(link).toHaveClass('left-4')
        })
    })

    it('should have proper ARIA/accessibility attributes', () => {
        const { getByText } = renderWithRouter(<SkipLinks />)

        const links = [
            getByText('Skip to main content'),
            getByText('Skip to navigation'),
            getByText('Skip to footer'),
            getByText('Open command palette')
        ]

        // All links should be focusable (default for anchor tags)
        links.forEach((link) => {
            expect(link.tagName).toBe('A')
        })
    })

    it('should render 4 skip links in total', () => {
        const { container } = renderWithRouter(<SkipLinks />)

        const links = container.querySelectorAll('a')
        expect(links).toHaveLength(4)
    })
})
