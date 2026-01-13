import { z } from 'zod'

/**
 * Shared Schemas - Common types used across multiple schema files
 * Last updated: 2026-01-13
 *
 * This file contains schemas that are imported by multiple other schema files
 * to avoid circular dependencies.
 */

/**
 * Product Benefits Schema - All three categories strictly required
 * Used in sales copy to articulate immediate, systematic, and long-term value
 */
export const ProductBenefitsSchema = z.object({
    immediate: z.array(z.string()),
    systematic: z.array(z.string()),
    longTerm: z.array(z.string())
})

export const StatsProofSchema = z.object({
    userCount: z.string().optional(),
    timeSaved: z.string().optional(),
    rating: z.string().optional()
})

// Export TypeScript types
export type ProductBenefits = z.infer<typeof ProductBenefitsSchema>
export type StatsProof = z.infer<typeof StatsProofSchema>
