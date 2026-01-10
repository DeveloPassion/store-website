import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { render, fireEvent, waitFor } from '@testing-library/react'
import ScrollToTopButton from './scroll-to-top-button'

describe('ScrollToTopButton Component', () => {
    beforeEach(() => {
        // Mock window.scrollTo
        window.scrollTo = mock(() => {})

        // Mock window.scrollY
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            value: 0
        })
    })

    afterEach(() => {})

    it('should render without crashing', () => {
        const { getByRole } = render(<ScrollToTopButton />)
        const button = getByRole('button', { name: /scroll to top/i })
        expect(button).toBeInTheDocument()
    })

    it('should be initially hidden when scrollY is 0', () => {
        const { getByRole } = render(<ScrollToTopButton />)
        const button = getByRole('button', { name: /scroll to top/i })
        expect(button).toHaveClass('opacity-0')
        expect(button).toHaveClass('pointer-events-none')
    })

    it('should become visible when scrollY > 300', async () => {
        const { getByRole } = render(<ScrollToTopButton />)
        const button = getByRole('button', { name: /scroll to top/i })

        // Initially hidden
        expect(button).toHaveClass('opacity-0')

        // Simulate scroll
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            value: 400
        })
        fireEvent.scroll(window)

        await waitFor(() => {
            expect(button).toHaveClass('opacity-100')
            expect(button).not.toHaveClass('pointer-events-none')
        })
    })

    it('should hide when scrollY < 300', async () => {
        const { getByRole } = render(<ScrollToTopButton />)
        const button = getByRole('button', { name: /scroll to top/i })

        // Scroll down to show button
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            value: 400
        })
        fireEvent.scroll(window)

        await waitFor(() => {
            expect(button).toHaveClass('opacity-100')
        })

        // Scroll back up to hide button
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            value: 200
        })
        fireEvent.scroll(window)

        await waitFor(() => {
            expect(button).toHaveClass('opacity-0')
            expect(button).toHaveClass('pointer-events-none')
        })
    })

    it('should call window.scrollTo with smooth behavior when clicked', async () => {
        const { getByRole } = render(<ScrollToTopButton />)
        const button = getByRole('button', { name: /scroll to top/i })

        // Make button visible
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            value: 400
        })
        fireEvent.scroll(window)

        await waitFor(() => {
            expect(button).toHaveClass('opacity-100')
        })

        // Click button
        fireEvent.click(button)

        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: 'smooth'
        })
    })

    it('should have correct styling classes', () => {
        const { getByRole } = render(<ScrollToTopButton />)
        const button = getByRole('button', { name: /scroll to top/i })

        expect(button).toHaveClass('bg-secondary')
        expect(button).toHaveClass('rounded-full')
        expect(button).toHaveClass('fixed')
        expect(button).toHaveClass('z-50')
    })

    it('should hide when modal is open', async () => {
        const { getByRole } = render(<ScrollToTopButton />)
        const button = getByRole('button', { name: /scroll to top/i })

        // Make button visible
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            value: 400
        })
        fireEvent.scroll(window)

        await waitFor(() => {
            expect(button).toHaveClass('opacity-100')
        })

        // Simulate modal opening by setting body overflow
        document.body.style.overflow = 'hidden'

        // Trigger MutationObserver by mutating body style
        await waitFor(() => {
            expect(button).toHaveClass('pointer-events-none')
        })
    })

    it('should render arrow up icon', () => {
        const { getByRole } = render(<ScrollToTopButton />)
        const button = getByRole('button', { name: /scroll to top/i })
        const icon = button.querySelector('svg')
        expect(icon).toBeInTheDocument()
    })
})
