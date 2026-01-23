import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import ProductSuccessStories from './product-success-stories'
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
    targetExperienceLevel: 'all-levels',
    deliveryStyle: 'hybrid',
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

describe('ProductSuccessStories Component', () => {
    it('should render nothing when successStories is undefined', () => {
        const product = createMockProduct()
        const { container } = render(<ProductSuccessStories product={product} />)
        expect(container.innerHTML).toBe('')
    })

    it('should render nothing when stories array is empty', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    originStory: null,
                    creatorJourney: null,
                    transformationArc: null,
                    successStories: {
                        title: 'Success Stories',
                        subtitle: null,
                        stories: []
                    },
                    methodology: null,
                    vision: null
                }
            }
        })
        const { container } = render(<ProductSuccessStories product={product} />)
        expect(container.innerHTML).toBe('')
    })

    it('should render success stories', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    originStory: null,
                    creatorJourney: null,
                    transformationArc: null,
                    successStories: {
                        title: 'Customer Success',
                        subtitle: null,
                        stories: [
                            {
                                name: 'John Doe',
                                role: 'CEO',
                                company: 'Acme Corp',
                                result: 'Increased productivity by 300% in just 3 months.',
                                metrics: null,
                                quote: null,
                                image: null,
                                avatarUrl: null
                            }
                        ]
                    },
                    methodology: null,
                    vision: null
                }
            }
        })
        const { getByText } = render(<ProductSuccessStories product={product} />)

        expect(getByText('Customer Success')).toBeInTheDocument()
        expect(getByText('John Doe')).toBeInTheDocument()
        expect(getByText('CEO')).toBeInTheDocument()
        expect(getByText('Acme Corp')).toBeInTheDocument()
    })

    it('should render metrics with emoji icons', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    originStory: null,
                    creatorJourney: null,
                    transformationArc: null,
                    successStories: {
                        title: 'Success',
                        subtitle: null,
                        stories: [
                            {
                                name: 'Jane',
                                role: null,
                                company: null,
                                result: 'Amazing results achieved.',
                                metrics: [{ label: 'saved', value: '10 hours/week', icon: '⏰' }],
                                quote: null,
                                image: null,
                                avatarUrl: null
                            }
                        ]
                    },
                    methodology: null,
                    vision: null
                }
            }
        })
        const { getByText } = render(<ProductSuccessStories product={product} />)

        expect(getByText('⏰')).toBeInTheDocument()
        expect(getByText('10 hours/week')).toBeInTheDocument()
    })

    it('should render quote when provided', () => {
        const product = createMockProduct({
            salesCopy: {
                ...createMockProduct().salesCopy!,
                storytelling: {
                    originStory: null,
                    creatorJourney: null,
                    transformationArc: null,
                    successStories: {
                        title: 'Success',
                        subtitle: null,
                        stories: [
                            {
                                name: 'Mike',
                                role: null,
                                company: null,
                                result: 'Great results here.',
                                metrics: null,
                                quote: 'This changed my life!',
                                image: null,
                                avatarUrl: null
                            }
                        ]
                    },
                    methodology: null,
                    vision: null
                }
            }
        })
        const { getByText } = render(<ProductSuccessStories product={product} />)

        expect(getByText('This changed my life!')).toBeInTheDocument()
    })
})
