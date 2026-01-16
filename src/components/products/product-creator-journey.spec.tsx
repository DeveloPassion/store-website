import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import ProductCreatorJourney from './product-creator-journey'
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
    ratingsCount: null,
    averageRating: null,
    salesCopy: {
        tagline: 'Test tagline',
        secondaryTagline: null,
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
        keywords: [],
        storytelling: null,
        timeline: null,
        courseContent: null
    },
    ...overrides
})

describe('ProductCreatorJourney Component', () => {
    it('should render nothing when creatorJourney is undefined', () => {
        const product = createMockProduct()
        const { container } = render(<ProductCreatorJourney product={product} />)
        expect(container.innerHTML).toBe('')
    })

    it('should render creator journey content', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    originStory: null,
                    creatorJourney: {
                        title: 'My Journey',
                        subtitle: 'How I got here',
                        story: 'I started from nothing and built something amazing.',
                        struggles: null,
                        achievements: null,
                        credentials: null,
                        icon: null
                    },
                    transformationArc: null,
                    successStories: null,
                    methodology: null,
                    vision: null
                }
            }
        })
        const { getByText } = render(<ProductCreatorJourney product={product} />)

        expect(getByText('My Journey')).toBeInTheDocument()
        expect(getByText('I started from nothing and built something amazing.')).toBeInTheDocument()
    })

    it('should render struggles and achievements', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    originStory: null,
                    creatorJourney: {
                        title: 'Journey',
                        subtitle: null,
                        story: 'My story here.',
                        struggles: ['Lack of resources', 'Imposter syndrome'],
                        achievements: ['10,000 customers', '5 books published'],
                        credentials: null,
                        icon: null
                    },
                    transformationArc: null,
                    successStories: null,
                    methodology: null,
                    vision: null
                }
            }
        })
        const { getByText } = render(<ProductCreatorJourney product={product} />)

        expect(getByText('Lack of resources')).toBeInTheDocument()
        expect(getByText('10,000 customers')).toBeInTheDocument()
    })

    it('should render emoji icon when provided', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    originStory: null,
                    creatorJourney: {
                        title: 'Journey',
                        subtitle: null,
                        story: 'My story here.',
                        struggles: null,
                        achievements: null,
                        credentials: null,
                        icon: '🛤️'
                    },
                    transformationArc: null,
                    successStories: null,
                    methodology: null,
                    vision: null
                }
            }
        })
        const { getByText } = render(<ProductCreatorJourney product={product} />)

        expect(getByText('🛤️')).toBeInTheDocument()
    })
})
