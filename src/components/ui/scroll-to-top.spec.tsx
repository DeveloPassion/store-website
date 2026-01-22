import { describe, it, expect, vi, beforeEach, afterEach } from 'bun:test'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ScrollToTop from './scroll-to-top'

describe('ScrollToTop', () => {
    let scrollToSpy: ReturnType<typeof vi.spyOn>
    let originalScrollRestoration: ScrollRestoration | undefined

    beforeEach(() => {
        scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
        // Mock history.scrollRestoration if not available in test environment
        if (!('scrollRestoration' in window.history)) {
            Object.defineProperty(window.history, 'scrollRestoration', {
                value: 'auto',
                writable: true,
                configurable: true
            })
        }
        originalScrollRestoration = window.history.scrollRestoration
    })

    afterEach(() => {
        scrollToSpy.mockRestore()
        if (originalScrollRestoration !== undefined) {
            window.history.scrollRestoration = originalScrollRestoration
        }
        // Clean up any elements added to the document
        document.body.innerHTML = ''
    })

    it('should scroll to top on initial mount', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <ScrollToTop />
            </MemoryRouter>
        )

        expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
    })

    it('should set scrollRestoration to manual on mount', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <ScrollToTop />
            </MemoryRouter>
        )

        expect(window.history.scrollRestoration).toBe('manual')
    })

    it('should scroll to top when pathname changes', () => {
        const { rerender } = render(
            <MemoryRouter initialEntries={['/page1']}>
                <ScrollToTop />
            </MemoryRouter>
        )

        // Initial mount scrolls to top
        expect(scrollToSpy).toHaveBeenCalledTimes(1)

        // Simulate navigation by re-rendering with new route
        rerender(
            <MemoryRouter initialEntries={['/page2']}>
                <ScrollToTop />
            </MemoryRouter>
        )

        // Should scroll again for the new route
        expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
    })

    it('should return null (render nothing)', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/']}>
                <ScrollToTop />
            </MemoryRouter>
        )

        expect(container.innerHTML).toBe('')
    })

    it('should scroll to element immediately when URL has hash anchor and element exists', () => {
        // Create an element with the target ID BEFORE rendering
        const targetElement = document.createElement('div')
        targetElement.id = 'testimonials'
        document.body.appendChild(targetElement)

        const scrollIntoViewSpy = vi.fn()
        targetElement.scrollIntoView = scrollIntoViewSpy

        render(
            <MemoryRouter initialEntries={['/product/test#testimonials']}>
                <ScrollToTop />
            </MemoryRouter>
        )

        // Should not scroll to top when there's a hash
        expect(scrollToSpy).not.toHaveBeenCalled()

        // Should scroll to the element immediately since it exists
        expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth' })
    })

    it('should not scroll to top when hash is present but element does not exist', () => {
        render(
            <MemoryRouter initialEntries={['/product/test#nonexistent']}>
                <ScrollToTop />
            </MemoryRouter>
        )

        // Should not scroll to top when there's a hash (polling will happen in background)
        expect(scrollToSpy).not.toHaveBeenCalled()
    })
})
