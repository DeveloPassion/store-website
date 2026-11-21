import { z } from 'zod'

/**
 * Zod schema for promotion banner validation
 * SINGLE SOURCE OF TRUTH for promotion types and validation
 * Last updated: 2026-01-09
 *
 * This schema validates promotion.json to ensure data integrity.
 * TypeScript types are exported from this file and re-exported by src/types/promotion.ts
 */

export const BannerBehaviorSchema = z.enum(['ALWAYS', 'NEVER', 'PROMOTIONS'])

/**
 * A product (or some of its variants) that the promotion does not cover.
 * The buy links of excluded products never carry the discount code.
 */
export const PromotionExclusionSchema = z.object({
    productId: z.string().min(1, 'Product id is required'),
    // null: the whole product is excluded
    // array: only these variants (by gumroadVariantId) are excluded
    variantIds: z.array(z.string().min(1)).nullable()
})

export const PromotionConfigSchema = z
    .object({
        // Banner visibility control
        bannerBehavior: BannerBehaviorSchema,

        // Promotion timing (required when bannerBehavior is PROMOTIONS)
        promotionStart: z.string().datetime({ message: 'Must be ISO 8601 timestamp' }).nullable(),
        promotionEnd: z.string().datetime({ message: 'Must be ISO 8601 timestamp' }).nullable(),

        // Content
        promoText: z.string().min(1, 'Promotion text is required'),
        promoLinkText: z.string().nullable(),
        promoLink: z.string().url('Promotion link must be a valid URL').nullable(),
        discountCode: z.string().nullable(),

        // Products not covered by the promotion (no discount code on their buy links)
        excludedProducts: z.array(PromotionExclusionSchema)
    })
    .refine(
        (data) => {
            // If bannerBehavior is PROMOTIONS, dates must be provided
            if (data.bannerBehavior === 'PROMOTIONS') {
                return data.promotionStart && data.promotionEnd
            }
            return true
        },
        {
            message:
                'promotionStart and promotionEnd are required when bannerBehavior is PROMOTIONS',
            path: ['bannerBehavior']
        }
    )
    .refine(
        (data) => {
            // If dates are provided, end must be after start
            if (data.promotionStart && data.promotionEnd) {
                return new Date(data.promotionEnd) > new Date(data.promotionStart)
            }
            return true
        },
        {
            message: 'promotionEnd must be after promotionStart',
            path: ['promotionEnd']
        }
    )

// Export TypeScript types derived from Zod schemas
export type BannerBehavior = z.infer<typeof BannerBehaviorSchema>
export type PromotionExclusion = z.infer<typeof PromotionExclusionSchema>
export type PromotionConfig = z.infer<typeof PromotionConfigSchema>
