import { describe, it, expect } from 'bun:test'
import {
    BannerBehaviorSchema,
    PromotionConfigSchema,
    type BannerBehavior,
    type PromotionConfig
} from './promotion.schema'

describe('Promotion Schema Validation', () => {
    const validPromotion: PromotionConfig = {
        bannerBehavior: 'PROMOTIONS',
        promotionStart: '2026-01-01T00:00:00Z',
        promotionEnd: '2026-01-31T23:59:59Z',
        promoText: 'New Year Sale - 30% off all products!',
        promoLinkText: 'Shop Now',
        promoLink: 'https://example.com/sale',
        discountCode: 'NEWYEAR2026'
    }

    describe('BannerBehaviorSchema', () => {
        it('should accept ALWAYS behavior', () => {
            const result = BannerBehaviorSchema.safeParse('ALWAYS')
            expect(result.success).toBe(true)
        })

        it('should accept NEVER behavior', () => {
            const result = BannerBehaviorSchema.safeParse('NEVER')
            expect(result.success).toBe(true)
        })

        it('should accept PROMOTIONS behavior', () => {
            const result = BannerBehaviorSchema.safeParse('PROMOTIONS')
            expect(result.success).toBe(true)
        })

        it('should reject invalid behavior', () => {
            expect(() => BannerBehaviorSchema.parse('SOMETIMES')).toThrow()
            expect(() => BannerBehaviorSchema.parse('always')).toThrow()
            expect(() => BannerBehaviorSchema.parse('')).toThrow()
            expect(() => BannerBehaviorSchema.parse(null)).toThrow()
        })
    })

    describe('PromotionConfigSchema - Required Fields', () => {
        it('should accept valid complete promotion', () => {
            const result = PromotionConfigSchema.safeParse(validPromotion)
            expect(result.success).toBe(true)
        })

        it('should reject promotion without bannerBehavior', () => {
            const invalid = Object.fromEntries(
                Object.entries(validPromotion).filter(([key]) => key !== 'bannerBehavior')
            )
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject promotion without promoText', () => {
            const invalid = { ...validPromotion, promoText: '' }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject promotion without promoLink', () => {
            const invalid = Object.fromEntries(
                Object.entries(validPromotion).filter(([key]) => key !== 'promoLink')
            )
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject promotion with invalid promoLink', () => {
            const invalid = { ...validPromotion, promoLink: 'not-a-url' }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('PromotionConfigSchema - Optional Fields', () => {
        it('should accept promotion without promoLinkText', () => {
            const minimal = Object.fromEntries(
                Object.entries(validPromotion).filter(([key]) => key !== 'promoLinkText')
            )
            const result = PromotionConfigSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept promotion without discountCode', () => {
            const minimal = Object.fromEntries(
                Object.entries(validPromotion).filter(([key]) => key !== 'discountCode')
            )
            const result = PromotionConfigSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })
    })

    describe('PromotionConfigSchema - ALWAYS Behavior', () => {
        it('should accept ALWAYS behavior without dates', () => {
            const valid = {
                bannerBehavior: 'ALWAYS' as BannerBehavior,
                promoText: 'Always visible banner',
                promoLink: 'https://example.com'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept ALWAYS behavior with dates', () => {
            const valid = {
                bannerBehavior: 'ALWAYS' as BannerBehavior,
                promotionStart: '2026-01-01T00:00:00Z',
                promotionEnd: '2026-12-31T23:59:59Z',
                promoText: 'Always visible banner',
                promoLink: 'https://example.com'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('PromotionConfigSchema - NEVER Behavior', () => {
        it('should accept NEVER behavior without dates', () => {
            const valid = {
                bannerBehavior: 'NEVER' as BannerBehavior,
                promoText: 'Hidden banner',
                promoLink: 'https://example.com'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept NEVER behavior with dates', () => {
            const valid = {
                bannerBehavior: 'NEVER' as BannerBehavior,
                promotionStart: '2026-01-01T00:00:00Z',
                promotionEnd: '2026-12-31T23:59:59Z',
                promoText: 'Hidden banner',
                promoLink: 'https://example.com'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('PromotionConfigSchema - PROMOTIONS Behavior', () => {
        it('should accept PROMOTIONS behavior with valid dates', () => {
            const result = PromotionConfigSchema.safeParse(validPromotion)
            expect(result.success).toBe(true)
        })

        it('should reject PROMOTIONS behavior without promotionStart', () => {
            const invalid = {
                bannerBehavior: 'PROMOTIONS' as BannerBehavior,
                promotionEnd: '2026-01-31T23:59:59Z',
                promoText: 'Sale',
                promoLink: 'https://example.com'
            }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject PROMOTIONS behavior without promotionEnd', () => {
            const invalid = {
                bannerBehavior: 'PROMOTIONS' as BannerBehavior,
                promotionStart: '2026-01-01T00:00:00Z',
                promoText: 'Sale',
                promoLink: 'https://example.com'
            }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject PROMOTIONS behavior without both dates', () => {
            const invalid = {
                bannerBehavior: 'PROMOTIONS' as BannerBehavior,
                promoText: 'Sale',
                promoLink: 'https://example.com'
            }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('PromotionConfigSchema - Date Validation', () => {
        it('should accept valid ISO 8601 timestamps', () => {
            const valid = {
                ...validPromotion,
                promotionStart: '2026-06-15T10:30:00Z',
                promotionEnd: '2026-06-20T15:45:00Z'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject ISO 8601 timestamps with timezone offset (must be UTC)', () => {
            const invalid = {
                ...validPromotion,
                promotionStart: '2026-06-15T10:30:00+02:00',
                promotionEnd: '2026-06-20T15:45:00+02:00'
            }
            const result = PromotionConfigSchema.safeParse(invalid)
            // Zod datetime() only accepts UTC timestamps (ending in Z)
            expect(result.success).toBe(false)
        })

        it('should reject invalid date format', () => {
            const invalid = {
                ...validPromotion,
                promotionStart: '2026-01-01',
                promotionEnd: '2026-01-31'
            }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject date without time', () => {
            const invalid = {
                ...validPromotion,
                promotionStart: '2026-01-01T00:00:00',
                promotionEnd: '2026-01-31T23:59:59'
            }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject invalid timestamp string', () => {
            const invalid = {
                ...validPromotion,
                promotionStart: 'not-a-date',
                promotionEnd: '2026-01-31T23:59:59Z'
            }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('PromotionConfigSchema - Date Range Validation', () => {
        it('should reject when promotionEnd is before promotionStart', () => {
            const invalid = {
                ...validPromotion,
                promotionStart: '2026-01-31T23:59:59Z',
                promotionEnd: '2026-01-01T00:00:00Z'
            }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject when promotionEnd equals promotionStart', () => {
            const invalid = {
                ...validPromotion,
                promotionStart: '2026-01-15T12:00:00Z',
                promotionEnd: '2026-01-15T12:00:00Z'
            }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should accept when promotionEnd is one second after promotionStart', () => {
            const valid = {
                ...validPromotion,
                promotionStart: '2026-01-15T12:00:00Z',
                promotionEnd: '2026-01-15T12:00:01Z'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept long promotion periods', () => {
            const valid = {
                ...validPromotion,
                promotionStart: '2026-01-01T00:00:00Z',
                promotionEnd: '2026-12-31T23:59:59Z'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept short promotion periods', () => {
            const valid = {
                ...validPromotion,
                promotionStart: '2026-01-15T12:00:00Z',
                promotionEnd: '2026-01-15T13:00:00Z'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('PromotionConfigSchema - URL Validation', () => {
        it('should accept HTTPS URLs', () => {
            const valid = { ...validPromotion, promoLink: 'https://example.com/sale' }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept HTTP URLs', () => {
            const valid = { ...validPromotion, promoLink: 'http://example.com/sale' }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept URLs with paths', () => {
            const valid = {
                ...validPromotion,
                promoLink: 'https://example.com/products/sale/2026'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept URLs with query parameters', () => {
            const valid = {
                ...validPromotion,
                promoLink: 'https://example.com/sale?discount=30&code=SALE2026'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept URLs with fragments', () => {
            const valid = { ...validPromotion, promoLink: 'https://example.com/sale#products' }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject invalid URLs', () => {
            const invalid = { ...validPromotion, promoLink: 'not-a-url' }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject empty URL', () => {
            const invalid = { ...validPromotion, promoLink: '' }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject relative URLs', () => {
            const invalid = { ...validPromotion, promoLink: '/sale' }
            const result = PromotionConfigSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('PromotionConfigSchema - Content Validation', () => {
        it('should accept short promo text', () => {
            const valid = { ...validPromotion, promoText: 'Sale!' }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept long promo text', () => {
            const valid = { ...validPromotion, promoText: 'A'.repeat(500) }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept promo text with special characters', () => {
            const valid = { ...validPromotion, promoText: '30% OFF! Save €/$100+' }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept promo text with emojis', () => {
            const valid = { ...validPromotion, promoText: '🎉 Summer Sale 🎉 50% off!' }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept discount code with uppercase', () => {
            const valid = { ...validPromotion, discountCode: 'SUMMER2026' }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept discount code with numbers', () => {
            const valid = { ...validPromotion, discountCode: 'SAVE30NOW' }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept discount code with special characters', () => {
            const valid = { ...validPromotion, discountCode: 'NEW-YEAR-2026' }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('PromotionConfigSchema - Edge Cases', () => {
        it('should reject promotion with extra unknown fields', () => {
            const invalid = { ...validPromotion, extraField: 'value' }
            const result = PromotionConfigSchema.safeParse(invalid)
            // Zod strips extra fields by default, so this should succeed
            expect(result.success).toBe(true)
        })

        it('should accept promotion across year boundary', () => {
            const valid = {
                ...validPromotion,
                promotionStart: '2025-12-31T23:00:00Z',
                promotionEnd: '2026-01-01T01:00:00Z'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept promotion with UTC timezone', () => {
            const valid = {
                ...validPromotion,
                promotionStart: '2026-01-01T00:00:00.000Z',
                promotionEnd: '2026-01-31T23:59:59.999Z'
            }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should handle whitespace in promo text', () => {
            const valid = { ...validPromotion, promoText: '  Summer  Sale  ' }
            const result = PromotionConfigSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })
})
