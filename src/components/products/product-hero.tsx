import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import { FaStar, FaCheckCircle, FaHeart, FaRegHeart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import type { Product, ProductVariant } from '@/schemas/product.schema'
import type { PaymentFrequency } from '@/schemas/product.schema'
import { buildGumroadUrlFromProduct } from '@/lib/gumroad-url'
import {
    formatFrequencyPrice,
    getVariantFrequencies,
    getVariantPriceForFrequency
} from '@/lib/variant-pricing'
import { isInWishlist, toggleWishlist, getWishlist } from '@/lib/wishlist'
import { resolveStatItem } from '@/lib/stats-helpers'
import { useMediaLightbox } from '@/hooks/use-media-lightbox'
import { PaymentFrequencySelector } from './payment-frequency-selector'
import { Button } from '@/components/ui/button'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { ShareButton } from '@/components/ui/share-button'
import MediaCarousel from './media-carousel'
import MediaLightbox from './media-lightbox'
import {
    trackVariantSelected,
    trackFrequencySelected,
    trackBuyClicked,
    trackWishlistToggled,
    getSource
} from '@/lib/analytics'

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
    const defaultVariant: ProductVariant = product.variants?.[0] || {
        name: 'Standard',
        price: product.price,
        priceDisplay: product.priceDisplay,
        description: '',
        gumroadUrl: product.gumroadUrl,
        gumroadVariantId: null,
        paymentFrequency: null,
        prices: null,
        includedProducts: []
    }

    const selectedVariant = controlledVariant || defaultVariant
    const noopVariant = useCallback(() => {}, [])
    const noopFrequency = useCallback(() => {}, [])
    const setSelectedVariant = setControlledVariant ?? noopVariant

    const defaultFrequency =
        selectedVariant.paymentFrequency || product.defaultPaymentFrequency || 'monthly'
    const selectedFrequency = controlledFrequency || defaultFrequency
    const setSelectedFrequency = setControlledFrequency ?? noopFrequency

    // Per-variant available frequencies (only show options this variant actually has)
    const variantFrequencies = useMemo(
        () => getVariantFrequencies(selectedVariant, product.paymentFrequencies),
        [selectedVariant, product.paymentFrequencies]
    )

    // If selected frequency isn't supported by the current variant, switch to a sensible default.
    useEffect(() => {
        if (!product.isSubscription) return
        if (variantFrequencies.length === 0) return
        if (!variantFrequencies.includes(selectedFrequency)) {
            const next =
                selectedVariant.paymentFrequency &&
                variantFrequencies.includes(selectedVariant.paymentFrequency)
                    ? selectedVariant.paymentFrequency
                    : variantFrequencies[0]
            if (next) setSelectedFrequency(next)
        }
    }, [
        product.isSubscription,
        selectedVariant,
        selectedFrequency,
        variantFrequencies,
        setSelectedFrequency
    ])

    // Calculate display price based on selected frequency for subscription products
    const getDisplayPrice = (): string => {
        if (!product.isSubscription || !selectedVariant.prices) {
            return selectedVariant.priceDisplay
        }
        return formatFrequencyPrice(selectedVariant, selectedFrequency)
    }

    const displayPrice = getDisplayPrice()
    const isFree = product.price === 0 || product.priceTier === 'free'

    // Wishlist state - no useEffect needed since ProductPage uses key-based remounting
    const [isWishlisted, setIsWishlisted] = useState(() => isInWishlist(product.id))

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newState = toggleWishlist(product.id)
        setIsWishlisted(newState)
        trackWishlistToggled({
            action: newState ? 'add' : 'remove',
            productId: product.id,
            productName: product.name,
            source: getSource(),
            wishlistSize: getWishlist().length
        })
    }

    // Calculate current price for analytics
    const getCurrentPrice = (): number => {
        if (!product.isSubscription || !selectedVariant.prices) {
            return selectedVariant.price
        }
        return (
            getVariantPriceForFrequency(selectedVariant, selectedFrequency) ?? selectedVariant.price
        )
    }

    const handleVariantChange = (variant: ProductVariant) => {
        setSelectedVariant(variant)
        trackVariantSelected({
            productId: product.id,
            variantId: variant.gumroadVariantId || variant.name,
            variantName: variant.name,
            price: variant.price
        })
    }

    const handleFrequencyChange = (frequency: PaymentFrequency) => {
        setSelectedFrequency(frequency)
        const price = getVariantPriceForFrequency(selectedVariant, frequency)
        trackFrequencySelected({
            productId: product.id,
            variantId: selectedVariant.gumroadVariantId || null,
            frequency,
            price: price ?? selectedVariant.price
        })
    }

    const handleBuyClick = () => {
        trackBuyClicked({
            productId: product.id,
            productName: product.name,
            variantName: selectedVariant.name,
            price: getCurrentPrice(),
            isSubscription: product.isSubscription,
            frequency: product.isSubscription ? selectedFrequency : null,
            source: 'hero'
        })
    }

    // Extract cover images for carousel
    const coverImages = useMemo(() => {
        if (!product.media) return []
        return product.media
            .filter((item) => item.group === 'cover')
            .sort((a, b) => a.order - b.order)
    }, [product.media])

    // Lightbox state for cover media
    const { isOpen, selectedIndex, open, close } = useMediaLightbox()

    return (
        <section
            id='hero'
            className='from-background to-background/80 relative overflow-hidden bg-gradient-to-b py-8 sm:py-12 md:py-16 lg:py-20'
        >
            <div className='relative z-10 container mx-auto max-w-6xl px-6 sm:px-10 md:px-16'>
                <div className='grid gap-8 overflow-hidden lg:grid-cols-2 lg:items-start lg:gap-12'>
                    {/* Left Column: Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className='flex flex-col justify-center lg:justify-start'
                    >
                        {/* Featured Badge */}
                        {product.featured && (
                            <div className='from-secondary to-secondary/80 mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r px-4 py-1.5 text-sm font-medium text-white shadow-md'>
                                <FaStar className='h-3.5 w-3.5' aria-hidden='true' />
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
                                    <FaHeart className='h-5 w-5 sm:h-6 sm:w-6' aria-hidden='true' />
                                ) : (
                                    <FaRegHeart
                                        className='h-5 w-5 sm:h-6 sm:w-6'
                                        aria-hidden='true'
                                    />
                                )}
                            </button>
                            <ShareButton
                                url={`/product/${product.id}`}
                                title={product.name}
                                description={product.salesCopy?.tagline}
                                variant='dropdown'
                                size='md'
                            />
                        </div>

                        {/* Tagline */}
                        {product.salesCopy?.tagline && (
                            <MarkdownContent
                                content={product.salesCopy.tagline}
                                inline
                                className='text-primary/80 mb-2 text-xl sm:text-2xl md:text-3xl'
                            />
                        )}

                        {/* Secondary Tagline */}
                        {product.salesCopy?.secondaryTagline && (
                            <MarkdownContent
                                content={product.salesCopy.secondaryTagline}
                                inline
                                className='text-primary/60 mb-6 text-lg sm:text-xl'
                            />
                        )}

                        {/* Stats Proof */}
                        {(product.stats || product.averageRating !== undefined) && (
                            <div className='mb-8 flex flex-wrap gap-6'>
                                {(() => {
                                    const userCountStat = resolveStatItem(
                                        product.stats?.userCount,
                                        'Users'
                                    )
                                    return (
                                        userCountStat && (
                                            <div>
                                                <div className='text-secondary text-2xl font-bold sm:text-3xl'>
                                                    {userCountStat.value}
                                                </div>
                                                <div className='text-primary/60 text-sm'>
                                                    {userCountStat.label}
                                                </div>
                                            </div>
                                        )
                                    )
                                })()}
                                {(() => {
                                    const timeSavedStat = resolveStatItem(
                                        product.stats?.timeSaved,
                                        'Time Saved'
                                    )
                                    return (
                                        timeSavedStat && (
                                            <div>
                                                <div className='text-secondary text-2xl font-bold sm:text-3xl'>
                                                    {timeSavedStat.value}
                                                </div>
                                                <div className='text-primary/60 text-sm'>
                                                    {timeSavedStat.label}
                                                </div>
                                            </div>
                                        )
                                    )
                                })()}
                                {/* Additional Stats */}
                                {product.stats?.additionalStats?.map((stat, index) => (
                                    <div key={index}>
                                        <div className='text-secondary text-2xl font-bold sm:text-3xl'>
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
                                            className='hover:bg-primary/5 group -m-2 rounded-lg p-2 transition-colors'
                                        >
                                            <div className='flex items-center gap-2 text-2xl font-bold text-yellow-400 sm:text-3xl'>
                                                {product.averageRating.toFixed(1)}
                                                <FaStar
                                                    className='h-5 w-5 sm:h-6 sm:w-6'
                                                    aria-hidden='true'
                                                />
                                            </div>
                                            <div className='text-primary/60 group-hover:text-secondary text-sm transition-colors'>
                                                {product.ratingsCount}{' '}
                                                {product.ratingsCount === 1 ? 'rating' : 'ratings'}
                                            </div>
                                        </Link>
                                    )}
                                {/* Last Sale - Social proof for recent purchases */}
                                {product.stats?.lastSale && (
                                    <div className='border-success bg-success-subtle flex items-center gap-2 rounded-lg border px-3 py-2'>
                                        <div
                                            className='h-2 w-2 animate-pulse rounded-full'
                                            style={{
                                                backgroundColor: 'var(--color-success-muted)'
                                            }}
                                        />
                                        <span className='text-success text-sm'>
                                            Last sale{' '}
                                            {formatDistanceToNow(new Date(product.stats.lastSale), {
                                                addSuffix: true
                                            })}
                                        </span>
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
                                            onClick={() => handleVariantChange(variant)}
                                            aria-pressed={selectedVariant.name === variant.name}
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
                                                    {variant.description && (
                                                        <MarkdownContent
                                                            content={variant.description}
                                                            inline
                                                            className='text-primary/60 text-sm'
                                                        />
                                                    )}
                                                </div>

                                                {/* Right Column: Checkmark and Price */}
                                                <div className='flex flex-col items-end gap-1'>
                                                    <FaCheckCircle
                                                        className={`h-5 w-5 ${
                                                            selectedVariant.name === variant.name
                                                                ? 'text-secondary'
                                                                : 'invisible'
                                                        }`}
                                                        aria-hidden='true'
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
                        {product.isSubscription && variantFrequencies.length > 1 && (
                            <PaymentFrequencySelector
                                frequencies={variantFrequencies}
                                selected={selectedFrequency}
                                onChange={handleFrequencyChange}
                                monthlyPrice={selectedVariant.prices?.monthly ?? undefined}
                                quarterlyPrice={selectedVariant.prices?.quarterly ?? undefined}
                                yearlyPrice={selectedVariant.prices?.yearly ?? undefined}
                                biennialPrice={selectedVariant.prices?.biennial ?? undefined}
                            />
                        )}

                        {/* Price & CTA */}
                        <div className='flex flex-col gap-4 px-3 sm:flex-row sm:items-center sm:px-0'>
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
                                onClick={handleBuyClick}
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
                                                <FaCheckCircle
                                                    className='text-secondary h-4 w-4 shrink-0'
                                                    aria-hidden='true'
                                                />
                                                <MarkdownContent content={guarantee} inline />
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
                        className='relative flex items-start justify-center lg:sticky lg:top-24'
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
                                onMediaClick={open}
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

            {/* Lightbox for cover media (images and videos) */}
            {coverImages.length > 0 && (
                <MediaLightbox
                    mediaItems={coverImages}
                    initialIndex={selectedIndex}
                    isOpen={isOpen}
                    onClose={close}
                />
            )}
        </section>
    )
}

export default ProductHero
