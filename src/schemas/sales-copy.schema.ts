import { z } from 'zod'
import { StorytellingSchema } from './storytelling.schema.js'
import { ProductBenefitsSchema } from './product.schema.js'

/**
 * Sales Copy Data Schema
 * Contains all marketing copy and storytelling for a product variant
 *
 * Fields extracted from Product JSON:
 * - Identity: tagline, secondaryTagline
 * - PAS: problem, problemPoints, agitate, agitatePoints, solution, solutionPoints
 * - Content: description, features, benefits
 * - Trust: trustBadges, guarantees
 * - SEO: metaTitle, metaDescription, keywords
 * - Audience: perfectFor, notForYou, targetAudience
 * - Storytelling: all 6 sections (optional)
 */
export const SalesCopyDataSchema = z.object({
    // Identity
    tagline: z.string().min(1, 'Tagline is required'),
    secondaryTagline: z.string().optional(),

    // Marketing Copy (PAS Framework)
    problem: z.string().min(1, 'Problem statement is required'),
    problemPoints: z.array(z.string()).min(1, 'At least one problem point is required'),
    agitate: z.string().min(1, 'Agitation statement is required'),
    agitatePoints: z.array(z.string()).min(1, 'At least one agitate point is required'),
    solution: z.string().min(1, 'Solution statement is required'),
    solutionPoints: z.array(z.string()).min(1, 'At least one solution point is required'),

    // Features & Benefits
    description: z.string().min(1, 'Description is required'),
    features: z.array(z.string()).min(1, 'At least one feature is required'),
    benefits: ProductBenefitsSchema,

    // Content
    targetAudience: z.array(z.string()),
    perfectFor: z.array(z.string()),
    notForYou: z.array(z.string()),

    // Trust & Guarantees
    trustBadges: z.array(z.string()),
    guarantees: z.array(z.string()),

    // SEO
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),

    // Storytelling (all sections optional)
    storytelling: StorytellingSchema.optional()
})

/**
 * Sales Copy File Schema
 * Root structure for {product-id}-sales-copy-{variant}.json files
 *
 * Contains:
 * - id: Unique identifier for this sales copy variant
 * - salesCopy: All the marketing copy and storytelling data
 *
 * The variant name is inferred from the filename (e.g., "default" from "-sales-copy-default.json")
 */
export const SalesCopyFileSchema = z.object({
    id: z.string().min(1, 'Sales copy ID is required'),
    salesCopy: SalesCopyDataSchema
})

// Export TypeScript types
export type SalesCopyData = z.infer<typeof SalesCopyDataSchema>
export type SalesCopyFile = z.infer<typeof SalesCopyFileSchema>
