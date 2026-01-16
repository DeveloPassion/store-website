import { z } from 'zod'

/**
 * Stats Schema - Statistics and ratings for products
 * SINGLE SOURCE OF TRUTH for product stats types and validation
 * Last updated: 2026-01-13
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
 * Stats Schema
 * Contains social proof statistics and ratings for a product
 */
export const StatsSchema = z.object({
    userCount: z.string().nullable(), // e.g., "2,000+ users"
    timeSaved: z.string().nullable(), // e.g., "10+ hours/week"
    ratings: RatingsSchema.nullable() // Nullable: grouped ratings by source
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
export type Stats = z.infer<typeof StatsSchema>
export type StatsFile = z.infer<typeof StatsFileSchema>
