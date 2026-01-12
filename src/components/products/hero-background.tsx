import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MediaItem } from '@/types/product'

interface HeroBackgroundProps {
    /** Banner images to rotate through */
    bannerImages: MediaItem[]
    /** Auto-rotation interval in milliseconds */
    autoRotateInterval?: number
}

/**
 * Rotating background component for product hero sections.
 * Cycles through banner images with smooth transitions.
 */
const HeroBackground: React.FC<HeroBackgroundProps> = ({
    bannerImages,
    autoRotateInterval = 7000
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Sort banner images by order
    const sortedImages = useMemo(() => {
        return [...bannerImages]
            .filter((item) => item.type === 'image')
            .sort((a, b) => a.order - b.order)
    }, [bannerImages])

    // Auto-rotation
    useEffect(() => {
        if (sortedImages.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % sortedImages.length)
        }, autoRotateInterval)

        return () => clearInterval(interval)
    }, [sortedImages.length, autoRotateInterval])

    // Don't render if no images
    if (sortedImages.length === 0) {
        return null
    }

    const currentImage = sortedImages[currentIndex]

    if (!currentImage) {
        return null
    }

    return (
        <div className='absolute inset-0 overflow-hidden'>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className='absolute inset-0'
                >
                    {/* Background image with overlay for readability */}
                    <div
                        className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                        style={{
                            backgroundImage: `url(${currentImage.url})`
                        }}
                    />
                    {/* Dark overlay for text readability */}
                    <div className='from-background/70 via-background/80 to-background/90 absolute inset-0 bg-gradient-to-b' />
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default HeroBackground
