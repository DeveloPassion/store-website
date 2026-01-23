import { describe, expect, it } from 'bun:test'
import {
    createEmptyFilters,
    mergeFilters,
    matchProducts,
    applyResultOverrides
} from './quiz-scoring'
import type { Product } from '@/schemas/product.schema'
import type { QuizFilters, QuizResultOverride } from '@/schemas/quiz.schema'

// Create a minimal mock product for testing
function createMockProduct(overrides: Partial<Product>): Product {
    return {
        id: 'test-product',
        name: 'Test Product',
        gumroadId: null,
        isGumroadProduct: true,
        gumroadProductSlugs: null,
        price: 29,
        priceDisplay: '€29',
        priceTier: 'budget',
        gumroadUrl: 'https://gumroad.com/test',
        variants: null,
        isSubscription: false,
        paymentFrequencies: null,
        defaultPaymentFrequency: null,
        mainCategory: 'knowledge-management',
        secondaryCategories: [],
        tags: ['knowledge-management'],
        contents: ['Test content'],
        landingPageUrl: null,
        dsebastienUrl: null,
        featured: false,
        bestValue: false,
        bestseller: false,
        priority: 50,
        crossSellIds: [],
        targetExperienceLevel: 'all-levels',
        deliveryStyle: 'hybrid',
        includedProducts: [],
        activeSalesCopyId: 'default',
        faqs: [],
        testimonials: [],
        media: [],
        stats: null,
        salesCopy: {
            problem: 'Test problem',
            problemPoints: ['Point 1'],
            agitate: 'Test agitate',
            agitatePoints: ['Point 1'],
            solution: 'Test solution',
            solutionPoints: ['Point 1'],
            tagline: 'Test tagline',
            secondaryTagline: null,
            description: 'Test description',
            highlights: ['Highlight 1'],
            benefits: [{ icon: '✓', title: 'Benefit', description: 'Desc' }],
            targetAudience: 'Test audience',
            perfectFor: ['Person 1'],
            notForYou: ['Person 2'],
            trustBadges: ['Badge 1'],
            guarantees: ['Guarantee 1'],
            metaTitle: 'Test Meta Title',
            metaDescription: 'Test meta description',
            keywords: ['keyword'],
            storytelling: null,
            timeline: null,
            courseContent: null,
            howItWorks: null,
            mediaSections: null
        },
        ratingsCount: null,
        averageRating: null,
        testimonialsCount: 0,
        includedIn: [],
        ...overrides
    } as Product
}

describe('createEmptyFilters', () => {
    it('should create filters with empty arrays and null values', () => {
        const filters = createEmptyFilters()
        expect(filters.categories).toEqual([])
        expect(filters.experienceLevel).toBeNull()
        expect(filters.priceTiers).toEqual([])
        expect(filters.deliveryStyle).toBeNull()
    })
})

describe('mergeFilters', () => {
    it('should merge categories as union', () => {
        const base: QuizFilters = {
            categories: ['obsidian'],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }
        const option = { categories: ['ai-mastery', 'obsidian'] }

        const result = mergeFilters(base, option)
        expect(result.categories).toEqual(['obsidian', 'ai-mastery'])
    })

    it('should use last non-null experience level', () => {
        const base: QuizFilters = {
            categories: [],
            experienceLevel: 'beginner',
            priceTiers: [],
            deliveryStyle: null
        }
        const option = { experienceLevel: 'advanced' as const }

        const result = mergeFilters(base, option)
        expect(result.experienceLevel).toBe('advanced')
    })

    it('should merge price tiers as union', () => {
        const base: QuizFilters = {
            categories: [],
            experienceLevel: null,
            priceTiers: ['free'],
            deliveryStyle: null
        }
        const option = { priceTiers: ['budget' as const, 'free' as const] }

        const result = mergeFilters(base, option)
        expect(result.priceTiers).toEqual(['free', 'budget'])
    })

    it('should use last non-null delivery style', () => {
        const base: QuizFilters = {
            categories: [],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: 'hands-on'
        }
        const option = { deliveryStyle: 'conceptual' as const }

        const result = mergeFilters(base, option)
        expect(result.deliveryStyle).toBe('conceptual')
    })

    it('should not overwrite with undefined values', () => {
        const base: QuizFilters = {
            categories: ['obsidian'],
            experienceLevel: 'beginner',
            priceTiers: ['free'],
            deliveryStyle: 'hands-on'
        }
        const option = {} // All undefined

        const result = mergeFilters(base, option)
        expect(result).toEqual(base)
    })
})

