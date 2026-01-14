import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import ProductTransformationArc from './product-transformation-arc'
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

describe('ProductTransformationArc Component', () => {
    it('should render nothing when transformationArc is undefined', () => {
        const product = createMockProduct()
        const { container } = render(<ProductTransformationArc product={product} />)
        expect(container.innerHTML).toBe('')
    })

    it('should render all three phases', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    transformationArc: {
                        title: 'Your Journey',
                        before: { title: 'Before', description: 'Struggling with chaos.' },
                        during: { title: 'During', description: 'Learning the system.' },
                        after: { title: 'After', description: 'Thriving with clarity.' }
                    }
                }
            }
        })
        const { getByText } = render(<ProductTransformationArc product={product} />)

        expect(getByText('Your Journey')).toBeInTheDocument()
        expect(getByText('Before')).toBeInTheDocument()
        expect(getByText('During')).toBeInTheDocument()
        expect(getByText('After')).toBeInTheDocument()
    })

    it('should render emoji icons in phases', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    transformationArc: {
                        title: 'Journey',
                        before: { title: 'Before', description: 'The struggle.', icon: '😫' },
                        during: { title: 'During', description: 'The process.', icon: '⚙️' },
                        after: { title: 'After', description: 'The success.', icon: '🏆' }
                    }
                }
            }
        })
        const { getByText } = render(<ProductTransformationArc product={product} />)

        expect(getByText('😫')).toBeInTheDocument()
        expect(getByText('⚙️')).toBeInTheDocument()
        expect(getByText('🏆')).toBeInTheDocument()
    })

    it('should render timeline summary when provided', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    transformationArc: {
                        title: 'Journey',
                        before: { title: 'Before', description: 'The struggle.' },
                        during: { title: 'During', description: 'The process.' },
                        after: { title: 'After', description: 'The success.' },
                        timeline: 'Results in 90 days'
                    }
                }
            }
        })
        const { getByText } = render(<ProductTransformationArc product={product} />)

        expect(getByText('Results in 90 days')).toBeInTheDocument()
    })
})
