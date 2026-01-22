import { useState, useCallback } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

export interface FilterOption {
    id: string
    name: string
    count?: number
}

interface FilterCheckboxGroupProps {
    label: string
    options: FilterOption[]
    selected: string[]
    onChange: (selected: string[]) => void
    maxVisible?: number
    showCounts?: boolean
}

/**
 * Reusable multi-select checkbox group component for filters
 * Mobile-first design with larger touch targets
 * Supports "Show more/less" toggle when options exceed maxVisible
 */
const FilterCheckboxGroup: React.FC<FilterCheckboxGroupProps> = ({
    label,
    options,
    selected,
    onChange,
    maxVisible = 5,
    showCounts = true
}) => {
    const [showAll, setShowAll] = useState(false)

    const handleToggle = useCallback(
        (optionId: string) => {
            const newSelected = selected.includes(optionId)
                ? selected.filter((id) => id !== optionId)
                : [...selected, optionId]
            onChange(newSelected)
        },
        [selected, onChange]
    )

    const visibleOptions = showAll ? options : options.slice(0, maxVisible)
    const hasMore = options.length > maxVisible

    return (
        <div className='space-y-2'>
            {label && <h4 className='text-primary/90 text-sm font-semibold'>{label}</h4>}
            <div className='space-y-1'>
                {visibleOptions.map((option) => (
                    <label
                        key={option.id}
                        className='hover:bg-primary/5 active:bg-primary/10 -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors md:py-2'
                    >
                        <input
                            type='checkbox'
                            checked={selected.includes(option.id)}
                            onChange={() => handleToggle(option.id)}
                            className='border-primary/30 bg-background checked:bg-secondary checked:border-secondary focus:ring-secondary/50 h-5 w-5 shrink-0 rounded transition-colors focus:ring-2 focus:outline-none md:h-4 md:w-4'
                        />
                        <span className='text-primary/80 min-w-0 flex-1 truncate'>
                            {option.name}
                        </span>
                        {showCounts && option.count !== undefined && (
                            <span className='text-primary/50 shrink-0 text-xs'>
                                ({option.count})
                            </span>
                        )}
                    </label>
                ))}
            </div>

            {hasMore && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className='text-secondary hover:text-secondary/80 active:text-secondary/60 -mx-2 flex cursor-pointer items-center gap-1 px-2 py-2 text-sm transition-colors md:text-xs'
                >
                    {showAll ? (
                        <>
                            <FaChevronUp className='h-3 w-3' />
                            Show less
                        </>
                    ) : (
                        <>
                            <FaChevronDown className='h-3 w-3' />
                            Show {options.length - maxVisible} more
                        </>
                    )}
                </button>
            )}
        </div>
    )
}

export default FilterCheckboxGroup
