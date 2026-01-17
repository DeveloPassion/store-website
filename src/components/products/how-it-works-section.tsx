import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FaPlay } from 'react-icons/fa'
import type { Product } from '@/schemas/product.schema'
import type { MediaItem } from '@/schemas/media.schema'
import { extractYouTubeId } from '@/components/products/media-item'
import MediaCarousel from '@/components/products/media-carousel'
import MediaLightbox from '@/components/products/media-lightbox'
import { useMediaLightbox } from '@/hooks/use-media-lightbox'

interface HowItWorksSectionProps {
    product: Product
}

/**
 * Default configuration for the "How It Works" section
 */
const DEFAULT_CONFIG = {
    title: 'See How It Works',
    description: 'Watch a quick walkthrough and discover what makes this different'
}

/**
 * HowItWorksSection displays a configurable media showcase section on product pages.
 *
 * Features:
 * - Controlled by product.salesCopy.howItWorks configuration
 * - null howItWorks = section hidden
 * - Custom title and description (null = use defaults)
 * - Explicit media selection via mediaIds array
 * - Supports both images and videos
 * - Uses carousel for multiple items, single view for one item
 * - Empty mediaIds = show heading only, no media
 */
const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ product }) => {
    const [videoPlaying, setVideoPlaying] = useState<string | null>(null)
    const { isOpen, selectedIndex, open, close } = useMediaLightbox()

    // Get the howItWorks configuration from sales copy
    const howItWorks = product.salesCopy?.howItWorks

    // Look up media items by ID, preserving order from mediaIds
    const mediaItems = useMemo(() => {
        if (!howItWorks || !howItWorks.mediaIds || howItWorks.mediaIds.length === 0) {
            return []
        }

        if (!product.media || product.media.length === 0) {
            return []
        }

        const mediaMap = new Map(product.media.map((m) => [m.id, m]))
        return howItWorks.mediaIds
            .map((id) => mediaMap.get(id))
            .filter((item): item is MediaItem => item !== undefined)
    }, [product.media, howItWorks])

    // If howItWorks is null, section is hidden
    if (!howItWorks) {
        return null
    }

    // Use custom title/description or defaults
    const title = howItWorks.title ?? DEFAULT_CONFIG.title
    const description = howItWorks.description ?? DEFAULT_CONFIG.description

    // If no media, show heading only
    if (mediaItems.length === 0) {
        return (
            <section className='bg-background/30 py-12 sm:py-16'>
                <div className='container mx-auto max-w-4xl px-6 sm:px-10 md:px-16'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className='text-center'>
                            <h2 className='mb-3 text-2xl font-bold sm:text-3xl'>{title}</h2>
                            <p className='text-primary/70 mx-auto max-w-xl text-sm sm:text-base'>
                                {description}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        )
    }

    // Single media item - use focused display
    if (mediaItems.length === 1) {
        const item = mediaItems[0]!

        if (item.type === 'video') {
            const youtubeId = item.youtubeId || extractYouTubeId(item.url)
            const thumbnailUrl =
                item.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`

            if (!youtubeId) {
                return null
            }

            const handleVideoClick = () => {
                setVideoPlaying(item.id)
            }

            return (
                <section className='bg-background/30 py-12 sm:py-16'>
                    <div className='container mx-auto max-w-4xl px-6 sm:px-10 md:px-16'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className='mb-8 text-center'>
                                <h2 className='mb-3 text-2xl font-bold sm:text-3xl'>{title}</h2>
                                <p className='text-primary/70 mx-auto max-w-xl text-sm sm:text-base'>
                                    {description}
                                </p>
                            </div>

                            <motion.div
                                className='group relative aspect-video overflow-hidden rounded-xl shadow-xl transition-all hover:shadow-2xl'
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.3 }}
                            >
                                {videoPlaying === item.id ? (
                                    <iframe
                                        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                                        title={item.title}
                                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                        allowFullScreen
                                        className='absolute inset-0 h-full w-full'
                                    />
                                ) : (
                                    <>
                                        <img
                                            src={thumbnailUrl}
                                            alt={item.altText || item.title}
                                            className='h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105'
                                            loading='lazy'
                                            onClick={handleVideoClick}
                                        />
                                        <div
                                            className='absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 transition-all duration-300 group-hover:bg-black/50'
                                            onClick={handleVideoClick}
                                            role='button'
                                            tabIndex={0}
                                            aria-label={`Play video: ${item.title}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    handleVideoClick()
                                                }
                                            }}
                                        >
                                            <motion.div
                                                className='bg-secondary flex h-16 w-16 items-center justify-center rounded-full shadow-lg sm:h-20 sm:w-20'
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <FaPlay
                                                    className='ml-1 h-6 w-6 text-white sm:h-8 sm:w-8'
                                                    aria-hidden='true'
                                                />
                                            </motion.div>
                                            <span className='mt-4 text-sm font-medium text-white/90 sm:text-base'>
                                                Click to play
                                            </span>
                                        </div>
                                    </>
                                )}
                            </motion.div>

                            {item.caption && (
                                <p className='text-primary/60 mt-4 text-center text-sm italic'>
                                    {item.caption}
                                </p>
                            )}
                        </motion.div>
                    </div>
                </section>
            )
        }

        // Single image
        return (
            <section className='bg-background/30 py-12 sm:py-16'>
                <div className='container mx-auto max-w-4xl px-6 sm:px-10 md:px-16'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className='mb-8 text-center'>
                            <h2 className='mb-3 text-2xl font-bold sm:text-3xl'>{title}</h2>
                            <p className='text-primary/70 mx-auto max-w-xl text-sm sm:text-base'>
                                {description}
                            </p>
                        </div>

                        <motion.div
                            className='group relative overflow-hidden rounded-xl shadow-xl transition-all hover:shadow-2xl'
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img
                                src={item.url}
                                alt={item.altText || item.title}
                                className='h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105'
                                loading='lazy'
                                onClick={() => open(item, 0)}
                            />
                        </motion.div>

                        {item.caption && (
                            <p className='text-primary/60 mt-4 text-center text-sm italic'>
                                {item.caption}
                            </p>
                        )}
                    </motion.div>
                </div>

                <MediaLightbox
                    mediaItems={mediaItems}
                    initialIndex={selectedIndex}
                    isOpen={isOpen}
                    onClose={close}
                />
            </section>
        )
    }

    // Multiple media items - use carousel
    return (
        <>
            <section className='bg-background/30 py-12 sm:py-16'>
                <div className='container mx-auto max-w-6xl px-6 sm:px-10 md:px-16'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className='mb-12 text-center'>
                            <h2 className='mb-4 text-3xl font-bold sm:text-4xl'>{title}</h2>
                            <p className='text-primary/70 mx-auto max-w-2xl'>{description}</p>
                        </div>

                        <MediaCarousel
                            media={mediaItems}
                            group='main'
                            showCaptions={true}
                            onMediaClick={open}
                        />
                    </motion.div>
                </div>
            </section>

            <MediaLightbox
                mediaItems={mediaItems}
                initialIndex={selectedIndex}
                isOpen={isOpen}
                onClose={close}
            />
        </>
    )
}

export default HowItWorksSection
