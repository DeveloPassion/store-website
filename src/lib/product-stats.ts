import type { Product } from '@/schemas/product.schema'

export interface ProductStats {
    totalCustomers: number
    formattedCustomers: string
    totalTestimonials: number
    averageRating: number
    productsWithRatings: number
}

/**
 * Parse a userCount string like "2,000+ users" or "500+" into a number
 */
export function parseUserCount(userCount: string | undefined | null): number {
    if (!userCount) return 0
    const cleaned = userCount.replace(/,/g, '')
    const match = cleaned.match(/\d+/)
    return match ? parseInt(match[0], 10) : 0
}

/**
 * Format a number into a simplified display format:
 * - Under 1000: show as-is with + (e.g., "500+", "750+")
 * - 1000-1999: "1K+"
 * - 1500-1999: "1.5K+"
 * - 2000+: "2K+", "2.5K+", "3K+", etc.
 */
export function formatCustomerCount(count: number): string {
    if (count < 1000) {
        // Round down to nearest 50 for cleaner display
        const rounded = Math.floor(count / 50) * 50
        return rounded > 0 ? `${rounded}+` : '0'
    }

    // For 1000+, show in K format
    const thousands = count / 1000

    // Check if we should show .5K (e.g., 1.5K, 2.5K)
    const halfThousands = Math.floor(thousands * 2) / 2

    if (halfThousands === Math.floor(halfThousands)) {
        // Whole number (1K, 2K, 3K)
        return `${Math.floor(halfThousands)}K+`
    } else {
        // Half number (1.5K, 2.5K)
        return `${halfThousands}K+`
    }
}

/**
 * Calculate comprehensive product statistics
 */
export function calculateProductStats(products: Product[]): ProductStats {
    let totalCustomers = 0
    let totalTestimonials = 0
    let ratingSum = 0
    let productsWithRatings = 0

    for (const product of products) {
        // Sum up customer counts from userCount strings
        if (product.stats?.userCount) {
            totalCustomers += parseUserCount(product.stats.userCount)
        }

        // Count testimonials
        if (product.testimonials) {
            totalTestimonials += product.testimonials.length
        }

        // Calculate average rating from product.averageRating (computed from stats)
        if (product.averageRating) {
            ratingSum += product.averageRating
            productsWithRatings++
        }
    }

    const averageRating = productsWithRatings > 0 ? ratingSum / productsWithRatings : 0

    return {
        totalCustomers,
        formattedCustomers: formatCustomerCount(totalCustomers),
        totalTestimonials,
        averageRating,
        productsWithRatings
    }
}
