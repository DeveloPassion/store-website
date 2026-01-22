import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaShoppingCart } from 'react-icons/fa'
import type { Product, ProductVariant } from '@/schemas/product.schema'
import type { PaymentFrequency } from '@/schemas/product.schema'
import { buildGumroadUrlFromProduct } from '@/lib/gumroad-url'
import { Button } from '@/components/ui/button'
import { MarkdownContent } from '@/components/ui/markdown-content'

interface StickyBuyButtonProps {
    product: Product
    /** Ref to the hero section buy button to track visibility */
    heroButtonRef?: React.RefObject<HTMLAnchorElement | null>
    /** Selected variant from parent (lifted state) */
    selectedVariant?: ProductVariant
    /** Selected payment frequency from parent (lifted state) */
    selectedFrequency?: PaymentFrequency
}

const StickyBuyButton: React.FC<StickyBuyButtonProps> = ({
    product,
    heroButtonRef,
    selectedVariant: controlledVariant,
    selectedFrequency: controlledFrequency
}) => {
    const [isVisible, setIsVisible] = useState(false)

    const defaultVariant: ProductVariant = product.variants?.[0] || {
        name: 'Standard',
        price: product.price,
        priceDisplay: product.priceDisplay,
        description: '',
        gumroadUrl: product.gumroadUrl,
        gumroadVariantId: null,
        paymentFrequency: null,
        prices: null,
        includedProducts: []
    }
    const selectedVariant = controlledVariant || defaultVariant
    const selectedFrequency = controlledFrequency || product.defaultPaymentFrequency || 'monthly'
    const isFree = product.price === 0 || product.priceTier === 'free'

    const getDisplayPrice = (): string => {
        if (!product.isSubscription || !selectedVariant.prices) {
            return selectedVariant.priceDisplay
        }

        const price =
            selectedFrequency === 'yearly'
                ? selectedVariant.prices.yearly
                : selectedFrequency === 'biennial'
                  ? selectedVariant.prices.biennial
                  : selectedVariant.prices.monthly

        if (!price) return selectedVariant.priceDisplay

        const frequencyLabel =
            selectedFrequency === 'yearly'
                ? '/year'
                : selectedFrequency === 'biennial'
                  ? '/2 years'
                  : '/month'

        return `€${price.toFixed(2)}${frequencyLabel}`
    }

    const displayPrice = getDisplayPrice()
    const buttonText = isFree ? 'Get Now' : 'Buy Now'
    const buttonTextWithPrice = isFree ? 'Get Now' : `Buy (${displayPrice})`
    const gumroadUrl = buildGumroadUrlFromProduct(product, selectedVariant, selectedFrequency)

    useEffect(() => {
        const handleScroll = () => {
            if (heroButtonRef?.current) {
                const heroRect = heroButtonRef.current.getBoundingClientRect()
                const isHeroVisible = heroRect.top >= 0 && heroRect.bottom <= window.innerHeight
                setIsVisible(!isHeroVisible && window.scrollY > 300)
            } else {
                setIsVisible(window.scrollY > 500)
            }
        }

        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [heroButtonRef])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className='border-primary/10 bg-background/95 fixed inset-x-0 bottom-0 z-50 w-full border-t shadow-2xl backdrop-blur-lg'
                >
                    <div className='flex w-full items-center justify-between gap-4 px-4 py-3'>
                        {/* Left: Product info */}
                        <div className='flex min-w-0 flex-1 items-center gap-4'>
                            {/* Name + Tagline */}
                            <div className='min-w-0 flex-1'>
                                <div className='truncate text-sm font-semibold sm:text-base'>
                                    {product.name}
                                </div>
                                {product.salesCopy?.tagline && (
                                    <div className='text-primary/60 hidden truncate text-xs sm:block'>
                                        <MarkdownContent
                                            content={product.salesCopy.tagline}
                                            inline
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Price - hidden on very small screens (<400px), shown in button instead */}
                            <div className='border-primary/20 shrink-0 max-[400px]:hidden md:border-l md:pl-4'>
                                <div className='text-primary/60 hidden text-xs md:block'>Price</div>
                                <div className='text-secondary text-lg font-bold'>
                                    {displayPrice}
                                </div>
                            </div>
                        </div>

                        {/* Right: CTA */}
                        <div className='flex shrink-0 items-center gap-4'>
                            {/* Guarantee - only on large screens */}
                            {product.salesCopy?.guarantees?.[0] && (
                                <MarkdownContent
                                    content={product.salesCopy.guarantees[0]}
                                    inline
                                    className='text-primary/60 hidden text-xs lg:block'
                                />
                            )}

                            <Button
                                as='a'
                                href={gumroadUrl}
                                data-gumroad-overlay-checkout='true'
                                size='md'
                                leftIcon={<FaShoppingCart className='h-4 w-4' />}
                                className='whitespace-nowrap hover:!scale-100'
                            >
                                {/* Very small screens: show price in button */}
                                <span className='hidden max-[400px]:inline'>
                                    {buttonTextWithPrice}
                                </span>
                                <span className='max-[400px]:hidden'>{buttonText}</span>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default StickyBuyButton
