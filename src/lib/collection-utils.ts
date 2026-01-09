/**
 * Generic utility functions for collections with featured and priority properties
 * Used by categories, tags, and other similar entities
 */

/**
 * Base interface for items that can be featured and prioritized
 */
interface FeaturedPrioritizedItem {
    featured: boolean
    priority: number
    name: string
}

/**
 * Filter featured items
 */
export function getFeatured<T extends FeaturedPrioritizedItem>(items: T[]): T[] {
    return items.filter((item) => item.featured === true)
}

/**
 * Filter non-featured items
 */
export function getNonFeatured<T extends FeaturedPrioritizedItem>(items: T[]): T[] {
    return items.filter((item) => !item.featured)
}

/**
 * Sort items by priority (ascending), then alphabetically by name
 */
export function sortByPriority<T extends FeaturedPrioritizedItem>(items: T[]): T[] {
    return [...items].sort((a, b) => {
        // First sort by priority (lower number = higher priority)
        if (a.priority !== b.priority) {
            return a.priority - b.priority
        }
        // If priority is the same, sort alphabetically
        return a.name.localeCompare(b.name)
    })
}

/**
 * Get featured items sorted by priority, then alphabetically
 */
export function getFeaturedSorted<T extends FeaturedPrioritizedItem>(items: T[]): T[] {
    return sortByPriority(getFeatured(items))
}

/**
 * Get non-featured items sorted by priority, then alphabetically
 */
export function getNonFeaturedSorted<T extends FeaturedPrioritizedItem>(items: T[]): T[] {
    return sortByPriority(getNonFeatured(items))
}
