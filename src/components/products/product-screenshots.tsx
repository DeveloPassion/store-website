import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaExpand } from 'react-icons/fa'
import type { Product } from '@/types/product'
import Lightbox from '@/components/ui/lightbox'

interface ProductScreenshotsProps {
    product: Product
}

const ProductScreenshots: React.FC<ProductScreenshotsProps> = ({ product }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    if (!product.screenshots || product.screenshots.length === 0) {
        return null
    }

    // Type-safe local reference after null check
    const screenshots = product.screenshots

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index)
        setLightboxOpen(true)
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
                        <h2 className='mb-4 text-center text-3xl font-bold sm:text-4xl'>
                            See It In Action
                        </h2>
                        <p className='text-primary/70 mx-auto mb-12 max-w-2xl text-center'>
                            Explore screenshots and see exactly what you'll get with {product.name}
                        </p>

                        {/* Grid Layout */}
                        <div
                            className={`grid gap-4 ${
                                screenshots.length === 1
                                    ? 'grid-cols-1'
                                    : screenshots.length === 2
                                      ? 'grid-cols-1 md:grid-cols-2'
                                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            }`}
                        >
                            {screenshots.map((screenshot, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    className='group relative cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-2xl'
                                    onClick={() => openLightbox(index)}
                                >
                                    {/* Image */}
                                    <img
                                        src={screenshot}
                                        alt={`${product.name} screenshot ${index + 1}`}
                                        className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                                        loading='lazy'
                                    />

                                    {/* Overlay on Hover */}
                                    <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                                        <div className='flex flex-col items-center gap-2 text-white'>
                                            <FaExpand className='h-8 w-8' />
                                            <span className='text-sm font-medium'>
                                                Click to expand
                                            </span>
                                        </div>
                                    </div>

                                    {/* Image Number Badge */}
                                    {screenshots.length > 1 && (
                                        <div className='absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm'>
                                            {index + 1} / {screenshots.length}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Help Text */}
                        {screenshots.length > 1 && (
                            <p className='text-primary/50 mt-6 text-center text-sm'>
                                Click any screenshot to view in fullscreen gallery
                            </p>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Lightbox */}
            <Lightbox
                images={screenshots}
                initialIndex={selectedImageIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                alt={`${product.name} screenshot`}
            />
        </>
    )
}

export default ProductScreenshots
