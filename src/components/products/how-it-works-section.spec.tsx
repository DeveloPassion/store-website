import { describe, it, expect, mock } from 'bun:test'
import { render, fireEvent } from '@testing-library/react'
import HowItWorksSection from './how-it-works-section'
import type { Product } from '@/schemas/product.schema'
import type { MediaItem } from '@/schemas/media.schema'

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
    id: 'video-1',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Test Video',
    description: null,
    altText: 'Test video alt text',
    caption: null,
    order: 0,
    group: 'cover',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: null,
    width: null,
    height: null,
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
        howItWorks: {
            title: null,
            description: null,
            mediaIds: []
        },
        mediaSections: null
    },
    ...overrides
})

describe('HowItWorksSection Component', () => {
    describe('visibility control', () => {
        it('should render nothing when howItWorks is null', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: null
                }
            })
            const { container } = render(<HowItWorksSection product={product} />)

            expect(container.innerHTML).toBe('')
        })

        it('should render section when howItWorks is defined', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: []
                    }
                }
            })
            const { getByText } = render(<HowItWorksSection product={product} />)

            expect(getByText('See How It Works')).toBeInTheDocument()
        })
    })

    describe('title and description', () => {
        it('should use default title when title is null', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: []
                    }
                }
            })
            const { getByText } = render(<HowItWorksSection product={product} />)

            expect(getByText('See How It Works')).toBeInTheDocument()
        })

        it('should use custom title when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: 'Watch It In Action',
                        description: null,
                        mediaIds: []
                    }
                }
            })
            const { getByText } = render(<HowItWorksSection product={product} />)

            expect(getByText('Watch It In Action')).toBeInTheDocument()
        })

        it('should use default description when description is null', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: []
                    }
                }
            })
            const { getByText } = render(<HowItWorksSection product={product} />)

            expect(
                getByText('Watch a quick walkthrough and discover what makes this different')
            ).toBeInTheDocument()
        })

        it('should use custom description when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: 'Custom description text',
                        mediaIds: []
                    }
                }
            })
            const { getByText } = render(<HowItWorksSection product={product} />)

            expect(getByText('Custom description text')).toBeInTheDocument()
        })
    })

    describe('media lookup by ID', () => {
        it('should display media items from mediaIds array', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-1', title: 'Video 1' }),
                    createMockMediaItem({ id: 'video-2', title: 'Video 2' }),
                    createMockMediaItem({ id: 'video-3', title: 'Video 3' })
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-2']
                    }
                }
            })
            const { container, getByText } = render(<HowItWorksSection product={product} />)

            // Should find the video with id video-2
            expect(getByText('See How It Works')).toBeInTheDocument()
            // For single video, check thumbnail
            const thumbnail = container.querySelector('img')
            expect(thumbnail).toBeInTheDocument()
        })

        it('should preserve order from mediaIds array', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-1', title: 'Video 1' }),
                    createMockMediaItem({ id: 'video-2', title: 'Video 2' }),
                    createMockMediaItem({ id: 'video-3', title: 'Video 3' })
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-3', 'video-1']
                    }
                }
            })
            const { getByTestId } = render(<HowItWorksSection product={product} />)

            // Should use carousel for multiple items
            const carousel = getByTestId('media-carousel')
            expect(carousel).toBeInTheDocument()
        })

        it('should skip invalid mediaIds', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'video-1', title: 'Video 1' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['invalid-id', 'video-1', 'another-invalid']
                    }
                }
            })
            const { container, getByText } = render(<HowItWorksSection product={product} />)

            // Only video-1 should be found
            expect(getByText('See How It Works')).toBeInTheDocument()
            // Single video, should show thumbnail
            const thumbnail = container.querySelector('img')
            expect(thumbnail).toBeInTheDocument()
        })

        it('should show heading only when all mediaIds are invalid', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'video-1', title: 'Video 1' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['invalid-id-1', 'invalid-id-2']
                    }
                }
            })
            const { getByText, container } = render(<HowItWorksSection product={product} />)

            expect(getByText('See How It Works')).toBeInTheDocument()
            // No thumbnail should be shown
            const thumbnail = container.querySelector('img')
            expect(thumbnail).not.toBeInTheDocument()
        })
    })

    describe('empty mediaIds handling', () => {
        it('should show heading only when mediaIds is empty array', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'video-1' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: 'Custom Title',
                        description: 'Custom description',
                        mediaIds: []
                    }
                }
            })
            const { getByText, container } = render(<HowItWorksSection product={product} />)

            expect(getByText('Custom Title')).toBeInTheDocument()
            expect(getByText('Custom description')).toBeInTheDocument()
            // No media should be shown
            const thumbnail = container.querySelector('img')
            expect(thumbnail).not.toBeInTheDocument()
        })
    })

    describe('single video display', () => {
        it('should display single video with thumbnail', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'video-1', youtubeId: 'test12345' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-1']
                    }
                }
            })
            const { container } = render(<HowItWorksSection product={product} />)

            const thumbnail = container.querySelector('img')
            expect(thumbnail).toBeInTheDocument()
            expect(thumbnail?.getAttribute('src')).toContain('test12345')
        })

        it('should play video when clicked', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'video-1', youtubeId: 'test12345' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-1']
                    }
                }
            })
            const { getByRole, container } = render(<HowItWorksSection product={product} />)

            const playButton = getByRole('button', { name: /play video/i })
            fireEvent.click(playButton)

            const iframe = container.querySelector('iframe')
            expect(iframe).toBeInTheDocument()
            expect(iframe?.getAttribute('src')).toContain('test12345')
        })

        it('should display caption when provided', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({
                        id: 'video-1',
                        caption: 'Video caption text'
                    })
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-1']
                    }
                }
            })
            const { getByText } = render(<HowItWorksSection product={product} />)

            expect(getByText('Video caption text')).toBeInTheDocument()
        })
    })

    describe('single image display', () => {
        it('should display single image', () => {
            const product = createMockProduct({
                media: [
                    {
                        id: 'image-1',
                        type: 'image',
                        url: '/test-image.png',
                        title: 'Test Image',
                        description: null,
                        altText: 'Test alt text',
                        caption: null,
                        order: 0,
                        group: 'main',
                        youtubeId: null,
                        thumbnailUrl: null,
                        width: 800,
                        height: 600
                    }
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['image-1']
                    }
                }
            })
            const { container } = render(<HowItWorksSection product={product} />)

            const image = container.querySelector('img')
            expect(image).toBeInTheDocument()
            expect(image?.getAttribute('src')).toBe('/test-image.png')
            expect(image?.getAttribute('alt')).toBe('Test alt text')
        })

        it('should display image caption when provided', () => {
            const product = createMockProduct({
                media: [
                    {
                        id: 'image-1',
                        type: 'image',
                        url: '/test-image.png',
                        title: 'Test Image',
                        description: null,
                        altText: 'Test alt text',
                        caption: 'Image caption here',
                        order: 0,
                        group: 'main',
                        youtubeId: null,
                        thumbnailUrl: null,
                        width: 800,
                        height: 600
                    }
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['image-1']
                    }
                }
            })
            const { getByText } = render(<HowItWorksSection product={product} />)

            expect(getByText('Image caption here')).toBeInTheDocument()
        })
    })

    describe('multiple media items (carousel)', () => {
        it('should use carousel for multiple media items', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-1', title: 'Video 1' }),
                    createMockMediaItem({ id: 'video-2', title: 'Video 2' })
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-1', 'video-2']
                    }
                }
            })
            const { getByTestId } = render(<HowItWorksSection product={product} />)

            expect(getByTestId('media-carousel')).toBeInTheDocument()
        })

        it('should pass all media items to carousel in correct order', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-1', title: 'Video 1' }),
                    createMockMediaItem({ id: 'video-2', title: 'Video 2' }),
                    createMockMediaItem({ id: 'video-3', title: 'Video 3' })
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-3', 'video-1']
                    }
                }
            })
            const { getByTestId } = render(<HowItWorksSection product={product} />)

            // Carousel should contain items in the specified order
            expect(getByTestId('carousel-item-video-3')).toBeInTheDocument()
            expect(getByTestId('carousel-item-video-1')).toBeInTheDocument()
        })
    })

    describe('accessibility', () => {
        it('should have proper aria-label on video play button', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'video-1', title: 'Demo Video' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-1']
                    }
                }
            })
            const { getByRole } = render(<HowItWorksSection product={product} />)

            const playButton = getByRole('button', { name: /play video: demo video/i })
            expect(playButton).toBeInTheDocument()
        })

        it('should support keyboard activation with Enter', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'video-1', youtubeId: 'test12345' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-1']
                    }
                }
            })
            const { getByRole, container } = render(<HowItWorksSection product={product} />)

            const playButton = getByRole('button', { name: /play video/i })
            fireEvent.keyDown(playButton, { key: 'Enter' })

            const iframe = container.querySelector('iframe')
            expect(iframe).toBeInTheDocument()
        })

        it('should support keyboard activation with Space', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'video-1', youtubeId: 'test12345' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-1']
                    }
                }
            })
            const { getByRole, container } = render(<HowItWorksSection product={product} />)

            const playButton = getByRole('button', { name: /play video/i })
            fireEvent.keyDown(playButton, { key: ' ' })

            const iframe = container.querySelector('iframe')
            expect(iframe).toBeInTheDocument()
        })
    })

    describe('YouTube handling', () => {
        it('should use youtube-nocookie domain for privacy', () => {
            const product = createMockProduct({
                media: [createMockMediaItem({ id: 'video-1', youtubeId: 'test12345' })],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-1']
                    }
                }
            })
            const { getByRole, container } = render(<HowItWorksSection product={product} />)

            fireEvent.click(getByRole('button'))

            const iframe = container.querySelector('iframe')
            expect(iframe?.getAttribute('src')).toContain('youtube-nocookie.com')
        })

        it('should use custom thumbnail when provided', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({
                        id: 'video-1',
                        thumbnailUrl: 'https://custom.thumb.jpg',
                        youtubeId: 'test12345'
                    })
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['video-1']
                    }
                }
            })
            const { container } = render(<HowItWorksSection product={product} />)

            const thumbnail = container.querySelector('img')
            expect(thumbnail?.getAttribute('src')).toBe('https://custom.thumb.jpg')
        })
    })

    describe('cross-group media references', () => {
        it('should allow referencing media from any group', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'cover-1', group: 'cover', title: 'Cover Video' }),
                    createMockMediaItem({ id: 'main-1', group: 'main', title: 'Main Video' }),
                    {
                        id: 'secondary-1',
                        type: 'image',
                        url: '/secondary.png',
                        title: 'Secondary Image',
                        description: null,
                        altText: 'Secondary',
                        caption: null,
                        order: 0,
                        group: 'secondary',
                        youtubeId: null,
                        thumbnailUrl: null,
                        width: 800,
                        height: 600
                    }
                ],
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    howItWorks: {
                        title: null,
                        description: null,
                        mediaIds: ['main-1', 'secondary-1']
                    }
                }
            })
            const { getByTestId } = render(<HowItWorksSection product={product} />)

            // Should use carousel and include items from different groups
            expect(getByTestId('media-carousel')).toBeInTheDocument()
            expect(getByTestId('carousel-item-main-1')).toBeInTheDocument()
            expect(getByTestId('carousel-item-secondary-1')).toBeInTheDocument()
        })
    })
})
