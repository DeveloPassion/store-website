import { useEffect } from 'react'
import { FaTimes, FaTrophy, FaFire, FaStar } from 'react-icons/fa'
import FilterCheckboxGroup, { type FilterOption } from './filter-checkbox-group'
import PriceRangeSlider from './price-range-slider'
import type { CategoryId } from '@/schemas/category.schema'
import type { TagId } from '@/schemas/tag.schema'
import type { PriceTier } from '@/schemas/product.schema'
import type { PriceRange } from '@/types/products-filter'

interface FilterDrawerProps {
    isOpen: boolean
    onClose: () => void

    // Categories
    categoriesWithCounts: Array<{ id: CategoryId; name: string; count: number }>
    selectedCategories: CategoryId[]
    onCategoriesChange: (categories: CategoryId[]) => void

    // Tags
    tagsWithCounts: Array<{ id: TagId; name: string; count: number }>
    selectedTags: TagId[]
    onTagsChange: (tags: TagId[]) => void

    // Price tiers
    tiersWithCounts: Array<{ id: PriceTier; name: string; count: number }>
    selectedTiers: PriceTier[]
    onTiersChange: (tiers: PriceTier[]) => void

    // Price range
    priceRange: PriceRange
    currentMinPrice: number | null
    currentMaxPrice: number | null
    onPriceRangeChange: (min: number | null, max: number | null) => void

    // Boolean flags
    showBestValueOnly: boolean
    onBestValueChange: (show: boolean) => void
    showBestsellerOnly: boolean
    onBestsellerChange: (show: boolean) => void
    showFeaturedOnly: boolean
    onFeaturedChange: (show: boolean) => void

    // Clear all
    hasActiveFilters: boolean
    onClearAll: () => void

    // Results count for display
    resultsCount: number
}

/**
 * Mobile-first full-screen filter drawer
 * Only shown on mobile (< md breakpoint)
 * Following header.tsx overlay pattern with enhanced touch targets
 */
