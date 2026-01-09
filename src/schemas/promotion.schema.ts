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

export const PromotionConfigSchema = z
    .object({
        // Banner visibility control
        bannerBehavior: BannerBehaviorSchema,

        // Promotion timing (required when bannerBehavior is PROMOTIONS)
        promotionStart: z.string().datetime({ message: 'Must be ISO 8601 timestamp' }).optional(),
        promotionEnd: z.string().datetime({ message: 'Must be ISO 8601 timestamp' }).optional(),

        // Content
        promoText: z.string().min(1, 'Promotion text is required'),
        promoLinkText: z.string().optional(),
        promoLink: z.string().url('Promotion link must be a valid URL'),
        discountCode: z.string().optional()
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
export type PromotionConfig = z.infer<typeof PromotionConfigSchema>
