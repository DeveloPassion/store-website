import { describe, it, expect, beforeEach, spyOn } from 'bun:test'
import {
    sortProductsByPriority,
    sortProductsIntelligently,
    sortBestValueProducts,
    sortFeaturedProducts
} from './product-sort'
import type { Product } from '@/types/product'

// Mock products for testing
const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-id',
    permalink: 'test',
    name: 'Test Product',
    tagline: 'Test tagline',
    price: 100,
    priceDisplay: '$100',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'guides', // Use valid category ID from CategoryIdSchema
    secondaryCategories: [],
    tags: ['ai'], // Use valid tag ID from TagIdSchema
    problem: 'Test problem',
    problemPoints: ['Problem point 1'],
    agitate: 'Test agitate',
    agitatePoints: ['Agitate point 1'],
    solution: 'Test solution',
    solutionPoints: ['Solution point 1'],
    description: 'Test description',
    features: ['Feature 1'],
    benefits: { immediate: ['Benefit 1'] }, // Use proper benefits structure
    included: ['Item 1'],
    testimonials: [],
    faqs: [],
    targetAudience: [],
    perfectFor: [],
    notForYou: [],
    trustBadges: [],
    guarantees: [],
    crossSellIds: [],
    featured: false,
    bestseller: false,
    bestValue: false,
    priority: 50,
    ...overrides
})

describe('sortProductsByPriority', () => {
    beforeEach(() => {
        // Mock Math.random for consistent testing
        spyOn(Math, 'random').mockReturnValue(0.5)
    })

    it('should sort products by priority (highest first)', () => {
        const products = [
            createMockProduct({ id: 'low', priority: 10, name: 'Low' }),
            createMockProduct({ id: 'high', priority: 100, name: 'High' }),
            createMockProduct({ id: 'medium', priority: 50, name: 'Medium' })
        ]

        const sorted = sortProductsByPriority(products)
        expect(sorted[0]!.priority).toBe(100)
        expect(sorted[1]!.priority).toBe(50)
        expect(sorted[2]!.priority).toBe(10)
    })

    it('should handle products with no priority (defaults to 0)', () => {
        const products = [
            createMockProduct({ id: 'with-priority', priority: 50, name: 'With Priority' }),
            createMockProduct({ id: 'without-priority', priority: undefined, name: 'No Priority' })
        ]

        const sorted = sortProductsByPriority(products)
        expect(sorted[0]!.priority).toBe(50)
        expect(sorted[1]!.priority).toBeUndefined()
    })

    it('should handle empty array', () => {
        expect(sortProductsByPriority([])).toEqual([])
    })

    it('should not mutate original array', () => {
        const products = [
            createMockProduct({ id: '1', priority: 10 }),
            createMockProduct({ id: '2', priority: 20 })
        ]
        const original = [...products]

        sortProductsByPriority(products)
        expect(products).toEqual(original)
    })
})

describe('sortProductsIntelligently', () => {
    it('should sort into 5 tiers correctly', () => {
        const products = [
            createMockProduct({
                id: 'regular',
                name: 'Regular Product',
                mainCategory: 'workshops'
            }),
            createMockProduct({
                id: 'featured-only',
                name: 'Featured Only',
                featured: true,
                mainCategory: 'bundles'
            }),
            createMockProduct({
                id: 'featured-bestseller',
                name: 'Featured Bestseller',
                featured: true,
                bestseller: true,
                mainCategory: 'guides'
            }),
            createMockProduct({
                id: 'featured-value',
                name: 'Featured Value',
                featured: true,
                bestValue: true,
                mainCategory: 'journaling'
            }),
            createMockProduct({
                id: 'all-three',
                name: 'All Three',
                featured: true,
                bestValue: true,
                bestseller: true,
                mainCategory: 'tools'
            })
        ]

        const sorted = sortProductsIntelligently(products)

        // Tier 1: All three flags
        expect(sorted[0]!.id).toBe('all-three')

        // Tier 2: Featured + Value
        expect(sorted[1]!.id).toBe('featured-value')

        // Tier 3: Featured + Bestseller
        expect(sorted[2]!.id).toBe('featured-bestseller')

        // Tier 4: Featured only
        expect(sorted[3]!.id).toBe('featured-only')

        // Tier 5: Regular (alphabetically by mainCategory)
        expect(sorted[4]!.id).toBe('regular')
    })

    it('should sort tier 5 alphabetically by mainCategory', () => {
        const products = [
            createMockProduct({ id: 'zebra', mainCategory: 'workshops' }),
            createMockProduct({ id: 'alpha', mainCategory: 'ai-mastery' }),
            createMockProduct({ id: 'beta', mainCategory: 'bundles' })
        ]

        const sorted = sortProductsIntelligently(products)
        expect(sorted[0]!.id).toBe('alpha')
        expect(sorted[1]!.id).toBe('beta')
        expect(sorted[2]!.id).toBe('zebra')
    })

    it('should handle empty array', () => {
        expect(sortProductsIntelligently([])).toEqual([])
    })

    it('should not mutate original array', () => {
        const products = [createMockProduct({ id: '1' }), createMockProduct({ id: '2' })]
        const original = [...products]

        sortProductsIntelligently(products)
        expect(products).toEqual(original)
    })
})

