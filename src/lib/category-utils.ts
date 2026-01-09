/**
 * Category utility functions
 * Uses generic collection utilities from collection-utils.ts
 */

import type { Category } from '@/types/category'
import {
    getFeatured,
    getNonFeatured,
    sortByPriority,
    getFeaturedSorted,
    getNonFeaturedSorted
} from './collection-utils'

// Re-export generic functions with category-specific names for backwards compatibility
export function getFeaturedCategories<T extends Category>(categories: T[]): T[] {
    return getFeatured(categories)
}

export function getNonFeaturedCategories<T extends Category>(categories: T[]): T[] {
    return getNonFeatured(categories)
}

export function sortCategoriesByPriority<T extends Category>(categories: T[]): T[] {
    return sortByPriority(categories)
}

export function getFeaturedCategoriesSorted<T extends Category>(categories: T[]): T[] {
    return getFeaturedSorted(categories)
}

export function getNonFeaturedCategoriesSorted<T extends Category>(categories: T[]): T[] {
    return getNonFeaturedSorted(categories)
}
