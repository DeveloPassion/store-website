import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { render, waitFor } from '@testing-library/react'
import StickyBuyButton from './sticky-buy-button'
import type { Product } from '@/schemas/product.schema'

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
    name: 'Test Product',
    gumroadId: null,
    isGumroadProduct: false,
    gumroadProductSlugs: null,
    price: 49,
    priceDisplay: '$49',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'productivity',
    secondaryCategories: [],
    tags: [],
    contents: [],
    media: [],
    testimonials: [],
    faqs: [],
    featured: false,
    bestValue: false,
    bestseller: false,
    priority: 50,
    landingPageUrl: null,
    dsebastienUrl: null,
    crossSellIds: [],
    stats: null,
    variants: null,
    isSubscription: false,
    paymentFrequencies: null,
    defaultPaymentFrequency: null,
    activeSalesCopyId: 'default',
    ratingsCount: null,
    averageRating: null,
    testimonialsCount: 0,
    includedProducts: [],
    includedIn: [],
    salesCopy: {
        tagline: 'A test product',
        secondaryTagline: null,
        problem: '',
        problemPoints: [],
        agitate: '',
        agitatePoints: [],
        solution: '',
        solutionPoints: [],
        description: 'Test description',
        highlights: [],
        benefits: {
            immediate: [],
            systematic: [],
            longTerm: []
        },
        targetAudience: [],
        perfectFor: [],
        notForYou: [],
        trustBadges: [],
        guarantees: ['30-day money-back guarantee'],
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        storytelling: null,
        timeline: null,
        courseContent: null,
        howItWorks: null,
        mediaSections: null
    }
}

const mockProductWithVariants: Product = {
    ...mockProduct,
    variants: [
        {
            name: 'Basic',
            price: 29,
            priceDisplay: '$29',
            description: 'Basic package',
            gumroadUrl: 'https://gumroad.com/test-basic',
            gumroadVariantId: null,
            paymentFrequency: null,
            prices: null,
            includedProducts: []
        },
        {
            name: 'Pro',
            price: 49,
            priceDisplay: '$49',
            description: 'Pro package',
            gumroadUrl: 'https://gumroad.com/test-pro',
            gumroadVariantId: null,
            paymentFrequency: null,
            prices: null,
            includedProducts: []
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
        const buyButton = queryByText(/Buy Now/i)
        expect(buyButton).not.toBeInTheDocument()
    })

    it('should render with product name and price', async () => {
        window.scrollY = 600 // Trigger visibility
        const { getByText } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            expect(getByText('Test Product')).toBeInTheDocument()
            expect(getByText('$49')).toBeInTheDocument()
        })
    })

    it('should render buy button with correct link', async () => {
        window.scrollY = 600
        const { getByRole } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            const buyButton = getByRole('link')
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
        const { getByText, getByRole } = render(
            <StickyBuyButton product={mockProductWithVariants} />
        )

        await waitFor(() => {
            expect(getByText('$29')).toBeInTheDocument()
            const buyButton = getByRole('link')
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
        const { getByRole } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            const buyButton = getByRole('link')
            expect(buyButton).toHaveAttribute('data-gumroad-overlay-checkout', 'true')
            expect(buyButton).toHaveClass('bg-secondary')
        })
    })

    it('should handle products with no guarantees', async () => {
        window.scrollY = 600
        const productNoGuarantees = {
            ...mockProduct,
            salesCopy: { ...mockProduct.salesCopy, guarantees: [] }
        }
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
            expect(stickyContainer).toHaveClass('bottom-0', 'inset-x-0', 'z-50')
        })
    })

    it('should show Buy Now button text', async () => {
        window.scrollY = 600
        const { getAllByText } = render(<StickyBuyButton product={mockProduct} />)

        await waitFor(() => {
            // Button has two spans for responsive text (one with price for small screens)
            const buyButtons = getAllByText(/Buy/i)
            expect(buyButtons.length).toBeGreaterThan(0)
        })
    })

    it('should use default variant when no variants provided', async () => {
        window.scrollY = 600
        const productNoVariants = { ...mockProduct, variants: null }
        const { getByText, getByRole } = render(<StickyBuyButton product={productNoVariants} />)

        await waitFor(() => {
            expect(getByText('$49')).toBeInTheDocument()
            const buyButton = getByRole('link')
            expect(buyButton).toHaveAttribute('href', expect.stringContaining('gumroad.com/test'))
        })
    })

    it('should show Get Now for free products', async () => {
        window.scrollY = 600
        const freeProduct = { ...mockProduct, price: 0, priceTier: 'free' as const }
        const { getAllByText } = render(<StickyBuyButton product={freeProduct} />)

        await waitFor(() => {
            // Both responsive spans show "Get Now" for free products
            const getButtons = getAllByText(/Get Now/i)
            expect(getButtons.length).toBe(2)
        })
    })
})
