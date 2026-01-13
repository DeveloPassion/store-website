import { z } from 'zod'

/**
 * Origin Story Section
 * Why the product exists, genesis moment, inspiration
 */
export const OriginStorySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    story: z.string().min(10, 'Story must be at least 10 characters'),
    inspirationPoint: z.string().optional(),
    genesisDate: z.string().optional(),
    icon: z.string().optional()
})

/**
 * Creator Journey Section
 * Personal story, struggles, credibility, achievements
 */
export const CreatorJourneySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    story: z.string().min(10, 'Story must be at least 10 characters'),
    struggles: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
    credentials: z.string().optional(),
    icon: z.string().optional()
})

/**
 * Transformation Arc Section
 * Before/during/after customer journey with timeline
 */
export const TransformationPhaseSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    points: z.array(z.string()).optional(),
    icon: z.string().optional()
})

export const TransformationArcSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    before: TransformationPhaseSchema,
    during: TransformationPhaseSchema,
    after: TransformationPhaseSchema,
    timeline: z.string().optional()
})

/**
 * Success Stories Section
 * Detailed case studies with metrics and customer results
 */
export const SuccessStorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    role: z.string().optional(),
    company: z.string().optional(),
    result: z.string().min(10, 'Result must be at least 10 characters'),
    metrics: z
        .array(
            z.object({
                label: z.string().min(1, 'Metric label is required'),
                value: z.string().min(1, 'Metric value is required'),
                icon: z.string().optional()
            })
        )
        .optional(),
    quote: z.string().optional(),
    image: z.string().optional(),
    avatarUrl: z.string().optional()
})

export const SuccessStoriesSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    stories: z.array(SuccessStorySchema).min(1, 'At least one success story is required')
})

/**
 * Methodology Section
 * Step-by-step process, philosophy, differentiation
 */
export const MethodologyStepSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    icon: z.string().optional(),
    order: z.number().int().min(0)
})

export const MethodologySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    steps: z.array(MethodologyStepSchema).min(1, 'At least one step is required'),
    philosophy: z.string().optional(),
    differentiation: z.string().optional()
})

/**
 * Vision Section
 * Mission statement, bigger picture, values, future goals
 */
export const VisionSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    mission: z.string().min(10, 'Mission must be at least 10 characters'),
    values: z
        .array(
            z.object({
                title: z.string().min(1, 'Value title is required'),
                description: z.string().min(10, 'Value description must be at least 10 characters'),
                icon: z.string().optional()
            })
        )
        .optional(),
    futureGoals: z.array(z.string()).optional(),
    biggerPicture: z.string().optional(),
    icon: z.string().optional()
})

/**
 * Complete Storytelling Schema
 * All sections are optional/nullable
 */
export const StorytellingSchema = z.object({
    originStory: OriginStorySchema.nullable().optional(),
    creatorJourney: CreatorJourneySchema.nullable().optional(),
    transformationArc: TransformationArcSchema.nullable().optional(),
    successStories: SuccessStoriesSchema.nullable().optional(),
    methodology: MethodologySchema.nullable().optional(),
    vision: VisionSchema.nullable().optional()
})

// Export TypeScript types
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
