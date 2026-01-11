/**
 * Tagline types - Re-exported from schema with extensions
 * Single source of truth: src/schemas/tagline.schema.ts
 */

import type {
    Tagline as SchemaTagline,
    TaglineCategory as SchemaTaglineCategory,
    TaglinesArray as SchemaTaglinesArray
} from '@/schemas/tagline.schema'

// Re-export types from schema (single source of truth)
export type TaglineCategory = SchemaTaglineCategory
export type Tagline = SchemaTagline
export type TaglinesArray = SchemaTaglinesArray
