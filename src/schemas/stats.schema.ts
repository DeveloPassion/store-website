import { z } from 'zod'

/**
 * Stats Schema - Statistics and ratings for products
 * SINGLE SOURCE OF TRUTH for product stats types and validation
 * Last updated: 2026-01-18
 *
 * Stats are stored in product-specific files:
 * src/data/products/{product-id}-stats.json
 *
 * The productId is implicit from the filename, not stored in the stats data.
 */

/**
 * Individual rating entry from a platform/source
 * Each rating has a unique ID, an optional rating value, and optional date
 */
export const RatingSchema = z.object({
    id: z.string().min(1, 'Rating ID is required'),
    rating: z.number().min(0).max(5).nullable(),
    date: z.string().nullable() // ISO date string (e.g., "2026-01-13")
})

/**
 * Collection of ratings grouped by source/platform
 * Keys are source identifiers (e.g., 'gumroad', 'trustpilot', 'twitter')
 * Values are arrays of Rating entries from that source
 */
export const RatingsSchema = z.record(z.string(), z.array(RatingSchema))

/**
 * StatItem Schema - Flexible stat value with optional custom label
 *
 * Accepts either:
 * - Simple string (backward compatible): "350+" → uses default label
 * - Object with value and optional label: { value: "350+", label: "Members" }
 *
 * This allows custom labels like "Members" or "Students" instead of default "Users"
 */
export const StatItemSchema = z.union([
    z.string().min(1), // Simple string, uses default label
    z.object({
        value: z.string().min(1, 'Stat value is required'),
        label: z.string().nullable() // null = use default label
    })
])

/**
 * Additional stat item with required value, label, and optional link
 * These are custom stats beyond the predefined userCount, timeSaved, and ratings
 *
 * @example
 * { value: "50+", label: "Countries", link: null }
 * { value: "1M+", label: "Messages", link: "#community-stats" }
 */
export const AdditionalStatSchema = z.object({
    value: z.string().min(1, 'Value is required'),
    label: z.string().min(1, 'Label is required'),
    link: z.string().url().nullable() // If set, makes the stat block clickable
})

/**
 * ISO 8601 timestamp schema for dates with time component
 * Matches formats like: "2026-01-19T14:30:00Z" or "2026-01-19T14:30:00.000Z"
 */
export const ISOTimestampSchema = z
    .string()
    .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
        'Must be a valid ISO 8601 timestamp (e.g., 2026-01-19T14:30:00Z)'
    )

/**
 * Stats Schema
 * Contains social proof statistics and ratings for a product
 */
export const StatsSchema = z.object({
    userCount: StatItemSchema.nullable(), // e.g., "2,000+" or { value: "2,000+", label: "Members" }
    timeSaved: StatItemSchema.nullable(), // e.g., "10+ hours/week"
    ratings: RatingsSchema.nullable(), // Nullable: grouped ratings by source
    additionalStats: z.array(AdditionalStatSchema), // Required, can be empty []
    lastSale: ISOTimestampSchema.nullable() // ISO timestamp of most recent sale (null if >6 months ago or no sales)
})

/**
 * File-level schema for Stats JSON files
 * Wraps the stats in a { data: {...} } object for valid JSON structure
 */
export const StatsFileSchema = z.object({
    data: StatsSchema
})

// Export TypeScript types derived from Zod schemas
export type Rating = z.infer<typeof RatingSchema>
export type Ratings = z.infer<typeof RatingsSchema>
export type StatItem = z.infer<typeof StatItemSchema>
export type AdditionalStat = z.infer<typeof AdditionalStatSchema>
export type Stats = z.infer<typeof StatsSchema>
export type StatsFile = z.infer<typeof StatsFileSchema>
