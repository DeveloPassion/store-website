import { useMemo, useEffect } from 'react'
import { Link } from 'react-router'
import { FaStar, FaCheckCircle, FaRocket } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import type { Product } from '@/types/product'
import { sortFeaturedProducts } from '@/lib/product-sort'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'

const FeaturedPage: React.FC = () => {
    const products = productsData as Product[]

    // Set breadcrumbs
    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Featured Products' }])

    // Get featured products, sorted intelligently
    const featuredProducts = useMemo(() => {
        const filtered = products.filter((p) => p.featured && p.status !== 'archived')
        return sortFeaturedProducts(filtered)
    }, [])

    useEffect(() => {
        document.title = 'Featured Products - Knowledge Forge'

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Discover our handpicked featured products. The best tools, courses, and resources for knowledge workers.'
            )
        }

        // Update OG tags
        const ogTitle = document.querySelector('meta[property="og:title"]')
        if (ogTitle) {
            ogTitle.setAttribute('content', 'Featured Products - Knowledge Forge')
        }

        const ogDescription = document.querySelector('meta[property="og:description"]')
        if (ogDescription) {
            ogDescription.setAttribute(
                'content',
                'Discover our handpicked featured products. The best tools, courses, and resources for knowledge workers.'
            )
        }

        const ogUrl = document.querySelector('meta[property="og:url"]')
        if (ogUrl) {
            ogUrl.setAttribute('content', 'https://store.dsebastien.net/featured')
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
                            <FaStar className='h-10 w-10 text-white' />
                        </div>
                    </div>

                    <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'>
                        Featured Products
                    </h1>
                    <p className='text-primary/70 mx-auto mb-8 max-w-2xl text-lg sm:text-xl md:text-2xl'>
                        Our handpicked selection of the best tools, courses, and resources for
                        knowledge workers.
                    </p>

                    {/* Stats */}
                    <div className='mb-10 flex flex-wrap justify-center gap-6 sm:gap-10'>
                        <div className='text-center'>
                            <div className='text-secondary text-3xl font-bold sm:text-4xl'>
                                {featuredProducts.length}
                            </div>
                            <div className='text-primary/60 text-sm'>Featured Products</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-green-500 sm:text-4xl'>
                                Expert
                            </div>
                            <div className='text-primary/60 text-sm'>Curated</div>
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

            {/* Why Featured Section */}
            <Section className='bg-primary/5 py-12 sm:py-16'>
                <div className='mx-auto max-w-[1400px]'>
                    <h2 className='mb-8 text-center text-3xl font-bold sm:text-4xl'>
                        Why These Products?
                    </h2>
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        <div className='border-primary/10 bg-background rounded-xl border p-6'>
                            <FaCheckCircle className='text-secondary mb-4 h-8 w-8' />
                            <h3 className='mb-2 text-lg font-bold'>Handpicked Excellence</h3>
                            <p className='text-primary/70 text-sm'>
                                Each featured product is carefully selected based on quality,
                                effectiveness, and user feedback.
                            </p>
                        </div>
                        <div className='border-primary/10 bg-background rounded-xl border p-6'>
                            <FaStar className='text-secondary mb-4 h-8 w-8' />
                            <h3 className='mb-2 text-lg font-bold'>Premium Quality</h3>
                            <p className='text-primary/70 text-sm'>
                                Only the best make it to our featured collection - products that
                                deliver real results.
                            </p>
                        </div>
                        <div className='border-primary/10 bg-background rounded-xl border p-6'>
                            <FaRocket className='text-secondary mb-4 h-8 w-8' />
                            <h3 className='mb-2 text-lg font-bold'>Immediate Impact</h3>
                            <p className='text-primary/70 text-sm'>
                                Start seeing results quickly with these proven tools and resources
                                designed for knowledge workers.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Products Grid Section */}
            <Section className='py-12 sm:py-16'>
                <div className='w-full'>
                    <h2 className='mb-8 text-center text-3xl font-bold sm:text-4xl'>
                        Our Featured Collection
                    </h2>

                    {featuredProducts.length > 0 ? (
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                            {featuredProducts.map((product) => (
                                <ProductCardEcommerce key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className='py-16 text-center'>
                            <div className='mb-4 text-5xl'>⭐</div>
                            <h3 className='mb-2 text-xl font-semibold'>
                                Featured products coming soon
                            </h3>
                            <p className='text-primary/60 mb-4'>
                                We're carefully selecting our best offerings.
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
                        Ready to Transform Your Workflow?
                    </h2>
                    <p className='text-primary/70 mb-8 text-lg'>
                        Choose from our featured collection and experience the difference that
                        quality tools and resources make.
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

export default FeaturedPage
