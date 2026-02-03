import { motion } from 'framer-motion'
import { FaTimesCircle, FaTrophy } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { isEmoji } from '@/lib/is-emoji'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import type { Product } from '@/schemas/product.schema'

interface ProductCreatorJourneyProps {
    product: Product
}

const ProductCreatorJourney: React.FC<ProductCreatorJourneyProps> = ({ product }) => {
    const { containerVariants, itemVariants } = useAnimationVariants({ staggerDelay: 0.1 })
    const creatorJourney = product.salesCopy?.storytelling?.creatorJourney

    if (!creatorJourney) return null

    return (
        <Section id='creator-journey' className='bg-card-subtle/50'>
            <motion.div
                initial='hidden'
                whileInView='visible'
                viewport={{ once: true, margin: '-100px' }}
                variants={containerVariants}
                className='mx-auto max-w-4xl'
            >
                <motion.div variants={itemVariants}>
                    <SectionHeader
                        title={creatorJourney.title}
                        subtitle={creatorJourney.subtitle ?? undefined}
                        icon={
                            creatorJourney.icon ? (
                                isEmoji(creatorJourney.icon) ? (
                                    <span className='text-5xl'>{creatorJourney.icon}</span>
                                ) : (
                                    <DynamicIcon
                                        iconName={creatorJourney.icon}
                                        className='text-secondary h-12 w-12'
                                        useBrandColors={false}
                                    />
                                )
                            ) : undefined
                        }
                    />
                </motion.div>

                <motion.div variants={itemVariants} className='space-y-6'>
                    {/* Main story */}
                    <div className='border-primary/10 bg-card-subtle rounded-xl border p-6 backdrop-blur-sm'>
                        <MarkdownContent
                            content={creatorJourney.story}
                            autoDetect
                            className='text-primary/80 text-lg leading-relaxed'
                        />
                    </div>

                    {/* Struggles and Achievements in two columns */}
                    {(creatorJourney.struggles?.length || creatorJourney.achievements?.length) && (
                        <div className='grid gap-6 md:grid-cols-2'>
                            {/* Struggles */}
                            {creatorJourney.struggles && creatorJourney.struggles.length > 0 && (
                                <div className='border-problem/20 bg-card-subtle rounded-xl border p-5'>
                                    <h4 className='text-problem mb-4 flex items-center gap-2 font-semibold'>
                                        <FaTimesCircle className='h-5 w-5' />
                                        Challenges Overcome
                                    </h4>
                                    <ul className='space-y-2'>
                                        {creatorJourney.struggles.map((struggle, idx) => (
                                            <li
                                                key={idx}
                                                className='text-primary/70 flex items-start gap-2 text-sm'
                                            >
                                                <span className='text-problem mt-1 shrink-0'>
                                                    •
                                                </span>
                                                <MarkdownContent content={struggle} inline />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Achievements */}
                            {creatorJourney.achievements &&
                                creatorJourney.achievements.length > 0 && (
                                    <div className='border-solution/20 bg-card-subtle rounded-xl border p-5'>
                                        <h4 className='text-solution mb-4 flex items-center gap-2 font-semibold'>
                                            <FaTrophy className='h-5 w-5' />
                                            Achievements
                                        </h4>
                                        <ul className='space-y-2'>
                                            {creatorJourney.achievements.map((achievement, idx) => (
                                                <li
                                                    key={idx}
                                                    className='text-primary/70 flex items-start gap-2 text-sm'
                                                >
                                                    <span className='text-solution mt-1 shrink-0'>
                                                        •
                                                    </span>
                                                    <MarkdownContent content={achievement} inline />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Credentials */}
                    {creatorJourney.credentials && (
                        <div className='border-secondary/20 bg-secondary/5 rounded-lg border p-4 text-center'>
                            <MarkdownContent
                                content={creatorJourney.credentials}
                                inline
                                className='text-primary/70 text-sm italic'
                            />
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </Section>
    )
}

export default ProductCreatorJourney
