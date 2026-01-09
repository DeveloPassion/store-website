import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaStar, FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa'
import Section from '@/components/ui/section'
import type { Product } from '@/types/product'

interface ProductTestimonialsProps {
    product: Product
}

const ProductTestimonials: React.FC<ProductTestimonialsProps> = ({ product }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    // Testimonials are now included in the product object (loaded from {product-id}-testimonials.json)
    const testimonials = product.testimonials || []

    // Show featured first, then others
    const sortedTestimonials = [...testimonials].sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return 0
    })

    useEffect(() => {
        if (sortedTestimonials.length <= 1) return

        const interval = setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % sortedTestimonials.length)
        }, 7000)

        return () => clearInterval(interval)
    }, [sortedTestimonials.length])

    const goToNext = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % sortedTestimonials.length)
    }

    const goToPrevious = () => {
        setDirection(-1)
        setCurrentIndex(
            (prev) => (prev - 1 + sortedTestimonials.length) % sortedTestimonials.length
        )
    }

    if (sortedTestimonials.length === 0) {
        return null
    }

    const currentTestimonial = sortedTestimonials[currentIndex]

    if (!currentTestimonial) {
        return null
    }

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
        <Section className='border-primary/10 from-background to-primary/5 border-t bg-gradient-to-b'>
            <div className='mx-auto max-w-5xl'>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='mb-12 text-center'
                >
                    <h2 className='mb-4 text-3xl font-bold sm:text-4xl md:text-5xl'>
                        What People Are Saying
                    </h2>
                    <p className='text-primary/70 mx-auto max-w-2xl text-lg sm:text-xl'>
                        Real feedback from real users
                    </p>
                </motion.div>

                {/* Carousel */}
                <div className='relative'>
                    <div className='border-primary/10 bg-background/50 relative overflow-hidden rounded-2xl border p-8 shadow-xl md:p-12'>
                        {/* Quote Icon */}
                        <FaQuoteLeft className='text-secondary/20 absolute top-4 left-4 h-12 w-12 md:top-8 md:left-8 md:h-16 md:w-16' />

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
                                className='relative z-10'
                            >
                                {/* Rating */}
                                <div className='mb-4 flex justify-center gap-1'>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`h-5 w-5 ${
                                                i < currentTestimonial.rating
                                                    ? 'text-secondary'
                                                    : 'text-primary/20'
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* Quote */}
                                <blockquote className='text-primary/80 mb-6 text-center text-lg italic sm:text-xl md:text-2xl'>
                                    "{currentTestimonial.quote}"
                                </blockquote>

                                {/* Author */}
                                <div className='text-center'>
                                    <div className='font-semibold'>{currentTestimonial.author}</div>
                                    {(currentTestimonial.role || currentTestimonial.company) && (
                                        <div className='text-primary/60 text-sm'>
                                            {currentTestimonial.role}
                                            {currentTestimonial.role &&
                                                currentTestimonial.company &&
                                                ' at '}
                                            {currentTestimonial.company}
                                        </div>
                                    )}
                                    {currentTestimonial.twitterUrl && (
                                        <a
                                            href={currentTestimonial.twitterUrl}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-secondary hover:text-secondary/80 mt-1 inline-block text-sm transition-colors'
                                        >
                                            @{currentTestimonial.twitterHandle}
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    {sortedTestimonials.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-3 transition-all hover:scale-110 hover:text-white'
                                aria-label='Previous testimonial'
                            >
                                <FaChevronLeft className='h-5 w-5' />
                            </button>
                            <button
                                onClick={goToNext}
                                className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-3 transition-all hover:scale-110 hover:text-white'
                                aria-label='Next testimonial'
                            >
                                <FaChevronRight className='h-5 w-5' />
                            </button>
                        </>
                    )}

                    {/* Indicators */}
                    {sortedTestimonials.length > 1 && (
                        <div className='mt-8 flex justify-center gap-2'>
                            {sortedTestimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setDirection(idx > currentIndex ? 1 : -1)
                                        setCurrentIndex(idx)
                                    }}
                                    className={`h-2 rounded-full transition-all ${
                                        idx === currentIndex
                                            ? 'bg-secondary w-8'
                                            : 'bg-primary/20 hover:bg-primary/40 w-2'
                                    }`}
                                    aria-label={`Go to testimonial ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Section>
    )
}

export default ProductTestimonials
