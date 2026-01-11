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

    if (sortedTestimonials.length === 0) {
        return null
    }

    // Generate marketing copy based on testimonial count
    const getSubtitle = () => {
        const count = sortedTestimonials.length
        if (count === 1) {
            return 'Hear what our customer has to say'
        } else if (count === 2) {
            return 'Join 2 satisfied customers who transformed their workflow'
        } else if (count <= 5) {
            return `${count} customers already loving this product`
        } else if (count <= 10) {
            return `${count} success stories from satisfied customers`
        } else {
            return `Over ${count} customers have transformed their workflow`
        }
    }

    // Auto-rotate carousel on mobile
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

    const currentTestimonial = sortedTestimonials[currentIndex]

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    }

    const TestimonialCard: React.FC<{
        testimonial: (typeof sortedTestimonials)[0]
        index?: number
    }> = ({ testimonial, index }) => (
        <motion.div
            initial={index !== undefined ? { opacity: 0, y: 20 } : undefined}
            whileInView={index !== undefined ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            transition={index !== undefined ? { delay: index * 0.1 } : undefined}
            className='border-primary/10 bg-background/50 relative flex flex-col rounded-xl border p-4 shadow-md transition-all hover:shadow-lg md:p-5'
        >
            {/* Quote Icon */}
            <FaQuoteLeft className='text-secondary/20 mb-3 h-6 w-6' />

            {/* Rating */}
            <div className='mb-3 flex gap-1'>
                {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                        key={i}
                        className={`h-3.5 w-3.5 ${
                            i < testimonial.rating ? 'text-secondary' : 'text-primary/20'
                        }`}
                    />
                ))}
            </div>

            {/* Quote */}
            <blockquote className='text-primary/80 mb-4 flex-grow text-sm leading-relaxed italic'>
                "{testimonial.quote}"
            </blockquote>

            {/* Author */}
            <div className='border-primary/10 border-t pt-3'>
                <div className='text-sm font-semibold'>{testimonial.author}</div>
                {(testimonial.role || testimonial.company) && (
                    <div className='text-primary/60 mt-0.5 text-xs'>
                        {testimonial.role}
                        {testimonial.role && testimonial.company && ' at '}
                        {testimonial.company}
                    </div>
                )}
                {testimonial.twitterUrl && (
                    <a
                        href={testimonial.twitterUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-secondary hover:text-secondary/80 mt-1 inline-block text-xs transition-colors'
                    >
                        @{testimonial.twitterHandle}
                    </a>
                )}
            </div>
        </motion.div>
    )

    return (
        <Section className='border-primary/10 from-background to-primary/5 border-t bg-gradient-to-b'>
            <div className='mx-auto max-w-7xl'>
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
                        {getSubtitle()}
                    </p>
                </motion.div>

                {/* Mobile Carousel (< md) */}
                <div className='relative md:hidden'>
                    <div className='overflow-hidden'>
                        {currentTestimonial && (
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
                                >
                                    <TestimonialCard testimonial={currentTestimonial} />
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Navigation */}
                    {sortedTestimonials.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-2 transition-all hover:scale-110 hover:text-white'
                                aria-label='Previous testimonial'
                            >
                                <FaChevronLeft className='h-4 w-4' />
                            </button>
                            <button
                                onClick={goToNext}
                                className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-2 transition-all hover:scale-110 hover:text-white'
                                aria-label='Next testimonial'
                            >
                                <FaChevronRight className='h-4 w-4' />
                            </button>
                        </>
                    )}

                    {/* Indicators */}
                    {sortedTestimonials.length > 1 && (
                        <div className='mt-6 flex justify-center gap-2'>
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

                {/* Desktop Grid (>= md) */}
                <div
                    className={`hidden gap-6 md:grid ${
                        sortedTestimonials.length === 1
                            ? 'mx-auto max-w-3xl'
                            : sortedTestimonials.length === 2
                              ? 'md:grid-cols-2'
                              : 'md:grid-cols-2 lg:grid-cols-3'
                    }`}
                >
                    {sortedTestimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </Section>
    )
}

export default ProductTestimonials
