import { useMemo } from 'react'
import { Link, useSearchParams, useParams } from 'react-router'
import { FaStar, FaShieldAlt, FaRocket, FaClock, FaGraduationCap } from 'react-icons/fa'
import Section from '@/components/ui/section'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import type { Product } from '@/types/product'
import type { Category } from '@/types/category'
import type { TagId } from '@/types/tag'
import { sortProductsByPriority } from '@/lib/product-sort'
import { getFeaturedCategoriesSorted } from '@/lib/category-utils'
import { CategoryCard } from '@/components/categories/category-card'

const HomeEcommerce: React.FC = () => {
    const [searchParams] = useSearchParams()
    const { tagName } = useParams<{ tagName?: string }>()
    const decodedTagName = tagName ? decodeURIComponent(tagName) : null
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

        // Apply tag filter (from URL route)
        if (decodedTagName) {
            products = products.filter((p) => p.tags.includes(decodedTagName as TagId))
        }

        // Apply category filter
        if (categoryFilter) {
            const normalizedFilter = categoryFilter.toLowerCase()
            products = products.filter((p) => {
                if (normalizedFilter === 'courses') return p.mainCategory === 'courses'
                if (normalizedFilter === 'kits') return p.mainCategory === 'kits-and-templates'
                if (normalizedFilter === 'workshops') return p.mainCategory === 'workshops'
                if (normalizedFilter === 'bundles') return p.mainCategory === 'bundles'
                if (normalizedFilter === 'free resources')
                    return p.priceTier === 'free' || p.price === 0
                return true
            })
        }

        // Sort by priority (highest to lowest), with randomization within same priority
        return sortProductsByPriority(products)
    }, [searchQuery, categoryFilter, decodedTagName])

    // Get featured products, sorted by priority
    const featuredProducts = useMemo(() => {
        const featured = (productsData as Product[]).filter((p) => p.featured)
        const sorted = sortProductsByPriority(featured)
        return sorted.slice(0, 3)
    }, [])

    // Get hero product (first featured product)
    const heroProduct = featuredProducts[0]

    // Get featured categories
    const featuredCategories = useMemo(() => {
        return getFeaturedCategoriesSorted(categoriesData as Category[])
    }, [])

    return (
        <>
            {/* Hero Section */}
            <Section className='from-secondary/10 to-background bg-gradient-to-br via-purple-500/10 pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20'>
                <div className='mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:gap-12'>
                    {/* Hero Content */}
                    <div className='flex flex-col justify-center'>
                        {decodedTagName && (
                            <div className='bg-secondary/10 border-secondary/30 mb-4 inline-flex items-center gap-2 self-start rounded-full border px-4 py-1 text-sm font-semibold'>
                                <FaStar className='text-secondary h-4 w-4' />
                                <span>Tag: {decodedTagName}</span>
                            </div>
                        )}
                        <h1 className='mb-4 text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl'>
                            {decodedTagName ? (
                                <>
                                    <span className='text-secondary'>{decodedTagName}</span>{' '}
                                    Products
                                </>
                            ) : heroProduct ? (
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
                            {decodedTagName
                                ? `Explore all products tagged with "${decodedTagName}"`
                                : heroProduct
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
                    {featuredCategories.map((category) => (
                        <CategoryCard key={category.id} category={category} variant='simple' />
                    ))}
                </div>
            </Section>

            {/* Featured Products Section */}
            {!categoryFilter && !searchQuery && !decodedTagName && featuredProducts.length > 0 && (
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
                        {decodedTagName
                            ? `${decodedTagName}`
                            : categoryFilter
                              ? `${categoryFilter}`
                              : 'All Products'}
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
