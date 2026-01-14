import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
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
                    <div className='from-solution/20 via-solution/40 to-solution/20 absolute top-0 left-8 hidden h-full w-0.5 bg-gradient-to-b lg:left-1/2 lg:block lg:-translate-x-1/2' />

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
                                        'relative flex items-start gap-4',
                                        // On large screens, alternate left/right
                                        'lg:items-center lg:gap-8',
                                        isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                                    )}
                                >
                                    {/* Timeline dot - centered on the line for lg+ */}
                                    <div className='bg-solution relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-lg lg:absolute lg:left-1/2 lg:-translate-x-1/2'>
                                        {milestone.icon ? (
                                            isEmoji(milestone.icon) ? (
                                                <span className='text-3xl'>{milestone.icon}</span>
                                            ) : (
                                                <DynamicIcon
                                                    iconName={milestone.icon}
                                                    size='lg'
                                                    className='text-white'
                                                    useBrandColors={false}
                                                />
                                            )
                                        ) : (
                                            <span className='text-lg font-bold text-white'>
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content card */}
                                    <div
                                        className={cn(
                                            'border-solution/20 flex-1 rounded-xl border bg-white/5 p-6 backdrop-blur-sm',
                                            // On lg+, add margin to leave space for the center line
                                            'lg:w-[calc(50%-3rem)]',
                                            isEven ? 'lg:mr-auto lg:pr-8' : 'lg:ml-auto lg:pl-8'
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
                                        <p className='text-primary/70 mb-4'>
                                            {milestone.description}
                                        </p>

                                        {/* Highlights (optional) */}
                                        {milestone.highlights &&
                                            milestone.highlights.length > 0 && (
                                                <ul className='space-y-2'>
                                                    {milestone.highlights.map(
                                                        (highlight, hIndex) => (
                                                            <li
                                                                key={hIndex}
                                                                className='text-primary/60 flex items-center gap-2 text-sm'
                                                            >
                                                                <FaCheckCircle className='text-solution h-4 w-4 shrink-0' />
                                                                <span>{highlight}</span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                    </div>

                                    {/* Spacer for alternating layout on lg+ */}
                                    <div className='hidden lg:block lg:w-[calc(50%-3rem)]' />
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
