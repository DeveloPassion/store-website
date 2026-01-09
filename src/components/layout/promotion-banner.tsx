import { useMemo } from 'react'
import { Link } from 'react-router'
import promotionConfig from '@/data/promotion.json'
import type { PromotionConfig } from '@/types/promotion'

const PromotionBanner: React.FC = () => {
    const config = promotionConfig as PromotionConfig

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

    // Don't render if not visible
    if (!isVisible) {
        return null
    }

    return (
        <div className='bg-secondary/10 border-secondary/20 border-b px-4 py-2 text-center text-sm'>
            <p className='text-primary/80'>
                {config.promoText}{' '}
                {config.promoLinkText && (
                    <Link
                        to={config.promoLink}
                        className='text-secondary hover:text-secondary-text underline'
                    >
                        {config.promoLinkText}
                    </Link>
                )}
                {config.discountCode && <span className='ml-1'>({config.discountCode})</span>}
            </p>
        </div>
    )
}

export default PromotionBanner
