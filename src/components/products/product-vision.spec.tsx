import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import ProductVision from './product-vision'
import type { Product } from '@/schemas/product.schema'

// Mock framer-motion - filter out animation props before passing to DOM
mock.module('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
            const animationProps = ['initial', 'whileInView', 'viewport', 'transition', 'variants']
            const domProps = Object.fromEntries(
                Object.entries(props).filter(([key]) => !animationProps.includes(key))
            )
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
    tags: ['ai'],
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
    stats: null,
    variants: null,
    isSubscription: false,
    paymentFrequencies: null,
    defaultPaymentFrequency: null,
    activeSalesCopyId: 'default',
    salesCopy: {
        tagline: 'Test tagline',
        problem: 'Test problem',
        problemPoints: [],
        agitate: 'Test agitate',
        agitatePoints: [],
        solution: 'Test solution',
        solutionPoints: [],
        description: 'Test description',
        features: [],
        benefits: { immediate: [], systematic: [], longTerm: [] },
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

describe('ProductVision Component', () => {
    it('should render nothing when vision is undefined', () => {
        const product = createMockProduct()
        const { container } = render(<ProductVision product={product} />)
        expect(container.innerHTML).toBe('')
    })

    it('should render vision content', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    vision: {
                        title: 'Our Vision',
                        subtitle: 'Where we are headed',
                        mission: 'To help everyone succeed in their goals.'
                    }
                }
            }
        })
        const { getByText } = render(<ProductVision product={product} />)

        expect(getByText('Our Vision')).toBeInTheDocument()
        expect(getByText('To help everyone succeed in their goals.')).toBeInTheDocument()
    })

    it('should render values with emoji icons', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    vision: {
                        title: 'Vision',
                        mission: 'Our mission statement here.',
                        values: [
                            { title: 'Innovation', description: 'We push boundaries.', icon: '💡' }
                        ]
                    }
                }
            }
        })
        const { getByText } = render(<ProductVision product={product} />)

        expect(getByText('Innovation')).toBeInTheDocument()
        expect(getByText('💡')).toBeInTheDocument()
    })

    it('should render future goals', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    vision: {
                        title: 'Vision',
                        mission: 'Our mission here.',
                        futureGoals: ['Reach 10,000 users', 'Launch mobile app']
                    }
                }
            }
        })
        const { getByText } = render(<ProductVision product={product} />)

        expect(getByText('Reach 10,000 users')).toBeInTheDocument()
        expect(getByText('Launch mobile app')).toBeInTheDocument()
    })
})
