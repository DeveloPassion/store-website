import { z } from 'zod'

/**
 * Zod schema for animated hero text validation
 * SINGLE SOURCE OF TRUTH for animated hero text types and validation
 * Last updated: 2026-01-12
 *
 * This schema validates animated-hero-texts.json entries to ensure data integrity.
 * TypeScript types are exported from this file and re-exported by src/types/animated-hero-text.ts
 */

export const AnimatedHeroTextSchema = z.object({
    id: z.string().min(1, 'Animated hero text ID is required'),
    text: z.string().min(1, 'Text is required').max(50, 'Text too long'),
    featured: z.boolean()
})

export const AnimatedHeroTextsArraySchema = z.array(AnimatedHeroTextSchema)

// Export TypeScript types derived from Zod schemas
export type AnimatedHeroText = z.infer<typeof AnimatedHeroTextSchema>
export type AnimatedHeroTextsArray = z.infer<typeof AnimatedHeroTextsArraySchema>
