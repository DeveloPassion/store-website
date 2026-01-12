import { Disclosure } from '@headlessui/react'
import { motion } from 'framer-motion'
import { FaChevronDown } from 'react-icons/fa'
import Section from '@/components/ui/section'
import type { Product } from '@/types/product'
import { cn } from '@/lib/utils'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import { SectionHeader } from '@/components/ui/section-header'

interface ProductFAQProps {
    product: Product
}

const ProductFAQ: React.FC<ProductFAQProps> = ({ product }) => {
    // FAQs are now included in the product object (loaded from {product-id}-faq.json)
    const faqs = product.faqs || []

    const { containerVariants, itemVariants } = useAnimationVariants({
        staggerDelay: 0.05,
        itemYOffset: 10
    })

    if (faqs.length === 0) {
        return null
    }

    return (
        <Section className='bg-primary/5'>
            <div className='mx-auto max-w-4xl'>
                {/* Header */}
                <SectionHeader
                    title='Frequently Asked Questions'
                    subtitle='Everything you need to know'
                />

                {/* FAQ Accordion */}
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className='space-y-3'
                >
                    {faqs.map((faq) => (
                        <motion.div key={faq.id} variants={itemVariants}>
                            <Disclosure>
                                {({ open }) => (
                                    <div
                                        className={cn(
                                            'border-primary/10 bg-background/50 overflow-hidden rounded-lg border transition-all',
                                            open && 'ring-secondary/30 ring-2'
                                        )}
                                    >
                                        <Disclosure.Button className='hover:bg-primary/5 flex w-full items-center justify-between px-6 py-4 text-left transition-colors'>
                                            <span className='pr-4 font-semibold'>
                                                {faq.question}
                                            </span>
                                            <FaChevronDown
                                                className={cn(
                                                    'text-secondary h-5 w-5 shrink-0 transition-transform duration-200',
                                                    open && 'rotate-180'
                                                )}
                                            />
                                        </Disclosure.Button>
                                        <Disclosure.Panel className='border-primary/10 border-t px-6 py-4'>
                                            <p className='text-primary/70 leading-relaxed'>
                                                {faq.answer}
                                            </p>
                                        </Disclosure.Panel>
                                    </div>
                                )}
                            </Disclosure>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Still have questions CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='border-secondary/20 bg-secondary/5 mt-12 rounded-xl border p-8 text-center'
                >
                    <h3 className='mb-2 text-xl font-bold'>Still have questions?</h3>
                    <p className='text-primary/70 mb-4'>
                        Feel free to reach out. I'm here to help you make the right decision.
                    </p>
                    <a
                        href='mailto:sebastien@dsebastien.net'
                        className='bg-secondary hover:bg-secondary/90 inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors'
                    >
                        Contact Me
                    </a>
                </motion.div>
            </div>
        </Section>
    )
}

export default ProductFAQ
