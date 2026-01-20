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
    gumroadId: null,
    isGumroadProduct: false,
    gumroadProductSlugs: null,
    price: 99.99,
    priceDisplay: '€99.99',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'guides',
    secondaryCategories: [],
    tags: ['ai'],
    contents: ['Item 1'],
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
    testimonialsCount: 0,
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
        highlights: [],
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
        courseContent: null,
        howItWorks: null,
        mediaSections: null
    },
    ...overrides
})

// Helper to create a transformation phase with all nullable fields
const createPhase = (
    title: string,
    description: string,
    overrides: { points?: string[] | null; icon?: string | null } = {}
) => ({
    title,
    description,
    points: overrides.points ?? null,
    icon: overrides.icon ?? null
})

// Helper to create a transformation arc with all nullable fields
const createTransformationArc = (
    title: string,
    before: ReturnType<typeof createPhase>,
    during: ReturnType<typeof createPhase>,
    after: ReturnType<typeof createPhase>,
    overrides: { subtitle?: string | null; timeline?: string | null } = {}
) => ({
    title,
    subtitle: overrides.subtitle ?? null,
    before,
    during,
    after,
    timeline: overrides.timeline ?? null
})

// Helper to create storytelling with transformationArc
const createStorytelling = (transformationArc: ReturnType<typeof createTransformationArc>) => ({
    originStory: null,
    creatorJourney: null,
    transformationArc,
    successStories: null,
    methodology: null,
    vision: null
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
                storytelling: createStorytelling(
                    createTransformationArc(
                        'Your Journey',
                        createPhase('Before', 'Struggling with chaos.'),
                        createPhase('During', 'Learning the system.'),
                        createPhase('After', 'Thriving with clarity.')
                    )
                )
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
                storytelling: createStorytelling(
                    createTransformationArc(
                        'Journey',
                        createPhase('Before', 'The struggle.', { icon: '😫' }),
                        createPhase('During', 'The process.', { icon: '⚙️' }),
                        createPhase('After', 'The success.', { icon: '🏆' })
                    )
                )
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
                storytelling: createStorytelling(
                    createTransformationArc(
                        'Journey',
                        createPhase('Before', 'The struggle.'),
                        createPhase('During', 'The process.'),
                        createPhase('After', 'The success.'),
                        { timeline: 'Results in 90 days' }
                    )
                )
            }
        })
        const { getByText } = render(<ProductTransformationArc product={product} />)

        expect(getByText('Results in 90 days')).toBeInTheDocument()
    })
})
