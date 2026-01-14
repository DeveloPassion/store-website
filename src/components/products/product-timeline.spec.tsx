import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import ProductTimeline from './product-timeline'
import type { Product } from '@/schemas/product.schema'

// Mock framer-motion
mock.module('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { initial, whileInView, viewport, transition, ...domProps } = props as Record<
                string,
                unknown
            >
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
                    timeline: undefined
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
                    timeline: {
                        title: 'Journey',
                        subtitle: 'Your path',
                        milestones: []
                    }
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
                    timeline: {
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Start',
                                description: 'Begin your journey today.'
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)
            expect(getByText('Your Transformation Journey')).toBeInTheDocument()
        })

        it('should render default subtitle when not provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: {
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Start',
                                description: 'Begin your journey today.'
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)
            expect(getByText("See what you'll achieve over time")).toBeInTheDocument()
        })

        it('should render custom title when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: {
                        title: 'Your Custom Journey',
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Start',
                                description: 'Begin your journey today.'
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)
            expect(getByText('Your Custom Journey')).toBeInTheDocument()
        })

        it('should render custom subtitle when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: {
                        subtitle: 'Follow this path to success',
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Start',
                                description: 'Begin your journey today.'
                            }
                        ]
                    }
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
                    timeline: {
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Foundation',
                                description: 'Build your foundation for success.'
                            }
                        ]
                    }
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
                    timeline: {
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Foundation',
                                description: 'Build your foundation for success.'
                            },
                            {
                                id: 'month-1',
                                timeframe: 'Month 1',
                                title: 'Momentum',
                                description: 'Build consistent habits and routines.'
                            },
                            {
                                id: 'month-3',
                                timeframe: 'Month 3',
                                title: 'Mastery',
                                description: 'Experience compound growth effects.'
                            }
                        ]
                    }
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
                    timeline: {
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Start',
                                description: 'Begin your journey today.'
                            },
                            {
                                id: 'week-2',
                                timeframe: 'Week 2',
                                title: 'Continue',
                                description: 'Keep building momentum.'
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductTimeline product={product} />)

            expect(getByText('1')).toBeInTheDocument()
            expect(getByText('2')).toBeInTheDocument()
        })
    })

    describe('highlights rendering', () => {
        it('should render highlights when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: {
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Foundation',
                                description: 'Build your foundation for success.',
                                highlights: [
                                    'System configured',
                                    'Initial workflows set',
                                    'First results visible'
                                ]
                            }
                        ]
                    }
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
                    timeline: {
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Foundation',
                                description: 'Build your foundation for success.',
                                highlights: []
                            }
                        ]
                    }
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
                    timeline: {
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Foundation',
                                description: 'Build your foundation for success.'
                            }
                        ]
                    }
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
                    timeline: {
                        milestones: [
                            {
                                id: 'day-1',
                                timeframe: 'Day 1',
                                title: 'First Day',
                                description: 'Your first day starts here.'
                            },
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'First Week',
                                description: 'Your first week journey.'
                            },
                            {
                                id: 'month-1',
                                timeframe: 'Month 1',
                                title: 'First Month',
                                description: 'Your first month progress.'
                            },
                            {
                                id: 'quarter',
                                timeframe: '3 Months',
                                title: 'First Quarter',
                                description: 'Your first quarter results.'
                            }
                        ]
                    }
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
                    timeline: {
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Start',
                                description: 'Begin your journey today.'
                            }
                        ]
                    }
                }
            })
            const { container } = render(<ProductTimeline product={product} />)
            expect(container.querySelector('section')).toBeInTheDocument()
        })

        it('should render milestone titles as h3 headings', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    timeline: {
                        milestones: [
                            {
                                id: 'week-1',
                                timeframe: 'Week 1',
                                title: 'Foundation',
                                description: 'Build your foundation for success.'
                            }
                        ]
                    }
                }
            })
            const { container } = render(<ProductTimeline product={product} />)

            const h3 = container.querySelector('h3')
            expect(h3).toBeInTheDocument()
            expect(h3?.textContent).toBe('Foundation')
        })
    })
})
