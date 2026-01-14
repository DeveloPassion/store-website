import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import MediaItem from '@/components/products/media-item'
import type { MediaItem as MediaItemType, MediaGroup } from '@/schemas/media.schema'

interface MediaCarouselProps {
    media: MediaItemType[]
    group: MediaGroup // For styling/context
    autoRotateInterval?: number
    showNavigation?: boolean
    showIndicators?: boolean
    showCaptions?: boolean
    className?: string
    onMediaClick?: (item: MediaItemType, index: number) => void
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({
    media,
    group,
    autoRotateInterval = 7000,
    showNavigation = true,
    showIndicators = true,
    showCaptions = false,
    className,
    onMediaClick
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    // Sort media by order
    const sortedMedia = useMemo(() => {
        return [...media].sort((a, b) => a.order - b.order)
    }, [media])

    // Navigation functions
    const goToNext = useCallback(() => {
        if (sortedMedia.length <= 1) return
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % sortedMedia.length)
    }, [sortedMedia.length])

    const goToPrevious = useCallback(() => {
        if (sortedMedia.length <= 1) return
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + sortedMedia.length) % sortedMedia.length)
    }, [sortedMedia.length])

    // Auto-rotation (pause on hover)
    useEffect(() => {
        if (sortedMedia.length <= 1 || isHovered) return

        const interval = setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % sortedMedia.length)
        }, autoRotateInterval)

        return () => clearInterval(interval)
    }, [sortedMedia.length, autoRotateInterval, isHovered])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                goToPrevious()
            } else if (event.key === 'ArrowRight') {
                goToNext()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [goToNext, goToPrevious])

    const goToSlide = (index: number) => {
        if (sortedMedia.length <= 1) return
        setDirection(index > currentIndex ? 1 : -1)
        setCurrentIndex(index)
    }

    // Don't render if no media
    if (sortedMedia.length === 0) {
        return null
    }

    const currentMedia = sortedMedia[currentIndex]

    if (!currentMedia) {
        return null
    }

    // Animation variants matching product carousel
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

    const handleMediaClick = () => {
        if (onMediaClick && currentMedia.type === 'image') {
            onMediaClick(currentMedia, currentIndex)
        }
    }

    return (
        <div
            className={cn('relative', className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role='region'
            aria-roledescription='carousel'
            aria-label={`${group} media carousel`}
        >
            {/* Carousel container with navigation */}
            <div className='flex items-center gap-2 sm:gap-4'>
                {/* Previous button */}
                {showNavigation && sortedMedia.length > 1 && (
                    <button
                        onClick={goToPrevious}
                        className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary focus:ring-secondary z-10 shrink-0 cursor-pointer rounded-full border-2 p-2 transition-all hover:scale-110 hover:text-white focus:ring-2 focus:outline-none sm:p-3'
                        aria-label='Previous media'
                    >
                        <FaChevronLeft className='h-4 w-4 sm:h-5 sm:w-5' aria-hidden='true' />
                    </button>
                )}

                {/* Carousel content */}
                <div className='relative min-w-0 flex-1 overflow-hidden'>
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
                            className='flex justify-center'
                        >
                            <div className='w-full max-w-3xl'>
                                <MediaItem
                                    item={currentMedia}
                                    showCaption={showCaptions}
                                    onImageClick={handleMediaClick}
                                    priority={currentIndex === 0} // First item eager loads
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Next button */}
                {showNavigation && sortedMedia.length > 1 && (
                    <button
                        onClick={goToNext}
                        className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary focus:ring-secondary z-10 shrink-0 cursor-pointer rounded-full border-2 p-2 transition-all hover:scale-110 hover:text-white focus:ring-2 focus:outline-none sm:p-3'
                        aria-label='Next media'
                    >
                        <FaChevronRight className='h-4 w-4 sm:h-5 sm:w-5' aria-hidden='true' />
                    </button>
                )}
            </div>

            {/* Indicators - Counter for many items, dots for few */}
            {showIndicators && sortedMedia.length > 1 && (
                <div className='mt-6 flex justify-center'>
                    {sortedMedia.length > 5 ? (
                        /* Counter for many items */
                        <div className='text-primary/60 text-sm'>
                            {currentIndex + 1} / {sortedMedia.length}
                        </div>
                    ) : (
                        /* Dot indicators for few items */
                        <div className='flex gap-2'>
                            {sortedMedia.map((item, idx) => (
                                <button
                                    key={item.id}
                                    onClick={() => goToSlide(idx)}
                                    className={`focus:ring-secondary h-2 cursor-pointer rounded-full transition-all focus:ring-2 focus:outline-none ${
                                        idx === currentIndex
                                            ? 'bg-secondary w-8'
                                            : 'bg-primary/20 hover:bg-primary/40 w-2'
                                    }`}
                                    aria-label={`Go to ${item.title}`}
                                    aria-current={idx === currentIndex ? 'true' : 'false'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Screen reader: Current slide info */}
            <div className='sr-only' aria-live='polite' aria-atomic='true'>
                {`Showing ${currentMedia.title}, item ${currentIndex + 1} of ${sortedMedia.length}`}
            </div>
        </div>
    )
}

export default MediaCarousel
