import { useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router'
import { FaHeart, FaGift } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import type { Product } from '@/types/product'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'

const SharedWishlistPage: React.FC = () => {
    const products = productsData as Product[]
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    // Set breadcrumbs
    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Shared Wishlist' }])

    // Get product IDs from URL
    const productIdsParam = searchParams.get('products')

    // Redirect to homepage if no product IDs
    useEffect(() => {
        if (!productIdsParam) {
            navigate('/', { replace: true })
        }
    }, [productIdsParam, navigate])

    // Parse product IDs and filter products
    const sharedProducts = useMemo(() => {
        if (!productIdsParam) {
            return []
        }

        const productIds = productIdsParam.split(',').map((id) => id.trim())
        const filtered = products.filter((p) => productIds.includes(p.id))
        // Sort by priority (highest first)
        return filtered.sort((a, b) => b.priority - a.priority)
    }, [productIdsParam, products])

    const productCount = sharedProducts.length

    useEffect(() => {
        document.title = 'Shared Wishlist - Knowledge Forge'

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Check out this curated selection of products shared with you!'
            )
        }

        // Update OG tags
        const ogTitle = document.querySelector('meta[property="og:title"]')
        if (ogTitle) {
            ogTitle.setAttribute('content', 'Shared Wishlist - Knowledge Forge')
        }

        const ogDescription = document.querySelector('meta[property="og:description"]')
        if (ogDescription) {
            ogDescription.setAttribute(
                'content',
                'Check out this curated selection of products shared with you!'
            )
        }

        const ogUrl = document.querySelector('meta[property="og:url"]')
        if (ogUrl) {
            ogUrl.setAttribute(
                'content',
                `https://store.dsebastien.net/shared-wishlist${productIdsParam ? `?products=${productIdsParam}` : ''}`
            )
        }

        // Reset og:image to default for generic pages
        const ogImage = document.querySelector('meta[property="og:image"]')
        if (ogImage) {
            ogImage.setAttribute(
                'content',
                'https://store.dsebastien.net/assets/images/social-card.png'
            )
        }
    }, [productIdsParam])

    // Don't render anything if redirecting
    if (!productIdsParam) {
        return null
    }

    return (
        <>
            {/* Hero Section */}
            <Section className='pt-16 pb-6 sm:pt-24 sm:pb-8'>
                <div className='mx-auto max-w-[1400px] text-center'>
                    <Breadcrumb className='mb-6 flex justify-center' />

                    {/* Icon */}
                    <div className='mb-4 flex justify-center'>
                        <div className='from-secondary to-secondary/80 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br shadow-lg sm:h-20 sm:w-20'>
                            <FaGift className='h-8 w-8 text-white sm:h-10 sm:w-10' />
                        </div>
                    </div>

                    <h1 className='mb-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'>
                        Shared Wishlist
                    </h1>
                    <p className='text-primary/70 mx-auto mb-6 max-w-2xl text-base sm:text-lg'>
                        Someone shared these amazing products with you. Check them out!
                    </p>

                    {/* Stats */}
                    {productCount > 0 && (
                        <div className='flex flex-wrap justify-center gap-4 sm:gap-6'>
                            <div className='text-center'>
                                <div className='text-secondary text-3xl font-bold sm:text-4xl'>
                                    {productCount}
                                </div>
                                <div className='text-primary/60 text-sm'>
                                    {productCount === 1 ? 'Shared Product' : 'Shared Products'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            {/* Products Grid */}
            <Section className='pt-0 pb-16 sm:pb-24'>
                <div className='w-full'>
                    {sharedProducts.length > 0 ? (
                        <>
                            <h2 className='mb-6 text-center text-2xl font-bold sm:text-3xl'>
                                Recommended Products
                            </h2>
                            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                                {sharedProducts.map((product) => (
                                    <ProductCardEcommerce key={product.id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className='py-16 text-center'>
                            <div className='mb-6 text-7xl'>🤷</div>
                            <h3 className='mb-3 text-2xl font-semibold'>No products found</h3>
                            <p className='text-primary/60 mb-8 text-lg'>
                                The shared products might have been removed or are no longer
                                available.
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

            {/* CTA Section */}
            <Section className='bg-primary/5 py-12 sm:py-14'>
                <div className='mx-auto max-w-2xl text-center'>
                    <h2 className='mb-3 text-2xl font-bold sm:text-3xl'>Love These Products?</h2>
                    <p className='text-primary/70 mb-6 text-base sm:text-lg'>
                        Create your own wishlist and share it with friends!
                    </p>
                    <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
                        <Link
                            to='/products'
                            className='bg-secondary hover:bg-secondary/90 rounded-lg px-8 py-3 font-semibold text-white transition-colors'
                        >
                            Browse All Products
                        </Link>
                        <Link
                            to='/wishlist'
                            className='border-secondary hover:bg-secondary/10 flex items-center justify-center gap-2 rounded-lg border bg-transparent px-8 py-3 font-semibold transition-colors'
                        >
                            <FaHeart className='h-4 w-4' />
                            My Wishlist
                        </Link>
                    </div>
                </div>
            </Section>
        </>
    )
}

export default SharedWishlistPage
