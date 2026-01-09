import { z } from 'zod'

/**
 * Zod schema for tag validation
 * Source of truth for tags.json
 * Last updated: 2026-01-08
 *
 * This schema validates tags.json entries to ensure data integrity.
 * Keep this schema in sync with the TypeScript types in src/types/tag.ts
 */

export const TagSchema = z.object({
    id: z
        .string()
        .min(1, 'Tag id is required')
        .regex(/^[a-z0-9-]+$/, 'Tag id must be lowercase with hyphens only'),
    name: z.string().min(1, 'Tag name is required'),
    description: z.string().min(1, 'Tag description is required'),
    icon: z.string().optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be hex format (#RRGGBB)')
        .optional(),
    featured: z.boolean(),
    priority: z.number().int().min(1)
})

export const TagsMapSchema = z.record(z.string(), TagSchema)

// Export TypeScript types derived from Zod schemas
export type Tag = z.infer<typeof TagSchema>
export type TagsMap = z.infer<typeof TagsMapSchema>
