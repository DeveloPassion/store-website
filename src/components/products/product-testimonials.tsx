import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaStar, FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa'
import Section from '@/components/ui/section'
import type { Product } from '@/types/product'
import type { Testimonial } from '@/schemas/testimonial.schema'

interface ProductTestimonialsProps {
    product: Product
}

interface TestimonialCardProps {
    testimonial: Testimonial
    index?: number
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, index }) => (
    <motion.div
        initial={index !== undefined ? { opacity: 0, y: 10 } : undefined}
        whileInView={index !== undefined ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true }}
        transition={index !== undefined ? { delay: index * 0.03, duration: 0.3 } : undefined}
        className='border-primary/10 bg-background/50 relative flex flex-col rounded-xl border p-4 shadow-md transition-all hover:shadow-lg md:p-4 xl:p-5'
    >
        {/* Quote Icon */}
        <FaQuoteLeft className='text-secondary/20 mb-2 h-5 w-5 md:mb-2.5 md:h-5 md:w-5 xl:mb-3 xl:h-6 xl:w-6' />

        {/* Rating */}
        <div className='mb-2 flex gap-1 md:mb-2 xl:mb-3'>
            {Array.from({ length: 5 }).map((_, i) => (
                <FaStar
                    key={i}
                    className={`h-3 w-3 md:h-3 md:w-3 xl:h-3.5 xl:w-3.5 ${
                        i < testimonial.rating ? 'text-secondary' : 'text-primary/20'
                    }`}
                />
            ))}
        </div>

        {/* Quote */}
        <blockquote className='text-primary/80 mb-3 flex-grow text-sm leading-relaxed italic md:mb-3 md:text-sm xl:mb-4 xl:text-sm'>
            "{testimonial.quote}"
        </blockquote>

        {/* Author */}
        <div className='border-primary/10 border-t pt-2.5 md:pt-2.5 xl:pt-3'>
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

    if (sortedTestimonials.length === 0) {
        return null
    }

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
            x: direction > 0 ? 200 : -200,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 200 : -200,
            opacity: 0
        })
    }

    return (
        <Section className='border-primary/10 from-background to-primary/5 border-t bg-gradient-to-b'>
            <div className='mx-auto max-w-6xl'>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='mb-6 text-center md:mb-8'
                >
                    <h2 className='mb-2 text-2xl font-bold sm:text-3xl md:mb-3 md:text-4xl lg:text-5xl'>
                        What People Are Saying
                    </h2>
                    <p className='text-primary/70 mx-auto max-w-2xl text-base sm:text-lg md:text-xl'>
                        {getSubtitle()}
                    </p>
                </motion.div>

                {/* Mobile Carousel (< md) */}
                <div className='relative overflow-hidden md:hidden'>
                    <div className='px-10 sm:px-14'>
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
                                className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary absolute top-1/2 left-1 -translate-y-1/2 rounded-full border-2 p-1.5 transition-all hover:scale-110 hover:text-white sm:left-2 sm:p-2'
                                aria-label='Previous testimonial'
                            >
                                <FaChevronLeft className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                            </button>
                            <button
                                onClick={goToNext}
                                className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary absolute top-1/2 right-1 -translate-y-1/2 rounded-full border-2 p-1.5 transition-all hover:scale-110 hover:text-white sm:right-2 sm:p-2'
                                aria-label='Next testimonial'
                            >
                                <FaChevronRight className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                            </button>
                        </>
                    )}

                    {/* Indicators - Counter only on mobile, dots on larger screens */}
                    {sortedTestimonials.length > 1 && (
                        <div className='mt-5 sm:mt-6'>
                            {/* Counter for mobile (always shown) */}
                            <div className='text-primary/60 text-center text-sm sm:hidden'>
                                {currentIndex + 1} / {sortedTestimonials.length}
                            </div>
                            {/* Dot indicators for larger screens */}
                            <div className='scrollbar-hide mx-auto hidden max-w-full justify-center gap-2 overflow-x-auto px-4 sm:flex'>
                                {sortedTestimonials.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setDirection(idx > currentIndex ? 1 : -1)
                                            setCurrentIndex(idx)
                                        }}
                                        className={`h-2 shrink-0 rounded-full transition-all ${
                                            idx === currentIndex
                                                ? 'bg-secondary w-8'
                                                : 'bg-primary/20 hover:bg-primary/40 w-2'
                                        }`}
                                        aria-label={`Go to testimonial ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop Grid (>= md) */}
                <div
                    className={`hidden gap-4 md:grid md:gap-4 xl:gap-6 ${
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
