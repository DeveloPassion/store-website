import { z } from 'zod'
import { CategoryIdSchema } from './category.schema.js'
import { TagIdSchema } from './tag.schema.js'
import { FAQSchema } from './faq.schema.js'
import { TestimonialSchema } from './testimonial.schema.js'

/**
 * Zod schema for product validation
 * SINGLE SOURCE OF TRUTH for product types and validation
 * Last updated: 2026-01-09
 *
 * This schema validates products.json entries to ensure data integrity.
 * TypeScript types are exported from this file and re-exported by src/types/product.ts
 */

export const PriceTierSchema = z.enum([
    'free',
    'budget',
    'standard',
    'premium',
    'enterprise',
    'subscription'
])

export const PaymentFrequencySchema = z.enum(['monthly', 'yearly', 'biennial', 'one-time'])

// Categories are now defined in category.schema.ts (single source of truth)
export const ProductCategorySchema = CategoryIdSchema

// Secondary category with optional distant flag
export const SecondaryCategorySchema = z.object({
    id: CategoryIdSchema,
    distant: z.boolean().optional()
})

// Pricing per payment frequency for subscription variants
export const VariantPricingSchema = z.object({
    monthly: z.number().optional(),
    yearly: z.number().optional(),
    biennial: z.number().optional(),
    oneTime: z.number().optional()
})

export const ProductVariantSchema = z.object({
    name: z.string(),
    price: z.number(), // Base price (typically monthly for subscriptions)
    priceDisplay: z.string(),
    description: z.string(),
    gumroadUrl: z.string().url(),
    gumroadVariantId: z.string().optional(),
    paymentFrequency: PaymentFrequencySchema.optional(),
    prices: VariantPricingSchema.optional() // Per-frequency pricing for accurate savings calculation
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

    // Subscription
    isSubscription: z.boolean().optional(),
    paymentFrequencies: z.array(PaymentFrequencySchema).optional(),
    defaultPaymentFrequency: PaymentFrequencySchema.optional(),

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
    testimonials: z.array(TestimonialSchema).optional(),
    statsProof: StatsProofSchema.optional(),

    // Media
    coverImage: z.string().optional(),
    screenshots: z.array(z.string()).optional(),
    videoUrl: z.string().url().optional().or(z.literal('')),
    demoUrl: z.string().url().optional().or(z.literal('')),

    // Content
    faqs: z.array(FAQSchema).optional(),
    targetAudience: z.array(z.string()),
    perfectFor: z.array(z.string()),
    notForYou: z.array(z.string()),

    // Links
    landingPageUrl: z.string().url().optional().or(z.literal('')),
    dsebastienUrl: z.string().url().optional().or(z.literal('')),

    // Meta
    featured: z.boolean(),
    bestValue: z.boolean(),
    bestseller: z.boolean(),
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
export type PaymentFrequency = z.infer<typeof PaymentFrequencySchema>
export type ProductCategory = z.infer<typeof ProductCategorySchema>
export type SecondaryCategory = z.infer<typeof SecondaryCategorySchema>
export type VariantPricing = z.infer<typeof VariantPricingSchema>
export type ProductVariant = z.infer<typeof ProductVariantSchema>
export type ProductBenefits = z.infer<typeof ProductBenefitsSchema>
export type StatsProof = z.infer<typeof StatsProofSchema>
export type Product = z.infer<typeof ProductSchema>
export type ProductsArray = z.infer<typeof ProductsArraySchema>
