import { useState, useCallback, useRef, useEffect } from 'react'

interface PriceRangeSliderProps {
    min: number
    max: number
    currentMin: number | null
    currentMax: number | null
    onChange: (min: number | null, max: number | null) => void
}

/**
 * Dual-handle price range slider with min/max number inputs
 * Mobile-first design with larger touch targets on small screens
 * Custom implementation without external libraries
 */
const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
    min,
    max,
    currentMin,
    currentMax,
    onChange
}) => {
    // Local state for inputs (to allow typing before debouncing)
    const [localMin, setLocalMin] = useState<string>(currentMin?.toString() ?? '')
    const [localMax, setLocalMax] = useState<string>(currentMax?.toString() ?? '')

    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Sync local state when props change (e.g., URL navigation)
    // Note: setState in effect is necessary here to sync with external URL state
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalMin(currentMin?.toString() ?? '')
        setLocalMax(currentMax?.toString() ?? '')
    }, [currentMin, currentMax])

    // Debounced onChange callback
    const debouncedOnChange = useCallback(
        (newMin: number | null, newMax: number | null) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
            debounceTimerRef.current = setTimeout(() => {
                onChange(newMin, newMax)
            }, 150)
        },
        [onChange]
    )

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [])

    const handleMinInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            setLocalMin(value)

            if (value === '') {
                debouncedOnChange(null, currentMax)
            } else {
                const numValue = parseFloat(value)
                if (!isNaN(numValue) && numValue >= min) {
                    debouncedOnChange(numValue, currentMax)
                }
            }
        },
        [currentMax, min, debouncedOnChange]
    )

    const handleMaxInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            setLocalMax(value)

            if (value === '') {
                debouncedOnChange(currentMin, null)
            } else {
                const numValue = parseFloat(value)
                if (!isNaN(numValue) && numValue <= max) {
                    debouncedOnChange(currentMin, numValue)
                }
            }
        },
        [currentMin, max, debouncedOnChange]
    )

    // Effective values for sliders
    const effectiveMin = currentMin ?? min
    const effectiveMax = currentMax ?? max

    const handleMinSliderChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseFloat(e.target.value)
            // Don't let min exceed max
            const newMin = Math.min(value, effectiveMax - 1)
            setLocalMin(newMin.toString())
            debouncedOnChange(newMin === min ? null : newMin, currentMax)
        },
        [min, effectiveMax, currentMax, debouncedOnChange]
    )

    const handleMaxSliderChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseFloat(e.target.value)
            // Don't let max go below min
            const newMax = Math.max(value, effectiveMin + 1)
            setLocalMax(newMax.toString())
            debouncedOnChange(currentMin, newMax === max ? null : newMax)
        },
        [max, effectiveMin, currentMin, debouncedOnChange]
    )

    const handleReset = useCallback(() => {
        setLocalMin('')
        setLocalMax('')
        onChange(null, null)
    }, [onChange])

    const hasCustomRange = currentMin !== null || currentMax !== null

    return (
        <div className='space-y-4'>
            {/* Header - only show if not nested in a collapsible */}
            {hasCustomRange && (
                <div className='flex items-center justify-end'>
                    <button
                        onClick={handleReset}
                        className='text-secondary hover:text-secondary/80 active:text-secondary/60 cursor-pointer py-1 text-xs transition-colors'
                    >
                        Reset
                    </button>
                </div>
            )}

            {/* Dual range slider track - larger on mobile for touch */}
            <div className='relative mt-6 mb-4 h-3 md:h-2'>
                {/* Background track */}
                <div className='bg-primary/10 absolute inset-0 rounded-full' />

                {/* Min slider - larger thumb on mobile */}
                <input
                    type='range'
                    min={min}
                    max={max}
                    value={effectiveMin}
                    onChange={handleMinSliderChange}
                    className='[&::-webkit-slider-thumb]:bg-secondary [&::-moz-range-thumb]:bg-secondary pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 md:[&::-moz-range-thumb]:h-4 md:[&::-moz-range-thumb]:w-4 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110 md:[&::-webkit-slider-thumb]:h-4 md:[&::-webkit-slider-thumb]:w-4 md:[&::-webkit-slider-thumb]:hover:scale-110'
                    aria-label='Minimum price'
                />

                {/* Max slider - larger thumb on mobile */}
                <input
                    type='range'
                    min={min}
                    max={max}
                    value={effectiveMax}
                    onChange={handleMaxSliderChange}
                    className='[&::-webkit-slider-thumb]:bg-secondary [&::-moz-range-thumb]:bg-secondary pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 md:[&::-moz-range-thumb]:h-4 md:[&::-moz-range-thumb]:w-4 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110 md:[&::-webkit-slider-thumb]:h-4 md:[&::-webkit-slider-thumb]:w-4 md:[&::-webkit-slider-thumb]:hover:scale-110'
                    aria-label='Maximum price'
                />
            </div>

            {/* Min/Max inputs - larger on mobile */}
            <div className='flex items-center gap-2'>
                <div className='flex-1'>
                    <label htmlFor='price-min' className='sr-only'>
                        Minimum price
                    </label>
                    <div className='relative'>
                        <span className='text-primary/50 absolute top-1/2 left-3 -translate-y-1/2 text-sm'>
                            €
                        </span>
                        <input
                            id='price-min'
                            type='number'
                            value={localMin}
                            onChange={handleMinInputChange}
                            placeholder={min.toString()}
                            min={min}
                            max={max}
                            className='border-primary/20 bg-background focus:border-secondary focus:ring-secondary w-full rounded-xl border py-3 pr-3 pl-7 text-base transition-colors focus:ring-2 focus:outline-none md:rounded-lg md:py-2 md:text-sm'
                        />
                    </div>
                </div>

                <span className='text-primary/50'>—</span>

                <div className='flex-1'>
                    <label htmlFor='price-max' className='sr-only'>
                        Maximum price
                    </label>
                    <div className='relative'>
                        <span className='text-primary/50 absolute top-1/2 left-3 -translate-y-1/2 text-sm'>
                            €
                        </span>
                        <input
                            id='price-max'
                            type='number'
                            value={localMax}
                            onChange={handleMaxInputChange}
                            placeholder={max.toString()}
                            min={min}
                            max={max}
                            className='border-primary/20 bg-background focus:border-secondary focus:ring-secondary w-full rounded-xl border py-3 pr-3 pl-7 text-base transition-colors focus:ring-2 focus:outline-none md:rounded-lg md:py-2 md:text-sm'
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PriceRangeSlider
