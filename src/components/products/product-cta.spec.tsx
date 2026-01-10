import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import ProductCTA from './product-cta'
import type { Product } from '@/types/product'

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
            // Filter out framer-motion specific props
            const { initial, whileInView, viewport, ...domProps } = props as Record<string, unknown>
            return <div {...domProps}>{children}</div>
        }
    }
}))

const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-product',
    permalink: 'test-product',
    name: 'Test Product',
    tagline: 'Test tagline',
    price: 99.99,
    priceDisplay: '€99.99',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'guides',
    secondaryCategories: [],
    tags: ['ai'], // Use valid tag ID from TagIdSchema
    problem: 'Test problem',
    problemPoints: ['Problem point 1'],
    agitate: 'Test agitate',
    agitatePoints: ['Agitate point 1'],
    solution: 'Test solution',
    solutionPoints: ['Solution point 1'],
    description: 'Test description',
    features: ['Feature 1'],
    benefits: { immediate: ['Benefit 1'] }, // Use proper benefits structure
    included: ['Item 1'],
    testimonials: [],
    faqs: [],
    targetAudience: [],
    perfectFor: [],
    notForYou: [],
    featured: false,
    bestseller: false,
    bestValue: false,
    status: 'active',
    priority: 50,
    trustBadges: [],
    guarantees: [],
    crossSellIds: [],
    ...overrides
})

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ProductCTA Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render with product name', () => {
        const product = createMockProduct({ name: 'Awesome Product' })
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.getByText('Buy Awesome Product Now')).toBeInTheDocument()
    })

    it('should display product price', () => {
        const product = createMockProduct({ priceDisplay: '€149.99' })
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.getByText('€149.99')).toBeInTheDocument()
    })

    it('should show headline and description', () => {
        const product = createMockProduct()
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Join thousands of satisfied users and transform the way you work today.'
            )
        ).toBeInTheDocument()
    })

    it('should display one-time payment message', () => {
        const product = createMockProduct()
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.getByText('One-Time Payment')).toBeInTheDocument()
        expect(screen.getByText('Lifetime access. No subscriptions.')).toBeInTheDocument()
    })

    it('should have correct Gumroad URL with wanted=true parameter', () => {
        const product = createMockProduct({ gumroadUrl: 'https://gumroad.com/test-product' })

        renderWithRouter(<ProductCTA product={product} />)

        const buyButton = screen.getByText('Buy Test Product Now')
        expect(buyButton).toHaveAttribute('href', 'https://gumroad.com/test-product?wanted=true')
        expect(buyButton).toHaveAttribute('data-gumroad-overlay-checkout', 'true')
    })

    it('should handle Gumroad URL with existing query parameters', () => {
        const product = createMockProduct({
            gumroadUrl: 'https://gumroad.com/test-product?discount=SAVE20'
        })

        renderWithRouter(<ProductCTA product={product} />)

        const buyButton = screen.getByText('Buy Test Product Now')
        expect(buyButton).toHaveAttribute(
            'href',
            'https://gumroad.com/test-product?discount=SAVE20&wanted=true'
        )
    })

    it('should use # as href when gumroadUrl is undefined', () => {
        const product = createMockProduct({ gumroadUrl: undefined })

        renderWithRouter(<ProductCTA product={product} />)

        const buyButton = screen.getByText('Buy Test Product Now')
        expect(buyButton).toHaveAttribute('href', '#')
    })

    it('should display trust badges', () => {
        const product = createMockProduct()
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.getByText('Secure Checkout')).toBeInTheDocument()
        expect(screen.getByText('Safe Payment')).toBeInTheDocument()
        expect(screen.getByText('All Cards Accepted')).toBeInTheDocument()
        expect(screen.getByText('Money-Back Guarantee')).toBeInTheDocument()
    })

    it('should display product guarantees when provided', () => {
        const product = createMockProduct({
            guarantees: ['30-Day Money Back', 'Lifetime Updates']
        })
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.getByText('30-Day Money Back')).toBeInTheDocument()
        expect(screen.getByText('Lifetime Updates')).toBeInTheDocument()
    })

    it('should not render guarantees section when empty', () => {
        const product = createMockProduct({ guarantees: [] })
        const { container } = renderWithRouter(<ProductCTA product={product} />)

        // The guarantees div should not exist
        const guaranteesDiv = container.querySelector('.text-secondary')
        expect(guaranteesDiv).not.toHaveTextContent('Lifetime Updates')
    })

    it('should display product trust badges when provided', () => {
        const product = createMockProduct({
            trustBadges: ['Trusted by 10,000+', 'Featured on Product Hunt']
        })
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.getByText('Trusted by 10,000+')).toBeInTheDocument()
        expect(screen.getByText('Featured on Product Hunt')).toBeInTheDocument()
    })

    it('should not render trust badges section when empty', () => {
        const product = createMockProduct({ trustBadges: [] })
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.queryByText('Trusted by')).not.toBeInTheDocument()
    })

    it('should display stats proof when provided', () => {
        const product = createMockProduct({
            statsProof: {
                userCount: '10,000+',
                rating: '4.9/5',
                timeSaved: '20 hours/month'
            }
        })
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.getByText('10,000+')).toBeInTheDocument()
        expect(screen.getByText('Happy Users')).toBeInTheDocument()
        expect(screen.getByText('4.9/5')).toBeInTheDocument()
        expect(screen.getByText('Average Rating')).toBeInTheDocument()
    })

    it('should not render stats proof section when not provided', () => {
        const product = createMockProduct({ statsProof: undefined })
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.queryByText('Happy Users')).not.toBeInTheDocument()
        expect(screen.queryByText('Average Rating')).not.toBeInTheDocument()
    })

    it('should display stats proof partially when only some fields provided', () => {
        const product = createMockProduct({
            statsProof: {
                userCount: '5,000+'
            }
        })
        renderWithRouter(<ProductCTA product={product} />)

        expect(screen.getByText('5,000+')).toBeInTheDocument()
        expect(screen.getByText('Happy Users')).toBeInTheDocument()
        expect(screen.queryByText('Average Rating')).not.toBeInTheDocument()
    })

    it('should have proper styling classes', () => {
        const product = createMockProduct()
        const { container } = renderWithRouter(<ProductCTA product={product} />)

        const buyButton = screen.getByText('Buy Test Product Now')
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
