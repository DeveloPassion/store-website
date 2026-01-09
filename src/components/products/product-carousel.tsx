import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import type { Product } from '@/types/product'

interface ProductCarouselProps {
    products: Product[]
    autoRotateInterval?: number
    showNavigation?: boolean
    showIndicators?: boolean
    className?: string
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
    products,
    autoRotateInterval = 7000,
    showNavigation = true,
    showIndicators = true,
    className
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [slidesPerView, setSlidesPerView] = useState<1 | 2>(
        typeof window !== 'undefined' && window.innerWidth >= 800 ? 2 : 1
    )

    // Handle window resize for responsive slides
    useEffect(() => {
        const handleResize = () => {
            // Show 2 products side-by-side at 800px+
            const newSlidesPerView = window.innerWidth >= 800 ? 2 : 1
            setSlidesPerView(newSlidesPerView)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Group products by slides per view
    const slideGroups = useMemo(() => {
        const groups: Product[][] = []
        for (let i = 0; i < products.length; i += slidesPerView) {
            groups.push(products.slice(i, i + slidesPerView))
        }
        return groups
    }, [products, slidesPerView])

    // Reset index if out of bounds (when products or slidesPerView changes)
    // Reset index when slideGroups changes
    useEffect(() => {
        if (currentIndex >= slideGroups.length && slideGroups.length > 0) {
            setCurrentIndex(0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slideGroups.length])

    // Auto-rotation
    useEffect(() => {
        if (slideGroups.length <= 1) return

        const interval = setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % slideGroups.length)
        }, autoRotateInterval)

        return () => clearInterval(interval)
    }, [slideGroups.length, autoRotateInterval])

    const goToNext = () => {
        if (slideGroups.length <= 1) return
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % slideGroups.length)
    }

    const goToPrevious = () => {
        if (slideGroups.length <= 1) return
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + slideGroups.length) % slideGroups.length)
    }

    const goToSlide = (index: number) => {
        if (slideGroups.length <= 1) return
        setDirection(index > currentIndex ? 1 : -1)
        setCurrentIndex(index)
    }

    // Don't render if no products
    if (products.length === 0) {
        return null
    }

    const currentSlideGroup = slideGroups[currentIndex]

    if (!currentSlideGroup) {
        return null
    }

    // Animation variants matching testimonial carousel
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    }

    return (
        <div className={cn('relative px-12', className)}>
            {/* Carousel container */}
            <div className='relative overflow-hidden'>
                <AnimatePresence initial={false} custom={direction} mode='wait'>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial='enter'
                        animate='center'
                        exit='exit'
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className={cn(
                            'grid gap-6',
                            slidesPerView === 2 ? 'grid-cols-2' : 'grid-cols-1'
                        )}
                    >
                        {currentSlideGroup.map((product) => (
                            <ProductCardEcommerce
                                key={product.id}
                                product={product}
                                compactBadges={slidesPerView === 2}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            {showNavigation && slideGroups.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 p-3 transition-all hover:scale-110 hover:text-white'
                        aria-label='Previous slide'
                    >
                        <FaChevronLeft className='h-5 w-5' />
                    </button>
                    <button
                        onClick={goToNext}
                        className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 p-3 transition-all hover:scale-110 hover:text-white'
                        aria-label='Next slide'
                    >
                        <FaChevronRight className='h-5 w-5' />
                    </button>
                </>
            )}

            {/* Dot indicators */}
            {showIndicators && slideGroups.length > 1 && (
                <div className='mt-8 flex justify-center gap-2'>
                    {slideGroups.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className={`h-2 cursor-pointer rounded-full transition-all ${
                                idx === currentIndex
                                    ? 'bg-secondary w-8'
                                    : 'bg-primary/20 hover:bg-primary/40 w-2'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProductCarousel
