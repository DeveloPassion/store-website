import { useState } from 'react'
import { Tab } from '@headlessui/react'
import { motion } from 'framer-motion'
import { FaBolt, FaCog, FaInfinity, FaCheckCircle } from 'react-icons/fa'
import Section from '@/components/ui/section'
import type { Product } from '@/schemas/product.schema'
import { cn } from '@/lib/utils'
import { SectionHeader } from '@/components/ui/section-header'

interface ProductBenefitsProps {
    product: Product
}

const ProductBenefits: React.FC<ProductBenefitsProps> = ({ product }) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const tabs = [
        {
            name: 'Immediate',
            icon: FaBolt,
            benefits: product.salesCopy?.benefits?.immediate || [],
            description: 'See results from day one'
        },
        {
            name: 'Systematic',
            icon: FaCog,
            benefits: product.salesCopy?.benefits?.systematic || [],
            description: 'Build sustainable workflows'
        },
        {
            name: 'Long-Term',
            icon: FaInfinity,
            benefits: product.salesCopy?.benefits?.longTerm || [],
            description: 'Compound growth over time'
        }
    ].filter((tab) => tab.benefits.length > 0)

    if (tabs.length === 0) {
        return null
    }

    return (
        <Section className='bg-solution/[0.03]'>
            <div className='mx-auto max-w-6xl'>
                {/* Header */}
                <SectionHeader
                    title="Benefits You'll Experience"
                    subtitle='Transformation at every stage of your journey'
                />

                {/* Tabs */}
                <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <Tab.List className='mb-8 flex flex-col gap-2 sm:flex-row sm:justify-center'>
                        {tabs.map((tab, idx) => (
                            <Tab key={idx} className='focus:outline-none'>
                                {({ selected }) => {
                                    const Icon = tab.icon
                                    return (
                                        <div
                                            className={cn(
                                                'flex cursor-pointer items-center gap-3 rounded-lg border-2 px-6 py-4 transition-all',
                                                selected
                                                    ? 'border-solution bg-solution/10'
                                                    : 'border-primary/20 hover:border-primary/40'
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'h-5 w-5',
                                                    selected ? 'text-solution' : 'text-primary/60'
                                                )}
                                            />
                                            <div className='text-left'>
                                                <div
                                                    className={cn(
                                                        'font-semibold',
                                                        selected ? 'text-solution' : ''
                                                    )}
                                                >
                                                    {tab.name}
                                                </div>
                                                <div className='text-primary/60 text-xs'>
                                                    {tab.description}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }}
                            </Tab>
                        ))}
                    </Tab.List>

                    <Tab.Panels>
                        {tabs.map((tab, idx) => (
                            <Tab.Panel key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                                >
                                    {tab.benefits.map((benefit, benefitIdx) => (
                                        <motion.div
                                            key={benefitIdx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: benefitIdx * 0.05 }}
                                            className='border-solution/20 bg-solution/5 flex items-center gap-3 rounded-lg border p-4'
                                        >
                                            <FaCheckCircle className='text-solution h-5 w-5 shrink-0' />
                                            <p className='text-primary/80'>{benefit}</p>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </Section>
    )
}

export default ProductBenefits
