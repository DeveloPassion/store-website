import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaShoppingCart } from 'react-icons/fa'
import type { Product } from '@/types/product'
import { buildGumroadUrl } from '@/lib/gumroad-url'

interface StickyBuyButtonProps {
    product: Product
    /** Ref to the hero section buy button to track visibility */
    heroButtonRef?: React.RefObject<HTMLAnchorElement | null>
}

const StickyBuyButton: React.FC<StickyBuyButtonProps> = ({ product, heroButtonRef }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [selectedVariant] = useState(
        product.variants?.[0] || {
            name: 'Standard',
            price: product.price,
            priceDisplay: product.priceDisplay,
            description: '',
            gumroadUrl: product.gumroadUrl
        }
    )

    useEffect(() => {
        const handleScroll = () => {
            // Show sticky button when user has scrolled past 500px (roughly past hero section)
            // or when hero button is not in view
            if (heroButtonRef?.current) {
                const heroRect = heroButtonRef.current.getBoundingClientRect()
                const isHeroVisible = heroRect.top >= 0 && heroRect.bottom <= window.innerHeight
                setIsVisible(!isHeroVisible && window.scrollY > 300)
            } else {
                setIsVisible(window.scrollY > 500)
            }
        }

        // Initial check
        handleScroll()

        // Add scroll listener
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
                    className='border-primary/10 bg-background/95 fixed right-0 bottom-0 left-0 z-50 border-t shadow-2xl backdrop-blur-lg'
                >
                    <div className='container mx-auto max-w-7xl px-4 py-3 sm:px-6 md:px-8'>
                        <div className='flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4'>
                            {/* Product Info - Hidden on mobile for space */}
                            <div className='hidden sm:flex sm:flex-col sm:gap-1 md:flex-row md:items-center md:gap-4'>
                                <div>
                                    <div className='line-clamp-1 text-sm font-semibold md:text-base'>
                                        {product.name}
                                    </div>
                                    <div className='text-primary/60 text-xs'>{product.tagline}</div>
                                </div>
                                <div className='border-primary/20 hidden border-l pl-4 md:block'>
                                    <div className='text-primary/60 text-xs'>Price</div>
                                    <div className='text-secondary text-lg font-bold'>
                                        {selectedVariant.priceDisplay}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile: Compact layout */}
                            <div className='flex w-full items-center justify-between gap-3 sm:hidden'>
                                <div className='flex flex-col'>
                                    <div className='line-clamp-1 text-sm font-semibold'>
                                        {product.name}
                                    </div>
                                    <div className='text-secondary text-lg font-bold'>
                                        {selectedVariant.priceDisplay}
                                    </div>
                                </div>
                                <a
                                    href={buildGumroadUrl(selectedVariant.gumroadUrl)}
                                    data-gumroad-overlay-checkout='true'
                                    className='gumroad-button bg-secondary hover:bg-secondary/90 flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl'
                                >
                                    <FaShoppingCart className='h-4 w-4' />
                                    <span>Buy Now</span>
                                </a>
                            </div>

                            {/* Desktop/Tablet: Full CTA */}
                            <div className='hidden items-center gap-4 sm:flex'>
                                {product.guarantees.length > 0 && (
                                    <div className='text-primary/60 hidden text-xs lg:block'>
                                        {product.guarantees[0]}
                                    </div>
                                )}
                                <a
                                    href={buildGumroadUrl(selectedVariant.gumroadUrl)}
                                    data-gumroad-overlay-checkout='true'
                                    className='gumroad-button bg-secondary hover:bg-secondary/90 flex cursor-pointer items-center gap-2 rounded-lg px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl'
                                >
                                    <FaShoppingCart className='h-5 w-5' />
                                    <span>Buy {product.name} Now</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default StickyBuyButton
