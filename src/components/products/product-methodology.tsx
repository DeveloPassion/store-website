import { motion } from 'framer-motion'
import Section from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { isEmoji } from '@/lib/is-emoji'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import { cn } from '@/lib/utils'
import type { Product } from '@/schemas/product.schema'

interface ProductMethodologyProps {
    product: Product
}

const ProductMethodology: React.FC<ProductMethodologyProps> = ({ product }) => {
    const { containerVariants, itemVariants } = useAnimationVariants({ staggerDelay: 0.1 })
    const methodology = product.salesCopy?.storytelling?.methodology

    if (!methodology) return null

    // Sort steps by order
    const sortedSteps = [...methodology.steps].sort((a, b) => a.order - b.order)

    return (
        <Section className='bg-secondary/[0.03]'>
            <motion.div
                initial='hidden'
                whileInView='visible'
                viewport={{ once: true, margin: '-100px' }}
                variants={containerVariants}
                className='mx-auto max-w-5xl'
            >
                <motion.div variants={itemVariants}>
                    <SectionHeader title={methodology.title} subtitle={methodology.subtitle} />
                </motion.div>

                {/* Steps grid */}
                <motion.div
                    variants={itemVariants}
                    className={cn(
                        'grid gap-4',
                        sortedSteps.length <= 3
                            ? 'md:grid-cols-3'
                            : sortedSteps.length <= 4
                              ? 'md:grid-cols-2 lg:grid-cols-4'
                              : 'md:grid-cols-2 lg:grid-cols-3'
                    )}
                >
                    {sortedSteps.map((step, idx) => (
                        <motion.div
                            key={step.order}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            className='border-secondary/20 group hover:border-secondary/40 rounded-xl border bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/10'
                        >
                            {/* Step number and icon */}
                            <div className='mb-4 flex items-center gap-3'>
                                <div className='bg-secondary/20 text-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold'>
                                    {step.icon ? (
                                        isEmoji(step.icon) ? (
                                            <span className='text-xl'>{step.icon}</span>
                                        ) : (
                                            <DynamicIcon
                                                iconName={step.icon}
                                                size='sm'
                                                className='text-secondary'
                                                useBrandColors={false}
                                            />
                                        )
                                    ) : (
                                        <span>{idx + 1}</span>
                                    )}
                                </div>
                                <h4 className='font-semibold text-white'>{step.title}</h4>
                            </div>

                            {/* Description */}
                            <p className='text-primary/70 text-sm leading-relaxed'>
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Philosophy */}
                {methodology.philosophy && (
                    <motion.div variants={itemVariants} className='mt-8'>
                        <div className='border-secondary/20 rounded-lg border bg-white/5 p-5 text-center'>
                            <p className='text-primary/70 italic'>"{methodology.philosophy}"</p>
                        </div>
                    </motion.div>
                )}

                {/* Differentiation */}
                {methodology.differentiation && (
                    <motion.div variants={itemVariants} className='mt-6'>
                        <div className='border-solution/20 bg-solution/5 rounded-lg border p-5'>
                            <p className='text-primary/80 text-center text-sm'>
                                {methodology.differentiation}
                            </p>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </Section>
    )
}

export default ProductMethodology
