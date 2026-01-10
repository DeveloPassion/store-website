import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { FaTimes } from 'react-icons/fa'
import promotionConfig from '@/data/promotion.json'
import type { PromotionConfig } from '@/types/promotion'

const STORAGE_KEY = 'promo-banner-dismissed'

const PromotionBanner: React.FC = () => {
    const config = promotionConfig as PromotionConfig
    // Initialize state from sessionStorage (lazy initialization)
    const [isDismissed, setIsDismissed] = useState(() => {
        return sessionStorage.getItem(STORAGE_KEY) === 'true'
    })

    // Handle dismiss
    const handleDismiss = () => {
        setIsDismissed(true)
        sessionStorage.setItem(STORAGE_KEY, 'true')
    }

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
        <div className='relative border-b border-amber-600/20 bg-amber-500/10 px-4 py-2 text-center text-sm'>
            <p className='text-primary/80'>
                {config.promoText}{' '}
                {config.promoLinkText && (
                    <>
                        {config.promoLink.startsWith('http://') ||
                        config.promoLink.startsWith('https://') ? (
                            <a
                                href={config.promoLink}
                                className='text-amber-600 underline hover:text-amber-700'
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                {config.promoLinkText}
                            </a>
                        ) : (
                            <Link
                                to={config.promoLink}
                                className='text-amber-600 underline hover:text-amber-700'
                            >
                                {config.promoLinkText}
                            </Link>
                        )}
                    </>
                )}
                {config.discountCode && <span className='ml-1'>({config.discountCode})</span>}
            </p>
            <button
                onClick={handleDismiss}
                className='text-primary/40 hover:text-primary/60 absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 transition-colors hover:bg-amber-600/10'
                aria-label='Dismiss promotion banner'
            >
                <FaTimes className='h-3 w-3' />
            </button>
        </div>
    )
}

export default PromotionBanner
