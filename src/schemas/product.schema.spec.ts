import { describe, it, expect } from 'bun:test'
import {
    AggregatedProductSchema,
    PriceTierSchema,
    PaymentFrequencySchema,
    SecondaryCategorySchema,
    ProductVariantSchema
} from './product.schema'
import { ProductBenefitsSchema } from './product-benefits.schema'
import { StatsSchema, RatingSchema, RatingsSchema } from './stats.schema'
import type { TagId } from '@/schemas/tag.schema'

describe('Product Schema Validation', () => {
    const validProduct = {
        id: 'test-product',
        name: 'Test Product',
        gumroadId: null,
        isGumroadProduct: false,
        gumroadProductSlugs: null,
        price: 99.99,
        priceDisplay: '€99.99',
        priceTier: 'standard' as const,
        gumroadUrl: 'https://gumroad.com/test',
        variants: null,
        isSubscription: false,
        paymentFrequencies: null,
        defaultPaymentFrequency: null,
        mainCategory: 'guides' as const,
        secondaryCategories: [],
        tags: ['ai' as TagId],
        contents: ['Item 1', 'Item 2'],
        stats: null,
        landingPageUrl: null,
        dsebastienUrl: null,
        faqs: [],
        testimonials: [],
        media: [],
        featured: false,
        bestseller: false,
        bestValue: false,
        priority: 50,
        crossSellIds: [],
        activeSalesCopyId: 'default',
        ratingsCount: null,
        averageRating: null,
        testimonialsCount: 0,
        includedProducts: [],
        includedIn: [],
        salesCopy: {
            tagline: 'Test tagline',
            secondaryTagline: null,
            problem: 'Test problem',
            problemPoints: ['Point 1', 'Point 2'],
            agitate: 'Test agitate',
            agitatePoints: ['Agitate 1', 'Agitate 2'],
            solution: 'Test solution',
            solutionPoints: ['Solution 1', 'Solution 2'],
            description: 'Test description',
            highlights: ['Feature 1', 'Feature 2'],
            benefits: {
                immediate: [],
                systematic: [],
                longTerm: []
            },
            targetAudience: [],
            perfectFor: [],
            notForYou: [],
            trustBadges: [],
            guarantees: [],
            metaTitle: '',
            metaDescription: '',
            keywords: [],
            storytelling: null,
            timeline: null,
            courseContent: null,
            howItWorks: null,
            mediaSections: null
        }
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
        it('should accept valid variant with all nullable fields', () => {
            const valid = {
                name: 'Pro Version',
                price: 199.99,
                priceDisplay: '€199.99',
                description: 'Pro features included',
                gumroadUrl: 'https://gumroad.com/pro',
                gumroadVariantId: null,
                paymentFrequency: null,
                prices: null,
                includedProducts: []
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
                gumroadVariantId: 'pro-version',
                paymentFrequency: null,
                prices: null,
                includedProducts: []
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
                gumroadVariantId: null,
                paymentFrequency: 'monthly',
                prices: null,
                includedProducts: []
            }
            expect(() => ProductVariantSchema.parse(valid)).not.toThrow()
        })

        it('should accept variant with all fields', () => {
            const valid = {
                name: 'Yearly Subscription',
                price: 99.99,
                priceDisplay: '€99.99/year',
                description: 'Yearly subscription',
                gumroadUrl: 'https://gumroad.com/yearly',
                gumroadVariantId: 'yearly-plan',
                paymentFrequency: 'yearly',
                prices: {
                    monthly: 9.99,
                    yearly: 99.99,
                    biennial: null,
                    oneTime: null
                },
                includedProducts: []
            }
            expect(() => ProductVariantSchema.parse(valid)).not.toThrow()
        })

        it('should reject variant with invalid URL', () => {
            const invalid = {
                name: 'Pro Version',
                price: 199.99,
                priceDisplay: '€199.99',
                description: 'Pro features',
                gumroadUrl: 'not-a-url',
                gumroadVariantId: null,
                paymentFrequency: null,
                prices: null,
                includedProducts: []
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
                gumroadVariantId: null,
                paymentFrequency: 'weekly',
                prices: null,
                includedProducts: []
            }
            expect(() => ProductVariantSchema.parse(invalid)).toThrow()
        })

        it('should reject variant without gumroadVariantId field', () => {
            const invalid = {
                name: 'Pro Version',
                price: 199.99,
                priceDisplay: '€199.99',
                description: 'Pro features',
                gumroadUrl: 'https://gumroad.com/pro',
                paymentFrequency: null,
                prices: null,
                includedProducts: []
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

        it('should accept empty arrays for all benefit categories', () => {
            const valid = {
                immediate: [],
                systematic: [],
                longTerm: []
            }
            expect(() => ProductBenefitsSchema.parse(valid)).not.toThrow()
        })

        it('should reject partial benefits (missing required arrays)', () => {
            const invalid = {
                immediate: ['Quick win 1']
            }
            expect(() => ProductBenefitsSchema.parse(invalid)).toThrow()
        })
    })

    describe('RatingSchema', () => {
        it('should accept valid rating entry', () => {
            const valid = {
                id: 'rating-1',
                rating: 5,
                date: '2026-01-13'
            }
            expect(() => RatingSchema.parse(valid)).not.toThrow()
        })

        it('should accept rating with null values', () => {
            const valid = {
                id: 'rating-1',
                rating: null,
                date: null
            }
            expect(() => RatingSchema.parse(valid)).not.toThrow()
        })

        it('should reject rating outside 0-5 range', () => {
            const invalid = {
                id: 'rating-1',
                rating: 6,
                date: null
            }
            expect(() => RatingSchema.parse(invalid)).toThrow()
        })

        it('should reject rating without id', () => {
            const invalid = {
                id: '',
                rating: 5,
                date: null
            }
            expect(() => RatingSchema.parse(invalid)).toThrow()
        })
    })

    describe('RatingsSchema', () => {
        it('should accept valid ratings grouped by source', () => {
            const valid = {
                gumroad: [
                    { id: 'gum-1', rating: 5, date: '2026-01-10' },
                    { id: 'gum-2', rating: 4, date: '2026-01-11' }
                ],
                trustpilot: [{ id: 'tp-1', rating: 5, date: '2026-01-12' }]
            }
            expect(() => RatingsSchema.parse(valid)).not.toThrow()
        })

        it('should accept empty sources', () => {
            const valid = {
                gumroad: []
            }
            expect(() => RatingsSchema.parse(valid)).not.toThrow()
        })
    })

    describe('StatsSchema', () => {
        it('should accept valid stats with all fields', () => {
            const valid = {
                userCount: '10,000+',
                timeSaved: '20 hours/month',
                ratings: {
                    gumroad: [{ id: 'gum-1', rating: 5, date: '2026-01-10' }]
                },
                additionalStats: [],
                lastSale: null
            }
            expect(() => StatsSchema.parse(valid)).not.toThrow()
        })

        it('should accept stats with null userCount and timeSaved', () => {
            const valid = {
                userCount: null,
                timeSaved: null,
                ratings: {
                    gumroad: [{ id: 'gum-1', rating: 5, date: null }]
                },
                additionalStats: [],
                lastSale: null
            }
            expect(() => StatsSchema.parse(valid)).not.toThrow()
        })

        it('should accept stats with null ratings', () => {
            const valid = {
                userCount: '5,000+',
                timeSaved: null,
                ratings: null,
                additionalStats: [],
                lastSale: null
            }
            expect(() => StatsSchema.parse(valid)).not.toThrow()
        })

        it('should accept stats with all nullable fields set to null', () => {
            const valid = {
                userCount: null,
                timeSaved: null,
                ratings: null,
                additionalStats: [],
                lastSale: null
            }
            expect(() => StatsSchema.parse(valid)).not.toThrow()
        })

        it('should reject stats without userCount field', () => {
            const invalid = {
                timeSaved: null,
                ratings: null,
                additionalStats: [],
                lastSale: null
            }
            expect(() => StatsSchema.parse(invalid)).toThrow()
        })

        it('should accept stats with additional stats', () => {
            const valid = {
                userCount: '1,000+',
                timeSaved: null,
                ratings: null,
                additionalStats: [
                    { value: '50+', label: 'Countries', link: null },
                    { value: '1M+', label: 'Messages', link: 'https://example.com/stats' }
                ],
                lastSale: null
            }
            expect(() => StatsSchema.parse(valid)).not.toThrow()
        })

        it('should reject additional stats without required value', () => {
            const invalid = {
                userCount: null,
                timeSaved: null,
                ratings: null,
                additionalStats: [{ label: 'Test', link: null }]
            }
            expect(() => StatsSchema.parse(invalid)).toThrow()
        })

        it('should reject additional stats without required label', () => {
            const invalid = {
                userCount: null,
                timeSaved: null,
                ratings: null,
                additionalStats: [{ value: '100+', link: null }]
            }
            expect(() => StatsSchema.parse(invalid)).toThrow()
        })

        it('should reject additional stats with invalid link URL', () => {
            const invalid = {
                userCount: null,
                timeSaved: null,
                ratings: null,
                additionalStats: [{ value: '100+', label: 'Test', link: 'not-a-url' }]
            }
            expect(() => StatsSchema.parse(invalid)).toThrow()
        })
    })

    describe('AggregatedProductSchema - Required Fields', () => {
        it('should accept valid complete product', () => {
            const result = AggregatedProductSchema.safeParse(validProduct)
            expect(result.success).toBe(true)
        })

        it('should reject product without id', () => {
            const invalid = { ...validProduct, id: '' }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product without name', () => {
            const invalid = { ...validProduct, name: '' }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product with negative price', () => {
            const invalid = { ...validProduct, price: -10 }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product with invalid gumroadUrl', () => {
            const invalid = { ...validProduct, gumroadUrl: 'not-a-url' }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product without tags', () => {
            const invalid = { ...validProduct, tags: [] }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product without highlights', () => {
            const invalid = { ...validProduct, contents: [] }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should require salesCopy object', () => {
            const invalid = { ...validProduct, salesCopy: undefined }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('AggregatedProductSchema - Optional Fields', () => {
        it('should accept product with null optional fields', () => {
            const minimal = {
                ...validProduct,
                variants: null,
                stats: null,
                landingPageUrl: null,
                dsebastienUrl: null
            }
            const result = AggregatedProductSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept product with empty string URLs', () => {
            const minimal = {
                ...validProduct,
                landingPageUrl: '',
                dsebastienUrl: ''
            }
            const result = AggregatedProductSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })
    })

    describe('AggregatedProductSchema - Taxonomy', () => {
        it('should accept valid mainCategory', () => {
            const valid = { ...validProduct, mainCategory: 'courses' }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject invalid mainCategory', () => {
            const invalid = { ...validProduct, mainCategory: 'invalid-category' }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should accept empty secondaryCategories array', () => {
            const valid = { ...validProduct, secondaryCategories: [] }
            const result = AggregatedProductSchema.safeParse(valid)
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
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('AggregatedProductSchema - Sales Copy (PAS Framework)', () => {
        it('should accept sales copy with all optional fields', () => {
            const valid = {
                ...validProduct,
                salesCopy: {
                    ...validProduct.salesCopy,
                    secondaryTagline: 'Secondary tagline',
                    metaTitle: 'Meta Title',
                    metaDescription: 'Meta description',
                    keywords: ['keyword1', 'keyword2']
                }
            }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept sales copy with minimal PAS fields', () => {
            const valid = {
                ...validProduct,
                salesCopy: {
                    tagline: 'Test tagline',
                    secondaryTagline: null,
                    problem: 'Test problem',
                    problemPoints: ['Point 1'],
                    agitate: 'Test agitate',
                    agitatePoints: ['Agitate 1'],
                    solution: 'Test solution',
                    solutionPoints: ['Solution 1'],
                    description: 'Test description',
                    highlights: ['Feature 1'],
                    benefits: {
                        immediate: [],
                        systematic: [],
                        longTerm: []
                    },
                    targetAudience: [],
                    perfectFor: [],
                    notForYou: [],
                    trustBadges: [],
                    guarantees: [],
                    metaTitle: '',
                    metaDescription: '',
                    keywords: [],
                    storytelling: null,
                    timeline: null,
                    courseContent: null,
                    howItWorks: null,
                    mediaSections: null
                }
            }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('AggregatedProductSchema - Meta Flags', () => {
        it('should accept featured product', () => {
            const valid = { ...validProduct, featured: true }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept product with all flags', () => {
            const valid = {
                ...validProduct,
                featured: true,
                bestseller: true,
                bestValue: true
            }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept valid priority', () => {
            const valid = { ...validProduct, priority: 100 }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('AggregatedProductSchema - Computed Rating Fields', () => {
        it('should accept product with ratingsCount and averageRating', () => {
            const valid = {
                ...validProduct,
                ratingsCount: 100,
                averageRating: 4.8
            }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept product without computed rating fields', () => {
            const valid = { ...validProduct }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject negative ratingsCount', () => {
            const invalid = {
                ...validProduct,
                ratingsCount: -1
            }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject averageRating outside 0-5 range', () => {
            const invalid = {
                ...validProduct,
                averageRating: 5.5
            }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should accept averageRating of 0', () => {
            const valid = {
                ...validProduct,
                ratingsCount: 1,
                averageRating: 0
            }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept averageRating of 5', () => {
            const valid = {
                ...validProduct,
                ratingsCount: 50,
                averageRating: 5
            }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('AggregatedProductSchema - Subscription Fields', () => {
        it('should accept product with isSubscription true', () => {
            const valid = { ...validProduct, isSubscription: true }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept product with isSubscription false', () => {
            const valid = { ...validProduct, isSubscription: false }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should require isSubscription field', () => {
            const invalid = { ...validProduct }
            delete (invalid as Partial<typeof validProduct>).isSubscription
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should accept product with paymentFrequencies array', () => {
            const valid = {
                ...validProduct,
                isSubscription: true,
                paymentFrequencies: ['monthly', 'yearly']
            }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept product with single paymentFrequency', () => {
            const valid = {
                ...validProduct,
                isSubscription: true,
                paymentFrequencies: ['monthly']
            }
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept product with defaultPaymentFrequency', () => {
            const valid = {
                ...validProduct,
                isSubscription: true,
                paymentFrequencies: ['monthly', 'yearly'],
                defaultPaymentFrequency: 'monthly'
            }
            const result = AggregatedProductSchema.safeParse(valid)
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
            const result = AggregatedProductSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject product with invalid paymentFrequency in array', () => {
            const invalid = {
                ...validProduct,
                isSubscription: true,
                paymentFrequencies: ['monthly', 'weekly']
            }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject product with invalid defaultPaymentFrequency', () => {
            const invalid = {
                ...validProduct,
                isSubscription: true,
                defaultPaymentFrequency: 'weekly'
            }
            const result = AggregatedProductSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should accept product without subscription fields', () => {
            const result = AggregatedProductSchema.safeParse(validProduct)
            expect(result.success).toBe(true)
        })
    })
})
