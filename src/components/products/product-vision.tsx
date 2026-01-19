import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { isEmoji } from '@/lib/is-emoji'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import type { Product } from '@/schemas/product.schema'

interface ProductVisionProps {
    product: Product
}

const ProductVision: React.FC<ProductVisionProps> = ({ product }) => {
    const { containerVariants, itemVariants } = useAnimationVariants({ staggerDelay: 0.1 })
    const vision = product.salesCopy?.storytelling?.vision

    if (!vision) return null

    return (
        <Section className='to-secondary/[0.05] bg-gradient-to-b from-transparent'>
            <motion.div
                initial='hidden'
                whileInView='visible'
                viewport={{ once: true, margin: '-100px' }}
                variants={containerVariants}
                className='mx-auto max-w-4xl'
            >
                <motion.div variants={itemVariants}>
                    <SectionHeader
                        title={vision.title}
                        subtitle={vision.subtitle ?? undefined}
                        icon={
                            vision.icon ? (
                                isEmoji(vision.icon) ? (
                                    <span className='text-5xl'>{vision.icon}</span>
                                ) : (
                                    <DynamicIcon
                                        iconName={vision.icon}
                                        className='text-secondary h-12 w-12'
                                        useBrandColors={false}
                                    />
                                )
                            ) : undefined
                        }
                    />
                </motion.div>

                {/* Mission statement */}
                <motion.div variants={itemVariants} className='mb-8'>
                    <div className='border-secondary/30 bg-secondary/10 rounded-xl border p-6 text-center'>
                        <MarkdownContent
                            content={vision.mission}
                            autoDetect
                            className='text-primary/90 text-lg leading-relaxed'
                        />
                    </div>
                </motion.div>

                {/* Values */}
                {vision.values && vision.values.length > 0 && (
                    <motion.div variants={itemVariants} className='mb-8'>
                        <h3 className='text-primary/80 mb-4 text-center text-lg font-semibold'>
                            Key Values
                        </h3>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            {vision.values.map((value, idx) => (
                                <div
                                    key={idx}
                                    className='border-primary/10 rounded-lg border bg-white/5 p-4'
                                >
                                    <div className='mb-2 flex items-center gap-3'>
                                        <div className='bg-secondary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full'>
                                            {value.icon ? (
                                                isEmoji(value.icon) ? (
                                                    <span className='text-lg'>{value.icon}</span>
                                                ) : (
                                                    <DynamicIcon
                                                        iconName={value.icon}
                                                        size='sm'
                                                        className='text-secondary'
                                                        useBrandColors={false}
                                                    />
                                                )
                                            ) : (
                                                <span className='text-secondary text-sm font-bold'>
                                                    {idx + 1}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className='font-semibold text-white'>{value.title}</h4>
                                    </div>
                                    <MarkdownContent
                                        content={value.description}
                                        inline
                                        className='text-primary/70 text-sm'
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Future goals */}
                {vision.futureGoals && vision.futureGoals.length > 0 && (
                    <motion.div variants={itemVariants} className='mb-8'>
                        <h3 className='text-primary/80 mb-4 text-center text-lg font-semibold'>
                            Where We're Headed
                        </h3>
                        <div className='space-y-3'>
                            {vision.futureGoals.map((goal, idx) => (
                                <div
                                    key={idx}
                                    className='border-solution/20 flex items-start gap-3 rounded-lg border bg-white/5 p-3'
                                >
                                    <FaCheckCircle className='text-solution mt-0.5 h-5 w-5 shrink-0' />
                                    <MarkdownContent
                                        content={goal}
                                        inline
                                        className='text-primary/70'
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Bigger picture */}
                {vision.biggerPicture && (
                    <motion.div variants={itemVariants}>
                        <div className='border-primary/10 rounded-lg border bg-white/5 p-5 text-center'>
                            <MarkdownContent
                                content={`"${vision.biggerPicture}"`}
                                inline
                                className='text-primary/70 italic'
                            />
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </Section>
    )
}

export default ProductVision
