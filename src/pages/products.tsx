import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { FaStar, FaFilter, FaTimes } from 'react-icons/fa'
import Section from '@/components/ui/section'
import productsData from '@/data/products.json'
import type { Product, ProductType, ProductPillar, PriceTier } from '@/types/product'
import { sortProductsByPriority } from '@/lib/product-sort'

const ProductsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all')
    const [selectedPillar, setSelectedPillar] = useState<ProductPillar | 'all'>('all')
    const [selectedTier, setSelectedTier] = useState<PriceTier | 'all'>('all')
    const [showFilters, setShowFilters] = useState(false)

    const products = productsData as Product[]

    // Get unique values for filters
    const types = Array.from(new Set(products.map((p) => p.type))).sort()
    const pillars = Array.from(new Set(products.flatMap((p) => p.pillars))).sort()
    const tiers = Array.from(new Set(products.map((p) => p.priceTier))).sort()

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            // Only show active and coming-soon products
            if (product.status === 'archived') return false

            // Search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    product.name.toLowerCase().includes(query) ||
                    product.tagline.toLowerCase().includes(query) ||
                    product.description.toLowerCase().includes(query) ||
                    product.tags.some((tag) => tag.toLowerCase().includes(query))
                if (!matchesSearch) return false
            }

            // Type filter
            if (selectedType !== 'all' && product.type !== selectedType) {
                return false
            }

            // Pillar filter
            if (selectedPillar !== 'all' && !product.pillars.includes(selectedPillar)) {
                return false
            }

            // Price tier filter
            if (selectedTier !== 'all' && product.priceTier !== selectedTier) {
                return false
            }

            return true
        })
    }, [products, searchQuery, selectedType, selectedPillar, selectedTier])

    // Sort by priority (highest to lowest), with randomization within same priority
    const sortedProducts = useMemo(() => {
        return sortProductsByPriority(filteredProducts)
    }, [filteredProducts])

    // Update document title
    useEffect(() => {
        document.title = 'Products - Knowledge Forge'
    }, [])

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedType('all')
        setSelectedPillar('all')
        setSelectedTier('all')
    }

    const hasActiveFilters =
        searchQuery || selectedType !== 'all' || selectedPillar !== 'all' || selectedTier !== 'all'

    return (
        <>
            {/* Hero Section */}
            <Section className='pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20'>
                <div className='mx-auto max-w-4xl text-center'>
                    <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'>
                        Products & Resources
                    </h1>
                    <p className='text-primary/70 mx-auto mb-8 max-w-2xl text-lg sm:text-xl md:text-2xl'>
                        Tools, courses, and resources to help you work smarter, not harder.
                    </p>

                    {/* Stats */}
                    <div className='mb-10 flex flex-wrap justify-center gap-6 sm:gap-10'>
                        <div className='text-center'>
                            <div className='text-secondary text-3xl font-bold sm:text-4xl'>
                                {products.filter((p) => p.status === 'active').length}
                            </div>
                            <div className='text-primary/60 text-sm'>Active Products</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-green-400 sm:text-4xl'>
                                {products.filter((p) => p.priceTier === 'free').length}
                            </div>
                            <div className='text-primary/60 text-sm'>Free Resources</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-blue-400 sm:text-4xl'>
                                {products.filter((p) => p.featured).length}
                            </div>
                            <div className='text-primary/60 text-sm'>Featured</div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Products Section */}
            <Section className='py-8 sm:py-12'>
                <div className='mx-auto max-w-7xl'>
                    {/* Search and Filter Toggle */}
                    <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <input
                            type='text'
                            placeholder='Search products...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='border-primary/20 bg-background/50 focus:border-secondary focus:ring-secondary flex-1 rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none sm:max-w-md'
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg px-4 py-3 transition-colors'
                        >
                            <FaFilter className='h-4 w-4' />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className='border-primary/10 bg-background/50 mb-6 overflow-hidden rounded-lg border p-6'
                        >
                            <div className='mb-4 flex items-center justify-between'>
                                <h3 className='font-semibold'>Filters</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className='text-secondary hover:text-secondary/80 flex items-center gap-2 text-sm transition-colors'
                                    >
                                        <FaTimes className='h-3 w-3' />
                                        Clear All
                                    </button>
                                )}
                            </div>
                            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                                {/* Type Filter */}
                                <div>
                                    <label className='text-primary/70 mb-2 block text-sm font-medium'>
                                        Type
                                    </label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) =>
                                            setSelectedType(e.target.value as ProductType | 'all')
                                        }
                                        className='border-primary/20 bg-background focus:border-secondary focus:ring-secondary w-full rounded-lg border px-3 py-2 transition-colors focus:ring-2 focus:outline-none'
                                    >
                                        <option value='all'>All Types</option>
                                        {types.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Pillar Filter */}
                                <div>
                                    <label className='text-primary/70 mb-2 block text-sm font-medium'>
                                        Category
                                    </label>
                                    <select
                                        value={selectedPillar}
                                        onChange={(e) =>
                                            setSelectedPillar(
                                                e.target.value as ProductPillar | 'all'
                                            )
                                        }
                                        className='border-primary/20 bg-background focus:border-secondary focus:ring-secondary w-full rounded-lg border px-3 py-2 transition-colors focus:ring-2 focus:outline-none'
                                    >
                                        <option value='all'>All Categories</option>
                                        {pillars.map((pillar) => (
                                            <option key={pillar} value={pillar}>
                                                {pillar
                                                    .split('-')
                                                    .map(
                                                        (word) =>
                                                            word.charAt(0).toUpperCase() +
                                                            word.slice(1)
                                                    )
                                                    .join(' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Tier Filter */}
                                <div>
                                    <label className='text-primary/70 mb-2 block text-sm font-medium'>
                                        Price
                                    </label>
                                    <select
                                        value={selectedTier}
                                        onChange={(e) =>
                                            setSelectedTier(e.target.value as PriceTier | 'all')
                                        }
                                        className='border-primary/20 bg-background focus:border-secondary focus:ring-secondary w-full rounded-lg border px-3 py-2 transition-colors focus:ring-2 focus:outline-none'
                                    >
                                        <option value='all'>All Prices</option>
                                        {tiers.map((tier) => (
                                            <option key={tier} value={tier}>
                                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Results count */}
                    <div className='text-primary/60 mb-6 text-sm'>
                        Showing {sortedProducts.length} of {products.length} products
                        {searchQuery && ` matching "${searchQuery}"`}
                    </div>

                    {/* Products Grid */}
                    {sortedProducts.length > 0 ? (
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                            {sortedProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/l/${product.id}`}
                                    className='border-primary/10 bg-background/50 hover:border-secondary/50 group relative flex h-full flex-col rounded-xl border p-6 transition-all hover:shadow-lg'
                                >
                                    {/* Featured Badge */}
                                    {product.featured && (
                                        <div className='from-secondary to-secondary/80 absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium text-white shadow-md'>
                                            <FaStar className='h-2.5 w-2.5' />
                                            Featured
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    {product.status === 'coming-soon' && (
                                        <div className='bg-primary/20 text-primary/80 absolute top-4 right-4 rounded-full px-2 py-1 text-xs'>
                                            Coming Soon
                                        </div>
                                    )}

                                    {/* Title */}
                                    <h3 className='group-hover:text-secondary mb-2 text-xl font-bold transition-colors'>
                                        {product.name}
                                    </h3>

                                    {/* Tagline */}
                                    <p className='text-primary/70 mb-4 line-clamp-2 flex-1 text-sm'>
                                        {product.tagline}
                                    </p>

                                    {/* Price */}
                                    <div className='border-primary/10 mb-4 border-t pt-4'>
                                        <div className='text-primary/60 mb-1 text-xs'>Price</div>
                                        <div className='text-secondary text-xl font-bold'>
                                            {product.priceDisplay}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className='flex flex-wrap gap-1'>
                                        {product.pillars.slice(0, 2).map((pillar) => (
                                            <span
                                                key={pillar}
                                                className='bg-primary/10 text-primary/70 rounded-full px-2 py-0.5 text-xs'
                                            >
                                                {pillar.split('-').join(' ')}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className='py-16 text-center'>
                            <div className='mb-4 text-5xl'>🔍</div>
                            <h3 className='mb-2 text-xl font-semibold'>No products found</h3>
                            <p className='text-primary/60 mb-4'>
                                Try adjusting your search or filters.
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className='bg-secondary hover:bg-secondary/90 rounded-lg px-6 py-3 font-semibold text-white transition-colors'
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </Section>
        </>
    )
}

export default ProductsPage
