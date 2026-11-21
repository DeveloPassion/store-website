import promotionConfig from '@/data/promotion.json'
import type { PromotionConfig } from '@/schemas/promotion.schema'
import type { Product, ProductVariant } from '@/schemas/product.schema'

/**
 * The promotion configured in src/data/promotion.json
 */
export const currentPromotion = promotionConfig as PromotionConfig

/**
 * True when the promotion is date-based (PROMOTIONS) and `now` is between its start and its end (inclusive).
 * ALWAYS and NEVER have no window: they return false.
 */
export const isPromotionWindowActive = (config: PromotionConfig, now: Date): boolean => {
    if (config.bannerBehavior !== 'PROMOTIONS') {
        return false
    }
    if (!config.promotionStart || !config.promotionEnd) {
        return false
    }

    const start = new Date(config.promotionStart)
    const end = new Date(config.promotionEnd)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return false
    }

    return now >= start && now <= end
}

/**
 * True when the promotion covers the product (and the variant, if one is selected).
 * - A product excluded with `variantIds: null` is never covered.
 * - A product with excluded variants is covered only for a selected variant that is not excluded.
 *   Without a selected variant, it is not covered (the buyer could pick an excluded one).
 */
export const isProductCoveredByPromotion = (
    config: PromotionConfig,
    productId: string,
    variantId: string | null
): boolean => {
    const exclusion = config.excludedProducts.find((entry) => entry.productId === productId)
    if (!exclusion) {
        return true
    }
    if (exclusion.variantIds === null) {
        return false
    }
    if (!variantId) {
        return false
    }
    return !exclusion.variantIds.includes(variantId)
}

/**
 * The discount code to put on a buy link, or undefined when no code applies:
 * outside the promotion window, for a free product or variant, or for a product the promotion does not cover.
 */
export const getPromotionDiscountCode = (
    config: PromotionConfig,
    product: Pick<Product, 'id' | 'price' | 'priceTier'>,
    variant: Pick<ProductVariant, 'gumroadVariantId' | 'price'> | null,
    now: Date
): string | undefined => {
    if (!config.discountCode || !isPromotionWindowActive(config, now)) {
        return undefined
    }

    const price = variant ? variant.price : product.price
    if (product.priceTier === 'free' || price === 0) {
        return undefined
    }

    if (!isProductCoveredByPromotion(config, product.id, variant?.gumroadVariantId ?? null)) {
        return undefined
    }

    return config.discountCode
}

/**
 * The discount code of the current promotion for this product and variant, at the current time
 */
export const getCurrentPromotionDiscountCode = (
    product: Pick<Product, 'id' | 'price' | 'priceTier'>,
    variant: Pick<ProductVariant, 'gumroadVariantId' | 'price'> | null
): string | undefined => getPromotionDiscountCode(currentPromotion, product, variant, new Date())
