import { useMemo, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { FaStar } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import QuickNavigation from '@/components/navigation/quick-navigation'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import type { Product } from '@/schemas/product.schema'
import type { Category } from '@/schemas/category.schema'
import { sortFeaturedProducts, sortProductsIntelligently } from '@/lib/product-sort'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'
import { updateAllMetaTags } from '@/lib/update-meta-tags'

const CategoryPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>()
    const navigate = useNavigate()
    const categories = categoriesData as Category[]

    // Find the category
    const category = useMemo(() => {
        return categories.find((c) => c.id === categoryId)
    }, [categoryId, categories])

    // Set breadcrumbs
    useSetBreadcrumbs(
        category
            ? [
                  { label: 'Home', href: '/' },
                  { label: 'Categories', href: '/categories' },
                  { label: category.name }
              ]
            : []
    )

    // Get products for this category (matches mainCategory or any secondaryCategory)
    const categoryProducts = useMemo(() => {
        if (!category) return []
        const products = productsData as Product[]
        return products.filter((p) => {
            const allCategories = [p.mainCategory, ...p.secondaryCategories.map((sc) => sc.id)]
            return allCategories.includes(category.id)
        })
    }, [category])

    // Separate featured and non-featured products, sorted intelligently
    const { featuredProducts, nonFeaturedProducts } = useMemo(() => {
        const featured = sortFeaturedProducts(categoryProducts.filter((p) => p.featured))
        const nonFeatured = sortProductsIntelligently(categoryProducts.filter((p) => !p.featured))

        return {
            featuredProducts: featured,
            nonFeaturedProducts: nonFeatured
        }
    }, [categoryProducts])

    // Set page title and meta tags
    useEffect(() => {
        if (category) {
            updateAllMetaTags({
                title: `${category.name} - Knowledge Forge`,
                description: `${category.description} - Explore all products in the ${category.name} category.`,
                url: `https://store.dsebastien.net/categories/${categoryId}`
            })
        }
    }, [category, categoryId])

    // Handle 404 - Navigate to categories page after delay
    useEffect(() => {
        if (!categoryId || !category) {
            const timer = setTimeout(() => navigate('/categories'), 2000)
            return () => clearTimeout(timer)
        }
        return undefined
    }, [categoryId, category, navigate])

    const totalProducts = categoryProducts.length

    // Handle 404
    if (!categoryId || !category) {
        return (
            <Section className='pt-16 pb-24 sm:pt-24'>
                <div className='w-full text-center'>
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

    return (
        <>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <div className='w-full'>
                    <Breadcrumb className='mb-6 flex justify-center' />
                    <div className='flex items-start gap-4'>
                        {category.icon && (
                            <div
                                className='flex h-14 w-14 items-center justify-center rounded-full'
                                style={{ backgroundColor: `${category.color}20` }}
                            >
                                <DynamicIcon
                                    iconName={category.icon}
                                    className='h-7 w-7'
                                    style={{ color: category.color }}
                                />
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
                    <div className='w-full'>
                        <div className='mb-8 flex items-center gap-3'>
                            <FaStar className='text-secondary h-6 w-6' />
                            <h2 className='text-3xl font-bold'>Featured Products</h2>
                        </div>
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
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
                    <div className='w-full'>
                        <div className='mb-8'>
                            <h2 className='text-3xl font-bold'>
                                {featuredProducts.length > 0 ? 'More Products' : 'All Products'}
                            </h2>
                        </div>
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                            {nonFeaturedProducts.map((product) => (
                                <ProductCardEcommerce key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </Section>
            )}

            {/* Empty State */}
            {totalProducts === 0 && (
                <Section className='py-8 sm:py-12'>
                    <div className='w-full text-center'>
                        <div className='mb-6 text-6xl'>📦</div>
                        <QuickNavigation
                            title='No Products Yet'
                            description={`There are no products in the "${category.name}" category at the moment. Explore our other collections below.`}
                        />
                    </div>
                </Section>
            )}

            {/* Quick Navigation CTA - Only show when there are products */}
            {totalProducts > 0 && (
                <Section className='border-primary/10 bg-primary/5 border-t border-b py-0'>
                    <QuickNavigation
                        title='Explore More Collections'
                        description='Discover other product categories and featured items'
                    />
                </Section>
            )}
        </>
    )
}

export default CategoryPage
