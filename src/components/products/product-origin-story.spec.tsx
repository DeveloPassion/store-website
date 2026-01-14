import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import ProductOriginStory from './product-origin-story'
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

describe('ProductOriginStory Component', () => {
    describe('conditional rendering', () => {
        it('should render nothing when storytelling is undefined', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    storytelling: undefined
                }
            })
            const { container } = render(<ProductOriginStory product={product} />)
            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when originStory is null', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    storytelling: { originStory: null }
                }
            })
            const { container } = render(<ProductOriginStory product={product} />)
            expect(container.innerHTML).toBe('')
        })
    })

    describe('content rendering', () => {
        it('should render origin story content', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    storytelling: {
                        originStory: {
                            title: 'Why We Exist',
                            subtitle: 'Our founding story',
                            story: 'This is how it all began with a simple idea.'
                        }
                    }
                }
            })
            const { getByText } = render(<ProductOriginStory product={product} />)

            expect(getByText('Why We Exist')).toBeInTheDocument()
            expect(getByText('Our founding story')).toBeInTheDocument()
            expect(getByText('This is how it all began with a simple idea.')).toBeInTheDocument()
        })

        it('should render inspiration point when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    storytelling: {
                        originStory: {
                            title: 'Origin',
                            story: 'The story begins here.',
                            inspirationPoint: 'The moment everything changed'
                        }
                    }
                }
            })
            const { getByText } = render(<ProductOriginStory product={product} />)

            expect(getByText('"The moment everything changed"')).toBeInTheDocument()
        })

        it('should render emoji icon when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    storytelling: {
                        originStory: {
                            title: 'Origin',
                            story: 'The story begins here.',
                            icon: '🚀'
                        }
                    }
                }
            })
            const { getByText } = render(<ProductOriginStory product={product} />)

            expect(getByText('🚀')).toBeInTheDocument()
        })
    })
})
