import { z } from 'zod'

/**
 * Origin Story Section
 * Why the product exists, genesis moment, inspiration
 */
export const OriginStorySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().nullable(),
    story: z.string().min(10, 'Story must be at least 10 characters'),
    inspirationPoint: z.string().nullable(),
    genesisDate: z.string().nullable(),
    icon: z.string().nullable()
})

/**
 * Creator Journey Section
 * Personal story, struggles, credibility, achievements
 */
export const CreatorJourneySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().nullable(),
    story: z.string().min(10, 'Story must be at least 10 characters'),
    struggles: z.array(z.string()).nullable(),
    achievements: z.array(z.string()).nullable(),
    credentials: z.string().nullable(),
    icon: z.string().nullable()
})

/**
 * Transformation Arc Section
 * Before/during/after customer journey with timeline
 */
export const TransformationPhaseSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    points: z.array(z.string()).nullable(),
    icon: z.string().nullable()
})

export const TransformationArcSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().nullable(),
    before: TransformationPhaseSchema,
    during: TransformationPhaseSchema,
    after: TransformationPhaseSchema,
    timeline: z.string().nullable()
})

/**
 * Success Stories Section
 * Detailed case studies with metrics and customer results
 */
export const SuccessStorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    role: z.string().nullable(),
    company: z.string().nullable(),
    result: z.string().min(10, 'Result must be at least 10 characters'),
    metrics: z
        .array(
            z.object({
                label: z.string().min(1, 'Metric label is required'),
                value: z.string().min(1, 'Metric value is required'),
                icon: z.string().nullable()
            })
        )
        .nullable(),
    quote: z.string().nullable(),
    image: z.string().nullable(),
    avatarUrl: z.string().nullable()
})

export const SuccessStoriesSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().nullable(),
    stories: z.array(SuccessStorySchema).min(1, 'At least one success story is required')
})

/**
 * Methodology Section
 * Step-by-step process, philosophy, differentiation
 */
export const MethodologyStepSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    icon: z.string().nullable(),
    order: z.number().int().min(0)
})

export const MethodologySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().nullable(),
    steps: z.array(MethodologyStepSchema).min(1, 'At least one step is required'),
    philosophy: z.string().nullable(),
    differentiation: z.string().nullable()
})

/**
 * Vision Section
 * Mission statement, bigger picture, values, future goals
 */
export const VisionSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().nullable(),
    mission: z.string().min(10, 'Mission must be at least 10 characters'),
    values: z
        .array(
            z.object({
                title: z.string().min(1, 'Value title is required'),
                description: z.string().min(10, 'Value description must be at least 10 characters'),
                icon: z.string().nullable()
            })
        )
        .nullable(),
    futureGoals: z.array(z.string()).nullable(),
    biggerPicture: z.string().nullable(),
    icon: z.string().nullable()
})

/**
 * Complete Storytelling Schema
 * All sections are nullable
 */
export const StorytellingSchema = z.object({
    originStory: OriginStorySchema.nullable(),
    creatorJourney: CreatorJourneySchema.nullable(),
    transformationArc: TransformationArcSchema.nullable(),
    successStories: SuccessStoriesSchema.nullable(),
    methodology: MethodologySchema.nullable(),
    vision: VisionSchema.nullable()
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
