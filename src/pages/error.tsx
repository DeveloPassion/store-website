import { useMemo, useEffect } from 'react'
import { Link, useRouteError, isRouteErrorResponse } from 'react-router'
import { FaBug, FaHome } from 'react-icons/fa'
import Section from '@/components/ui/section'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import QuickNavigation from '@/components/navigation/quick-navigation'
import productsData from '@/data/products.json'
import type { Product } from '@/schemas/product.schema'
import { sortFeaturedProducts } from '@/lib/product-sort'
import { updateAllMetaTags } from '@/lib/update-meta-tags'

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
        const filtered = products.filter((p) => p.featured)
        return sortFeaturedProducts(filtered).slice(0, 6) // Show up to 6 products
    }, [products])

    useEffect(() => {
        updateAllMetaTags({
            title: 'Error - Knowledge Forge',
            description:
                'Something went wrong. Browse our featured products while we fix the issue.',
            url: 'https://store.dsebastien.net/error'
        })
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
            <Section className='border-primary/10 bg-primary/5 border-t border-b py-0'>
                <QuickNavigation
                    title='While We Fix This...'
                    description='Explore the products while we resolve the issue'
                />
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
