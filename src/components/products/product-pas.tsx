import { motion } from 'framer-motion'
import { FaTimesCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'
import Section from '@/components/ui/section'
import type { Product } from '@/types/product'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import { SectionHeader } from '@/components/ui/section-header'

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
            <Section className='border-primary/10 bg-background border-t'>
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
                            subtitle={product.problem}
                            icon={<FaTimesCircle className='h-12 w-12 text-red-500' />}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className='space-y-4'>
                        {product.problemPoints?.map((point, idx) => (
                            <div
                                key={idx}
                                className='border-primary/10 bg-background/50 flex gap-4 rounded-lg border p-4'
                            >
                                <FaTimesCircle className='mt-1 h-5 w-5 shrink-0 text-red-500' />
                                <p className='text-primary/70'>{point}</p>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </Section>

            {/* Agitate Section */}
            <Section className='bg-primary/5'>
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
                            subtitle={product.agitate}
                            icon={<FaExclamationTriangle className='h-12 w-12 text-orange-500' />}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className='space-y-4'>
                        {product.agitatePoints?.map((point, idx) => (
                            <div
                                key={idx}
                                className='border-primary/10 bg-background/50 flex gap-4 rounded-lg border p-4'
                            >
                                <FaExclamationTriangle className='mt-1 h-5 w-5 shrink-0 text-orange-500' />
                                <p className='text-primary/70'>{point}</p>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </Section>

            {/* Solution Section */}
            <Section className='border-primary/10 from-background to-secondary/5 border-t bg-gradient-to-b'>
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
                            subtitle={product.solution}
                            icon={<FaCheckCircle className='text-secondary h-12 w-12' />}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className='space-y-4'>
                        {product.solutionPoints?.map((point, idx) => (
                            <div
                                key={idx}
                                className='border-secondary/20 bg-secondary/5 flex gap-4 rounded-lg border p-4'
                            >
                                <FaCheckCircle className='text-secondary mt-1 h-5 w-5 shrink-0' />
                                <p className='text-primary/80 font-medium'>{point}</p>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </Section>
        </>
    )
}

export default ProductPAS
