import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import HeroBackground from './hero-background'
import type { MediaItem } from '@/schemas/media.schema'

describe('HeroBackground', () => {
    const mockBannerImages: MediaItem[] = [
        {
            id: 'banner-1',
            type: 'image',
            url: '/assets/images/banner-1.png',
            title: 'Banner 1',
            altText: 'First banner image',
            order: 0,
            group: 'banner'
        },
        {
            id: 'banner-2',
            type: 'image',
            url: '/assets/images/banner-2.png',
            title: 'Banner 2',
            altText: 'Second banner image',
            order: 1,
            group: 'banner'
        },
        {
            id: 'banner-3',
            type: 'image',
            url: '/assets/images/banner-3.png',
            title: 'Banner 3',
            altText: 'Third banner image',
            order: 2,
            group: 'banner'
        }
    ]

    it('renders nothing when no banner images provided', () => {
        const { container } = render(<HeroBackground bannerImages={[]} />)
        expect(container.firstChild).toBeNull()
    })

    it('renders nothing when only video items provided', () => {
        const videoItems: MediaItem[] = [
            {
                id: 'video-1',
                type: 'video',
                url: 'https://youtube.com/watch?v=abc123',
                title: 'Video',
                altText: 'Video',
                order: 0,
                group: 'banner',
                youtubeId: 'abc123'
            }
        ]
        const { container } = render(<HeroBackground bannerImages={videoItems} />)
        expect(container.firstChild).toBeNull()
    })

    it('renders first banner image by default', () => {
        const { container } = render(<HeroBackground bannerImages={mockBannerImages} />)

        const backgroundDiv = container.querySelector('[style*="background-image"]')
        expect(backgroundDiv).toBeTruthy()
        expect(backgroundDiv?.getAttribute('style')).toContain('banner-1.png')
    })

    it('sorts banner images by order property', () => {
        const unorderedImages: MediaItem[] = [
            {
                id: 'banner-3',
                type: 'image',
                url: '/assets/images/banner-3.png',
                title: 'Banner 3',
                altText: 'Third banner image',
                order: 2,
                group: 'banner'
            },
            {
                id: 'banner-1',
                type: 'image',
                url: '/assets/images/banner-1.png',
                title: 'Banner 1',
                altText: 'First banner image',
                order: 0,
                group: 'banner'
            },
            {
                id: 'banner-2',
                type: 'image',
                url: '/assets/images/banner-2.png',
                title: 'Banner 2',
                altText: 'Second banner image',
                order: 1,
                group: 'banner'
            }
        ]

        const { container } = render(<HeroBackground bannerImages={unorderedImages} />)

        const backgroundDiv = container.querySelector('[style*="background-image"]')
        expect(backgroundDiv?.getAttribute('style')).toContain('banner-1.png')
    })

    it('renders dark overlay for text readability', () => {
        const { container } = render(<HeroBackground bannerImages={mockBannerImages} />)

        const overlay = container.querySelector('.bg-gradient-to-b')
        expect(overlay).toBeTruthy()
        expect(overlay?.className).toContain('from-background/70')
        expect(overlay?.className).toContain('via-background/80')
        expect(overlay?.className).toContain('to-background/90')
    })

    it('applies correct container styling', () => {
        const { container } = render(<HeroBackground bannerImages={mockBannerImages} />)

        const mainContainer = container.querySelector('.absolute.inset-0.overflow-hidden')
        expect(mainContainer).toBeTruthy()
    })

    it('filters out non-image media items', () => {
        const mixedMedia: MediaItem[] = [
            {
                id: 'banner-1',
                type: 'image',
                url: '/assets/images/banner-1.png',
                title: 'Banner 1',
                altText: 'First banner image',
                order: 0,
                group: 'banner'
            },
            {
                id: 'video-1',
                type: 'video',
                url: 'https://youtube.com/watch?v=abc',
                title: 'Video',
                altText: 'Video',
                order: 1,
                group: 'banner',
                youtubeId: 'abc'
            },
            {
                id: 'banner-2',
                type: 'image',
                url: '/assets/images/banner-2.png',
                title: 'Banner 2',
                altText: 'Second banner image',
                order: 2,
                group: 'banner'
            }
        ]

        const { container } = render(<HeroBackground bannerImages={mixedMedia} />)

        // Should still render (filters video, keeps images)
        const backgroundDiv = container.querySelector('[style*="background-image"]')
        expect(backgroundDiv).toBeTruthy()
    })

    it('renders with single banner image', () => {
        const singleImage: MediaItem[] = [
            {
                id: 'banner-1',
                type: 'image',
                url: '/assets/images/banner-1.png',
                title: 'Banner 1',
                altText: 'First banner image',
                order: 0,
                group: 'banner'
            }
        ]
        const { container } = render(<HeroBackground bannerImages={singleImage} />)

        const backgroundDiv = container.querySelector('[style*="background-image"]')
        expect(backgroundDiv?.getAttribute('style')).toContain('banner-1.png')
    })

    it('accepts custom autoRotateInterval prop without errors', () => {
        const { container } = render(
            <HeroBackground bannerImages={mockBannerImages} autoRotateInterval={3000} />
        )

        const backgroundDiv = container.querySelector('[style*="background-image"]')
        expect(backgroundDiv).toBeTruthy()
    })
})
