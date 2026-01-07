import { useMemo, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { FaArrowLeft, FaSearch, FaArrowRight } from 'react-icons/fa'
import Section from '@/components/ui/section'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import type { Product } from '@/types/product'
import type { Category } from '@/types/category'

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
    FaCheckSquare,
    FaStar
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
    FaStar,
    SiObsidian
}

export interface CategoryData extends Category {
    count: number
    percentage: number
}

const CategoriesPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const searchQuery = searchParams.get('q') || ''
    const navigate = useNavigate()
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

    // Build category data with product counts
    const allCategories = useMemo(() => {
        const products = productsData as Product[]
        const totalProducts = products.length

        const categoriesWithCounts: CategoryData[] = categories.map((category) => {
            const categoryProducts = products.filter((p) => p.categories.includes(category.id))
            return {
                ...category,
                count: categoryProducts.length,
                percentage: (categoryProducts.length / totalProducts) * 100
            }
        })

        // Sort by count (highest first)
        return categoriesWithCounts.sort((a, b) => b.count - a.count)
    }, [categories])

    // Filter categories based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery) return allCategories
        const query = searchQuery.toLowerCase()
        return allCategories.filter(
            (category) =>
                category.name.toLowerCase().includes(query) ||
                category.description.toLowerCase().includes(query)
        )
    }, [allCategories, searchQuery])

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
                                {allCategories.length}
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
                                    {filteredCategories.length}
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
                    {filteredCategories.length > 0 ? (
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                            {filteredCategories.map((category) => {
                                const IconComponent = category.icon
                                    ? iconMap[category.icon]
                                    : undefined
                                const displayPercentage = Math.min(category.percentage, 100)

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            navigate(`/categories/${category.id}`)
                                        }}
                                        className='group border-primary/10 hover:border-secondary/30 flex flex-col gap-4 rounded-xl border p-6 text-left transition-all hover:scale-102 hover:shadow-lg'
                                        style={{
                                            background: `linear-gradient(135deg, ${category.color}15, ${category.color}05)`
                                        }}
                                    >
                                        <div className='flex items-start justify-between'>
                                            {IconComponent && (
                                                <div
                                                    className='flex h-12 w-12 items-center justify-center rounded-lg'
                                                    style={{
                                                        backgroundColor: `${category.color}20`
                                                    }}
                                                >
                                                    <div style={{ color: category.color }}>
                                                        <IconComponent className='h-6 w-6' />
                                                    </div>
                                                </div>
                                            )}
                                            <FaArrowRight className='text-primary/40 group-hover:text-secondary h-4 w-4 transition-colors' />
                                        </div>
                                        <div>
                                            <h3 className='mb-2 text-lg font-semibold'>
                                                {category.name}
                                            </h3>
                                            <p className='text-primary/70 mb-3 text-sm'>
                                                {category.description}
                                            </p>
                                            <p className='text-primary/60 text-sm'>
                                                {category.count}{' '}
                                                {category.count === 1 ? 'product' : 'products'} •{' '}
                                                {category.percentage.toFixed(1)}%
                                            </p>
                                        </div>
                                        <div className='bg-primary/10 h-2 overflow-hidden rounded-full'>
                                            <div
                                                className='h-full transition-all duration-500'
                                                style={{
                                                    width: `${displayPercentage}%`,
                                                    backgroundColor: category.color
                                                }}
                                            />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
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
