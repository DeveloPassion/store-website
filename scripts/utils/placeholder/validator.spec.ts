import { describe, it, expect } from 'bun:test'
import {
    validatePlaceholdersInData,
    validatePlaceholders,
    formatValidationErrors,
    hasBlockingErrors,
    filterErrorsByType
} from './validator.js'
import type { PlaceholderContext } from '../../../src/schemas/placeholder.schema.js'

// Helper to create a test context
function createTestContext(overrides: Partial<PlaceholderContext> = {}): PlaceholderContext {
    return {
        product: {
            id: 'test-product',
            name: 'Test Product',
            price: 149.99,
            currency: 'EUR',
            contents: ['Feature 1', 'Feature 2'],
            variants: [{ name: 'Basic', price: 99.99 }],
            discount: null
        },
        stats: {
            userCount: '1,000+',
            timeSaved: { value: '10+ hours', label: 'Weekly' }
        },
        salesCopy: {
            tagline: 'Best product ever',
            highlights: ['Great feature', 'Amazing value']
        },
        computed: {
            ratingsCount: 42,
            averageRating: 4.8,
            testimonialsCount: 10,
            includedIn: []
        },
        ...overrides
    }
}

describe('validatePlaceholdersInData', () => {
    it('should return no errors for valid placeholders', () => {
        const context = createTestContext()
        const data = {
            title: '${stats.userCount} users',
            price: '${product.price|currency}'
        }
        const errors = validatePlaceholdersInData(data, 'sales-copy', 'test-product', context)
        expect(errors).toHaveLength(0)
    })

    it('should detect invalid source', () => {
        const context = createTestContext()
        const data = { title: '${invalid.source}' }
        const errors = validatePlaceholdersInData(data, 'sales-copy', 'test-product', context)
        expect(errors).toHaveLength(1)
        expect(errors[0].errorType).toBe('UNKNOWN_SOURCE')
        expect(errors[0].message).toContain('invalid')
    })

    it('should detect invalid path', () => {
        const context = createTestContext()
        const data = { title: '${stats.nonexistent}' }
        const errors = validatePlaceholdersInData(data, 'sales-copy', 'test-product', context)
        expect(errors).toHaveLength(1)
        expect(errors[0].errorType).toBe('INVALID_PATH')
    })

    it('should detect unknown formatter', () => {
        const context = createTestContext()
        const data = { title: '${product.price|unknown}' }
        const errors = validatePlaceholdersInData(data, 'sales-copy', 'test-product', context)
        expect(errors).toHaveLength(1)
        expect(errors[0].errorType).toBe('UNKNOWN_FORMATTER')
    })

    it('should detect null value without default', () => {
        const context = createTestContext()
        const data = { title: '${product.discount}' }
        const errors = validatePlaceholdersInData(data, 'sales-copy', 'test-product', context)
        expect(errors).toHaveLength(1)
        expect(errors[0].errorType).toBe('NULL_VALUE')
    })

    it('should not error for null value with default formatter', () => {
        const context = createTestContext()
        const data = { title: '${product.discount|default:None}' }
        const errors = validatePlaceholdersInData(data, 'sales-copy', 'test-product', context)
        expect(errors).toHaveLength(0)
    })

    it('should validate nested arrays', () => {
        const context = createTestContext()
        const data = {
            highlights: ['${stats.userCount}', '${stats.nonexistent}']
        }
        const errors = validatePlaceholdersInData(data, 'sales-copy', 'test-product', context)
        expect(errors).toHaveLength(1)
        expect(errors[0].location).toBe('highlights[1]')
    })

    it('should validate nested objects', () => {
        const context = createTestContext()
        const data = {
            section: {
                title: '${invalid.path}'
            }
        }
        const errors = validatePlaceholdersInData(data, 'sales-copy', 'test-product', context)
        expect(errors).toHaveLength(1)
        expect(errors[0].location).toBe('section.title')
    })

    it('should return correct file name', () => {
        const context = createTestContext()
        const data = { title: '${invalid.path}' }

        const salesCopyErrors = validatePlaceholdersInData(
            data,
            'sales-copy',
            'my-product',
            context
        )
        expect(salesCopyErrors[0].file).toBe('my-product-sales-copy-*.json')

        const faqErrors = validatePlaceholdersInData(data, 'faq', 'my-product', context)
        expect(faqErrors[0].file).toBe('my-product-faq.json')
    })

    it('should detect multiple errors in same string', () => {
        const context = createTestContext()
        const data = { title: '${invalid.one} and ${invalid.two}' }
        const errors = validatePlaceholdersInData(data, 'sales-copy', 'test-product', context)
        expect(errors).toHaveLength(2)
    })

    it('should provide suggestions for invalid paths', () => {
        const context = createTestContext()
        const data = { title: '${stats.userCont}' } // typo
        const errors = validatePlaceholdersInData(data, 'sales-copy', 'test-product', context)
        expect(errors[0].suggestion).toContain('userCount')
    })
})

