import { motion } from 'framer-motion'
import { FaShieldAlt, FaCheckCircle, FaLock, FaCreditCard, FaUndo } from 'react-icons/fa'
import Section from '@/components/ui/section'
import type { Product } from '@/types/product'
import { buildGumroadUrl } from '@/lib/gumroad-url'

interface ProductCTAProps {
    product: Product
}

const ProductCTA: React.FC<ProductCTAProps> = ({ product }) => {
    return (
        <Section className='border-primary/10 from-background to-secondary/10 border-t bg-gradient-to-b'>
            <div className='mx-auto max-w-5xl'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='border-secondary/30 bg-background/50 rounded-2xl border p-8 text-center shadow-2xl md:p-12'
                >
                    {/* Headline */}
                    <h2 className='mb-4 text-3xl font-bold sm:text-4xl md:text-5xl'>
                        Ready to Get Started?
                    </h2>
                    <p className='text-primary/70 mx-auto mb-8 max-w-2xl text-lg sm:text-xl'>
                        Join thousands of satisfied users and transform the way you work today.
                    </p>

                    {/* Price */}
                    <div className='mb-8'>
                        <div className='text-primary/60 mb-2 text-sm tracking-wide uppercase'>
                            One-Time Payment
                        </div>
                        <div className='text-secondary mb-2 text-4xl font-bold sm:text-5xl'>
                            {product.priceDisplay}
                        </div>
                        <div className='text-primary/60 text-sm'>
                            Lifetime access. No subscriptions.
                        </div>
                    </div>

                    {/* CTA Button */}
                    <a
                        href={buildGumroadUrl(product.gumroadUrl)}
                        data-gumroad-overlay-checkout='true'
                        className='gumroad-button bg-secondary hover:bg-secondary/90 mb-8 inline-block cursor-pointer rounded-lg px-12 py-4 text-xl font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl'
                    >
                        Buy {product.name} on
                    </a>

                    {/* Guarantees */}
                    {product.guarantees.length > 0 && (
                        <div className='mb-8 flex flex-wrap justify-center gap-4'>
                            {product.guarantees.map((guarantee, idx) => (
                                <div
                                    key={idx}
                                    className='bg-secondary/10 text-secondary flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium'
                                >
                                    <FaCheckCircle className='h-4 w-4' />
                                    {guarantee}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className='border-primary/10 grid gap-4 border-t pt-8 sm:grid-cols-2 md:grid-cols-4'>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='bg-secondary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                                <FaShieldAlt className='text-secondary h-6 w-6' />
                            </div>
                            <div className='text-sm font-medium'>Secure Checkout</div>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='bg-secondary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                                <FaLock className='text-secondary h-6 w-6' />
                            </div>
                            <div className='text-sm font-medium'>Safe Payment</div>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='bg-secondary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                                <FaCreditCard className='text-secondary h-6 w-6' />
                            </div>
                            <div className='text-sm font-medium'>All Cards Accepted</div>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='bg-secondary/10 flex h-12 w-12 items-center justify-center rounded-full'>
                                <FaUndo className='text-secondary h-6 w-6' />
                            </div>
                            <div className='text-sm font-medium'>Money-Back Guarantee</div>
                        </div>
                    </div>

                    {/* Additional Trust Badges from Product */}
                    {product.trustBadges.length > 0 && (
                        <div className='border-primary/10 mt-8 border-t pt-8'>
                            <div className='flex flex-wrap justify-center gap-3'>
                                {product.trustBadges.map((badge, idx) => (
                                    <div
                                        key={idx}
                                        className='bg-primary/5 text-primary/70 rounded-full px-3 py-1.5 text-sm'
                                    >
                                        {badge}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats Proof */}
                    {product.statsProof && (
                        <div className='mt-8 flex flex-wrap justify-center gap-8'>
                            {product.statsProof.userCount && (
                                <div>
                                    <div className='text-secondary mb-1 text-2xl font-bold'>
                                        {product.statsProof.userCount}
                                    </div>
                                    <div className='text-primary/60 text-sm'>Happy Users</div>
                                </div>
                            )}
                            {product.statsProof.rating && (
                                <div>
                                    <div className='text-secondary mb-1 text-2xl font-bold'>
                                        {product.statsProof.rating}
                                    </div>
                                    <div className='text-primary/60 text-sm'>Average Rating</div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </Section>
    )
}

export default ProductCTA
