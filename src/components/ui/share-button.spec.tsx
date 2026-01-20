import { describe, it, expect, vi, beforeEach, afterEach, spyOn } from 'bun:test'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { ShareButton } from './share-button'

describe('ShareButton', () => {
    const defaultProps = {
        url: '/product/test-product',
        title: 'Test Product'
    }

    const originalLocation = window.location
    let windowOpenSpy: ReturnType<typeof spyOn>
    let clipboardSpy: ReturnType<typeof spyOn>

    beforeEach(() => {
        // Mock window.location.origin
        Object.defineProperty(window, 'location', {
            value: {
                ...originalLocation,
                origin: 'https://example.com'
            },
            writable: true
        })

        // Mock clipboard API
        clipboardSpy = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

        // Mock window.open
        windowOpenSpy = spyOn(window, 'open').mockImplementation(() => null)
    })

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true
        })
        windowOpenSpy?.mockRestore()
        clipboardSpy?.mockRestore()
        vi.restoreAllMocks()
    })

    describe('icon variant', () => {
        it('should render share icon', () => {
            const { container } = render(<ShareButton {...defaultProps} variant='icon' />)
            const button = container.querySelector('button')
            expect(button).toBeInTheDocument()
            expect(button).toHaveAttribute('aria-label', 'Share product')
        })

        it('should copy link on click', async () => {
            const { container } = render(<ShareButton {...defaultProps} variant='icon' />)
            const button = container.querySelector('button')

            fireEvent.click(button!)

            await waitFor(() => {
                expect(clipboardSpy).toHaveBeenCalledWith(
                    'https://example.com/product/test-product'
                )
            })
        })

        it('should show checkmark after copying', async () => {
            const { container } = render(<ShareButton {...defaultProps} variant='icon' />)
            const button = container.querySelector('button')

            fireEvent.click(button!)

            await waitFor(() => {
                expect(button).toHaveAttribute('aria-label', 'Link copied')
            })
        })

        it('should apply small size classes', () => {
            const { container } = render(<ShareButton {...defaultProps} variant='icon' size='sm' />)
            const button = container.querySelector('button')
            expect(button).toHaveClass('h-7')
            expect(button).toHaveClass('w-7')
        })
    })

    describe('text variant', () => {
        it('should render text link', () => {
            const { getByText } = render(<ShareButton {...defaultProps} variant='text' />)
            expect(getByText('Share this product')).toBeInTheDocument()
        })

        it('should copy link on click', async () => {
            const { container } = render(<ShareButton {...defaultProps} variant='text' />)
            const button = container.querySelector('button')

            fireEvent.click(button!)

            await waitFor(() => {
                expect(clipboardSpy).toHaveBeenCalledWith(
                    'https://example.com/product/test-product'
                )
            })
        })

        it('should show copied message after copying', async () => {
            const { getByText, container } = render(
                <ShareButton {...defaultProps} variant='text' />
            )
            const button = container.querySelector('button')

            fireEvent.click(button!)

            await waitFor(() => {
                expect(getByText('Link copied!')).toBeInTheDocument()
            })
        })
    })

    describe('dropdown variant', () => {
        it('should render dropdown trigger button', () => {
            const { container } = render(<ShareButton {...defaultProps} variant='dropdown' />)
            const button = container.querySelector('button')
            expect(button).toBeInTheDocument()
            expect(button).toHaveAttribute('aria-haspopup', 'true')
        })

        it('should open dropdown menu on click', async () => {
            const { container, getByText } = render(
                <ShareButton {...defaultProps} variant='dropdown' />
            )
            const button = container.querySelector('button')

            fireEvent.click(button!)

            await waitFor(() => {
                expect(getByText('Copy link')).toBeInTheDocument()
                expect(getByText('Share on X')).toBeInTheDocument()
                expect(getByText('Share on LinkedIn')).toBeInTheDocument()
            })
        })

        it('should copy link when clicking Copy link option', async () => {
            const { container, getByText } = render(
                <ShareButton {...defaultProps} variant='dropdown' />
            )
            const triggerButton = container.querySelector('button')

            fireEvent.click(triggerButton!)

            await waitFor(() => {
                expect(getByText('Copy link')).toBeInTheDocument()
            })

            const copyButton = getByText('Copy link')
            fireEvent.click(copyButton)

            await waitFor(() => {
                expect(clipboardSpy).toHaveBeenCalledWith(
                    'https://example.com/product/test-product'
                )
            })
        })

        it('should open Twitter share when clicking Share on X', async () => {
            const { container, getByText } = render(
                <ShareButton {...defaultProps} variant='dropdown' />
            )
            const triggerButton = container.querySelector('button')

            fireEvent.click(triggerButton!)

            await waitFor(() => {
                expect(getByText('Share on X')).toBeInTheDocument()
            })

            const twitterButton = getByText('Share on X')
            fireEvent.click(twitterButton)

            expect(windowOpenSpy).toHaveBeenCalledWith(
                expect.stringContaining('twitter.com/intent/tweet'),
                '_blank',
                'width=600,height=400,noopener,noreferrer'
            )
        })

        it('should open LinkedIn share when clicking Share on LinkedIn', async () => {
            const { container, getByText } = render(
                <ShareButton {...defaultProps} variant='dropdown' />
            )
            const triggerButton = container.querySelector('button')

            fireEvent.click(triggerButton!)

            await waitFor(() => {
                expect(getByText('Share on LinkedIn')).toBeInTheDocument()
            })

            const linkedinButton = getByText('Share on LinkedIn')
            fireEvent.click(linkedinButton)

            expect(windowOpenSpy).toHaveBeenCalledWith(
                expect.stringContaining('linkedin.com/sharing/share-offsite'),
                '_blank',
                'width=600,height=400,noopener,noreferrer'
            )
        })

        it('should close dropdown after copying link', async () => {
            const { container, getByText, queryByText } = render(
                <ShareButton {...defaultProps} variant='dropdown' />
            )
            const triggerButton = container.querySelector('button')

            fireEvent.click(triggerButton!)

            await waitFor(() => {
                expect(getByText('Copy link')).toBeInTheDocument()
            })

            const copyButton = getByText('Copy link')
            fireEvent.click(copyButton)

            await waitFor(() => {
                expect(queryByText('Copy link')).not.toBeInTheDocument()
            })
        })

        it('should apply medium size classes by default', () => {
            const { container } = render(<ShareButton {...defaultProps} variant='dropdown' />)
            const button = container.querySelector('button')
            expect(button).toHaveClass('h-10')
            expect(button).toHaveClass('w-10')
        })
    })

    describe('sizes', () => {
        it('should apply small size classes', () => {
            const { container } = render(<ShareButton {...defaultProps} size='sm' variant='icon' />)
            const button = container.querySelector('button')
            expect(button).toHaveClass('h-7')
            expect(button).toHaveClass('w-7')
        })

        it('should apply medium size classes', () => {
            const { container } = render(<ShareButton {...defaultProps} size='md' variant='icon' />)
            const button = container.querySelector('button')
            expect(button).toHaveClass('h-10')
            expect(button).toHaveClass('w-10')
        })

        it('should apply large size classes', () => {
            const { container } = render(<ShareButton {...defaultProps} size='lg' variant='icon' />)
            const button = container.querySelector('button')
            expect(button).toHaveClass('h-12')
            expect(button).toHaveClass('w-12')
        })
    })

    describe('full URLs', () => {
        it('should handle full URLs without modification', async () => {
            const { container } = render(
                <ShareButton
                    url='https://custom-domain.com/product/test'
                    title='Test'
                    variant='icon'
                />
            )
            const button = container.querySelector('button')

            fireEvent.click(button!)

            await waitFor(() => {
                expect(clipboardSpy).toHaveBeenCalledWith('https://custom-domain.com/product/test')
            })
        })
    })

    describe('description prop', () => {
        it('should include description in social share text', async () => {
            const { container, getByText } = render(
                <ShareButton
                    {...defaultProps}
                    description='This is a great product'
                    variant='dropdown'
                />
            )
            const triggerButton = container.querySelector('button')

            fireEvent.click(triggerButton!)

            await waitFor(() => {
                expect(getByText('Share on X')).toBeInTheDocument()
            })

            const twitterButton = getByText('Share on X')
            fireEvent.click(twitterButton)

            expect(windowOpenSpy).toHaveBeenCalledWith(
                expect.stringContaining('Test%20Product%20-%20This%20is%20a%20great%20product'),
                '_blank',
                'width=600,height=400,noopener,noreferrer'
            )
        })
    })

    describe('custom className', () => {
        it('should apply custom className', () => {
            const { container } = render(
                <ShareButton {...defaultProps} variant='icon' className='custom-class' />
            )
            const button = container.querySelector('button')
            expect(button).toHaveClass('custom-class')
        })
    })

    describe('accessibility', () => {
        it('should have correct aria-label', () => {
            const { container } = render(<ShareButton {...defaultProps} variant='icon' />)
            const button = container.querySelector('button')
            expect(button).toHaveAttribute('aria-label', 'Share product')
        })

        it('should have aria-haspopup for dropdown variant', () => {
            const { container } = render(<ShareButton {...defaultProps} variant='dropdown' />)
            const button = container.querySelector('button')
            expect(button).toHaveAttribute('aria-haspopup', 'true')
        })

        it('should have aria-expanded for dropdown variant', () => {
            const { container } = render(<ShareButton {...defaultProps} variant='dropdown' />)
            const button = container.querySelector('button')
            expect(button).toHaveAttribute('aria-expanded', 'false')
        })

        it('should update aria-expanded when dropdown opens', async () => {
            const { container } = render(<ShareButton {...defaultProps} variant='dropdown' />)
            const button = container.querySelector('button')

            fireEvent.click(button!)

            await waitFor(() => {
                expect(button).toHaveAttribute('aria-expanded', 'true')
            })
        })

        it('should have role="menu" on dropdown', async () => {
            const { container } = render(<ShareButton {...defaultProps} variant='dropdown' />)
            const button = container.querySelector('button')

            fireEvent.click(button!)

            await waitFor(() => {
                const menu = container.querySelector('[role="menu"]')
                expect(menu).toBeInTheDocument()
            })
        })

        it('should have role="menuitem" on dropdown options', async () => {
            const { container } = render(<ShareButton {...defaultProps} variant='dropdown' />)
            const button = container.querySelector('button')

            fireEvent.click(button!)

            await waitFor(() => {
                const menuItems = container.querySelectorAll('[role="menuitem"]')
                expect(menuItems.length).toBe(3)
            })
        })
    })

    describe('event propagation', () => {
        it('should stop event propagation on click', async () => {
            const parentHandler = vi.fn()
            const { container } = render(
                <div onClick={parentHandler}>
                    <ShareButton {...defaultProps} variant='icon' />
                </div>
            )
            const button = container.querySelector('button')

            fireEvent.click(button!)

            // Wait for async state updates to complete
            await waitFor(() => {
                expect(button).toHaveAttribute('aria-label', 'Link copied')
            })

            expect(parentHandler).not.toHaveBeenCalled()
        })
    })
})
