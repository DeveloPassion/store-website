import type { Category } from '@/types/category'

export function getFeaturedCategories<T extends Category>(categories: T[]): T[] {
    return categories.filter((cat) => cat.featured === true)
}

export function getNonFeaturedCategories<T extends Category>(categories: T[]): T[] {
    return categories.filter((cat) => !cat.featured)
}

/**
 * Sort categories by priority (ascending), then alphabetically by name
 */
export function sortCategoriesByPriority<T extends Category>(categories: T[]): T[] {
    return [...categories].sort((a, b) => {
        // First sort by priority (lower number = higher priority)
        if (a.priority !== b.priority) {
            return a.priority - b.priority
        }
        // If priority is the same, sort alphabetically
        return a.name.localeCompare(b.name)
    })
}

/**
 * Get featured categories sorted by priority, then alphabetically
 */
export function getFeaturedCategoriesSorted<T extends Category>(categories: T[]): T[] {
    return sortCategoriesByPriority(getFeaturedCategories(categories))
}

/**
 * Get non-featured categories sorted by priority, then alphabetically
 */
export function getNonFeaturedCategoriesSorted<T extends Category>(categories: T[]): T[] {
    return sortCategoriesByPriority(getNonFeaturedCategories(categories))
}
