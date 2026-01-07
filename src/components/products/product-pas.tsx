import { motion } from 'framer-motion'
import { FaTimesCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'
import Section from '@/components/ui/section'
import type { Product } from '@/types/product'

interface ProductPASProps {
    product: Product
}

const ProductPAS: React.FC<ProductPASProps> = ({ product }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

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
                    <motion.div variants={itemVariants} className='mb-12 text-center'>
                        <div className='mb-4 flex justify-center'>
                            <FaTimesCircle className='h-12 w-12 text-red-500' />
                        </div>
                        <h2 className='mb-4 text-3xl font-bold sm:text-4xl md:text-5xl'>
                            The Problem
                        </h2>
                        <p className='text-primary/70 mx-auto max-w-2xl text-lg sm:text-xl'>
                            {product.problem}
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className='space-y-4'>
                        {product.problemPoints.map((point, idx) => (
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
                    <motion.div variants={itemVariants} className='mb-12 text-center'>
                        <div className='mb-4 flex justify-center'>
                            <FaExclamationTriangle className='h-12 w-12 text-orange-500' />
                        </div>
                        <h2 className='mb-4 text-3xl font-bold sm:text-4xl md:text-5xl'>
                            Why This Matters
                        </h2>
                        <p className='text-primary/70 mx-auto max-w-2xl text-lg sm:text-xl'>
                            {product.agitate}
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className='space-y-4'>
                        {product.agitatePoints.map((point, idx) => (
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
                    <motion.div variants={itemVariants} className='mb-12 text-center'>
                        <div className='mb-4 flex justify-center'>
                            <FaCheckCircle className='text-secondary h-12 w-12' />
                        </div>
                        <h2 className='mb-4 text-3xl font-bold sm:text-4xl md:text-5xl'>
                            The Solution
                        </h2>
                        <p className='text-primary/70 mx-auto max-w-2xl text-lg sm:text-xl'>
                            {product.solution}
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className='space-y-4'>
                        {product.solutionPoints.map((point, idx) => (
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
