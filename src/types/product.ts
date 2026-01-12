/**
 * Product types - Re-exported from schema
 * Single source of truth: src/schemas/product.schema.ts
 */

// Re-export types from schema (single source of truth)
export type {
    PriceTier,
    ProductCategory,
    SecondaryCategory,
    ProductVariant,
    ProductBenefits,
    StatsProof,
    Product,
    ProductsArray
} from '@/schemas/product.schema'

// Re-export media types from media schema
export type { MediaType, MediaGroup, MediaItem } from '@/schemas/media.schema'
