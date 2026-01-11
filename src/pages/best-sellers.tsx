import { useMemo, useEffect } from 'react'
import { Link } from 'react-router'
import { FaStar, FaCheckCircle, FaFire } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import type { Product } from '@/types/product'
import { sortProductsIntelligently } from '@/lib/product-sort'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'

const BestSellersPage: React.FC = () => {
    const products = productsData as Product[]

    // Set breadcrumbs
    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Best Sellers' }])

    // Get bestseller products, sorted intelligently
    const bestsellerProducts = useMemo(() => {
        const filtered = products.filter((p) => p.bestseller)
        return sortProductsIntelligently(filtered)
    }, [products])

    useEffect(() => {
        document.title = 'Best Sellers - Knowledge Forge'

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Discover our most popular products. Bestsellers trusted by thousands of knowledge workers worldwide.'
            )
        }

        // Update OG tags
        const ogTitle = document.querySelector('meta[property="og:title"]')
        if (ogTitle) {
            ogTitle.setAttribute('content', 'Best Sellers - Knowledge Forge')
        }

        const ogDescription = document.querySelector('meta[property="og:description"]')
        if (ogDescription) {
            ogDescription.setAttribute(
                'content',
                'Discover our most popular products. Bestsellers trusted by thousands of knowledge workers worldwide.'
            )
        }

        const ogUrl = document.querySelector('meta[property="og:url"]')
        if (ogUrl) {
            ogUrl.setAttribute('content', 'https://store.dsebastien.net/best-sellers')
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
                    <Breadcrumb className='mb-8 flex justify-center' />

                    {/* Icon */}
                    <div className='mb-6 flex justify-center'>
                        <div className='from-secondary to-secondary/80 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-lg'>
                            <FaFire className='h-10 w-10 text-white' />
                        </div>
                    </div>

                    <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'>
                        Best Sellers
                    </h1>
                    <p className='text-primary/70 mx-auto mb-8 max-w-2xl text-lg sm:text-xl md:text-2xl'>
                        Our most popular products, trusted by thousands of knowledge workers
                        worldwide.
                    </p>

                    {/* Stats */}
                    <div className='mb-10 flex flex-wrap justify-center gap-6 sm:gap-10'>
                        <div className='text-center'>
                            <div className='text-secondary text-3xl font-bold sm:text-4xl'>
                                {bestsellerProducts.length}
                            </div>
                            <div className='text-primary/60 text-sm'>Bestsellers</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-green-500 sm:text-4xl'>
                                10,000+
                            </div>
                            <div className='text-primary/60 text-sm'>Happy Customers</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-blue-500 sm:text-4xl'>
                                4.9/5
                            </div>
                            <div className='text-primary/60 text-sm'>Average Rating</div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Why Bestsellers Section */}
            <Section className='bg-primary/5 py-12 sm:py-16'>
                <div className='mx-auto max-w-[1400px]'>
                    <h2 className='mb-8 text-center text-3xl font-bold sm:text-4xl'>
                        Why These Products?
                    </h2>
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        <div className='border-primary/10 bg-background rounded-xl border p-6'>
                            <FaCheckCircle className='text-secondary mb-4 h-8 w-8' />
                            <h3 className='mb-2 text-lg font-bold'>Proven Track Record</h3>
                            <p className='text-primary/70 text-sm'>
                                These products have helped thousands of knowledge workers transform
                                their productivity.
                            </p>
                        </div>
                        <div className='border-primary/10 bg-background rounded-xl border p-6'>
                            <FaStar className='text-secondary mb-4 h-8 w-8' />
                            <h3 className='mb-2 text-lg font-bold'>Highest Rated</h3>
                            <p className='text-primary/70 text-sm'>
                                Consistently receive 5-star reviews and positive feedback from our
                                community.
                            </p>
                        </div>
                        <div className='border-primary/10 bg-background rounded-xl border p-6'>
                            <FaFire className='text-secondary mb-4 h-8 w-8' />
                            <h3 className='mb-2 text-lg font-bold'>Community Favorites</h3>
                            <p className='text-primary/70 text-sm'>
                                The most recommended and shared products in our knowledge worker
                                community.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Products Grid Section */}
            <Section className='py-12 sm:py-16'>
                <div className='w-full'>
                    <h2 className='mb-8 text-center text-3xl font-bold sm:text-4xl'>
                        Our Bestselling Products
                    </h2>

                    {bestsellerProducts.length > 0 ? (
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                            {bestsellerProducts.map((product) => (
                                <ProductCardEcommerce key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className='py-16 text-center'>
                            <div className='mb-4 text-5xl'>🔥</div>
                            <h3 className='mb-2 text-xl font-semibold'>
                                Bestseller products coming soon
                            </h3>
                            <p className='text-primary/60 mb-4'>
                                We're carefully selecting our top-performing offerings.
                            </p>
                            <Link
                                to='/products'
                                className='bg-secondary hover:bg-secondary/90 inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors'
                            >
                                Browse All Products
                            </Link>
                        </div>
                    )}
                </div>
            </Section>

            {/* CTA Section */}
            <Section className='bg-primary/5 py-12 sm:py-16'>
                <div className='mx-auto max-w-2xl text-center'>
                    <h2 className='mb-4 text-3xl font-bold sm:text-4xl'>
                        Ready to Join Thousands?
                    </h2>
                    <p className='text-primary/70 mb-8 text-lg'>
                        Choose any of our bestselling products and experience the transformation
                        that's made them so popular.
                    </p>
                    <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
                        <Link
                            to='/products'
                            className='bg-secondary hover:bg-secondary/90 rounded-lg px-8 py-3 font-semibold text-white transition-colors'
                        >
                            View All Products
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
        </>
    )
}

export default BestSellersPage
