import { useMemo, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { FaArrowLeft, FaStar } from 'react-icons/fa'
import Section from '@/components/ui/section'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import type { Product } from '@/types/product'
import type { Category } from '@/types/category'
import { sortProductsByPriority } from '@/lib/product-sort'
import { getCategoryIcon } from '@/lib/category-icons'

const CategoryPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>()
    const navigate = useNavigate()
    const categories = categoriesData as Category[]

    // Find the category
    const category = useMemo(() => {
        return categories.find((c) => c.id === categoryId)
    }, [categoryId, categories])

    // Get products for this category (matches mainCategory or any secondaryCategory)
    const categoryProducts = useMemo(() => {
        if (!category) return []
        const products = productsData as Product[]
        return products.filter((p) => {
            const allCategories = [p.mainCategory, ...p.secondaryCategories.map((sc) => sc.id)]
            return allCategories.includes(category.id)
        })
    }, [category])

    // Separate featured and non-featured products
    const { featuredProducts, nonFeaturedProducts } = useMemo(() => {
        const featured = sortProductsByPriority(categoryProducts.filter((p) => p.featured))
        const nonFeatured = sortProductsByPriority(categoryProducts.filter((p) => !p.featured))

        return {
            featuredProducts: featured,
            nonFeaturedProducts: nonFeatured
        }
    }, [categoryProducts])

    // Set page title
    useEffect(() => {
        if (category) {
            document.title = `${category.name} - Knowledge Forge`

            // Update meta description
            const metaDescription = document.querySelector('meta[name="description"]')
            if (metaDescription) {
                metaDescription.setAttribute(
                    'content',
                    `${category.description} - Explore all products in the ${category.name} category.`
                )
            }

            // Update OG tags
            const ogTitle = document.querySelector('meta[property="og:title"]')
            if (ogTitle) {
                ogTitle.setAttribute('content', `${category.name} - Knowledge Forge`)
            }

            const ogDescription = document.querySelector('meta[property="og:description"]')
            if (ogDescription) {
                ogDescription.setAttribute('content', category.description)
            }

            const ogUrl = document.querySelector('meta[property="og:url"]')
            if (ogUrl) {
                ogUrl.setAttribute(
                    'content',
                    `https://store.dsebastien.net/categories/${categoryId}`
                )
            }
        }
    }, [category, categoryId])

    // Handle 404
    if (!categoryId || !category) {
        useEffect(() => {
            const timer = setTimeout(() => navigate('/categories'), 2000)
            return () => clearTimeout(timer)
        }, [navigate])

        return (
            <Section className='pt-16 pb-24 sm:pt-24'>
                <div className='mx-auto max-w-7xl text-center'>
                    <div className='mb-4 text-6xl'>🔍</div>
                    <h1 className='mb-4 text-3xl font-bold'>Category Not Found</h1>
                    <p className='text-primary/60 mb-6'>
                        The category you're looking for doesn't exist.
                    </p>
                    <Link
                        to='/categories'
                        className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white'
                    >
                        Browse All Categories
                    </Link>
                </div>
            </Section>
        )
    }

    const IconComponent = getCategoryIcon(category.icon)
    const totalProducts = categoryProducts.length

    return (
        <>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <div className='mx-auto max-w-7xl'>
                    <Link
                        to='/categories'
                        className='text-primary/70 hover:text-secondary mb-6 inline-flex items-center gap-2 text-sm transition-colors'
                    >
                        <FaArrowLeft className='h-3 w-3' />
                        Back to Categories
                    </Link>
                    <div className='flex items-start gap-4'>
                        {IconComponent && (
                            <div
                                className='flex h-14 w-14 items-center justify-center rounded-full'
                                style={{ backgroundColor: `${category.color}20` }}
                            >
                                <div style={{ color: category.color }}>
                                    <IconComponent className='h-7 w-7' />
                                </div>
                            </div>
                        )}
                        <div className='flex-1'>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                {category.name}
                            </h1>
                            <p className='text-primary/70 mt-2 text-lg'>{category.description}</p>
                            <p className='text-primary/60 mt-2'>
                                {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
                <Section className='bg-secondary/5 py-12 sm:py-16'>
                    <div className='mx-auto max-w-7xl'>
                        <div className='mb-8 flex items-center gap-3'>
                            <FaStar className='text-secondary h-6 w-6' />
                            <h2 className='text-3xl font-bold'>Featured Products</h2>
                        </div>
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                            {featuredProducts.map((product) => (
                                <ProductCardEcommerce key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </Section>
            )}

            {/* All Products Section */}
            {nonFeaturedProducts.length > 0 && (
                <Section className='py-12 sm:py-16'>
                    <div className='mx-auto max-w-7xl'>
                        <div className='mb-8'>
                            <h2 className='text-3xl font-bold'>
                                {featuredProducts.length > 0 ? 'More Products' : 'All Products'}
                            </h2>
                        </div>
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                            {nonFeaturedProducts.map((product) => (
                                <ProductCardEcommerce key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </Section>
            )}

            {/* Empty State */}
            {totalProducts === 0 && (
                <Section className='py-16 sm:py-24'>
                    <div className='mx-auto max-w-7xl text-center'>
                        <div className='mb-4 text-6xl'>📦</div>
                        <h3 className='mb-2 text-xl font-semibold'>No Products Yet</h3>
                        <p className='text-primary/60 mb-4'>
                            There are no products in the "{category.name}" category at the moment.
                        </p>
                        <Link
                            to='/'
                            className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white'
                        >
                            Browse All Products
                        </Link>
                    </div>
                </Section>
            )}
        </>
    )
}

export default CategoryPage
