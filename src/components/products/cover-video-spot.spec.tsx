import { describe, it, expect, mock } from 'bun:test'
import { render, fireEvent } from '@testing-library/react'
import CoverVideoSpot from './cover-video-spot'
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

const createMockMediaItem = (overrides: Partial<MediaItem> = {}): MediaItem => ({
    id: 'video-1',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Test Video',
    altText: 'Test video alt text',
    order: 0,
    group: 'cover',
    youtubeId: 'dQw4w9WgXcQ',
    ...overrides
})

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

describe('CoverVideoSpot Component', () => {
    describe('rendering', () => {
        it('should render nothing when no cover videos exist', () => {
            const product = createMockProduct({ media: [] })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when only non-cover media exists', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ group: 'main' }),
                    createMockMediaItem({ group: 'secondary', id: 'video-2' })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when only cover images exist (no videos)', () => {
            const product = createMockProduct({
                media: [
                    {
                        id: 'image-1',
                        type: 'image',
                        url: '/test.png',
                        title: 'Test Image',
                        altText: 'Test alt',
                        order: 0,
                        group: 'cover'
                    }
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            expect(container.innerHTML).toBe('')
        })

        it('should render video at position 1 when second cover video exists (first is skipped)', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // First video (skipped)
                    createMockMediaItem({ id: 'video-1', order: 1 }) // Second video (used for position 1)
                ]
            })
            const { getByText, getByRole } = render(
                <CoverVideoSpot product={product} position={1} />
            )

            expect(getByText('See How It Works')).toBeInTheDocument()
            expect(
                getByText('Watch a quick walkthrough and discover what makes this different')
            ).toBeInTheDocument()
            expect(getByRole('button', { name: /play video/i })).toBeInTheDocument()
        })

        it('should render nothing when only one cover video exists (it gets skipped)', () => {
            const product = createMockProduct({
                media: [createMockMediaItem()]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            expect(container.innerHTML).toBe('')
        })

        it('should render video at position 2 with correct heading', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1 }), // Position 1
                    createMockMediaItem({ id: 'video-2', order: 2 }) // Position 2
                ]
            })
            const { getByText } = render(<CoverVideoSpot product={product} position={2} />)

            expect(getByText('Watch It In Action')).toBeInTheDocument()
            expect(getByText('See the real results you can achieve')).toBeInTheDocument()
        })

        it('should render video at position 3 with correct heading', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1 }), // Position 1
                    createMockMediaItem({ id: 'video-2', order: 2 }), // Position 2
                    createMockMediaItem({ id: 'video-3', order: 3 }) // Position 3
                ]
            })
            const { getByText } = render(<CoverVideoSpot product={product} position={3} />)

            expect(getByText('One More Thing...')).toBeInTheDocument()
            expect(
                getByText("Before you decide, here's something you shouldn't miss")
            ).toBeInTheDocument()
        })
    })

    describe('position-based video selection (first video skipped)', () => {
        it('should skip first video and show second video for position 1', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({
                        id: 'video-0',
                        order: 0,
                        youtubeId: 'skipped00'
                    }),
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        youtubeId: 'position1'
                    }),
                    createMockMediaItem({
                        id: 'video-2',
                        order: 2,
                        youtubeId: 'position2'
                    })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            const thumbnail = container.querySelector('img')
            expect(thumbnail?.getAttribute('src')).toContain('position1')
            expect(thumbnail?.getAttribute('src')).not.toContain('skipped00')
        })

        it('should show third video for position 2', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({
                        id: 'video-0',
                        order: 0,
                        youtubeId: 'skipped00'
                    }),
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        youtubeId: 'position1'
                    }),
                    createMockMediaItem({
                        id: 'video-2',
                        order: 2,
                        youtubeId: 'position2'
                    })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={2} />)

            const thumbnail = container.querySelector('img')
            expect(thumbnail?.getAttribute('src')).toContain('position2')
        })

        it('should show fourth video for position 3', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({
                        id: 'video-0',
                        order: 0,
                        youtubeId: 'skipped00'
                    }),
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        youtubeId: 'position1'
                    }),
                    createMockMediaItem({
                        id: 'video-2',
                        order: 2,
                        youtubeId: 'position2'
                    }),
                    createMockMediaItem({
                        id: 'video-3',
                        order: 3,
                        youtubeId: 'position3'
                    })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={3} />)

            const thumbnail = container.querySelector('img')
            expect(thumbnail?.getAttribute('src')).toContain('position3')
        })

        it('should render nothing when only first video exists (gets skipped)', () => {
            const product = createMockProduct({
                media: [createMockMediaItem()] // Only one video, will be skipped
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when requested position has no video', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1 }) // Position 1 only
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={2} />)

            expect(container.innerHTML).toBe('')
        })

        it('should sort videos by order before selecting', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({
                        id: 'video-2',
                        order: 2,
                        youtubeId: 'position2'
                    }),
                    createMockMediaItem({
                        id: 'video-0',
                        order: 0,
                        youtubeId: 'skipped00'
                    }),
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        youtubeId: 'position1'
                    })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            const thumbnail = container.querySelector('img')
            // After sorting: [skipped00, position1, position2]
            // Position 1 should get index 1 = position1
            expect(thumbnail?.getAttribute('src')).toContain('position1')
        })
    })

    describe('video playback', () => {
        it('should show thumbnail initially', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1, youtubeId: 'test12345' })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            const thumbnail = container.querySelector('img')
            expect(thumbnail).toBeInTheDocument()
            expect(thumbnail?.getAttribute('src')).toContain('test12345')
        })

        it('should show play button overlay', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1 })
                ]
            })
            const { getByText, container } = render(
                <CoverVideoSpot product={product} position={1} />
            )

            expect(getByText('Click to play')).toBeInTheDocument()
            expect(container.querySelector('svg')).toBeInTheDocument() // Play icon
        })

        it('should play video when clicked', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1, youtubeId: 'test12345' })
                ]
            })
            const { getByRole, container } = render(
                <CoverVideoSpot product={product} position={1} />
            )

            const playButton = getByRole('button', { name: /play video/i })
            fireEvent.click(playButton)

            const iframe = container.querySelector('iframe')
            expect(iframe).toBeInTheDocument()
            expect(iframe?.getAttribute('src')).toContain('test12345')
            expect(iframe?.getAttribute('src')).toContain('autoplay=1')
        })

        it('should support keyboard activation with Enter', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1, youtubeId: 'test12345' })
                ]
            })
            const { getByRole, container } = render(
                <CoverVideoSpot product={product} position={1} />
            )

            const playButton = getByRole('button', { name: /play video/i })
            fireEvent.keyDown(playButton, { key: 'Enter' })

            const iframe = container.querySelector('iframe')
            expect(iframe).toBeInTheDocument()
        })

        it('should support keyboard activation with Space', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1, youtubeId: 'test12345' })
                ]
            })
            const { getByRole, container } = render(
                <CoverVideoSpot product={product} position={1} />
            )

            const playButton = getByRole('button', { name: /play video/i })
            fireEvent.keyDown(playButton, { key: ' ' })

            const iframe = container.querySelector('iframe')
            expect(iframe).toBeInTheDocument()
        })
    })

    describe('YouTube URL handling', () => {
        it('should use youtubeId field when available', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1, youtubeId: 'directId123' })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            const thumbnail = container.querySelector('img')
            expect(thumbnail?.getAttribute('src')).toContain('directId123')
        })

        it('should extract ID from standard YouTube URL', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        url: 'https://www.youtube.com/watch?v=extractedId',
                        youtubeId: undefined
                    })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            const thumbnail = container.querySelector('img')
            expect(thumbnail?.getAttribute('src')).toContain('extractedId')
        })

        it('should extract ID from youtu.be short URL', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        url: 'https://youtu.be/shortUrl123',
                        youtubeId: undefined
                    })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            const thumbnail = container.querySelector('img')
            expect(thumbnail?.getAttribute('src')).toContain('shortUrl123')
        })

        it('should use custom thumbnail when provided', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        thumbnailUrl: 'https://custom.thumb.jpg',
                        youtubeId: 'test12345'
                    })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            const thumbnail = container.querySelector('img')
            expect(thumbnail?.getAttribute('src')).toBe('https://custom.thumb.jpg')
        })

        it('should render nothing for invalid YouTube URL without youtubeId', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        url: 'https://example.com/not-youtube',
                        youtubeId: undefined
                    })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            expect(container.innerHTML).toBe('')
        })
    })

    describe('caption', () => {
        it('should display caption when provided', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        caption: 'This is a helpful video caption'
                    })
                ]
            })
            const { getByText } = render(<CoverVideoSpot product={product} position={1} />)

            expect(getByText('This is a helpful video caption')).toBeInTheDocument()
        })

        it('should not display caption section when not provided', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1, caption: undefined })
                ]
            })
            const { container } = render(<CoverVideoSpot product={product} position={1} />)

            const caption = container.querySelector('.italic')
            expect(caption).not.toBeInTheDocument()
        })
    })

    describe('accessibility', () => {
        it('should have proper aria-label on play button', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1, title: 'Demo Video' })
                ]
            })
            const { getByRole } = render(<CoverVideoSpot product={product} position={1} />)

            const playButton = getByRole('button', { name: /play video: demo video/i })
            expect(playButton).toBeInTheDocument()
        })

        it('should have proper tabIndex on play overlay', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1 })
                ]
            })
            const { getByRole } = render(<CoverVideoSpot product={product} position={1} />)

            const playButton = getByRole('button')
            expect(playButton).toHaveAttribute('tabIndex', '0')
        })

        it('should use altText for thumbnail', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        altText: 'Video thumbnail description'
                    })
                ]
            })
            const { getByAltText } = render(<CoverVideoSpot product={product} position={1} />)

            expect(getByAltText('Video thumbnail description')).toBeInTheDocument()
        })

        it('should fallback to title for alt when altText is missing', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({
                        id: 'video-1',
                        order: 1,
                        altText: undefined,
                        title: 'Video Title'
                    })
                ]
            })
            const { getByAltText } = render(<CoverVideoSpot product={product} position={1} />)

            expect(getByAltText('Video Title')).toBeInTheDocument()
        })
    })

    describe('iframe attributes', () => {
        it('should use youtube-nocookie domain for privacy', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1, youtubeId: 'test12345' })
                ]
            })
            const { getByRole, container } = render(
                <CoverVideoSpot product={product} position={1} />
            )

            fireEvent.click(getByRole('button'))

            const iframe = container.querySelector('iframe')
            expect(iframe?.getAttribute('src')).toContain('youtube-nocookie.com')
        })

        it('should have proper allow attributes', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1, youtubeId: 'test12345' })
                ]
            })
            const { getByRole, container } = render(
                <CoverVideoSpot product={product} position={1} />
            )

            fireEvent.click(getByRole('button'))

            const iframe = container.querySelector('iframe')
            expect(iframe?.getAttribute('allow')).toContain('autoplay')
            expect(iframe?.getAttribute('allow')).toContain('encrypted-media')
        })

        it('should allow fullscreen', () => {
            const product = createMockProduct({
                media: [
                    createMockMediaItem({ id: 'video-0', order: 0 }), // Skipped
                    createMockMediaItem({ id: 'video-1', order: 1, youtubeId: 'test12345' })
                ]
            })
            const { getByRole, container } = render(
                <CoverVideoSpot product={product} position={1} />
            )

            fireEvent.click(getByRole('button'))

            const iframe = container.querySelector('iframe')
            expect(iframe).toHaveAttribute('allowFullScreen')
        })
    })
})
