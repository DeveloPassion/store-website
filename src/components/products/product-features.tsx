import { motion } from 'framer-motion'
import {
    FaCheckCircle,
    FaCog,
    FaRocket,
    FaLightbulb,
    FaBolt,
    FaShieldAlt,
    FaMagic,
    FaChartLine
} from 'react-icons/fa'
import type { IconType } from 'react-icons'
import Section from '@/components/ui/section'
import type { Product } from '@/types/product'

interface ProductFeaturesProps {
    product: Product
}

// Icon mapping for visual variety
const icons: IconType[] = [
    FaCheckCircle,
    FaCog,
    FaRocket,
    FaLightbulb,
    FaBolt,
    FaShieldAlt,
    FaMagic,
    FaChartLine
]

const ProductFeatures: React.FC<ProductFeaturesProps> = ({ product }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <Section className='border-primary/10 bg-background border-t'>
            <div className='mx-auto max-w-6xl'>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='mb-12 text-center'
                >
                    <h2 className='mb-4 text-3xl font-bold sm:text-4xl md:text-5xl'>
                        What's Included
                    </h2>
                    <p className='text-primary/70 mx-auto max-w-2xl text-lg sm:text-xl'>
                        {product.description}
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                >
                    {product.features.map((feature, idx) => {
                        const IconComponent = icons[idx % icons.length] as IconType
                        return (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className='border-primary/10 bg-background/50 hover:border-secondary/30 group rounded-lg border p-6 transition-all hover:shadow-lg'
                            >
                                <div className='bg-secondary/10 group-hover:bg-secondary/20 mb-4 inline-flex rounded-lg p-3 transition-colors'>
                                    <IconComponent className='text-secondary h-6 w-6' />
                                </div>
                                <p className='text-primary/80'>{feature}</p>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* What You Get Section */}
                {product.included.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className='mt-16'
                    >
                        <h3 className='mb-6 text-center text-2xl font-bold sm:text-3xl'>
                            Everything You Get
                        </h3>
                        <div className='mx-auto grid max-w-4xl gap-3 sm:grid-cols-2'>
                            {product.included.map((item, idx) => (
                                <div
                                    key={idx}
                                    className='border-secondary/20 bg-secondary/5 flex items-start gap-3 rounded-lg border p-4'
                                >
                                    <FaCheckCircle className='text-secondary mt-1 h-5 w-5 shrink-0' />
                                    <span className='text-primary/80'>{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Target Audience */}
                {(product.perfectFor.length > 0 || product.notForYou.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className='mt-16 grid gap-8 md:grid-cols-2'
                    >
                        {/* Perfect For */}
                        {product.perfectFor.length > 0 && (
                            <div className='border-secondary/20 bg-secondary/5 rounded-xl border p-6'>
                                <h3 className='text-secondary mb-4 text-xl font-bold'>
                                    Perfect For You If:
                                </h3>
                                <ul className='space-y-3'>
                                    {product.perfectFor.map((item, idx) => (
                                        <li key={idx} className='flex items-start gap-3'>
                                            <FaCheckCircle className='text-secondary mt-1 h-4 w-4 shrink-0' />
                                            <span className='text-primary/80'>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Not For You */}
                        {product.notForYou.length > 0 && (
                            <div className='border-primary/20 bg-primary/5 rounded-xl border p-6'>
                                <h3 className='mb-4 text-xl font-bold'>Not For You If:</h3>
                                <ul className='space-y-3'>
                                    {product.notForYou.map((item, idx) => (
                                        <li key={idx} className='flex items-start gap-3'>
                                            <span className='text-primary/40 mt-1 text-lg'>•</span>
                                            <span className='text-primary/70'>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </Section>
    )
}

export default ProductFeatures
