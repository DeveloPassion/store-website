import { useState, useEffect, useRef } from 'react'
import { FaFilter } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import type { Product } from '@/schemas/product.schema'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'
import { updateAllMetaTags } from '@/lib/update-meta-tags'
import { useProductsFilterState } from '@/hooks/use-products-filter-state'
import { useProductsFilterLogic } from '@/hooks/use-products-filter-logic'
import {
    FilterSidebar,
    FilterDrawer,
    SortDropdown,
    ActiveFilterChips
} from '@/components/products/filters'
import { trackSearchPerformed, trackSortChanged } from '@/lib/analytics'
import { useScrollTracking } from '@/hooks/use-scroll-tracking'
import { useTimeOnPage } from '@/hooks/use-time-on-page'

const ProductsPage: React.FC = () => {
    const products = productsData as Product[]
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const previousSortRef = useRef<string | null>(null)

    // Scroll and time tracking
    useScrollTracking({ pageType: 'products' })
    useTimeOnPage({ pageType: 'products' })

    // URL-synced filter state
    const filterState = useProductsFilterState()
    const {
        searchQuery,
        selectedCategories,
        selectedTags,
        selectedTiers,
        minPrice,
        maxPrice,
        showBestValueOnly,
        showBestsellerOnly,
        showFeaturedOnly,
        sortBy,
        hasActiveFilters,
        setSearchQuery,
        setPriceRange,
        setSortBy,
        setShowBestValueOnly,
        setShowBestsellerOnly,
        setShowFeaturedOnly,
        clearAllFilters,
        removeFilter,
        setSelectedCategories,
        setSelectedTags,
        setSelectedTiers
    } = filterState

    // Filter logic
    const {
        sortedProducts,
        priceRange,
        activeFilters,
        categoriesWithCounts,
        tagsWithCounts,
        tiersWithCounts
    } = useProductsFilterLogic({
        products,
        filterState: {
            searchQuery,
            selectedCategories,
            selectedTags,
            selectedTiers,
            minPrice,
            maxPrice,
            showBestValueOnly,
            showBestsellerOnly,
            showFeaturedOnly,
            sortBy
        }
    })

    // Set breadcrumbs
    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Products' }])

    // Track search with debounce
    useEffect(() => {
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current)
        }

        if (searchQuery.trim().length > 0) {
            searchDebounceRef.current = setTimeout(() => {
                trackSearchPerformed({
                    queryLength: searchQuery.length,
                    resultCount: sortedProducts.length,
                    pageType: 'products'
                })
            }, 500)
        }

        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current)
            }
        }
    }, [searchQuery, sortedProducts.length])

    // Track sort changes
    useEffect(() => {
        if (previousSortRef.current !== null && previousSortRef.current !== sortBy) {
            trackSortChanged(sortBy)
        }
        previousSortRef.current = sortBy
    }, [sortBy])

    // Update document title and meta tags
    useEffect(() => {
        // Build URL with current params
        const params = new URLSearchParams(window.location.search)
        const urlWithParams = params.toString()
            ? `https://store.dsebastien.net/products?${params.toString()}`
            : 'https://store.dsebastien.net/products'

        updateAllMetaTags({
            title: 'Products - Knowledge Forge',
            description:
                'Browse all products. Discover courses, kits, templates, and tools to enhance your knowledge management and productivity.',
            url: urlWithParams
        })
    }, [searchQuery, selectedCategories, selectedTags, selectedTiers, sortBy])

    return (
        <>
            {/* Hero Section - mobile-first responsive */}
            <Section className='pt-12 pb-6 sm:pt-16 sm:pb-8 md:pt-24 md:pb-12'>
                <div className='mx-auto max-w-[1400px] text-center'>
                    <Breadcrumb className='mb-4 flex justify-center sm:mb-6' />
                    <h1 className='mb-4 text-3xl font-bold tracking-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl'>
                        Products & Resources
                    </h1>
                    <p className='text-primary/70 mx-auto mb-6 max-w-2xl text-base sm:mb-8 sm:text-lg md:text-xl lg:text-2xl'>
                        Tools, courses, and resources to help you work smarter, not harder.
                    </p>

                    {/* Stats - responsive sizing */}
                    <div className='mb-8 flex flex-wrap justify-center gap-4 sm:mb-10 sm:gap-6 md:gap-10'>
                        <div className='text-center'>
                            <div className='text-secondary text-2xl font-bold sm:text-3xl md:text-4xl'>
                                {products.length}
                            </div>
                            <div className='text-primary/60 text-xs sm:text-sm'>Products</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-success text-2xl font-bold sm:text-3xl md:text-4xl'>
                                {products.filter((p) => p.priceTier === 'free').length}
                            </div>
                            <div className='text-primary/60 text-xs sm:text-sm'>Free Resources</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-2xl font-bold text-blue-400 sm:text-3xl md:text-4xl'>
                                {products.filter((p) => p.featured).length}
                            </div>
                            <div className='text-primary/60 text-xs sm:text-sm'>Featured</div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Products Section with Sidebar Layout - mobile-first */}
            <Section className='py-6 sm:py-8 md:py-12'>
                <div className='flex gap-4 md:gap-6 lg:gap-8'>
                    {/* Desktop Sidebar - hidden on mobile, shown at md+ */}
                    <FilterSidebar
                        categoriesWithCounts={categoriesWithCounts}
                        selectedCategories={selectedCategories}
                        onCategoriesChange={setSelectedCategories}
                        tagsWithCounts={tagsWithCounts}
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        tiersWithCounts={tiersWithCounts}
                        selectedTiers={selectedTiers}
                        onTiersChange={setSelectedTiers}
                        priceRange={priceRange}
                        currentMinPrice={minPrice}
                        currentMaxPrice={maxPrice}
                        onPriceRangeChange={setPriceRange}
                        showBestValueOnly={showBestValueOnly}
                        onBestValueChange={setShowBestValueOnly}
                        showBestsellerOnly={showBestsellerOnly}
                        onBestsellerChange={setShowBestsellerOnly}
                        showFeaturedOnly={showFeaturedOnly}
                        onFeaturedChange={setShowFeaturedOnly}
                        hasActiveFilters={hasActiveFilters}
                        onClearAll={clearAllFilters}
                    />

                    {/* Main Content */}
                    <main className='min-w-0 flex-1'>
                        {/* Toolbar: Search + Sort + Mobile Filter Button */}
                        <div className='mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
                            <input
                                type='text'
                                placeholder='Search products...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='border-primary/20 bg-background/50 focus:border-secondary focus:ring-secondary flex-1 rounded-xl border px-4 py-3.5 text-base transition-colors focus:ring-2 focus:outline-none sm:rounded-lg sm:py-3 sm:text-sm'
                            />

                            <div className='flex items-center gap-2 sm:gap-3'>
                                <SortDropdown value={sortBy} onChange={setSortBy} />

                                {/* Mobile filter button - hidden at md+ (sidebar visible) */}
                                <button
                                    onClick={() => setFilterDrawerOpen(true)}
                                    className='bg-primary/10 hover:bg-primary/20 active:bg-primary/30 flex cursor-pointer items-center gap-2 rounded-xl px-4 py-3.5 text-base transition-colors sm:rounded-lg sm:py-3 sm:text-sm md:hidden'
                                >
                                    <FaFilter className='h-4 w-4' />
                                    <span className='sm:inline'>Filters</span>
                                    {hasActiveFilters && (
                                        <span className='bg-secondary flex h-5 w-5 items-center justify-center rounded-full text-xs text-white'>
                                            {activeFilters.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Active Filter Chips */}
                        {hasActiveFilters && (
                            <div className='mb-3 sm:mb-4'>
                                <ActiveFilterChips
                                    filters={activeFilters}
                                    onRemove={removeFilter}
                                    onClearAll={clearAllFilters}
                                />
                            </div>
                        )}

                        {/* Results count */}
                        <div className='text-primary/60 mb-4 text-xs sm:mb-6 sm:text-sm'>
                            Showing {sortedProducts.length} of {products.length} products
                            {searchQuery && ` matching "${searchQuery}"`}
                        </div>

                        {/* Products Grid - Mobile-first responsive with sidebar adjustment */}
                        {sortedProducts.length > 0 ? (
                            <div className='xg:grid-cols-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
                                {sortedProducts.map((product) => (
                                    <ProductCardEcommerce
                                        key={product.id}
                                        product={product}
                                        source={searchQuery ? 'search' : 'products'}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className='py-12 text-center sm:py-16'>
                                <div className='mb-3 text-4xl sm:mb-4 sm:text-5xl'>🔍</div>
                                <h3 className='mb-2 text-lg font-semibold sm:text-xl'>
                                    No products found
                                </h3>
                                <p className='text-primary/60 mb-4 text-sm sm:text-base'>
                                    Try adjusting your search or filters.
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className='bg-secondary hover:bg-secondary/90 active:bg-secondary/80 cursor-pointer rounded-xl px-6 py-3.5 text-base font-semibold text-white transition-colors sm:rounded-lg sm:py-3'
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </Section>

            {/* Mobile Filter Drawer - only shown on mobile (< md) */}
            <FilterDrawer
                isOpen={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                categoriesWithCounts={categoriesWithCounts}
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                tagsWithCounts={tagsWithCounts}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                tiersWithCounts={tiersWithCounts}
                selectedTiers={selectedTiers}
                onTiersChange={setSelectedTiers}
                priceRange={priceRange}
                currentMinPrice={minPrice}
                currentMaxPrice={maxPrice}
                onPriceRangeChange={setPriceRange}
                showBestValueOnly={showBestValueOnly}
                onBestValueChange={setShowBestValueOnly}
                showBestsellerOnly={showBestsellerOnly}
                onBestsellerChange={setShowBestsellerOnly}
                showFeaturedOnly={showFeaturedOnly}
                onFeaturedChange={setShowFeaturedOnly}
                hasActiveFilters={hasActiveFilters}
                onClearAll={clearAllFilters}
                resultsCount={sortedProducts.length}
            />
        </>
    )
}

export default ProductsPage
