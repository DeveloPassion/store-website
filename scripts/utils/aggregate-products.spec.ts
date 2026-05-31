/**
 * Unit tests for aggregate-products load functions
 *
 * Tests the following functions:
 * - loadFAQs(productId)
 * - loadTestimonials(productId)
 * - loadMedia(productId)
 *
 * Test scenarios:
 * - Load existing valid file with { data: [...] } format
 * - Load non-existent file (returns empty array)
 * - Load file with invalid JSON (logs error, returns empty array or throws in STRICT_MODE)
 * - Load file with valid JSON but no data property (returns empty array)
 * - STRICT_MODE behavior (throws on errors)
 */

import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test'
import { mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import {
    loadFAQs,
    loadTestimonials,
    loadMedia,
    discoverSalesCopyFiles,
    loadActiveSalesCopy
} from './aggregate-products.js'

// Test fixtures
const createValidFAQ = (id: string = 'faq-1') => ({
    id,
    question: 'What is this?',
    answer: 'This is a test FAQ.',
    order: 0
})

const createValidTestimonial = (id: string = 'test-1') => ({
    id,
    author: 'John Doe',
    role: 'Developer',
    company: 'Acme Inc',
    avatarUrl: '/avatar.png',
    twitterHandle: '@johndoe',
    twitterUrl: 'https://twitter.com/johndoe',
    sourceUrl: null,
    quote: 'Great product!',
    featured: true
})

const createValidMediaItem = (id: string = 'media-1') => ({
    id,
    type: 'image' as const,
    url: '/assets/image.png',
    title: 'Product Screenshot',
    description: 'Main product screenshot',
    altText: 'Screenshot showing product dashboard',
    caption: 'Dashboard view',
    order: 0,
    group: 'main' as const,
    width: 1920,
    height: 1080,
    youtubeId: null,
    thumbnailUrl: null
})

const createValidSalesCopyData = () => ({
    tagline: 'Transform your workflow',
    secondaryTagline: 'The ultimate solution',
    problem: 'People struggle with productivity',
    problemPoints: ['Scattered information', 'No centralized system'],
    agitate: 'This costs time and money',
    agitatePoints: ['Wasted hours', 'Missed opportunities'],
    solution: 'Our product solves this',
    solutionPoints: ['Unified workspace', 'AI-powered organization'],
    description: 'A comprehensive solution for productivity.',
    highlights: ['Feature 1', 'Feature 2'],
    benefits: {
        immediate: ['Quick win 1'],
        systematic: ['Process improvement 1'],
        longTerm: ['Long-term benefit 1']
    },
    targetAudience: ['Knowledge workers'],
    perfectFor: ['Professionals'],
    notForYou: ['If you prefer paper'],
    trustBadges: ['30-day guarantee'],
    guarantees: ['Full refund'],
    metaTitle: 'Product - Transform Your Workflow',
    metaDescription: 'Transform your workflow with our solution',
    keywords: ['productivity', 'workflow'],
    storytelling: null,
    timeline: null,
    courseContent: null,
    howItWorks: null,
    mediaSections: null
})

const createValidSalesCopyFile = (id: string = 'default') => ({
    id,
    salesCopy: createValidSalesCopyData()
})

// Helper to create temp directory for each test
let tempDir: string
let originalProductsDir: string | undefined
let originalStrictMode: string | undefined

beforeEach(() => {
    // Create unique temp directory for each test
    tempDir = join(
        import.meta.dir,
        `test-temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    )
    mkdirSync(tempDir, { recursive: true })

    // Save original env vars
    originalProductsDir = process.env.TEST_PRODUCTS_DIR
    originalStrictMode = process.env.STRICT_VALIDATION

    // Set temp directory as products dir
    process.env.TEST_PRODUCTS_DIR = tempDir
    process.env.STRICT_VALIDATION = 'false' // Default to non-strict
})

afterEach(() => {
    // Clean up temp directory
    try {
        rmSync(tempDir, { recursive: true, force: true })
    } catch {
        // Ignore cleanup errors
    }

    // Restore original env vars
    if (originalProductsDir !== undefined) {
        process.env.TEST_PRODUCTS_DIR = originalProductsDir
    } else {
        delete process.env.TEST_PRODUCTS_DIR
    }

    if (originalStrictMode !== undefined) {
        process.env.STRICT_VALIDATION = originalStrictMode
    } else {
        delete process.env.STRICT_VALIDATION
    }
})

describe('loadFAQs', () => {
    it('should load existing valid file with { data: [...] } format', () => {
        const productId = 'test-product'
        const faqData = [createValidFAQ('faq-1'), createValidFAQ('faq-2')]

        writeFileSync(join(tempDir, `${productId}-faq.json`), JSON.stringify({ data: faqData }))

        const result = loadFAQs(productId)

        expect(result).toEqual(faqData)
        expect(result).toHaveLength(2)
        expect(result[0].id).toBe('faq-1')
        expect(result[1].id).toBe('faq-2')
    })

    it('should return empty array for non-existent file', () => {
        const productId = 'non-existent-product'

        const result = loadFAQs(productId)

        expect(result).toEqual([])
        expect(result).toHaveLength(0)
    })

    it('should return empty array for file with invalid JSON in non-strict mode', () => {
        const productId = 'invalid-json-product'
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

        writeFileSync(join(tempDir, `${productId}-faq.json`), '{invalid json')

        const result = loadFAQs(productId)

        expect(result).toEqual([])
        expect(consoleSpy).toHaveBeenCalled()
        expect(consoleSpy.mock.calls[0][0]).toContain('❌')
        expect(consoleSpy.mock.calls[0][0]).toContain('invalid JSON')

        consoleSpy.mockRestore()
    })

    it('should throw error for file with invalid JSON in STRICT_MODE', () => {
        const productId = 'invalid-json-strict'
        process.env.STRICT_VALIDATION = 'true'
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

        writeFileSync(join(tempDir, `${productId}-faq.json`), '{invalid json')

        expect(() => loadFAQs(productId)).toThrow()
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
        process.env.STRICT_VALIDATION = 'false'
    })

    it('should return empty array for file with valid JSON but no data property', () => {
        const productId = 'no-data-property'

        writeFileSync(join(tempDir, `${productId}-faq.json`), JSON.stringify({ items: [] }))

        const result = loadFAQs(productId)

        expect(result).toEqual([])
    })

    it('should return empty array for file with null data property', () => {
        const productId = 'null-data'

        writeFileSync(join(tempDir, `${productId}-faq.json`), JSON.stringify({ data: null }))

        const result = loadFAQs(productId)

        expect(result).toEqual([])
    })

    it('should return empty array for file with undefined data property', () => {
        const productId = 'undefined-data'

        writeFileSync(join(tempDir, `${productId}-faq.json`), JSON.stringify({}))

        const result = loadFAQs(productId)

        expect(result).toEqual([])
    })

    it('should handle empty data array', () => {
        const productId = 'empty-array'

        writeFileSync(join(tempDir, `${productId}-faq.json`), JSON.stringify({ data: [] }))

        const result = loadFAQs(productId)

        expect(result).toEqual([])
        expect(result).toHaveLength(0)
    })

    it('should preserve all FAQ properties', () => {
        const productId = 'full-faq'
        const faq = {
            id: 'faq-detailed',
            question: 'How does this work?',
            answer: 'It works by doing XYZ.'
        }

        writeFileSync(join(tempDir, `${productId}-faq.json`), JSON.stringify({ data: [faq] }))

        const result = loadFAQs(productId)

        expect(result[0]).toEqual(faq)
        expect(result[0].question).toBe('How does this work?')
        expect(result[0].answer).toBe('It works by doing XYZ.')
    })
})

describe('loadTestimonials', () => {
    it('should load existing valid file with { data: [...] } format', () => {
        const productId = 'test-product'
        const testimonialData = [createValidTestimonial('test-1'), createValidTestimonial('test-2')]

        writeFileSync(
            join(tempDir, `${productId}-testimonials.json`),
            JSON.stringify({ data: testimonialData })
        )

        const result = loadTestimonials(productId)

        expect(result).toEqual(testimonialData)
        expect(result).toHaveLength(2)
        expect(result[0].id).toBe('test-1')
        expect(result[1].id).toBe('test-2')
    })

    it('should return empty array for non-existent file', () => {
        const productId = 'non-existent-product'

        const result = loadTestimonials(productId)

        expect(result).toEqual([])
        expect(result).toHaveLength(0)
    })

    it('should return empty array for file with invalid JSON in non-strict mode', () => {
        const productId = 'invalid-json-product'
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

        writeFileSync(join(tempDir, `${productId}-testimonials.json`), '{invalid json')

        const result = loadTestimonials(productId)

        expect(result).toEqual([])
        expect(consoleSpy).toHaveBeenCalled()
        expect(consoleSpy.mock.calls[0][0]).toContain('❌')
        expect(consoleSpy.mock.calls[0][0]).toContain('invalid JSON')

        consoleSpy.mockRestore()
    })

    it('should throw error for file with invalid JSON in STRICT_MODE', () => {
        const productId = 'invalid-json-strict'
        process.env.STRICT_VALIDATION = 'true'
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

        writeFileSync(join(tempDir, `${productId}-testimonials.json`), '{invalid json')

        expect(() => loadTestimonials(productId)).toThrow()
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
        process.env.STRICT_VALIDATION = 'false'
    })

    it('should return empty array for file with valid JSON but no data property', () => {
        const productId = 'no-data-property'

        writeFileSync(
            join(tempDir, `${productId}-testimonials.json`),
            JSON.stringify({ items: [] })
        )

        const result = loadTestimonials(productId)

        expect(result).toEqual([])
    })

    it('should return empty array for file with null data property', () => {
        const productId = 'null-data'

        writeFileSync(
            join(tempDir, `${productId}-testimonials.json`),
            JSON.stringify({ data: null })
        )

        const result = loadTestimonials(productId)

        expect(result).toEqual([])
    })

    it('should handle empty data array', () => {
        const productId = 'empty-array'

        writeFileSync(join(tempDir, `${productId}-testimonials.json`), JSON.stringify({ data: [] }))

        const result = loadTestimonials(productId)

        expect(result).toEqual([])
        expect(result).toHaveLength(0)
    })

    it('should preserve all testimonial properties including optional fields', () => {
        const productId = 'full-testimonial'
        const testimonial = {
            id: 'test-detailed',
            author: 'Jane Smith',
            role: 'CTO',
            company: 'Tech Corp',
            avatarUrl: '/avatars/jane.png',
            twitterHandle: '@janesmith',
            twitterUrl: 'https://twitter.com/janesmith',
            sourceUrl: null,
            rating: 4,
            quote: 'Excellent product, highly recommended!',
            featured: false
        }

        writeFileSync(
            join(tempDir, `${productId}-testimonials.json`),
            JSON.stringify({ data: [testimonial] })
        )

        const result = loadTestimonials(productId)

        expect(result[0]).toEqual(testimonial)
        expect(result[0].author).toBe('Jane Smith')
        expect(result[0].rating).toBe(4)
        expect(result[0].featured).toBe(false)
    })

    it('should handle testimonials with minimal required fields', () => {
        const productId = 'minimal-testimonial'
        const testimonial = {
            id: 'test-minimal',
            author: 'Bob',
            rating: 5,
            quote: 'Great!',
            featured: true
        }

        writeFileSync(
            join(tempDir, `${productId}-testimonials.json`),
            JSON.stringify({ data: [testimonial] })
        )

        const result = loadTestimonials(productId)

        expect(result[0]).toEqual(testimonial)
        expect(result[0].role).toBeUndefined()
        expect(result[0].company).toBeUndefined()
    })
})

describe('loadMedia', () => {
    it('should load existing valid file with { data: [...] } format', () => {
        const productId = 'test-product'
        const mediaData = [createValidMediaItem('media-1'), createValidMediaItem('media-2')]

        writeFileSync(join(tempDir, `${productId}-media.json`), JSON.stringify({ data: mediaData }))

        const result = loadMedia(productId)

        expect(result).toEqual(mediaData)
        expect(result).toHaveLength(2)
        expect(result[0].id).toBe('media-1')
        expect(result[1].id).toBe('media-2')
    })

    it('should return empty array for non-existent file', () => {
        const productId = 'non-existent-product'

        const result = loadMedia(productId)

        expect(result).toEqual([])
        expect(result).toHaveLength(0)
    })

    it('should return empty array for file with invalid JSON in non-strict mode', () => {
        const productId = 'invalid-json-product'
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

        writeFileSync(join(tempDir, `${productId}-media.json`), '{invalid json')

        const result = loadMedia(productId)

        expect(result).toEqual([])
        expect(consoleSpy).toHaveBeenCalled()
        expect(consoleSpy.mock.calls[0][0]).toContain('❌')
        expect(consoleSpy.mock.calls[0][0]).toContain('invalid JSON')

        consoleSpy.mockRestore()
    })

    it('should throw error for file with invalid JSON in STRICT_MODE', () => {
        const productId = 'invalid-json-strict'
        process.env.STRICT_VALIDATION = 'true'
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

        writeFileSync(join(tempDir, `${productId}-media.json`), '{invalid json')

        expect(() => loadMedia(productId)).toThrow()
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
        process.env.STRICT_VALIDATION = 'false'
    })

    it('should return empty array for file with valid JSON but no data property', () => {
        const productId = 'no-data-property'

        writeFileSync(join(tempDir, `${productId}-media.json`), JSON.stringify({ items: [] }))

        const result = loadMedia(productId)

        expect(result).toEqual([])
    })

    it('should return empty array for file with null data property', () => {
        const productId = 'null-data'

        writeFileSync(join(tempDir, `${productId}-media.json`), JSON.stringify({ data: null }))

        const result = loadMedia(productId)

        expect(result).toEqual([])
    })

    it('should handle empty data array', () => {
        const productId = 'empty-array'

        writeFileSync(join(tempDir, `${productId}-media.json`), JSON.stringify({ data: [] }))

        const result = loadMedia(productId)

        expect(result).toEqual([])
        expect(result).toHaveLength(0)
    })

    it('should preserve all media properties for image type', () => {
        const productId = 'full-image-media'
        const media = {
            id: 'media-detailed',
            type: 'image',
            url: '/assets/screenshots/dashboard.png',
            title: 'Dashboard Screenshot',
            description: 'Main dashboard interface',
            altText: 'Screenshot of product dashboard',
            caption: 'Dashboard view with graphs',
            order: 3,
            group: 'main',
            width: 1920,
            height: 1080
        }

        writeFileSync(join(tempDir, `${productId}-media.json`), JSON.stringify({ data: [media] }))

        const result = loadMedia(productId)

        expect(result[0]).toEqual(media)
        expect(result[0].type).toBe('image')
        expect(result[0].group).toBe('main')
        expect(result[0].width).toBe(1920)
        expect(result[0].height).toBe(1080)
    })

    it('should preserve all media properties for video type', () => {
        const productId = 'full-video-media'
        const media = {
            id: 'video-detailed',
            type: 'video',
            url: 'https://youtube.com/watch?v=abc123',
            title: 'Product Demo',
            description: 'Full product demonstration',
            altText: 'Product demo video',
            caption: 'Watch our demo',
            order: 0,
            group: 'cover',
            youtubeId: 'abc123',
            thumbnailUrl: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg'
        }

        writeFileSync(join(tempDir, `${productId}-media.json`), JSON.stringify({ data: [media] }))

        const result = loadMedia(productId)

        expect(result[0]).toEqual(media)
        expect(result[0].type).toBe('video')
        expect(result[0].youtubeId).toBe('abc123')
        expect(result[0].thumbnailUrl).toContain('youtube.com')
    })

    it('should handle media with different group types', () => {
        const productId = 'various-groups'
        const mediaData = [
            { ...createValidMediaItem('m1'), group: 'cover' },
            { ...createValidMediaItem('m2'), group: 'main' },
            { ...createValidMediaItem('m3'), group: 'secondary' },
            { ...createValidMediaItem('m4'), group: 'bonus' }
        ]

        writeFileSync(join(tempDir, `${productId}-media.json`), JSON.stringify({ data: mediaData }))

        const result = loadMedia(productId)

        expect(result).toHaveLength(4)
        expect(result[0].group).toBe('cover')
        expect(result[1].group).toBe('main')
        expect(result[2].group).toBe('secondary')
        expect(result[3].group).toBe('bonus')
    })

    it('should handle media with minimal required fields', () => {
        const productId = 'minimal-media'
        const media = {
            id: 'media-minimal',
            type: 'image',
            url: '/image.png',
            title: 'Image',
            altText: 'An image',
            order: 0,
            group: 'cover'
        }

        writeFileSync(join(tempDir, `${productId}-media.json`), JSON.stringify({ data: [media] }))

        const result = loadMedia(productId)

        expect(result[0]).toEqual(media)
        expect(result[0].description).toBeUndefined()
        expect(result[0].caption).toBeUndefined()
        expect(result[0].width).toBeUndefined()
    })
})

describe('discoverSalesCopyFiles', () => {
    it('should discover all sales copy variant files for a product', () => {
        const productId = 'test-product'

        writeFileSync(join(tempDir, `${productId}-sales-copy-default.json`), '{}')
        writeFileSync(join(tempDir, `${productId}-sales-copy-holiday-2026.json`), '{}')
        writeFileSync(join(tempDir, `${productId}-sales-copy-black-friday.json`), '{}')

        const result = discoverSalesCopyFiles(productId)

        expect(result).toHaveLength(3)
        expect(result).toContain('default')
        expect(result).toContain('holiday-2026')
        expect(result).toContain('black-friday')
    })

    it('should return empty array when no sales copy files exist', () => {
        const productId = 'no-sales-copy'

        const result = discoverSalesCopyFiles(productId)

        expect(result).toEqual([])
        expect(result).toHaveLength(0)
    })

    it('should only match sales copy files for the specific product', () => {
        writeFileSync(join(tempDir, 'product-a-sales-copy-default.json'), '{}')
        writeFileSync(join(tempDir, 'product-b-sales-copy-default.json'), '{}')
        writeFileSync(join(tempDir, 'product-a-sales-copy-v2.json'), '{}')

        const resultA = discoverSalesCopyFiles('product-a')
        const resultB = discoverSalesCopyFiles('product-b')

        expect(resultA).toHaveLength(2)
        expect(resultA).toContain('default')
        expect(resultA).toContain('v2')
        expect(resultB).toHaveLength(1)
        expect(resultB).toContain('default')
    })

    it('should not match other file types', () => {
        const productId = 'test-product'

        writeFileSync(join(tempDir, `${productId}.json`), '{}')
        writeFileSync(join(tempDir, `${productId}-faq.json`), '{}')
        writeFileSync(join(tempDir, `${productId}-testimonials.json`), '{}')
        writeFileSync(join(tempDir, `${productId}-media.json`), '{}')
        writeFileSync(join(tempDir, `${productId}-sales-copy-default.json`), '{}')

        const result = discoverSalesCopyFiles(productId)

        expect(result).toHaveLength(1)
        expect(result).toContain('default')
    })

    it('should return empty array and log error in non-strict mode on read failure', () => {
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})

        // Set invalid directory to trigger error
        process.env.TEST_PRODUCTS_DIR = '/nonexistent/path'

        const result = discoverSalesCopyFiles('any-product')

        expect(result).toEqual([])
        expect(consoleSpy).toHaveBeenCalled()
        expect(consoleSpy.mock.calls[0][0]).toContain('❌')

        consoleSpy.mockRestore()
        // Restore valid temp dir
        process.env.TEST_PRODUCTS_DIR = tempDir
    })
})

describe('loadActiveSalesCopy', () => {
    it('should load valid sales copy file', () => {
        const productId = 'test-product'
        const salesCopyFile = createValidSalesCopyFile('default')

        writeFileSync(
            join(tempDir, `${productId}-sales-copy-default.json`),
            JSON.stringify(salesCopyFile)
        )

        const result = loadActiveSalesCopy(productId, 'default')

        expect(result).not.toBeNull()
        expect(result?.tagline).toBe('Transform your workflow')
        expect(result?.problem).toBe('People struggle with productivity')
        expect(result?.highlights).toHaveLength(2)
    })

    it('should return null when activeSalesCopyId is not provided', () => {
        const productId = 'test-product'

        const result = loadActiveSalesCopy(productId)

        expect(result).toBeNull()
    })

    it('should return null when activeSalesCopyId is empty string', () => {
        const productId = 'test-product'

        const result = loadActiveSalesCopy(productId, '')

        expect(result).toBeNull()
    })

    it('should return null and log error for non-existent file in non-strict mode', () => {
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
        const productId = 'test-product'

        const result = loadActiveSalesCopy(productId, 'non-existent')

        expect(result).toBeNull()
        expect(consoleSpy).toHaveBeenCalled()
        expect(consoleSpy.mock.calls[0][0]).toContain('❌')
        expect(consoleSpy.mock.calls[0][0]).toContain('Sales copy file not found')

        consoleSpy.mockRestore()
    })

    it('should throw error for non-existent file in STRICT_MODE', () => {
        process.env.STRICT_VALIDATION = 'true'
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
        const productId = 'test-product'

        expect(() => loadActiveSalesCopy(productId, 'missing')).toThrow()
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
        process.env.STRICT_VALIDATION = 'false'
    })

    it('should return null and log error for invalid JSON in non-strict mode', () => {
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
        const productId = 'test-product'

        writeFileSync(join(tempDir, `${productId}-sales-copy-default.json`), '{invalid json')

        const result = loadActiveSalesCopy(productId, 'default')

        expect(result).toBeNull()
        expect(consoleSpy).toHaveBeenCalled()
        expect(consoleSpy.mock.calls[0][0]).toContain('❌')
        expect(consoleSpy.mock.calls[0][0]).toContain('invalid JSON')

        consoleSpy.mockRestore()
    })

    it('should throw error for invalid JSON in STRICT_MODE', () => {
        process.env.STRICT_VALIDATION = 'true'
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
        const productId = 'test-product'

        writeFileSync(join(tempDir, `${productId}-sales-copy-default.json`), '{invalid json')

        expect(() => loadActiveSalesCopy(productId, 'default')).toThrow()
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
        process.env.STRICT_VALIDATION = 'false'
    })

    it('should return null and log error for invalid schema in non-strict mode', () => {
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
        const productId = 'test-product'

        // Invalid: missing required fields
        const invalidFile = {
            id: 'default',
            salesCopy: {
                tagline: 'Valid' // missing many required fields
            }
        }

        writeFileSync(
            join(tempDir, `${productId}-sales-copy-default.json`),
            JSON.stringify(invalidFile)
        )

        const result = loadActiveSalesCopy(productId, 'default')

        expect(result).toBeNull()
        expect(consoleSpy).toHaveBeenCalled()
        expect(consoleSpy.mock.calls[0][0]).toContain('❌')
        expect(consoleSpy.mock.calls[0][0]).toContain('Invalid sales copy file')

        consoleSpy.mockRestore()
    })

    it('should throw error for invalid schema in STRICT_MODE', () => {
        process.env.STRICT_VALIDATION = 'true'
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
        const productId = 'test-product'

        const invalidFile = {
            id: 'default',
            salesCopy: {
                tagline: 'Valid' // missing required fields
            }
        }

        writeFileSync(
            join(tempDir, `${productId}-sales-copy-default.json`),
            JSON.stringify(invalidFile)
        )

        expect(() => loadActiveSalesCopy(productId, 'default')).toThrow()
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
        process.env.STRICT_VALIDATION = 'false'
    })

    it('should preserve all sales copy fields including optional ones', () => {
        const productId = 'full-sales-copy'
        const salesCopyData = createValidSalesCopyData()
        const salesCopyFile = createValidSalesCopyFile('complete')

        writeFileSync(
            join(tempDir, `${productId}-sales-copy-complete.json`),
            JSON.stringify(salesCopyFile)
        )

        const result = loadActiveSalesCopy(productId, 'complete')

        expect(result).not.toBeNull()
        expect(result?.tagline).toBe(salesCopyData.tagline)
        expect(result?.secondaryTagline).toBe(salesCopyData.secondaryTagline)
        expect(result?.problem).toBe(salesCopyData.problem)
        expect(result?.problemPoints).toEqual(salesCopyData.problemPoints)
        expect(result?.agitate).toBe(salesCopyData.agitate)
        expect(result?.agitatePoints).toEqual(salesCopyData.agitatePoints)
        expect(result?.solution).toBe(salesCopyData.solution)
        expect(result?.solutionPoints).toEqual(salesCopyData.solutionPoints)
        expect(result?.description).toBe(salesCopyData.description)
        expect(result?.highlights).toEqual(salesCopyData.highlights)
        expect(result?.benefits).toEqual(salesCopyData.benefits)
        expect(result?.targetAudience).toEqual(salesCopyData.targetAudience)
        expect(result?.perfectFor).toEqual(salesCopyData.perfectFor)
        expect(result?.notForYou).toEqual(salesCopyData.notForYou)
        expect(result?.trustBadges).toEqual(salesCopyData.trustBadges)
        expect(result?.guarantees).toEqual(salesCopyData.guarantees)
        expect(result?.metaTitle).toBe(salesCopyData.metaTitle)
        expect(result?.metaDescription).toBe(salesCopyData.metaDescription)
        expect(result?.keywords).toEqual(salesCopyData.keywords)
    })

    it('should load sales copy with storytelling section', () => {
        const productId = 'storytelling-product'
        const salesCopyFile = {
            id: 'default',
            salesCopy: {
                ...createValidSalesCopyData(),
                storytelling: {
                    originStory: {
                        title: 'Our Origin',
                        subtitle: null,
                        story: 'How we started this amazing journey.',
                        inspirationPoint: null,
                        genesisDate: null,
                        icon: null
                    },
                    creatorJourney: null,
                    transformationArc: null,
                    successStories: null,
                    methodology: null,
                    vision: null
                }
            }
        }

        writeFileSync(
            join(tempDir, `${productId}-sales-copy-default.json`),
            JSON.stringify(salesCopyFile)
        )

        const result = loadActiveSalesCopy(productId, 'default')

        expect(result).not.toBeNull()
        expect(result?.storytelling).toBeDefined()
        expect(result?.storytelling?.originStory).toBeDefined()
        expect(result?.storytelling?.originStory?.title).toBe('Our Origin')
    })

    it('should load multiple variants for the same product', () => {
        const productId = 'multi-variant'

        writeFileSync(
            join(tempDir, `${productId}-sales-copy-default.json`),
            JSON.stringify({
                id: 'default',
                salesCopy: { ...createValidSalesCopyData(), tagline: 'Default tagline' }
            })
        )

        writeFileSync(
            join(tempDir, `${productId}-sales-copy-holiday.json`),
            JSON.stringify({
                id: 'holiday',
                salesCopy: { ...createValidSalesCopyData(), tagline: 'Holiday special tagline' }
            })
        )

        const defaultResult = loadActiveSalesCopy(productId, 'default')
        const holidayResult = loadActiveSalesCopy(productId, 'holiday')

        expect(defaultResult?.tagline).toBe('Default tagline')
        expect(holidayResult?.tagline).toBe('Holiday special tagline')
    })
})

// Cross-cutting concerns
describe('Error handling consistency', () => {
    it('should log errors with consistent format across all load functions', () => {
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
        const productId = 'error-test'

        writeFileSync(join(tempDir, `${productId}-faq.json`), '{invalid')
        writeFileSync(join(tempDir, `${productId}-testimonials.json`), '{invalid')
        writeFileSync(join(tempDir, `${productId}-media.json`), '{invalid')
        writeFileSync(join(tempDir, `${productId}-sales-copy-default.json`), '{invalid')

        loadFAQs(productId)
        loadTestimonials(productId)
        loadMedia(productId)
        loadActiveSalesCopy(productId, 'default')

        // All should log errors with ❌ prefix
        expect(consoleSpy).toHaveBeenCalledTimes(4)
        expect(consoleSpy.mock.calls[0][0]).toContain('❌')
        expect(consoleSpy.mock.calls[1][0]).toContain('❌')
        expect(consoleSpy.mock.calls[2][0]).toContain('❌')
        expect(consoleSpy.mock.calls[3][0]).toContain('❌')

        // All should mention invalid JSON
        expect(consoleSpy.mock.calls[0][0]).toContain('invalid JSON')
        expect(consoleSpy.mock.calls[1][0]).toContain('invalid JSON')
        expect(consoleSpy.mock.calls[2][0]).toContain('invalid JSON')
        expect(consoleSpy.mock.calls[3][0]).toContain('invalid JSON')

        consoleSpy.mockRestore()
    })

    it('should throw errors with consistent format in STRICT_MODE', () => {
        process.env.STRICT_VALIDATION = 'true'
        const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
        const productId = 'strict-error-test'

        writeFileSync(join(tempDir, `${productId}-faq.json`), '{invalid')
        writeFileSync(join(tempDir, `${productId}-testimonials.json`), '{invalid')
        writeFileSync(join(tempDir, `${productId}-media.json`), '{invalid')
        writeFileSync(join(tempDir, `${productId}-sales-copy-default.json`), '{invalid')

        expect(() => loadFAQs(productId)).toThrow()
        expect(() => loadTestimonials(productId)).toThrow()
        expect(() => loadMedia(productId)).toThrow()
        expect(() => loadActiveSalesCopy(productId, 'default')).toThrow()

        consoleSpy.mockRestore()
        process.env.STRICT_VALIDATION = 'false'
    })
})
