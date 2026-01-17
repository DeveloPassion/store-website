import { motion } from 'framer-motion'
import Section from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { isEmoji } from '@/lib/is-emoji'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import type { Product } from '@/schemas/product.schema'

interface ProductOriginStoryProps {
    product: Product
}

const ProductOriginStory: React.FC<ProductOriginStoryProps> = ({ product }) => {
    const { containerVariants, itemVariants } = useAnimationVariants({ staggerDelay: 0.15 })
    const originStory = product.salesCopy?.storytelling?.originStory

    if (!originStory) return null

    const renderIcon = (icon: string | undefined, className: string = 'h-8 w-8') => {
        if (!icon) return null
        if (isEmoji(icon)) {
            return <span className='text-3xl'>{icon}</span>
        }
        return <DynamicIcon iconName={icon} className={className} useBrandColors={false} />
    }

    return (
        <Section className='bg-secondary/[0.03]'>
            <motion.div
                initial='hidden'
                whileInView='visible'
                viewport={{ once: true, margin: '-100px' }}
                variants={containerVariants}
                className='mx-auto max-w-4xl'
            >
                <motion.div variants={itemVariants}>
                    <SectionHeader
                        title={originStory.title}
                        subtitle={originStory.subtitle ?? undefined}
                        icon={
                            originStory.icon ? (
                                isEmoji(originStory.icon) ? (
                                    <span className='text-5xl'>{originStory.icon}</span>
                                ) : (
                                    <DynamicIcon
                                        iconName={originStory.icon}
                                        className='text-secondary h-12 w-12'
                                        useBrandColors={false}
                                    />
                                )
                            ) : undefined
                        }
                    />
                </motion.div>

                <motion.div variants={itemVariants} className='space-y-6'>
                    <div className='border-secondary/20 rounded-xl border bg-white/5 p-6 backdrop-blur-sm'>
                        <MarkdownContent
                            content={originStory.story}
                            autoDetect
                            className='text-primary/80 text-lg leading-relaxed'
                        />
                    </div>

                    {originStory.inspirationPoint && (
                        <div className='border-secondary/30 bg-secondary/10 flex items-start gap-4 rounded-lg border p-4'>
                            <div className='text-secondary shrink-0'>
                                {renderIcon('FaLightbulb', 'h-6 w-6')}
                            </div>
                            <MarkdownContent
                                content={`"${originStory.inspirationPoint}"`}
                                inline
                                className='text-primary/70 italic'
                            />
                        </div>
                    )}

                    {originStory.genesisDate && (
                        <p className='text-primary/50 text-center text-sm'>
                            Founded: {originStory.genesisDate}
                        </p>
                    )}
                </motion.div>
            </motion.div>
        </Section>
    )
}

export default ProductOriginStory
