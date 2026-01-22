import { describe, it, expect } from 'bun:test'
import {
    findPlaceholders,
    hasPlaceholders,
    parsePlaceholder,
    findUniquePlaceholders,
    parseAllPlaceholders
} from './parser.js'

describe('findPlaceholders', () => {
    it('should find a single placeholder', () => {
        const result = findPlaceholders('Hello ${stats.userCount} users!')
        expect(result).toEqual(['${stats.userCount}'])
    })

    it('should find multiple placeholders', () => {
        const result = findPlaceholders('${product.price|currency} - ${stats.timeSaved}')
        expect(result).toEqual(['${product.price|currency}', '${stats.timeSaved}'])
    })

    it('should return empty array when no placeholders exist', () => {
        const result = findPlaceholders('Just regular text')
        expect(result).toEqual([])
    })

    it('should find placeholders with formatters', () => {
        const result = findPlaceholders('Price: ${product.price|currency|prefix:From }')
        expect(result).toEqual(['${product.price|currency|prefix:From }'])
    })

    it('should find placeholders with nested paths', () => {
        const result = findPlaceholders('${product.variants.0.price}')
        expect(result).toEqual(['${product.variants.0.price}'])
    })

    it('should not match malformed placeholders', () => {
        const result = findPlaceholders('${} ${ } ${invalid}')
        expect(result).toEqual([])
    })

    it('should find computed placeholders', () => {
        const result = findPlaceholders('${computed.ratingsCount} reviews')
        expect(result).toEqual(['${computed.ratingsCount}'])
    })

    it('should find salesCopy placeholders', () => {
        const result = findPlaceholders('See ${salesCopy.tagline}')
        expect(result).toEqual(['${salesCopy.tagline}'])
    })
})

describe('hasPlaceholders', () => {
    it('should return true when placeholders exist', () => {
        expect(hasPlaceholders('Hello ${stats.userCount}')).toBe(true)
    })

    it('should return false when no placeholders exist', () => {
        expect(hasPlaceholders('Just regular text')).toBe(false)
    })

    it('should return false for malformed expressions', () => {
        expect(hasPlaceholders('${}  ${invalid}')).toBe(false)
    })
})

describe('parsePlaceholder', () => {
    it('should parse a simple placeholder', () => {
        const result = parsePlaceholder('${stats.userCount}')
        expect(result).toEqual({
            raw: '${stats.userCount}',
            source: 'stats',
            path: 'userCount',
            formatters: []
        })
    })

    it('should parse placeholder with single formatter', () => {
        const result = parsePlaceholder('${product.price|currency}')
        expect(result).toEqual({
            raw: '${product.price|currency}',
            source: 'product',
            path: 'price',
            formatters: [{ name: 'currency', arg: null }]
        })
    })

    it('should parse placeholder with formatter and argument', () => {
        const result = parsePlaceholder('${computed.averageRating|round:1}')
        expect(result).toEqual({
            raw: '${computed.averageRating|round:1}',
            source: 'computed',
            path: 'averageRating',
            formatters: [{ name: 'round', arg: '1' }]
        })
    })

    it('should parse placeholder with multiple formatters', () => {
        const result = parsePlaceholder('${product.price|currency|prefix:From }')
        expect(result).toEqual({
            raw: '${product.price|currency|prefix:From }',
            source: 'product',
            path: 'price',
            formatters: [
                { name: 'currency', arg: null },
                { name: 'prefix', arg: 'From ' }
            ]
        })
    })

    it('should parse placeholder with nested path', () => {
        const result = parsePlaceholder('${product.variants.0.price}')
        expect(result).toEqual({
            raw: '${product.variants.0.price}',
            source: 'product',
            path: 'variants.0.price',
            formatters: []
        })
    })

    it('should parse placeholder with default formatter', () => {
        const result = parsePlaceholder('${stats.timeSaved|default:N/A}')
        expect(result).toEqual({
            raw: '${stats.timeSaved|default:N/A}',
            source: 'stats',
            path: 'timeSaved',
            formatters: [{ name: 'default', arg: 'N/A' }]
        })
    })

    it('should parse suffix formatter', () => {
        const result = parsePlaceholder('${stats.userCount|suffix: users}')
        expect(result).toEqual({
            raw: '${stats.userCount|suffix: users}',
            source: 'stats',
            path: 'userCount',
            formatters: [{ name: 'suffix', arg: ' users' }]
        })
    })

    it('should return null for invalid source', () => {
        const result = parsePlaceholder('${invalid.path}')
        expect(result).toBeNull()
    })

    it('should return null for unknown formatter', () => {
        const result = parsePlaceholder('${product.price|unknown}')
        expect(result).toBeNull()
    })

    it('should return null for missing path', () => {
        const result = parsePlaceholder('${stats.}')
        expect(result).toBeNull()
    })

    it('should return null for missing source', () => {
        const result = parsePlaceholder('${.path}')
        expect(result).toBeNull()
    })

    it('should return null for non-placeholder strings', () => {
        expect(parsePlaceholder('just text')).toBeNull()
        expect(parsePlaceholder('${}')).toBeNull()
        expect(parsePlaceholder('${')).toBeNull()
        expect(parsePlaceholder('}')).toBeNull()
    })

    it('should parse all valid sources', () => {
        expect(parsePlaceholder('${stats.value}')?.source).toBe('stats')
        expect(parsePlaceholder('${product.value}')?.source).toBe('product')
        expect(parsePlaceholder('${salesCopy.value}')?.source).toBe('salesCopy')
        expect(parsePlaceholder('${computed.value}')?.source).toBe('computed')
    })

    it('should parse all valid formatters', () => {
        expect(parsePlaceholder('${stats.v|currency}')?.formatters[0].name).toBe('currency')
        expect(parsePlaceholder('${stats.v|number}')?.formatters[0].name).toBe('number')
        expect(parsePlaceholder('${stats.v|round:1}')?.formatters[0].name).toBe('round')
        expect(parsePlaceholder('${stats.v|suffix:x}')?.formatters[0].name).toBe('suffix')
        expect(parsePlaceholder('${stats.v|prefix:x}')?.formatters[0].name).toBe('prefix')
        expect(parsePlaceholder('${stats.v|default:x}')?.formatters[0].name).toBe('default')
    })
})

describe('findUniquePlaceholders', () => {
    it('should return unique placeholders', () => {
        const result = findUniquePlaceholders(
            '${stats.userCount} ${stats.userCount} ${product.price}'
        )
        expect(result.size).toBe(2)
        expect(result.has('${stats.userCount}')).toBe(true)
        expect(result.has('${product.price}')).toBe(true)
    })

    it('should return empty set for no placeholders', () => {
        const result = findUniquePlaceholders('no placeholders here')
        expect(result.size).toBe(0)
    })
})

describe('parseAllPlaceholders', () => {
    it('should parse all valid placeholders', () => {
        const result = parseAllPlaceholders('${stats.userCount} and ${product.price|currency}')
        expect(result.parsed).toHaveLength(2)
        expect(result.failed).toHaveLength(0)
    })

    it('should track failed placeholders', () => {
        const result = parseAllPlaceholders('${stats.userCount} and ${invalid.source}')
        expect(result.parsed).toHaveLength(1)
        // invalid.source matches the regex pattern but fails source validation
        expect(result.failed).toHaveLength(1)
        expect(result.failed[0]).toBe('${invalid.source}')
    })

    it('should handle text with no placeholders', () => {
        const result = parseAllPlaceholders('just regular text')
        expect(result.parsed).toHaveLength(0)
        expect(result.failed).toHaveLength(0)
    })
})
