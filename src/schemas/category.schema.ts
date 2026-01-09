import { z } from 'zod'

/**
 * Zod schema for category validation
 * Source of truth for categories.json
 * Last updated: 2026-01-07
 *
 * This schema validates categories.json entries to ensure data integrity.
 * Keep this schema in sync with the TypeScript types in src/types/category.ts
 */

export const CategoryIdSchema = z.enum([
    'ai-mastery',
    'ai-tools',
    'bundles',
    'coaching',
    'community',
    'content-creation',
    'courses',
    'databases',
    'dev-and-it',
    'free',
    'guides',
    'journaling',
    'kits-and-templates',
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
