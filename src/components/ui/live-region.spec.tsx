import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import LiveRegion from './live-region'

describe('LiveRegion Component', () => {
    it('should render with polite announcement', () => {
        const { container } = render(<LiveRegion message='Test message' politeness='polite' />)

        const liveRegion = container.querySelector('[role="status"]')
        expect(liveRegion).toBeInTheDocument()
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')
        expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
        expect(liveRegion).toHaveClass('sr-only')
        expect(liveRegion).toHaveTextContent('Test message')
    })

    it('should render with assertive announcement', () => {
        const { container } = render(<LiveRegion message='Urgent message' politeness='assertive' />)

        const liveRegion = container.querySelector('[role="alert"]')
        expect(liveRegion).toBeInTheDocument()
        expect(liveRegion).toHaveAttribute('aria-live', 'assertive')
        expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
        expect(liveRegion).toHaveTextContent('Urgent message')
    })

    it('should not render when politeness is off', () => {
        const { container } = render(<LiveRegion message='Hidden message' politeness='off' />)

        expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
        expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument()
    })

    it('should not render when message is empty', () => {
        const { container } = render(<LiveRegion message='' politeness='polite' />)

        expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
    })

    it('should use role="status" for polite by default', () => {
        const { container } = render(<LiveRegion message='Default politeness' />)

        const liveRegion = container.querySelector('[role="status"]')
        expect(liveRegion).toBeInTheDocument()
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    })

    it('should apply custom className', () => {
        const { container } = render(
            <LiveRegion message='Custom class' className='custom-test-class' />
        )

        const liveRegion = container.querySelector('[role="status"]')
        expect(liveRegion).toHaveClass('sr-only')
        expect(liveRegion).toHaveClass('custom-test-class')
    })

    it('should update message when prop changes', () => {
        const { container, rerender } = render(<LiveRegion message='First message' />)

        let liveRegion = container.querySelector('[role="status"]')
        expect(liveRegion).toHaveTextContent('First message')

        rerender(<LiveRegion message='Second message' />)

        liveRegion = container.querySelector('[role="status"]')
        expect(liveRegion).toHaveTextContent('Second message')
    })

    it('should update politeness when prop changes', () => {
        const { container, rerender } = render(<LiveRegion message='Test' politeness='polite' />)

        let liveRegion = container.querySelector('[role="status"]')
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')

        rerender(<LiveRegion message='Test' politeness='assertive' />)

        liveRegion = container.querySelector('[role="alert"]')
        expect(liveRegion).toHaveAttribute('aria-live', 'assertive')
    })

    it('should unmount cleanly when message becomes empty', () => {
        const { container, rerender } = render(<LiveRegion message='Test message' />)

        expect(container.querySelector('[role="status"]')).toBeInTheDocument()

        rerender(<LiveRegion message='' />)

        expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
    })

    it('should have aria-atomic set to true', () => {
        const { container } = render(<LiveRegion message='Atomic announcement' />)

        const liveRegion = container.querySelector('[role="status"]')
        expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
    })

    it('should be visually hidden with sr-only class', () => {
        const { container } = render(<LiveRegion message='Screen reader only' />)

        const liveRegion = container.querySelector('[role="status"]')
        expect(liveRegion).toHaveClass('sr-only')
    })
})
