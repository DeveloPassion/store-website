import { describe, expect, test } from 'bun:test'
import { RedirectEntrySchema, RedirectsConfigSchema, RedirectTypeSchema } from './redirect.schema'

describe('RedirectTypeSchema', () => {
    test('accepts TEMPORARY', () => {
        const result = RedirectTypeSchema.safeParse('TEMPORARY')
        expect(result.success).toBe(true)
    })

    test('accepts PERMANENT', () => {
        const result = RedirectTypeSchema.safeParse('PERMANENT')
        expect(result.success).toBe(true)
    })

    test('rejects invalid type', () => {
        const result = RedirectTypeSchema.safeParse('INVALID')
        expect(result.success).toBe(false)
    })
})

describe('RedirectEntrySchema', () => {
    test('validates a complete redirect entry', () => {
        const validEntry = {
            from: '/old-path',
            to: '/new-path',
            type: 'TEMPORARY' as const,
            description: 'Test redirect',
            includeInSitemap: true
        }

        const result = RedirectEntrySchema.safeParse(validEntry)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data).toEqual(validEntry)
        }
    })

    test('applies default type TEMPORARY', () => {
        const entry = {
            from: '/test',
            to: '/destination'
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.type).toBe('TEMPORARY')
        }
    })

    test('applies default includeInSitemap false', () => {
        const entry = {
            from: '/test',
            to: '/destination'
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.includeInSitemap).toBe(false)
        }
    })

    test('accepts external URL as destination', () => {
        const entry = {
            from: '/affiliates',
            to: 'https://example.com/affiliates',
            type: 'PERMANENT' as const
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(true)
    })

    test('rejects source path without leading slash', () => {
        const entry = {
            from: 'no-leading-slash',
            to: '/destination'
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(false)
    })

    test('rejects source path with invalid characters', () => {
        const entry = {
            from: '/invalid path with spaces',
            to: '/destination'
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(false)
    })

    test('accepts source path with hyphens and underscores', () => {
        const entry = {
            from: '/valid-path_with-chars',
            to: '/destination'
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(true)
    })

    test('accepts nested source paths', () => {
        const entry = {
            from: '/nested/path/here',
            to: '/destination'
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(true)
    })

    test('rejects empty destination', () => {
        const entry = {
            from: '/test',
            to: ''
        }

        const result = RedirectEntrySchema.safeParse(entry)
        expect(result.success).toBe(false)
    })
})

describe('RedirectsConfigSchema', () => {
    test('validates an array of redirect entries', () => {
        const config = [
            {
                from: '/old-1',
                to: '/new-1',
                type: 'TEMPORARY'
            },
            {
                from: '/old-2',
                to: 'https://example.com',
                type: 'PERMANENT' as const
            }
        ]

        const result = RedirectsConfigSchema.safeParse(config)
        expect(result.success).toBe(true)
    })

    test('validates empty array', () => {
        const config: unknown[] = []
        const result = RedirectsConfigSchema.safeParse(config)
        expect(result.success).toBe(true)
    })

    test('rejects duplicate source paths', () => {
        const config = [
            {
                from: '/same-path',
                to: '/destination-1'
            },
            {
                from: '/same-path',
                to: '/destination-2'
            }
        ]

        const result = RedirectsConfigSchema.safeParse(config)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.message).toContain('Duplicate source paths')
        }
    })

    test('detects 2-hop redirect loop', () => {
        const config = [
            {
                from: '/a',
                to: '/b'
            },
            {
                from: '/b',
                to: '/a'
            }
        ]

        const result = RedirectsConfigSchema.safeParse(config)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.message).toContain('Redirect loop')
        }
    })

    test('detects 3-hop redirect loop', () => {
        const config = [
            {
                from: '/a',
                to: '/b'
            },
            {
                from: '/b',
                to: '/c'
            },
            {
                from: '/c',
                to: '/a'
            }
        ]

        const result = RedirectsConfigSchema.safeParse(config)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.message).toContain('Redirect loop')
        }
    })

    test('allows valid redirect chains without loops', () => {
        const config = [
            {
                from: '/a',
                to: '/b'
            },
            {
                from: '/b',
                to: '/c'
            },
            {
                from: '/c',
                to: 'https://example.com'
            }
        ]

        const result = RedirectsConfigSchema.safeParse(config)
        expect(result.success).toBe(true)
    })

    test('allows redirects to external URLs (no loop possible)', () => {
        const config = [
            {
                from: '/affiliates',
                to: 'https://external.com/affiliates'
            },
            {
                from: '/partners',
                to: 'https://external.com/partners'
            }
        ]

        const result = RedirectsConfigSchema.safeParse(config)
        expect(result.success).toBe(true)
    })

    test('allows mixed internal and external redirects', () => {
        const config = [
            {
                from: '/old',
                to: '/new'
            },
            {
                from: '/affiliates',
                to: 'https://example.com/affiliates'
            }
        ]

        const result = RedirectsConfigSchema.safeParse(config)
        expect(result.success).toBe(true)
    })

    test('detects self-referential redirect', () => {
        const config = [
            {
                from: '/same',
                to: '/same'
            }
        ]

        const result = RedirectsConfigSchema.safeParse(config)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.message).toContain('Redirect loop')
        }
    })
})
