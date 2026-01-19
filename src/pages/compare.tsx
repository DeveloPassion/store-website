import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaCheck,
    FaTimes,
    FaPlus,
    FaExchangeAlt,
    FaStar,
    FaShoppingCart,
    FaTrash,
    FaShare
} from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import type { Product } from '@/schemas/product.schema'
import type { Category } from '@/schemas/category.schema'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'
import { updateAllMetaTags } from '@/lib/update-meta-tags'
import { buildGumroadUrl } from '@/lib/gumroad-url'
import type { MediaItem } from '@/schemas/media.schema'
import { MarkdownContent } from '@/components/ui/markdown-content'

// Get first cover image from media array
const getCoverImage = (media: MediaItem[] | undefined): MediaItem | undefined => {
    if (!media) return undefined
    return media
        .filter((item) => item.type === 'image')
        .sort((a, b) => {
            const priority: Record<string, number> = { cover: 0, main: 1, secondary: 2, bonus: 3 }
            return (
                (priority[a.group ?? ''] ?? 999) - (priority[b.group ?? ''] ?? 999) ||
                (a.order ?? 0) - (b.order ?? 0)
            )
        })[0]
}

const MAX_COMPARE = 4

const ComparePage: React.FC = () => {
    const products = productsData as Product[]
    const categories = categoriesData as Category[]
    const [searchParams, setSearchParams] = useSearchParams()
    const [showSelector, setShowSelector] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [copySuccess, setCopySuccess] = useState(false)

    // Initialize selected IDs from URL params
    const selectedIds = useMemo(() => {
        const productsParam = searchParams.get('products')
        if (!productsParam) return []

        const ids = productsParam.split(',').map((id) => id.trim())
        // Filter to only valid product IDs and limit to MAX_COMPARE
        const validIds = ids.filter((id) => products.some((p) => p.id === id))
        return validIds.slice(0, MAX_COMPARE)
    }, [searchParams, products])

    // Update URL when selected products change
    const updateSelectedIds = useCallback(
        (newIds: string[]) => {
            if (newIds.length > 0) {
                setSearchParams({ products: newIds.join(',') }, { replace: true })
            } else {
                setSearchParams({}, { replace: true })
            }
        },
        [setSearchParams]
    )

    useSetBreadcrumbs([
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Compare' }
    ])

    // Update meta tags based on selected products
    useEffect(() => {
        const productNames = selectedIds
            .map((id) => products.find((p) => p.id === id)?.name)
            .filter(Boolean)

        const title =
            productNames.length > 0
                ? `Compare: ${productNames.join(' vs ')} - Knowledge Forge`
                : 'Compare Products - Knowledge Forge'

        const description =
            productNames.length > 0
                ? `Compare ${productNames.join(', ')} side-by-side to find the perfect fit for your needs.`
                : 'Compare products side-by-side to find the perfect fit for your needs.'

        const url =
            selectedIds.length > 0
                ? `https://store.dsebastien.net/compare?products=${selectedIds.join(',')}`
                : 'https://store.dsebastien.net/compare'

        updateAllMetaTags({ title, description, url })
    }, [selectedIds, products])

    const selectedProducts = useMemo(() => {
        return selectedIds
            .map((id) => products.find((p) => p.id === id))
            .filter(Boolean) as Product[]
    }, [selectedIds, products])

    const availableProducts = useMemo(() => {
        return products
            .filter((p) => !selectedIds.includes(p.id))
            .filter((p) => {
                if (!searchQuery) return true
                const query = searchQuery.toLowerCase()
                return (
                    p.name.toLowerCase().includes(query) ||
                    p.salesCopy?.tagline?.toLowerCase().includes(query) ||
                    p.mainCategory.toLowerCase().includes(query)
                )
            })
    }, [products, selectedIds, searchQuery])

    const addProduct = (productId: string) => {
        if (selectedIds.length < MAX_COMPARE && !selectedIds.includes(productId)) {
            updateSelectedIds([...selectedIds, productId])
            setShowSelector(false)
            setSearchQuery('')
        }
    }

    const removeProduct = (productId: string) => {
        updateSelectedIds(selectedIds.filter((id) => id !== productId))
    }

    const clearAll = () => {
        updateSelectedIds([])
    }

    // Generate shareable URL
    const generateShareableUrl = useCallback(() => {
        const baseUrl = window.location.origin
        return `${baseUrl}/compare?products=${encodeURIComponent(selectedIds.join(','))}`
    }, [selectedIds])

    // Copy shareable URL to clipboard
    const handleShareComparison = async () => {
        try {
            const shareUrl = generateShareableUrl()
            await navigator.clipboard.writeText(shareUrl)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 3000)
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            // Fallback: show the URL in an alert
            alert(`Share this link: ${generateShareableUrl()}`)
        }
    }

    const getCategoryName = (categoryId: string): string => {
        const category = categories.find((c) => c.id === categoryId)
        return (
            category?.name ||
            categoryId
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
        )
    }

    const formatPrice = (product: Product): string => {
        if (product.priceTier === 'free') return 'Free'
        return product.priceDisplay
    }

    const getFeatures = (product: Product): string[] => {
        return product.salesCopy?.features?.slice(0, 6) || []
    }

    const getBenefits = (product: Product): string[] => {
        const benefits: string[] = []
        if (product.salesCopy?.benefits?.immediate) {
            benefits.push(...product.salesCopy.benefits.immediate.slice(0, 2))
        }
        if (product.salesCopy?.benefits?.systematic) {
            benefits.push(...product.salesCopy.benefits.systematic.slice(0, 2))
        }
        return benefits.slice(0, 4)
    }

    return (
        <>
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <div className='mx-auto max-w-[1400px] text-center'>
                    <Breadcrumb className='mb-6 flex justify-center' />
                    <h1 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'>
                        <FaExchangeAlt className='text-secondary mr-3 inline-block' />
                        Compare Products
                    </h1>
                    <p className='text-primary/70 mx-auto max-w-2xl text-lg'>
                        Select up to {MAX_COMPARE} products to compare side-by-side and find your
                        perfect match.
                    </p>
                </div>
            </Section>

            <Section className='pb-16'>
                <div className='mx-auto max-w-7xl'>
                    {/* Action Bar */}
                    <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
                        <div className='text-primary/60 text-sm'>
                            {selectedIds.length} of {MAX_COMPARE} products selected
                        </div>
                        <div className='flex gap-3'>
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className='text-primary/60 hover:text-primary flex items-center gap-2 text-sm transition-colors'
                                >
                                    <FaTrash className='h-3 w-3' />
                                    Clear All
                                </button>
                            )}
                            {selectedIds.length < MAX_COMPARE && (
                                <button
                                    onClick={() => setShowSelector(!showSelector)}
                                    className='bg-secondary hover:bg-secondary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors'
                                >
                                    <FaPlus className='h-3 w-3' />
                                    Add Product
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Product Selector Modal */}
                    <AnimatePresence>
                        {showSelector && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className='border-primary/10 bg-background/95 mb-8 overflow-hidden rounded-xl border p-4 backdrop-blur-sm sm:p-6'
                            >
                                <div className='mb-4 flex items-center justify-between gap-2'>
                                    <h3 className='min-w-0 truncate font-semibold'>
                                        Select a product to compare
                                    </h3>
                                    <button
                                        onClick={() => setShowSelector(false)}
                                        className='text-primary/60 hover:text-primary flex-shrink-0'
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                                <input
                                    type='text'
                                    placeholder='Search products...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='border-primary/20 bg-background mb-4 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none sm:px-4 sm:text-base'
                                    autoFocus
                                />
                                <div className='grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3'>
                                    {availableProducts.slice(0, 12).map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => addProduct(product.id)}
                                            className='border-primary/10 hover:border-secondary/50 hover:bg-secondary/5 flex items-center gap-2 rounded-lg border p-2 text-left transition-colors sm:gap-3 sm:p-3'
                                        >
                                            <div className='bg-primary/10 h-10 w-10 flex-shrink-0 overflow-hidden rounded'>
                                                {getCoverImage(product.media) ? (
                                                    <img
                                                        src={getCoverImage(product.media)?.url}
                                                        alt={product.name}
                                                        className='h-full w-full object-cover'
                                                    />
                                                ) : (
                                                    <div className='flex h-full w-full items-center justify-center text-lg'>
                                                        📦
                                                    </div>
                                                )}
                                            </div>
                                            <div className='min-w-0 flex-1'>
                                                <div className='truncate text-sm font-medium'>
                                                    {product.name}
                                                </div>
                                                <div className='text-primary/60 text-xs'>
                                                    {formatPrice(product)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Empty State */}
                    {selectedProducts.length === 0 ? (
                        <div className='border-primary/10 rounded-xl border border-dashed py-20 text-center'>
                            <FaExchangeAlt className='text-primary/30 mx-auto mb-4 h-16 w-16' />
                            <h3 className='mb-2 text-xl font-semibold'>No products selected</h3>
                            <p className='text-primary/60 mb-6'>
                                Add products to compare their features, pricing, and benefits
                                side-by-side.
                            </p>
                            <button
                                onClick={() => setShowSelector(true)}
                                className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-colors'
                            >
                                <FaPlus className='h-4 w-4' />
                                Add Your First Product
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card Layout */}
                            <div className='space-y-4 md:hidden'>
                                {/* Product Headers Card */}
                                <div className='border-primary/10 rounded-xl border p-4'>
                                    <h3 className='text-primary/60 mb-3 text-xs font-semibold tracking-wide uppercase'>
                                        Comparing
                                    </h3>
                                    <div className='space-y-3'>
                                        {selectedProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className='flex items-center gap-3'
                                            >
                                                <Link
                                                    to={`/product/${product.id}`}
                                                    className='bg-primary/10 h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg'
                                                >
                                                    {getCoverImage(product.media) ? (
                                                        <img
                                                            src={getCoverImage(product.media)?.url}
                                                            alt={product.name}
                                                            className='h-full w-full object-cover'
                                                        />
                                                    ) : (
                                                        <div className='flex h-full w-full items-center justify-center text-xl'>
                                                            📦
                                                        </div>
                                                    )}
                                                </Link>
                                                <div className='min-w-0 flex-1'>
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className='hover:text-secondary block truncate text-sm font-semibold transition-colors'
                                                    >
                                                        {product.name}
                                                    </Link>
                                                    <div className='text-secondary text-sm font-bold'>
                                                        {formatPrice(product)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeProduct(product.id)}
                                                    className='text-primary/40 hover:text-secondary flex-shrink-0 p-1 transition-colors'
                                                    title='Remove'
                                                >
                                                    <FaTimes className='h-4 w-4' />
                                                </button>
                                            </div>
                                        ))}
                                        {selectedProducts.length < MAX_COMPARE && (
                                            <button
                                                onClick={() => setShowSelector(true)}
                                                className='border-primary/20 hover:border-secondary/50 hover:bg-secondary/5 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 transition-colors'
                                            >
                                                <FaPlus className='text-primary/40 h-4 w-4' />
                                                <span className='text-primary/60 text-sm'>
                                                    Add Product
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Category Card */}
                                <div className='border-primary/10 rounded-xl border p-4'>
                                    <h3 className='text-primary/60 mb-3 text-xs font-semibold tracking-wide uppercase'>
                                        Category
                                    </h3>
                                    <div className='divide-primary/10 divide-y'>
                                        {selectedProducts.map((product) => {
                                            const category = categories.find(
                                                (c) => c.id === product.mainCategory
                                            )
                                            return (
                                                <div
                                                    key={product.id}
                                                    className='flex items-center justify-between py-2 first:pt-0 last:pb-0'
                                                >
                                                    <span className='text-primary/70 truncate text-sm'>
                                                        {product.name}
                                                    </span>
                                                    <div className='flex flex-shrink-0 items-center gap-1.5'>
                                                        {category?.icon && (
                                                            <DynamicIcon
                                                                iconName={category.icon}
                                                                size='sm'
                                                            />
                                                        )}
                                                        <span className='text-sm'>
                                                            {getCategoryName(product.mainCategory)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Rating Card */}
                                <div className='border-primary/10 rounded-xl border p-4'>
                                    <h3 className='text-primary/60 mb-3 text-xs font-semibold tracking-wide uppercase'>
                                        Rating
                                    </h3>
                                    <div className='divide-primary/10 divide-y'>
                                        {selectedProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className='flex items-center justify-between py-2 first:pt-0 last:pb-0'
                                            >
                                                <span className='text-primary/70 truncate text-sm'>
                                                    {product.name}
                                                </span>
                                                {product.averageRating ? (
                                                    <div className='flex flex-shrink-0 items-center gap-1'>
                                                        <FaStar className='h-4 w-4 text-yellow-400' />
                                                        <span className='font-medium'>
                                                            {product.averageRating.toFixed(1)}
                                                        </span>
                                                        {product.ratingsCount && (
                                                            <span className='text-primary/50 text-xs'>
                                                                ({product.ratingsCount})
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className='text-primary/40 text-sm'>
                                                        No ratings
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Features Card */}
                                <div className='border-primary/10 rounded-xl border p-4'>
                                    <h3 className='text-primary/60 mb-3 text-xs font-semibold tracking-wide uppercase'>
                                        Features
                                    </h3>
                                    <div className='divide-primary/10 divide-y'>
                                        {selectedProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className='py-3 first:pt-0 last:pb-0'
                                            >
                                                <div className='mb-2 text-sm font-semibold'>
                                                    {product.name}
                                                </div>
                                                <ul className='space-y-1.5'>
                                                    {getFeatures(product).map((feature, idx) => (
                                                        <li
                                                            key={idx}
                                                            className='flex items-start gap-2 text-sm'
                                                        >
                                                            <FaCheck className='mt-0.5 h-3 w-3 flex-shrink-0 text-green-400' />
                                                            <MarkdownContent
                                                                content={feature}
                                                                className='text-primary/80'
                                                                inline
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Benefits Card */}
                                <div className='border-primary/10 rounded-xl border p-4'>
                                    <h3 className='text-primary/60 mb-3 text-xs font-semibold tracking-wide uppercase'>
                                        Benefits
                                    </h3>
                                    <div className='divide-primary/10 divide-y'>
                                        {selectedProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className='py-3 first:pt-0 last:pb-0'
                                            >
                                                <div className='mb-2 text-sm font-semibold'>
                                                    {product.name}
                                                </div>
                                                <ul className='space-y-1.5'>
                                                    {getBenefits(product).map((benefit, idx) => (
                                                        <li
                                                            key={idx}
                                                            className='flex items-start gap-2 text-sm'
                                                        >
                                                            <FaStar className='text-secondary mt-0.5 h-3 w-3 flex-shrink-0' />
                                                            <MarkdownContent
                                                                content={benefit}
                                                                className='text-primary/80'
                                                                inline
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Best For Card */}
                                <div className='border-primary/10 rounded-xl border p-4'>
                                    <h3 className='text-primary/60 mb-3 text-xs font-semibold tracking-wide uppercase'>
                                        Best For
                                    </h3>
                                    <div className='divide-primary/10 divide-y'>
                                        {selectedProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className='py-3 first:pt-0 last:pb-0'
                                            >
                                                <div className='mb-2 text-sm font-semibold'>
                                                    {product.name}
                                                </div>
                                                <ul className='space-y-1'>
                                                    {product.salesCopy?.perfectFor
                                                        ?.slice(0, 3)
                                                        .map((item, idx) => (
                                                            <li
                                                                key={idx}
                                                                className='text-primary/70 flex items-start gap-1 text-sm'
                                                            >
                                                                <span>•</span>
                                                                <MarkdownContent
                                                                    content={item}
                                                                    inline
                                                                />
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Badges Card */}
                                <div className='border-primary/10 rounded-xl border p-4'>
                                    <h3 className='text-primary/60 mb-3 text-xs font-semibold tracking-wide uppercase'>
                                        Badges
                                    </h3>
                                    <div className='divide-primary/10 divide-y'>
                                        {selectedProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className='flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0'
                                            >
                                                <span className='text-primary/70 truncate text-sm'>
                                                    {product.name}
                                                </span>
                                                <div className='flex flex-shrink-0 flex-wrap justify-end gap-1'>
                                                    {product.featured && (
                                                        <span className='bg-secondary/20 text-secondary rounded-full px-2 py-0.5 text-xs font-medium'>
                                                            Featured
                                                        </span>
                                                    )}
                                                    {product.bestValue && (
                                                        <span className='rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400'>
                                                            Best Value
                                                        </span>
                                                    )}
                                                    {product.bestseller && (
                                                        <span className='rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400'>
                                                            Bestseller
                                                        </span>
                                                    )}
                                                    {product.priceTier === 'free' && (
                                                        <span className='rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400'>
                                                            Free
                                                        </span>
                                                    )}
                                                    {!product.featured &&
                                                        !product.bestValue &&
                                                        !product.bestseller &&
                                                        product.priceTier !== 'free' && (
                                                            <span className='text-primary/40 text-xs'>
                                                                —
                                                            </span>
                                                        )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Card */}
                                <div className='border-primary/10 rounded-xl border p-4'>
                                    <h3 className='text-primary/60 mb-3 text-xs font-semibold tracking-wide uppercase'>
                                        Action
                                    </h3>
                                    <div className='divide-primary/10 divide-y'>
                                        {selectedProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className='flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0'
                                            >
                                                <span className='min-w-0 truncate text-sm font-semibold'>
                                                    {product.name}
                                                </span>
                                                <div className='flex flex-shrink-0 items-center gap-2'>
                                                    <a
                                                        href={buildGumroadUrl(product.gumroadUrl)}
                                                        target='_blank'
                                                        rel='noopener'
                                                        className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors'
                                                    >
                                                        <FaShoppingCart className='h-3 w-3' />
                                                        {product.priceTier === 'free'
                                                            ? 'Get Free'
                                                            : 'Buy'}
                                                    </a>
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className='text-secondary hover:text-secondary/80 text-xs transition-colors'
                                                    >
                                                        Details
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Table Layout */}
                            <div className='hidden overflow-x-auto rounded-xl md:block'>
                                <table className='w-full border-collapse'>
                                    <thead>
                                        <tr>
                                            <th className='border-primary/10 bg-primary/5 w-40 border-b p-4 text-left text-sm font-semibold'>
                                                Compare
                                            </th>
                                            {selectedProducts.map((product) => (
                                                <th
                                                    key={product.id}
                                                    className='border-primary/10 border-b p-4'
                                                >
                                                    <div className='relative'>
                                                        <button
                                                            onClick={() =>
                                                                removeProduct(product.id)
                                                            }
                                                            className='text-primary/40 hover:text-secondary absolute -top-1 -right-1 rounded-full p-1 transition-colors'
                                                            title='Remove from comparison'
                                                        >
                                                            <FaTimes className='h-3 w-3' />
                                                        </button>
                                                        <Link
                                                            to={`/product/${product.id}`}
                                                            className='group block'
                                                        >
                                                            <div className='bg-primary/10 mx-auto mb-3 h-20 w-20 overflow-hidden rounded-lg'>
                                                                {getCoverImage(product.media) ? (
                                                                    <img
                                                                        src={
                                                                            getCoverImage(
                                                                                product.media
                                                                            )?.url
                                                                        }
                                                                        alt={product.name}
                                                                        className='h-full w-full object-cover'
                                                                    />
                                                                ) : (
                                                                    <div className='flex h-full w-full items-center justify-center text-3xl'>
                                                                        📦
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className='group-hover:text-secondary line-clamp-2 text-sm font-semibold transition-colors'>
                                                                {product.name}
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </th>
                                            ))}
                                            {selectedProducts.length < MAX_COMPARE && (
                                                <th className='border-primary/10 border-b p-4'>
                                                    <button
                                                        onClick={() => setShowSelector(true)}
                                                        className='border-primary/20 hover:border-secondary/50 hover:bg-secondary/5 mx-auto flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed transition-colors'
                                                    >
                                                        <FaPlus className='text-primary/40 h-6 w-6' />
                                                    </button>
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Price Row */}
                                        <tr>
                                            <td className='border-primary/10 bg-primary/5 border-b p-4 text-sm font-medium'>
                                                Price
                                            </td>
                                            {selectedProducts.map((product) => (
                                                <td
                                                    key={product.id}
                                                    className='border-primary/10 border-b p-4 text-center'
                                                >
                                                    <div className='text-secondary text-xl font-bold'>
                                                        {formatPrice(product)}
                                                    </div>
                                                    {product.priceTier !== 'free' && (
                                                        <div className='text-primary/50 text-xs'>
                                                            {product.isSubscription
                                                                ? '/month'
                                                                : 'one-time'}
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                            {selectedProducts.length < MAX_COMPARE && (
                                                <td className='border-primary/10 border-b' />
                                            )}
                                        </tr>

                                        {/* Category Row */}
                                        <tr>
                                            <td className='border-primary/10 bg-primary/5 border-b p-4 text-sm font-medium'>
                                                Category
                                            </td>
                                            {selectedProducts.map((product) => {
                                                const category = categories.find(
                                                    (c) => c.id === product.mainCategory
                                                )
                                                return (
                                                    <td
                                                        key={product.id}
                                                        className='border-primary/10 border-b p-4 text-center'
                                                    >
                                                        <div className='inline-flex items-center gap-2'>
                                                            {category?.icon && (
                                                                <DynamicIcon
                                                                    iconName={category.icon}
                                                                    size='sm'
                                                                />
                                                            )}
                                                            <span className='text-sm'>
                                                                {getCategoryName(
                                                                    product.mainCategory
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )
                                            })}
                                            {selectedProducts.length < MAX_COMPARE && (
                                                <td className='border-primary/10 border-b' />
                                            )}
                                        </tr>

                                        {/* Rating Row */}
                                        <tr>
                                            <td className='border-primary/10 bg-primary/5 border-b p-4 text-sm font-medium'>
                                                Rating
                                            </td>
                                            {selectedProducts.map((product) => (
                                                <td
                                                    key={product.id}
                                                    className='border-primary/10 border-b p-4 text-center'
                                                >
                                                    {product.averageRating ? (
                                                        <div className='inline-flex items-center gap-1'>
                                                            <FaStar className='h-4 w-4 text-yellow-400' />
                                                            <span className='font-medium'>
                                                                {product.averageRating.toFixed(1)}
                                                            </span>
                                                            {product.ratingsCount && (
                                                                <span className='text-primary/50 text-xs'>
                                                                    ({product.ratingsCount})
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className='text-primary/40 text-sm'>
                                                            No ratings
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                            {selectedProducts.length < MAX_COMPARE && (
                                                <td className='border-primary/10 border-b' />
                                            )}
                                        </tr>

                                        {/* Features Row */}
                                        <tr>
                                            <td className='border-primary/10 bg-primary/5 border-b p-4 align-top text-sm font-medium'>
                                                Features
                                            </td>
                                            {selectedProducts.map((product) => (
                                                <td
                                                    key={product.id}
                                                    className='border-primary/10 border-b p-4 align-top'
                                                >
                                                    <ul className='space-y-2'>
                                                        {getFeatures(product).map(
                                                            (feature, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className='flex items-start gap-2 text-sm'
                                                                >
                                                                    <FaCheck className='mt-0.5 h-3 w-3 flex-shrink-0 text-green-400' />
                                                                    <MarkdownContent
                                                                        content={feature}
                                                                        className='line-clamp-2'
                                                                        inline
                                                                    />
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </td>
                                            ))}
                                            {selectedProducts.length < MAX_COMPARE && (
                                                <td className='border-primary/10 border-b' />
                                            )}
                                        </tr>

                                        {/* Benefits Row */}
                                        <tr>
                                            <td className='border-primary/10 bg-primary/5 border-b p-4 align-top text-sm font-medium'>
                                                Benefits
                                            </td>
                                            {selectedProducts.map((product) => (
                                                <td
                                                    key={product.id}
                                                    className='border-primary/10 border-b p-4 align-top'
                                                >
                                                    <ul className='space-y-2'>
                                                        {getBenefits(product).map(
                                                            (benefit, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className='flex items-start gap-2 text-sm'
                                                                >
                                                                    <FaStar className='text-secondary mt-0.5 h-3 w-3 flex-shrink-0' />
                                                                    <MarkdownContent
                                                                        content={benefit}
                                                                        className='line-clamp-2'
                                                                        inline
                                                                    />
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </td>
                                            ))}
                                            {selectedProducts.length < MAX_COMPARE && (
                                                <td className='border-primary/10 border-b' />
                                            )}
                                        </tr>

                                        {/* Best For Row */}
                                        <tr>
                                            <td className='border-primary/10 bg-primary/5 border-b p-4 align-top text-sm font-medium'>
                                                Best For
                                            </td>
                                            {selectedProducts.map((product) => (
                                                <td
                                                    key={product.id}
                                                    className='border-primary/10 border-b p-4 align-top'
                                                >
                                                    <ul className='space-y-1'>
                                                        {product.salesCopy?.perfectFor
                                                            ?.slice(0, 3)
                                                            .map((item, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className='text-primary/70 flex items-start gap-1 text-sm'
                                                                >
                                                                    <span>•</span>
                                                                    <MarkdownContent
                                                                        content={item}
                                                                        inline
                                                                    />
                                                                </li>
                                                            ))}
                                                    </ul>
                                                </td>
                                            ))}
                                            {selectedProducts.length < MAX_COMPARE && (
                                                <td className='border-primary/10 border-b' />
                                            )}
                                        </tr>

                                        {/* Badges Row */}
                                        <tr>
                                            <td className='border-primary/10 bg-primary/5 border-b p-4 text-sm font-medium'>
                                                Badges
                                            </td>
                                            {selectedProducts.map((product) => (
                                                <td
                                                    key={product.id}
                                                    className='border-primary/10 border-b p-4 text-center'
                                                >
                                                    <div className='flex flex-wrap justify-center gap-2'>
                                                        {product.featured && (
                                                            <span className='bg-secondary/20 text-secondary rounded-full px-2 py-0.5 text-xs font-medium'>
                                                                Featured
                                                            </span>
                                                        )}
                                                        {product.bestValue && (
                                                            <span className='rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400'>
                                                                Best Value
                                                            </span>
                                                        )}
                                                        {product.bestseller && (
                                                            <span className='rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400'>
                                                                Bestseller
                                                            </span>
                                                        )}
                                                        {product.priceTier === 'free' && (
                                                            <span className='rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400'>
                                                                Free
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            ))}
                                            {selectedProducts.length < MAX_COMPARE && (
                                                <td className='border-primary/10 border-b' />
                                            )}
                                        </tr>

                                        {/* CTA Row */}
                                        <tr>
                                            <td className='bg-primary/5 p-4 text-sm font-medium'>
                                                Action
                                            </td>
                                            {selectedProducts.map((product) => (
                                                <td key={product.id} className='p-4 text-center'>
                                                    <div className='flex flex-col gap-2'>
                                                        <a
                                                            href={buildGumroadUrl(
                                                                product.gumroadUrl
                                                            )}
                                                            target='_blank'
                                                            rel='noopener'
                                                            className='bg-secondary hover:bg-secondary/90 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors'
                                                        >
                                                            <FaShoppingCart className='h-3 w-3' />
                                                            {product.priceTier === 'free'
                                                                ? 'Get Free'
                                                                : 'Buy Now'}
                                                        </a>
                                                        <Link
                                                            to={`/product/${product.id}`}
                                                            className='text-secondary hover:text-secondary/80 text-sm transition-colors'
                                                        >
                                                            Details →
                                                        </Link>
                                                    </div>
                                                </td>
                                            ))}
                                            {selectedProducts.length < MAX_COMPARE && <td />}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Suggestion Section - show when only 1 product */}
                    {selectedProducts.length === 1 && (
                        <div className='bg-secondary/5 border-secondary/20 mt-8 rounded-xl border p-6 text-center'>
                            <p className='text-primary/70'>
                                💡 <strong>Tip:</strong> Add more products to see a meaningful
                                comparison. Try comparing products in the same category!
                            </p>
                        </div>
                    )}

                    {/* Share Section - show when 2+ products */}
                    {selectedProducts.length >= 2 && (
                        <div className='border-primary/10 mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border p-6 sm:flex-row'>
                            <p className='text-primary/70 text-center text-sm sm:text-left'>
                                Found a helpful comparison? Share it with others!
                            </p>
                            <button
                                onClick={handleShareComparison}
                                className='bg-secondary hover:bg-secondary/90 flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors'
                            >
                                <FaShare className='h-4 w-4' />
                                {copySuccess ? 'Link Copied!' : 'Share Comparison'}
                            </button>
                        </div>
                    )}
                </div>
            </Section>
        </>
    )
}

export default ComparePage
