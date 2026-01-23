import type { Product } from '@/schemas/product.schema'
import type { QuizFilters, QuizOptionFilters, QuizResultOverride } from '@/schemas/quiz.schema'

/**
 * Quiz Matching Utility
 *
 * Simple category-based product matching:
 * 1. Filter products by category match (mainCategory or secondaryCategories)
 * 2. Filter by experience level, price tier, delivery style
 * 3. Sort by: mainCategory match > featured > bestValue > bestseller > priority
 */

/**
 * Create empty quiz filters
 */
export function createEmptyFilters(): QuizFilters {
    return {
        categories: [],
        experienceLevel: null,
        priceTiers: [],
        deliveryStyle: null
    }
}

/**
 * Merge option filters into accumulated filters
 * - categories: union
 * - experienceLevel: last non-null wins
 * - priceTiers: union
 * - deliveryStyle: last non-null wins
 */
export function mergeFilters(accumulated: QuizFilters, option: QuizOptionFilters): QuizFilters {
    const result = { ...accumulated }

    // Merge categories (union, no duplicates)
    if (option.categories) {
        const categorySet = new Set([...accumulated.categories, ...option.categories])
        result.categories = Array.from(categorySet)
    }

    // Experience level: last non-null wins
    if (option.experienceLevel !== undefined) {
        result.experienceLevel = option.experienceLevel
    }

    // Merge price tiers (union, no duplicates)
    if (option.priceTiers) {
        const priceTierSet = new Set([...accumulated.priceTiers, ...option.priceTiers])
        result.priceTiers = Array.from(priceTierSet)
    }

    // Delivery style: last non-null wins
    if (option.deliveryStyle !== undefined) {
        result.deliveryStyle = option.deliveryStyle
    }

    return result
}

/**
 * Check if a product matches the category filter
 * Returns: 'main' if mainCategory matches, 'secondary' if a secondary matches, null if no match
 */
function getCategoryMatch(product: Product, categories: string[]): 'main' | 'secondary' | null {
    if (categories.length === 0) {
        // No category filter = match all
        return 'main'
    }

    if (categories.includes(product.mainCategory)) {
        return 'main'
    }

    for (const secondary of product.secondaryCategories) {
        if (categories.includes(secondary.id)) {
            return 'secondary'
        }
    }

    return null
}

/**
 * Check if a product matches the experience level filter
 */
function matchesExperienceLevel(product: Product, experienceLevel: string | null): boolean {
    if (!experienceLevel) {
        // No filter = match all
        return true
    }

    const productLevel = product.targetExperienceLevel

    // 'all-levels' matches any filter
    if (productLevel === 'all-levels') {
        return true
    }

    // Exact match
    if (productLevel === experienceLevel) {
        return true
    }

    // Allow intermediate products for advanced users
    if (experienceLevel === 'advanced' && productLevel === 'intermediate') {
        return true
    }

    // Allow beginner products for intermediate users
    if (experienceLevel === 'intermediate' && productLevel === 'beginner') {
        return true
    }

    return false
}

/**
 * Check if a product matches the price tier filter
 */
function matchesPriceTier(product: Product, priceTiers: string[]): boolean {
    if (priceTiers.length === 0) {
        // No filter = match all
        return true
    }

    return priceTiers.includes(product.priceTier)
}

/**
 * Check if a product matches the delivery style filter
 */
function matchesDeliveryStyle(product: Product, deliveryStyle: string | null): boolean {
    if (!deliveryStyle) {
        // No filter = match all
        return true
    }

    const productStyle = product.deliveryStyle

    // Exact match
    if (productStyle === deliveryStyle) {
        return true
    }

    // 'hybrid' matches both preferences
    if (productStyle === 'hybrid') {
        return true
    }

    return false
}

/**
 * Match and rank products based on quiz filters
 *
 * @param products - All available products
 * @param filters - Accumulated filters from quiz answers
 * @param excludedIds - Product IDs to exclude
 * @returns Sorted array of matching product IDs
 */
