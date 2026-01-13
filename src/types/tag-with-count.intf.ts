/**
 * TagWithCount interface - Extension of Tag with count property
 * Base type: src/schemas/tag.schema.ts
 */

import type { Tag } from '@/schemas/tag.schema'

export interface TagWithCount extends Tag {
    count: number
}