describe('matchProducts', () => {
    const products = [
        createMockProduct({
            id: 'obsidian-kit',
            mainCategory: 'obsidian',
            priceTier: 'premium',
            featured: true,
            priority: 100
        }),
        createMockProduct({
            id: 'ai-course',
            mainCategory: 'ai-mastery',
            priceTier: 'standard',
            priority: 80
        }),
        createMockProduct({
            id: 'pkm-guide',
            mainCategory: 'knowledge-management',
            secondaryCategories: [{ id: 'obsidian', distant: false }],
            priceTier: 'budget',
            priority: 60
        }),
        createMockProduct({
            id: 'free-checklist',
            mainCategory: 'knowledge-management',
            priceTier: 'free',
            targetExperienceLevel: 'beginner',
            priority: 40
        })
    ]

    it('should return all products when no filters specified', () => {
        const filters: QuizFilters = {
            categories: [],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }

        const result = matchProducts(products, filters)
        expect(result.length).toBe(4)
    })

    it('should filter by mainCategory', () => {
        const filters: QuizFilters = {
            categories: ['obsidian'],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }

        const result = matchProducts(products, filters)
        expect(result).toContain('obsidian-kit')
        expect(result).toContain('pkm-guide') // Has obsidian as secondary
        expect(result).not.toContain('ai-course')
    })

    it('should filter by price tier', () => {
        const filters: QuizFilters = {
            categories: [],
            experienceLevel: null,
            priceTiers: ['free', 'budget'],
            deliveryStyle: null
        }

        const result = matchProducts(products, filters)
        expect(result).toContain('free-checklist')
        expect(result).toContain('pkm-guide')
        expect(result).not.toContain('obsidian-kit')
        expect(result).not.toContain('ai-course')
    })

    it('should filter by experience level', () => {
        const filters: QuizFilters = {
            categories: [],
            experienceLevel: 'beginner',
            priceTiers: [],
            deliveryStyle: null
        }

        const result = matchProducts(products, filters)
        // Products without targetExperienceLevel match all levels
        // free-checklist has beginner, should match
        expect(result).toContain('free-checklist')
        // Others have no level, so they match too
        expect(result.length).toBe(4)
    })

    it('should sort by mainCategory match first, then featured, then priority', () => {
        const filters: QuizFilters = {
            categories: ['obsidian'],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }

        const result = matchProducts(products, filters)
        // obsidian-kit is main match and featured
        expect(result[0]).toBe('obsidian-kit')
        // pkm-guide is secondary match
        expect(result[1]).toBe('pkm-guide')
    })

    it('should exclude specified product IDs', () => {
        const filters: QuizFilters = {
            categories: [],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }

        const result = matchProducts(products, filters, ['obsidian-kit', 'ai-course'])
        expect(result).not.toContain('obsidian-kit')
        expect(result).not.toContain('ai-course')
        expect(result.length).toBe(2)
    })
})

