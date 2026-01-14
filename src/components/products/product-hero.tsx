import { useState, useEffect, useMemo } from 'react'
import { FaStar, FaCheckCircle, FaHeart, FaRegHeart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import type { Product, ProductVariant } from '@/schemas/product.schema'
import type { PaymentFrequency } from '@/schemas/product.schema'
import { buildGumroadUrlFromProduct } from '@/lib/gumroad-url'
import { isInWishlist, toggleWishlist } from '@/lib/wishlist'
import { PaymentFrequencySelector } from './payment-frequency-selector'
import { Button } from '@/components/ui/button'
import MediaCarousel from './media-carousel'
import MediaLightbox from './media-lightbox'

interface ProductHeroProps {
    product: Product
    /** Ref to the buy button for scroll tracking */
    buyButtonRef?: React.Ref<HTMLAnchorElement>
    /** Controlled state for selected variant (lifted to parent) */
    selectedVariant?: ProductVariant
    setSelectedVariant?: (variant: ProductVariant) => void
    /** Controlled state for selected payment frequency (lifted to parent) */
    selectedFrequency?: PaymentFrequency
    setSelectedFrequency?: (frequency: PaymentFrequency) => void
}

const ProductHero: React.FC<ProductHeroProps> = ({
    product,
    buyButtonRef,
    selectedVariant: controlledVariant,
    setSelectedVariant: setControlledVariant,
    selectedFrequency: controlledFrequency,
    setSelectedFrequency: setControlledFrequency
}) => {
    // Use controlled state if provided, otherwise fall back to local state
    const defaultVariant = product.variants?.[0] || {
        name: 'Standard',
        price: product.price,
        priceDisplay: product.priceDisplay,
        description: '',
        gumroadUrl: product.gumroadUrl
    }

    const selectedVariant = controlledVariant || defaultVariant
    const setSelectedVariant = setControlledVariant || (() => {})

    const defaultFrequency = product.defaultPaymentFrequency || 'monthly'
    const selectedFrequency = controlledFrequency || defaultFrequency
    const setSelectedFrequency = setControlledFrequency || (() => {})

    // Calculate display price based on selected frequency for subscription products
    const getDisplayPrice = (): string => {
        if (!product.isSubscription || !selectedVariant.prices) {
            return selectedVariant.priceDisplay
        }

        const price =
            selectedFrequency === 'yearly'
                ? selectedVariant.prices.yearly
                : selectedFrequency === 'biennial'
                  ? selectedVariant.prices.biennial
                  : selectedVariant.prices.monthly

        if (!price) return selectedVariant.priceDisplay

        const frequencyLabel =
            selectedFrequency === 'yearly'
                ? '/year'
                : selectedFrequency === 'biennial'
                  ? '/2 years'
                  : '/month'

        return `€${price.toFixed(2)}${frequencyLabel}`
    }

    const displayPrice = getDisplayPrice()
    const isFree = product.price === 0 || product.priceTier === 'free'

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

    // Extract cover images for carousel
    const coverImages = useMemo(() => {
        if (!product.media) return []
        return product.media
            .filter((item) => item.group === 'cover')
            .sort((a, b) => a.order - b.order)
    }, [product.media])

    // Filter only images for lightbox
    const coverImageMedia = useMemo(() => {
        return coverImages.filter((item) => item.type === 'image')
    }, [coverImages])

    // Lightbox state for cover images
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)

    const openLightbox = (_item: unknown, carouselIndex: number) => {
        const currentMedia = coverImages[carouselIndex]
        if (currentMedia?.type === 'image') {
            const imageIndex = coverImageMedia.findIndex((img) => img.id === currentMedia.id)
            setSelectedMediaIndex(imageIndex >= 0 ? imageIndex : 0)
            setLightboxOpen(true)
        }
    }

    return (
        <section className='from-background to-background/80 relative overflow-hidden bg-gradient-to-b py-8 sm:py-12 md:py-16 lg:py-20'>
            <div className='relative z-10 container mx-auto max-w-6xl px-6 sm:px-10 md:px-16'>
                <div className='grid gap-12 overflow-hidden lg:grid-cols-2 lg:gap-16'>
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
                        <div className='mb-4 flex items-center gap-3'>
                            <h1 className='text-4xl font-bold tracking-tight break-words sm:text-5xl md:text-6xl'>
                                {product.name}
                            </h1>
                            <button
                                onClick={handleWishlist}
                                className={`flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110 sm:h-12 sm:w-12 ${
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
                                    <FaHeart className='h-5 w-5 sm:h-6 sm:w-6' />
                                ) : (
                                    <FaRegHeart className='h-5 w-5 sm:h-6 sm:w-6' />
                                )}
                            </button>
                        </div>

                        {/* Tagline */}
                        <p className='text-primary/80 mb-2 text-xl sm:text-2xl md:text-3xl'>
                            {product.salesCopy?.tagline}
                        </p>

                        {/* Secondary Tagline */}
                        {product.salesCopy?.secondaryTagline && (
                            <p className='text-primary/60 mb-6 text-lg sm:text-xl'>
                                {product.salesCopy.secondaryTagline}
                            </p>
                        )}

                        {/* Stats Proof */}
                        {(product.stats || product.averageRating !== undefined) && (
                            <div className='mb-8 flex flex-wrap gap-6'>
                                {product.stats?.userCount && (
                                    <div>
                                        <div className='text-secondary text-2xl font-bold sm:text-3xl'>
                                            {product.stats.userCount}
                                        </div>
                                        <div className='text-primary/60 text-sm'>Users</div>
                                    </div>
                                )}
                                {product.stats?.timeSaved && (
                                    <div>
                                        <div className='text-secondary text-2xl font-bold sm:text-3xl'>
                                            {product.stats.timeSaved}
                                        </div>
                                        <div className='text-primary/60 text-sm'>Time Saved</div>
                                    </div>
                                )}
                                {product.averageRating !== undefined &&
                                    product.ratingsCount !== undefined &&
                                    product.ratingsCount > 0 && (
                                        <div>
                                            <div className='flex items-center gap-2 text-2xl font-bold text-yellow-400 sm:text-3xl'>
                                                {product.averageRating.toFixed(1)}
                                                <FaStar className='h-5 w-5 sm:h-6 sm:w-6' />
                                            </div>
                                            <div className='text-primary/60 text-sm'>
                                                Rating (
                                                <a
                                                    href='#testimonials'
                                                    className='hover:text-secondary underline transition-colors'
                                                >
                                                    {product.ratingsCount}
                                                </a>
                                                )
                                            </div>
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
                                            className={`group cursor-pointer rounded-lg border-2 p-4 text-left transition-all ${
                                                selectedVariant.name === variant.name
                                                    ? 'border-secondary bg-secondary/10'
                                                    : 'border-primary/20 hover:border-primary/40'
                                            }`}
                                        >
                                            <div className='flex items-start justify-between gap-4'>
                                                {/* Left Column: Title and Description */}
                                                <div className='flex flex-1 flex-col gap-1'>
                                                    <div className='font-semibold'>
                                                        {variant.name}
                                                    </div>
                                                    <div className='text-primary/60 text-sm'>
                                                        {variant.description}
                                                    </div>
                                                </div>

                                                {/* Right Column: Checkmark and Price */}
                                                <div className='flex flex-col items-end gap-1'>
                                                    <FaCheckCircle
                                                        className={`h-5 w-5 ${
                                                            selectedVariant.name === variant.name
                                                                ? 'text-secondary'
                                                                : 'invisible'
                                                        }`}
                                                    />
                                                    <div className='text-secondary text-xl font-bold'>
                                                        {variant.priceDisplay}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Frequency Selector (for subscriptions) */}
                        {product.isSubscription && product.paymentFrequencies && (
                            <PaymentFrequencySelector
                                frequencies={product.paymentFrequencies}
                                selected={selectedFrequency}
                                onChange={setSelectedFrequency}
                                monthlyPrice={
                                    selectedVariant.prices?.monthly || selectedVariant.price
                                }
                                yearlyPrice={selectedVariant.prices?.yearly}
                                biennialPrice={selectedVariant.prices?.biennial}
                            />
                        )}

                        {/* Price & CTA */}
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                            <div>
                                <div className='text-primary/60 text-sm'>Price</div>
                                <div className='text-secondary text-3xl font-bold sm:text-4xl'>
                                    {displayPrice}
                                </div>
                            </div>
                            <Button
                                ref={buyButtonRef}
                                as='a'
                                href={buildGumroadUrlFromProduct(
                                    product,
                                    selectedVariant,
                                    selectedFrequency
                                )}
                                data-gumroad-overlay-checkout='true'
                                size='lg'
                                className='flex-1 sm:flex-none'
                            >
                                {isFree ? 'Get Now' : 'Buy Now'}
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        {product.salesCopy?.guarantees &&
                            product.salesCopy.guarantees.length > 0 && (
                                <div className='mt-6 flex flex-wrap gap-3'>
                                    {product.salesCopy.guarantees
                                        ?.slice(0, 2)
                                        .map((guarantee, idx) => (
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

                    {/* Right Column: Cover Image Carousel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className='relative flex items-center justify-center'
                    >
                        {coverImages.length > 0 ? (
                            <MediaCarousel
                                media={coverImages}
                                group='cover'
                                autoRotateInterval={7000}
                                showNavigation={coverImages.length > 1}
                                showIndicators={coverImages.length > 1}
                                showCaptions={false}
                                className='w-full'
                                onMediaClick={openLightbox}
                            />
                        ) : (
                            // Fallback placeholder if no cover images
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

            {/* Lightbox for cover images */}
            {coverImageMedia.length > 0 && (
                <MediaLightbox
                    mediaItems={coverImageMedia}
                    initialIndex={selectedMediaIndex}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </section>
    )
}

export default ProductHero
