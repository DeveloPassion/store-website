import { FaTimes } from 'react-icons/fa'
import type { ActiveFilter } from '@/types/products-filter'

interface ActiveFilterChipsProps {
    filters: ActiveFilter[]
    onRemove: (type: string, value: string) => void
    onClearAll: () => void
}

/**
 * Display active filters as removable chips/pills
 * Mobile-first design with touch-friendly sizing
 */
const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({ filters, onRemove, onClearAll }) => {
    if (filters.length === 0) {
        return null
    }

    return (
        <div className='flex flex-wrap items-center gap-2'>
            {filters.map((filter, index) => (
                <button
                    key={`${filter.type}-${filter.value}-${index}`}
                    onClick={() => onRemove(filter.type, filter.value)}
                    className='bg-secondary/10 text-secondary hover:bg-secondary/20 active:bg-secondary/30 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors sm:py-1'
                    aria-label={`Remove filter: ${filter.label}`}
                >
                    <span className='max-w-[120px] truncate sm:max-w-[150px]'>{filter.label}</span>
                    <FaTimes className='h-3 w-3 shrink-0' />
                </button>
            ))}

            {filters.length > 1 && (
                <button
                    onClick={onClearAll}
                    className='text-primary/60 hover:text-primary active:text-primary/80 cursor-pointer px-2 py-1.5 text-sm underline transition-colors sm:py-1'
                >
                    Clear all
                </button>
            )}
        </div>
    )
}

export default ActiveFilterChips
