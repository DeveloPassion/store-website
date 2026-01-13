/**
 * TypeScript types for storytelling sections
 * Exported from storytelling.schema.ts (single source of truth)
 */
import type { z } from 'zod'
import type {
    OriginStorySchema,
    CreatorJourneySchema,
    TransformationPhaseSchema,
    TransformationArcSchema,
    SuccessStorySchema,
    SuccessStoriesSchema,
    MethodologyStepSchema,
    MethodologySchema,
    VisionSchema,
    StorytellingSchema
} from '../schemas/storytelling.schema.js'

export type OriginStory = z.infer<typeof OriginStorySchema>
export type CreatorJourney = z.infer<typeof CreatorJourneySchema>
export type TransformationPhase = z.infer<typeof TransformationPhaseSchema>
export type TransformationArc = z.infer<typeof TransformationArcSchema>
export type SuccessStory = z.infer<typeof SuccessStorySchema>
export type SuccessStories = z.infer<typeof SuccessStoriesSchema>
export type MethodologyStep = z.infer<typeof MethodologyStepSchema>
export type Methodology = z.infer<typeof MethodologySchema>
export type Vision = z.infer<typeof VisionSchema>
export type Storytelling = z.infer<typeof StorytellingSchema>
