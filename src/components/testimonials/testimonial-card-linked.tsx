import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { FaStar, FaQuoteLeft, FaExternalLinkAlt } from 'react-icons/fa'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { getSourceLabel } from '@/lib/source-url'
import type { Testimonial } from '@/schemas/testimonial.schema'

interface TestimonialCardLinkedProps {
    testimonial: Testimonial
    productName: string
    productId: string
    index?: number
    animated?: boolean
}

/**
 * Testimonial card component with link to product page
 * Features hover animation and cursor pointer
 */
const TestimonialCardLinked: React.FC<TestimonialCardLinkedProps> = ({
    testimonial,
    productName,
    productId,
    index,
    animated = true
}) => {
    const navigate = useNavigate()

    const handleCardClick = () => {
        navigate(`/product/${productId}`)
    }

    // Build motion props conditionally
    const motionProps =
        animated && index !== undefined
            ? {
                  initial: { opacity: 0, y: 10 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { delay: index * 0.03, duration: 0.3 },
                  whileHover: {
                      y: -4,
                      transition: { duration: 0.2 }
                  }
              }
            : animated
              ? {
                    whileHover: {
                        y: -4,
                        transition: { duration: 0.2 }
                    }
                }
              : {}

    const Component = animated ? motion.div : 'div'

    return (
        <Component
            {...motionProps}
            onClick={handleCardClick}
            className='border-primary/10 bg-background/50 hover:border-secondary/30 group relative flex h-full cursor-pointer flex-col rounded-xl border p-4 shadow-md transition-all hover:shadow-xl md:p-4 xl:p-5'
        >
            {/* Product badge */}
            <div className='bg-secondary/10 text-secondary hover:bg-secondary hover:text-primary mb-3 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold transition-colors'>
                {productName}
            </div>

            {/* Quote Icon */}
            <FaQuoteLeft className='text-secondary/20 mb-2 h-5 w-5 md:mb-2.5 md:h-5 md:w-5 xl:mb-3 xl:h-6 xl:w-6' />

            {/* Rating - Always 5 stars (all testimonials are 5-star) */}
            <div className='mb-2 flex gap-1 md:mb-2 xl:mb-3'>
                {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                        key={i}
                        className='text-secondary h-3 w-3 md:h-3 md:w-3 xl:h-3.5 xl:w-3.5'
                    />
                ))}
            </div>

            {/* Quote */}
            <blockquote className='text-primary/80 mb-3 flex-grow text-sm leading-relaxed italic md:mb-3 md:text-sm xl:mb-4 xl:text-sm'>
                <MarkdownContent content={`"${testimonial.quote}"`} inline />
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
                        onClick={(e) => e.stopPropagation()}
                        className='text-secondary hover:text-secondary/80 mt-1 inline-block text-xs transition-colors'
                    >
                        @{testimonial.twitterHandle}
                    </a>
                )}
                {testimonial.sourceUrl && (
                    <a
                        href={testimonial.sourceUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e) => e.stopPropagation()}
                        className='text-secondary hover:text-secondary/80 mt-1 inline-flex items-center gap-1 text-xs transition-colors'
                    >
                        <span>{getSourceLabel(testimonial.sourceUrl)}</span>
                        <FaExternalLinkAlt className='h-2.5 w-2.5' aria-hidden='true' />
                    </a>
                )}
            </div>
        </Component>
    )
}

export default TestimonialCardLinked
