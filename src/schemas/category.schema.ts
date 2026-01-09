import { z } from 'zod'

/**
 * Zod schema for category validation
 * SINGLE SOURCE OF TRUTH for category types and validation
 * Last updated: 2026-01-09
 *
 * This schema validates categories.json entries to ensure data integrity.
 * TypeScript types are exported from this file and re-exported by src/types/category.ts
 */

export const CategoryIdSchema = z.enum([
    'ai-mastery',
    'ai-tools',
    'bundles',
    'coaching',
    'community',
    'content-creation',
    'courses',
    'dev-and-it',
    'free',
    'guides',
    'journaling',
    'kits-and-templates',
    'knowledge-bases',
    'knowledge-management',
    'knowledge-work',
    'learning',
    'obsidian',
    'personal-development',
    'personal-organization',
    'productivity',
    'services',
    'tools',
    'workshops'
])

export const CategorySchema = z.object({
    id: CategoryIdSchema,
    name: z.string().min(1, 'Category name is required'),
    description: z.string().min(1, 'Category description is required'),
    icon: z.string().optional(),
    color: z.string().optional(),
    featured: z.boolean(),
    priority: z.number().int().min(1)
})

export const CategoriesArraySchema = z.array(CategorySchema)

// Export TypeScript types derived from Zod schemas
export type CategoryId = z.infer<typeof CategoryIdSchema>
export type Category = z.infer<typeof CategorySchema>
export type CategoriesArray = z.infer<typeof CategoriesArraySchema>