describe('sortBestValueProducts', () => {
    it('should sort into 5 tiers correctly', () => {
        const products = [
            createMockProduct({
                id: 'regular',
                name: 'Regular Product',
                mainCategory: 'workshops'
            }),
            createMockProduct({
                id: 'value-only',
                name: 'Value Only',
                bestValue: true,
                mainCategory: 'bundles'
            }),
            createMockProduct({
                id: 'value-bestseller',
                name: 'Value Bestseller',
                bestValue: true,
                bestseller: true,
                mainCategory: 'guides'
            }),
            createMockProduct({
                id: 'featured-value',
                name: 'Featured Value',
                featured: true,
                bestValue: true,
                mainCategory: 'journaling'
            }),
            createMockProduct({
                id: 'all-three',
                name: 'All Three',
                featured: true,
                bestValue: true,
                bestseller: true,
                mainCategory: 'tools'
            })
        ]

        const sorted = sortBestValueProducts(products)

        // Tier 1: All three flags
        expect(sorted[0]!.id).toBe('all-three')

        // Tier 2: Featured + Value
        expect(sorted[1]!.id).toBe('featured-value')

        // Tier 3: Value + Bestseller
        expect(sorted[2]!.id).toBe('value-bestseller')

        // Tier 4: Value only
        expect(sorted[3]!.id).toBe('value-only')

        // Tier 5: Regular (alphabetically by mainCategory)
        expect(sorted[4]!.id).toBe('regular')
    })

    it('should handle empty array', () => {
        expect(sortBestValueProducts([])).toEqual([])
    })

    it('should not mutate original array', () => {
        const products = [createMockProduct({ id: '1' }), createMockProduct({ id: '2' })]
        const original = [...products]

        sortBestValueProducts(products)
        expect(products).toEqual(original)
    })
})

describe('sortFeaturedProducts', () => {
    it('should sort into 4 tiers correctly', () => {
        const products = [
            createMockProduct({
                id: 'featured-only',
                name: 'Featured Only',
                featured: true,
                mainCategory: 'bundles'
            }),
            createMockProduct({
                id: 'featured-bestseller',
                name: 'Featured Bestseller',
                featured: true,
                bestseller: true,
                mainCategory: 'guides'
            }),
            createMockProduct({
                id: 'featured-value',
                name: 'Featured Value',
                featured: true,
                bestValue: true,
                mainCategory: 'journaling'
            }),
            createMockProduct({
                id: 'all-three',
                name: 'All Three',
                featured: true,
                bestValue: true,
                bestseller: true,
                mainCategory: 'tools'
            })
        ]

        const sorted = sortFeaturedProducts(products)

        // Tier 1: All three flags
        expect(sorted[0]!.id).toBe('all-three')

        // Tier 2: Featured + Value
        expect(sorted[1]!.id).toBe('featured-value')

        // Tier 3: Featured + Bestseller
        expect(sorted[2]!.id).toBe('featured-bestseller')

        // Tier 4: Featured only
        expect(sorted[3]!.id).toBe('featured-only')
    })

    it('should ignore non-featured products', () => {
        const products = [
            createMockProduct({ id: 'featured', featured: true }),
            createMockProduct({ id: 'not-featured', featured: false })
        ]

        const sorted = sortFeaturedProducts(products)
        expect(sorted).toHaveLength(1)
        expect(sorted[0]!.id).toBe('featured')
    })

    it('should handle empty array', () => {
        expect(sortFeaturedProducts([])).toEqual([])
    })

    it('should not mutate original array', () => {
        const products = [
            createMockProduct({ id: '1', featured: true }),
            createMockProduct({ id: '2', featured: true })
        ]
        const original = [...products]

        sortFeaturedProducts(products)
        expect(products).toEqual(original)
    })
})
