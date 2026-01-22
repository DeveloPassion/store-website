import { describe, it, expect } from 'bun:test'
import { resolvePath, pathExists, getAvailablePaths } from './resolver.js'
import type { PlaceholderContext } from '../../../src/schemas/placeholder.schema.js'

// Helper to create a test context
function createTestContext(overrides: Partial<PlaceholderContext> = {}): PlaceholderContext {
    return {
        product: {
            id: 'test-product',
            name: 'Test Product',
            price: 149.99,
            currency: 'EUR',
            variants: [
                { name: 'Basic', price: 99.99, gumroadVariantId: 'basic' },
                { name: 'Pro', price: 199.99, gumroadVariantId: 'pro' }
            ],
            discount: null
        },
        stats: {
            userCount: '1,000+',
            timeSaved: { value: '10+ hours', label: 'Weekly' },
            ratings: {
                gumroad: [{ id: 'r1', rating: 5, date: null }]
            }
        },
        salesCopy: {
            tagline: 'Best product ever',
            highlights: ['Feature 1', 'Feature 2']
        },
        computed: {
            ratingsCount: 42,
            averageRating: 4.8,
            testimonialsCount: 10,
            includedIn: ['bundle-1', 'bundle-2']
        },
        ...overrides
    }
}

describe('resolvePath', () => {
    describe('product source', () => {
        it('should resolve simple product fields', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'product', 'price')
            expect(result.success).toBe(true)
            expect(result.value).toBe(149.99)
        })

        it('should resolve nested product paths', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'product', 'variants.0.price')
            expect(result.success).toBe(true)
            expect(result.value).toBe(99.99)
        })

        it('should resolve string fields', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'product', 'name')
            expect(result.success).toBe(true)
            expect(result.value).toBe('Test Product')
        })

        it('should handle array index access', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'product', 'variants.1.name')
            expect(result.success).toBe(true)
            expect(result.value).toBe('Pro')
        })

        it('should return error for invalid path', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'product', 'nonexistent')
            expect(result.success).toBe(false)
            expect(result.error).toContain('not found')
        })

        it('should return error for invalid array index', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'product', 'variants.99.price')
            expect(result.success).toBe(false)
        })

        it('should handle null values', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'product', 'discount')
            expect(result.success).toBe(true)
            expect(result.value).toBeNull()
        })
    })

    describe('stats source', () => {
        it('should resolve simple string stat', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'stats', 'userCount')
            expect(result.success).toBe(true)
            expect(result.value).toBe('1,000+')
        })

        it('should extract value from StatItem object', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'stats', 'timeSaved')
            expect(result.success).toBe(true)
            expect(result.value).toBe('10+ hours')
        })

        it('should handle null stats source', () => {
            const context = createTestContext({ stats: null })
            const result = resolvePath(context, 'stats', 'userCount')
            expect(result.success).toBe(false)
            expect(result.error).toContain('null')
        })

        it('should resolve nested ratings', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'stats', 'ratings.gumroad.0.rating')
            expect(result.success).toBe(true)
            expect(result.value).toBe(5)
        })
    })

    describe('salesCopy source', () => {
        it('should resolve salesCopy fields', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'salesCopy', 'tagline')
            expect(result.success).toBe(true)
            expect(result.value).toBe('Best product ever')
        })

        it('should handle null salesCopy source', () => {
            const context = createTestContext({ salesCopy: null })
            const result = resolvePath(context, 'salesCopy', 'tagline')
            expect(result.success).toBe(false)
        })

        it('should resolve array items in salesCopy', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'salesCopy', 'highlights.0')
            expect(result.success).toBe(true)
            expect(result.value).toBe('Feature 1')
        })
    })

    describe('computed source', () => {
        it('should resolve computed values', () => {
            const context = createTestContext()

            expect(resolvePath(context, 'computed', 'ratingsCount').value).toBe(42)
            expect(resolvePath(context, 'computed', 'averageRating').value).toBe(4.8)
            expect(resolvePath(context, 'computed', 'testimonialsCount').value).toBe(10)
        })

        it('should resolve array computed values', () => {
            const context = createTestContext()
            const result = resolvePath(context, 'computed', 'includedIn.0')
            expect(result.success).toBe(true)
            expect(result.value).toBe('bundle-1')
        })

        it('should handle null computed values', () => {
            const context = createTestContext({
                computed: {
                    ratingsCount: null,
                    averageRating: null,
                    testimonialsCount: 0,
                    includedIn: []
                }
            })
            const result = resolvePath(context, 'computed', 'ratingsCount')
            expect(result.success).toBe(true)
            expect(result.value).toBeNull()
        })
    })
})

describe('pathExists', () => {
    it('should return true for existing paths', () => {
        const context = createTestContext()
        expect(pathExists(context, 'product', 'price')).toBe(true)
        expect(pathExists(context, 'product', 'variants.0.price')).toBe(true)
        expect(pathExists(context, 'stats', 'userCount')).toBe(true)
        expect(pathExists(context, 'computed', 'ratingsCount')).toBe(true)
    })

    it('should return false for non-existent paths', () => {
        const context = createTestContext()
        expect(pathExists(context, 'product', 'nonexistent')).toBe(false)
        expect(pathExists(context, 'product', 'variants.99')).toBe(false)
    })

    it('should return true even for null values', () => {
        const context = createTestContext()
        expect(pathExists(context, 'product', 'discount')).toBe(true)
    })

    it('should return false when source is null', () => {
        const context = createTestContext({ stats: null })
        expect(pathExists(context, 'stats', 'userCount')).toBe(false)
    })
})

describe('getAvailablePaths', () => {
    it('should return available paths for product', () => {
        const context = createTestContext()
        const paths = getAvailablePaths(context, 'product')
        expect(paths).toContain('id')
        expect(paths).toContain('name')
        expect(paths).toContain('price')
        expect(paths).toContain('variants')
    })

    it('should return available paths for computed', () => {
        const context = createTestContext()
        const paths = getAvailablePaths(context, 'computed')
        expect(paths).toContain('ratingsCount')
        expect(paths).toContain('averageRating')
        expect(paths).toContain('testimonialsCount')
        expect(paths).toContain('includedIn')
    })

    it('should return empty array for null source', () => {
        const context = createTestContext({ stats: null })
        const paths = getAvailablePaths(context, 'stats')
        expect(paths).toEqual([])
    })

    it('should respect max depth', () => {
        const context = createTestContext()
        const paths = getAvailablePaths(context, 'product', 1)
        // Should include top-level and first nested, but not deeply nested
        expect(paths).toContain('variants')
        expect(paths).toContain('variants.0')
        // Depending on max depth implementation
    })
})
