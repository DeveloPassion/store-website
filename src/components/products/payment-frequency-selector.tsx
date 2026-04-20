import type { PaymentFrequency } from '@/schemas/product.schema'
import { FaCheckCircle, FaTag } from 'react-icons/fa'

export interface PaymentFrequencySelectorProps {
    frequencies: PaymentFrequency[]
    selected: PaymentFrequency
    onChange: (frequency: PaymentFrequency) => void
    className?: string
    monthlyPrice?: number
    quarterlyPrice?: number
    yearlyPrice?: number
    biennialPrice?: number
}

/**
 * Payment frequency selector component with sales-focused design
 * Highlights savings for longer subscription commitments.
 * Baseline for savings is monthly when available, else quarterly.
 */
export const PaymentFrequencySelector = ({
    frequencies,
    selected,
    onChange,
    className = '',
    monthlyPrice,
    quarterlyPrice,
    yearlyPrice,
    biennialPrice
}: PaymentFrequencySelectorProps) => {
    if (frequencies.length <= 1) {
        return null
    }

    const hasMonthly = frequencies.includes('monthly')
    const hasQuarterly = frequencies.includes('quarterly')
    const hasYearly = frequencies.includes('yearly')
    const hasBiennial = frequencies.includes('biennial')

    // Baseline monthly-equivalent price for savings calculations.
    // If monthly isn't available, derive it from quarterly (quarterly / 3).
    const baselineMonthly =
        monthlyPrice ?? (quarterlyPrice !== undefined ? quarterlyPrice / 3 : undefined)

    const quarterlySavings =
        monthlyPrice && quarterlyPrice
            ? Math.round((1 - quarterlyPrice / (monthlyPrice * 3)) * 100)
            : null

    const yearlySavings =
        baselineMonthly && yearlyPrice
            ? Math.round((1 - yearlyPrice / (baselineMonthly * 12)) * 100)
            : null

    const biennialSavings =
        baselineMonthly && biennialPrice
            ? Math.round((1 - biennialPrice / (baselineMonthly * 24)) * 100)
            : null

    const showQuarterlySavings = hasQuarterly && quarterlySavings && quarterlySavings > 0
    const showYearlySavings = hasYearly && yearlySavings && yearlySavings > 0
    const showBiennialSavings = hasBiennial && biennialSavings && biennialSavings > 0

    const bestSavings = showBiennialSavings
        ? biennialSavings
        : showYearlySavings
          ? yearlySavings
          : quarterlySavings
    const bestSavingsLabel = showBiennialSavings
        ? '2 Years'
        : showYearlySavings
          ? 'Yearly'
          : 'Quarterly'

    const hasSavingsSelected =
        selected === 'quarterly' || selected === 'yearly' || selected === 'biennial'
    const currentSavings =
        selected === 'biennial'
            ? biennialSavings
            : selected === 'yearly'
              ? yearlySavings
              : selected === 'quarterly'
                ? quarterlySavings
                : null

    const isShortestCommitment = hasMonthly ? selected === 'monthly' : selected === 'quarterly'
    const comparedToLabel = hasMonthly ? 'monthly' : 'quarterly'

    return (
        <div className={`mb-6 ${className}`}>
            <label className='text-primary/80 mb-2 block text-sm font-medium'>
                Billing Frequency:
            </label>

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
                    {hasQuarterly && (
                        <button
                            type='button'
                            onClick={() => onChange('quarterly')}
                            className={`relative cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                selected === 'quarterly'
                                    ? hasMonthly
                                        ? 'bg-solution text-white shadow-md'
                                        : 'bg-primary text-background shadow-md'
                                    : 'text-primary/70 hover:bg-primary/10 hover:text-primary'
                            }`}
                            aria-pressed={selected === 'quarterly'}
                        >
                            <span className='flex items-center gap-2'>
                                Quarterly
                                {showQuarterlySavings && selected !== 'quarterly' && (
                                    <span className='bg-solution/20 text-solution rounded-full px-2 py-0.5 text-xs font-semibold'>
                                        -{quarterlySavings}%
                                    </span>
                                )}
                            </span>
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
                                compared to {comparedToLabel} billing
                            </span>
                        </div>
                    </div>
                )}

                {isShortestCommitment &&
                    (showQuarterlySavings || showYearlySavings || showBiennialSavings) && (
                        <div className='bg-primary/5 border-primary/10 flex items-center gap-3 rounded-lg border px-4 py-3'>
                            <FaTag className='text-primary/50 h-4 w-4 shrink-0' />
                            <span className='text-primary/60 text-sm'>
                                Save up to{' '}
                                <span className='text-solution font-semibold'>{bestSavings}%</span>{' '}
                                with {bestSavingsLabel} billing
                            </span>
                        </div>
                    )}
            </div>
        </div>
    )
}
