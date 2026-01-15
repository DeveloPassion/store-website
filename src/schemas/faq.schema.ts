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
    question: z
        .string()
        .min(1, 'Question is required')
        .refine((val) => val.trim().length > 0, 'Question cannot be only whitespace'),
    answer: z
        .string()
        .min(1, 'Answer is required')
        .refine((val) => val.trim().length > 0, 'Answer cannot be only whitespace')
})

export const FAQsArraySchema = z.array(FAQSchema)

/**
 * File-level schema for FAQ JSON files
 * Wraps the array in a { data: [...] } object for valid JSON structure
 */
export const FAQFileSchema = z.object({
    data: FAQsArraySchema
})

// Export TypeScript types derived from Zod schemas
export type FAQ = z.infer<typeof FAQSchema>
export type FAQsArray = z.infer<typeof FAQsArraySchema>
export type FAQFile = z.infer<typeof FAQFileSchema>
