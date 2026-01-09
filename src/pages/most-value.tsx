import { useMemo, useEffect } from 'react'
import { Link } from 'react-router'
import { FaTrophy, FaCheckCircle } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import type { Product } from '@/types/product'
import { sortProductsByPriority } from '@/lib/product-sort'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'

const MostValuePage: React.FC = () => {
    const products = productsData as Product[]

    // Set breadcrumbs
    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Best Value' }])

    // Get most value products
    const mostValueProducts = useMemo(() => {
        const filtered = products.filter((p) => p.mostValue && p.status !== 'archived')
        return sortProductsByPriority(filtered)
    }, [])

    useEffect(() => {
        document.title = 'Most Value Products - Knowledge Forge'
    }, [])

    return (
        <>
            {/* Hero Section */}
            <Section className='pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20'>
                <div className='mx-auto max-w-4xl text-center'>
                    <Breadcrumb className='mb-8 flex justify-center' />

                    {/* Icon */}
                    <div className='mb-6 flex justify-center'>
                        <div className='flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10'>
                            <FaTrophy className='h-10 w-10 text-blue-500' />
                        </div>
                    </div>

                    <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'>
                        Best Value Products
                    </h1>
                    <p className='text-primary/70 mx-auto mb-8 max-w-2xl text-lg sm:text-xl md:text-2xl'>
                        Get the most bang for your buck. Our carefully curated selection of products
                        that deliver exceptional value for knowledge workers.
                    </p>

                    {/* Value Stats */}
                    <div className='mb-10 flex flex-wrap justify-center gap-6 sm:gap-10'>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-blue-500 sm:text-4xl'>
                                {mostValueProducts.length}
                            </div>
                            <div className='text-primary/60 text-sm'>Curated Picks</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-green-500 sm:text-4xl'>Top</div>
                            <div className='text-primary/60 text-sm'>Value for Money</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-secondary text-3xl font-bold sm:text-4xl'>
                                Expert
                            </div>
                            <div className='text-primary/60 text-sm'>Recommended</div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Why Most Value Section */}
            <Section className='bg-primary/5 py-12 sm:py-16'>
                <div className='mx-auto max-w-4xl'>
                    <h2 className='mb-8 text-center text-3xl font-bold sm:text-4xl'>
                        Why These Products?
                    </h2>
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        <div className='border-primary/10 bg-background rounded-xl border p-6'>
                            <FaCheckCircle className='mb-4 h-8 w-8 text-blue-500' />
                            <h3 className='mb-2 text-lg font-bold'>Comprehensive Coverage</h3>
                            <p className='text-primary/70 text-sm'>
                                Everything you need in one package, eliminating the need for
                                multiple purchases.
                            </p>
                        </div>
                        <div className='border-primary/10 bg-background rounded-xl border p-6'>
                            <FaCheckCircle className='mb-4 h-8 w-8 text-blue-500' />
                            <h3 className='mb-2 text-lg font-bold'>Long-term Value</h3>
                            <p className='text-primary/70 text-sm'>
                                Investments that keep giving back through continuous updates and
                                support.
                            </p>
                        </div>
                        <div className='border-primary/10 bg-background rounded-xl border p-6'>
                            <FaCheckCircle className='mb-4 h-8 w-8 text-blue-500' />
                            <h3 className='mb-2 text-lg font-bold'>Best ROI</h3>
                            <p className='text-primary/70 text-sm'>
                                Proven to deliver the highest return on investment for knowledge
                                workers.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Products Grid Section */}
            <Section className='py-12 sm:py-16'>
                <div className='mx-auto max-w-7xl'>
                    <h2 className='mb-8 text-center text-3xl font-bold sm:text-4xl'>
                        Our Top Value Picks
                    </h2>

                    {mostValueProducts.length > 0 ? (
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                            {mostValueProducts.map((product) => (
                                <ProductCardEcommerce key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className='py-16 text-center'>
                            <div className='mb-4 text-5xl'>🏆</div>
                            <h3 className='mb-2 text-xl font-semibold'>
                                Most value products coming soon
                            </h3>
                            <p className='text-primary/60 mb-4'>
                                We're carefully selecting our best value offerings.
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
                    <h2 className='mb-4 text-3xl font-bold sm:text-4xl'>Ready to Get Started?</h2>
                    <p className='text-primary/70 mb-8 text-lg'>
                        Choose any of our most value products and start transforming your knowledge
                        work today.
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

export default MostValuePage
