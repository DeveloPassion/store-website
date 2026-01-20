import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import MediaCarouselSection from './media-carousel-section'
import type { Product } from '@/schemas/product.schema'
import type { MediaItem } from '@/schemas/media.schema'

// Mock framer-motion
mock.module('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { initial, whileInView, whileHover, viewport, transition, ...domProps } =
                props as Record<string, unknown>
            return <div {...domProps}>{children}</div>
        }
    }
}))

// Mock the media carousel component
mock.module('@/components/products/media-carousel', () => ({
    default: ({ media }: { media: MediaItem[] }) => (
        <div data-testid='media-carousel'>
            {media.map((item) => (
                <div key={item.id} data-testid={`carousel-item-${item.id}`}>
                    {item.title}
                </div>
            ))}
        </div>
    )
}))

// Mock the media lightbox component
mock.module('@/components/products/media-lightbox', () => ({
    default: () => <div data-testid='media-lightbox' />
}))

// Mock the useMediaLightbox hook
mock.module('@/hooks/use-media-lightbox', () => ({
    useMediaLightbox: () => ({
        isOpen: false,
        selectedIndex: 0,
        open: () => {},
        close: () => {}
    })
}))

const createMockMediaItem = (overrides: Partial<MediaItem> = {}): MediaItem => ({
    id: 'image-1',
    type: 'image',
    url: '/test-image.png',
    title: 'Test Image',
    description: null,
    altText: 'Test image alt text',
    caption: null,
    order: 0,
    group: 'main',
    youtubeId: null,
    thumbnailUrl: null,
    width: 800,
    height: 600,
    ...overrides
})

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

