import { describe, expect, test } from 'bun:test'
import { getRedirects, findRedirect, shouldRedirect } from './redirects'

describe('getRedirects', () => {
    test('returns an array', () => {
        const redirects = getRedirects()
        expect(Array.isArray(redirects)).toBe(true)
    })

    test('returns at least one redirect (affiliates)', () => {
        const redirects = getRedirects()
        expect(redirects.length).toBeGreaterThan(0)
    })

    test('includes the affiliates redirect', () => {
        const redirects = getRedirects()
        const affiliatesRedirect = redirects.find((r) => r.from === '/affiliates')
        expect(affiliatesRedirect).toBeDefined()
        expect(affiliatesRedirect?.to).toBe('https://developassion.gumroad.com/affiliates')
    })
})

describe('findRedirect', () => {
    test('finds existing redirect', () => {
        const redirect = findRedirect('/affiliates')
        expect(redirect).not.toBeNull()
        expect(redirect?.from).toBe('/affiliates')
        expect(redirect?.to).toBe('https://developassion.gumroad.com/affiliates')
    })

    test('returns null for non-existent redirect', () => {
        const redirect = findRedirect('/does-not-exist')
        expect(redirect).toBeNull()
    })

    test('returns null for empty string', () => {
        const redirect = findRedirect('')
        expect(redirect).toBeNull()
    })

    test('is case-sensitive', () => {
        const redirect = findRedirect('/AFFILIATES')
        expect(redirect).toBeNull()
    })
})

describe('shouldRedirect', () => {
    test('returns true for existing redirect', () => {
        const result = shouldRedirect('/affiliates')
        expect(result).toBe(true)
    })

    test('returns false for non-existent redirect', () => {
        const result = shouldRedirect('/does-not-exist')
        expect(result).toBe(false)
    })

    test('returns false for empty string', () => {
        const result = shouldRedirect('')
        expect(result).toBe(false)
    })
})
