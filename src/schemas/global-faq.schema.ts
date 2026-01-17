import { z } from 'zod'

/**
 * Zod schema for Global FAQ validation
 * SINGLE SOURCE OF TRUTH for global FAQ types and validation
 * Last updated: 2026-01-17
 *
 * Global FAQs are stored in:
 * src/data/faq-global.json
 *
 * This schema extends the basic FAQ structure to support rich content
 * including icons, features, steps, and bullet points.
 *
 * Icon fields support:
 * - Emojis (e.g., "🚀", "💡")
 * - React icon names (e.g., "FaRobot", "SiObsidian")
 * - Image URLs (http/https)
 * - Local image paths (starting with /)
 */

/**
 * Feature item schema for FAQ sections with sub-items
 * Used for sections like "Why do we use Gumroad?" with multiple features
 */
export const GlobalFAQFeatureSchema = z.object({
    icon: z.string().min(1, 'Feature icon is required'),
    title: z.string().min(1, 'Feature title is required'),
    description: z.string().min(1, 'Feature description is required')
})

/**
 * Step item schema for ordered processes
 * Used for sections like "How does shopping work?" with numbered steps
 */
export const GlobalFAQStepSchema = z.object({
    title: z.string().min(1, 'Step title is required'),
    description: z.string().min(1, 'Step description is required')
})

/**
 * Link schema for FAQ items with call-to-action links
 */
export const GlobalFAQLinkSchema = z.object({
    label: z.string().min(1, 'Link label is required'),
    url: z.string().min(1, 'Link URL is required'),
    external: z.boolean().default(false),
    primary: z.boolean().default(false)
})

/**
 * Main Global FAQ schema
 * Supports multiple content types:
 * - Simple text answers
 * - Answers with bullet points
 * - Answers with features (sub-items with icons)
 * - Answers with ordered steps
 */
export const GlobalFAQSchema = z.object({
    id: z.string().min(1, 'FAQ ID is required'),
    question: z
        .string()
        .min(1, 'Question is required')
        .refine((val) => val.trim().length > 0, 'Question cannot be only whitespace'),
    answer: z
        .string()
        .min(1, 'Answer is required')
        .refine((val) => val.trim().length > 0, 'Answer cannot be only whitespace'),
    icon: z.string().nullable().default(null),
    order: z.number().int().min(0).default(0),
    style: z.enum(['default', 'highlight']).default('default'),
    features: z.array(GlobalFAQFeatureSchema).nullable().default(null),
    steps: z.array(GlobalFAQStepSchema).nullable().default(null),
    bullets: z.array(z.string().min(1)).nullable().default(null),
    links: z.array(GlobalFAQLinkSchema).nullable().default(null),
    additionalText: z.string().nullable().default(null)
})

export const GlobalFAQsArraySchema = z.array(GlobalFAQSchema)

/**
 * File-level schema for global FAQ JSON file
 * Wraps the array in a { data: [...] } object for valid JSON structure
 */
export const GlobalFAQFileSchema = z.object({
    data: GlobalFAQsArraySchema
})

// Export TypeScript types derived from Zod schemas
export type GlobalFAQFeature = z.infer<typeof GlobalFAQFeatureSchema>
export type GlobalFAQStep = z.infer<typeof GlobalFAQStepSchema>
export type GlobalFAQLink = z.infer<typeof GlobalFAQLinkSchema>
export type GlobalFAQ = z.infer<typeof GlobalFAQSchema>
export type GlobalFAQsArray = z.infer<typeof GlobalFAQsArraySchema>
export type GlobalFAQFile = z.infer<typeof GlobalFAQFileSchema>
