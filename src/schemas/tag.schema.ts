import { z } from 'zod'

/**
 * Zod schema for tag validation
 * SINGLE SOURCE OF TRUTH for tag types and validation
 * Last updated: 2026-01-09
 *
 * This schema validates tags.json entries to ensure data integrity.
 * TypeScript types are exported from this file and re-exported by src/types/tag.ts
 */

export const TagIdSchema = z.enum([
    'ai',
    'ai-assistants',
    'ai-prompts',
    'automation',
    'beginner',
    'bundle',
    'career-development',
    'chatgpt',
    'checklist',
    'clarity',
    'claude',
    'coaching',
    'community',
    'concepts',
    'content-creation',
    'courses',
    'curated',
    'design-thinking',
    'directory',
    'focus',
    'free-guide',
    'free-resource',
    'getting-started',
    'ghostwriting',
    'goals',
    'gtd',
    'habits',
    'ikigai',
    'interstitial-journaling',
    'it-fundamentals',
    'johnny-decimal',
    'journaling',
    'knowledge-management',
    'knowledge-work',
    'lead-magnet',
    'learning',
    'life-design',
    'lifetime-access',
    'llms',
    'markdown',
    'master-prompts',
    'mcp',
    'mindfulness',
    'model-context-protocol',
    'note-taking',
    'obsidian',
    'offline',
    'para',
    'para-method',
    'periodic-reviews',
    'personal-brand',
    'personal-knowledge-management',
    'personal-manifesto',
    'personal-organization',
    'pkm',
    'privacy',
    'productivity',
    'programming',
    'prompt-engineering',
    'reference',
    'resources',
    'routines',
    'second-brain',
    'smart-goals',
    'speech-recognition',
    'system-building',
    'systems',
    'templates',
    'time-management',
    'tools',
    'values',
    'visual-learning',
    'voice-to-text',
    'wall-chart',
    'writing',
    'zen-productivity',
    'zettelkasten'
])

export const TagSchema = z.object({
    id: TagIdSchema,
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

export const TagsMapSchema = z.record(TagIdSchema, TagSchema)

// Export TypeScript types derived from Zod schemas
export type TagId = z.infer<typeof TagIdSchema>
export type Tag = z.infer<typeof TagSchema>
export type TagsMap = z.infer<typeof TagsMapSchema>
