import type { Product } from '@/types/product'

/**
 * Fisher-Yates shuffle algorithm for randomizing arrays
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
 * Sort products by priority (highest to lowest), with random order for products with equal priority
 * @param products - Array of products to sort
 * @returns Sorted array with randomization within priority groups
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
