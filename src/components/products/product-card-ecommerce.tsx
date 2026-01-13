import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { FaShoppingCart, FaHeart, FaRegHeart, FaStar, FaTrophy, FaFire } from 'react-icons/fa'
import type { Product } from '@/schemas/product.schema'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/schemas/category.schema'
import { buildGumroadUrlFromProduct } from '@/lib/gumroad-url'
import { isInWishlist, toggleWishlist } from '@/lib/wishlist'
import { Button } from '@/components/ui/button'

interface ProductCardEcommerceProps {
    product: Product
    onAddToCart?: () => void
    compactBadges?: boolean
}

const ProductCardEcommerce: React.FC<ProductCardEcommerceProps> = ({
    product,
    onAddToCart,
    compactBadges = false
}) => {
    // Initialize with actual wishlist status to avoid cascading renders
    const [isWishlisted, setIsWishlisted] = useState(() => isInWishlist(product.id))

    // Update wishlist status when product changes (different product ID)
    // This is intentional to handle product prop changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsWishlisted(isInWishlist(product.id))
    }, [product.id])

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        if (onAddToCart) {
            onAddToCart()
        }
    }

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newState = toggleWishlist(product.id)
        setIsWishlisted(newState)
    }

    // Get the display price
    const displayPrice = product.priceDisplay || `€${product.price.toFixed(2)}`
    const isFree = product.price === 0 || product.priceTier === 'free'

    // Get badge text
    const getBadge = () => {
        if (product.featured) return { text: 'FEATURED', color: 'bg-secondary' }
        if (isFree) return { text: 'FREE', color: 'bg-green-500' }
        if (product.mainCategory === 'bundles') return { text: 'BUNDLE', color: 'bg-purple-500' }
        return null
    }

    const badge = getBadge()

    // Get all categories for display (mainCategory + non-distant secondaryCategories)
    const categories = categoriesData as Category[]
    const visibleCategoryIds = [
        product.mainCategory,
        ...product.secondaryCategories.filter((sc) => !sc.distant).map((sc) => sc.id)
    ]
    const productCategories = visibleCategoryIds
        .map((catId) => categories.find((c) => c.id === catId))
        .filter((cat): cat is Category => cat !== undefined)

    return (
        <div className='group border-primary/10 bg-primary/5 hover:border-secondary/30 hover:shadow-secondary/10 relative flex flex-col overflow-hidden rounded-xl border transition-all hover:shadow-xl'>
            {/* Image Container */}
            <div className='from-secondary/10 relative aspect-[16/9] overflow-hidden bg-gradient-to-br to-purple-500/10'>
                <Link to={`/product/${product.id}`} className='block h-full w-full'>
                    {(() => {
                        // Get first image from media array (prioritize cover → main → secondary → bonus)
                        const firstImage = product.media
                            ?.filter((item) => item.type === 'image')
                            .sort((a, b) => {
                                const groupPriority: Record<string, number> = {
                                    cover: 0, // Highest priority for cards
                                    main: 1,
                                    secondary: 2,
                                    bonus: 3
                                }
                                const aPriority = (a?.group && groupPriority[a.group]) ?? 999
                                const bPriority = (b?.group && groupPriority[b.group]) ?? 999
                                return aPriority - bPriority || (a?.order ?? 0) - (b?.order ?? 0)
                            })[0]

                        return firstImage ? (
                            <img
                                src={firstImage.url}
                                alt={firstImage.altText}
                                className='h-full w-full object-cover transition-transform group-hover:scale-105'
                            />
                        ) : (
                            <div className='flex h-full w-full items-center justify-center'>
                                <span className='text-6xl opacity-30'>📦</span>
                            </div>
                        )
                    })()}

                    {/* Call-to-Action Overlay */}
                    <div className='absolute inset-0 flex items-end justify-end bg-black/40 p-3 opacity-0 transition-opacity group-hover:opacity-100 md:items-center md:justify-center md:p-0'>
                        <span className='text-background rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-lg'>
                            See What's Inside
                        </span>
                    </div>
                </Link>

                {/* Badges */}
                <div className='absolute top-3 left-3 flex flex-col gap-2'>
                    {badge && badge.text === 'FEATURED' ? (
                        <Link
                            to='/featured'
                            onClick={(e) => e.stopPropagation()}
                            className={`pointer-events-auto flex items-center gap-1 rounded-full ${badge.color} ${
                                compactBadges ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
                            } font-bold text-white shadow-lg transition-transform hover:scale-105`}
                        >
                            <FaStar className={compactBadges ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                            <span>{badge.text}</span>
                        </Link>
                    ) : badge ? (
                        <div
                            className={`pointer-events-none rounded-full ${badge.color} ${
                                compactBadges ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
                            } font-bold text-white shadow-lg`}
                        >
                            {badge.text}
                        </div>
                    ) : null}
                    {product.bestseller && (
                        <Link
                            to='/best-sellers'
                            onClick={(e) => e.stopPropagation()}
                            className={`pointer-events-auto flex items-center gap-1 rounded-full bg-amber-500 ${
                                compactBadges ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
                            } font-bold text-white shadow-lg transition-transform hover:scale-105`}
                        >
                            <FaFire className={compactBadges ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                            <span>BESTSELLER</span>
                        </Link>
                    )}
                    {product.bestValue && (
                        <Link
                            to='/best-value'
                            onClick={(e) => e.stopPropagation()}
                            className={`pointer-events-auto flex items-center gap-1 rounded-full bg-blue-500 ${
                                compactBadges ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
                            } font-bold text-white shadow-lg transition-transform hover:scale-105`}
                        >
                            <FaTrophy className={compactBadges ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                            <span>BEST VALUE</span>
                        </Link>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className={`absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 transition-all hover:bg-white ${
                        isWishlisted ? 'text-secondary' : 'hover:text-secondary text-gray-600'
                    }`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    {isWishlisted ? (
                        <FaHeart className='h-4 w-4' />
                    ) : (
                        <FaRegHeart className='h-4 w-4' />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className='flex flex-1 flex-col p-4'>
                {/* Category Badges */}
                <div className='mb-2 flex flex-wrap items-center gap-2'>
                    {productCategories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/categories/${category.id}`}
                            className='bg-primary/10 text-primary/70 hover:bg-secondary/10 hover:text-secondary rounded px-2 py-0.5 text-xs font-medium transition-colors'
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>

                {/* Title */}
                <Link to={`/product/${product.id}`} className='group/title'>
                    <h3 className='group-hover/title:text-secondary mb-2 line-clamp-2 text-base font-bold transition-colors'>
                        {product.name}
                    </h3>
                </Link>

                {/* Tagline */}
                <p className='text-primary/60 mb-3 line-clamp-2 flex-1 text-sm'>
                    {product.salesCopy?.tagline}
                </p>

                {/* Rating (placeholder) */}
                <div className='mb-3 flex items-center gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar key={star} className='text-secondary h-3 w-3' />
                    ))}
                </div>

                {/* Price and CTA */}
                <div className='flex items-center justify-between gap-2'>
                    <div>
                        {isFree ? (
                            <span className='text-lg font-bold text-green-400'>FREE</span>
                        ) : (
                            <span className='text-lg font-bold'>{displayPrice}</span>
                        )}
                    </div>
                    {onAddToCart ? (
                        <Button
                            onClick={handleAddToCart}
                            size='sm'
                            leftIcon={<FaShoppingCart className='h-4 w-4' />}
                        >
                            {isFree ? 'Get Now' : 'Buy'}
                        </Button>
                    ) : (
                        <Button
                            as='a'
                            href={buildGumroadUrlFromProduct(product)}
                            data-gumroad-overlay-checkout='true'
                            size='sm'
                            leftIcon={<FaShoppingCart className='h-4 w-4' />}
                        >
                            {isFree ? 'Get Now' : 'Buy'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductCardEcommerce
