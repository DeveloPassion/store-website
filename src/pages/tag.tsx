import { useMemo, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { FaStar } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import tagsData from '@/data/tags.json'
import type { Product } from '@/types/product'
import type { Category } from '@/types/category'
import type { Tag, TagId } from '@/types/tag'
import { sortFeaturedProducts, sortProductsIntelligently } from '@/lib/product-sort'
import { getTagIcon } from '@/lib/tag-icons'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'

// Icon mapping for categories
import {
    FaRobot,
    FaTools,
    FaBoxOpen,
    FaChalkboardTeacher,
    FaUsers,
    FaPen,
    FaGraduationCap,
    FaGift,
    FaBrain,
    FaLightbulb,
    FaBook,
    FaRocket,
    FaCode,
    FaCheckSquare
} from 'react-icons/fa'
import { SiObsidian } from 'react-icons/si'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FaRobot,
    FaTools,
    FaBoxOpen,
    FaChalkboardTeacher,
    FaUsers,
    FaPen,
    FaGraduationCap,
    FaGift,
    FaBrain,
    FaLightbulb,
    FaBook,
    FaRocket,
    FaCode,
    FaCheckSquare,
    SiObsidian
}

const TagPage: React.FC = () => {
    const { tagId } = useParams<{ tagId: string }>()
    const navigate = useNavigate()
    const categories = categoriesData as Category[]

    // Get tag metadata and matching products
    const tagData = useMemo(() => {
        if (!tagId) return null

        const products = productsData as Product[]
        const tagsMetadata = tagsData as Record<TagId, Tag>

        // Look up tag metadata - tagId from URL is already a TagId
        const tagMetadata = tagsMetadata[tagId as TagId]
        if (!tagMetadata) return null

        // Find all products with this tag (products now use TagId[] directly)
        const tagProducts = products.filter((product) => product.tags.includes(tagId as TagId))

        return {
            ...tagMetadata,
            count: tagProducts.length,
            products: tagProducts
        }
    }, [tagId])

    // Set breadcrumbs
    useSetBreadcrumbs(
        tagData
            ? [
                  { label: 'Home', href: '/' },
                  { label: 'Tags', href: '/tags' },
                  { label: tagData.name }
              ]
            : []
    )

    // Separate featured and non-featured products, sorted intelligently
    const { featuredProducts, productsByCategory } = useMemo(() => {
        if (!tagData) {
            return { featuredProducts: [], productsByCategory: new Map() }
        }

        // Get featured products sorted intelligently
        const featured = sortFeaturedProducts(tagData.products.filter((p) => p.featured))

        // Group ALL products (including featured) by category
        const categoryMap = new Map<string, Product[]>()
        tagData.products.forEach((product) => {
            const allCategories = [
                product.mainCategory,
                ...product.secondaryCategories.map((sc) => sc.id)
            ]
            allCategories.forEach((categoryId) => {
                if (!categoryMap.has(categoryId)) {
                    categoryMap.set(categoryId, [])
                }
                categoryMap.get(categoryId)!.push(product)
            })
        })

        // Sort products within each category intelligently
        categoryMap.forEach((products, categoryId) => {
            categoryMap.set(categoryId, sortProductsIntelligently(products))
        })

        return {
            featuredProducts: featured,
            productsByCategory: categoryMap
        }
    }, [tagData])

    // Set page title
    useEffect(() => {
        if (tagData) {
            document.title = `${tagData.name} Products - Knowledge Forge`

            // Update meta description
            const metaDescription = document.querySelector('meta[name="description"]')
            if (metaDescription) {
                metaDescription.setAttribute(
                    'content',
                    `Explore all ${tagData.count} products tagged with ${tagData.name}. Find courses, templates, kits, and tools for ${tagData.name}.`
                )
            }

            // Update OG tags
            const ogTitle = document.querySelector('meta[property="og:title"]')
            if (ogTitle) {
                ogTitle.setAttribute('content', `${tagData.name} Products - Knowledge Forge`)
            }

            const ogDescription = document.querySelector('meta[property="og:description"]')
            if (ogDescription) {
                ogDescription.setAttribute(
                    'content',
                    `Browse ${tagData.count} products related to ${tagData.name}`
                )
            }

            const ogUrl = document.querySelector('meta[property="og:url"]')
            if (ogUrl) {
                ogUrl.setAttribute('content', `https://store.dsebastien.net/tags/${tagId}`)
            }

            // Reset og:image to default for generic pages
            const ogImage = document.querySelector('meta[property="og:image"]')
            if (ogImage) {
                ogImage.setAttribute(
                    'content',
                    'https://store.dsebastien.net/assets/images/social-card.png'
                )
            }
        }
    }, [tagData, tagId])

    // Handle 404
    if (!tagId || !tagData) {
        useEffect(() => {
            const timer = setTimeout(() => navigate('/tags'), 2000)
            return () => clearTimeout(timer)
        }, [navigate])

        return (
            <Section className='pt-16 pb-24 sm:pt-24'>
                <div className='w-full text-center'>
                    <div className='mb-4 text-6xl'>🔍</div>
                    <h1 className='mb-4 text-3xl font-bold'>Tag Not Found</h1>
                    <p className='text-primary/60 mb-6'>
                        The tag you're looking for doesn't exist.
                    </p>
                    <Link
                        to='/tags'
                        className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white'
                    >
                        Browse All Tags
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
                    <Breadcrumb />
                    <div className='flex items-center gap-4'>
                        {(() => {
                            const IconComponent = getTagIcon(tagData.icon)
                            return (
                                <div
                                    className='flex h-14 w-14 items-center justify-center rounded-full'
                                    style={{
                                        backgroundColor: tagData.color
                                            ? `${tagData.color}20`
                                            : undefined
                                    }}
                                >
                                    <div style={{ color: tagData.color }}>
                                        <IconComponent className='h-7 w-7' />
                                    </div>
                                </div>
                            )
                        })()}
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                {tagData.name}
                            </h1>
                            <p className='text-primary/70 mt-1'>{tagData.description}</p>
                            <p className='text-primary/50 mt-1 text-sm'>
                                {tagData.count} {tagData.count === 1 ? 'product' : 'products'}
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

            {/* Products by Category Sections */}
            {Array.from(productsByCategory.entries()).map(([categoryId, products]) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null

                const IconComponent = category.icon ? iconMap[category.icon] : undefined

                return (
                    <Section key={categoryId} className='py-12 sm:py-16'>
                        <div className='w-full'>
                            <div className='mb-8 flex items-center gap-3'>
                                {IconComponent && (
                                    <div
                                        className='flex h-12 w-12 items-center justify-center rounded-lg'
                                        style={{ backgroundColor: `${category.color}20` }}
                                    >
                                        <div style={{ color: category.color }}>
                                            <IconComponent className='h-6 w-6' />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h2 className='text-2xl font-bold sm:text-3xl'>
                                        {category.name}
                                    </h2>
                                    <p className='text-primary/60 text-sm'>
                                        {products.length}{' '}
                                        {products.length === 1 ? 'product' : 'products'}
                                    </p>
                                </div>
                            </div>
                            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                                {products.map((product: Product) => (
                                    <ProductCardEcommerce key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    </Section>
                )
            })}

            {/* Empty State */}
            {tagData.products.length === 0 && (
                <Section className='py-16 sm:py-24'>
                    <div className='w-full text-center'>
                        <div className='mb-4 text-6xl'>📦</div>
                        <h3 className='mb-2 text-xl font-semibold'>No Products Yet</h3>
                        <p className='text-primary/60 mb-4'>
                            There are no products tagged with "{tagData.name}" at the moment.
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

export default TagPage
