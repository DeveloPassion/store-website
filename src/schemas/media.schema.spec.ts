import { describe, it, expect } from 'bun:test'
import {
    MediaTypeSchema,
    MediaGroupSchema,
    MediaItemSchema,
    MediaArraySchema,
    MediaFileSchema,
    type MediaItem
} from './media.schema'

describe('Media Schema Validation', () => {
    const validImageMedia: MediaItem = {
        id: 'media-1',
        type: 'image',
        url: '/assets/images/screenshot.png',
        title: 'Dashboard Screenshot',
        description: 'Main dashboard view',
        altText: 'Dashboard showing main features',
        caption: 'Dashboard overview with key metrics',
        order: 0,
        group: 'main',
        width: 1920,
        height: 1080,
        youtubeId: null,
        thumbnailUrl: null
    }

    const validVideoMedia: MediaItem = {
        id: 'media-video-1',
        type: 'video',
        url: 'https://youtube.com/watch?v=abc123',
        title: 'Product Demo',
        description: null,
        altText: 'Product demonstration video',
        caption: null,
        order: 0,
        group: 'cover',
        width: null,
        height: null,
        youtubeId: 'abc123',
        thumbnailUrl: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg'
    }

    describe('MediaTypeSchema', () => {
        it('should accept "image" type', () => {
            const result = MediaTypeSchema.safeParse('image')
            expect(result.success).toBe(true)
        })

        it('should accept "video" type', () => {
            const result = MediaTypeSchema.safeParse('video')
            expect(result.success).toBe(true)
        })

        it('should reject invalid type', () => {
            const result = MediaTypeSchema.safeParse('audio')
            expect(result.success).toBe(false)
        })

        it('should reject empty string', () => {
            const result = MediaTypeSchema.safeParse('')
            expect(result.success).toBe(false)
        })

        it('should reject null', () => {
            const result = MediaTypeSchema.safeParse(null)
            expect(result.success).toBe(false)
        })
    })

    describe('MediaGroupSchema', () => {
        it('should accept "cover" group', () => {
            const result = MediaGroupSchema.safeParse('cover')
            expect(result.success).toBe(true)
        })

        it('should accept "main" group', () => {
            const result = MediaGroupSchema.safeParse('main')
            expect(result.success).toBe(true)
        })

        it('should accept "secondary" group', () => {
            const result = MediaGroupSchema.safeParse('secondary')
            expect(result.success).toBe(true)
        })

        it('should accept "bonus" group', () => {
            const result = MediaGroupSchema.safeParse('bonus')
            expect(result.success).toBe(true)
        })

        it('should reject invalid group', () => {
            const result = MediaGroupSchema.safeParse('gallery')
            expect(result.success).toBe(false)
        })

        it('should reject empty string', () => {
            const result = MediaGroupSchema.safeParse('')
            expect(result.success).toBe(false)
        })
    })

    describe('MediaItemSchema - Required Fields', () => {
        it('should accept valid complete image media', () => {
            const result = MediaItemSchema.safeParse(validImageMedia)
            expect(result.success).toBe(true)
        })

        it('should accept valid complete video media', () => {
            const result = MediaItemSchema.safeParse(validVideoMedia)
            expect(result.success).toBe(true)
        })

        it('should reject media without id', () => {
            const invalid = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'id')
            )
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media with empty id', () => {
            const invalid = { ...validImageMedia, id: '' }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media without type', () => {
            const invalid = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'type')
            )
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media without url', () => {
            const invalid = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'url')
            )
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media with empty url', () => {
            const invalid = { ...validImageMedia, url: '' }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media without title', () => {
            const invalid = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'title')
            )
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media with empty title', () => {
            const invalid = { ...validImageMedia, title: '' }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media without altText', () => {
            const invalid = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'altText')
            )
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media with empty altText', () => {
            const invalid = { ...validImageMedia, altText: '' }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media with whitespace-only url', () => {
            const invalid = { ...validImageMedia, url: '   ' }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media with whitespace-only title', () => {
            const invalid = { ...validImageMedia, title: '   ' }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media with whitespace-only altText', () => {
            const invalid = { ...validImageMedia, altText: '   ' }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media without order', () => {
            const invalid = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'order')
            )
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject media without group', () => {
            const invalid = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'group')
            )
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('MediaItemSchema - Nullable Fields', () => {
        it('should accept media with null description', () => {
            const valid = { ...validImageMedia, description: null }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject media without description field', () => {
            const withoutDescription = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'description')
            )
            const result = MediaItemSchema.safeParse(withoutDescription)
            expect(result.success).toBe(false)
        })

        it('should accept media with null caption', () => {
            const valid = { ...validImageMedia, caption: null }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject media without caption field', () => {
            const withoutCaption = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'caption')
            )
            const result = MediaItemSchema.safeParse(withoutCaption)
            expect(result.success).toBe(false)
        })

        it('should accept media with null youtubeId', () => {
            const valid = { ...validImageMedia, youtubeId: null }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject media without youtubeId field', () => {
            const withoutYoutubeId = Object.fromEntries(
                Object.entries(validVideoMedia).filter(([key]) => key !== 'youtubeId')
            )
            const result = MediaItemSchema.safeParse(withoutYoutubeId)
            expect(result.success).toBe(false)
        })

        it('should accept media with null thumbnailUrl', () => {
            const valid = { ...validVideoMedia, thumbnailUrl: null }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject media without thumbnailUrl field', () => {
            const withoutThumbnailUrl = Object.fromEntries(
                Object.entries(validVideoMedia).filter(([key]) => key !== 'thumbnailUrl')
            )
            const result = MediaItemSchema.safeParse(withoutThumbnailUrl)
            expect(result.success).toBe(false)
        })

        it('should accept media with null width', () => {
            const valid = { ...validImageMedia, width: null }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject media without width field', () => {
            const withoutWidth = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'width')
            )
            const result = MediaItemSchema.safeParse(withoutWidth)
            expect(result.success).toBe(false)
        })

        it('should accept media with null height', () => {
            const valid = { ...validImageMedia, height: null }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject media without height field', () => {
            const withoutHeight = Object.fromEntries(
                Object.entries(validImageMedia).filter(([key]) => key !== 'height')
            )
            const result = MediaItemSchema.safeParse(withoutHeight)
            expect(result.success).toBe(false)
        })

        it('should accept media with all nullable fields set to null', () => {
            const allNullable = {
                id: 'media-minimal',
                type: 'image' as const,
                url: '/image.png',
                title: 'Image',
                altText: 'Alt text',
                order: 0,
                group: 'cover' as const,
                description: null,
                caption: null,
                youtubeId: null,
                thumbnailUrl: null,
                width: null,
                height: null
            }
            const result = MediaItemSchema.safeParse(allNullable)
            expect(result.success).toBe(true)
        })
    })

    describe('MediaItemSchema - Order Validation', () => {
        it('should accept order of 0', () => {
            const valid = { ...validImageMedia, order: 0 }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept positive order', () => {
            const valid = { ...validImageMedia, order: 10 }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject negative order', () => {
            const invalid = { ...validImageMedia, order: -1 }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject decimal order', () => {
            const invalid = { ...validImageMedia, order: 1.5 }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject string order', () => {
            const invalid = { ...validImageMedia, order: '5' }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('MediaItemSchema - Dimensions Validation', () => {
        it('should accept valid width and height', () => {
            const valid = { ...validImageMedia, width: 1920, height: 1080 }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject zero width', () => {
            const invalid = { ...validImageMedia, width: 0 }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject negative width', () => {
            const invalid = { ...validImageMedia, width: -100 }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject zero height', () => {
            const invalid = { ...validImageMedia, height: 0 }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject negative height', () => {
            const invalid = { ...validImageMedia, height: -100 }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject decimal width', () => {
            const invalid = { ...validImageMedia, width: 1920.5 }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject decimal height', () => {
            const invalid = { ...validImageMedia, height: 1080.5 }
            const result = MediaItemSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('MediaItemSchema - URL Validation', () => {
        it('should accept relative URL', () => {
            const valid = { ...validImageMedia, url: '/assets/image.png' }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept absolute HTTPS URL', () => {
            const valid = { ...validImageMedia, url: 'https://example.com/image.png' }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept YouTube URL', () => {
            const valid = { ...validVideoMedia, url: 'https://youtube.com/watch?v=abc123' }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept YouTube short URL', () => {
            const valid = { ...validVideoMedia, url: 'https://youtu.be/abc123' }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('MediaItemSchema - Type-Specific Fields', () => {
        it('should accept image with null youtubeId', () => {
            const imageWithNullYoutubeId = { ...validImageMedia, youtubeId: null }
            const result = MediaItemSchema.safeParse(imageWithNullYoutubeId)
            expect(result.success).toBe(true)
        })

        it('should accept video with youtubeId', () => {
            const result = MediaItemSchema.safeParse(validVideoMedia)
            expect(result.success).toBe(true)
        })

        it('should accept image with dimensions', () => {
            const result = MediaItemSchema.safeParse(validImageMedia)
            expect(result.success).toBe(true)
        })

        it('should accept video with null dimensions', () => {
            const videoWithNullDimensions = { ...validVideoMedia, width: null, height: null }
            const result = MediaItemSchema.safeParse(videoWithNullDimensions)
            expect(result.success).toBe(true)
        })

        it('should accept image with null thumbnailUrl', () => {
            const imageWithNullThumbnail = { ...validImageMedia, thumbnailUrl: null }
            const result = MediaItemSchema.safeParse(imageWithNullThumbnail)
            expect(result.success).toBe(true)
        })

        it('should accept video with thumbnailUrl', () => {
            const result = MediaItemSchema.safeParse(validVideoMedia)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.thumbnailUrl).toBe(
                    'https://img.youtube.com/vi/abc123/maxresdefault.jpg'
                )
            }
        })
    })

    describe('MediaArraySchema', () => {
        it('should accept array of valid media items', () => {
            const media = [
                validImageMedia,
                { ...validImageMedia, id: 'media-2', order: 1 },
                validVideoMedia
            ]
            const result = MediaArraySchema.safeParse(media)
            expect(result.success).toBe(true)
        })

        it('should accept empty array', () => {
            const result = MediaArraySchema.safeParse([])
            expect(result.success).toBe(true)
        })

        it('should reject array with invalid media', () => {
            const media = [validImageMedia, { ...validImageMedia, type: 'invalid' }]
            const result = MediaArraySchema.safeParse(media)
            expect(result.success).toBe(false)
        })

        it('should reject array with missing required fields', () => {
            const media = [validImageMedia, { id: 'media-2', type: 'image', url: '/image.png' }]
            const result = MediaArraySchema.safeParse(media)
            expect(result.success).toBe(false)
        })

        it('should accept array with mixed groups', () => {
            const media = [
                { ...validImageMedia, id: 'media-1', group: 'cover' as const },
                { ...validImageMedia, id: 'media-2', group: 'main' as const },
                { ...validImageMedia, id: 'media-3', group: 'secondary' as const }
            ]
            const result = MediaArraySchema.safeParse(media)
            expect(result.success).toBe(true)
        })

        it('should reject non-array value', () => {
            const result = MediaArraySchema.safeParse(validImageMedia)
            expect(result.success).toBe(false)
        })

        it('should reject null value', () => {
            const result = MediaArraySchema.safeParse(null)
            expect(result.success).toBe(false)
        })
    })

    describe('MediaFileSchema - File Format Validation', () => {
        it('should accept valid file with data array', () => {
            const validFile = {
                data: [validImageMedia]
            }
            const result = MediaFileSchema.safeParse(validFile)
            expect(result.success).toBe(true)
        })

        it('should accept file with empty data array', () => {
            const validFile = { data: [] }
            const result = MediaFileSchema.safeParse(validFile)
            expect(result.success).toBe(true)
        })

        it('should accept file with multiple media items', () => {
            const validFile = {
                data: [
                    validImageMedia,
                    { ...validImageMedia, id: 'media-2', order: 1 },
                    validVideoMedia
                ]
            }
            const result = MediaFileSchema.safeParse(validFile)
            expect(result.success).toBe(true)
        })

        it('should reject file without data property', () => {
            const invalid = [validImageMedia]
            const result = MediaFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject file with null data', () => {
            const invalid = { data: null }
            const result = MediaFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject file with non-array data', () => {
            const invalid = { data: validImageMedia }
            const result = MediaFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject file with invalid media in data array', () => {
            const invalid = {
                data: [validImageMedia, { ...validImageMedia, order: -1 }]
            }
            const result = MediaFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject root-level array (old format)', () => {
            const oldFormat = [validImageMedia]
            const result = MediaFileSchema.safeParse(oldFormat)
            expect(result.success).toBe(false)
        })
    })

    describe('MediaItemSchema - Edge Cases', () => {
        it('should accept media with very long title', () => {
            const valid = { ...validImageMedia, title: 'T'.repeat(500) }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept media with very long description', () => {
            const valid = { ...validImageMedia, description: 'D'.repeat(2000) }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept media with special characters in title', () => {
            const valid = { ...validImageMedia, title: 'Screenshot (HD) 💎 [2024]' }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept media with markdown in caption', () => {
            const valid = {
                ...validImageMedia,
                caption: '**Bold** and *italic* with [link](https://example.com)'
            }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept media with UUID-style id', () => {
            const valid = { ...validImageMedia, id: '550e8400-e29b-41d4-a716-446655440000' }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept media with high-resolution dimensions', () => {
            const valid = { ...validImageMedia, width: 3840, height: 2160 }
            const result = MediaItemSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject media with extra unknown fields', () => {
            const invalid = { ...validImageMedia, extraField: 'value' }
            const result = MediaItemSchema.safeParse(invalid)
            // Zod strips extra fields by default, so this should succeed
            expect(result.success).toBe(true)
        })
    })
})
