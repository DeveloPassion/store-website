/**
 * Shared product search utility using fuzzy search
 *
 * Provides consistent, typo-tolerant search across all product search interfaces
 */

import { fuzzySearch, type FuzzySearchConfig } from '@/lib/fuzzy-search'
import type { Product } from '@/schemas/product.schema'

/**
 * Field names that can be searched in a product
 */
type ProductSearchField = 'name' | 'tagline' | 'description' | 'tags' | 'mainCategory'

/**
 * Standard field weights for product search
 * Higher weights = more importance in ranking
 */
export const PRODUCT_SEARCH_CONFIG: FuzzySearchConfig<ProductSearchField> = {
    fields: {
        name: { weight: 5 },
        tagline: { weight: 3 },
        description: { weight: 2 },
        tags: { weight: 2 },
        mainCategory: { weight: 1 }
    }
}

/**
 * Get field value from a product for search
 */
function getProductFieldValue(
    product: Product,
    field: ProductSearchField
): string | string[] | null {
    switch (field) {
        case 'name':
            return product.name
        case 'tagline':
            return product.salesCopy?.tagline ?? null
        case 'description':
            return product.salesCopy?.description ?? null
        case 'tags':
            return product.tags
        case 'mainCategory':
            return product.mainCategory
        default:
            return null
    }
}

/**
 * Search products using fuzzy search
 *
 * Returns products that match the query, sorted by relevance.
 * Returns empty array if query is empty.
 *
 * @param products - The products to search through
 * @param query - The search query
 * @returns Sorted array of matching products (best matches first)
 *
 * @example
 * ```ts
 * // Finds "Obsidian Starter Kit" with typo-tolerant search
 * const results = searchProducts(products, 'obsk')
 *
 * // Can also handle typos
 * const results = searchProducts(products, 'templt')
 * ```
 */
export function searchProducts(products: Product[], query: string): Product[] {
    return fuzzySearch(products, query, PRODUCT_SEARCH_CONFIG, getProductFieldValue)
}
