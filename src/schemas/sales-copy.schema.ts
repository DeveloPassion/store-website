import { z } from 'zod'
import { StorytellingSchema } from './storytelling.schema.js'
import { ProductBenefitsSchema } from './product-benefits.schema.js'
import { TimelineSchema } from './timeline.schema.js'
import { CourseContentSchema } from './course-content.schema.js'

/**
 * Sales Copy Data Schema
 * Contains all marketing copy and storytelling for a product variant
 *
 * This schema is used in two contexts:
 * 1. Sales copy files: {product-id}-sales-copy-{variant}.json
 * 2. Aggregated products: products.json (nested as salesCopy object)
 *
 * All fields are strictly required except:
 * - secondaryTagline: nullable (can be null or string)
 * - SEO fields: required (keywords can be empty array)
 * - storytelling: nullable (can be null or StorytellingSchema object)
 * - timeline: nullable (can be null or TimelineSchema object)
 * - courseContent: nullable (can be null or CourseContentSchema object)
 *
 * Fields include:
 * - Identity: tagline, secondaryTagline
 * - PAS: problem, problemPoints, agitate, agitatePoints, solution, solutionPoints
 * - Content: description, features, benefits
 * - Audience: targetAudience, perfectFor, notForYou
 * - Trust: trustBadges, guarantees
 * - SEO: metaTitle, metaDescription, keywords
 * - Storytelling: all 6 sections (required but nullable)
 * - Timeline: transformation journey with time-based milestones
 * - Course Content: module/section structure for courses (required but nullable)
 */
export const SalesCopyDataSchema = z.object({
    // Identity
    tagline: z.string().min(1, 'Tagline is required'),
    secondaryTagline: z.string().nullable(),

    // Marketing Copy (PAS Framework) - All strictly required
    problem: z.string().min(1, 'Problem statement is required'),
    problemPoints: z.array(z.string()).min(1, 'At least one problem point is required'),
    agitate: z.string().min(1, 'Agitation statement is required'),
    agitatePoints: z.array(z.string()).min(1, 'At least one agitate point is required'),
    solution: z.string().min(1, 'Solution statement is required'),
    solutionPoints: z.array(z.string()).min(1, 'At least one solution point is required'),

    // Features & Benefits - All strictly required
    description: z.string().min(1, 'Description is required'),
    features: z.array(z.string()).min(1, 'At least one feature is required'),
    benefits: ProductBenefitsSchema, // All three benefit categories strictly required

    // Audience - All strictly required (empty arrays allowed)
    targetAudience: z.array(z.string()),
    perfectFor: z.array(z.string()),
    notForYou: z.array(z.string()),

    // Trust & Guarantees - All strictly required (empty arrays allowed)
    trustBadges: z.array(z.string()),
    guarantees: z.array(z.string()),

    // SEO - All strictly required (keywords can be empty array)
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string()),

    // Storytelling - Nullable (all 6 sections nullable within)
    storytelling: StorytellingSchema.nullable(),

    // Timeline - Nullable transformation journey showing time-based milestones
    timeline: TimelineSchema.nullable(),

    // Course Content - Nullable module/section structure for course products
    courseContent: CourseContentSchema.nullable()
})

/**
 * Sales Copy File Schema
 * Root structure for {product-id}-sales-copy-{variant}.json files
 *
 * Contains:
 * - id: Unique identifier for this sales copy variant (e.g., "default", "holiday-2026")
 * - salesCopy: All the marketing copy and storytelling data
 *
 * The variant name is inferred from the filename
 */
export const SalesCopyFileSchema = z.object({
    id: z.string().min(1, 'Sales copy ID is required'),
    salesCopy: SalesCopyDataSchema
})

// Export TypeScript types
export type SalesCopyData = z.infer<typeof SalesCopyDataSchema>
export type SalesCopyFile = z.infer<typeof SalesCopyFileSchema>
