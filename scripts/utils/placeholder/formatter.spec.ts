import { describe, it, expect } from 'bun:test'
import {
    applyFormatter,
    applyFormatters,
    hasDefaultFormatter,
    getDefaultValue
} from './formatter.js'
import type {
    PlaceholderContext,
    ParsedFormatter
} from '../../../src/schemas/placeholder.schema.js'

// Helper to create a test context
function createTestContext(currency: string = 'EUR'): PlaceholderContext {
    return {
        product: { currency },
        stats: null,
        salesCopy: null,
        computed: {
            ratingsCount: null,
            averageRating: null,
            testimonialsCount: 0,
            includedIn: []
        }
    }
}

describe('applyFormatter', () => {
    describe('currency formatter', () => {
        it('should format numbers with EUR symbol by default', () => {
            const context = createTestContext()
            expect(applyFormatter(149.99, 'currency', null, context)).toBe('€149.99')
        })

        it('should format with USD symbol', () => {
            const context = createTestContext('USD')
            expect(applyFormatter(149.99, 'currency', null, context)).toBe('$149.99')
        })

        it('should format with GBP symbol', () => {
            const context = createTestContext('GBP')
            expect(applyFormatter(149.99, 'currency', null, context)).toBe('£149.99')
        })

        it('should format integer prices', () => {
            const context = createTestContext()
            expect(applyFormatter(100, 'currency', null, context)).toBe('€100.00')
        })

        it('should parse numeric strings', () => {
            const context = createTestContext()
            expect(applyFormatter('149.99', 'currency', null, context)).toBe('€149.99')
        })

        it('should handle non-numeric strings', () => {
            const context = createTestContext()
            expect(applyFormatter('Free', 'currency', null, context)).toBe('€Free')
        })

        it('should return null for null value', () => {
            const context = createTestContext()
            expect(applyFormatter(null, 'currency', null, context)).toBeNull()
        })
    })

    describe('number formatter', () => {
        it('should format numbers with thousands separator', () => {
            const context = createTestContext()
            expect(applyFormatter(1234, 'number', null, context)).toBe('1,234')
            expect(applyFormatter(1234567, 'number', null, context)).toBe('1,234,567')
        })

        it('should handle decimal numbers', () => {
            const context = createTestContext()
            expect(applyFormatter(1234.56, 'number', null, context)).toBe('1,234.56')
        })

        it('should parse numeric strings', () => {
            const context = createTestContext()
            expect(applyFormatter('1234', 'number', null, context)).toBe('1,234')
        })

        it('should return non-numeric strings as-is', () => {
            const context = createTestContext()
            expect(applyFormatter('N/A', 'number', null, context)).toBe('N/A')
        })
    })

    describe('round formatter', () => {
        it('should round to specified decimal places', () => {
            const context = createTestContext()
            expect(applyFormatter(4.837, 'round', '1', context)).toBe('4.8')
            expect(applyFormatter(4.837, 'round', '2', context)).toBe('4.84')
            expect(applyFormatter(4.837, 'round', '0', context)).toBe('5')
        })

        it('should default to 0 decimal places', () => {
            const context = createTestContext()
            expect(applyFormatter(4.5, 'round', null, context)).toBe('5')
        })

        it('should handle string numbers', () => {
            const context = createTestContext()
            expect(applyFormatter('4.837', 'round', '1', context)).toBe('4.8')
        })

        it('should return non-numeric strings as-is', () => {
            const context = createTestContext()
            expect(applyFormatter('N/A', 'round', '1', context)).toBe('N/A')
        })
    })

    describe('suffix formatter', () => {
        it('should append suffix to value', () => {
            const context = createTestContext()
            expect(applyFormatter('1,000+', 'suffix', ' users', context)).toBe('1,000+ users')
        })

        it('should handle empty suffix', () => {
            const context = createTestContext()
            expect(applyFormatter('value', 'suffix', '', context)).toBe('value')
        })

        it('should convert numbers to string', () => {
            const context = createTestContext()
            expect(applyFormatter(42, 'suffix', ' items', context)).toBe('42 items')
        })
    })

    describe('prefix formatter', () => {
        it('should prepend prefix to value', () => {
            const context = createTestContext()
            expect(applyFormatter('€149.99', 'prefix', 'Only ', context)).toBe('Only €149.99')
        })

        it('should handle empty prefix', () => {
            const context = createTestContext()
            expect(applyFormatter('value', 'prefix', '', context)).toBe('value')
        })

        it('should convert numbers to string', () => {
            const context = createTestContext()
            expect(applyFormatter(42, 'prefix', '#', context)).toBe('#42')
        })
    })

    describe('default formatter', () => {
        it('should return default value for null', () => {
            const context = createTestContext()
            expect(applyFormatter(null, 'default', 'N/A', context)).toBe('N/A')
        })

        it('should return default value for undefined', () => {
            const context = createTestContext()
            expect(applyFormatter(undefined, 'default', 'N/A', context)).toBe('N/A')
        })

        it('should return original value if not null', () => {
            const context = createTestContext()
            expect(applyFormatter('actual value', 'default', 'N/A', context)).toBe('actual value')
        })

        it('should return empty string if no default arg provided for null', () => {
            const context = createTestContext()
            expect(applyFormatter(null, 'default', null, context)).toBe('')
        })
    })
})