describe('validatePlaceholders', () => {
    it('should validate product and sales copy by default', () => {
        const context = createTestContext({
            salesCopy: {
                tagline: '${stats.nonexistent}'
            }
        })
        const errors = validatePlaceholders('test-product', context)
        expect(errors.length).toBeGreaterThan(0)
    })

    it('should skip validation when disabled', () => {
        const context = createTestContext({
            salesCopy: {
                tagline: '${stats.nonexistent}'
            }
        })
        const errors = validatePlaceholders('test-product', context, {
            validateSalesCopy: false
        })
        // Should not find errors in sales copy
        const salesCopyErrors = errors.filter((e) => e.file.includes('sales-copy'))
        expect(salesCopyErrors).toHaveLength(0)
    })

    it('should handle null salesCopy', () => {
        const context = createTestContext({ salesCopy: null })
        const errors = validatePlaceholders('test-product', context)
        // Should not throw
        expect(errors).toBeDefined()
    })
})

describe('formatValidationErrors', () => {
    it('should return empty string for no errors', () => {
        const result = formatValidationErrors([], 'test-product')
        expect(result).toBe('')
    })

    it('should format single error', () => {
        const errors = [
            {
                file: 'test-product-sales-copy-default.json',
                location: 'highlights[0]',
                placeholder: '${stats.bad}',
                errorType: 'INVALID_PATH' as const,
                message: 'Path not found',
                suggestion: 'Check spelling'
            }
        ]
        const result = formatValidationErrors(errors, 'test-product')
        expect(result).toContain('test-product')
        expect(result).toContain('1 invalid placeholder')
        expect(result).toContain('highlights[0]')
        expect(result).toContain('${stats.bad}')
        expect(result).toContain('Check spelling')
    })

    it('should format multiple errors', () => {
        const errors = [
            {
                file: 'test.json',
                location: 'a',
                placeholder: '${x.y}',
                errorType: 'INVALID_PATH' as const,
                message: 'Error 1',
                suggestion: null
            },
            {
                file: 'test.json',
                location: 'b',
                placeholder: '${x.z}',
                errorType: 'INVALID_PATH' as const,
                message: 'Error 2',
                suggestion: null
            }
        ]
        const result = formatValidationErrors(errors, 'test-product')
        expect(result).toContain('2 invalid placeholder')
    })
})

describe('hasBlockingErrors', () => {
    it('should return true for INVALID_SYNTAX', () => {
        const errors = [
            {
                file: 'test.json',
                location: 'a',
                placeholder: '${bad',
                errorType: 'INVALID_SYNTAX' as const,
                message: 'Error',
                suggestion: null
            }
        ]
        expect(hasBlockingErrors(errors)).toBe(true)
    })

    it('should return true for UNKNOWN_SOURCE', () => {
        const errors = [
            {
                file: 'test.json',
                location: 'a',
                placeholder: '${x.y}',
                errorType: 'UNKNOWN_SOURCE' as const,
                message: 'Error',
                suggestion: null
            }
        ]
        expect(hasBlockingErrors(errors)).toBe(true)
    })

    it('should return false for NULL_VALUE only', () => {
        const errors = [
            {
                file: 'test.json',
                location: 'a',
                placeholder: '${x.y}',
                errorType: 'NULL_VALUE' as const,
                message: 'Error',
                suggestion: null
            }
        ]
        expect(hasBlockingErrors(errors)).toBe(false)
    })

    it('should return false for empty errors', () => {
        expect(hasBlockingErrors([])).toBe(false)
    })
})

describe('filterErrorsByType', () => {
    it('should filter by error type', () => {
        const errors = [
            {
                file: 'test.json',
                location: 'a',
                placeholder: '${x.y}',
                errorType: 'INVALID_PATH' as const,
                message: 'Error 1',
                suggestion: null
            },
            {
                file: 'test.json',
                location: 'b',
                placeholder: '${x.z}',
                errorType: 'NULL_VALUE' as const,
                message: 'Error 2',
                suggestion: null
            }
        ]

        const invalidPaths = filterErrorsByType(errors, 'INVALID_PATH')
        expect(invalidPaths).toHaveLength(1)
        expect(invalidPaths[0].location).toBe('a')

        const nullValues = filterErrorsByType(errors, 'NULL_VALUE')
        expect(nullValues).toHaveLength(1)
        expect(nullValues[0].location).toBe('b')
    })
})
