import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import ProductMethodology from './product-methodology'
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

describe('ProductMethodology Component', () => {
    it('should render nothing when methodology is undefined', () => {
        const product = createMockProduct()
        const { container } = render(<ProductMethodology product={product} />)
        expect(container.innerHTML).toBe('')
    })

    it('should render methodology steps', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    methodology: {
                        title: 'Our Process',
                        subtitle: 'How we do it',
                        steps: [
                            {
                                title: 'Step 1',
                                description: 'First step description here.',
                                order: 0
                            },
                            {
                                title: 'Step 2',
                                description: 'Second step description here.',
                                order: 1
                            }
                        ]
                    }
                }
            }
        })
        const { getByText } = render(<ProductMethodology product={product} />)

        expect(getByText('Our Process')).toBeInTheDocument()
        expect(getByText('Step 1')).toBeInTheDocument()
        expect(getByText('Step 2')).toBeInTheDocument()
    })

    it('should render emoji icons in steps', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    methodology: {
                        title: 'Process',
                        steps: [
                            {
                                title: 'Launch',
                                description: 'Start your journey.',
                                order: 0,
                                icon: '🚀'
                            }
                        ]
                    }
                }
            }
        })
        const { getByText } = render(<ProductMethodology product={product} />)

        expect(getByText('🚀')).toBeInTheDocument()
    })

    it('should render philosophy when provided', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    methodology: {
                        title: 'Process',
                        steps: [{ title: 'Step', description: 'Do the thing.', order: 0 }],
                        philosophy: 'Keep it simple'
                    }
                }
            }
        })
        const { getByText } = render(<ProductMethodology product={product} />)

        expect(getByText('"Keep it simple"')).toBeInTheDocument()
    })
})
