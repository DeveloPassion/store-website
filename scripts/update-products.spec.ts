/**
 * Unit tests for update-products.ts I/O functions
 *
 * Tests the file loading and saving functions for Media, FAQs, and Testimonials.
 * Uses temporary directories to isolate file system operations.
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import {
    loadMedia,
    saveMedia,
    loadFaqs,
    saveFaqs,
    loadTestimonials,
    saveTestimonials
} from './update-products.js'
import type { MediaItem } from '../src/schemas/media.schema.js'
import type { FAQ } from '../src/types/faq'
import type { Testimonial } from '../src/types/testimonial'

// Test fixtures
const createValidMediaItem = (overrides: Partial<MediaItem> = {}): MediaItem => ({
    id: 'media-test-1',
    type: 'image',
    url: '/assets/images/test.png',
    title: 'Test Image',
    altText: 'Test image description',
    order: 0,
    group: 'main',
    description: null,
    caption: null,
    youtubeId: null,
    thumbnailUrl: null,
    width: null,
    height: null,
    ...overrides
})

const createValidFAQ = (overrides: Partial<FAQ> = {}): FAQ => ({
    id: 'faq-test-1',
    question: 'What is this?',
    answer: 'This is a test FAQ.',
    ...overrides
})

const createValidTestimonial = (overrides: Partial<Testimonial> = {}): Testimonial => ({
    id: 'testimonial-test-1',
    author: 'John Doe',
    quote: 'This is an amazing product!',
    featured: false,
    role: null,
    company: null,
    avatarUrl: null,
    twitterHandle: null,
    twitterUrl: null,
    sourceUrl: null,
    ...overrides
})

// Test helpers
let tempDir: string

beforeEach(() => {
    // Create a unique temp directory for each test
    tempDir = join(tmpdir(), `store-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    mkdirSync(tempDir, { recursive: true })
})

afterEach(() => {
    // Clean up temp directory
    if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true })
    }
})

describe('loadMedia', () => {
    it('should load existing valid media file and return data array', () => {
        const productId = 'test-product'
        const mediaPath = join(tempDir, `${productId}-media.json`)
        const mediaData = [
            createValidMediaItem({ id: 'media-1', order: 0 }),
            createValidMediaItem({ id: 'media-2', order: 1 })
        ]
        const fileContent = { data: mediaData }

        writeFileSync(mediaPath, JSON.stringify(fileContent, null, 4), 'utf-8')

        const result = loadMedia(tempDir, productId)

        expect(result).toEqual(mediaData)
        expect(result.length).toBe(2)
        expect(result[0].id).toBe('media-1')
        expect(result[1].id).toBe('media-2')
    })

    it('should return empty array when media file does not exist', () => {
        const productId = 'nonexistent-product'

        const result = loadMedia(tempDir, productId)

        expect(result).toEqual([])
        expect(result.length).toBe(0)
    })

    it('should throw error for invalid JSON syntax', () => {
        const productId = 'invalid-json'
        const mediaPath = join(tempDir, `${productId}-media.json`)

        writeFileSync(mediaPath, '{ invalid json }', 'utf-8')

        expect(() => {
            loadMedia(tempDir, productId)
        }).toThrow()
    })

    it('should throw validation error for invalid schema', () => {
        const productId = 'invalid-schema'
        const mediaPath = join(tempDir, `${productId}-media.json`)
        const invalidData = {
            data: [
                {
                    id: 'media-1',
                    type: 'image',
                    // Missing required fields: url, title, altText, order, group
                    url: '/test.png'
                }
            ]
        }

        writeFileSync(mediaPath, JSON.stringify(invalidData, null, 4), 'utf-8')

        expect(() => {
            loadMedia(tempDir, productId)
        }).toThrow(/Invalid media data/)
    })

    it('should throw validation error when data is not an array', () => {
        const productId = 'not-array'
        const mediaPath = join(tempDir, `${productId}-media.json`)
        const invalidData = {
            data: createValidMediaItem() // Object instead of array
        }

        writeFileSync(mediaPath, JSON.stringify(invalidData, null, 4), 'utf-8')

        expect(() => {
            loadMedia(tempDir, productId)
        }).toThrow(/Invalid media data/)
    })

    it('should throw validation error when file has no data property', () => {
        const productId = 'no-data-prop'
        const mediaPath = join(tempDir, `${productId}-media.json`)
        const invalidData = [createValidMediaItem()] // Array instead of { data: [] }

        writeFileSync(mediaPath, JSON.stringify(invalidData, null, 4), 'utf-8')

        expect(() => {
            loadMedia(tempDir, productId)
        }).toThrow(/Invalid media data/)
    })

    it('should construct correct file path', () => {
        const productId = 'path-test'
        const mediaPath = join(tempDir, `${productId}-media.json`)
        const fileContent = { data: [] }

        writeFileSync(mediaPath, JSON.stringify(fileContent, null, 4), 'utf-8')

        // Should not throw, proving path construction is correct
        const result = loadMedia(tempDir, productId)
        expect(result).toEqual([])
    })
})

describe('saveMedia', () => {
    it('should save valid media data to file with correct format', () => {
        const productId = 'save-test'
        const mediaData = [
            createValidMediaItem({ id: 'media-1', order: 0 }),
            createValidMediaItem({ id: 'media-2', order: 1 })
        ]

        saveMedia(tempDir, productId, mediaData)

        const mediaPath = join(tempDir, `${productId}-media.json`)
        expect(existsSync(mediaPath)).toBe(true)

        const savedContent = JSON.parse(readFileSync(mediaPath, 'utf-8'))
        expect(savedContent).toHaveProperty('data')
        expect(savedContent.data).toEqual(mediaData)
    })

    it('should save empty array', () => {
        const productId = 'empty-save'
        const mediaData: MediaItem[] = []

        saveMedia(tempDir, productId, mediaData)

        const mediaPath = join(tempDir, `${productId}-media.json`)
        expect(existsSync(mediaPath)).toBe(true)

        const savedContent = JSON.parse(readFileSync(mediaPath, 'utf-8'))
        expect(savedContent.data).toEqual([])
    })

    it('should sort media by group priority, then by order', () => {
        const productId = 'sort-test'
        const mediaData = [
            createValidMediaItem({ id: 'bonus-2', group: 'bonus', order: 1 }),
            createValidMediaItem({ id: 'cover-1', group: 'cover', order: 0 }),
            createValidMediaItem({ id: 'main-1', group: 'main', order: 2 }),
            createValidMediaItem({ id: 'cover-2', group: 'cover', order: 1 }),
            createValidMediaItem({ id: 'secondary-1', group: 'secondary', order: 0 })
        ]

        saveMedia(tempDir, productId, mediaData)

        const mediaPath = join(tempDir, `${productId}-media.json`)
        const savedContent = JSON.parse(readFileSync(mediaPath, 'utf-8'))
        const sorted = savedContent.data

        // Expected order: cover (priority 0), main (1), secondary (2), bonus (3)
        // Within each group, sorted by order field
        expect(sorted[0].id).toBe('cover-1') // cover, order 0
        expect(sorted[1].id).toBe('cover-2') // cover, order 1
        expect(sorted[2].id).toBe('main-1') // main, order 2
        expect(sorted[3].id).toBe('secondary-1') // secondary, order 0
        expect(sorted[4].id).toBe('bonus-2') // bonus, order 1
    })

    it('should throw validation error for invalid media data', () => {
        const productId = 'invalid-save'
        const invalidData = [
            {
                id: 'media-1',
                type: 'image'
                // Missing required fields
            }
        ] as unknown as MediaItem[]

        expect(() => {
            saveMedia(tempDir, productId, invalidData)
        }).toThrow(/Validation failed/)
    })

    it('should not mutate original media array', () => {
        const productId = 'immutable-test'
        const mediaData = [
            createValidMediaItem({ id: 'main-1', group: 'main', order: 0 }),
            createValidMediaItem({ id: 'cover-1', group: 'cover', order: 0 })
        ]
        const originalOrder = mediaData.map((m) => m.id)

        saveMedia(tempDir, productId, mediaData)

        // Original array should be unchanged
        expect(mediaData.map((m) => m.id)).toEqual(originalOrder)
    })

    it('should construct correct file path', () => {
        const productId = 'path-save-test'
        const mediaData = [createValidMediaItem()]

        saveMedia(tempDir, productId, mediaData)

        const expectedPath = join(tempDir, `${productId}-media.json`)
        expect(existsSync(expectedPath)).toBe(true)
    })
})

describe('loadFaqs', () => {
    it('should load existing valid FAQ file and return data array', () => {
        const productId = 'test-product'
        const faqPath = join(tempDir, `${productId}-faq.json`)
        const faqData = [createValidFAQ({ id: 'faq-1' }), createValidFAQ({ id: 'faq-2' })]
        const fileContent = { data: faqData }

        writeFileSync(faqPath, JSON.stringify(fileContent, null, 4), 'utf-8')

        const result = loadFaqs(tempDir, productId)

        expect(result).toEqual(faqData)
        expect(result.length).toBe(2)
        expect(result[0].id).toBe('faq-1')
        expect(result[1].id).toBe('faq-2')
    })

    it('should return empty array when FAQ file does not exist', () => {
        const productId = 'nonexistent-product'

        const result = loadFaqs(tempDir, productId)

        expect(result).toEqual([])
        expect(result.length).toBe(0)
    })

    it('should throw error for invalid JSON syntax', () => {
        const productId = 'invalid-json'
        const faqPath = join(tempDir, `${productId}-faq.json`)

        writeFileSync(faqPath, '{ "data": [invalid] }', 'utf-8')

        expect(() => {
            loadFaqs(tempDir, productId)
        }).toThrow()
    })

    it('should throw validation error for invalid schema', () => {
        const productId = 'invalid-schema'
        const faqPath = join(tempDir, `${productId}-faq.json`)
        const invalidData = {
            data: [
                {
                    id: 'faq-1',
                    question: 'What is this?'
                    // Missing required field: answer
                }
            ]
        }

        writeFileSync(faqPath, JSON.stringify(invalidData, null, 4), 'utf-8')

        expect(() => {
            loadFaqs(tempDir, productId)
        }).toThrow(/Invalid FAQ data/)
    })

    it('should throw validation error when data is not an array', () => {
        const productId = 'not-array'
        const faqPath = join(tempDir, `${productId}-faq.json`)
        const invalidData = {
            data: createValidFAQ() // Object instead of array
        }

        writeFileSync(faqPath, JSON.stringify(invalidData, null, 4), 'utf-8')

        expect(() => {
            loadFaqs(tempDir, productId)
        }).toThrow(/Invalid FAQ data/)
    })

    it('should throw validation error when file has no data property', () => {
        const productId = 'no-data-prop'
        const faqPath = join(tempDir, `${productId}-faq.json`)
        const invalidData = [createValidFAQ()] // Array instead of { data: [] }

        writeFileSync(faqPath, JSON.stringify(invalidData, null, 4), 'utf-8')

        expect(() => {
            loadFaqs(tempDir, productId)
        }).toThrow(/Invalid FAQ data/)
    })

    it('should construct correct file path', () => {
        const productId = 'path-test'
        const faqPath = join(tempDir, `${productId}-faq.json`)
        const fileContent = { data: [] }

        writeFileSync(faqPath, JSON.stringify(fileContent, null, 4), 'utf-8')

        const result = loadFaqs(tempDir, productId)
        expect(result).toEqual([])
    })
})

describe('saveFaqs', () => {
    it('should save valid FAQ data to file with correct format', () => {
        const productId = 'save-test'
        const faqData = [createValidFAQ({ id: 'faq-1' }), createValidFAQ({ id: 'faq-2' })]

        saveFaqs(tempDir, productId, faqData)

        const faqPath = join(tempDir, `${productId}-faq.json`)
        expect(existsSync(faqPath)).toBe(true)

        const savedContent = JSON.parse(readFileSync(faqPath, 'utf-8'))
        expect(savedContent).toHaveProperty('data')
        expect(savedContent.data).toEqual(faqData)
    })

    it('should save empty array', () => {
        const productId = 'empty-save'
        const faqData: FAQ[] = []

        saveFaqs(tempDir, productId, faqData)

        const faqPath = join(tempDir, `${productId}-faq.json`)
        expect(existsSync(faqPath)).toBe(true)

        const savedContent = JSON.parse(readFileSync(faqPath, 'utf-8'))
        expect(savedContent.data).toEqual([])
    })

    it('should preserve array order when saving', () => {
        const productId = 'order-test'
        const faqData = [
            createValidFAQ({ id: 'faq-3' }),
            createValidFAQ({ id: 'faq-1' }),
            createValidFAQ({ id: 'faq-2' })
        ]

        saveFaqs(tempDir, productId, faqData)

        const faqPath = join(tempDir, `${productId}-faq.json`)
        const savedContent = JSON.parse(readFileSync(faqPath, 'utf-8'))
        const saved = savedContent.data

        // Order should be preserved as provided
        expect(saved[0].id).toBe('faq-3')
        expect(saved[1].id).toBe('faq-1')
        expect(saved[2].id).toBe('faq-2')
    })

    it('should throw validation error for invalid FAQ data', () => {
        const productId = 'invalid-save'
        const invalidData = [
            {
                id: 'faq-1',
                question: 'What is this?'
                // Missing required fields
            }
        ] as unknown as FAQ[]

        expect(() => {
            saveFaqs(tempDir, productId, invalidData)
        }).toThrow(/Validation failed/)
    })

    it('should construct correct file path', () => {
        const productId = 'path-save-test'
        const faqData = [createValidFAQ()]

        saveFaqs(tempDir, productId, faqData)

        const expectedPath = join(tempDir, `${productId}-faq.json`)
        expect(existsSync(expectedPath)).toBe(true)
    })
})

describe('loadTestimonials', () => {
    it('should load existing valid testimonial file and return data array', () => {
        const productId = 'test-product'
        const testimonialPath = join(tempDir, `${productId}-testimonials.json`)
        const testimonialData = [
            createValidTestimonial({ id: 'test-1' }),
            createValidTestimonial({ id: 'test-2' })
        ]
        const fileContent = { data: testimonialData }

        writeFileSync(testimonialPath, JSON.stringify(fileContent, null, 4), 'utf-8')

        const result = loadTestimonials(tempDir, productId)

        expect(result).toEqual(testimonialData)
        expect(result.length).toBe(2)
        expect(result[0].id).toBe('test-1')
        expect(result[1].id).toBe('test-2')
    })

    it('should return empty array when testimonial file does not exist', () => {
        const productId = 'nonexistent-product'

        const result = loadTestimonials(tempDir, productId)

        expect(result).toEqual([])
        expect(result.length).toBe(0)
    })

    it('should throw error for invalid JSON syntax', () => {
        const productId = 'invalid-json'
        const testimonialPath = join(tempDir, `${productId}-testimonials.json`)

        writeFileSync(testimonialPath, '{ "data": [invalid testimonial] }', 'utf-8')

        expect(() => {
            loadTestimonials(tempDir, productId)
        }).toThrow()
    })

    it('should throw validation error for invalid schema', () => {
        const productId = 'invalid-schema'
        const testimonialPath = join(tempDir, `${productId}-testimonials.json`)
        const invalidData = {
            data: [
                {
                    id: 'test-1',
                    author: 'John Doe',
                    quote: 'Great product!'
                    // Missing required field: featured
                }
            ]
        }

        writeFileSync(testimonialPath, JSON.stringify(invalidData, null, 4), 'utf-8')

        expect(() => {
            loadTestimonials(tempDir, productId)
        }).toThrow(/Invalid testimonial data/)
    })

    it('should throw validation error when data is not an array', () => {
        const productId = 'not-array'
        const testimonialPath = join(tempDir, `${productId}-testimonials.json`)
        const invalidData = {
            data: createValidTestimonial() // Object instead of array
        }

        writeFileSync(testimonialPath, JSON.stringify(invalidData, null, 4), 'utf-8')

        expect(() => {
            loadTestimonials(tempDir, productId)
        }).toThrow(/Invalid testimonial data/)
    })

    it('should throw validation error when file has no data property', () => {
        const productId = 'no-data-prop'
        const testimonialPath = join(tempDir, `${productId}-testimonials.json`)
        const invalidData = [createValidTestimonial()] // Array instead of { data: [] }

        writeFileSync(testimonialPath, JSON.stringify(invalidData, null, 4), 'utf-8')

        expect(() => {
            loadTestimonials(tempDir, productId)
        }).toThrow(/Invalid testimonial data/)
    })

    it('should construct correct file path', () => {
        const productId = 'path-test'
        const testimonialPath = join(tempDir, `${productId}-testimonials.json`)
        const fileContent = { data: [] }

        writeFileSync(testimonialPath, JSON.stringify(fileContent, null, 4), 'utf-8')

        const result = loadTestimonials(tempDir, productId)
        expect(result).toEqual([])
    })
})

describe('saveTestimonials', () => {
    it('should save valid testimonial data to file with correct format', () => {
        const productId = 'save-test'
        const testimonialData = [
            createValidTestimonial({ id: 'test-1' }),
            createValidTestimonial({ id: 'test-2' })
        ]

        saveTestimonials(tempDir, productId, testimonialData)

        const testimonialPath = join(tempDir, `${productId}-testimonials.json`)
        expect(existsSync(testimonialPath)).toBe(true)

        const savedContent = JSON.parse(readFileSync(testimonialPath, 'utf-8'))
        expect(savedContent).toHaveProperty('data')
        expect(savedContent.data).toEqual(testimonialData)
    })

    it('should save empty array', () => {
        const productId = 'empty-save'
        const testimonialData: Testimonial[] = []

        saveTestimonials(tempDir, productId, testimonialData)

        const testimonialPath = join(tempDir, `${productId}-testimonials.json`)
        expect(existsSync(testimonialPath)).toBe(true)

        const savedContent = JSON.parse(readFileSync(testimonialPath, 'utf-8'))
        expect(savedContent.data).toEqual([])
    })

    it('should sort testimonials by featured (featured first), then by author name alphabetically', () => {
        const productId = 'sort-test'
        const testimonialData = [
            createValidTestimonial({ id: 'test-3', author: 'Zara Smith', featured: false }),
            createValidTestimonial({ id: 'test-1', author: 'Bob Jones', featured: true }),
            createValidTestimonial({ id: 'test-2', author: 'Alice Brown', featured: true }),
            createValidTestimonial({ id: 'test-4', author: 'Charlie Davis', featured: false })
        ]

        saveTestimonials(tempDir, productId, testimonialData)

        const testimonialPath = join(tempDir, `${productId}-testimonials.json`)
        const savedContent = JSON.parse(readFileSync(testimonialPath, 'utf-8'))
        const sorted = savedContent.data

        // Featured first (sorted by author name ascending), then non-featured (sorted by author name ascending)
        expect(sorted[0].id).toBe('test-2') // featured, Alice Brown
        expect(sorted[1].id).toBe('test-1') // featured, Bob Jones
        expect(sorted[2].id).toBe('test-4') // not featured, Charlie Davis
        expect(sorted[3].id).toBe('test-3') // not featured, Zara Smith
    })

    it('should throw validation error for invalid testimonial data', () => {
        const productId = 'invalid-save'
        const invalidData = [
            {
                id: 'test-1',
                author: 'John Doe'
                // Missing required fields
            }
        ] as unknown as Testimonial[]

        expect(() => {
            saveTestimonials(tempDir, productId, invalidData)
        }).toThrow(/Validation failed/)
    })

    it('should not mutate original testimonial array', () => {
        const productId = 'immutable-test'
        const testimonialData = [
            createValidTestimonial({ id: 'test-2', author: 'Zara Smith', featured: false }),
            createValidTestimonial({ id: 'test-1', author: 'Alice Brown', featured: true })
        ]
        const originalOrder = testimonialData.map((t) => t.id)

        saveTestimonials(tempDir, productId, testimonialData)

        // Original array should be unchanged
        expect(testimonialData.map((t) => t.id)).toEqual(originalOrder)
    })

    it('should construct correct file path', () => {
        const productId = 'path-save-test'
        const testimonialData = [createValidTestimonial()]

        saveTestimonials(tempDir, productId, testimonialData)

        const expectedPath = join(tempDir, `${productId}-testimonials.json`)
        expect(existsSync(expectedPath)).toBe(true)
    })
})
