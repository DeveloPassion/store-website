import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaCheckCircle,
    FaCog,
    FaRocket,
    FaLightbulb,
    FaBolt,
    FaShieldAlt,
    FaMagic,
    FaChartLine,
    FaExternalLinkAlt,
    FaChevronDown,
    FaGift,
    FaLock,
    FaUnlock
} from 'react-icons/fa'
import type { IconType } from 'react-icons'
import Section from '@/components/ui/section'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import type { Product, ProductVariant } from '@/schemas/product.schema'
import type { Category } from '@/schemas/category.schema'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import { SectionHeader } from '@/components/ui/section-header'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { cn } from '@/lib/utils'

interface ProductFeaturesProps {
    product: Product
    selectedVariant?: ProductVariant
    setSelectedVariant?: (variant: ProductVariant | undefined) => void
}

interface IncludedProductInfo {
    id: string
    name: string
    tagline: string
    icon: string | null
    priceDisplay: string
    price: number
}

// Icon mapping for visual variety
const icons: IconType[] = [
    FaCheckCircle,
    FaCog,
    FaRocket,
    FaLightbulb,
    FaBolt,
    FaShieldAlt,
    FaMagic,
    FaChartLine
]

const ProductFeatures: React.FC<ProductFeaturesProps> = ({
    product,
    selectedVariant,
    setSelectedVariant
}) => {
    const { containerVariants, itemVariants } = useAnimationVariants()

    // Get products and categories data for included products
    const allProducts = productsData as Product[]
    const categories = categoriesData as Category[]

    // Build lookup maps
    const productsMap = useMemo(() => {
        const map = new Map<string, Product>()
        for (const p of allProducts) {
            map.set(p.id, p)
        }
        return map
    }, [allProducts])

    const categoriesMap = useMemo(() => {
        const map = new Map<string, Category>()
        for (const c of categories) {
            map.set(c.id, c)
        }
        return map
    }, [categories])

    // Get included product info (without recursion)
    const getIncludedProductInfo = useCallback(
        (productId: string): IncludedProductInfo | null => {
            const p = productsMap.get(productId)
            if (!p) return null
            const category = categoriesMap.get(p.mainCategory)
            return {
                id: p.id,
                name: p.name,
                tagline: p.salesCopy?.tagline || '',
                icon: category?.icon || null,
                priceDisplay: p.priceDisplay,
                price: p.price
            }
        },
        [productsMap, categoriesMap]
    )

    // Recursively collect all included product IDs (direct and indirect), avoiding duplicates
    const collectAllIncludedProductIds = useMemo(() => {
        const collectRecursive = (
            productIds: string[],
            visited: Set<string>,
            rootProductId: string
        ): string[] => {
            const result: string[] = []
            for (const id of productIds) {
                // Skip if already visited or if it's the root product (avoid self-reference)
                if (visited.has(id) || id === rootProductId) continue
                visited.add(id)
                result.push(id)

                // Check if this product has its own included products
                const p = productsMap.get(id)
                if (p) {
                    // Recursively collect from root includedProducts
                    if (p.includedProducts.length > 0) {
                        result.push(...collectRecursive(p.includedProducts, visited, rootProductId))
                    }
                    // Also collect from variant-level includedProducts
                    if (p.variants) {
                        for (const variant of p.variants) {
                            if (variant.includedProducts.length > 0) {
                                result.push(
                                    ...collectRecursive(
                                        variant.includedProducts,
                                        visited,
                                        rootProductId
                                    )
                                )
                            }
                        }
                    }
                }
            }
            return result
        }
        return collectRecursive
    }, [productsMap])

    // Check if product has any included products (root or variant level)
    const hasVariantIncludedProducts =
        product.variants?.some((v) => v.includedProducts.length > 0) ?? false
    const hasIncludedProducts = product.includedProducts.length > 0 || hasVariantIncludedProducts

    // Get all products for root includedProducts (including nested)
    const allVariantsProductIds = useMemo(() => {
        if (!product.includedProducts.length) return []
        return collectAllIncludedProductIds(product.includedProducts, new Set<string>(), product.id)
    }, [product.includedProducts, collectAllIncludedProductIds, product.id])

    const allVariantsProducts = useMemo(() => {
        return allVariantsProductIds
            .map(getIncludedProductInfo)
            .filter((p): p is IncludedProductInfo => p !== null)
    }, [allVariantsProductIds, getIncludedProductInfo])

    // Check if there's variant-specific content
    const hasVariantSpecific =
        hasVariantIncludedProducts && product.variants && product.variants.length > 0

    // For variant tabs
    const variants = useMemo(() => product.variants || [], [product.variants])

    // State for collapsible products drawer (collapsed by default)
    const [isProductsDrawerOpen, setIsProductsDrawerOpen] = useState(false)

    // Build variant-specific data showing INCREMENTAL products per tier (not duplicating lower tiers)
    const variantTabs = useMemo(() => {
        if (!hasVariantSpecific) return []

        // Track products already shown in previous tiers
        const shownInPreviousTiers = new Set<string>(allVariantsProductIds)
        let cumulativeProducts = [...allVariantsProducts]

        return variants.map((variant, variantIndex) => {
            const variantId = variant.gumroadVariantId || ''
            const variantSpecificIds = variant.includedProducts || []

            // Collect all products for this variant (including nested), excluding already shown products
            const visited = new Set<string>(shownInPreviousTiers)
            const variantSpecificAllIds = collectAllIncludedProductIds(
                variantSpecificIds,
                visited,
                product.id
            )

            // Get only the NEW products for this tier (incremental)
            const incrementalProducts = variantSpecificAllIds
                .map(getIncludedProductInfo)
                .filter((p): p is IncludedProductInfo => p !== null)

            // Add these products to the shown set for next tier
            for (const id of variantSpecificAllIds) {
                shownInPreviousTiers.add(id)
            }

            // Update cumulative products for count calculation
            cumulativeProducts = [...cumulativeProducts, ...incrementalProducts]

            return {
                name: variant.name,
                variantId,
                variant,
                variantIndex,
                incrementalProducts, // Only NEW products for this tier
                products: [...cumulativeProducts], // All products up to and including this tier
                count: cumulativeProducts.length,
                incrementalValue: incrementalProducts.reduce((sum, p) => sum + p.price, 0)
            }
        })
    }, [
        hasVariantSpecific,
        variants,
        allVariantsProductIds,
        allVariantsProducts,
        collectAllIncludedProductIds,
        product.id,
        getIncludedProductInfo
    ])

    // Get selected variant index (needed for other calculations)
    // Use gumroadVariantId if available, otherwise fall back to name comparison
    const selectedVariantIndex = selectedVariant
        ? variants.findIndex((v) =>
              v.gumroadVariantId
                  ? v.gumroadVariantId === selectedVariant.gumroadVariantId
                  : v.name === selectedVariant.name
          )
        : 0

    // Calculate total products count for the selected variant
    const totalProductsCount = hasVariantSpecific
        ? (variantTabs[selectedVariantIndex]?.count ?? variantTabs[0]?.count ?? 0)
        : allVariantsProducts.length

    // Calculate value of allVariants products
    const allVariantsValue = useMemo(() => {
        return allVariantsProducts.reduce((sum, p) => sum + p.price, 0)
    }, [allVariantsProducts])

    // Calculate total value of included products for the selected variant
    const totalBonusValue = useMemo(() => {
        if (hasVariantSpecific && variantTabs.length > 0) {
            // Use value for the selected variant
            const selectedTab = variantTabs[selectedVariantIndex]
            if (selectedTab) {
                return selectedTab.products.reduce((sum, p) => sum + p.price, 0)
            }
            // Fallback to first variant
            const firstTab = variantTabs[0]
            if (firstTab) {
                return firstTab.products.reduce((sum, p) => sum + p.price, 0)
            }
        }
        return allVariantsValue
    }, [hasVariantSpecific, variantTabs, allVariantsValue, selectedVariantIndex])

    // Determine label based on product type: "Plan" for subscriptions, "Tier" for others
    const variantLabel = product.isSubscription ? 'Plan' : 'Tier'

    return (
        <Section className='border-primary/10 bg-background border-t'>
            <div className='mx-auto max-w-6xl'>
                {/* Header */}
                <SectionHeader title="What's Included" subtitle={product.salesCopy?.description} />

                {/* Contents Grid - What's literally included in the product */}
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                >
                    {product.contents?.map((contentItem, idx) => {
                        const IconComponent = icons[idx % icons.length] as IconType
                        return (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className='border-primary/10 bg-background/50 hover:border-secondary/30 group grid min-w-0 grid-cols-[auto_1fr] items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-lg sm:gap-4 sm:p-6'
                            >
                                {/* Icon */}
                                <div className='bg-secondary/10 group-hover:bg-secondary/20 inline-flex shrink-0 rounded-lg p-2 transition-colors sm:p-3'>
                                    <IconComponent className='text-secondary h-5 w-5 sm:h-6 sm:w-6' />
                                </div>
                                {/* Text */}
                                <MarkdownContent
                                    content={contentItem}
                                    inline
                                    className='text-primary/80 min-w-0 text-sm break-words sm:text-base'
                                />
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* Included Products Drawer - Collapsible section for bundled products */}
                {hasIncludedProducts && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className='mt-12'
                    >
                        {/* Bonuses Header */}
                        <h3 className='text-secondary mb-4 text-center text-xl font-bold sm:text-2xl'>
                            🎁 Bonuses
                        </h3>

                        {/* Variant Selector - Only shown for products with variant-specific bonuses */}
                        {hasVariantSpecific &&
                            product.variants &&
                            product.variants.length > 1 &&
                            setSelectedVariant && (
                                <div className='mb-4'>
                                    <label className='text-primary/80 mb-2 block text-center text-sm font-medium'>
                                        Select Your {variantLabel}:
                                    </label>
                                    <div className='flex flex-col gap-2'>
                                        {product.variants.map((variant) => {
                                            // Use gumroadVariantId if available, otherwise fall back to name comparison
                                            const isSelected = variant.gumroadVariantId
                                                ? selectedVariant?.gumroadVariantId ===
                                                  variant.gumroadVariantId
                                                : selectedVariant?.name === variant.name
                                            return (
                                                <button
                                                    key={variant.gumroadVariantId || variant.name}
                                                    onClick={() => setSelectedVariant(variant)}
                                                    className={cn(
                                                        'group cursor-pointer rounded-lg border-2 p-3 text-left transition-all',
                                                        isSelected
                                                            ? 'border-secondary bg-secondary/10'
                                                            : 'border-primary/20 hover:border-primary/40'
                                                    )}
                                                >
                                                    <div className='flex min-w-0 items-center justify-between gap-2'>
                                                        {/* Left: Name */}
                                                        <div className='flex min-w-0 items-center gap-2'>
                                                            <FaCheckCircle
                                                                className={cn(
                                                                    'h-4 w-4 shrink-0',
                                                                    isSelected
                                                                        ? 'text-secondary'
                                                                        : 'invisible'
                                                                )}
                                                            />
                                                            <span className='truncate font-semibold'>
                                                                {variant.name}
                                                            </span>
                                                        </div>
                                                        {/* Right: Price */}
                                                        <span className='text-secondary shrink-0 font-bold'>
                                                            {variant.priceDisplay}
                                                        </span>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                        {/* Drawer Toggle Button */}
                        <button
                            onClick={() => setIsProductsDrawerOpen(!isProductsDrawerOpen)}
                            className={cn(
                                'w-full cursor-pointer rounded-xl border-2 p-4 transition-all',
                                totalProductsCount >= 1
                                    ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10'
                                    : 'border-secondary/30 bg-secondary/5 hover:bg-secondary/10',
                                isProductsDrawerOpen &&
                                    (totalProductsCount >= 1
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-secondary bg-secondary/10')
                            )}
                        >
                            <div className='flex min-w-0 items-center justify-between gap-3'>
                                <div className='flex min-w-0 items-center gap-3'>
                                    <div
                                        className={cn(
                                            'shrink-0 rounded-lg p-2',
                                            totalProductsCount >= 1
                                                ? 'bg-green-500/20'
                                                : 'bg-secondary/20'
                                        )}
                                    >
                                        <FaGift
                                            className={cn(
                                                'h-5 w-5',
                                                totalProductsCount >= 1
                                                    ? 'text-green-500'
                                                    : 'text-secondary'
                                            )}
                                        />
                                    </div>
                                    <div className='min-w-0 text-left'>
                                        <div className='text-primary text-sm font-semibold sm:text-base'>
                                            {totalProductsCount} Additional{' '}
                                            {totalProductsCount === 1 ? 'Product' : 'Products'}{' '}
                                            Included
                                            {hasVariantSpecific && ` with your ${variantLabel}`}
                                            {totalBonusValue > 0 &&
                                                ` (Total Value: €${totalBonusValue.toFixed(0)}+)`}
                                        </div>
                                        <div className='text-primary/60 text-sm'>
                                            Tap to see everything included
                                        </div>
                                    </div>
                                </div>
                                <FaChevronDown
                                    className={cn(
                                        'h-5 w-5 shrink-0 transition-transform duration-300',
                                        totalProductsCount >= 1
                                            ? 'text-green-500'
                                            : 'text-secondary',
                                        isProductsDrawerOpen && 'rotate-180'
                                    )}
                                />
                            </div>
                        </button>

                        {/* Drawer Content */}
                        <AnimatePresence>
                            {isProductsDrawerOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className='overflow-hidden'
                                >
                                    <div className='space-y-8 pt-6'>
                                        {/* Products with variant-specific inclusions - show all sections */}
                                        {hasVariantSpecific ? (
                                            <>
                                                {/* Always Included Section */}
                                                {allVariantsProducts.length > 0 && (
                                                    <div>
                                                        <div className='mb-4 flex items-center justify-between gap-4'>
                                                            <div className='flex items-center gap-2'>
                                                                <FaUnlock className='text-secondary h-4 w-4' />
                                                                <h4 className='text-secondary font-semibold'>
                                                                    Always Included
                                                                </h4>
                                                                <span className='text-primary/50 text-sm'>
                                                                    ({allVariantsProducts.length}{' '}
                                                                    product
                                                                    {allVariantsProducts.length !==
                                                                    1
                                                                        ? 's'
                                                                        : ''}{' '}
                                                                    • €{allVariantsValue.toFixed(0)}
                                                                    + value)
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className='grid gap-3'>
                                                            {allVariantsProducts.map(
                                                                (includedProduct) => (
                                                                    <IncludedProductCard
                                                                        key={includedProduct.id}
                                                                        product={includedProduct}
                                                                        itemVariants={itemVariants}
                                                                        isUnlocked={true}
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Variant-specific sections */}
                                                {variantTabs.map((tab) => {
                                                    const isSelected =
                                                        tab.variantIndex === selectedVariantIndex
                                                    const hasProducts =
                                                        tab.incrementalProducts.length > 0

                                                    if (!hasProducts) return null

                                                    return (
                                                        <div key={tab.variantId}>
                                                            <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                                                                <div className='flex items-center gap-2'>
                                                                    {isSelected ? (
                                                                        <FaUnlock className='text-secondary h-4 w-4' />
                                                                    ) : (
                                                                        <FaLock className='text-primary/40 h-4 w-4' />
                                                                    )}
                                                                    <h4
                                                                        className={cn(
                                                                            'font-semibold',
                                                                            isSelected
                                                                                ? 'text-secondary'
                                                                                : 'text-primary/60'
                                                                        )}
                                                                    >
                                                                        {tab.name} Bonuses
                                                                    </h4>
                                                                    <span className='text-primary/50 text-sm'>
                                                                        (
                                                                        {
                                                                            tab.incrementalProducts
                                                                                .length
                                                                        }{' '}
                                                                        product
                                                                        {tab.incrementalProducts
                                                                            .length !== 1
                                                                            ? 's'
                                                                            : ''}{' '}
                                                                        • €
                                                                        {tab.incrementalValue.toFixed(
                                                                            0
                                                                        )}
                                                                        + value)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className='grid gap-3'>
                                                                {tab.incrementalProducts.map(
                                                                    (includedProduct) => (
                                                                        <IncludedProductCard
                                                                            key={includedProduct.id}
                                                                            product={
                                                                                includedProduct
                                                                            }
                                                                            itemVariants={
                                                                                itemVariants
                                                                            }
                                                                            isUnlocked={
                                                                                isSelected ||
                                                                                tab.variantIndex <
                                                                                    selectedVariantIndex
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </>
                                        ) : (
                                            /* Simple list for products without variant-specific inclusions */
                                            <div className='grid gap-3'>
                                                {allVariantsProducts.map((includedProduct) => (
                                                    <IncludedProductCard
                                                        key={includedProduct.id}
                                                        product={includedProduct}
                                                        itemVariants={itemVariants}
                                                        isUnlocked={true}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Highlights Section - Value propositions from sales copy */}
                {product.salesCopy?.highlights && product.salesCopy.highlights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className='mt-16'
                    >
                        <h3 className='mb-6 text-center text-2xl font-bold sm:text-3xl'>
                            Why Choose This
                        </h3>
                        <div className='mx-auto grid max-w-4xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3'>
                            {product.salesCopy.highlights.map((item, idx) => (
                                <div
                                    key={idx}
                                    className='border-secondary/20 bg-secondary/5 grid grid-cols-[auto_1fr] items-center gap-2.5 rounded-lg border p-2.5 sm:gap-3 sm:p-4'
                                >
                                    {/* Icon */}
                                    <FaCheckCircle className='text-secondary h-4 w-4 shrink-0 sm:h-5 sm:w-5' />
                                    {/* Text */}
                                    <MarkdownContent
                                        content={item}
                                        inline
                                        className='text-primary/80 text-sm break-words sm:text-base'
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Target Audience */}
                {((product.salesCopy?.perfectFor && product.salesCopy.perfectFor.length > 0) ||
                    (product.salesCopy?.notForYou && product.salesCopy.notForYou.length > 0)) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className='mt-16 grid gap-8 md:grid-cols-2'
                    >
                        {/* Perfect For */}
                        {product.salesCopy?.perfectFor &&
                            product.salesCopy.perfectFor.length > 0 && (
                                <div className='border-secondary/20 bg-secondary/5 rounded-xl border p-6'>
                                    <h3 className='text-secondary mb-4 text-xl font-bold'>
                                        Perfect For You If:
                                    </h3>
                                    <ul className='space-y-3'>
                                        {product.salesCopy.perfectFor?.map((item, idx) => (
                                            <li
                                                key={idx}
                                                className='grid grid-cols-[auto_1fr] items-center gap-3'
                                            >
                                                {/* Icon */}
                                                <FaCheckCircle className='text-secondary h-4 w-4 shrink-0' />
                                                {/* Text */}
                                                <MarkdownContent
                                                    content={item}
                                                    inline
                                                    className='text-primary/80'
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        {/* Not For You */}
                        {product.salesCopy?.notForYou && product.salesCopy.notForYou.length > 0 && (
                            <div className='border-primary/20 bg-primary/5 rounded-xl border p-6'>
                                <h3 className='mb-4 text-xl font-bold'>Not For You If:</h3>
                                <ul className='space-y-3'>
                                    {product.salesCopy.notForYou?.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className='grid grid-cols-[auto_1fr] items-center gap-3'
                                        >
                                            {/* Bullet */}
                                            <span className='text-primary/40 shrink-0 text-lg'>
                                                •
                                            </span>
                                            {/* Text */}
                                            <MarkdownContent
                                                content={item}
                                                inline
                                                className='text-primary/70'
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </Section>
    )
}

// Sub-component for included product cards
interface IncludedProductCardProps {
    product: IncludedProductInfo
    itemVariants: ReturnType<typeof useAnimationVariants>['itemVariants']
    isUnlocked?: boolean
}

const IncludedProductCard: React.FC<IncludedProductCardProps> = ({
    product,
    itemVariants,
    isUnlocked = true
}) => {
    return (
        <motion.div variants={itemVariants}>
            <Link
                to={`/product/${product.id}`}
                target='_blank'
                rel='noopener noreferrer'
                className={cn(
                    'group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border p-4 transition-all',
                    isUnlocked
                        ? 'border-primary/10 bg-background/50 hover:border-secondary/30 hover:shadow-lg'
                        : 'border-primary/5 bg-background/30 opacity-60'
                )}
            >
                {/* Icon */}
                <div
                    className={cn(
                        'inline-flex rounded-lg p-3 transition-colors',
                        isUnlocked ? 'bg-secondary/10 group-hover:bg-secondary/20' : 'bg-primary/5'
                    )}
                >
                    <DynamicIcon
                        iconName={product.icon}
                        size='md'
                        className={isUnlocked ? 'text-secondary' : 'text-primary/40'}
                    />
                </div>

                {/* Content */}
                <div className='min-w-0'>
                    <div
                        className={cn(
                            'font-semibold',
                            isUnlocked ? 'text-primary' : 'text-primary/60'
                        )}
                    >
                        {product.name}
                    </div>
                    <div className='text-primary/60 truncate text-sm'>{product.tagline}</div>
                    <div
                        className={cn(
                            'mt-1 text-sm font-medium',
                            isUnlocked ? 'text-secondary' : 'text-primary/40'
                        )}
                    >
                        {product.priceDisplay}
                    </div>
                </div>

                {/* External link indicator */}
                <FaExternalLinkAlt className='text-primary/40 group-hover:text-secondary h-4 w-4 shrink-0 transition-colors' />
            </Link>
        </motion.div>
    )
}

export default ProductFeatures
