import type { PaymentFrequency } from '@/schemas/product.schema'

export interface PaymentFrequencySelectorProps {
    frequencies: PaymentFrequency[]
    selected: PaymentFrequency
    onChange: (frequency: PaymentFrequency) => void
    className?: string
    monthlyPrice?: number
    yearlyPrice?: number
    biennialPrice?: number
}

/**
 * Payment frequency selector component with sales-focused design
 * Highlights savings for longer subscription commitments
 */
export const PaymentFrequencySelector = ({
    frequencies,
    selected,
    onChange,
    className = '',
    monthlyPrice,
    yearlyPrice,
    biennialPrice
}: PaymentFrequencySelectorProps) => {
    // Only show if there are multiple frequencies to choose from
    if (frequencies.length <= 1) {
        return null
    }

    // Check which frequencies are available
    const hasYearly = frequencies.includes('yearly')
    const hasMonthly = frequencies.includes('monthly')
    const hasBiennial = frequencies.includes('biennial')

    // Calculate savings percentages
    const yearlySavings =
        monthlyPrice && yearlyPrice
            ? Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100)
            : null

    const biennialSavings =
        monthlyPrice && biennialPrice
            ? Math.round((1 - biennialPrice / (monthlyPrice * 24)) * 100)
            : null

    // Determine which savings to show based on selected frequency
    const showYearlySavings = hasYearly && yearlySavings && yearlySavings > 0
    const showBiennialSavings = hasBiennial && biennialSavings && biennialSavings > 0

    return (
        <div className={`mb-6 ${className}`}>
            <label className='text-primary/80 mb-3 block text-sm font-medium'>
                Billing Frequency:
            </label>

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                {/* Frequency Toggle Buttons */}
                <div className='bg-primary/5 inline-flex flex-wrap rounded-lg p-1'>
                    {hasMonthly && (
                        <button
                            type='button'
                            onClick={() => onChange('monthly')}
                            className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-all ${
                                selected === 'monthly'
                                    ? 'bg-primary text-background shadow-sm'
                                    : 'text-primary/70 hover:text-primary'
                            } `}
                            aria-pressed={selected === 'monthly'}
                        >
                            Monthly
                        </button>
                    )}
                    {hasYearly && (
                        <button
                            type='button'
                            onClick={() => onChange('yearly')}
                            className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-all ${
                                selected === 'yearly'
                                    ? 'bg-primary text-background shadow-sm'
                                    : 'text-primary/70 hover:text-primary'
                            } `}
                            aria-pressed={selected === 'yearly'}
                        >
                            Yearly
                        </button>
                    )}
                    {hasBiennial && (
                        <button
                            type='button'
                            onClick={() => onChange('biennial')}
                            className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-all ${
                                selected === 'biennial'
                                    ? 'bg-primary text-background shadow-sm'
                                    : 'text-primary/70 hover:text-primary'
                            } `}
                            aria-pressed={selected === 'biennial'}
                        >
                            2 Years
                        </button>
                    )}
                </div>

                {/* Savings Badge - Show best savings available or current selection */}
                {(showYearlySavings || showBiennialSavings) && (
                    <div
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                            selected === 'yearly' || selected === 'biennial'
                                ? 'bg-secondary/20 text-secondary animate-pulse'
                                : 'bg-primary/10 text-primary/70'
                        } `}
                    >
                        <svg
                            className='h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                        </svg>
                        <span className='font-semibold'>
                            {showBiennialSavings && showYearlySavings ? (
                                <>Save up to {biennialSavings}% with 2 Years</>
                            ) : showBiennialSavings ? (
                                <>Save {biennialSavings}% with 2 Years</>
                            ) : (
                                <>Save {yearlySavings}% with Yearly</>
                            )}
                        </span>
                    </div>
                )}
            </div>

            {/* Additional Savings Message */}
            {selected === 'yearly' && showYearlySavings && (
                <div className='text-secondary mt-2 text-sm'>
                    <span className='font-medium'>Smart choice!</span> You're saving {yearlySavings}
                    % compared to paying monthly.
                </div>
            )}
            {selected === 'biennial' && showBiennialSavings && (
                <div className='text-secondary mt-2 text-sm'>
                    <span className='font-medium'>Excellent choice!</span> You're saving{' '}
                    {biennialSavings}% compared to paying monthly —{' '}
                    <span className='font-semibold'>maximum value!</span>
                </div>
            )}
        </div>
    )
}
