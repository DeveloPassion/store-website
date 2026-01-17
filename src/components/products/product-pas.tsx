import { motion } from 'framer-motion'
import { FaTimesCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'
import Section from '@/components/ui/section'
import type { Product } from '@/schemas/product.schema'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import { SectionHeader } from '@/components/ui/section-header'
import { MarkdownContent } from '@/components/ui/markdown-content'

interface ProductPASProps {
    product: Product
}

const ProductPAS: React.FC<ProductPASProps> = ({ product }) => {
    const { containerVariants, itemVariants } = useAnimationVariants({
        staggerDelay: 0.2
    })

    return (
        <>
            {/* Problem Section */}
            <Section className='border-primary/10 bg-problem/[0.03] border-t'>
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className='mx-auto max-w-4xl'
                >
                    <motion.div variants={itemVariants}>
                        <SectionHeader
                            title='The Problem'
                            subtitle={product.salesCopy?.problem}
                            icon={<FaTimesCircle className='text-problem h-12 w-12' />}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className='space-y-4'>
                        {product.salesCopy?.problemPoints?.map((point, idx) => (
                            <div
                                key={idx}
                                className='border-problem/20 bg-problem/5 flex gap-4 rounded-lg border p-4'
                            >
                                <FaTimesCircle className='text-problem mt-1 h-5 w-5 shrink-0' />
                                <MarkdownContent
                                    content={point}
                                    inline
                                    className='text-primary/70'
                                />
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </Section>

            {/* Agitate Section */}
            <Section className='bg-agitate/[0.03]'>
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className='mx-auto max-w-4xl'
                >
                    <motion.div variants={itemVariants}>
                        <SectionHeader
                            title='Why This Matters'
                            subtitle={product.salesCopy?.agitate}
                            icon={<FaExclamationTriangle className='text-agitate h-12 w-12' />}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className='space-y-4'>
                        {product.salesCopy?.agitatePoints?.map((point, idx) => (
                            <div
                                key={idx}
                                className='border-agitate/20 bg-agitate/5 flex gap-4 rounded-lg border p-4'
                            >
                                <FaExclamationTriangle className='text-agitate mt-1 h-5 w-5 shrink-0' />
                                <MarkdownContent
                                    content={point}
                                    inline
                                    className='text-primary/70'
                                />
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </Section>

            {/* Solution Section */}
            <Section className='border-primary/10 from-background to-solution/10 border-t bg-gradient-to-b'>
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className='mx-auto max-w-4xl'
                >
                    <motion.div variants={itemVariants}>
                        <SectionHeader
                            title='The Solution'
                            subtitle={product.salesCopy?.solution}
                            icon={<FaCheckCircle className='text-solution h-12 w-12' />}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className='space-y-4'>
                        {product.salesCopy?.solutionPoints?.map((point, idx) => (
                            <div
                                key={idx}
                                className='border-solution/20 bg-solution/5 flex gap-4 rounded-lg border p-4'
                            >
                                <FaCheckCircle className='text-solution mt-1 h-5 w-5 shrink-0' />
                                <MarkdownContent
                                    content={point}
                                    inline
                                    className='text-primary/80 font-medium'
                                />
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </Section>
        </>
    )
}

export default ProductPAS
