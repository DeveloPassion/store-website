import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { render, waitFor } from '@testing-library/react'
import StickyBuyButton from './sticky-buy-button'
import type { Product } from '@/types/product'

// Mock framer-motion to avoid animation complexities in tests
mock.module('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
            <div {...props}>{children}</div>
        )
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

const mockProduct: Product = {
    id: 'test-product',
    permalink: 'test-product',
    name: 'Test Product',
    tagline: 'A test product',
    secondaryTagline: '',
    description: 'Test description',
    price: 49,
    priceDisplay: '$49',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'productivity',
    secondaryCategories: [],
    tags: [],
    features: [],
    benefits: {
        immediate: [],
        systematic: [],
        longTerm: []
    },
    included: [],
    guarantees: ['30-day money-back guarantee'],
    trustBadges: [],
    screenshots: [],
    testimonials: [],
    faqs: [],
    featured: false,
    bestValue: false,
    bestseller: false,
    status: 'active',
    priority: 50,
    coverImage: '',
    videoUrl: '',
    demoUrl: '',
    landingPageUrl: '',
    dsebastienUrl: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    problem: '',
    problemPoints: [],
    agitate: '',
    agitatePoints: [],
    solution: '',
    solutionPoints: [],
    targetAudience: [],
    perfectFor: [],
    notForYou: [],
    crossSellIds: []
}

const mockProductWithVariants: Product = {
    ...mockProduct,
    variants: [
        {
            name: 'Basic',
            price: 29,
            priceDisplay: '$29',
            description: 'Basic package',
            gumroadUrl: 'https://gumroad.com/test-basic'
        },
        {
            name: 'Pro',
            price: 49,
            priceDisplay: '$49',
            description: 'Pro package',
            gumroadUrl: 'https://gumroad.com/test-pro'
        }
    ]
}

describe('StickyBuyButton', () => {
    beforeEach(() => {
        // Reset scroll position
        window.scrollY = 0
        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = mock(() => ({
            top: 100,
            bottom: 200,
            left: 0,
            right: 0,
            width: 100,
            height: 100,
            x: 0,
            y: 100,
            toJSON: () => {}
        }))
    })

    afterEach(() => {})

    it('should not render initially when scroll is at top', () => {
        const { queryByText } = render(<StickyBuyButton product={mockProduct} />)

        // The button should not be visible initially (wrapped in AnimatePresence with isVisible=false)
        const buyButton = queryByText(/Buy Test Product Now/i)
        expect(buyButton).not.toBeInTheDocument()
    })

    it('should render with product name and price', async () => {
        window.scrollY = 600 // Trigger visibility
        const { getAllByText } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            // Product name appears twice (mobile and desktop layouts)
            const productNames = getAllByText('Test Product')
            expect(productNames.length).toBeGreaterThanOrEqual(1)
            // Price appears twice (mobile and desktop layouts)
            const prices = getAllByText('$49')
            expect(prices.length).toBeGreaterThanOrEqual(1)
        })
    })

    it('should render buy button with correct link', async () => {
        window.scrollY = 600
        const { getByText } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            const buyButton = getByText(/Buy Test Product Now/i).closest('a')
            expect(buyButton).toHaveAttribute('href', expect.stringContaining('gumroad.com/test'))
            expect(buyButton).toHaveAttribute('data-gumroad-overlay-checkout', 'true')
        })
    })

    it('should show product tagline', async () => {
        window.scrollY = 600
        const { getByText } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            expect(getByText('A test product')).toBeInTheDocument()
        })
    })

    it('should display guarantee when available', async () => {
        window.scrollY = 600
        const { getByText } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            expect(getByText('30-day money-back guarantee')).toBeInTheDocument()
        })
    })

    it('should use first variant when variants are provided', async () => {
        window.scrollY = 600
        const { getAllByText, getByText } = render(
            <StickyBuyButton product={mockProductWithVariants} />
        )

        await waitFor(() => {
            // Price appears in both mobile and desktop layouts
            const prices = getAllByText('$29')
            expect(prices.length).toBeGreaterThanOrEqual(1)
            const buyButton = getByText(/Buy Test Product Now/i).closest('a')
            expect(buyButton).toHaveAttribute(
                'href',
                expect.stringContaining('gumroad.com/test-basic')
            )
        })
    })

    it('should render shopping cart icon', async () => {
        window.scrollY = 600
        const { container } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            const svgElements = container.querySelectorAll('svg')
            expect(svgElements.length).toBeGreaterThan(0)
        })
    })

    it('should have proper accessibility attributes', async () => {
        window.scrollY = 600
        const { getByText } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            const buyButton = getByText(/Buy Test Product Now/i).closest('a')
            expect(buyButton).toHaveAttribute('data-gumroad-overlay-checkout', 'true')
            expect(buyButton).toHaveClass('bg-secondary')
        })
    })

    it('should handle products with no guarantees', async () => {
        window.scrollY = 600
        const productNoGuarantees = { ...mockProduct, guarantees: [] }
        const { queryByText } = render(<StickyBuyButton product={productNoGuarantees} />)

        await waitFor(() => {
            expect(queryByText(/guarantee/i)).not.toBeInTheDocument()
        })
    })

    it('should render with fixed positioning classes', async () => {
        window.scrollY = 600
        const { container } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            const stickyContainer = container.querySelector('.fixed')
            expect(stickyContainer).toBeInTheDocument()
            expect(stickyContainer).toHaveClass('bottom-0', 'left-0', 'right-0', 'z-50')
        })
    })

    it('should show both mobile and desktop layouts', async () => {
        window.scrollY = 600
        const { getByText } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            // Mobile layout has "Buy Now" text
            const mobileButton = getByText(/Buy Now/i)
            expect(mobileButton).toBeInTheDocument()

            // Desktop layout has full product name
            const desktopButton = getByText(/Buy Test Product Now/i)
            expect(desktopButton).toBeInTheDocument()
        })
    })

    it('should use default variant when no variants provided', async () => {
        window.scrollY = 600
        const productNoVariants = { ...mockProduct, variants: undefined }
        const { getAllByText, getByText } = render(<StickyBuyButton product={productNoVariants} />)

        await waitFor(() => {
            // Price appears in both mobile and desktop layouts
            const prices = getAllByText('$49')
            expect(prices.length).toBeGreaterThanOrEqual(1)
            const buyButton = getByText(/Buy Test Product Now/i).closest('a')
            expect(buyButton).toHaveAttribute('href', expect.stringContaining('gumroad.com/test'))
        })
    })
})
