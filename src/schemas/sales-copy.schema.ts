import { z } from 'zod'
import { StorytellingSchema } from './storytelling.schema.js'
import { ProductBenefitsSchema } from './product-benefits.schema.js'
import { TimelineSchema } from './timeline.schema.js'
import { CourseContentSchema } from './course-content.schema.js'

/**
 * Schema for the "How It Works" section
 * Allows per-sales-copy control over visibility, text, and media selection
 *
 * - null: Section is hidden entirely
 * - title null: Uses default "See How It Works"
 * - description null: Uses default subheading
 * - mediaIds []: Section shown with heading only, no media
 * - mediaIds ["id1", "id2"]: Displays specific media items in order
 */
export const HowItWorksSchema = z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    mediaIds: z.array(z.string())
})

/**
 * Schema for individual media section configuration
 * Used for main, secondary, and bonus media sections
 *
 * - show: true/false to show/hide the section
 * - title: Custom title (null = use default)
 * - description: Custom description (null = use default)
 * - mediaIds: null = auto (all from group), [] = none, [ids] = explicit selection
 */
export const MediaSectionConfigSchema = z.object({
    show: z.boolean(),
    title: z.string().nullable(),
    description: z.string().nullable(),
    mediaIds: z.array(z.string()).nullable()
})

/**
 * Container for all media section configurations
 * Each section can be null for complete auto behavior
 *
 * - null: Complete auto (show section with default heading, all media from group)
 * - { show: false, ... }: Hidden regardless of other fields
 * - { show: true, title: null, description: null, mediaIds: null }: Same as null (auto)
 * - { show: true, title: "Custom", ..., mediaIds: ["id1"] }: Full customization
 */
export const MediaSectionsSchema = z.object({
    main: MediaSectionConfigSchema.nullable(),
    secondary: MediaSectionConfigSchema.nullable(),
    bonus: MediaSectionConfigSchema.nullable()
})

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
 * - howItWorks: nullable (null = hidden, object = shown with config)
 * - mediaSections: nullable (null = complete auto for all sections)
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
 * - How It Works: howItWorks (nullable object with title, description, mediaIds)
 * - Media Sections: mediaSections (nullable object for main/secondary/bonus config)
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
    courseContent: CourseContentSchema.nullable(),

    // How It Works Section Configuration
    // Controls visibility, text, and media for the "How It Works" section on product pages
    // null = section hidden, object = section shown with configuration
    howItWorks: HowItWorksSchema.nullable(),

    // Media Sections Configuration
    // Per-product control over main, secondary, and bonus media carousel sections
    // null = complete auto behavior for all sections
    mediaSections: MediaSectionsSchema.nullable()
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
export type HowItWorks = z.infer<typeof HowItWorksSchema>
export type MediaSectionConfig = z.infer<typeof MediaSectionConfigSchema>
export type MediaSections = z.infer<typeof MediaSectionsSchema>
