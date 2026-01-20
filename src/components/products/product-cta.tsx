import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaCheckCircle, FaLock, FaCreditCard, FaUndo, FaStar } from 'react-icons/fa'
import Section from '@/components/ui/section'
import type { Product } from '@/schemas/product.schema'
import { buildGumroadUrlFromProduct } from '@/lib/gumroad-url'
import { resolveStatItem } from '@/lib/stats-helpers'
import { Button } from '@/components/ui/button'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { ShareButton } from '@/components/ui/share-button'

interface ProductCTAProps {
    product: Product
}

const ProductCTA: React.FC<ProductCTAProps> = ({ product }) => {
    const isFree = product.price === 0 || product.priceTier === 'free'

    return (
        <Section className='border-primary/10 from-background to-solution/10 border-t bg-gradient-to-b'>
            <div className='mx-auto max-w-5xl'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='border-solution/30 bg-background/50 rounded-2xl border p-8 text-center shadow-2xl md:p-12'
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
                            {product.isSubscription ? 'Subscription' : 'One-Time Payment'}
                        </div>
                        <div className='text-secondary mb-2 text-4xl font-bold sm:text-5xl'>
                            {product.priceDisplay}
                        </div>
                        <div className='text-primary/60 text-sm'>
                            {product.isSubscription
                                ? 'Cancel anytime. Flexible plans available.'
                                : 'Lifetime access. No subscriptions.'}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                        as='a'
                        href={buildGumroadUrlFromProduct(product)}
                        data-gumroad-overlay-checkout='true'
                        size='lg'
                        className='mb-4 shadow-xl hover:shadow-2xl sm:px-12 sm:text-xl'
                    >
                        {isFree ? 'Get Now' : product.isSubscription ? 'Subscribe Now' : 'Buy Now'}
                    </Button>

                    {/* Share Link */}
                    <div className='mb-8 flex justify-center'>
                        <ShareButton
                            url={`/product/${product.id}`}
                            title={product.name}
                            variant='text'
                            size='sm'
                        />
                    </div>

                    {/* Guarantees */}
                    {product.salesCopy?.guarantees && product.salesCopy.guarantees.length > 0 && (
                        <div className='mb-8 flex flex-wrap justify-center gap-4'>
                            {product.salesCopy.guarantees?.map((guarantee, idx) => (
                                <div
                                    key={idx}
                                    className='bg-solution/10 text-solution flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium'
                                >
                                    <FaCheckCircle className='h-4 w-4 shrink-0' />
                                    <MarkdownContent content={guarantee} inline />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className='border-primary/10 grid gap-4 border-t pt-8 sm:grid-cols-2 md:grid-cols-4'>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='bg-solution/10 flex h-12 w-12 items-center justify-center rounded-full'>
                                <FaShieldAlt className='text-solution h-6 w-6' />
                            </div>
                            <div className='text-sm font-medium'>Secure Checkout</div>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='bg-solution/10 flex h-12 w-12 items-center justify-center rounded-full'>
                                <FaLock className='text-solution h-6 w-6' />
                            </div>
                            <div className='text-sm font-medium'>Safe Payment</div>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='bg-solution/10 flex h-12 w-12 items-center justify-center rounded-full'>
                                <FaCreditCard className='text-solution h-6 w-6' />
                            </div>
                            <div className='text-sm font-medium'>All Cards Accepted</div>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <div className='bg-solution/10 flex h-12 w-12 items-center justify-center rounded-full'>
                                <FaUndo className='text-solution h-6 w-6' />
                            </div>
                            <div className='text-sm font-medium'>Money-Back Guarantee</div>
                        </div>
                    </div>

                    {/* Additional Trust Badges from Product */}
                    {product.salesCopy?.trustBadges && product.salesCopy.trustBadges.length > 0 && (
                        <div className='border-primary/10 mt-8 border-t pt-8'>
                            <div className='flex flex-wrap justify-center gap-3'>
                                {product.salesCopy.trustBadges?.map((badge, idx) => (
                                    <MarkdownContent
                                        key={idx}
                                        content={badge}
                                        inline
                                        className='bg-primary/5 text-primary/70 rounded-full px-3 py-1.5 text-sm'
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats Proof */}
                    {(product.stats || product.averageRating !== undefined) && (
                        <div className='mt-8 flex flex-wrap justify-center gap-8'>
                            {(() => {
                                const userCountStat = resolveStatItem(
                                    product.stats?.userCount,
                                    'Happy Users'
                                )
                                return (
                                    userCountStat && (
                                        <div>
                                            <div className='text-solution mb-1 text-2xl font-bold'>
                                                {userCountStat.value}
                                            </div>
                                            <div className='text-primary/60 text-sm'>
                                                {userCountStat.label}
                                            </div>
                                        </div>
                                    )
                                )
                            })()}
                            {/* Additional Stats */}
                            {product.stats?.additionalStats?.map((stat, index) => (
                                <div key={index}>
                                    <div className='text-solution mb-1 text-2xl font-bold'>
                                        {stat.value}
                                    </div>
                                    <div className='text-primary/60 text-sm'>
                                        {stat.link ? (
                                            <a
                                                href={stat.link}
                                                className='hover:text-secondary underline transition-colors'
                                            >
                                                {stat.label}
                                            </a>
                                        ) : (
                                            stat.label
                                        )}
                                    </div>
                                </div>
                            ))}
                            {product.averageRating != null &&
                                product.ratingsCount != null &&
                                product.ratingsCount > 0 && (
                                    <Link
                                        to={`/testimonials?product=${product.id}`}
                                        className='hover:bg-primary/5 group -m-2 rounded-lg p-2 text-center transition-colors'
                                    >
                                        <div className='mb-1 flex items-center justify-center gap-2 text-2xl font-bold text-yellow-400'>
                                            {product.averageRating.toFixed(1)}
                                            <FaStar className='h-5 w-5' />
                                        </div>
                                        <div className='text-primary/60 group-hover:text-secondary text-sm transition-colors'>
                                            {product.ratingsCount}{' '}
                                            {product.ratingsCount === 1 ? 'review' : 'reviews'}
                                        </div>
                                    </Link>
                                )}
                        </div>
                    )}
                </motion.div>
            </div>
        </Section>
    )
}

export default ProductCTA
