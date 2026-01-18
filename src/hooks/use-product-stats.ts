import { useMemo } from 'react'
import productsData from '@/data/products.json'
import type { Product } from '@/schemas/product.schema'
import { calculateProductStats, type ProductStats } from '@/lib/product-stats'

/**
 * Hook to get calculated product statistics
 * Provides memoized stats for total customers, testimonials, and ratings
 */
export function useProductStats(): ProductStats {
    return useMemo(() => {
        const products = productsData as Product[]
        return calculateProductStats(products)
    }, [])
}
