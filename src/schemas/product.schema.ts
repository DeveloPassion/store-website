import { z } from 'zod'
import { CategoryIdSchema } from './category.schema.js'
import { TagIdSchema } from './tag.schema.js'

/**
 * Zod schema for product validation
 * Source of truth: src/types/product.ts
 * Last updated: 2026-01-08
 *
 * This schema validates products.json entries to ensure data integrity.
 * Keep this schema in sync with the TypeScript types in src/types/product.ts
 */

export const PriceTierSchema = z.enum([
    'free',
    'budget',
    'standard',
    'premium',
    'enterprise',
    'subscription'
])

// Categories are now defined in category.schema.ts (single source of truth)
export const ProductCategorySchema = CategoryIdSchema

// Secondary category with optional distant flag
export const SecondaryCategorySchema = z.object({
    id: CategoryIdSchema,
    distant: z.boolean().optional()
})

export const ProductStatusSchema = z.enum(['active', 'coming-soon', 'archived'])

export const ProductVariantSchema = z.object({
    name: z.string(),
    price: z.number(),
    priceDisplay: z.string(),
    description: z.string(),
    gumroadUrl: z.string().url()
})

export const ProductBenefitsSchema = z.object({
    immediate: z.array(z.string()).optional(),
    systematic: z.array(z.string()).optional(),
    longTerm: z.array(z.string()).optional()
})

export const StatsProofSchema = z.object({
    userCount: z.string().optional(),
    timeSaved: z.string().optional(),
    rating: z.string().optional()
})

export const ProductSchema = z.object({
    // Identity
    id: z.string().min(1, 'Product ID is required'),
    permalink: z.string().min(1, 'Permalink is required'),
    name: z.string().min(1, 'Product name is required'),
    tagline: z.string().min(1, 'Tagline is required'),
    secondaryTagline: z.string().optional(),

    // Pricing
    price: z.number().nonnegative('Price must be non-negative'),
    priceDisplay: z.string().min(1, 'Price display is required'),
    priceTier: PriceTierSchema,
    gumroadUrl: z.string().url('Gumroad URL must be a valid URL'),
    variants: z.array(ProductVariantSchema).optional(),

    // Taxonomy (multi-dimensional filtering)
    mainCategory: ProductCategorySchema,
    secondaryCategories: z.array(SecondaryCategorySchema),
    tags: z.array(TagIdSchema).min(1, 'At least one tag is required'),

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
    included: z.array(z.string()).min(1, 'At least one included item is required'),

    // Social Proof
    testimonialIds: z.array(z.string()),
    statsProof: StatsProofSchema.optional(),

    // Media
    coverImage: z.string().optional(),
    screenshots: z.array(z.string()).optional(),
    videoUrl: z.string().url().optional().or(z.literal('')),
    demoUrl: z.string().url().optional().or(z.literal('')),

    // Content
    faqIds: z.array(z.string()),
    targetAudience: z.array(z.string()),
    perfectFor: z.array(z.string()),
    notForYou: z.array(z.string()),

    // Links
    landingPageUrl: z.string().url().optional().or(z.literal('')),
    dsebastienUrl: z.string().url().optional().or(z.literal('')),

    // Meta
    featured: z.boolean(),
    mostValue: z.boolean(),
    status: ProductStatusSchema,
    priority: z.number().int().min(0).max(100, 'Priority must be between 0 and 100'),

    // Trust & Guarantees
    trustBadges: z.array(z.string()),
    guarantees: z.array(z.string()),

    // Cross-sell
    crossSellIds: z.array(z.string()),

    // SEO
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional()
})

export const ProductsArraySchema = z.array(ProductSchema)

// Export TypeScript types derived from Zod schemas
export type PriceTier = z.infer<typeof PriceTierSchema>
export type ProductCategory = z.infer<typeof ProductCategorySchema>
export type SecondaryCategory = z.infer<typeof SecondaryCategorySchema>
export type ProductStatus = z.infer<typeof ProductStatusSchema>
export type ProductVariant = z.infer<typeof ProductVariantSchema>
export type ProductBenefits = z.infer<typeof ProductBenefitsSchema>
export type StatsProof = z.infer<typeof StatsProofSchema>
export type Product = z.infer<typeof ProductSchema>
export type ProductsArray = z.infer<typeof ProductsArraySchema>
