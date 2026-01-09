import { z } from 'zod'

/**
 * Zod schema for Testimonial validation
 * SINGLE SOURCE OF TRUTH for Testimonial types and validation
 * Last updated: 2026-01-09
 *
 * Testimonials are stored in product-specific files:
 * src/data/products/{product-id}-testimonials.json
 *
 * The productId is implicit from the filename, not stored in the testimonial data.
 */

export const TestimonialSchema = z.object({
    id: z.string().min(1, 'Testimonial ID is required'),
    author: z.string().min(1, 'Author is required'),
    role: z.string().optional(),
    company: z.string().optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    twitterHandle: z.string().optional(),
    twitterUrl: z.string().url().optional().or(z.literal('')),
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    quote: z.string().min(1, 'Quote is required'),
    featured: z.boolean()
})

export const TestimonialsArraySchema = z.array(TestimonialSchema)

// Export TypeScript types derived from Zod schemas
export type Testimonial = z.infer<typeof TestimonialSchema>
export type TestimonialsArray = z.infer<typeof TestimonialsArraySchema>
