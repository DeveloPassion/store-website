import { z } from 'zod'

/**
 * Product Benefits Schema - All three categories strictly required
 * Used in sales copy to articulate immediate, systematic, and long-term value
 * Last updated: 2026-01-13
 */
export const ProductBenefitsSchema = z.object({
    immediate: z.array(z.string()),
    systematic: z.array(z.string()),
    longTerm: z.array(z.string())
})

// Export TypeScript type
export type ProductBenefits = z.infer<typeof ProductBenefitsSchema>
