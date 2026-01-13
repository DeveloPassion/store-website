/**
 * Product types - Re-exported from schema
 * Single source of truth: src/schemas/product.schema.ts
 */

// Re-export types from schema (single source of truth)
export type {
    PriceTier,
    PaymentFrequency,
    ProductCategory,
    SecondaryCategory,
    VariantPricing,
    ProductVariant,
    ProductBenefits,
    StatsProof,
    IndividualProduct,
    AggregatedProduct,
    IndividualProductsArray,
    AggregatedProductsArray,
    Product,
    ProductsArray
} from '@/schemas/product.schema'

// Re-export media types from media schema
export type { MediaType, MediaGroup, MediaItem } from '@/schemas/media.schema'

// Re-export FAQ types from faq schema
export type { FAQ } from '@/schemas/faq.schema'

// Re-export testimonial types from testimonial schema
export type { Testimonial } from '@/schemas/testimonial.schema'

// Re-export sales copy types from sales-copy schema
export type { SalesCopyData, SalesCopyFile } from '@/schemas/sales-copy.schema'
