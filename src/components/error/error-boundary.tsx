import React from 'react'
import { Link } from 'react-router'
import { FaBug, FaHome } from 'react-icons/fa'
import Section from '@/components/ui/section'

interface ErrorBoundaryProps {
    children: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

/**
 * Error Boundary component to catch React errors outside of routing
 *
 * Note: For routing errors, React Router's errorElement is used (see main.tsx)
 * This boundary catches errors in component trees, event handlers, etc.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error }
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log the error to console in development
        if (process.env['NODE_ENV'] === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo)
        }

        // In production, you could log to an error reporting service here
        // e.g., Sentry, LogRocket, etc.
    }

    override render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div className='bg-background min-h-screen'>
                    {/* Hero Section */}
                    <Section className='pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20'>
                        <div className='mx-auto max-w-[1400px] text-center'>
                            {/* Icon */}
                            <div className='mb-6 flex justify-center'>
                                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-lg'>
                                    <FaBug className='h-10 w-10 text-white' />
                                </div>
                            </div>

                            <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'>
                                Oops! Something Went Wrong
                            </h1>
                            <p className='text-primary/70 mx-auto mb-4 max-w-2xl text-lg sm:text-xl md:text-2xl'>
                                We encountered an unexpected error. Don't worry, our team has been
                                notified and is working on it.
                            </p>

                            {/* Error Details (for development) */}
                            {process.env['NODE_ENV'] === 'development' && this.state.error && (
                                <div className='border-primary/20 bg-primary/5 mx-auto mb-8 max-w-2xl rounded-lg border p-4 text-left'>
                                    <p className='text-primary/70 mb-2 font-mono text-sm break-words'>
                                        <strong>Error:</strong> {this.state.error.message}
                                    </p>
                                    {this.state.error.stack && (
                                        <pre className='text-primary/60 mt-4 max-h-64 overflow-auto text-xs break-words whitespace-pre-wrap'>
                                            {this.state.error.stack}
                                        </pre>
                                    )}
                                </div>
                            )}

                            {/* Quick Links */}
                            <div className='mb-10 flex flex-wrap justify-center gap-4'>
                                <Link
                                    to='/'
                                    className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-colors'
                                    onClick={() => this.setState({ hasError: false, error: null })}
                                >
                                    <FaHome className='h-5 w-5' />
                                    Go Home
                                </Link>
                                <button
                                    onClick={() => {
                                        this.setState({ hasError: false, error: null })
                                        window.location.reload()
                                    }}
                                    className='border-primary/20 hover:border-secondary/50 inline-flex items-center gap-2 rounded-lg border bg-transparent px-6 py-3 font-semibold transition-colors'
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </Section>

                    {/* Help Section */}
                    <Section className='bg-primary/5 py-12 sm:py-16'>
                        <div className='mx-auto max-w-[1400px] text-center'>
                            <h2 className='mb-4 text-3xl font-bold sm:text-4xl'>Need Help?</h2>
                            <p className='text-primary/70 mx-auto mb-8 max-w-2xl'>
                                If this error persists, please contact our support team and we'll
                                help you resolve the issue.
                            </p>
                            <Link
                                to='/help'
                                className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-8 py-3 font-semibold text-white transition-colors'
                                onClick={() => this.setState({ hasError: false, error: null })}
                            >
                                Get Help
                            </Link>
                        </div>
                    </Section>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
