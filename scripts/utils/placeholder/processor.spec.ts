import { describe, it, expect } from 'bun:test'
import {
    processString,
    processObject,
    hasUnresolvedPlaceholders,
    findUnresolvedPlaceholders,
    processObjectWithErrors
} from './processor.js'
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
            ]
        },
        stats: {
            userCount: '1,000+',
            timeSaved: { value: '10+ hours', label: 'Weekly' }
        },
        salesCopy: {
            tagline: 'Best product ever'
        },
        computed: {
            ratingsCount: 42,
            averageRating: 4.837,
            testimonialsCount: 10,
            includedIn: ['bundle-1', 'bundle-2']
        },
        ...overrides
    }
}

describe('processString', () => {
    it('should return text unchanged when no placeholders', () => {
        const context = createTestContext()
        expect(processString('Just regular text', context)).toBe('Just regular text')
    })

    it('should replace simple placeholder', () => {
        const context = createTestContext()
        expect(processString('Join ${stats.userCount} users!', context)).toBe('Join 1,000+ users!')
    })

    it('should replace multiple placeholders', () => {
        const context = createTestContext()
        const result = processString(
            '${stats.userCount} users, ${computed.ratingsCount} reviews',
            context
        )
        expect(result).toBe('1,000+ users, 42 reviews')
    })

    it('should apply currency formatter', () => {
        const context = createTestContext()
        expect(processString('Price: ${product.price|currency}', context)).toBe('Price: €149.99')
    })

    it('should apply round formatter', () => {
        const context = createTestContext()
        expect(processString('Rating: ${computed.averageRating|round:1}', context)).toBe(
            'Rating: 4.8'
        )
    })

    it('should apply number formatter', () => {
        const context = createTestContext()
        expect(processString('${computed.ratingsCount|number} reviews', context)).toBe('42 reviews')
    })

    it('should chain formatters', () => {
        const context = createTestContext()
        expect(processString('${product.price|currency|prefix:Only }', context)).toBe(
            'Only €149.99'
        )
    })

    it('should resolve nested paths', () => {
        const context = createTestContext()
        expect(processString('Basic: ${product.variants.0.price|currency}', context)).toBe(
            'Basic: €99.99'
        )
    })

    it('should handle StatItem extraction', () => {
        const context = createTestContext()
        expect(processString('Save ${stats.timeSaved}', context)).toBe('Save 10+ hours')
    })

    it('should use default formatter for null values', () => {
        const context = createTestContext({ stats: null })
        expect(processString('${stats.userCount|default:Many} users', context)).toBe('Many users')
    })

    it('should leave placeholder unchanged if path not found and no default', () => {
        const context = createTestContext()
        expect(processString('${stats.nonexistent} value', context)).toBe(
            '${stats.nonexistent} value'
        )
    })

    it('should handle salesCopy placeholders', () => {
        const context = createTestContext()
        expect(processString('See: ${salesCopy.tagline}', context)).toBe('See: Best product ever')
    })
})

describe('processObject', () => {
    it('should return null/undefined unchanged', () => {
        const context = createTestContext()
        expect(processObject(null, context)).toBeNull()
        expect(processObject(undefined, context)).toBeUndefined()
    })

    it('should process string values', () => {
        const context = createTestContext()
        expect(processObject('${stats.userCount} users', context)).toBe('1,000+ users')
    })

    it('should preserve numbers', () => {
        const context = createTestContext()
        expect(processObject(42, context)).toBe(42)
    })

    it('should preserve booleans', () => {
        const context = createTestContext()
        expect(processObject(true, context)).toBe(true)
    })

    it('should process arrays', () => {
        const context = createTestContext()
        const input = ['${stats.userCount} users', '${computed.ratingsCount} reviews']
        const result = processObject(input, context)
        expect(result).toEqual(['1,000+ users', '42 reviews'])
    })

    it('should process nested objects', () => {
        const context = createTestContext()
        const input = {
            title: '${product.name}',
            stats: {
                users: '${stats.userCount}',
                rating: '${computed.averageRating|round:1}'
            }
        }
        const result = processObject(input, context)
        expect(result).toEqual({
            title: 'Test Product',
            stats: {
                users: '1,000+',
                rating: '4.8'
            }
        })
    })

    it('should process mixed arrays and objects', () => {
        const context = createTestContext()
        const input = {
            highlights: [
                '${stats.userCount} Users',
                '${computed.averageRating|round:1}/5 Rating',
                'Free support'
            ]
        }
        const result = processObject(input, context)
        expect(result).toEqual({
            highlights: ['1,000+ Users', '4.8/5 Rating', 'Free support']
        })
    })

    it('should preserve null values in objects', () => {
        const context = createTestContext()
        const input = {
            title: '${product.name}',
            subtitle: null
        }
        const result = processObject(input, context)
        expect(result).toEqual({
            title: 'Test Product',
            subtitle: null
        })
    })

    it('should not mutate input object', () => {
        const context = createTestContext()
        const input = { title: '${product.name}' }
        const original = JSON.stringify(input)
        processObject(input, context)
        expect(JSON.stringify(input)).toBe(original)
    })
})

