import type { Tag, TagWithCount } from '@/types/tag'
import type { Product } from '@/types/product'

/**
 * Normalize tag string to ID format (lowercase, hyphens)
 */
export function normalizeTagId(tag: string): string {
    return tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

/**
 * Get tag metadata by tag string (normalizes before lookup)
 * Returns null if no metadata found
 */
export function getTagMetadata(tagString: string, tagsMetadata: Record<string, Tag>): Tag | null {
    const normalized = normalizeTagId(tagString)
    return tagsMetadata[normalized] || null
}

/**
 * Build tag data with product counts from products array
 * Only includes tags that have metadata entries
 */
export function buildTagsWithCounts(
    products: Product[],
    tagsMetadata: Record<string, Tag>
): TagWithCount[] {
    const tagCountMap = new Map<string, number>()

    // Count products per tag
    products.forEach((product) => {
        product.tags.forEach((tag) => {
            const normalized = normalizeTagId(tag)
            // Only count tags that have metadata
            if (tagsMetadata[normalized]) {
                tagCountMap.set(normalized, (tagCountMap.get(normalized) || 0) + 1)
            }
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
