import { z } from 'zod'

/**
 * Zod schema for tagline validation
 * SINGLE SOURCE OF TRUTH for tagline types and validation
 * Last updated: 2026-01-11
 *
 * This schema validates taglines.json entries to ensure data integrity.
 * TypeScript types are exported from this file and re-exported by src/types/tagline.ts
 */

export const TaglineCategorySchema = z.enum([
    'default',
    'problem-focused',
    'transformation-focused',
    'outcome-focused',
    'identity-focused',
    'action-focused'
])

export const TaglineSchema = z.object({
    id: z.string().min(1, 'Tagline ID is required'),
    text: z.string().min(1, 'Tagline text is required').max(200, 'Tagline text too long'),
    category: TaglineCategorySchema,
    featured: z.boolean()
})

export const TaglinesArraySchema = z.array(TaglineSchema)

// Export TypeScript types derived from Zod schemas
export type TaglineCategory = z.infer<typeof TaglineCategorySchema>
export type Tagline = z.infer<typeof TaglineSchema>
export type TaglinesArray = z.infer<typeof TaglinesArraySchema>
