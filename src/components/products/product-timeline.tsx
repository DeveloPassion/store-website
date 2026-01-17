import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { cn } from '@/lib/utils'
import { isEmoji } from '@/lib/is-emoji'
import type { Product } from '@/schemas/product.schema'

interface ProductTimelineProps {
    product: Product
}

const ProductTimeline: React.FC<ProductTimelineProps> = ({ product }) => {
    const timeline = product.salesCopy?.timeline

    // Conditional render - return null if no timeline data
    if (!timeline?.milestones?.length) return null

    const title = timeline.title || 'Your Transformation Journey'
    const subtitle = timeline.subtitle || "See what you'll achieve over time"

    return (
        <Section className='bg-solution/[0.03]'>
            <div className='mx-auto max-w-4xl'>
                <SectionHeader title={title} subtitle={subtitle} />

                {/* Vertical Timeline */}
                <div className='relative'>
                    {/* Vertical line - hidden on mobile, visible on lg+ */}
                    <div className='from-solution/20 via-solution/40 to-solution/20 absolute top-0 left-6 hidden h-full w-0.5 bg-gradient-to-b lg:left-1/2 lg:block lg:-translate-x-1/2' />

                    {/* Milestones */}
                    <div className='space-y-8 lg:space-y-12'>
                        {timeline.milestones.map((milestone, index) => {
                            const isEven = index % 2 === 0

                            return (
                                <motion.div
                                    key={milestone.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={cn(
                                        'relative',
                                        // On large screens, use grid for precise placement
                                        'lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8'
                                    )}
                                >
                                    {/* Content card - left side on even, right side on odd */}
                                    <div
                                        className={cn(
                                            'border-solution/20 rounded-xl border bg-white/5 p-6 pr-16 backdrop-blur-sm',
                                            'lg:row-start-1 lg:pr-6',
                                            isEven
                                                ? 'lg:col-start-1 lg:text-right'
                                                : 'lg:col-start-3 lg:text-left'
                                        )}
                                    >
                                        {/* Timeframe badge */}
                                        <div className='mb-3'>
                                            <span className='bg-solution/20 text-solution inline-block rounded-full px-4 py-1 text-sm font-semibold'>
                                                {milestone.timeframe}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className='mb-2 text-xl font-bold text-white'>
                                            {milestone.title}
                                        </h3>

                                        {/* Description */}
                                        <MarkdownContent
                                            content={milestone.description}
                                            autoDetect
                                            className='text-primary/70 mb-4'
                                        />

                                        {/* Highlights (optional) */}
                                        {milestone.highlights &&
                                            milestone.highlights.length > 0 && (
                                                <ul
                                                    className={cn(
                                                        'space-y-2',
                                                        isEven ? 'lg:ml-auto' : ''
                                                    )}
                                                >
                                                    {milestone.highlights.map(
                                                        (highlight, hIndex) => (
                                                            <li
                                                                key={hIndex}
                                                                className={cn(
                                                                    'text-primary/60 flex items-center gap-2 text-sm',
                                                                    isEven
                                                                        ? 'lg:flex-row-reverse'
                                                                        : ''
                                                                )}
                                                            >
                                                                <FaCheckCircle className='text-solution h-4 w-4 shrink-0' />
                                                                <MarkdownContent
                                                                    content={highlight}
                                                                    inline
                                                                />
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                    </div>

                                    {/* Timeline dot - top-right on mobile, center column on desktop */}
                                    <div className='bg-solution absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-lg lg:static lg:col-start-2 lg:row-start-1 lg:h-12 lg:w-12'>
                                        {milestone.icon ? (
                                            isEmoji(milestone.icon) ? (
                                                <span className='text-xl lg:text-2xl'>
                                                    {milestone.icon}
                                                </span>
                                            ) : (
                                                <DynamicIcon
                                                    iconName={milestone.icon}
                                                    size='sm'
                                                    className='text-white lg:hidden'
                                                    useBrandColors={false}
                                                />
                                            )
                                        ) : (
                                            <span className='text-sm font-bold text-white lg:text-base'>
                                                {index + 1}
                                            </span>
                                        )}
                                        {milestone.icon && !isEmoji(milestone.icon) && (
                                            <DynamicIcon
                                                iconName={milestone.icon}
                                                size='md'
                                                className='hidden text-white lg:block'
                                                useBrandColors={false}
                                            />
                                        )}
                                    </div>

                                    {/* Empty spacer for the opposite column on desktop */}
                                    <div
                                        className={cn(
                                            'hidden lg:row-start-1 lg:block',
                                            isEven ? 'lg:col-start-3' : 'lg:col-start-1'
                                        )}
                                    />
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </Section>
    )
}

export default ProductTimeline
