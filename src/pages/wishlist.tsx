import { useMemo, useEffect } from 'react'
import { Link } from 'react-router'
import { FaHeart } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import type { Product } from '@/types/product'
import { getWishlist } from '@/lib/wishlist'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'

const WishlistPage: React.FC = () => {
    const products = productsData as Product[]

    // Set breadcrumbs
    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Wishlist' }])

    // Get wishlist product IDs and filter products
    const wishlistProducts = useMemo(() => {
        const wishlistIds = getWishlist()
        const filtered = products.filter((p) => wishlistIds.includes(p.id))
        // Sort by priority (highest first) to match other pages
        return filtered.sort((a, b) => b.priority - a.priority)
    }, [products])

    const wishlistCount = wishlistProducts.length

    useEffect(() => {
        document.title = 'My Wishlist - Knowledge Forge'

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'View and manage your saved products. Your personal wishlist of tools, courses, and resources.'
            )
        }

        // Update OG tags
        const ogTitle = document.querySelector('meta[property="og:title"]')
        if (ogTitle) {
            ogTitle.setAttribute('content', 'My Wishlist - Knowledge Forge')
        }

        const ogDescription = document.querySelector('meta[property="og:description"]')
        if (ogDescription) {
            ogDescription.setAttribute(
                'content',
                'View and manage your saved products. Your personal wishlist of tools, courses, and resources.'
            )
        }

        const ogUrl = document.querySelector('meta[property="og:url"]')
        if (ogUrl) {
            ogUrl.setAttribute('content', 'https://store.dsebastien.net/wishlist')
        }

        // Reset og:image to default for generic pages
        const ogImage = document.querySelector('meta[property="og:image"]')
        if (ogImage) {
            ogImage.setAttribute(
                'content',
                'https://store.dsebastien.net/assets/images/social-card.png'
            )
        }
    }, [])

    return (
        <>
            {/* Hero Section */}
            <Section className='pt-16 pb-6 sm:pt-24 sm:pb-8'>
                <div className='mx-auto max-w-[1400px] text-center'>
                    <Breadcrumb className='mb-6 flex justify-center' />

                    {/* Icon */}
                    <div className='mb-4 flex justify-center'>
                        <div className='from-secondary to-secondary/80 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br shadow-lg sm:h-20 sm:w-20'>
                            <FaHeart className='h-8 w-8 text-white sm:h-10 sm:w-10' />
                        </div>
                    </div>

                    <h1 className='mb-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'>
                        My Wishlist
                    </h1>
                    <p className='text-primary/70 mx-auto mb-6 max-w-2xl text-base sm:text-lg'>
                        {wishlistCount > 0
                            ? "Products you've saved for later. Ready to take the next step?"
                            : 'Start saving products you love to your wishlist'}
                    </p>

                    {/* Stats */}
                    {wishlistCount > 0 && (
                        <div className='flex flex-wrap justify-center gap-4 sm:gap-6'>
                            <div className='text-center'>
                                <div className='text-secondary text-3xl font-bold sm:text-4xl'>
                                    {wishlistCount}
                                </div>
                                <div className='text-primary/60 text-sm'>
                                    {wishlistCount === 1 ? 'Saved Product' : 'Saved Products'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            {/* Products Grid or Empty State */}
            <Section className='pt-0 pb-16 sm:pb-24'>
                <div className='w-full'>
                    {wishlistProducts.length > 0 ? (
                        <>
                            <h2 className='mb-6 text-center text-2xl font-bold sm:text-3xl'>
                                Your Saved Products
                            </h2>
                            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                                {wishlistProducts.map((product) => (
                                    <ProductCardEcommerce key={product.id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className='py-16 text-center'>
                            <div className='mb-6 text-7xl'>💖</div>
                            <h3 className='mb-3 text-2xl font-semibold'>Your wishlist is empty</h3>
                            <p className='text-primary/60 mb-8 text-lg'>
                                Start adding products you love to your wishlist
                            </p>

                            {/* Quick Links */}
                            <div className='mx-auto grid max-w-3xl gap-4 sm:grid-cols-2 md:grid-cols-4'>
                                <Link
                                    to='/featured'
                                    className='bg-secondary hover:bg-secondary/90 rounded-lg px-6 py-4 font-semibold text-white transition-colors'
                                >
                                    ⭐ Featured
                                </Link>
                                <Link
                                    to='/best-value'
                                    className='border-primary/20 hover:border-secondary/50 hover:bg-primary/5 rounded-lg border bg-transparent px-6 py-4 font-semibold transition-colors'
                                >
                                    💎 Best Value
                                </Link>
                                <Link
                                    to='/best-sellers'
                                    className='border-primary/20 hover:border-secondary/50 hover:bg-primary/5 rounded-lg border bg-transparent px-6 py-4 font-semibold transition-colors'
                                >
                                    🔥 Best Sellers
                                </Link>
                                <Link
                                    to='/products'
                                    className='border-primary/20 hover:border-secondary/50 hover:bg-primary/5 rounded-lg border bg-transparent px-6 py-4 font-semibold transition-colors'
                                >
                                    🛍️ All Products
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            {/* CTA Section - Only show when wishlist has items */}
            {wishlistCount > 0 && (
                <Section className='bg-primary/5 py-12 sm:py-14'>
                    <div className='mx-auto max-w-2xl text-center'>
                        <h2 className='mb-3 text-2xl font-bold sm:text-3xl'>
                            Ready to Get Started?
                        </h2>
                        <p className='text-primary/70 mb-6 text-base sm:text-lg'>
                            Transform your workflow with these carefully selected tools and
                            resources.
                        </p>
                        <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
                            <Link
                                to='/products'
                                className='bg-secondary hover:bg-secondary/90 rounded-lg px-8 py-3 font-semibold text-white transition-colors'
                            >
                                Discover More Products
                            </Link>
                            <Link
                                to='/help'
                                className='border-primary/20 hover:border-secondary/50 rounded-lg border bg-transparent px-8 py-3 font-semibold transition-colors'
                            >
                                Get Help Choosing
                            </Link>
                        </div>
                    </div>
                </Section>
            )}
        </>
    )
}

export default WishlistPage
