import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FaPlay } from 'react-icons/fa'
import type { Product } from '@/schemas/product.schema'
import { extractYouTubeId } from '@/components/products/media-item'

type VideoPosition = 1 | 2 | 3

interface CoverVideoSpotProps {
    product: Product
    position: VideoPosition
}

/**
 * Configuration for each video position with conversion-focused messaging
 */
const POSITION_CONFIG: Record<VideoPosition, { heading: string; subheading: string }> = {
    1: {
        heading: 'See How It Works',
        subheading: 'Watch a quick walkthrough and discover what makes this different'
    },
    2: {
        heading: 'Watch It In Action',
        subheading: 'See the real results you can achieve'
    },
    3: {
        heading: 'One More Thing...',
        subheading: "Before you decide, here's something you shouldn't miss"
    }
}

/**
 * CoverVideoSpot displays a single cover video at strategic positions
 * on the product page to maximize conversions.
 *
 * - Position 1: After PAS section (Problem-Agitate-Solution)
 * - Position 2: After Benefits section
 * - Position 3: Before CTA section
 *
 * The first cover video (order 0) is skipped since it's already displayed
 * in the hero section carousel. Positions use videos starting from index 1.
 *
 * Only displays if a cover video exists at the given position index.
 * Returns null if no video is available.
 */
const CoverVideoSpot: React.FC<CoverVideoSpotProps> = ({ product, position }) => {
    const [videoPlaying, setVideoPlaying] = useState(false)

    // Filter cover videos from media and sort by order
    const coverVideos = useMemo(() => {
        if (!product.media || product.media.length === 0) {
            return []
        }

        return product.media
            .filter((item) => item.type === 'video' && item.group === 'cover')
            .sort((a, b) => a.order - b.order)
    }, [product.media])

    // Get the video for this position
    // Skip the first video (index 0) as it's shown in the hero carousel
    // Position 1 → index 1, Position 2 → index 2, Position 3 → index 3
    const video = coverVideos[position]

    // Don't render if no video at this position
    if (!video) {
        return null
    }

    const youtubeId = video.youtubeId || extractYouTubeId(video.url)
    const thumbnailUrl =
        video.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    const config = POSITION_CONFIG[position]

    if (!youtubeId) {
        return null
    }

    const handleVideoClick = () => {
        setVideoPlaying(true)
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
                    {/* Section Header */}
                    <div className='mb-8 text-center'>
                        <h2 className='mb-3 text-2xl font-bold sm:text-3xl'>{config.heading}</h2>
                        <p className='text-primary/70 mx-auto max-w-xl text-sm sm:text-base'>
                            {config.subheading}
                        </p>
                    </div>

                    {/* Video Container */}
                    <motion.div
                        className='group relative aspect-video overflow-hidden rounded-xl shadow-xl transition-all hover:shadow-2xl'
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                    >
                        {videoPlaying ? (
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                                title={video.title}
                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                allowFullScreen
                                className='absolute inset-0 h-full w-full'
                            />
                        ) : (
                            <>
                                {/* Thumbnail */}
                                <img
                                    src={thumbnailUrl}
                                    alt={video.altText || video.title}
                                    className='h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105'
                                    loading='lazy'
                                    onClick={handleVideoClick}
                                />

                                {/* Play Button Overlay */}
                                <div
                                    className='absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 transition-all duration-300 group-hover:bg-black/50'
                                    onClick={handleVideoClick}
                                    role='button'
                                    tabIndex={0}
                                    aria-label={`Play video: ${video.title}`}
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

                    {/* Caption */}
                    {video.caption && (
                        <p className='text-primary/60 mt-4 text-center text-sm italic'>
                            {video.caption}
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

export default CoverVideoSpot
