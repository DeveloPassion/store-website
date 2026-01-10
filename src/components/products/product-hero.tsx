import { useState, useEffect } from 'react'
import { FaStar, FaCheckCircle, FaHeart, FaRegHeart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import type { Product } from '@/types/product'
import { buildGumroadUrl } from '@/lib/gumroad-url'
import { isInWishlist, toggleWishlist } from '@/lib/wishlist'

interface ProductHeroProps {
    product: Product
    /** Ref to the buy button for scroll tracking */
    buyButtonRef?: React.Ref<HTMLAnchorElement>
}

const ProductHero: React.FC<ProductHeroProps> = ({ product, buyButtonRef }) => {
    const [selectedVariant, setSelectedVariant] = useState(
        product.variants?.[0] || {
            name: 'Standard',
            price: product.price,
            priceDisplay: product.priceDisplay,
            description: '',
            gumroadUrl: product.gumroadUrl
        }
    )

    // Wishlist state
    const [isWishlisted, setIsWishlisted] = useState(() => isInWishlist(product.id))

    // Update wishlist status when product changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsWishlisted(isInWishlist(product.id))
    }, [product.id])

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newState = toggleWishlist(product.id)
        setIsWishlisted(newState)
    }

    return (
        <section className='from-background to-background/80 relative overflow-hidden bg-gradient-to-b py-16 sm:py-20 md:py-24 lg:py-32'>
            <div className='container mx-auto max-w-6xl px-6 sm:px-10 md:px-16'>
                <div className='grid gap-12 lg:grid-cols-2 lg:gap-16'>
                    {/* Left Column: Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className='flex flex-col justify-center'
                    >
                        {/* Featured Badge */}
                        {product.featured && (
                            <div className='from-secondary to-secondary/80 mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r px-4 py-1.5 text-sm font-medium text-white shadow-md'>
                                <FaStar className='h-3.5 w-3.5' />
                                Featured Product
                            </div>
                        )}

                        {/* Title */}
                        <div className='mb-4 flex flex-wrap items-center gap-3'>
                            <h1 className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
                                {product.name}
                            </h1>
                            <button
                                onClick={handleWishlist}
                                className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110 ${
                                    isWishlisted
                                        ? 'bg-secondary/10 text-secondary'
                                        : 'bg-primary/10 text-primary/60 hover:bg-primary/20 hover:text-secondary'
                                }`}
                                aria-label={
                                    isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
                                }
                                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                {isWishlisted ? (
                                    <FaHeart className='h-6 w-6' />
                                ) : (
                                    <FaRegHeart className='h-6 w-6' />
                                )}
                            </button>
                        </div>

                        {/* Tagline */}
                        <p className='text-primary/80 mb-2 text-xl sm:text-2xl md:text-3xl'>
                            {product.tagline}
                        </p>

                        {/* Secondary Tagline */}
                        {product.secondaryTagline && (
                            <p className='text-primary/60 mb-6 text-lg sm:text-xl'>
                                {product.secondaryTagline}
                            </p>
                        )}

                        {/* Stats Proof */}
                        {product.statsProof && (
                            <div className='mb-8 flex flex-wrap gap-6'>
                                {product.statsProof.userCount && (
                                    <div>
                                        <div className='text-secondary text-2xl font-bold sm:text-3xl'>
                                            {product.statsProof.userCount}
                                        </div>
                                        <div className='text-primary/60 text-sm'>Users</div>
                                    </div>
                                )}
                                {product.statsProof.timeSaved && (
                                    <div>
                                        <div className='text-secondary text-2xl font-bold sm:text-3xl'>
                                            {product.statsProof.timeSaved}
                                        </div>
                                        <div className='text-primary/60 text-sm'>Time Saved</div>
                                    </div>
                                )}
                                {product.statsProof.rating && (
                                    <div>
                                        <div className='text-secondary text-2xl font-bold sm:text-3xl'>
                                            {product.statsProof.rating}
                                        </div>
                                        <div className='text-primary/60 text-sm'>Rating</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Variant Selector */}
                        {product.variants && product.variants.length > 1 && (
                            <div className='mb-6'>
                                <label className='text-primary/80 mb-2 block text-sm font-medium'>
                                    Choose Your Package:
                                </label>
                                <div className='flex flex-col gap-3'>
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.name}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`group relative rounded-lg border-2 p-4 text-left transition-all ${
                                                selectedVariant.name === variant.name
                                                    ? 'border-secondary bg-secondary/10'
                                                    : 'border-primary/20 hover:border-primary/40'
                                            }`}
                                        >
                                            <div className='flex items-center justify-between'>
                                                <div>
                                                    <div className='font-semibold'>
                                                        {variant.name}
                                                    </div>
                                                    <div className='text-primary/60 text-sm'>
                                                        {variant.description}
                                                    </div>
                                                </div>
                                                <div className='text-secondary text-xl font-bold'>
                                                    {variant.priceDisplay}
                                                </div>
                                            </div>
                                            {selectedVariant.name === variant.name && (
                                                <FaCheckCircle className='text-secondary absolute top-4 right-4 h-5 w-5' />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price & CTA */}
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                            <div>
                                <div className='text-primary/60 text-sm'>Price</div>
                                <div className='text-secondary text-3xl font-bold sm:text-4xl'>
                                    {selectedVariant.priceDisplay}
                                </div>
                            </div>
                            <a
                                ref={buyButtonRef}
                                href={buildGumroadUrl(selectedVariant.gumroadUrl)}
                                data-gumroad-overlay-checkout='true'
                                className='gumroad-button bg-secondary hover:bg-secondary/90 flex flex-1 cursor-pointer items-center justify-center rounded-lg px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl sm:flex-none'
                            >
                                Buy on
                            </a>
                        </div>

                        {/* Trust Badges */}
                        {product.guarantees.length > 0 && (
                            <div className='mt-6 flex flex-wrap gap-3'>
                                {product.guarantees.slice(0, 2).map((guarantee, idx) => (
                                    <div
                                        key={idx}
                                        className='bg-primary/5 text-primary/70 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm'
                                    >
                                        <FaCheckCircle className='text-secondary h-4 w-4' />
                                        {guarantee}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column: Media */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className='flex items-center justify-center'
                    >
                        {product.videoUrl ? (
                            <div className='aspect-video w-full overflow-hidden rounded-xl shadow-2xl'>
                                <iframe
                                    src={product.videoUrl}
                                    className='h-full w-full'
                                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                    allowFullScreen
                                />
                            </div>
                        ) : product.coverImage ? (
                            <img
                                src={product.coverImage}
                                alt={product.name}
                                className='w-full rounded-xl shadow-2xl'
                            />
                        ) : (
                            <div className='border-primary/20 bg-primary/5 flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed'>
                                <div className='text-primary/40 text-center'>
                                    <div className='mb-2 text-4xl'>📦</div>
                                    <div className='text-sm'>Product Preview</div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default ProductHero
