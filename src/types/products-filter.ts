import type { CategoryId } from '@/schemas/category.schema'
import type { TagId } from '@/schemas/tag.schema'
import type { PriceTier } from '@/schemas/product.schema'

/**
 * Products filter types
 * Used for advanced filtering on the /products page
 */

/**
 * Sort options for products
 */
export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name'

/**
 * Display names for sort options
 */
export const SORT_OPTION_LABELS: Record<SortOption, string> = {
    'featured': 'Featured',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'name': 'Name: A to Z'
}

/**
 * Types of filters available
 */
export type FilterType =
    | 'category'
    | 'tag'
    | 'tier'
    | 'price'
    | 'bestValue'
    | 'bestseller'
    | 'featured'
    | 'search'

/**
 * Represents an active filter with its display information
 */
export interface ActiveFilter {
    type: FilterType
    value: string
    label: string
}

/**
 * Full filter state for the products page
 */
export interface ProductsFilterState {
    // Search query
    searchQuery: string

    // Multi-select filters (arrays)
    selectedCategories: CategoryId[]
    selectedTags: TagId[]
    selectedTiers: PriceTier[]

    // Price range
    minPrice: number | null
    maxPrice: number | null

    // Boolean flags
    showBestValueOnly: boolean
    showBestsellerOnly: boolean
    showFeaturedOnly: boolean

    // Sorting
    sortBy: SortOption
}

/**
 * Counts of products per filter option (for showing in UI)
 */
export interface FilterCounts {
    categories: Record<CategoryId, number>
    tags: Record<TagId, number>
    tiers: Record<PriceTier, number>
}

/**
 * Price range bounds computed from products
 */
export interface PriceRange {
    min: number
    max: number
}

/**
 * Default filter state
 */
export const DEFAULT_FILTER_STATE: ProductsFilterState = {
    searchQuery: '',
    selectedCategories: [],
    selectedTags: [],
    selectedTiers: [],
    minPrice: null,
    maxPrice: null,
    showBestValueOnly: false,
    showBestsellerOnly: false,
    showFeaturedOnly: false,
    sortBy: 'featured'
}

/**
 * URL parameter names for filters
 */
export const URL_PARAM_NAMES = {
    search: 'q',
    categories: 'cat',
    tags: 'tags',
    tiers: 'tiers',
    minPrice: 'min',
    maxPrice: 'max',
    sort: 'sort',
    bestValue: 'bv',
    bestseller: 'bs',
    featured: 'ft'
} as const

/**
 * Price tier display names
 */
export const PRICE_TIER_LABELS: Record<PriceTier, string> = {
    free: 'Free',
    budget: 'Budget',
    standard: 'Standard',
    premium: 'Premium',
    enterprise: 'Enterprise',
    subscription: 'Subscription'
}
