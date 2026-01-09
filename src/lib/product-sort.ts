import type { Product } from '@/types/product'

/**
 * Fisher-Yates shuffle algorithm for randomizing arrays
 * @param array - Array to shuffle
 * @returns Shuffled copy of the array
 */
function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
    }
    return shuffled
}

/**
 * Sort array alphabetically by mainCategory
 * @param products - Array of products to sort
 * @returns Sorted array by mainCategory
 */
function sortByMainCategory(products: Product[]): Product[] {
    return [...products].sort((a, b) => a.mainCategory.localeCompare(b.mainCategory))
}

/**
 * Sort products by priority (highest to lowest), with random order for products with equal priority
 * @param products - Array of products to sort
 * @returns Sorted array with randomization within priority groups
 * @deprecated Use sortProductsIntelligently() for better UX. This function is kept for backward compatibility.
 */
export function sortProductsByPriority(products: Product[]): Product[] {
    // Group products by priority
    const priorityGroups = new Map<number, Product[]>()

    products.forEach((product) => {
        const priority = product.priority || 0
        if (!priorityGroups.has(priority)) {
            priorityGroups.set(priority, [])
        }
        priorityGroups.get(priority)!.push(product)
    })

    // Sort priority levels from highest to lowest
    const sortedPriorities = Array.from(priorityGroups.keys()).sort((a, b) => b - a)

    // Build result by randomizing within each priority group
    const result: Product[] = []
    sortedPriorities.forEach((priority) => {
        const group = priorityGroups.get(priority)!
        const shuffledGroup = shuffle(group)
        result.push(...shuffledGroup)
    })

    return result
}

/**
 * Sort products intelligently by featured status, bestseller, and main category
 * Ideal for: homepage, products page, category pages, tag pages
 * @param products - Array of products to sort
 * @returns Sorted array in 5 tiers:
 *   1. Featured + Best Value + Bestseller
 *   2. Featured + Best Value
 *   3. Featured + Bestseller
 *   4. Featured only
 *   5. Rest alphabetically by mainCategory
 */
export function sortProductsIntelligently(products: Product[]): Product[] {
    // Group products into five tiers
    const tier1: Product[] = [] // Featured + Best Value + Bestseller
    const tier2: Product[] = [] // Featured + Best Value (no Bestseller)
    const tier3: Product[] = [] // Featured + Bestseller (no Best Value)
    const tier4: Product[] = [] // Featured only (no Best Value, no Bestseller)
    const tier5: Product[] = [] // Rest

    products.forEach((product) => {
        if (product.featured && product.mostValue && product.bestseller) {
            tier1.push(product)
        } else if (product.featured && product.mostValue) {
            tier2.push(product)
        } else if (product.featured && product.bestseller) {
            tier3.push(product)
        } else if (product.featured) {
            tier4.push(product)
        } else {
            tier5.push(product)
        }
    })

    // Sort each tier
    // Tiers 1-4: Randomize to give variety
    const sortedTier1 = shuffle(tier1)
    const sortedTier2 = shuffle(tier2)
    const sortedTier3 = shuffle(tier3)
    const sortedTier4 = shuffle(tier4)

    // Tier 5: Sort alphabetically by mainCategory for easy browsing
    const sortedTier5 = sortByMainCategory(tier5)

    // Combine all tiers in order
    return [...sortedTier1, ...sortedTier2, ...sortedTier3, ...sortedTier4, ...sortedTier5]
}

/**
 * Sort best value products intelligently
 * Ideal for: most-value page, best value sections
 * @param products - Array of products to sort
 * @returns Sorted array in 5 tiers:
 *   1. Featured + Best Value + Bestseller
 *   2. Featured + Best Value
 *   3. Best Value + Bestseller
 *   4. Best Value only
 *   5. Rest alphabetically by mainCategory
 */
export function sortBestValueProducts(products: Product[]): Product[] {
    // Group products into five tiers
    const tier1: Product[] = [] // Featured + Best Value + Bestseller
    const tier2: Product[] = [] // Featured + Best Value (no Bestseller)
    const tier3: Product[] = [] // Best Value + Bestseller (no Featured)
    const tier4: Product[] = [] // Best Value only (no Featured, no Bestseller)
    const tier5: Product[] = [] // Rest

    products.forEach((product) => {
        if (product.featured && product.mostValue && product.bestseller) {
            tier1.push(product)
        } else if (product.featured && product.mostValue) {
            tier2.push(product)
        } else if (product.mostValue && product.bestseller) {
            tier3.push(product)
        } else if (product.mostValue) {
            tier4.push(product)
        } else {
            tier5.push(product)
        }
    })

    // Sort each tier
    // Tiers 1-4: Randomize to give variety
    const sortedTier1 = shuffle(tier1)
    const sortedTier2 = shuffle(tier2)
    const sortedTier3 = shuffle(tier3)
    const sortedTier4 = shuffle(tier4)

    // Tier 5: Sort alphabetically by mainCategory for easy browsing
    const sortedTier5 = sortByMainCategory(tier5)

    // Combine all tiers in order
    return [...sortedTier1, ...sortedTier2, ...sortedTier3, ...sortedTier4, ...sortedTier5]
}

/**
 * Sort featured products intelligently
 * Ideal for: featured product sections on homepage, category pages, tag pages
 * @param products - Array of products to sort (typically already filtered to featured products)
 * @returns Sorted array in 4 tiers:
 *   1. Featured + Best Value + Bestseller
 *   2. Featured + Best Value
 *   3. Featured + Bestseller
 *   4. Featured only
 */
export function sortFeaturedProducts(products: Product[]): Product[] {
    // Group products into four tiers
    const tier1: Product[] = [] // Featured + Best Value + Bestseller
    const tier2: Product[] = [] // Featured + Best Value (no Bestseller)
    const tier3: Product[] = [] // Featured + Bestseller (no Best Value)
    const tier4: Product[] = [] // Featured only (no Best Value, no Bestseller)

    products.forEach((product) => {
        if (product.featured && product.mostValue && product.bestseller) {
            tier1.push(product)
        } else if (product.featured && product.mostValue) {
            tier2.push(product)
        } else if (product.featured && product.bestseller) {
            tier3.push(product)
        } else if (product.featured) {
            tier4.push(product)
        }
    })

    // Sort each tier - randomize to give variety
    const sortedTier1 = shuffle(tier1)
    const sortedTier2 = shuffle(tier2)
    const sortedTier3 = shuffle(tier3)
    const sortedTier4 = shuffle(tier4)

    // Combine all tiers in order
    return [...sortedTier1, ...sortedTier2, ...sortedTier3, ...sortedTier4]
}
