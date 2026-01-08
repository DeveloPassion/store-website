import { useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { FaArrowLeft, FaSearch, FaStar, FaRocket } from 'react-icons/fa'
import Section from '@/components/ui/section'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import type { Product } from '@/types/product'
import type { Category } from '@/types/category'
import { sortCategoriesByPriority } from '@/lib/category-utils'
import { CategoryCard } from '@/components/categories/category-card'

export interface CategoryData extends Category {
    count: number
}

const CategoriesPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const searchQuery = searchParams.get('q') || ''
    const categories = categoriesData as Category[]

    // Set page title
    useEffect(() => {
        document.title = 'Categories - Knowledge Forge'

        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Browse products by category. Find courses, kits, templates, and tools organized by topic.'
            )
        }
    }, [])

    // Build category data with product counts and separate featured/non-featured
    const { featuredCategories, nonFeaturedCategories } = useMemo(() => {
        const products = productsData as Product[]

        const categoriesWithCounts: CategoryData[] = categories.map((category) => {
            const categoryProducts = products.filter((p) => {
                const allCategories = [p.mainCategory, ...p.secondaryCategories.map((sc) => sc.id)]
                return allCategories.includes(category.id)
            })
            return {
                ...category,
                count: categoryProducts.length
            }
        })

        const featured = sortCategoriesByPriority(categoriesWithCounts.filter((c) => c.featured))
        const nonFeatured = sortCategoriesByPriority(
            categoriesWithCounts.filter((c) => !c.featured)
        )

        return { featuredCategories: featured, nonFeaturedCategories: nonFeatured }
    }, [categories])

    // Filter categories based on search
    const { filteredFeatured, filteredNonFeatured } = useMemo(() => {
        if (!searchQuery) {
            return {
                filteredFeatured: featuredCategories,
                filteredNonFeatured: nonFeaturedCategories
            }
        }

        const query = searchQuery.toLowerCase()
        const filterFn = (category: CategoryData) =>
            category.name.toLowerCase().includes(query) ||
            category.description.toLowerCase().includes(query)

        return {
            filteredFeatured: featuredCategories.filter(filterFn),
            filteredNonFeatured: nonFeaturedCategories.filter(filterFn)
        }
    }, [featuredCategories, nonFeaturedCategories, searchQuery])

    // Handle search input change
    const handleSearchChange = (value: string) => {
        if (value) {
            setSearchParams({ q: value })
        } else {
            setSearchParams({})
        }
    }

    return (
        <>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <div className='mx-auto max-w-7xl'>
                    <Link
                        to='/'
                        className='text-primary/70 hover:text-secondary mb-6 inline-flex items-center gap-2 text-sm transition-colors'
                    >
                        <FaArrowLeft className='h-3 w-3' />
                        Back to Products
                    </Link>
                    <div className='flex items-center gap-4'>
                        <div className='bg-secondary/10 flex h-14 w-14 items-center justify-center rounded-full'>
                            <FaRocket className='text-secondary h-7 w-7' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Categories
                            </h1>
                            <p className='text-primary/70 mt-1'>Browse products by category</p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Stats and Search */}
            <Section className='pb-8'>
                <div className='mx-auto max-w-7xl'>
                    {/* Stats */}
                    <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                        <div className='bg-primary/5 rounded-lg p-4'>
                            <div className='text-3xl font-bold text-green-400'>
                                {featuredCategories.length + nonFeaturedCategories.length}
                            </div>
                            <div className='text-primary/60 text-sm'>Total Categories</div>
                        </div>
                        <div className='bg-primary/5 rounded-lg p-4'>
                            <div className='text-secondary text-3xl font-bold'>
                                {productsData.length}
                            </div>
                            <div className='text-primary/60 text-sm'>Total Products</div>
                        </div>
                        {searchQuery && (
                            <div className='bg-primary/5 rounded-lg p-4'>
                                <div className='text-3xl font-bold text-purple-400'>
                                    {filteredFeatured.length + filteredNonFeatured.length}
                                </div>
                                <div className='text-primary/60 text-sm'>Matching Categories</div>
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className='relative'>
                        <FaSearch className='text-primary/40 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2' />
                        <input
                            type='text'
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder='Search categories...'
                            className='bg-primary/5 border-primary/10 placeholder:text-primary/40 focus:border-secondary/50 w-full rounded-lg border py-3 pr-4 pl-12 text-lg transition-colors outline-none'
                        />
                    </div>
                </div>
            </Section>

            {/* Categories Grid */}
            <Section className='pb-16 sm:pb-24'>
                <div className='mx-auto max-w-7xl'>
                    {filteredFeatured.length > 0 || filteredNonFeatured.length > 0 ? (
                        <>
                            {/* Featured Categories Section */}
                            {filteredFeatured.length > 0 && (
                                <>
                                    <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold'>
                                        <FaStar className='text-secondary h-6 w-6' />
                                        Featured Categories
                                    </h2>
                                    <div className='mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                                        {filteredFeatured.map((category) => (
                                            <CategoryCard
                                                key={category.id}
                                                category={category}
                                                count={category.count}
                                                showFeaturedBadge={true}
                                                variant='detailed'
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Non-Featured Categories Section */}
                            {filteredNonFeatured.length > 0 && (
                                <>
                                    {filteredFeatured.length > 0 && (
                                        <h2 className='mb-6 text-2xl font-bold'>More Categories</h2>
                                    )}
                                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                                        {filteredNonFeatured.map((category) => (
                                            <CategoryCard
                                                key={category.id}
                                                category={category}
                                                count={category.count}
                                                showFeaturedBadge={false}
                                                variant='detailed'
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className='py-16 text-center'>
                            <div className='mb-4 text-6xl'>🔍</div>
                            <h3 className='mb-2 text-xl font-semibold'>No categories found</h3>
                            <p className='text-primary/60 mb-4'>Try adjusting your search query.</p>
                            <button
                                onClick={() => handleSearchChange('')}
                                className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white'
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </Section>
        </>
    )
}

export default CategoriesPage
