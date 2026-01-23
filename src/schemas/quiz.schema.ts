import { z } from 'zod'

/**
 * Quiz Filter Schema
 *
 * Simplified quiz system that maps answers to product filters:
 * - categories: which product categories to match
 * - experienceLevel: beginner/intermediate/advanced filter
 * - priceTiers: budget preferences
 * - deliveryStyle: hands-on vs conceptual preference
 */

export const ExperienceLevelFilterSchema = z.enum(['beginner', 'intermediate', 'advanced'])
export type ExperienceLevelFilter = z.infer<typeof ExperienceLevelFilterSchema>

export const PriceTierFilterSchema = z.enum([
    'free',
    'budget',
    'standard',
    'premium',
    'subscription'
])
export type PriceTierFilter = z.infer<typeof PriceTierFilterSchema>

export const DeliveryStyleFilterSchema = z.enum(['hands-on', 'conceptual', 'hybrid'])
export type DeliveryStyleFilter = z.infer<typeof DeliveryStyleFilterSchema>

/**
 * Filters that accumulate from quiz answers
 */
export const QuizFiltersSchema = z.object({
    categories: z.array(z.string()),
    experienceLevel: ExperienceLevelFilterSchema.nullable(),
    priceTiers: z.array(PriceTierFilterSchema),
    deliveryStyle: DeliveryStyleFilterSchema.nullable()
})

export type QuizFilters = z.infer<typeof QuizFiltersSchema>

/**
 * Partial filters produced by a single quiz option
 */
export const QuizOptionFiltersSchema = z.object({
    categories: z.array(z.string()).optional(),
    experienceLevel: ExperienceLevelFilterSchema.nullable().optional(),
    priceTiers: z.array(PriceTierFilterSchema).optional(),
    deliveryStyle: DeliveryStyleFilterSchema.nullable().optional()
})

export type QuizOptionFilters = z.infer<typeof QuizOptionFiltersSchema>

/**
 * Schema for a quiz option (one of the answers to a question)
 */
export const QuizOptionSchema = z.object({
    label: z.string(),
    icon: z.string(),
    filters: QuizOptionFiltersSchema,
    matchReason: z.string()
})

export type QuizOption = z.infer<typeof QuizOptionSchema>

/**
 * Schema for a quiz question
 */
export const QuizQuestionSchema = z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(QuizOptionSchema).min(2).max(6)
})

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>

/**
 * Schema for the quiz questions data file
 */
export const QuizQuestionsDataSchema = z.object({
    questions: z.array(QuizQuestionSchema)
})

export type QuizQuestionsData = z.infer<typeof QuizQuestionsDataSchema>

/**
 * Result override schema
 *
 * Allows boosting/removing specific products based on filter conditions.
 * Simpler than before - conditions are now filter-based.
 */
export const QuizResultOverrideSchema = z.object({
    // Conditions: filters that must match
    conditions: z.object({
        hasCategories: z.array(z.string()).optional(), // User selected these categories
        experienceLevel: ExperienceLevelFilterSchema.nullable().optional(),
        hasPriceTiers: z.array(PriceTierFilterSchema).optional(),
        deliveryStyle: DeliveryStyleFilterSchema.nullable().optional()
    }),

    // Actions
    addProducts: z.array(z.string()), // Prepend to recommendations
    removeProducts: z.array(z.string()), // Remove from recommendations
    setProducts: z.array(z.string()).nullable(), // Replace entirely (null = don't replace)

    priority: z.number().default(0)
})

export type QuizResultOverride = z.infer<typeof QuizResultOverrideSchema>

/**
 * Schema for the quiz overrides data file
 */
export const QuizOverridesSchema = z.object({
    excludedProductIds: z.array(z.string()),
    resultOverrides: z.array(QuizResultOverrideSchema)
})

export type QuizOverrides = z.infer<typeof QuizOverridesSchema>
