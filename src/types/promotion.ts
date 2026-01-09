/**
 * Promotion Banner Configuration Types
 *
 * Keep in sync with: src/schemas/promotion.schema.ts (source of truth)
 */

export type BannerBehavior = 'ALWAYS' | 'NEVER' | 'PROMOTIONS'

export interface PromotionConfig {
    // Banner visibility control
    bannerBehavior: BannerBehavior

    // Promotion timing (required when bannerBehavior is PROMOTIONS)
    promotionStart?: string // ISO 8601 timestamp
    promotionEnd?: string // ISO 8601 timestamp

    // Content
    promoText: string
    promoLinkText?: string
    promoLink: string // URL
    discountCode?: string
}
