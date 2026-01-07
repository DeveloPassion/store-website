import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { FaShieldAlt, FaRocket, FaClock, FaGraduationCap } from 'react-icons/fa'
import Section from '@/components/ui/section'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import type { Product } from '@/types/product'
import { sortProductsByPriority } from '@/lib/product-sort'

const HomeEcommerce: React.FC = () => {
    const [searchParams] = useSearchParams()
    const categoryFilter = searchParams.get('category') || null
    const searchQuery = searchParams.get('q') || ''

    // Filter and sort products based on URL params
    const filteredProducts = useMemo(() => {
        let products = productsData as Product[]

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            products = products.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.tagline.toLowerCase().includes(query) ||
                    p.tags.some((t) => t.toLowerCase().includes(query))
            )
        }

        // Apply category filter
        if (categoryFilter) {
            const normalizedFilter = categoryFilter.toLowerCase()
            products = products.filter((p) => {
                if (normalizedFilter === 'courses') return p.type === 'course'
                if (normalizedFilter === 'kits') return p.type === 'kit'
                if (normalizedFilter === 'workshops') return p.type === 'workshop'
                if (normalizedFilter === 'bundles') return p.type === 'bundle'
                if (normalizedFilter === 'free resources')
                    return p.priceTier === 'free' || p.price === 0
                return true
            })
        }

        // Sort by priority (highest to lowest), with randomization within same priority
        return sortProductsByPriority(products)
    }, [searchQuery, categoryFilter])

    // Get featured products, sorted by priority
    const featuredProducts = useMemo(() => {
        const featured = (productsData as Product[]).filter((p) => p.featured)
        const sorted = sortProductsByPriority(featured)
        return sorted.slice(0, 3)
    }, [])

    // Get hero product (first featured product)
    const heroProduct = featuredProducts[0]

    return (
        <>
            {/* Hero Section */}
            <Section className='from-secondary/10 to-background bg-gradient-to-br via-purple-500/10 pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20'>
                <div className='mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:gap-12'>
                    {/* Hero Content */}
                    <div className='flex flex-col justify-center'>
                        <h1 className='mb-4 text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl'>
                            {heroProduct ? (
                                <>
                                    Build Your{' '}
                                    <span className='text-secondary'>Knowledge System</span> Today
                                </>
                            ) : (
                                <>
                                    Transform Your{' '}
                                    <span className='text-secondary'>Productivity</span>
                                </>
                            )}
                        </h1>
                        <p className='text-primary/70 mb-6 text-lg sm:text-xl'>
                            {heroProduct
                                ? heroProduct.tagline
                                : 'Professional courses, templates, and tools for knowledge workers.'}
                        </p>

                        {/* Stats */}
                        <div className='mb-8 grid grid-cols-2 gap-4'>
                            <div>
                                <div className='text-2xl font-bold text-green-400 sm:text-3xl'>
                                    2K+
                                </div>
                                <div className='text-primary/60 text-sm'>Students</div>
                            </div>
                            <div>
                                <div className='text-secondary text-2xl font-bold sm:text-3xl'>
                                    4.9/5
                                </div>
                                <div className='text-primary/60 text-sm'>Rating</div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className='flex flex-wrap gap-4'>
                            {heroProduct && (
                                <Link
                                    to={`/l/${heroProduct.id}`}
                                    className='bg-secondary hover:bg-secondary/90 inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-bold text-white transition-all hover:scale-105'
                                >
                                    Shop Now
                                    <FaRocket className='h-5 w-5' />
                                </Link>
                            )}
                            <Link
                                to='/?category=Free%20Resources'
                                className='bg-primary/10 hover:bg-primary/20 inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-bold transition-colors'
                            >
                                Browse Free Resources
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image/Product Card */}
                    {heroProduct && (
                        <div className='flex items-center justify-center lg:justify-end'>
                            <div className='w-full max-w-md'>
                                <ProductCardEcommerce product={heroProduct} />
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            {/* Trust Badges */}
            <Section className='border-primary/10 border-b py-8'>
                <div className='mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 sm:gap-12'>
                    <div className='flex items-center gap-3'>
                        <FaShieldAlt className='text-secondary h-8 w-8' />
                        <div>
                            <div className='font-semibold'>30-Day Guarantee</div>
                            <div className='text-primary/60 text-sm'>Risk-free purchase</div>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        <FaClock className='text-secondary h-8 w-8' />
                        <div>
                            <div className='font-semibold'>Lifetime Access</div>
                            <div className='text-primary/60 text-sm'>Buy once, use forever</div>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        <FaGraduationCap className='text-secondary h-8 w-8' />
                        <div>
                            <div className='font-semibold'>Expert Created</div>
                            <div className='text-primary/60 text-sm'>20+ years experience</div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Categories Section */}
            <Section className='py-12 sm:py-16'>
                <h2 className='mb-8 text-center text-3xl font-bold sm:text-4xl'>
                    Shop by Category
                </h2>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {[
                        {
                            name: 'Courses',
                            path: '/?category=Courses',
                            emoji: '🎓',
                            color: 'from-blue-500/20 to-blue-600/20'
                        },
                        {
                            name: 'Kits & Templates',
                            path: '/?category=Kits',
                            emoji: '🛠️',
                            color: 'from-purple-500/20 to-purple-600/20'
                        },
                        {
                            name: 'Workshops',
                            path: '/?category=Workshops',
                            emoji: '⚡',
                            color: 'from-secondary/20 to-pink-600/20'
                        },
                        {
                            name: 'Bundles',
                            path: '/?category=Bundles',
                            emoji: '📦',
                            color: 'from-green-500/20 to-green-600/20'
                        }
                    ].map((category) => (
                        <Link
                            key={category.name}
                            to={category.path}
                            className={`group border-primary/10 flex flex-col items-center justify-center rounded-xl border bg-gradient-to-br ${category.color} hover:border-secondary/30 hover:shadow-secondary/10 p-8 transition-all hover:scale-105 hover:shadow-xl`}
                        >
                            <div className='mb-3 text-5xl'>{category.emoji}</div>
                            <div className='group-hover:text-secondary text-lg font-bold'>
                                {category.name}
                            </div>
                        </Link>
                    ))}
                </div>
            </Section>

            {/* Featured Products Section */}
            {!categoryFilter && !searchQuery && featuredProducts.length > 0 && (
                <Section className='bg-primary/5 py-12 sm:py-16'>
                    <div className='mb-8 flex items-center justify-between'>
                        <h2 className='text-3xl font-bold sm:text-4xl'>Featured Products</h2>
                        <Link
                            to='/'
                            className='text-secondary hover:text-secondary-text hidden text-sm font-semibold sm:block'
                        >
                            View All →
                        </Link>
                    </div>
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        {featuredProducts.map((product) => (
                            <ProductCardEcommerce key={product.id} product={product} />
                        ))}
                    </div>
                </Section>
            )}

            {/* All Products Section */}
            <Section className='py-12 sm:py-16'>
                <div className='mb-8'>
                    <h2 className='mb-2 text-3xl font-bold sm:text-4xl'>
                        {categoryFilter ? `${categoryFilter}` : 'All Products'}
                        {searchQuery && ` - "${searchQuery}"`}
                    </h2>
                    <p className='text-primary/60'>
                        {filteredProducts.length}{' '}
                        {filteredProducts.length === 1 ? 'product' : 'products'} found
                    </p>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {filteredProducts.map((product) => (
                            <ProductCardEcommerce key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className='py-16 text-center'>
                        <div className='mb-4 text-6xl'>🔍</div>
                        <h3 className='mb-2 text-xl font-semibold'>No products found</h3>
                        <p className='text-primary/60 mb-4'>
                            Try adjusting your search or browse all products.
                        </p>
                        <Link
                            to='/'
                            className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white'
                        >
                            Browse All Products
                        </Link>
                    </div>
                )}
            </Section>

            {/* Social Proof Section */}
            <Section className='border-primary/10 bg-secondary/5 border-y py-12 sm:py-16'>
                <div className='mx-auto max-w-4xl text-center'>
                    <h2 className='mb-8 text-3xl font-bold sm:text-4xl'>
                        Trusted by Knowledge Workers Worldwide
                    </h2>
                    <div className='grid gap-6 sm:grid-cols-3'>
                        <div className='bg-primary/5 rounded-xl p-6'>
                            <div className='text-secondary mb-3 text-4xl font-bold'>10,000+</div>
                            <div className='font-semibold'>Happy Customers</div>
                        </div>
                        <div className='bg-primary/5 rounded-xl p-6'>
                            <div className='text-secondary mb-3 text-4xl font-bold'>4.9/5</div>
                            <div className='font-semibold'>Average Rating</div>
                        </div>
                        <div className='bg-primary/5 rounded-xl p-6'>
                            <div className='text-secondary mb-3 text-4xl font-bold'>2,300+</div>
                            <div className='font-semibold'>Newsletter Subscribers</div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    )
}

export default HomeEcommerce
