import { describe, it, expect } from 'vitest'
import { buildGumroadUrl } from './gumroad-url'

describe('buildGumroadUrl', () => {
    it('should add ?wanted=true to URL without query parameters', () => {
        const url = 'https://gumroad.com/l/product'
        const result = buildGumroadUrl(url)
        expect(result).toBe('https://gumroad.com/l/product?wanted=true')
    })

    it('should add &wanted=true to URL with existing query parameters', () => {
        const url = 'https://gumroad.com/l/product?variant=premium'
        const result = buildGumroadUrl(url)
        expect(result).toBe('https://gumroad.com/l/product?variant=premium&wanted=true')
    })

    it('should return # when URL is undefined', () => {
        const result = buildGumroadUrl(undefined)
        expect(result).toBe('#')
    })

    it('should return # when URL is empty string', () => {
        const result = buildGumroadUrl('')
        expect(result).toBe('#')
    })

    it('should handle URLs with multiple query parameters', () => {
        const url = 'https://gumroad.com/l/product?discount=SAVE20&ref=email'
        const result = buildGumroadUrl(url)
        expect(result).toBe('https://gumroad.com/l/product?discount=SAVE20&ref=email&wanted=true')
    })

    it('should handle URLs with fragment identifiers', () => {
        const url = 'https://gumroad.com/l/product#details'
        const result = buildGumroadUrl(url)
        expect(result).toBe('https://gumroad.com/l/product?wanted=true#details')
    })

    it('should handle URLs with both query parameters and fragment identifiers', () => {
        const url = 'https://gumroad.com/l/product?variant=premium#details'
        const result = buildGumroadUrl(url)
        expect(result).toBe('https://gumroad.com/l/product?variant=premium&wanted=true#details')
    })
})
