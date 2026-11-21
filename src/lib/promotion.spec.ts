import { describe, it, expect } from 'bun:test'
import type { PromotionConfig } from '@/schemas/promotion.schema'
import {
    getPromotionDiscountCode,
    isProductCoveredByPromotion,
    isPromotionWindowActive
} from './promotion'

const promotion: PromotionConfig = {
    bannerBehavior: 'PROMOTIONS',
    promoText: 'Black Friday: 20% off with the code',
    promoLink: null,
    promoLinkText: null,
    discountCode: 'BLACKFRIDAY2026',
    promotionStart: '2026-11-22T23:00:00Z',
    promotionEnd: '2026-11-30T22:59:00Z',
    excludedProducts: [
        { productId: 'pkm-coaching', variantIds: null },
        { productId: 'knowii-community', variantIds: ['explorer', 'knowledge-builder'] }
    ]
}

const inside = new Date('2026-11-25T12:00:00Z')
const before = new Date('2026-11-22T22:59:59Z')
const after = new Date('2026-11-30T22:59:01Z')

const kit = { id: 'obsidian-starter-kit', price: 279.99, priceTier: 'standard' as const }
const coaching = { id: 'pkm-coaching', price: 99.99, priceTier: 'premium' as const }
const knowii = { id: 'knowii-community', price: 14.99, priceTier: 'subscription' as const }
const freeGuide = { id: 'obsidian-automation-guide', price: 0, priceTier: 'free' as const }

const variant = (gumroadVariantId: string | null, price = 10) => ({ gumroadVariantId, price })

describe('isPromotionWindowActive', () => {
    it('is active inside the window', () => {
        expect(isPromotionWindowActive(promotion, inside)).toBe(true)
    })

    it('is active at the exact start and the exact end', () => {
        expect(isPromotionWindowActive(promotion, new Date('2026-11-22T23:00:00Z'))).toBe(true)
        expect(isPromotionWindowActive(promotion, new Date('2026-11-30T22:59:00Z'))).toBe(true)
    })

    it('is not active before the start', () => {
        expect(isPromotionWindowActive(promotion, before)).toBe(false)
    })

    it('is not active after the end', () => {
        expect(isPromotionWindowActive(promotion, after)).toBe(false)
    })

    it('is not active in ALWAYS or NEVER mode', () => {
        expect(isPromotionWindowActive({ ...promotion, bannerBehavior: 'ALWAYS' }, inside)).toBe(
            false
        )
        expect(isPromotionWindowActive({ ...promotion, bannerBehavior: 'NEVER' }, inside)).toBe(
            false
        )
    })

    it('is not active without dates or with invalid dates', () => {
        expect(isPromotionWindowActive({ ...promotion, promotionStart: null }, inside)).toBe(false)
        expect(isPromotionWindowActive({ ...promotion, promotionEnd: 'not a date' }, inside)).toBe(
            false
        )
    })
})

describe('isProductCoveredByPromotion', () => {
    it('covers a product that is not excluded', () => {
        expect(isProductCoveredByPromotion(promotion, 'obsidian-starter-kit', null)).toBe(true)
    })

    it('does not cover a fully excluded product, whatever the variant', () => {
        expect(isProductCoveredByPromotion(promotion, 'pkm-coaching', null)).toBe(false)
        expect(isProductCoveredByPromotion(promotion, 'pkm-coaching', 'any')).toBe(false)
    })

    it('covers only the variants that are not excluded', () => {
        expect(isProductCoveredByPromotion(promotion, 'knowii-community', 'knowledge-master')).toBe(
            true
        )
        expect(
            isProductCoveredByPromotion(promotion, 'knowii-community', 'knowledge-builder')
        ).toBe(false)
        expect(isProductCoveredByPromotion(promotion, 'knowii-community', 'explorer')).toBe(false)
    })

    it('does not cover a product with excluded variants when no variant is selected', () => {
        expect(isProductCoveredByPromotion(promotion, 'knowii-community', null)).toBe(false)
    })
})

describe('getPromotionDiscountCode', () => {
    it('returns the code for a covered product inside the window', () => {
        expect(getPromotionDiscountCode(promotion, kit, null, inside)).toBe('BLACKFRIDAY2026')
        expect(getPromotionDiscountCode(promotion, kit, variant(null, 279.99), inside)).toBe(
            'BLACKFRIDAY2026'
        )
    })

    it('returns no code before the window', () => {
        expect(getPromotionDiscountCode(promotion, kit, null, before)).toBeUndefined()
    })

    it('returns no code after the window', () => {
        expect(getPromotionDiscountCode(promotion, kit, null, after)).toBeUndefined()
    })

    it('returns no code for an excluded product', () => {
        expect(getPromotionDiscountCode(promotion, coaching, null, inside)).toBeUndefined()
        expect(
            getPromotionDiscountCode(promotion, coaching, variant(null, 99.99), inside)
        ).toBeUndefined()
    })

    it('returns the code for the Knowledge Master tier of Knowii only', () => {
        expect(
            getPromotionDiscountCode(promotion, knowii, variant('knowledge-master', 119.99), inside)
        ).toBe('BLACKFRIDAY2026')
        expect(
            getPromotionDiscountCode(promotion, knowii, variant('knowledge-builder', 59.99), inside)
        ).toBeUndefined()
        expect(
            getPromotionDiscountCode(promotion, knowii, variant('explorer', 14.99), inside)
        ).toBeUndefined()
        expect(getPromotionDiscountCode(promotion, knowii, null, inside)).toBeUndefined()
    })

    it('returns no code for the Knowledge Master tier outside the window', () => {
        expect(
            getPromotionDiscountCode(promotion, knowii, variant('knowledge-master', 119.99), after)
        ).toBeUndefined()
    })

    it('returns no code for a free product or a free variant', () => {
        expect(getPromotionDiscountCode(promotion, freeGuide, null, inside)).toBeUndefined()
        expect(getPromotionDiscountCode(promotion, kit, variant(null, 0), inside)).toBeUndefined()
    })

    it('returns no code when the promotion has no code', () => {
        expect(
            getPromotionDiscountCode({ ...promotion, discountCode: null }, kit, null, inside)
        ).toBeUndefined()
    })
})
