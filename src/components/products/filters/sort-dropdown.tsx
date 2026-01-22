import { type SortOption, SORT_OPTION_LABELS } from '@/types/products-filter'

interface SortDropdownProps {
    value: SortOption
    onChange: (value: SortOption) => void
}

/**
 * Dropdown for selecting product sort order
 * Mobile-first design with larger touch targets on small screens
 */
const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
    const sortOptions: SortOption[] = ['featured', 'price-asc', 'price-desc', 'name']

    return (
        <div className='flex flex-1 items-center gap-2 sm:flex-initial'>
            <label
                htmlFor='sort-select'
                className='text-primary/70 hidden text-sm whitespace-nowrap sm:inline'
            >
                Sort by:
            </label>
            <select
                id='sort-select'
                value={value}
                onChange={(e) => onChange(e.target.value as SortOption)}
                className='border-primary/20 bg-background focus:border-secondary focus:ring-secondary w-full min-w-0 flex-1 cursor-pointer rounded-xl border px-3 py-3.5 text-base transition-colors focus:ring-2 focus:outline-none sm:w-auto sm:flex-initial sm:rounded-lg sm:py-2 sm:text-sm'
            >
                {sortOptions.map((option) => (
                    <option key={option} value={option}>
                        {SORT_OPTION_LABELS[option]}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default SortDropdown
