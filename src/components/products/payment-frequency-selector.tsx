import type { PaymentFrequency } from '@/schemas/product.schema'
import { FaCheckCircle, FaTag } from 'react-icons/fa'

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

    // Get the best available savings for the badge
    const bestSavings = showBiennialSavings ? biennialSavings : yearlySavings
    const bestSavingsLabel = showBiennialSavings ? '2 Years' : 'Yearly'

    // Check if user has selected a savings option
    const hasSavingsSelected = selected === 'yearly' || selected === 'biennial'
    const currentSavings = selected === 'biennial' ? biennialSavings : yearlySavings

    return (
        <div className={`mb-6 ${className}`}>
            <label className='text-primary/80 mb-2 block text-sm font-medium'>
                Billing Frequency:
            </label>

            {/* Toggle Buttons with integrated savings badge */}
            <div className='flex flex-col gap-3'>
                <div className='border-primary/20 bg-primary/5 inline-flex flex-wrap gap-1 rounded-xl border p-1.5'>
                    {hasMonthly && (
                        <button
                            type='button'
                            onClick={() => onChange('monthly')}
                            className={`relative cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                selected === 'monthly'
                                    ? 'bg-primary text-background shadow-md'
                                    : 'text-primary/70 hover:bg-primary/10 hover:text-primary'
                            }`}
                            aria-pressed={selected === 'monthly'}
                        >
                            Monthly
                        </button>
                    )}
                    {hasYearly && (
                        <button
                            type='button'
                            onClick={() => onChange('yearly')}
                            className={`relative cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                selected === 'yearly'
                                    ? 'bg-solution text-white shadow-md'
                                    : 'text-primary/70 hover:bg-primary/10 hover:text-primary'
                            }`}
                            aria-pressed={selected === 'yearly'}
                        >
                            <span className='flex items-center gap-2'>
                                Yearly
                                {showYearlySavings && selected !== 'yearly' && (
                                    <span className='bg-solution/20 text-solution rounded-full px-2 py-0.5 text-xs font-semibold'>
                                        -{yearlySavings}%
                                    </span>
                                )}
                            </span>
                        </button>
                    )}
                    {hasBiennial && (
                        <button
                            type='button'
                            onClick={() => onChange('biennial')}
                            className={`relative cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                selected === 'biennial'
                                    ? 'bg-solution text-white shadow-md'
                                    : 'text-primary/70 hover:bg-primary/10 hover:text-primary'
                            }`}
                            aria-pressed={selected === 'biennial'}
                        >
                            <span className='flex items-center gap-2'>
                                2 Years
                                {showBiennialSavings && selected !== 'biennial' && (
                                    <span className='bg-solution/20 text-solution rounded-full px-2 py-0.5 text-xs font-semibold'>
                                        -{biennialSavings}%
                                    </span>
                                )}
                            </span>
                        </button>
                    )}
                </div>

                {/* Savings Confirmation - shown when a savings option is selected */}
                {hasSavingsSelected && currentSavings && currentSavings > 0 && (
                    <div className='bg-solution/10 border-solution/30 flex items-center gap-3 rounded-lg border px-4 py-3'>
                        <FaCheckCircle className='text-solution h-5 w-5 shrink-0' />
                        <div className='flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2'>
                            <span className='text-solution text-sm font-semibold'>
                                {selected === 'biennial' ? 'Best value!' : 'Great choice!'}
                            </span>
                            <span className='text-primary/80 text-sm'>
                                You're saving{' '}
                                <span className='text-solution font-semibold'>
                                    {currentSavings}%
                                </span>{' '}
                                compared to monthly billing
                            </span>
                        </div>
                    </div>
                )}

                {/* Savings Hint - shown when monthly is selected and savings are available */}
                {selected === 'monthly' && (showYearlySavings || showBiennialSavings) && (
                    <div className='bg-primary/5 border-primary/10 flex items-center gap-3 rounded-lg border px-4 py-3'>
                        <FaTag className='text-primary/50 h-4 w-4 shrink-0' />
                        <span className='text-primary/60 text-sm'>
                            Save up to{' '}
                            <span className='text-solution font-semibold'>{bestSavings}%</span> with{' '}
                            {bestSavingsLabel} billing
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
