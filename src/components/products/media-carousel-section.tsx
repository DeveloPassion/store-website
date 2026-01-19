import { useMemo } from 'react'
import { motion } from 'framer-motion'
import MediaCarousel from '@/components/products/media-carousel'
import MediaLightbox from '@/components/products/media-lightbox'
import { useMediaLightbox } from '@/hooks/use-media-lightbox'
import type { Product } from '@/schemas/product.schema'
import type { MediaGroup, MediaItem } from '@/schemas/media.schema'

interface MediaCarouselSectionProps {
    product: Product
    group: MediaGroup
    heading: string
    description?: React.ReactNode
    /** When true, includes all videos from the product regardless of their group */
    includeAllVideos?: boolean
}

/**
 * MediaCarouselSection displays a media carousel for a specific group.
 *
 * Supports configuration via product.salesCopy.mediaSections:
 * - null mediaSections = complete auto (show section with default heading, all media from group)
 * - show: false = section hidden regardless of media
 * - title/description: custom heading (null = use props)
 * - mediaIds: null = auto (all from group), [] = none, [ids] = explicit selection
 */
const MediaCarouselSection: React.FC<MediaCarouselSectionProps> = ({
    product,
    group,
    heading,
    description,
    includeAllVideos = false
}) => {
    const { isOpen, selectedIndex, open, close } = useMediaLightbox()

    // Get section config from sales copy (if defined)
    // Note: mediaSections only has main, secondary, bonus - not cover
    const sectionConfig = group === 'cover' ? undefined : product.salesCopy?.mediaSections?.[group]

    // Determine which media to show
    const groupMedia = useMemo(() => {
        // If explicit mediaIds provided (not null), look them up
        if (sectionConfig?.mediaIds !== null && sectionConfig?.mediaIds !== undefined) {
            if (sectionConfig.mediaIds.length === 0) {
                return [] // Empty array = no media (but may still show heading)
            }
            // Look up media by ID, preserving order
            const mediaMap = new Map(product.media?.map((m: MediaItem) => [m.id, m]) ?? [])
            return sectionConfig.mediaIds
                .map((id: string) => mediaMap.get(id))
                .filter((item): item is MediaItem => item !== undefined)
        }

        // Auto mode: filter by group (existing behavior)
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
    }, [product.media, group, includeAllVideos, sectionConfig])

    // If explicitly hidden, return null
    if (sectionConfig?.show === false) {
        return null
    }

    // Hide section if no media AND no explicit show:true
    if (groupMedia.length === 0 && sectionConfig?.show !== true) {
        return null
    }

    // Use custom title/description from config or props
    const finalHeading = sectionConfig?.title ?? heading
    const finalDescription = sectionConfig?.description ?? description

    // If no media but show is true, display heading only
    if (groupMedia.length === 0 && sectionConfig?.show === true) {
        return (
            <section className='bg-background/50 w-full py-16 sm:py-20'>
                <div className='container mx-auto max-w-6xl px-6 sm:px-10 md:px-16'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className='text-center'>
                            <h2 className='mb-4 text-3xl font-bold sm:text-4xl'>{finalHeading}</h2>
                            {finalDescription && (
                                <p className='text-primary/70 mx-auto max-w-2xl'>
                                    {finalDescription}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>
        )
    }

    return (
        <>
            <section className='bg-background/50 w-full py-16 sm:py-20'>
                <div className='container mx-auto max-w-6xl px-6 sm:px-10 md:px-16'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Section Header */}
                        <div className='mb-12 text-center'>
                            <h2 className='mb-4 text-3xl font-bold sm:text-4xl'>{finalHeading}</h2>
                            {finalDescription && (
                                <p className='text-primary/70 mx-auto max-w-2xl'>
                                    {finalDescription}
                                </p>
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