export function matchProducts(
    products: Product[],
    filters: QuizFilters,
    excludedIds: string[] = []
): string[] {
    const excludedSet = new Set(excludedIds)

    // Score and filter products
    const scored: Array<{
        id: string
        categoryMatch: 'main' | 'secondary'
        featured: boolean
        bestValue: boolean
        bestseller: boolean
        priority: number
    }> = []

    for (const product of products) {
        // Skip excluded products
        if (excludedSet.has(product.id)) {
            continue
        }

        // Check category match
        const categoryMatch = getCategoryMatch(product, filters.categories)
        if (!categoryMatch) {
            continue
        }

        // Check other filters
        if (!matchesExperienceLevel(product, filters.experienceLevel)) {
            continue
        }

        if (!matchesPriceTier(product, filters.priceTiers)) {
            continue
        }

        if (!matchesDeliveryStyle(product, filters.deliveryStyle)) {
            continue
        }

        scored.push({
            id: product.id,
            categoryMatch,
            featured: product.featured,
            bestValue: product.bestValue,
            bestseller: product.bestseller,
            priority: product.priority
        })
    }

    // Sort by: mainCategory match > featured > bestValue > bestseller > priority
    scored.sort((a, b) => {
        // Main category match first
        if (a.categoryMatch !== b.categoryMatch) {
            return a.categoryMatch === 'main' ? -1 : 1
        }

        // Featured first
        if (a.featured !== b.featured) {
            return a.featured ? -1 : 1
        }

        // Best value first
        if (a.bestValue !== b.bestValue) {
            return a.bestValue ? -1 : 1
        }

        // Bestseller first
        if (a.bestseller !== b.bestseller) {
            return a.bestseller ? -1 : 1
        }

        // Higher priority first
        return b.priority - a.priority
    })

    return scored.map((s) => s.id)
}

/**
 * Check if user's filters meet override conditions
 */
function checkOverrideConditions(
    filters: QuizFilters,
    conditions: QuizResultOverride['conditions']
): boolean {
    // Check hasCategories - all specified categories must be in user's selection
    if (conditions.hasCategories && conditions.hasCategories.length > 0) {
        for (const cat of conditions.hasCategories) {
            if (!filters.categories.includes(cat)) {
                return false
            }
        }
    }

    // Check experience level
    if (conditions.experienceLevel !== undefined) {
        if (filters.experienceLevel !== conditions.experienceLevel) {
            return false
        }
    }

    // Check hasPriceTiers - all specified tiers must be in user's selection
    if (conditions.hasPriceTiers && conditions.hasPriceTiers.length > 0) {
        for (const tier of conditions.hasPriceTiers) {
            if (!filters.priceTiers.includes(tier)) {
                return false
            }
        }
    }

    // Check delivery style
    if (conditions.deliveryStyle !== undefined) {
        if (filters.deliveryStyle !== conditions.deliveryStyle) {
            return false
        }
    }

    return true
}

/**
 * Apply result overrides to recommendations
 */
export function applyResultOverrides(
    recommendations: string[],
    filters: QuizFilters,
    overrides: QuizResultOverride[],
    allProducts: Product[]
): string[] {
    // Sort overrides by priority (ascending, higher priority applies last)
    const sortedOverrides = [...overrides].sort((a, b) => a.priority - b.priority)

    let result = [...recommendations]

    // Build set of valid product IDs
    const validProductIds = new Set(allProducts.map((p) => p.id))

    for (const override of sortedOverrides) {
        if (!checkOverrideConditions(filters, override.conditions)) {
            continue
        }

        // Apply setProducts (replaces entirely)
        if (override.setProducts !== null) {
            result = override.setProducts.filter((id) => validProductIds.has(id))
        }

        // Apply removeProducts
        if (override.removeProducts.length > 0) {
            const removeSet = new Set(override.removeProducts)
            result = result.filter((id) => !removeSet.has(id))
        }

        // Apply addProducts (prepend)
        if (override.addProducts.length > 0) {
            const existingSet = new Set(result)
            const toAdd = override.addProducts.filter(
                (id) => validProductIds.has(id) && !existingSet.has(id)
            )
            result = [...toAdd, ...result]
        }
    }

    return result
}
