import { describe, expect, test } from 'bun:test'
import { RedirectEntrySchema, RedirectsFileSchema } from './redirect.schema'

describe('RedirectEntrySchema', () => {
    test('validates a complete redirect entry', () => {
        const validEntry = {
            source: '/affiliates',
            destination: 'https://example.com/affiliates',
            httpStatusCode: 301
        }

        const result = RedirectEntrySchema.safeParse(validEntry)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data).toEqual(validEntry)
        }
    })

    test('validates internal path destination', () => {
        const entry = {
            source: '/*',
            destination: '/index.html',
            httpStatusCode: 200
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(true)
    })

    test('validates external URL destination', () => {
        const entry = {
            source: '/product-slug',
            destination: 'https://gumroad.com/l/product',
            httpStatusCode: 301
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(true)
    })

    test('accepts various HTTP status codes', () => {
        const statusCodes = [200, 301, 302, 307, 308, 404, 500]

        for (const httpStatusCode of statusCodes) {
            const entry = {
                source: '/test',
                destination: '/destination',
                httpStatusCode
            }

            const result = RedirectEntrySchema.safeParse(entry)
            expect(result.success).toBe(true)
        }
    })

    test('rejects empty source', () => {
        const entry = {
            source: '',
            destination: '/destination',
            httpStatusCode: 301
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(false)
    })

    test('rejects empty destination', () => {
        const entry = {
            source: '/test',
            destination: '',
            httpStatusCode: 301
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(false)
    })

    test('rejects invalid HTTP status code (too low)', () => {
        const entry = {
            source: '/test',
            destination: '/destination',
            httpStatusCode: 99
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(false)
    })

    test('rejects invalid HTTP status code (too high)', () => {
        const entry = {
            source: '/test',
            destination: '/destination',
            httpStatusCode: 600
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(false)
    })

    test('rejects non-integer HTTP status code', () => {
        const entry = {
            source: '/test',
            destination: '/destination',
            httpStatusCode: 301.5
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(false)
    })

    test('rejects missing required fields', () => {
        const incomplete = {
            source: '/test'
        }

        const result = RedirectEntrySchema.safeParse(incomplete)
        expect(result.success).toBe(false)
    })
})

describe('RedirectsFileSchema', () => {
    test('validates a file with multiple redirects', () => {
        const file = {
            redirects: [
                {
                    source: '/affiliates',
                    destination: 'https://example.com/affiliates',
                    httpStatusCode: 301
                },
                {
                    source: '/*',
                    destination: '/index.html',
                    httpStatusCode: 200
                }
            ]
        }

        const result = RedirectsFileSchema.safeParse(file)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.redirects).toHaveLength(2)
        }
    })

    test('validates empty redirects array', () => {
        const file = {
            redirects: []
        }

        const result = RedirectsFileSchema.safeParse(file)
        expect(result.success).toBe(true)
    })

    test('rejects missing redirects property', () => {
        const file = {}

        const result = RedirectsFileSchema.safeParse(file)
        expect(result.success).toBe(false)
    })

    test('rejects invalid redirect entry in array', () => {
        const file = {
            redirects: [
                {
                    source: '/valid',
                    destination: '/destination',
                    httpStatusCode: 301
                },
                {
                    source: '',
                    destination: '/destination',
                    httpStatusCode: 301
                }
            ]
        }

        const result = RedirectsFileSchema.safeParse(file)
        expect(result.success).toBe(false)
    })
})
