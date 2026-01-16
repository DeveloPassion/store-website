import { motion } from 'framer-motion'
import { FaQuoteLeft, FaUser } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { isEmoji } from '@/lib/is-emoji'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import type { Product } from '@/schemas/product.schema'

interface ProductSuccessStoriesProps {
    product: Product
}

const ProductSuccessStories: React.FC<ProductSuccessStoriesProps> = ({ product }) => {
    const { containerVariants, itemVariants } = useAnimationVariants({ staggerDelay: 0.15 })
    const successStories = product.salesCopy?.storytelling?.successStories

    if (!successStories || !successStories.stories?.length) return null

    return (
        <Section className='bg-solution/[0.03]'>
            <motion.div
                initial='hidden'
                whileInView='visible'
                viewport={{ once: true, margin: '-100px' }}
                variants={containerVariants}
                className='mx-auto max-w-5xl'
            >
                <motion.div variants={itemVariants}>
                    <SectionHeader
                        title={successStories.title}
                        subtitle={successStories.subtitle ?? undefined}
                    />
                </motion.div>

                {/* Stories */}
                <motion.div variants={itemVariants} className='space-y-6'>
                    {successStories.stories.map((story, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className='border-solution/20 rounded-xl border bg-white/5 p-6 backdrop-blur-sm'
                        >
                            <div className='flex flex-col gap-6 lg:flex-row'>
                                {/* Avatar and info */}
                                <div className='flex items-start gap-4 lg:w-1/3'>
                                    <div className='bg-solution/20 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full'>
                                        {story.avatarUrl ? (
                                            <img
                                                src={story.avatarUrl}
                                                alt={story.name}
                                                className='h-full w-full object-cover'
                                            />
                                        ) : (
                                            <FaUser className='text-solution h-6 w-6' />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className='font-semibold text-white'>{story.name}</h4>
                                        {story.role && (
                                            <p className='text-primary/60 text-sm'>{story.role}</p>
                                        )}
                                        {story.company && (
                                            <p className='text-primary/50 text-sm'>
                                                {story.company}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Result and quote */}
                                <div className='flex-1'>
                                    <p className='text-primary/80 mb-4'>{story.result}</p>

                                    {/* Metrics */}
                                    {story.metrics && story.metrics.length > 0 && (
                                        <div className='mb-4 flex flex-wrap gap-3'>
                                            {story.metrics.map((metric, mIdx) => (
                                                <div
                                                    key={mIdx}
                                                    className='border-solution/30 bg-solution/10 flex items-center gap-2 rounded-full border px-3 py-1.5'
                                                >
                                                    {metric.icon && (
                                                        <span className='text-solution'>
                                                            {isEmoji(metric.icon) ? (
                                                                <span className='text-sm'>
                                                                    {metric.icon}
                                                                </span>
                                                            ) : (
                                                                <DynamicIcon
                                                                    iconName={metric.icon}
                                                                    size='sm'
                                                                    className='text-solution'
                                                                    useBrandColors={false}
                                                                />
                                                            )}
                                                        </span>
                                                    )}
                                                    <span className='text-solution text-sm font-semibold'>
                                                        {metric.value}
                                                    </span>
                                                    <span className='text-primary/60 text-sm'>
                                                        {metric.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quote */}
                                    {story.quote && (
                                        <div className='border-solution/20 flex items-start gap-3 rounded-lg border bg-white/5 p-4'>
                                            <FaQuoteLeft className='text-solution/50 mt-1 h-4 w-4 shrink-0' />
                                            <p className='text-primary/70 text-sm italic'>
                                                {story.quote}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </Section>
    )
}

export default ProductSuccessStories