describe('applyResultOverrides', () => {
    const mockProducts = [
        createMockProduct({ id: 'product-a' }),
        createMockProduct({ id: 'product-b' }),
        createMockProduct({ id: 'product-c' }),
        createMockProduct({ id: 'product-d' }),
        createMockProduct({ id: 'product-e' })
    ]

    it('should return unchanged recommendations when no conditions are met', () => {
        const recommendations = ['product-a', 'product-b', 'product-c']
        const filters: QuizFilters = {
            categories: ['ai-mastery'],
            experienceLevel: 'beginner',
            priceTiers: [],
            deliveryStyle: null
        }
        const overrides: QuizResultOverride[] = [
            {
                conditions: { hasCategories: ['obsidian'] }, // Not met
                addProducts: ['product-d'],
                removeProducts: [],
                setProducts: null,
                priority: 0
            }
        ]

        const result = applyResultOverrides(recommendations, filters, overrides, mockProducts)
        expect(result).toEqual(['product-a', 'product-b', 'product-c'])
    })

    it('should add products when category conditions are met', () => {
        const recommendations = ['product-a', 'product-b', 'product-c']
        const filters: QuizFilters = {
            categories: ['obsidian'],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }
        const overrides: QuizResultOverride[] = [
            {
                conditions: { hasCategories: ['obsidian'] },
                addProducts: ['product-d'],
                removeProducts: [],
                setProducts: null,
                priority: 0
            }
        ]

        const result = applyResultOverrides(recommendations, filters, overrides, mockProducts)
        expect(result).toEqual(['product-d', 'product-a', 'product-b', 'product-c'])
    })

    it('should check experience level condition', () => {
        const recommendations = ['product-a', 'product-b']
        const filters: QuizFilters = {
            categories: [],
            experienceLevel: 'beginner',
            priceTiers: [],
            deliveryStyle: null
        }
        const overrides: QuizResultOverride[] = [
            {
                conditions: { experienceLevel: 'beginner' },
                addProducts: ['product-c'],
                removeProducts: [],
                setProducts: null,
                priority: 0
            }
        ]

        const result = applyResultOverrides(recommendations, filters, overrides, mockProducts)
        expect(result).toEqual(['product-c', 'product-a', 'product-b'])
    })

    it('should remove products when conditions are met', () => {
        const recommendations = ['product-a', 'product-b', 'product-c']
        const filters: QuizFilters = {
            categories: [],
            experienceLevel: 'advanced',
            priceTiers: [],
            deliveryStyle: null
        }
        const overrides: QuizResultOverride[] = [
            {
                conditions: { experienceLevel: 'advanced' },
                addProducts: [],
                removeProducts: ['product-a'],
                setProducts: null,
                priority: 0
            }
        ]

        const result = applyResultOverrides(recommendations, filters, overrides, mockProducts)
        expect(result).toEqual(['product-b', 'product-c'])
    })

    it('should replace recommendations with setProducts when conditions are met', () => {
        const recommendations = ['product-a', 'product-b', 'product-c']
        const filters: QuizFilters = {
            categories: ['community'],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }
        const overrides: QuizResultOverride[] = [
            {
                conditions: { hasCategories: ['community'] },
                addProducts: [],
                removeProducts: [],
                setProducts: ['product-d', 'product-e'],
                priority: 0
            }
        ]

        const result = applyResultOverrides(recommendations, filters, overrides, mockProducts)
        expect(result).toEqual(['product-d', 'product-e'])
    })

    it('should apply multiple matching overrides in priority order', () => {
        const recommendations = ['product-a', 'product-b', 'product-c']
        const filters: QuizFilters = {
            categories: ['obsidian', 'ai-mastery'],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }
        const overrides: QuizResultOverride[] = [
            {
                conditions: { hasCategories: ['obsidian'] },
                addProducts: ['product-d'],
                removeProducts: [],
                setProducts: null,
                priority: 5
            },
            {
                conditions: { hasCategories: ['ai-mastery'] },
                addProducts: ['product-e'],
                removeProducts: [],
                setProducts: null,
                priority: 10 // Higher priority, applied later
            }
        ]

        const result = applyResultOverrides(recommendations, filters, overrides, mockProducts)
        // First override adds product-d, then second override adds product-e
        expect(result).toEqual(['product-e', 'product-d', 'product-a', 'product-b', 'product-c'])
    })

    it('should not add duplicate products', () => {
        const recommendations = ['product-a', 'product-b', 'product-c']
        const filters: QuizFilters = {
            categories: ['obsidian'],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }
        const overrides: QuizResultOverride[] = [
            {
                conditions: { hasCategories: ['obsidian'] },
                addProducts: ['product-a'], // Already in recommendations
                removeProducts: [],
                setProducts: null,
                priority: 0
            }
        ]

        const result = applyResultOverrides(recommendations, filters, overrides, mockProducts)
        expect(result).toEqual(['product-a', 'product-b', 'product-c'])
    })

    it('should filter out invalid product IDs', () => {
        const recommendations = ['product-a', 'product-b']
        const filters: QuizFilters = {
            categories: ['obsidian'],
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }
        const overrides: QuizResultOverride[] = [
            {
                conditions: { hasCategories: ['obsidian'] },
                addProducts: ['nonexistent-product'],
                removeProducts: [],
                setProducts: null,
                priority: 0
            }
        ]

        const result = applyResultOverrides(recommendations, filters, overrides, mockProducts)
        expect(result).toEqual(['product-a', 'product-b'])
    })

    it('should require ALL hasCategories to be present', () => {
        const recommendations = ['product-a', 'product-b', 'product-c']
        const filters: QuizFilters = {
            categories: ['obsidian'], // Only obsidian, not ai-mastery
            experienceLevel: null,
            priceTiers: [],
            deliveryStyle: null
        }
        const overrides: QuizResultOverride[] = [
            {
                conditions: { hasCategories: ['obsidian', 'ai-mastery'] }, // Both required
                addProducts: ['product-d'],
                removeProducts: [],
                setProducts: null,
                priority: 0
            }
        ]

        const result = applyResultOverrides(recommendations, filters, overrides, mockProducts)
        expect(result).toEqual(['product-a', 'product-b', 'product-c'])
    })
})