describe('MediaCarouselSection Component', () => {
    describe('default behavior (no mediaSections config)', () => {
        it('should render nothing when no media in group', () => {
            const product = createMockProduct({ media: [] })
            const { container } = render(
                <MediaCarouselSection product={product} group='main' heading='See It In Action' />
            )

            expect(container.innerHTML).toBe('')
        })

        it('should render media from specified group', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'main-1', group: 'main' }),
                    createMockMediaItem({ id: 'secondary-1', group: 'secondary' })
                ]
            })
            const { getByTestId, queryByTestId } = render(
                <MediaCarouselSection product={product} group='main' heading='See It In Action' />
            )

            expect(getByTestId('carousel-item-main-1')).toBeInTheDocument()
            expect(queryByTestId('carousel-item-secondary-1')).not.toBeInTheDocument()
        })

        it('should use default heading from props', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'main-1', group: 'main' })]
            })
            const { getByText } = render(
                <MediaCarouselSection
                    product={product}
                    group='main'
                    heading='See It In Action'
                    description='Explore the product'
                />
            )

            expect(getByText('See It In Action')).toBeInTheDocument()
            expect(getByText('Explore the product')).toBeInTheDocument()
        })
    })

    describe('mediaSections config - visibility control', () => {
        it('should hide section when show: false', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'main-1', group: 'main' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    mediaSections: {
                        main: {
                            show: false,
                            title: null,
                            description: null,
                            mediaIds: null
                        },
                        secondary: null,
                        bonus: null
                    }
                }
            })
            const { container } = render(
                <MediaCarouselSection product={product} group='main' heading='See It In Action' />
            )

            expect(container.innerHTML).toBe('')
        })

        it('should show section with heading only when show: true and mediaIds: []', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'main-1', group: 'main' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    mediaSections: {
                        main: {
                            show: true,
                            title: 'Custom Title',
                            description: null,
                            mediaIds: []
                        },
                        secondary: null,
                        bonus: null
                    }
                }
            })
            const { getByText, queryByTestId } = render(
                <MediaCarouselSection product={product} group='main' heading='See It In Action' />
            )

            expect(getByText('Custom Title')).toBeInTheDocument()
            expect(queryByTestId('media-carousel')).not.toBeInTheDocument()
        })
    })

    describe('mediaSections config - custom title and description', () => {
        it('should use custom title from config', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'main-1', group: 'main' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    mediaSections: {
                        main: {
                            show: true,
                            title: 'Custom Main Title',
                            description: null,
                            mediaIds: null
                        },
                        secondary: null,
                        bonus: null
                    }
                }
            })
            const { getByText, queryByText } = render(
                <MediaCarouselSection product={product} group='main' heading='Default Title' />
            )

            expect(getByText('Custom Main Title')).toBeInTheDocument()
            expect(queryByText('Default Title')).not.toBeInTheDocument()
        })

        it('should use custom description from config', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'main-1', group: 'main' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    mediaSections: {
                        main: {
                            show: true,
                            title: null,
                            description: 'Custom description from config',
                            mediaIds: null
                        },
                        secondary: null,
                        bonus: null
                    }
                }
            })
            const { getByText, queryByText } = render(
                <MediaCarouselSection
                    product={product}
                    group='main'
                    heading='Title'
                    description='Default description'
                />
            )

            expect(getByText('Custom description from config')).toBeInTheDocument()
            expect(queryByText('Default description')).not.toBeInTheDocument()
        })

        it('should fallback to props when config values are null', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'main-1', group: 'main' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    mediaSections: {
                        main: {
                            show: true,
                            title: null,
                            description: null,
                            mediaIds: null
                        },
                        secondary: null,
                        bonus: null
                    }
                }
            })
            const { getByText } = render(
                <MediaCarouselSection
                    product={product}
                    group='main'
                    heading='Fallback Title'
                    description='Fallback description'
                />
            )

            expect(getByText('Fallback Title')).toBeInTheDocument()
            expect(getByText('Fallback description')).toBeInTheDocument()
        })
    })

    describe('mediaSections config - explicit mediaIds', () => {
        it('should display explicit mediaIds in order', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'main-1', group: 'main', title: 'Main 1' }),
                    createMockMediaItem({ id: 'main-2', group: 'main', title: 'Main 2' }),
                    createMockMediaItem({ id: 'main-3', group: 'main', title: 'Main 3' })
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    mediaSections: {
                        main: {
                            show: true,
                            title: null,
                            description: null,
                            mediaIds: ['main-3', 'main-1']
                        },
                        secondary: null,
                        bonus: null
                    }
                }
            })
            const { getByTestId, queryByTestId } = render(
                <MediaCarouselSection product={product} group='main' heading='Title' />
            )

            expect(getByTestId('carousel-item-main-3')).toBeInTheDocument()
            expect(getByTestId('carousel-item-main-1')).toBeInTheDocument()
            expect(queryByTestId('carousel-item-main-2')).not.toBeInTheDocument()
        })

        it('should allow cross-group media references', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'cover-1', group: 'cover', title: 'Cover' }),
                    createMockMediaItem({ id: 'main-1', group: 'main', title: 'Main' }),
                    createMockMediaItem({
                        id: 'secondary-1',
                        group: 'secondary',
                        title: 'Secondary'
                    })
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    mediaSections: {
                        main: {
                            show: true,
                            title: null,
                            description: null,
                            mediaIds: ['cover-1', 'secondary-1']
                        },
                        secondary: null,
                        bonus: null
                    }
                }
            })
            const { getByTestId, queryByTestId } = render(
                <MediaCarouselSection product={product} group='main' heading='Title' />
            )

            expect(getByTestId('carousel-item-cover-1')).toBeInTheDocument()
            expect(getByTestId('carousel-item-secondary-1')).toBeInTheDocument()
            expect(queryByTestId('carousel-item-main-1')).not.toBeInTheDocument()
        })

        it('should skip invalid mediaIds', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'main-1', group: 'main', title: 'Main 1' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    mediaSections: {
                        main: {
                            show: true,
                            title: null,
                            description: null,
                            mediaIds: ['invalid-1', 'main-1', 'invalid-2']
                        },
                        secondary: null,
                        bonus: null
                    }
                }
            })
            const { getByTestId, queryByTestId } = render(
                <MediaCarouselSection product={product} group='main' heading='Title' />
            )

            expect(getByTestId('carousel-item-main-1')).toBeInTheDocument()
            expect(queryByTestId('carousel-item-invalid-1')).not.toBeInTheDocument()
            expect(queryByTestId('carousel-item-invalid-2')).not.toBeInTheDocument()
        })
    })

    describe('mediaSections config - null vs auto', () => {
        it('should auto-display all media from group when mediaIds is null', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'main-1', group: 'main' }),
                    createMockMediaItem({ id: 'main-2', group: 'main' })
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    mediaSections: {
                        main: {
                            show: true,
                            title: null,
                            description: null,
                            mediaIds: null
                        },
                        secondary: null,
                        bonus: null
                    }
                }
            })
            const { getByTestId } = render(
                <MediaCarouselSection product={product} group='main' heading='Title' />
            )

            expect(getByTestId('carousel-item-main-1')).toBeInTheDocument()
            expect(getByTestId('carousel-item-main-2')).toBeInTheDocument()
        })

        it('should hide section when no media and no explicit show:true', () => {
            const product = createMockProduct({
                // Only secondary group media, no main group media
                media: [createMockMediaItem({ id: 'secondary-1', group: 'secondary' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    // mediaSections is null = complete auto mode
                    mediaSections: null
                }
            })
            const { container } = render(
                <MediaCarouselSection product={product} group='main' heading='Title' />
            )

            // No main group media and no explicit show:true, so section should be hidden
            expect(container.innerHTML).toBe('')
        })
    })

    describe('includeAllVideos option', () => {
        it('should include all videos when includeAllVideos is true and mediaIds is null', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'main-1', group: 'main', type: 'image' }),
                    {
                        id: 'cover-video-1',
                        type: 'video',
                        url: 'https://youtube.com/watch?v=test',
                        title: 'Cover Video',
                        description: null,
                        altText: 'Cover video',
                        caption: null,
                        order: 0,
                        group: 'cover',
                        youtubeId: 'test',
                        thumbnailUrl: null,
                        width: null,
                        height: null
                    }
                ]
            })
            const { getByTestId } = render(
                <MediaCarouselSection
                    product={product}
                    group='main'
                    heading='Title'
                    includeAllVideos={true}
                />
            )

            expect(getByTestId('carousel-item-main-1')).toBeInTheDocument()
            expect(getByTestId('carousel-item-cover-video-1')).toBeInTheDocument()
        })
    })
})
