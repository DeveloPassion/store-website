import { useMemo } from 'react'
import { motion } from 'framer-motion'
import MediaCarousel from '@/components/products/media-carousel'
import MediaLightbox from '@/components/products/media-lightbox'
import { useMediaLightbox } from '@/hooks/use-media-lightbox'
import type { Product } from '@/schemas/product.schema'
import type { MediaGroup } from '@/schemas/media.schema'

interface MediaCarouselSectionProps {
    product: Product
    group: MediaGroup
    heading: string
    description?: React.ReactNode
    /** When true, includes all videos from the product regardless of their group */
    includeAllVideos?: boolean
}

const MediaCarouselSection: React.FC<MediaCarouselSectionProps> = ({
    product,
    group,
    heading,
    description,
    includeAllVideos = false
}) => {
    const { isOpen, selectedIndex, open, close } = useMediaLightbox()

    // Filter media by group and sort by order
    // When includeAllVideos is true, include all videos regardless of their group
    const groupMedia = useMemo(() => {
        if (!product.media || product.media.length === 0) {
            return []
        }

        return product.media
            .filter((item) => {
                // Include items from this group
                if (item.group === group) return true
                // When includeAllVideos is enabled, include all videos
                if (includeAllVideos && item.type === 'video') return true
                return false
            })
            .sort((a, b) => a.order - b.order)
    }, [product.media, group, includeAllVideos])

    // Don't render if no media in this group
    if (groupMedia.length === 0) {
        return null
    }

    return (
        <>
            <section className='bg-background/50 py-16 sm:py-20'>
                <div className='container mx-auto max-w-6xl px-6 sm:px-10 md:px-16'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Section Header */}
                        <div className='mb-12 text-center'>
                            <h2 className='mb-4 text-3xl font-bold sm:text-4xl'>{heading}</h2>
                            {description && (
                                <p className='text-primary/70 mx-auto max-w-2xl'>{description}</p>
                            )}
                        </div>

                        {/* Media Carousel */}
                        <MediaCarousel
                            media={groupMedia}
                            group={group}
                            showCaptions={true}
                            onMediaClick={open}
                        />
                    </motion.div>
                </div>
            </section>

            {/* Lightbox for media (images and videos) */}
            {groupMedia.length > 0 && (
                <MediaLightbox
                    mediaItems={groupMedia}
                    initialIndex={selectedIndex}
                    isOpen={isOpen}
                    onClose={close}
                />
            )}
        </>
    )
}

export default MediaCarouselSection
