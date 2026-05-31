import { z } from 'zod'

/**
 * Zod schema for Testimonial validation
 * SINGLE SOURCE OF TRUTH for Testimonial types and validation
 * Last updated: 2026-01-13
 *
 * All testimonials are assumed to be 5-star ratings.
 *
 * Testimonials are stored in product-specific files:
 * src/data/products/{product-id}-testimonials.json
 *
 * The productId is implicit from the filename, not stored in the testimonial data.
 */

export const TestimonialSchema = z.object({
    id: z.string().min(1, 'Testimonial ID is required'),
    author: z
        .string()
        .min(1, 'Author is required')
        .refine((val) => val.trim().length > 0, 'Author cannot be only whitespace'),
    role: z.string().nullable(),
    company: z.string().nullable(),
    avatarUrl: z.string().min(1).nullable(),
    twitterHandle: z.string().nullable(),
    twitterUrl: z.string().min(1).nullable(),
    sourceUrl: z.string().min(1).nullable(),
    quote: z
        .string()
        .min(1, 'Quote is required')
        .refine((val) => val.trim().length > 0, 'Quote cannot be only whitespace'),
    featured: z.boolean()
})

export const TestimonialsArraySchema = z.array(TestimonialSchema)

/**
 * File-level schema for Testimonial JSON files
 * Wraps the array in a { data: [...] } object for valid JSON structure
 */
export const TestimonialFileSchema = z.object({
    data: TestimonialsArraySchema
})

// Export TypeScript types derived from Zod schemas
export type Testimonial = z.infer<typeof TestimonialSchema>
export type TestimonialsArray = z.infer<typeof TestimonialsArraySchema>
export type TestimonialFile = z.infer<typeof TestimonialFileSchema>
