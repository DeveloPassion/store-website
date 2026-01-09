import type { Tag, TagId, TagWithCount } from '@/types/tag'
import type { Product } from '@/types/product'

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
 * Filter featured tags
 */
export function getFeaturedTags<T extends Tag>(tags: T[]): T[] {
    return tags.filter((tag) => tag.featured === true)
}

/**
 * Filter non-featured tags
 */
export function getNonFeaturedTags<T extends Tag>(tags: T[]): T[] {
    return tags.filter((tag) => !tag.featured)
}

/**
 * Sort tags by priority (ascending), then alphabetically by name
 */
export function sortTagsByPriority<T extends Tag>(tags: T[]): T[] {
    return [...tags].sort((a, b) => {
        // First sort by priority (lower number = higher priority)
        if (a.priority !== b.priority) {
            return a.priority - b.priority
        }
        // If priority is the same, sort alphabetically
        return a.name.localeCompare(b.name)
    })
}

/**
 * Get featured tags sorted by priority, then alphabetically
 */
export function getFeaturedTagsSorted<T extends Tag>(tags: T[]): T[] {
    return sortTagsByPriority(getFeaturedTags(tags))
}

/**
 * Get non-featured tags sorted by priority, then alphabetically
 */
export function getNonFeaturedTagsSorted<T extends Tag>(tags: T[]): T[] {
    return sortTagsByPriority(getNonFeaturedTags(tags))
}
