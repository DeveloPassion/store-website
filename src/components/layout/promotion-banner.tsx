import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { FaTimes, FaCopy, FaCheck } from 'react-icons/fa'
import promotionConfig from '@/data/promotion.json'
import type { PromotionConfig } from '@/schemas/promotion.schema'

const STORAGE_KEY = 'promo-banner-dismissed'

const PromotionBanner: React.FC = () => {
    const config = promotionConfig as PromotionConfig
    // Initialize state from sessionStorage (lazy initialization)
    const [isDismissed, setIsDismissed] = useState(() => {
        return sessionStorage.getItem(STORAGE_KEY) === 'true'
    })
    const [isCopied, setIsCopied] = useState(false)

    // Handle dismiss
    const handleDismiss = () => {
        setIsDismissed(true)
        sessionStorage.setItem(STORAGE_KEY, 'true')
    }

    // Handle copy discount code to clipboard
    const handleCopyDiscountCode = useCallback(async () => {
        if (!config.discountCode) return

        try {
            await navigator.clipboard.writeText(config.discountCode)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy discount code:', err)
        }
    }, [config.discountCode])

    // Determine if banner should be visible
    const isVisible = useMemo(() => {
        try {
            if (config.bannerBehavior === 'NEVER') {
                return false
            }

            if (config.bannerBehavior === 'ALWAYS') {
                return true
            }

            // PROMOTIONS mode - check dates
            if (config.bannerBehavior === 'PROMOTIONS') {
                if (!config.promotionStart || !config.promotionEnd) {
                    console.error('Promotion dates not configured for PROMOTIONS mode')
                    return false
                }

                const now = new Date()
                const start = new Date(config.promotionStart)
                const end = new Date(config.promotionEnd)

                // Check for invalid dates
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    console.error('Invalid promotion dates')
                    return false
                }

                return now >= start && now <= end
            }

            return false
        } catch (error) {
            console.error('Error calculating banner visibility:', error)
            return false
        }
    }, [config])

    // Don't render if not visible or dismissed
    if (!isVisible || isDismissed) {
        return null
    }

    return (
        <div className='border-b border-amber-600/20 bg-amber-500/10 px-4 py-2 text-sm'>
            <div className='flex items-center justify-between gap-4'>
                <p className='text-primary/80 flex-1 text-center'>
                    {config.promoText}{' '}
                    {config.promoLinkText && config.promoLink && (
                        <>
                            {config.promoLink.startsWith('http://') ||
                            config.promoLink.startsWith('https://') ? (
                                <a
                                    href={config.promoLink}
                                    className='text-amber-600 underline transition-colors hover:text-amber-400'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    {config.promoLinkText}
                                </a>
                            ) : (
                                <Link
                                    to={config.promoLink}
                                    className='text-amber-600 underline transition-colors hover:text-amber-400'
                                >
                                    {config.promoLinkText}
                                </Link>
                            )}
                        </>
                    )}
                    {config.discountCode && (
                        <button
                            onClick={handleCopyDiscountCode}
                            className='ml-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 transition-colors hover:bg-amber-600/20'
                            aria-label={`Copy discount code ${config.discountCode}`}
                            title={isCopied ? 'Copied!' : 'Click to copy'}
                        >
                            <span className='text-amber-600'>({config.discountCode})</span>
                            {isCopied ? (
                                <FaCheck className='h-3 w-3 text-green-500' />
                            ) : (
                                <FaCopy className='h-3 w-3 text-amber-600/70 hover:text-amber-600' />
                            )}
                        </button>
                    )}
                </p>
                <button
                    onClick={handleDismiss}
                    className='text-primary/40 hover:text-primary/60 flex-shrink-0 rounded p-1 transition-colors hover:bg-amber-600/10'
                    aria-label='Dismiss promotion banner'
                >
                    <FaTimes className='h-3 w-3' />
                </button>
            </div>
        </div>
    )
}

export default PromotionBanner
