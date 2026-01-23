import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import ProductTimeline from './product-timeline'
import type { Product } from '@/schemas/product.schema'

// Mock framer-motion - filter out animation props that React DOM doesn't understand
const filterMotionProps = (props: Record<string, unknown>) => {
    const motionKeys = [
        'initial',
        'whileInView',
        'whileHover',
        'viewport',
        'transition',
        'animate',
        'exit',
        'variants'
    ]
    return Object.fromEntries(Object.entries(props).filter(([key]) => !motionKeys.includes(key)))
}

mock.module('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <div {...filterMotionProps(props)}>{children}</div>
        )
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
    targetExperienceLevel: null,
    deliveryStyle: null,
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
    includedProducts: [],
    includedIn: [],
    salesCopy: {
        tagline: 'Test tagline',
        secondaryTagline: null,
        problem: 'Test problem',
        problemPoints: ['Problem point 1'],
        agitate: 'Test agitate',
        agitatePoints: ['Agitate point 1'],
        solution: 'Test solution',
        solutionPoints: ['Solution point 1'],
        description: 'Test description',
        highlights: ['Feature 1'],
        benefits: { immediate: ['Benefit 1'], systematic: [], longTerm: [] },
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

// Helper to create milestones with all nullable fields
const createMilestone = (
    id: string,
    timeframe: string,
    title: string,
    description: string,
    overrides: { highlights?: string[] | null; icon?: string | null } = {}
) => ({
    id,
    timeframe,
    title,
    description,
    highlights: overrides.highlights ?? null,
    icon: overrides.icon ?? null
})

// Helper to create timeline with all nullable fields
const createTimeline = (
    milestones: ReturnType<typeof createMilestone>[],
    overrides: { title?: string | null; subtitle?: string | null } = {}
) => ({
    title: overrides.title ?? null,
    subtitle: overrides.subtitle ?? null,
    milestones
})

describe('ProductTimeline Component', () => {
    describe('conditional rendering', () => {
        it('should render nothing when salesCopy is undefined', () => {
            const product = createMockProduct({ salesCopy: undefined })
            const { container } = render(<ProductTimeline product={product} />)
            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when timeline is undefined', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: null
                }
            })
            const { container } = render(<ProductTimeline product={product} />)
            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when timeline is null', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: null
                }
            })
            const { container } = render(<ProductTimeline product={product} />)
            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when milestones array is empty', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([], { title: 'Journey', subtitle: 'Your path' })
                }
            })
            const { container } = render(<ProductTimeline product={product} />)
            expect(container.innerHTML).toBe('')
        })
    })

    describe('header rendering', () => {
        it('should render default title when not provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone('week-1', 'Week 1', 'Start', 'Begin your journey today.')
                    ])
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)
            expect(getByText('Your Transformation Journey')).toBeInTheDocument()
        })

        it('should render default subtitle when not provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone('week-1', 'Week 1', 'Start', 'Begin your journey today.')
                    ])
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)
            expect(getByText("See what you'll achieve over time")).toBeInTheDocument()
        })

        it('should render custom title when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline(
                        [createMilestone('week-1', 'Week 1', 'Start', 'Begin your journey today.')],
                        { title: 'Your Custom Journey' }
                    )
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)
            expect(getByText('Your Custom Journey')).toBeInTheDocument()
        })

        it('should render custom subtitle when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline(
                        [createMilestone('week-1', 'Week 1', 'Start', 'Begin your journey today.')],
                        { subtitle: 'Follow this path to success' }
                    )
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)
            expect(getByText('Follow this path to success')).toBeInTheDocument()
        })
    })

    describe('milestone rendering', () => {
        it('should render single milestone', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone(
                            'week-1',
                            'Week 1',
                            'Foundation',
                            'Build your foundation for success.'
                        )
                    ])
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)

            expect(getByText('Week 1')).toBeInTheDocument()
            expect(getByText('Foundation')).toBeInTheDocument()
            expect(getByText('Build your foundation for success.')).toBeInTheDocument()
        })

        it('should render multiple milestones', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone(
                            'week-1',
                            'Week 1',
                            'Foundation',
                            'Build your foundation for success.'
                        ),
                        createMilestone(
                            'month-1',
                            'Month 1',
                            'Momentum',
                            'Build consistent habits and routines.'
                        ),
                        createMilestone(
                            'month-3',
                            'Month 3',
                            'Mastery',
                            'Experience compound growth effects.'
                        )
                    ])
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)

            // Check all milestones are rendered
            expect(getByText('Week 1')).toBeInTheDocument()
            expect(getByText('Foundation')).toBeInTheDocument()

            expect(getByText('Month 1')).toBeInTheDocument()
            expect(getByText('Momentum')).toBeInTheDocument()

            expect(getByText('Month 3')).toBeInTheDocument()
            expect(getByText('Mastery')).toBeInTheDocument()
        })

        it('should render milestone numbers when no icon provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone('week-1', 'Week 1', 'Start', 'Begin your journey today.'),
                        createMilestone('week-2', 'Week 2', 'Continue', 'Keep building momentum.')
                    ])
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)

            expect(getByText('1')).toBeInTheDocument()
            expect(getByText('2')).toBeInTheDocument()
        })

        it('should render emoji icons directly as text', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone('week-1', 'Week 1', 'Launch', 'Begin your journey today.', {
                            icon: '🚀'
                        }),
                        createMilestone('month-1', 'Month 1', 'Build', 'Keep building momentum.', {
                            icon: '⚙️'
                        }),
                        createMilestone('year-1', 'Year 1', 'Win', 'Celebrate your success.', {
                            icon: '🏆'
                        })
                    ])
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)

            expect(getByText('🚀')).toBeInTheDocument()
            expect(getByText('⚙️')).toBeInTheDocument()
            expect(getByText('🏆')).toBeInTheDocument()
        })
    })

    describe('highlights rendering', () => {
        it('should render highlights when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone(
                            'week-1',
                            'Week 1',
                            'Foundation',
                            'Build your foundation for success.',
                            {
                                highlights: [
                                    'System configured',
                                    'Initial workflows set',
                                    'First results visible'
                                ]
                            }
                        )
                    ])
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)

            expect(getByText('System configured')).toBeInTheDocument()
            expect(getByText('Initial workflows set')).toBeInTheDocument()
            expect(getByText('First results visible')).toBeInTheDocument()
        })

        it('should not render highlights section when empty array', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone(
                            'week-1',
                            'Week 1',
                            'Foundation',
                            'Build your foundation for success.',
                            {
                                highlights: []
                            }
                        )
                    ])
                }
            })
            const { container } = render(<ProductTimeline product={product} />)

            // Should not have any list items
            const listItems = container.querySelectorAll('li')
            expect(listItems.length).toBe(0)
        })

        it('should not render highlights section when undefined', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone(
                            'week-1',
                            'Week 1',
                            'Foundation',
                            'Build your foundation for success.'
                        )
                    ])
                }
            })
            const { container } = render(<ProductTimeline product={product} />)

            // Should not have any list items
            const listItems = container.querySelectorAll('li')
            expect(listItems.length).toBe(0)
        })
    })

    describe('timeframe variations', () => {
        it('should render various timeframe formats', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone(
                            'day-1',
                            'Day 1',
                            'First Day',
                            'Your first day starts here.'
                        ),
                        createMilestone(
                            'week-1',
                            'Week 1',
                            'First Week',
                            'Your first week journey.'
                        ),
                        createMilestone(
                            'month-1',
                            'Month 1',
                            'First Month',
                            'Your first month progress.'
                        ),
                        createMilestone(
                            'quarter',
                            '3 Months',
                            'First Quarter',
                            'Your first quarter results.'
                        )
                    ])
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)

            expect(getByText('Day 1')).toBeInTheDocument()
            expect(getByText('Week 1')).toBeInTheDocument()
            expect(getByText('Month 1')).toBeInTheDocument()
            expect(getByText('3 Months')).toBeInTheDocument()
        })
    })

    describe('accessibility', () => {
        it('should render section element', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone('week-1', 'Week 1', 'Start', 'Begin your journey today.')
                    ])
                }
            })
            const { container } = render(<ProductTimeline product={product} />)
            expect(container.querySelector('section')).toBeInTheDocument()
        })

        it('should render milestone titles as h3 headings', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: createTimeline([
                        createMilestone(
                            'week-1',
                            'Week 1',
                            'Foundation',
                            'Build your foundation for success.'
                        )
                    ])
                }
            })
            const { container } = render(<ProductTimeline product={product} />)

            const h3 = container.querySelector('h3')
            expect(h3).toBeInTheDocument()
            expect(h3?.textContent).toBe('Foundation')
        })
    })
})
