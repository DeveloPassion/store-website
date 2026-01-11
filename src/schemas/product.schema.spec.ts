import { describe, it, expect } from 'bun:test'
import {
    ProductSchema,
    PriceTierSchema,
    PaymentFrequencySchema,
    SecondaryCategorySchema,
    ProductVariantSchema,
    ProductBenefitsSchema,
    StatsProofSchema
} from './product.schema'
import type { TagId } from '@/types/tag'

describe('Product Schema Validation', () => {
    const validProduct = {
        id: 'test-product',
        permalink: 'test-product',
        name: 'Test Product',
        tagline: 'Test tagline',
        price: 99.99,
        priceDisplay: '€99.99',
        priceTier: 'standard' as const,
        gumroadUrl: 'https://gumroad.com/test',
        mainCategory: 'guides' as const,
        secondaryCategories: [],
        tags: ['ai' as TagId],
        problem: 'Test problem',
        problemPoints: ['Point 1', 'Point 2'],
        agitate: 'Test agitate',
        agitatePoints: ['Agitate 1', 'Agitate 2'],
        solution: 'Test solution',
        solutionPoints: ['Solution 1', 'Solution 2'],
        description: 'Test description',
        features: ['Feature 1', 'Feature 2'],
        benefits: {},
        included: ['Item 1', 'Item 2'],
        testimonialIds: [],
        faqIds: [],
        targetAudience: [],
        perfectFor: [],
        notForYou: [],
        featured: false,
        bestseller: false,
        bestValue: false,
        priority: 50,
        trustBadges: [],
        guarantees: [],
        crossSellIds: []
    }

    describe('PriceTierSchema', () => {
        it('should accept valid price tiers', () => {
            const validTiers = [
                'free',
                'budget',
                'standard',
                'premium',
                'enterprise',
                'subscription'
            ]
            validTiers.forEach((tier) => {
                expect(() => PriceTierSchema.parse(tier)).not.toThrow()
            })
        })

        it('should reject invalid price tiers', () => {
            expect(() => PriceTierSchema.parse('invalid')).toThrow()
            expect(() => PriceTierSchema.parse('')).toThrow()
            expect(() => PriceTierSchema.parse(123)).toThrow()
        })
    })

    describe('PaymentFrequencySchema', () => {
        it('should accept valid payment frequencies', () => {
            const validFrequencies = ['monthly', 'yearly', 'biennial', 'one-time']
            validFrequencies.forEach((frequency) => {
                expect(() => PaymentFrequencySchema.parse(frequency)).not.toThrow()
            })
        })

        it('should reject invalid payment frequencies', () => {
            expect(() => PaymentFrequencySchema.parse('invalid')).toThrow()
            expect(() => PaymentFrequencySchema.parse('weekly')).toThrow()
            expect(() => PaymentFrequencySchema.parse('')).toThrow()
            expect(() => PaymentFrequencySchema.parse(123)).toThrow()
        })
    })

    describe('SecondaryCategorySchema', () => {
        it('should accept valid secondary category', () => {
            const valid = { id: 'obsidian', distant: false }
            expect(() => SecondaryCategorySchema.parse(valid)).not.toThrow()
        })

        it('should accept secondary category without distant flag', () => {
            const valid = { id: 'obsidian' }
            expect(() => SecondaryCategorySchema.parse(valid)).not.toThrow()
        })

        it('should reject invalid category id', () => {
            const invalid = { id: 'invalid-category-id', distant: false }
            expect(() => SecondaryCategorySchema.parse(invalid)).toThrow()
        })
    })

    describe('ProductVariantSchema', () => {
        it('should accept valid variant', () => {
            const valid = {
                name: 'Pro Version',
                price: 199.99,
                priceDisplay: '€199.99',
                description: 'Pro features included',
                gumroadUrl: 'https://gumroad.com/pro'
            }
            expect(() => ProductVariantSchema.parse(valid)).not.toThrow()
        })

        it('should accept variant with gumroadVariantId', () => {
            const valid = {
                name: 'Pro Version',
                price: 199.99,
                priceDisplay: '€199.99',
                description: 'Pro features included',
                gumroadUrl: 'https://gumroad.com/pro',
                gumroadVariantId: 'pro-version'
            }
            expect(() => ProductVariantSchema.parse(valid)).not.toThrow()
        })

        it('should accept variant with paymentFrequency', () => {
            const valid = {
                name: 'Monthly Subscription',
                price: 9.99,
                priceDisplay: '€9.99/month',
                description: 'Monthly subscription',
                gumroadUrl: 'https://gumroad.com/monthly',
                paymentFrequency: 'monthly'
            }
            expect(() => ProductVariantSchema.parse(valid)).not.toThrow()
        })

        it('should accept variant with all new fields', () => {
            const valid = {
                name: 'Yearly Subscription',
                price: 99.99,
                priceDisplay: '€99.99/year',
                description: 'Yearly subscription',
                gumroadUrl: 'https://gumroad.com/yearly',
                gumroadVariantId: 'yearly-plan',
                paymentFrequency: 'yearly'
            }
            expect(() => ProductVariantSchema.parse(valid)).not.toThrow()
        })

        it('should reject variant with invalid URL', () => {
            const invalid = {
                name: 'Pro Version',
                price: 199.99,
                priceDisplay: '€199.99',
                description: 'Pro features',
                gumroadUrl: 'not-a-url'
            }
            expect(() => ProductVariantSchema.parse(invalid)).toThrow()
        })

        it('should reject variant with invalid paymentFrequency', () => {
            const invalid = {
                name: 'Pro Version',
                price: 199.99,
                priceDisplay: '€199.99',
                description: 'Pro features',
                gumroadUrl: 'https://gumroad.com/pro',
                paymentFrequency: 'weekly'
            }
            expect(() => ProductVariantSchema.parse(invalid)).toThrow()
        })
    })

    describe('ProductBenefitsSchema', () => {
        it('should accept valid benefits structure', () => {
            const valid = {
                immediate: ['Quick win 1'],
                systematic: ['Process improvement'],
                longTerm: ['Long-term value']
            }
            expect(() => ProductBenefitsSchema.parse(valid)).not.toThrow()
        })

        it('should accept partial benefits', () => {
            const valid = {
                immediate: ['Quick win 1']
            }
            expect(() => ProductBenefitsSchema.parse(valid)).not.toThrow()
        })

        it('should accept empty benefits object', () => {
            expect(() => ProductBenefitsSchema.parse({})).not.toThrow()
        })
    })

    describe('StatsProofSchema', () => {
        it('should accept valid stats', () => {
            const valid = {
                userCount: '10,000+',
                timeSaved: '20 hours/month',
                rating: '4.9/5'
            }
            expect(() => StatsProofSchema.parse(valid)).not.toThrow()
        })

        it('should accept partial stats', () => {
            const valid = { userCount: '5,000+' }
            expect(() => StatsProofSchema.parse(valid)).not.toThrow()
        })
    })

    describe('ProductSchema - Required Fields', () => {
        it('should accept valid complete product', () => {
            const result = ProductSchema.safeParse(validProduct)
            expect(result.success).toBe(true)
        })

        it('should reject product without id', () => {
            const invalid = { ...validProduct, id: '' }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product without name', () => {
            const invalid = { ...validProduct, name: '' }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product with negative price', () => {
            const invalid = { ...validProduct, price: -10 }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product with invalid gumroadUrl', () => {
            const invalid = { ...validProduct, gumroadUrl: 'not-a-url' }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product without tags', () => {
            const invalid = { ...validProduct, tags: [] }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product without problem points', () => {
            const invalid = { ...validProduct, problemPoints: [] }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product without features', () => {
            const invalid = { ...validProduct, features: [] }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product without included items', () => {
            const invalid = { ...validProduct, included: [] }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('ProductSchema - Optional Fields', () => {
        it('should accept product without optional fields', () => {
            const minimal = {
                ...validProduct,
                secondaryTagline: undefined,
                variants: undefined,
                statsProof: undefined,
                coverImage: undefined,
                screenshots: undefined,
                videoUrl: undefined,
                demoUrl: undefined,
                landingPageUrl: undefined,
                dsebastienUrl: undefined,
                metaTitle: undefined,
                metaDescription: undefined,
                keywords: undefined
            }
            const result = ProductSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept empty string for videoUrl', () => {
            const valid = { ...validProduct, videoUrl: '' }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept empty string for demoUrl', () => {
            const valid = { ...validProduct, demoUrl: '' }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject invalid URL for videoUrl', () => {
            const invalid = { ...validProduct, videoUrl: 'not-a-url' }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('ProductSchema - Taxonomy', () => {
        it('should accept valid mainCategory', () => {
            const valid = { ...validProduct, mainCategory: 'courses' }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject invalid mainCategory', () => {
            const invalid = { ...validProduct, mainCategory: 'invalid-category' }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should accept empty secondaryCategories array', () => {
            const valid = { ...validProduct, secondaryCategories: [] }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept multiple secondaryCategories', () => {
            const valid = {
                ...validProduct,
                secondaryCategories: [
                    { id: 'obsidian', distant: false },
                    { id: 'productivity', distant: true }
                ]
            }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('ProductSchema - Marketing Copy (PAS Framework)', () => {
        it('should require problem statement', () => {
            const invalid = { ...validProduct, problem: '' }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should require at least one problem point', () => {
            const invalid = { ...validProduct, problemPoints: [] }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should require agitate statement', () => {
            const invalid = { ...validProduct, agitate: '' }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should require at least one agitate point', () => {
            const invalid = { ...validProduct, agitatePoints: [] }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should require solution statement', () => {
            const invalid = { ...validProduct, solution: '' }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should require at least one solution point', () => {
            const invalid = { ...validProduct, solutionPoints: [] }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('ProductSchema - Meta Flags', () => {
        it('should accept featured product', () => {
            const valid = { ...validProduct, featured: true }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept product with all flags', () => {
            const valid = {
                ...validProduct,
                featured: true,
                bestseller: true,
                bestValue: true
            }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept valid priority', () => {
            const valid = { ...validProduct, priority: 100 }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('ProductSchema - Subscription Fields', () => {
        it('should accept product with isSubscription true', () => {
            const valid = { ...validProduct, isSubscription: true }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept product with isSubscription false', () => {
            const valid = { ...validProduct, isSubscription: false }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept product without isSubscription (optional field)', () => {
            const result = ProductSchema.safeParse(validProduct)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.isSubscription).toBeUndefined()
            }
        })

        it('should accept product with paymentFrequencies array', () => {
            const valid = {
                ...validProduct,
                isSubscription: true,
                paymentFrequencies: ['monthly', 'yearly']
            }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept product with single paymentFrequency', () => {
            const valid = {
                ...validProduct,
                isSubscription: true,
                paymentFrequencies: ['monthly']
            }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept product with defaultPaymentFrequency', () => {
            const valid = {
                ...validProduct,
                isSubscription: true,
                paymentFrequencies: ['monthly', 'yearly'],
                defaultPaymentFrequency: 'monthly'
            }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept subscription product with all subscription fields', () => {
            const valid = {
                ...validProduct,
                priceTier: 'subscription',
                isSubscription: true,
                paymentFrequencies: ['monthly', 'yearly'],
                defaultPaymentFrequency: 'yearly'
            }
            const result = ProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject product with invalid paymentFrequency in array', () => {
            const invalid = {
                ...validProduct,
                isSubscription: true,
                paymentFrequencies: ['monthly', 'weekly']
            }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product with invalid defaultPaymentFrequency', () => {
            const invalid = {
                ...validProduct,
                isSubscription: true,
                defaultPaymentFrequency: 'weekly'
            }
            const result = ProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should accept product without subscription fields', () => {
            const result = ProductSchema.safeParse(validProduct)
            expect(result.success).toBe(true)
        })
    })
})