describe('hasUnresolvedPlaceholders', () => {
    it('should return true for unresolved placeholders', () => {
        expect(hasUnresolvedPlaceholders('${stats.userCount}')).toBe(true)
    })

    it('should return false for text without placeholders', () => {
        expect(hasUnresolvedPlaceholders('Just text')).toBe(false)
    })

    it('should return false for empty string', () => {
        expect(hasUnresolvedPlaceholders('')).toBe(false)
    })
})

describe('findUnresolvedPlaceholders', () => {
    it('should find placeholders in strings', () => {
        const result = findUnresolvedPlaceholders('${stats.userCount}', '')
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({ path: '', placeholder: '${stats.userCount}' })
    })

    it('should find placeholders in arrays', () => {
        const result = findUnresolvedPlaceholders(['${stats.userCount}', '${product.price}'])
        expect(result).toHaveLength(2)
        expect(result[0].path).toBe('[0]')
        expect(result[1].path).toBe('[1]')
    })

    it('should find placeholders in nested objects', () => {
        const result = findUnresolvedPlaceholders({
            outer: {
                inner: '${stats.userCount}'
            }
        })
        expect(result).toHaveLength(1)
        expect(result[0].path).toBe('outer.inner')
    })

    it('should return empty array when no placeholders', () => {
        const result = findUnresolvedPlaceholders({ title: 'No placeholders here' })
        expect(result).toEqual([])
    })

    it('should handle null and undefined', () => {
        expect(findUnresolvedPlaceholders(null)).toEqual([])
        expect(findUnresolvedPlaceholders(undefined)).toEqual([])
    })
})

describe('processObjectWithErrors', () => {
    it('should return processed result and empty errors for valid placeholders', () => {
        const context = createTestContext()
        const { result, errors } = processObjectWithErrors(
            { title: '${stats.userCount} users' },
            context
        )
        expect(result).toEqual({ title: '1,000+ users' })
        expect(errors).toHaveLength(0)
    })

    it('should track errors for invalid paths', () => {
        const context = createTestContext()
        const { errors } = processObjectWithErrors({ title: '${stats.nonexistent}' }, context)
        expect(errors).toHaveLength(1)
        expect(errors[0].path).toBe('title')
        expect(errors[0].placeholder).toBe('${stats.nonexistent}')
    })

    it('should track errors for null source without default', () => {
        const context = createTestContext({ stats: null })
        const { errors } = processObjectWithErrors({ title: '${stats.userCount}' }, context)
        expect(errors).toHaveLength(1)
        expect(errors[0].error).toContain('null')
    })

    it('should track multiple errors', () => {
        const context = createTestContext()
        const { errors } = processObjectWithErrors(
            {
                field1: '${stats.bad1}',
                field2: '${product.bad2}'
            },
            context
        )
        expect(errors).toHaveLength(2)
    })

    it('should process valid placeholders even with some errors', () => {
        const context = createTestContext()
        const { result, errors } = processObjectWithErrors(
            {
                valid: '${stats.userCount}',
                invalid: '${stats.nonexistent}'
            },
            context
        )
        expect(result.valid).toBe('1,000+')
        expect(errors).toHaveLength(1)
    })
})
