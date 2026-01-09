/**
 * Tag types - Re-exported from schema with extensions
 * Single source of truth: src/schemas/tag.schema.ts
 */

import type { Tag as SchemaTag, TagId as SchemaTagId } from '@/schemas/tag.schema'

// Re-export types from schema (single source of truth)
export type TagId = SchemaTagId
export type Tag = SchemaTag

// Additional types not defined in schema
export interface TagWithCount extends SchemaTag {
    count: number
}
