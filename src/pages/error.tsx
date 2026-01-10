import { useMemo, useEffect } from 'react'
import { Link, useRouteError, isRouteErrorResponse } from 'react-router'
import { FaBug, FaHome, FaStar, FaTrophy, FaFire } from 'react-icons/fa'
import Section from '@/components/ui/section'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import type { Product } from '@/types/product'
import { sortFeaturedProducts } from '@/lib/product-sort'

const ErrorPage: React.FC = () => {
    const error = useRouteError()
    const products = productsData as Product[]

    // Determine error message
    const errorMessage = useMemo(() => {
        if (isRouteErrorResponse(error)) {
            return error.statusText || 'An error occurred'
        }
        if (error instanceof Error) {
            return error.message
        }
        return 'An unexpected error occurred'
    }, [error])

    // Get featured products, sorted intelligently
    const featuredProducts = useMemo(() => {
        const filtered = products.filter((p) => p.featured && p.status !== 'archived')
        return sortFeaturedProducts(filtered).slice(0, 6) // Show up to 6 products
    }, [products])

    useEffect(() => {
        document.title = 'Error - Knowledge Forge'

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Something went wrong. Browse our featured products while we fix the issue.'
            )
        }

        // Update OG tags
        const ogTitle = document.querySelector('meta[property="og:title"]')
        if (ogTitle) {
            ogTitle.setAttribute('content', 'Error - Knowledge Forge')
        }

        const ogDescription = document.querySelector('meta[property="og:description"]')
        if (ogDescription) {
            ogDescription.setAttribute(
                'content',
                'Something went wrong. Browse our featured products while we fix the issue.'
            )
        }

        const ogUrl = document.querySelector('meta[property="og:url"]')
        if (ogUrl) {
            ogUrl.setAttribute('content', 'https://store.dsebastien.net/error')
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
            <Section className='pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20'>
                <div className='mx-auto max-w-[1400px] text-center'>
                    {/* Icon */}
                    <div className='mb-6 flex justify-center'>
                        <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-lg'>
                            <FaBug className='h-10 w-10 text-white' />
                        </div>
                    </div>

                    <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'>
                        Oops! Something Went Wrong
                    </h1>
                    <p className='text-primary/70 mx-auto mb-4 max-w-2xl text-lg sm:text-xl md:text-2xl'>
                        We encountered an unexpected error. Don't worry, our team has been notified
                        and is working on it.
                    </p>

                    {/* Error Details (for development) */}
                    {process.env['NODE_ENV'] === 'development' && (
                        <div className='border-primary/20 bg-primary/5 mx-auto mb-8 max-w-2xl rounded-lg border p-4 text-left'>
                            <p className='text-primary/70 font-mono text-sm break-words'>
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className='mb-10 flex flex-wrap justify-center gap-4'>
                        <Link
                            to='/'
                            className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-colors'
                        >
                            <FaHome className='h-5 w-5' />
                            Go Home
                        </Link>
                        <Link
                            to='/products'
                            className='border-primary/20 hover:border-secondary/50 inline-flex items-center gap-2 rounded-lg border bg-transparent px-6 py-3 font-semibold transition-colors'
                        >
                            All Products
                        </Link>
                        <Link
                            to='/help'
                            className='border-primary/20 hover:border-secondary/50 inline-flex items-center gap-2 rounded-lg border bg-transparent px-6 py-3 font-semibold transition-colors'
                        >
                            Get Help
                        </Link>
                    </div>
                </div>
            </Section>

            {/* Quick Navigation Section */}
            <Section className='bg-primary/5 py-12 sm:py-16'>
                <div className='mx-auto max-w-[1400px]'>
                    <h2 className='mb-8 text-center text-3xl font-bold sm:text-4xl'>
                        Popular Destinations
                    </h2>
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                        <Link
                            to='/featured'
                            className='border-primary/10 bg-background hover:border-secondary/50 group rounded-xl border p-6 transition-all hover:shadow-lg'
                        >
                            <FaStar className='text-secondary mb-4 h-8 w-8 transition-transform group-hover:scale-110' />
                            <h3 className='mb-2 text-lg font-bold'>Featured Products</h3>
                            <p className='text-primary/70 text-sm'>
                                Our handpicked selection of the best products
                            </p>
                        </Link>
                        <Link
                            to='/best-value'
                            className='border-primary/10 bg-background hover:border-secondary/50 group rounded-xl border p-6 transition-all hover:shadow-lg'
                        >
                            <FaTrophy className='mb-4 h-8 w-8 text-blue-500 transition-transform group-hover:scale-110' />
                            <h3 className='mb-2 text-lg font-bold'>Best Value</h3>
                            <p className='text-primary/70 text-sm'>
                                Get the most bang for your buck
                            </p>
                        </Link>
                        <Link
                            to='/best-sellers'
                            className='border-primary/10 bg-background hover:border-secondary/50 group rounded-xl border p-6 transition-all hover:shadow-lg'
                        >
                            <FaFire className='mb-4 h-8 w-8 text-orange-500 transition-transform group-hover:scale-110' />
                            <h3 className='mb-2 text-lg font-bold'>Best Sellers</h3>
                            <p className='text-primary/70 text-sm'>
                                Most popular products among customers
                            </p>
                        </Link>
                        <Link
                            to='/products'
                            className='border-primary/10 bg-background hover:border-secondary/50 group rounded-xl border p-6 transition-all hover:shadow-lg'
                        >
                            <FaHome className='mb-4 h-8 w-8 text-green-500 transition-transform group-hover:scale-110' />
                            <h3 className='mb-2 text-lg font-bold'>All Products</h3>
                            <p className='text-primary/70 text-sm'>Browse our complete catalog</p>
                        </Link>
                    </div>
                </div>
            </Section>

            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
                <Section className='py-12 sm:py-16'>
                    <div className='w-full'>
                        <h2 className='mb-8 text-center text-3xl font-bold sm:text-4xl'>
                            Featured Products
                        </h2>

                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                            {featuredProducts.map((product) => (
                                <ProductCardEcommerce key={product.id} product={product} />
                            ))}
                        </div>

                        <div className='mt-8 text-center'>
                            <Link
                                to='/featured'
                                className='text-secondary hover:text-secondary-text inline-flex items-center gap-2 font-semibold'
                            >
                                View All Featured Products →
                            </Link>
                        </div>
                    </div>
                </Section>
            )}
        </>
    )
}

export default ErrorPage
