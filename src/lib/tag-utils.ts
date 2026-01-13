/**
 * Tag utility functions
 */

import type { Tag, TagId } from '@/schemas/tag.schema'
import type { TagWithCount } from '@/types/tag-with-count.intf'
import type { Product } from '@/schemas/product.schema'

/**
 * Build tag data with product counts from products array
 * Products now use TagId[] directly, and tags.json is the source of truth
 */
export function buildTagsWithCounts(
    products: Product[],
    tagsMetadata: Record<TagId, Tag>
): TagWithCount[] {
    const tagCountMap = new Map<TagId, number>()

    // Count products per tag
    products.forEach((product) => {
        product.tags.forEach((tagId) => {
            tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1)
        })
    })

    // Build TagWithCount array from metadata
    return Object.values(tagsMetadata).map((tag) => ({
        ...tag,
        count: tagCountMap.get(tag.id) || 0
    }))
}

/**
 * Note: Generic tag operations (getFeatured, sortByPriority, etc.) are available
 * in collection-utils.ts. Import those directly instead of using wrapper functions.
 */
