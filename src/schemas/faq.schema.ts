import { z } from 'zod'

/**
 * Zod schema for FAQ validation
 * SINGLE SOURCE OF TRUTH for FAQ types and validation
 * Last updated: 2026-01-09
 *
 * FAQs are stored in product-specific files:
 * src/data/products/{product-id}-faq.json
 *
 * The productId is implicit from the filename, not stored in the FAQ data.
 */

export const FAQSchema = z.object({
    id: z.string().min(1, 'FAQ ID is required'),
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
    order: z.number().int().nonnegative('Order must be non-negative')
})

export const FAQsArraySchema = z.array(FAQSchema)

// Export TypeScript types derived from Zod schemas
export type FAQ = z.infer<typeof FAQSchema>
export type FAQsArray = z.infer<typeof FAQsArraySchema>