describe('applyFormatters', () => {
    it('should apply single formatter', () => {
        const context = createTestContext()
        const formatters: ParsedFormatter[] = [{ name: 'currency', arg: null }]
        expect(applyFormatters(149.99, formatters, context)).toBe('€149.99')
    })

    it('should chain multiple formatters', () => {
        const context = createTestContext()
        const formatters: ParsedFormatter[] = [
            { name: 'currency', arg: null },
            { name: 'prefix', arg: 'Only ' }
        ]
        expect(applyFormatters(149.99, formatters, context)).toBe('Only €149.99')
    })

    it('should handle round then number', () => {
        const context = createTestContext()
        const formatters: ParsedFormatter[] = [
            { name: 'round', arg: '0' },
            { name: 'number', arg: null }
        ]
        expect(applyFormatters(1234.567, formatters, context)).toBe('1,235')
    })

    it('should return null for null value without default', () => {
        const context = createTestContext()
        const formatters: ParsedFormatter[] = [{ name: 'currency', arg: null }]
        expect(applyFormatters(null, formatters, context)).toBeNull()
    })

    it('should use default formatter for null value', () => {
        const context = createTestContext()
        const formatters: ParsedFormatter[] = [
            { name: 'currency', arg: null },
            { name: 'default', arg: 'N/A' }
        ]
        expect(applyFormatters(null, formatters, context)).toBe('N/A')
    })

    it('should apply formatters to non-null value even with default', () => {
        const context = createTestContext()
        const formatters: ParsedFormatter[] = [
            { name: 'currency', arg: null },
            { name: 'default', arg: 'N/A' }
        ]
        expect(applyFormatters(149.99, formatters, context)).toBe('€149.99')
    })

    it('should return value as string with no formatters', () => {
        const context = createTestContext()
        expect(applyFormatters('value', [], context)).toBe('value')
        expect(applyFormatters(42, [], context)).toBe('42')
    })

    it('should chain suffix and prefix', () => {
        const context = createTestContext()
        const formatters: ParsedFormatter[] = [
            { name: 'suffix', arg: ' users' },
            { name: 'prefix', arg: 'Join ' }
        ]
        expect(applyFormatters('1,000+', formatters, context)).toBe('Join 1,000+ users')
    })
})

describe('hasDefaultFormatter', () => {
    it('should return true when default formatter exists', () => {
        const formatters: ParsedFormatter[] = [
            { name: 'currency', arg: null },
            { name: 'default', arg: 'N/A' }
        ]
        expect(hasDefaultFormatter(formatters)).toBe(true)
    })

    it('should return false when no default formatter', () => {
        const formatters: ParsedFormatter[] = [{ name: 'currency', arg: null }]
        expect(hasDefaultFormatter(formatters)).toBe(false)
    })

    it('should return false for empty formatters', () => {
        expect(hasDefaultFormatter([])).toBe(false)
    })
})

describe('getDefaultValue', () => {
    it('should return default value when present', () => {
        const formatters: ParsedFormatter[] = [
            { name: 'currency', arg: null },
            { name: 'default', arg: 'N/A' }
        ]
        expect(getDefaultValue(formatters)).toBe('N/A')
    })

    it('should return undefined when no default formatter', () => {
        const formatters: ParsedFormatter[] = [{ name: 'currency', arg: null }]
        expect(getDefaultValue(formatters)).toBeUndefined()
    })

    it('should return undefined for empty formatters', () => {
        expect(getDefaultValue([])).toBeUndefined()
    })
})
