import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router'
import type { CategoryId } from '@/schemas/category.schema'
import type { TagId } from '@/schemas/tag.schema'
import type { PriceTier } from '@/schemas/product.schema'
import { CategoryIdSchema } from '@/schemas/category.schema'
import { TagIdSchema } from '@/schemas/tag.schema'
import { PriceTierSchema } from '@/schemas/product.schema'
import {
    type ProductsFilterState,
    type SortOption,
    DEFAULT_FILTER_STATE,
    URL_PARAM_NAMES
} from '@/types/products-filter'

/**
 * Custom hook for managing products filter state with URL synchronization
 * All filter state is persisted in URL parameters for deep linking
 */
export function useProductsFilterState() {
    const [searchParams] = useSearchParams()
    const location = useLocation()
    const navigate = useNavigate()
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Parse URL parameters into filter state
    const parseUrlState = useCallback((params: URLSearchParams): ProductsFilterState => {
        // Parse search query
        const searchQuery = params.get(URL_PARAM_NAMES.search) ?? ''

        // Parse categories (comma-separated, validate against schema)
        const categoriesParam = params.get(URL_PARAM_NAMES.categories)
        const selectedCategories: CategoryId[] = categoriesParam
            ? categoriesParam.split(',').filter((cat): cat is CategoryId => {
                  const result = CategoryIdSchema.safeParse(cat)
                  return result.success
              })
            : []

        // Parse tags (comma-separated, validate against schema)
        const tagsParam = params.get(URL_PARAM_NAMES.tags)
        const selectedTags: TagId[] = tagsParam
            ? tagsParam.split(',').filter((tag): tag is TagId => {
                  const result = TagIdSchema.safeParse(tag)
                  return result.success
              })
            : []

        // Parse price tiers (comma-separated, validate against schema)
        const tiersParam = params.get(URL_PARAM_NAMES.tiers)
        const selectedTiers: PriceTier[] = tiersParam
            ? tiersParam.split(',').filter((tier): tier is PriceTier => {
                  const result = PriceTierSchema.safeParse(tier)
                  return result.success
              })
            : []

        // Parse price range
        const minParam = params.get(URL_PARAM_NAMES.minPrice)
        const maxParam = params.get(URL_PARAM_NAMES.maxPrice)
        const minPrice = minParam ? parseFloat(minParam) : null
        const maxPrice = maxParam ? parseFloat(maxParam) : null

        // Parse sort option
        const sortParam = params.get(URL_PARAM_NAMES.sort)
        const validSorts: SortOption[] = ['featured', 'price-asc', 'price-desc', 'name']
        const sortBy: SortOption = validSorts.includes(sortParam as SortOption)
            ? (sortParam as SortOption)
            : 'featured'

        // Parse boolean flags
        const showBestValueOnly = params.get(URL_PARAM_NAMES.bestValue) === '1'
        const showBestsellerOnly = params.get(URL_PARAM_NAMES.bestseller) === '1'
        const showFeaturedOnly = params.get(URL_PARAM_NAMES.featured) === '1'

        return {
            searchQuery,
            selectedCategories,
            selectedTags,
            selectedTiers,
            minPrice: minPrice !== null && !isNaN(minPrice) ? minPrice : null,
            maxPrice: maxPrice !== null && !isNaN(maxPrice) ? maxPrice : null,
            showBestValueOnly,
            showBestsellerOnly,
            showFeaturedOnly,
            sortBy
        }
    }, [])

    // Initialize state from URL
    const [state, setState] = useState<ProductsFilterState>(() => parseUrlState(searchParams))

    // Track search params string to detect actual URL changes
    const searchParamsString = searchParams.toString()

    // Sync state when URL changes externally (browser back/forward)
    useEffect(() => {
        setState(parseUrlState(searchParams))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParamsString])

    // Update URL when state changes (with replace to avoid history pollution, preserving hash)
    const updateUrl = useCallback(
        (newState: ProductsFilterState) => {
            const params = new URLSearchParams()

            // Only set params that differ from defaults
            if (newState.searchQuery) {
                params.set(URL_PARAM_NAMES.search, newState.searchQuery)
            }

            if (newState.selectedCategories.length > 0) {
                params.set(URL_PARAM_NAMES.categories, newState.selectedCategories.join(','))
            }

            if (newState.selectedTags.length > 0) {
                params.set(URL_PARAM_NAMES.tags, newState.selectedTags.join(','))
            }

            if (newState.selectedTiers.length > 0) {
                params.set(URL_PARAM_NAMES.tiers, newState.selectedTiers.join(','))
            }

            if (newState.minPrice !== null) {
                params.set(URL_PARAM_NAMES.minPrice, newState.minPrice.toString())
            }

            if (newState.maxPrice !== null) {
                params.set(URL_PARAM_NAMES.maxPrice, newState.maxPrice.toString())
            }

            if (newState.sortBy !== 'featured') {
                params.set(URL_PARAM_NAMES.sort, newState.sortBy)
            }

            if (newState.showBestValueOnly) {
                params.set(URL_PARAM_NAMES.bestValue, '1')
            }

            if (newState.showBestsellerOnly) {
                params.set(URL_PARAM_NAMES.bestseller, '1')
            }

            if (newState.showFeaturedOnly) {
                params.set(URL_PARAM_NAMES.featured, '1')
            }

            // Preserve the hash when updating URL
            const paramsString = params.toString()
            const newUrl = `${location.pathname}${paramsString ? `?${paramsString}` : ''}${location.hash}`
            navigate(newUrl, { replace: true })
        },
        [location.pathname, location.hash, navigate]
    )

    // State update functions

    // Helper to update state and URL together (URL update is deferred to avoid calling navigate during render)
    const updateStateAndUrl = useCallback(
        (newState: ProductsFilterState) => {
            setState(newState)
            // Defer URL update to next tick to avoid "Cannot update component while rendering" error
            queueMicrotask(() => updateUrl(newState))
        },
        [updateUrl]
    )

    const setSearchQuery = useCallback(
        (query: string) => {
            // Clear existing debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }

            // Update state immediately for responsive UI
            setState((prev) => ({ ...prev, searchQuery: query }))

            // Debounce URL update (300ms)
            debounceTimerRef.current = setTimeout(() => {
                setState((prev) => {
                    const newState = { ...prev, searchQuery: query }
                    queueMicrotask(() => updateUrl(newState))
                    return newState
                })
            }, 300)
        },
        [updateUrl]
    )

    const setSelectedCategories = useCallback(
        (categories: CategoryId[]) => {
            setState((prev) => {
                const newState = { ...prev, selectedCategories: categories }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const toggleCategory = useCallback(
        (category: CategoryId) => {
            setState((prev) => {
                const newCategories = prev.selectedCategories.includes(category)
                    ? prev.selectedCategories.filter((c) => c !== category)
                    : [...prev.selectedCategories, category]
                const newState = { ...prev, selectedCategories: newCategories }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const setSelectedTags = useCallback(
        (tags: TagId[]) => {
            setState((prev) => {
                const newState = { ...prev, selectedTags: tags }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const toggleTag = useCallback(
        (tag: TagId) => {
            setState((prev) => {
                const newTags = prev.selectedTags.includes(tag)
                    ? prev.selectedTags.filter((t) => t !== tag)
                    : [...prev.selectedTags, tag]
                const newState = { ...prev, selectedTags: newTags }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const setSelectedTiers = useCallback(
        (tiers: PriceTier[]) => {
            setState((prev) => {
                const newState = { ...prev, selectedTiers: tiers }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const toggleTier = useCallback(
        (tier: PriceTier) => {
            setState((prev) => {
                const newTiers = prev.selectedTiers.includes(tier)
                    ? prev.selectedTiers.filter((t) => t !== tier)
                    : [...prev.selectedTiers, tier]
                const newState = { ...prev, selectedTiers: newTiers }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const setPriceRange = useCallback(
        (min: number | null, max: number | null) => {
            setState((prev) => {
                const newState = { ...prev, minPrice: min, maxPrice: max }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const setSortBy = useCallback(
        (sortBy: SortOption) => {
            setState((prev) => {
                const newState = { ...prev, sortBy }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const setShowBestValueOnly = useCallback(
        (show: boolean) => {
            setState((prev) => {
                const newState = { ...prev, showBestValueOnly: show }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const setShowBestsellerOnly = useCallback(
        (show: boolean) => {
            setState((prev) => {
                const newState = { ...prev, showBestsellerOnly: show }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const setShowFeaturedOnly = useCallback(
        (show: boolean) => {
            setState((prev) => {
                const newState = { ...prev, showFeaturedOnly: show }
                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    const clearAllFilters = useCallback(() => {
        updateStateAndUrl(DEFAULT_FILTER_STATE)
    }, [updateStateAndUrl])

    const removeFilter = useCallback(
        (type: string, value: string) => {
            setState((prev) => {
                const newState = { ...prev }

                switch (type) {
                    case 'category':
                        newState.selectedCategories = prev.selectedCategories.filter(
                            (c) => c !== value
                        )
                        break
                    case 'tag':
                        newState.selectedTags = prev.selectedTags.filter((t) => t !== value)
                        break
                    case 'tier':
                        newState.selectedTiers = prev.selectedTiers.filter((t) => t !== value)
                        break
                    case 'price':
                        newState.minPrice = null
                        newState.maxPrice = null
                        break
                    case 'bestValue':
                        newState.showBestValueOnly = false
                        break
                    case 'bestseller':
                        newState.showBestsellerOnly = false
                        break
                    case 'featured':
                        newState.showFeaturedOnly = false
                        break
                    case 'search':
                        newState.searchQuery = ''
                        break
                }

                queueMicrotask(() => updateUrl(newState))
                return newState
            })
        },
        [updateUrl]
    )

    // Check if any filters are active
    const hasActiveFilters =
        state.searchQuery !== '' ||
        state.selectedCategories.length > 0 ||
        state.selectedTags.length > 0 ||
        state.selectedTiers.length > 0 ||
        state.minPrice !== null ||
        state.maxPrice !== null ||
        state.showBestValueOnly ||
        state.showBestsellerOnly ||
        state.showFeaturedOnly

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [])

    return {
        // State
        ...state,
        hasActiveFilters,

        // Actions
        setSearchQuery,
        setSelectedCategories,
        toggleCategory,
        setSelectedTags,
        toggleTag,
        setSelectedTiers,
        toggleTier,
        setPriceRange,
        setSortBy,
        setShowBestValueOnly,
        setShowBestsellerOnly,
        setShowFeaturedOnly,
        clearAllFilters,
        removeFilter
    }
}

export type UseProductsFilterStateReturn = ReturnType<typeof useProductsFilterState>
