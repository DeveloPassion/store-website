import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import MediaCarousel from '@/components/products/media-carousel'
import MediaLightbox from '@/components/products/media-lightbox'
import type { Product, MediaGroup } from '@/types/product'

interface MediaCarouselSectionProps {
    product: Product
    group: MediaGroup
    heading: string
    description?: string
}

const MediaCarouselSection: React.FC<MediaCarouselSectionProps> = ({
    product,
    group,
    heading,
    description
}) => {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)

    // Filter media by group and sort by order
    const groupMedia = useMemo(() => {
        if (!product.media || product.media.length === 0) {
            return []
        }

        return product.media
            .filter((item) => item.group === group)
            .sort((a, b) => a.order - b.order)
    }, [product.media, group])

    // Filter only images for lightbox
    const imageMedia = useMemo(() => {
        return groupMedia.filter((item) => item.type === 'image')
    }, [groupMedia])

    const openLightbox = (_item: unknown, carouselIndex: number) => {
        // Find the actual image index in the imageMedia array
        const currentMedia = groupMedia[carouselIndex]
        if (currentMedia?.type === 'image') {
            const imageIndex = imageMedia.findIndex((img) => img.id === currentMedia.id)
            setSelectedMediaIndex(imageIndex >= 0 ? imageIndex : 0)
            setLightboxOpen(true)
        }
    }

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
                            onMediaClick={openLightbox}
                        />
                    </motion.div>
                </div>
            </section>

            {/* Lightbox for images */}
            {imageMedia.length > 0 && (
                <MediaLightbox
                    mediaItems={imageMedia}
                    initialIndex={selectedMediaIndex}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>
    )
}

export default MediaCarouselSection
