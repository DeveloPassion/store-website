import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronDown, FaTrophy, FaFire, FaStar } from 'react-icons/fa'
import FilterCheckboxGroup, { type FilterOption } from './filter-checkbox-group'
import PriceRangeSlider from './price-range-slider'
import type { CategoryId } from '@/schemas/category.schema'
import type { TagId } from '@/schemas/tag.schema'
import type { PriceTier } from '@/schemas/product.schema'
import type { PriceRange } from '@/types/products-filter'

interface FilterSidebarProps {
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
}

interface CollapsibleSectionProps {
    title: string
    defaultOpen?: boolean
    children: React.ReactNode
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    defaultOpen = true,
    children
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className='border-primary/10 border-b pb-3 last:border-b-0 last:pb-0 md:pb-4'>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex w-full cursor-pointer items-center justify-between py-2.5 text-left md:py-2'
            >
                <span className='text-primary/90 font-medium'>{title}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <FaChevronDown className='text-primary/50 h-4 w-4' />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className='overflow-hidden'
                    >
                        <div className='pt-1 md:pt-2'>{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/**
 * Filter sidebar component - mobile-first responsive design
 * - Hidden on mobile (< md), uses FilterDrawer instead
 * - Shown at md+ with responsive widths: 220px on md, 280px on lg+
 * - Sticky positioning with scroll
 */
const FilterSidebar: React.FC<FilterSidebarProps> = ({
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
    onClearAll
}) => {
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
        <aside className='sticky top-24 hidden max-h-[calc(100vh-8rem)] w-[220px] shrink-0 self-start overflow-y-auto md:block lg:w-[280px]'>
            <div className='bg-background/50 border-primary/10 space-y-3 rounded-lg border p-3 md:space-y-4 md:p-4'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <h3 className='text-base font-semibold md:text-lg'>Filters</h3>
                    {hasActiveFilters && (
                        <button
                            onClick={onClearAll}
                            className='text-secondary hover:text-secondary/80 active:text-secondary/60 cursor-pointer py-1 text-xs transition-colors md:text-sm'
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Options (Boolean flags) */}
                <CollapsibleSection title='Options' defaultOpen={true}>
                    <div className='space-y-1'>
                        <label className='hover:bg-primary/5 active:bg-primary/10 -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors md:py-2'>
                            <input
                                type='checkbox'
                                checked={showFeaturedOnly}
                                onChange={(e) => onFeaturedChange(e.target.checked)}
                                className='border-primary/30 bg-background checked:bg-secondary checked:border-secondary focus:ring-secondary/50 h-5 w-5 shrink-0 rounded transition-colors focus:ring-2 focus:outline-none md:h-4 md:w-4'
                            />
                            <FaStar className='h-4 w-4 shrink-0 text-yellow-400' />
                            <span className='text-primary/80'>Featured</span>
                        </label>

                        <label className='hover:bg-primary/5 active:bg-primary/10 -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors md:py-2'>
                            <input
                                type='checkbox'
                                checked={showBestValueOnly}
                                onChange={(e) => onBestValueChange(e.target.checked)}
                                className='border-primary/30 bg-background checked:bg-secondary checked:border-secondary focus:ring-secondary/50 h-5 w-5 shrink-0 rounded transition-colors focus:ring-2 focus:outline-none md:h-4 md:w-4'
                            />
                            <FaTrophy className='h-4 w-4 shrink-0 text-blue-400' />
                            <span className='text-primary/80'>Best Value</span>
                        </label>

                        <label className='hover:bg-primary/5 active:bg-primary/10 -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors md:py-2'>
                            <input
                                type='checkbox'
                                checked={showBestsellerOnly}
                                onChange={(e) => onBestsellerChange(e.target.checked)}
                                className='border-primary/30 bg-background checked:bg-secondary checked:border-secondary focus:ring-secondary/50 h-5 w-5 shrink-0 rounded transition-colors focus:ring-2 focus:outline-none md:h-4 md:w-4'
                            />
                            <FaFire className='h-4 w-4 shrink-0 text-orange-400' />
                            <span className='text-primary/80'>Bestseller</span>
                        </label>
                    </div>
                </CollapsibleSection>

                {/* Categories */}
                {categoryOptions.length > 0 && (
                    <CollapsibleSection title='Categories' defaultOpen={true}>
                        <FilterCheckboxGroup
                            label=''
                            options={categoryOptions}
                            selected={selectedCategories}
                            onChange={(selected) => onCategoriesChange(selected as CategoryId[])}
                            maxVisible={6}
                            showCounts={true}
                        />
                    </CollapsibleSection>
                )}

                {/* Price Tiers */}
                {tierOptions.length > 0 && (
                    <CollapsibleSection title='Price Tier' defaultOpen={true}>
                        <FilterCheckboxGroup
                            label=''
                            options={tierOptions}
                            selected={selectedTiers}
                            onChange={(selected) => onTiersChange(selected as PriceTier[])}
                            maxVisible={6}
                            showCounts={true}
                        />
                    </CollapsibleSection>
                )}

                {/* Price Range */}
                <CollapsibleSection title='Price Range' defaultOpen={false}>
                    <PriceRangeSlider
                        min={priceRange.min}
                        max={priceRange.max}
                        currentMin={currentMinPrice}
                        currentMax={currentMaxPrice}
                        onChange={onPriceRangeChange}
                    />
                </CollapsibleSection>

                {/* Tags */}
                {tagOptions.length > 0 && (
                    <CollapsibleSection title='Tags' defaultOpen={false}>
                        <FilterCheckboxGroup
                            label=''
                            options={tagOptions}
                            selected={selectedTags}
                            onChange={(selected) => onTagsChange(selected as TagId[])}
                            maxVisible={8}
                            showCounts={true}
                        />
                    </CollapsibleSection>
                )}
            </div>
        </aside>
    )
}

export default FilterSidebar
