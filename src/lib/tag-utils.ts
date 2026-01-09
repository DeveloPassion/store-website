/**
 * Tag utility functions
 * Uses generic collection utilities from collection-utils.ts
 */

import type { Tag, TagId, TagWithCount } from '@/types/tag'
import type { Product } from '@/types/product'
import {
    getFeatured,
    getNonFeatured,
    sortByPriority,
    getFeaturedSorted,
    getNonFeaturedSorted
} from './collection-utils'

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

// Re-export generic functions with tag-specific names for backwards compatibility
export function getFeaturedTags<T extends Tag>(tags: T[]): T[] {
    return getFeatured(tags)
}

export function getNonFeaturedTags<T extends Tag>(tags: T[]): T[] {
    return getNonFeatured(tags)
}

export function sortTagsByPriority<T extends Tag>(tags: T[]): T[] {
    return sortByPriority(tags)
}

export function getFeaturedTagsSorted<T extends Tag>(tags: T[]): T[] {
    return getFeaturedSorted(tags)
}

export function getNonFeaturedTagsSorted<T extends Tag>(tags: T[]): T[] {
    return getNonFeaturedSorted(tags)
}
