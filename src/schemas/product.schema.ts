import { z } from 'zod'
import { CategoryIdSchema } from './category.schema.js'
import { TagIdSchema } from './tag.schema.js'
import { FAQSchema } from './faq.schema.js'
import { TestimonialSchema } from './testimonial.schema.js'
import { MediaItemSchema } from './media.schema.js'
import { SalesCopyDataSchema } from './sales-copy.schema.js'
import { StatsProofSchema } from './stats-proof.schema.js'

/**
 * Product Schemas - Separated for Individual and Aggregated Products
 * SINGLE SOURCE OF TRUTH for product types and validation
 * Last updated: 2026-01-13
 *
 * Architecture:
 * - BaseProductSchema: Common fields shared by both individual and aggregated schemas
 * - IndividualProductSchema: For <product>.json files (strict, no faqs/testimonials/media/sales copy)
 * - AggregatedProductSchema: For products.json (includes auto-loaded content)
 *
 * Key Differences:
 * - Individual files do NOT contain: faqs, testimonials, media, or salesCopy object (only activeSalesCopyId)
 * - Aggregated schema includes: faqs, testimonials, media, and salesCopy (loaded during aggregation)
 * - activeSalesCopyId is strictly required (non-nullable) in both schemas
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

/**
 * Base Product Schema - Common fields shared by both individual and aggregated schemas
 * These fields are present in both <product>.json files and the aggregated products.json
 */
const BaseProductSchema = z.object({
    // Identity
    id: z.string().min(1, 'Product ID is required'),
    name: z.string().min(1, 'Product name is required'),

    // Pricing - All strictly required (non-nullable)
    price: z.number().nonnegative('Price must be non-negative'),
    priceDisplay: z.string().min(1, 'Price display is required'),
    priceTier: PriceTierSchema,
    gumroadUrl: z.string().url('Gumroad URL must be a valid URL'),
    variants: z.array(ProductVariantSchema).nullable(),

    // Subscription - isSubscription is strictly required, others nullable
    isSubscription: z.boolean(),
    paymentFrequencies: z.array(PaymentFrequencySchema).nullable(),
    defaultPaymentFrequency: PaymentFrequencySchema.nullable(),

    // Taxonomy - All strictly required (multi-dimensional filtering)
    mainCategory: ProductCategorySchema,
    secondaryCategories: z.array(SecondaryCategorySchema), // Empty array if no secondary categories
    tags: z.array(TagIdSchema).min(1, 'At least one tag is required'),

    // Content - Strictly required
    included: z.array(z.string()).min(1, 'At least one included item is required'),

    // Social Proof - Required but nullable
    statsProof: StatsProofSchema.nullable(),

    // Links - Required but nullable (or empty string)
    landingPageUrl: z.string().url().nullable().or(z.literal('')),
    dsebastienUrl: z.string().url().nullable().or(z.literal('')),

    // Meta - All strictly required (non-nullable)
    featured: z.boolean(),
    bestValue: z.boolean(),
    bestseller: z.boolean(),
    priority: z.number().int().min(0).max(100, 'Priority must be between 0 and 100'),

    // Cross-sell - Strictly required (empty array if no cross-sell products)
    crossSellIds: z.array(z.string()),

    // Sales Copy Reference - Strictly required (non-nullable)
    // MUST reference a valid sales copy variant file
    activeSalesCopyId: z.string().min(1, 'Active sales copy ID is required')
})

/**
 * Individual Product Schema - For <product>.json files
 * Strict schema with no auto-loaded content (faqs, testimonials, media, sales copy fields)
 * Sales copy is referenced via activeSalesCopyId and loaded during aggregation
 * Individual files do NOT contain: faqs, testimonials, media arrays, or salesCopy object
 */
export const IndividualProductSchema = BaseProductSchema

/**
 * Aggregated Product Schema - For products.json
 * Includes auto-loaded content from separate files:
 * - faqs: Loaded from {product-id}-faq.json
 * - testimonials: Loaded from {product-id}-testimonials.json
 * - media: Loaded from {product-id}-media.json
 * - salesCopy: Loaded from {product-id}-sales-copy-{variant}.json
 */
export const AggregatedProductSchema = BaseProductSchema.extend({
    // Auto-loaded content (loaded during aggregation)
    faqs: z.array(FAQSchema), // Required (empty array if no FAQs)
    testimonials: z.array(TestimonialSchema), // Required (empty array if no testimonials)
    media: z.array(MediaItemSchema), // Required (empty array if no media)

    // Sales Copy Data - Loaded from sales copy file during aggregation
    // Strictly required (non-nullable) - aggregation fails if sales copy file is missing
    salesCopy: SalesCopyDataSchema
})

// Array schemas
export const IndividualProductsArraySchema = z.array(IndividualProductSchema)
export const AggregatedProductsArraySchema = z.array(AggregatedProductSchema)

// Export TypeScript types derived from Zod schemas
export type PriceTier = z.infer<typeof PriceTierSchema>
export type PaymentFrequency = z.infer<typeof PaymentFrequencySchema>
export type ProductCategory = z.infer<typeof ProductCategorySchema>
export type SecondaryCategory = z.infer<typeof SecondaryCategorySchema>
export type VariantPricing = z.infer<typeof VariantPricingSchema>
export type ProductVariant = z.infer<typeof ProductVariantSchema>

// Product types
export type IndividualProduct = z.infer<typeof IndividualProductSchema>
export type AggregatedProduct = z.infer<typeof AggregatedProductSchema>
export type IndividualProductsArray = z.infer<typeof IndividualProductsArraySchema>
export type AggregatedProductsArray = z.infer<typeof AggregatedProductsArraySchema>

// Convenience alias for most common use case
export type Product = AggregatedProduct
export type ProductsArray = AggregatedProductsArray