const FilterDrawer: React.FC<FilterDrawerProps> = ({
    isOpen,
    onClose,
    categoriesWithCounts,
    selectedCategories,
    onCategoriesChange,
    tagsWithCounts,
    selectedTags,
    onTagsChange,
    tiersWithCounts,
    selectedTiers,
    onTiersChange,
    priceRange,
    currentMinPrice,
    currentMaxPrice,
    onPriceRangeChange,
    showBestValueOnly,
    onBestValueChange,
    showBestsellerOnly,
    onBestsellerChange,
    showFeaturedOnly,
    onFeaturedChange,
    hasActiveFilters,
    onClearAll,
    resultsCount
}) => {
    // Prevent body scroll when drawer is open and handle ESC key
    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = ''
            return
        }

        document.body.style.overflow = 'hidden'

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleEsc)
        }
    }, [isOpen, onClose])

    // Convert to FilterOption format
    const categoryOptions: FilterOption[] = categoriesWithCounts.map((c) => ({
        id: c.id,
        name: c.name,
        count: c.count
    }))

    const tagOptions: FilterOption[] = tagsWithCounts.map((t) => ({
        id: t.id,
        name: t.name,
        count: t.count
    }))

    const tierOptions: FilterOption[] = tiersWithCounts.map((t) => ({
        id: t.id,
        name: t.name,
        count: t.count
    }))

    return (
        <div
            className={`bg-background/98 fixed inset-0 z-[60] flex flex-col backdrop-blur-md transition-all duration-300 md:hidden ${
                isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
            }`}
            onClick={onClose}
        >
            {/* Header - safe area padding for notched devices */}
            <div
                className='border-primary/10 flex items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]'
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className='text-lg font-semibold'>Filters</h2>
                <button
                    onClick={onClose}
                    className='bg-primary/10 hover:bg-primary/20 active:bg-primary/30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl transition-colors'
                    aria-label='Close filters'
                >
                    <FaTimes className='h-5 w-5' />
                </button>
            </div>

            {/* Content - scrollable with padding for touch */}
            <div
                className='flex-1 space-y-5 overflow-y-auto px-4 py-4'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Options (Boolean flags) - large touch targets */}
                <div className='space-y-2'>
                    <h3 className='text-primary/90 font-medium'>Options</h3>
                    <div className='space-y-1'>
                        <label className='hover:bg-primary/5 active:bg-primary/10 -mx-2 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base transition-colors'>
                            <input
                                type='checkbox'
                                checked={showFeaturedOnly}
                                onChange={(e) => onFeaturedChange(e.target.checked)}
                                className='border-primary/30 bg-background checked:bg-secondary checked:border-secondary focus:ring-secondary/50 h-5 w-5 shrink-0 rounded transition-colors focus:ring-2 focus:outline-none'
                            />
                            <FaStar className='h-5 w-5 shrink-0 text-yellow-400' />
                            <span className='text-primary/80'>Featured only</span>
                        </label>

                        <label className='hover:bg-primary/5 active:bg-primary/10 -mx-2 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base transition-colors'>
                            <input
                                type='checkbox'
                                checked={showBestValueOnly}
                                onChange={(e) => onBestValueChange(e.target.checked)}
                                className='border-primary/30 bg-background checked:bg-secondary checked:border-secondary focus:ring-secondary/50 h-5 w-5 shrink-0 rounded transition-colors focus:ring-2 focus:outline-none'
                            />
                            <FaTrophy className='h-5 w-5 shrink-0 text-blue-400' />
                            <span className='text-primary/80'>Best Value only</span>
                        </label>

                        <label className='hover:bg-primary/5 active:bg-primary/10 -mx-2 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base transition-colors'>
                            <input
                                type='checkbox'
                                checked={showBestsellerOnly}
                                onChange={(e) => onBestsellerChange(e.target.checked)}
                                className='border-primary/30 bg-background checked:bg-secondary checked:border-secondary focus:ring-secondary/50 h-5 w-5 shrink-0 rounded transition-colors focus:ring-2 focus:outline-none'
                            />
                            <FaFire className='h-5 w-5 shrink-0 text-orange-400' />
                            <span className='text-primary/80'>Bestseller only</span>
                        </label>
                    </div>
                </div>

                {/* Categories */}
                {categoryOptions.length > 0 && (
                    <div className='border-primary/10 border-t pt-4'>
                        <FilterCheckboxGroup
                            label='Categories'
                            options={categoryOptions}
                            selected={selectedCategories}
                            onChange={(selected) => onCategoriesChange(selected as CategoryId[])}
                            maxVisible={6}
                            showCounts={true}
                        />
                    </div>
                )}

                {/* Price Tiers */}
                {tierOptions.length > 0 && (
                    <div className='border-primary/10 border-t pt-4'>
                        <FilterCheckboxGroup
                            label='Price Tier'
                            options={tierOptions}
                            selected={selectedTiers}
                            onChange={(selected) => onTiersChange(selected as PriceTier[])}
                            maxVisible={6}
                            showCounts={true}
                        />
                    </div>
                )}

                {/* Price Range */}
                <div className='border-primary/10 border-t pt-4'>
                    <PriceRangeSlider
                        min={priceRange.min}
                        max={priceRange.max}
                        currentMin={currentMinPrice}
                        currentMax={currentMaxPrice}
                        onChange={onPriceRangeChange}
                    />
                </div>

                {/* Tags */}
                {tagOptions.length > 0 && (
                    <div className='border-primary/10 border-t pt-4'>
                        <FilterCheckboxGroup
                            label='Tags'
                            options={tagOptions}
                            selected={selectedTags}
                            onChange={(selected) => onTagsChange(selected as TagId[])}
                            maxVisible={8}
                            showCounts={true}
                        />
                    </div>
                )}
            </div>

            {/* Footer with buttons - safe area padding for bottom */}
            <div
                className='border-primary/10 space-y-3 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
                onClick={(e) => e.stopPropagation()}
            >
                {hasActiveFilters && (
                    <button
                        onClick={onClearAll}
                        className='border-primary/20 text-primary/70 hover:bg-primary/5 active:bg-primary/10 w-full cursor-pointer rounded-xl border py-3.5 text-base transition-colors'
                    >
                        Clear all filters
                    </button>
                )}
                <button
                    onClick={onClose}
                    className='bg-secondary hover:bg-secondary/90 active:bg-secondary/80 w-full cursor-pointer rounded-xl py-3.5 text-base font-semibold text-white transition-colors'
                >
                    Show {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
                </button>
            </div>

            {/* Close hint - only visible on larger phones in landscape */}
            <div className='text-primary/40 shrink-0 py-2 text-center text-xs sm:text-sm'>
                Tap anywhere or press ESC to close
            </div>
        </div>
    )
}

export default FilterDrawer
