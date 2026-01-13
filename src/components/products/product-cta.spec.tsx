import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import ProductCTA from './product-cta'
import type { Product } from '@/schemas/product.schema'

// Mock framer-motion - Bun will handle motion components automatically
mock.module('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
            // Filter out framer-motion specific props
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { initial, whileInView, viewport, ...domProps } = props as Record<string, unknown>
            return <div {...domProps}>{children}</div>
        }
    }
}))

const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-product',
    name: 'Test Product',
    price: 99.99,
    priceDisplay: '€99.99',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'guides',
    secondaryCategories: [],
    tags: ['ai'], // Use valid tag ID from TagIdSchema
    included: ['Item 1'],
    testimonials: [],
    faqs: [],
    featured: false,
    bestseller: false,
    bestValue: false,
    priority: 50,
    crossSellIds: [],
    media: [],
    landingPageUrl: null,
    dsebastienUrl: null,
    statsProof: null,
    variants: null,
    isSubscription: false,
    paymentFrequencies: null,
    defaultPaymentFrequency: null,
    activeSalesCopyId: 'default',
    salesCopy: {
        tagline: 'Test tagline',
        problem: 'Test problem',
        problemPoints: ['Problem point 1'],
        agitate: 'Test agitate',
        agitatePoints: ['Agitate point 1'],
        solution: 'Test solution',
        solutionPoints: ['Solution point 1'],
        description: 'Test description',
        features: ['Feature 1'],
        benefits: { immediate: ['Benefit 1'], systematic: [], longTerm: [] },
        targetAudience: [],
        perfectFor: [],
        notForYou: [],
        trustBadges: [],
        guarantees: [],
        metaTitle: '',
        metaDescription: '',
        keywords: []
    },
    ...overrides
})

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ProductCTA Component', () => {
    beforeEach(() => {})

    it('should render with product name', () => {
        const product = createMockProduct({ name: 'Awesome Product' })
        const { getByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('Buy Now')).toBeInTheDocument()
    })

    it('should display product price', () => {
        const product = createMockProduct({ priceDisplay: '€149.99' })
        const { getByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('€149.99')).toBeInTheDocument()
    })

    it('should show headline and description', () => {
        const product = createMockProduct()
        const { getByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('Ready to Get Started?')).toBeInTheDocument()
        expect(
            getByText('Join thousands of satisfied users and transform the way you work today.')
        ).toBeInTheDocument()
    })

    it('should display one-time payment message', () => {
        const product = createMockProduct()
        const { getByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('One-Time Payment')).toBeInTheDocument()
        expect(getByText('Lifetime access. No subscriptions.')).toBeInTheDocument()
    })

    it('should have correct Gumroad URL with wanted=true and quantity=1 parameters', () => {
        const product = createMockProduct({ gumroadUrl: 'https://gumroad.com/test-product' })

        const { getByRole } = renderWithRouter(<ProductCTA product={product} />)

        const buyButton = getByRole('link', { name: /buy now/i })
        expect(buyButton).toHaveAttribute(
            'href',
            'https://gumroad.com/test-product?wanted=true&quantity=1'
        )
        expect(buyButton).toHaveAttribute('data-gumroad-overlay-checkout', 'true')
    })

    it('should handle Gumroad URL with existing query parameters', () => {
        const product = createMockProduct({
            gumroadUrl: 'https://gumroad.com/test-product?discount=SAVE20'
        })

        const { getByRole } = renderWithRouter(<ProductCTA product={product} />)

        const buyButton = getByRole('link', { name: /buy now/i })
        expect(buyButton).toHaveAttribute(
            'href',
            'https://gumroad.com/test-product?discount=SAVE20&wanted=true&quantity=1'
        )
    })

    it('should use # as href when gumroadUrl is undefined', () => {
        const product = createMockProduct({ gumroadUrl: undefined })

        const { getByRole } = renderWithRouter(<ProductCTA product={product} />)

        const buyButton = getByRole('link', { name: /buy now/i })
        expect(buyButton).toHaveAttribute('href', '#')
    })

    it('should show Get Now for free products', () => {
        const product = createMockProduct({ price: 0, priceTier: 'free' })
        const { getByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('Get Now')).toBeInTheDocument()
    })

    it('should show Subscribe Now for subscription products', () => {
        const product = createMockProduct({ isSubscription: true })
        const { getByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('Subscribe Now')).toBeInTheDocument()
    })

    it('should display trust badges', () => {
        const product = createMockProduct()
        const { getByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('Secure Checkout')).toBeInTheDocument()
        expect(getByText('Safe Payment')).toBeInTheDocument()
        expect(getByText('All Cards Accepted')).toBeInTheDocument()
        expect(getByText('Money-Back Guarantee')).toBeInTheDocument()
    })

    it('should display product guarantees when provided', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy,
                guarantees: ['30-Day Money Back', 'Lifetime Updates']
            }
        })
        const { getByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('30-Day Money Back')).toBeInTheDocument()
        expect(getByText('Lifetime Updates')).toBeInTheDocument()
    })

    it('should not render guarantees section when empty', () => {
        const product = createMockProduct({
            salesCopy: { ...createMockProduct().salesCopy, guarantees: [] }
        })
        const { container } = renderWithRouter(<ProductCTA product={product} />)

        // The guarantees div should not exist
        const guaranteesDiv = container.querySelector('.text-secondary')
        expect(guaranteesDiv).not.toHaveTextContent('Lifetime Updates')
    })

    it('should display product trust badges when provided', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy,
                trustBadges: ['Trusted by 10,000+', 'Featured on Product Hunt']
            }
        })
        const { getByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('Trusted by 10,000+')).toBeInTheDocument()
        expect(getByText('Featured on Product Hunt')).toBeInTheDocument()
    })

    it('should not render trust badges section when empty', () => {
        const product = createMockProduct({
            salesCopy: { ...createMockProduct().salesCopy, trustBadges: [] }
        })
        const { queryByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(queryByText('Trusted by')).not.toBeInTheDocument()
    })

    it('should display stats proof when provided', () => {
        const product = createMockProduct({
            statsProof: {
                userCount: '10,000+',
                rating: '4.9/5',
                timeSaved: '20 hours/month'
            }
        })
        const { getByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('10,000+')).toBeInTheDocument()
        expect(getByText('Happy Users')).toBeInTheDocument()
        expect(getByText('4.9/5')).toBeInTheDocument()
        expect(getByText('Average Rating')).toBeInTheDocument()
    })

    it('should not render stats proof section when not provided', () => {
        const product = createMockProduct({ statsProof: undefined })
        const { queryByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(queryByText('Happy Users')).not.toBeInTheDocument()
        expect(queryByText('Average Rating')).not.toBeInTheDocument()
    })

    it('should display stats proof partially when only some fields provided', () => {
        const product = createMockProduct({
            statsProof: {
                userCount: '5,000+'
            }
        })
        const { getByText, queryByText } = renderWithRouter(<ProductCTA product={product} />)

        expect(getByText('5,000+')).toBeInTheDocument()
        expect(getByText('Happy Users')).toBeInTheDocument()
        expect(queryByText('Average Rating')).not.toBeInTheDocument()
    })

    it('should have proper styling classes', () => {
        const product = createMockProduct()
        const { container, getByRole } = renderWithRouter(<ProductCTA product={product} />)

        const buyButton = getByRole('link', { name: /buy now/i })
        expect(buyButton).toHaveClass('bg-secondary')
        expect(buyButton).toHaveClass('hover:bg-secondary/90')

        const section = container.querySelector('section')
        expect(section).toHaveClass('border-t')
    })

    it('should render icon components', () => {
        const product = createMockProduct()
        const { container } = renderWithRouter(<ProductCTA product={product} />)

        // Should have SVG icons for trust badges
        const icons = container.querySelectorAll('svg')
        expect(icons.length).toBeGreaterThan(0)
    })
})
