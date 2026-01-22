import { useMemo } from 'react'
import type { Product, PriceTier } from '@/schemas/product.schema'
import type { CategoryId } from '@/schemas/category.schema'
import type { TagId } from '@/schemas/tag.schema'
import type {
    ProductsFilterState,
    FilterCounts,
    PriceRange,
    ActiveFilter
} from '@/types/products-filter'
import { PRICE_TIER_LABELS } from '@/types/products-filter'
import { simpleFuzzySearch } from '@/lib/fuzzy-search'
import { sortProducts } from '@/lib/product-sort'
import categoriesData from '@/data/categories.json'
import tagsData from '@/data/tags.json'
import type { Category } from '@/schemas/category.schema'
import type { Tag } from '@/schemas/tag.schema'

interface UseProductsFilterLogicOptions {
    products: Product[]
    filterState: ProductsFilterState
}

/**
 * Custom hook for applying filters and computing filter-related data
 */
export function useProductsFilterLogic({ products, filterState }: UseProductsFilterLogicOptions) {
    const categories = categoriesData as Category[]
    const tags = tagsData as Record<TagId, Tag>

    // Compute price range from all products
    const priceRange: PriceRange = useMemo(() => {
        if (products.length === 0) {
            return { min: 0, max: 100 }
        }

        const prices = products.map((p) => p.price)
        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices))
        }
    }, [products])

    // Apply all filters to get filtered products
    const filteredProducts = useMemo(() => {
        // Start with search if query exists (search on product name only)
        let result = filterState.searchQuery
            ? simpleFuzzySearch(products, filterState.searchQuery, (product) => product.name)
            : products

        // Category filter (matches mainCategory or any secondaryCategory)
        if (filterState.selectedCategories.length > 0) {
            result = result.filter((product) => {
                const allCategories = [
                    product.mainCategory,
                    ...product.secondaryCategories.map((sc) => sc.id)
                ]
                return filterState.selectedCategories.some((cat) => allCategories.includes(cat))
            })
        }

        // Tag filter (matches any selected tag)
        if (filterState.selectedTags.length > 0) {
            result = result.filter((product) => {
                return filterState.selectedTags.some((tag) => product.tags.includes(tag))
            })
        }

        // Price tier filter
        if (filterState.selectedTiers.length > 0) {
            result = result.filter((product) => {
                return filterState.selectedTiers.includes(product.priceTier)
            })
        }

        // Price range filter
        if (filterState.minPrice !== null) {
            result = result.filter((product) => product.price >= filterState.minPrice!)
        }

        if (filterState.maxPrice !== null) {
            result = result.filter((product) => product.price <= filterState.maxPrice!)
        }

        // Boolean flag filters
        if (filterState.showBestValueOnly) {
            result = result.filter((product) => product.bestValue)
        }

        if (filterState.showBestsellerOnly) {
            result = result.filter((product) => product.bestseller)
        }

        if (filterState.showFeaturedOnly) {
            result = result.filter((product) => product.featured)
        }

        return result
    }, [products, filterState])

    // Sort filtered products
    const sortedProducts = useMemo(() => {
        return sortProducts(filteredProducts, filterState.sortBy)
    }, [filteredProducts, filterState.sortBy])

    // Compute filter counts (how many products per option)
    // Uses all products (not filtered) to show total counts
    const filterCounts: FilterCounts = useMemo(() => {
        const categoryCount: Record<CategoryId, number> = {} as Record<CategoryId, number>
        const tagCount: Record<TagId, number> = {} as Record<TagId, number>
        const tierCount: Record<PriceTier, number> = {} as Record<PriceTier, number>

        products.forEach((product) => {
            // Count categories (main + secondary)
            const allCategories = [
                product.mainCategory,
                ...product.secondaryCategories.map((sc) => sc.id)
            ]
            allCategories.forEach((cat) => {
                categoryCount[cat] = (categoryCount[cat] || 0) + 1
            })

            // Count tags
            product.tags.forEach((tag) => {
                tagCount[tag] = (tagCount[tag] || 0) + 1
            })

            // Count price tiers
            tierCount[product.priceTier] = (tierCount[product.priceTier] || 0) + 1
        })

        return {
            categories: categoryCount,
            tags: tagCount,
            tiers: tierCount
        }
    }, [products])

    // Get popular tags (appear on 3+ products), max 15, sorted by frequency
    const popularTags = useMemo(() => {
        const tagEntries = Object.entries(filterCounts.tags) as [TagId, number][]
        return tagEntries
            .filter(([, count]) => count >= 3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([tagId]) => tagId)
    }, [filterCounts.tags])

    // Build active filters list for display (chips)
    const activeFilters: ActiveFilter[] = useMemo(() => {
        const filters: ActiveFilter[] = []

        // Search query
        if (filterState.searchQuery) {
            filters.push({
                type: 'search',
                value: filterState.searchQuery,
                label: `Search: "${filterState.searchQuery}"`
            })
        }

        // Categories
        filterState.selectedCategories.forEach((catId) => {
            const category = categories.find((c) => c.id === catId)
            filters.push({
                type: 'category',
                value: catId,
                label: category?.name ?? catId
            })
        })

        // Tags
        filterState.selectedTags.forEach((tagId) => {
            const tag = tags[tagId]
            filters.push({
                type: 'tag',
                value: tagId,
                label: tag?.name ?? tagId
            })
        })

        // Price tiers
        filterState.selectedTiers.forEach((tier) => {
            filters.push({
                type: 'tier',
                value: tier,
                label: PRICE_TIER_LABELS[tier]
            })
        })

        // Price range
        if (filterState.minPrice !== null || filterState.maxPrice !== null) {
            const min = filterState.minPrice ?? priceRange.min
            const max = filterState.maxPrice ?? priceRange.max
            filters.push({
                type: 'price',
                value: `${min}-${max}`,
                label: `€${min} - €${max}`
            })
        }

        // Boolean flags
        if (filterState.showBestValueOnly) {
            filters.push({
                type: 'bestValue',
                value: 'true',
                label: 'Best Value'
            })
        }

        if (filterState.showBestsellerOnly) {
            filters.push({
                type: 'bestseller',
                value: 'true',
                label: 'Bestseller'
            })
        }

        if (filterState.showFeaturedOnly) {
            filters.push({
                type: 'featured',
                value: 'true',
                label: 'Featured'
            })
        }

        return filters
    }, [filterState, categories, tags, priceRange])

    // Get categories sorted by product count (for display)
    const categoriesWithCounts = useMemo(() => {
        return categories
            .filter((cat) => filterCounts.categories[cat.id] > 0)
            .sort((a, b) => {
                // Sort by count (descending), then by name
                const countDiff =
                    (filterCounts.categories[b.id] || 0) - (filterCounts.categories[a.id] || 0)
                if (countDiff !== 0) return countDiff
                return a.name.localeCompare(b.name)
            })
            .map((cat) => ({
                id: cat.id,
                name: cat.name,
                count: filterCounts.categories[cat.id] || 0
            }))
    }, [categories, filterCounts.categories])

    // Get tags with counts (for display)
    const tagsWithCounts = useMemo(() => {
        return popularTags.map((tagId) => ({
            id: tagId,
            name: tags[tagId]?.name ?? tagId,
            count: filterCounts.tags[tagId] || 0
        }))
    }, [popularTags, tags, filterCounts.tags])

    // Get price tiers with counts (for display)
    const tiersWithCounts = useMemo(() => {
        const tierOrder: PriceTier[] = [
            'free',
            'budget',
            'standard',
            'premium',
            'enterprise',
            'subscription'
        ]
        return tierOrder
            .filter((tier) => filterCounts.tiers[tier] > 0)
            .map((tier) => ({
                id: tier,
                name: PRICE_TIER_LABELS[tier],
                count: filterCounts.tiers[tier]
            }))
    }, [filterCounts.tiers])

    return {
        // Filtered and sorted products
        filteredProducts,
        sortedProducts,

        // Filter counts
        filterCounts,

        // Price bounds
        priceRange,

        // Active filters for chips
        activeFilters,

        // Data for filter UI
        categoriesWithCounts,
        tagsWithCounts,
        tiersWithCounts,
        popularTags
    }
}

export type UseProductsFilterLogicReturn = ReturnType<typeof useProductsFilterLogic>
