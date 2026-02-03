import { motion } from 'framer-motion'
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { isEmoji } from '@/lib/is-emoji'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import { cn } from '@/lib/utils'
import type { Product } from '@/schemas/product.schema'
import type { TransformationPhase } from '@/schemas/storytelling.schema'

interface ProductTransformationArcProps {
    product: Product
}

const PhaseCard: React.FC<{
    phase: TransformationPhase
    variant: 'before' | 'during' | 'after'
}> = ({ phase, variant }) => {
    const variantStyles = {
        before: {
            border: 'border-problem/30',
            bg: 'bg-problem/10',
            iconColor: 'text-problem',
            dotColor: 'bg-problem'
        },
        during: {
            border: 'border-agitate/30',
            bg: 'bg-agitate/10',
            iconColor: 'text-agitate',
            dotColor: 'bg-agitate'
        },
        after: {
            border: 'border-solution/30',
            bg: 'bg-solution/10',
            iconColor: 'text-solution',
            dotColor: 'bg-solution'
        }
    }

    const styles = variantStyles[variant]

    return (
        <div className={cn('rounded-xl border p-5', styles.border, styles.bg)}>
            {/* Icon */}
            <div className='mb-4 flex justify-center'>
                <div
                    className={cn(
                        'bg-card-subtle-hover flex h-14 w-14 items-center justify-center rounded-full',
                        styles.iconColor
                    )}
                >
                    {phase.icon ? (
                        isEmoji(phase.icon) ? (
                            <span className='text-3xl'>{phase.icon}</span>
                        ) : (
                            <DynamicIcon
                                iconName={phase.icon}
                                size='lg'
                                className={styles.iconColor}
                                useBrandColors={false}
                            />
                        )
                    ) : (
                        <span className='text-2xl font-bold'>
                            {variant === 'before' ? '1' : variant === 'during' ? '2' : '3'}
                        </span>
                    )}
                </div>
            </div>

            {/* Title */}
            <h4 className='text-primary mb-2 text-center text-lg font-bold'>{phase.title}</h4>

            {/* Description */}
            <MarkdownContent
                content={phase.description}
                inline
                className='text-primary/70 mb-4 block text-center text-sm'
            />

            {/* Points */}
            {phase.points && phase.points.length > 0 && (
                <ul className='space-y-2'>
                    {phase.points.map((point, idx) => (
                        <li key={idx} className='text-primary/60 flex items-start gap-2 text-sm'>
                            <span
                                className={cn(
                                    'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                                    styles.dotColor
                                )}
                            />
                            <MarkdownContent content={point} inline />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

const ProductTransformationArc: React.FC<ProductTransformationArcProps> = ({ product }) => {
    const { containerVariants, itemVariants } = useAnimationVariants({ staggerDelay: 0.15 })
    const transformationArc = product.salesCopy?.storytelling?.transformationArc

    if (!transformationArc) return null

    return (
        <Section id='transformation' className='bg-gradient-to-b from-transparent to-white/[0.02]'>
            <motion.div
                initial='hidden'
                whileInView='visible'
                viewport={{ once: true, margin: '-100px' }}
                variants={containerVariants}
                className='mx-auto max-w-5xl'
            >
                <motion.div variants={itemVariants}>
                    <SectionHeader
                        title={transformationArc.title}
                        subtitle={transformationArc.subtitle ?? undefined}
                    />
                </motion.div>

                {/* Three phases in a row */}
                <motion.div variants={itemVariants} className='relative'>
                    <div className='grid gap-4 md:grid-cols-3 md:gap-6'>
                        {/* Before */}
                        <PhaseCard phase={transformationArc.before} variant='before' />

                        {/* Arrow (hidden on mobile) */}
                        <div className='absolute top-1/2 left-1/3 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block'>
                            <FaArrowRight className='text-primary/30 h-6 w-6' />
                        </div>

                        {/* During */}
                        <PhaseCard phase={transformationArc.during} variant='during' />

                        {/* Arrow (hidden on mobile) */}
                        <div className='absolute top-1/2 left-2/3 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block'>
                            <FaArrowRight className='text-primary/30 h-6 w-6' />
                        </div>

                        {/* After */}
                        <PhaseCard phase={transformationArc.after} variant='after' />
                    </div>
                </motion.div>

                {/* Timeline summary */}
                {transformationArc.timeline && (
                    <motion.div variants={itemVariants} className='mt-8 text-center'>
                        <div className='border-solution/20 bg-solution/5 inline-flex items-center gap-2 rounded-full border px-4 py-2'>
                            <FaCheckCircle className='text-solution h-4 w-4 shrink-0' />
                            <MarkdownContent
                                content={transformationArc.timeline}
                                inline
                                className='text-primary/70 text-sm'
                            />
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </Section>
    )
}

export default ProductTransformationArc
