import { z } from 'zod'

/**
 * Stats Proof Schema - Social proof statistics for products
 * Used to display user count, time saved, ratings, etc.
 * Last updated: 2026-01-13
 */
export const StatsProofSchema = z.object({
    userCount: z.string().optional(),
    timeSaved: z.string().optional(),
    rating: z.string().optional()
})

// Export TypeScript type
export type StatsProof = z.infer<typeof StatsProofSchema>
