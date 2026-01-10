import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import ErrorBoundary from './error-boundary'

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean; message?: string }> = ({
    shouldThrow,
    message = 'Test error'
}) => {
    if (shouldThrow) {
        throw new Error(message)
    }
    return <div>No error</div>
}

// Unused component - kept for potential future use
// const ThrowInEffect: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
//     if (shouldThrow) {
//         // Simulate error in effect
//         throw new Error('Effect error')
//     }
//     return <div>No error in effect</div>
// }

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ErrorBoundary Component', () => {
    let originalEnv: string | undefined
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        // Store original values
        originalEnv = process.env['NODE_ENV']

        // Suppress console.error in tests (ErrorBoundary logs errors)
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        // Restore original values
        if (originalEnv !== undefined) {
            process.env['NODE_ENV'] = originalEnv
        }
        consoleErrorSpy.mockRestore()
    })

    it('should render children when there is no error', () => {
        renderWithRouter(
            <ErrorBoundary>
                <div>Test content</div>
            </ErrorBoundary>
        )

        expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should catch errors and display error UI', () => {
        renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(screen.getByText('Oops! Something Went Wrong')).toBeInTheDocument()
        expect(screen.queryByText('No error')).not.toBeInTheDocument()
    })

    it('should display error message in development mode', () => {
        process.env['NODE_ENV'] = 'development'

        renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} message='Custom error message' />
            </ErrorBoundary>
        )

        // Should show the error message (may appear in multiple places)
        const errorMessages = screen.getAllByText(/Custom error message/i)
        expect(errorMessages.length).toBeGreaterThan(0)
    })

    it('should not display error details in production mode', () => {
        process.env['NODE_ENV'] = 'production'

        renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} message='Custom error message' />
            </ErrorBoundary>
        )

        expect(screen.queryByText(/Custom error message/)).not.toBeInTheDocument()
    })

    it('should display error stack trace in development mode', () => {
        process.env['NODE_ENV'] = 'development'

        renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} message='Stack trace test' />
            </ErrorBoundary>
        )

        // Stack trace should be visible in development
        const { container } = render(
            <BrowserRouter>
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} message='Stack trace test' />
                </ErrorBoundary>
            </BrowserRouter>
        )

        const preElement = container.querySelector('pre')
        expect(preElement).toBeInTheDocument()
    })

    it('should render "Go Home" link', () => {
        renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        const homeLink = screen.getByText('Go Home')
        expect(homeLink).toBeInTheDocument()
        expect(homeLink).toHaveAttribute('href', '/')
    })

    it('should render "Try Again" button', () => {
        renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        const tryAgainButton = screen.getByText('Try Again')
        expect(tryAgainButton).toBeInTheDocument()
    })

    it('should render "Get Help" link', () => {
        renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        const helpLink = screen.getByText('Get Help')
        expect(helpLink).toBeInTheDocument()
        expect(helpLink).toHaveAttribute('href', '/help')
    })

    it('should render bug icon when error occurs', () => {
        const { container } = renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        const iconDiv = container.querySelector('.from-red-500.to-pink-500')
        expect(iconDiv).toBeInTheDocument()
    })

    it('should log error to console in development mode', () => {
        process.env['NODE_ENV'] = 'development'
        consoleErrorSpy.mockRestore() // Remove the mock to test actual logging
        const realConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

        renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} message='Console test error' />
            </ErrorBoundary>
        )

        expect(realConsoleError).toHaveBeenCalled()
        realConsoleError.mockRestore()
    })

    it('should handle multiple children', () => {
        renderWithRouter(
            <ErrorBoundary>
                <div>Child 1</div>
                <div>Child 2</div>
                <div>Child 3</div>
            </ErrorBoundary>
        )

        expect(screen.getByText('Child 1')).toBeInTheDocument()
        expect(screen.getByText('Child 2')).toBeInTheDocument()
        expect(screen.getByText('Child 3')).toBeInTheDocument()
    })

    it('should catch errors from nested components', () => {
        renderWithRouter(
            <ErrorBoundary>
                <div>
                    <div>
                        <ThrowError shouldThrow={true} />
                    </div>
                </div>
            </ErrorBoundary>
        )

        expect(screen.getByText('Oops! Something Went Wrong')).toBeInTheDocument()
    })

    it('should display help section when error occurs', () => {
        renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(screen.getByText('Need Help?')).toBeInTheDocument()
        expect(
            screen.getByText(/If this error persists, please contact our support team/i)
        ).toBeInTheDocument()
    })

    it('should not affect normal rendering when no error', () => {
        const { container } = renderWithRouter(
            <ErrorBoundary>
                <div className='test-class'>Normal content</div>
            </ErrorBoundary>
        )

        const testDiv = container.querySelector('.test-class')
        expect(testDiv).toBeInTheDocument()
        expect(testDiv?.textContent).toBe('Normal content')
    })

    it('should handle errors with empty messages', () => {
        process.env['NODE_ENV'] = 'development'

        renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} message='' />
            </ErrorBoundary>
        )

        // Should still show error UI even with empty message
        expect(screen.getByText('Oops! Something Went Wrong')).toBeInTheDocument()
    })

    it('should render with proper responsive styling', () => {
        const { container } = renderWithRouter(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        )

        const section = container.querySelector('.pt-16.pb-12.sm\\:pt-24.sm\\:pb-16')
        expect(section).toBeInTheDocument()
    })
})
