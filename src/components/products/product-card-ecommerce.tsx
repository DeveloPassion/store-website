import { Link } from 'react-router'
import { FaShoppingCart, FaHeart, FaStar, FaTrophy } from 'react-icons/fa'
import type { Product } from '@/types/product'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/types/category'

interface ProductCardEcommerceProps {
    product: Product
    onAddToCart?: () => void
}

const ProductCardEcommerce: React.FC<ProductCardEcommerceProps> = ({ product, onAddToCart }) => {
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        if (onAddToCart) {
            onAddToCart()
        } else {
            // Open product page
            window.location.href = `/l/${product.id}`
        }
    }

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        // Wishlist functionality
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
            <div className='from-secondary/10 relative aspect-[4/3] overflow-hidden bg-gradient-to-br to-purple-500/10'>
                <Link to={`/l/${product.id}`} className='block h-full w-full'>
                    {product.coverImage ? (
                        <img
                            src={product.coverImage}
                            alt={product.name}
                            className='h-full w-full object-cover transition-transform group-hover:scale-105'
                        />
                    ) : (
                        <div className='flex h-full w-full items-center justify-center'>
                            <span className='text-6xl opacity-30'>📦</span>
                        </div>
                    )}

                    {/* Quick View Overlay */}
                    <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                        <span className='text-background rounded-lg bg-white px-4 py-2 text-sm font-semibold'>
                            Quick View
                        </span>
                    </div>
                </Link>

                {/* Badges */}
                <div className='pointer-events-none absolute top-3 left-3 flex flex-col gap-2'>
                    {badge && (
                        <div
                            className={`rounded-full ${badge.color} px-3 py-1 text-xs font-bold text-white shadow-lg`}
                        >
                            {badge.text}
                        </div>
                    )}
                    {product.featured && (
                        <div className='flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg'>
                            <FaStar className='h-3 w-3' />
                            <span>BESTSELLER</span>
                        </div>
                    )}
                    {product.mostValue && (
                        <div className='flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white shadow-lg'>
                            <FaTrophy className='h-3 w-3' />
                            <span>MOST VALUE</span>
                        </div>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className='text-primary/60 hover:text-secondary absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 opacity-0 transition-all group-hover:opacity-100 hover:bg-white'
                    aria-label='Add to wishlist'
                >
                    <FaHeart className='h-4 w-4' />
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
                <Link to={`/l/${product.id}`} className='group/title'>
                    <h3 className='group-hover/title:text-secondary mb-2 line-clamp-2 text-base font-bold transition-colors'>
                        {product.name}
                    </h3>
                </Link>

                {/* Tagline */}
                <p className='text-primary/60 mb-3 line-clamp-2 flex-1 text-sm'>
                    {product.tagline}
                </p>

                {/* Rating (placeholder) */}
                <div className='mb-3 flex items-center gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar key={star} className='text-secondary h-3 w-3' />
                    ))}
                    <span className='text-primary/60 ml-1 text-xs'>(4.9)</span>
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
                    <button
                        onClick={handleAddToCart}
                        className='bg-secondary hover:bg-secondary/90 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors'
                    >
                        <FaShoppingCart className='h-4 w-4' />
                        {isFree ? 'Get' : 'Buy'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCardEcommerce
