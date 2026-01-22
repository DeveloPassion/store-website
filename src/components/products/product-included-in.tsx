import { useMemo } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { FaArrowRight, FaGift } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import type { Product } from '@/schemas/product.schema'
import type { Category } from '@/schemas/category.schema'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import { useAnimationVariants } from '@/hooks/use-animation-variants'

interface ProductIncludedInProps {
    product: Product
}

interface ParentProductInfo {
    id: string
    name: string
    tagline: string
    icon: string | null
    priceDisplay: string
    savings?: string
}

const ProductIncludedIn: React.FC<ProductIncludedInProps> = ({ product }) => {
    const { containerVariants, itemVariants } = useAnimationVariants()

    // Get products and categories data
    const allProducts = productsData as Product[]
    const categories = categoriesData as Category[]

    // Build a lookup map for products
    const productsMap = useMemo(() => {
        const map = new Map<string, Product>()
        for (const p of allProducts) {
            map.set(p.id, p)
        }
        return map
    }, [allProducts])

    // Build a lookup map for categories (to get icons)
    const categoriesMap = useMemo(() => {
        const map = new Map<string, Category>()
        for (const c of categories) {
            map.set(c.id, c)
        }
        return map
    }, [categories])

    // Check if product is included in any bundles
    const includedIn = product.includedIn
    if (!includedIn || includedIn.length === 0) {
        return null
    }

    // Get parent product info
    const parentProducts: ParentProductInfo[] = includedIn
        .map((parentId): ParentProductInfo | null => {
            const p = productsMap.get(parentId)
            if (!p) return null

            const category = categoriesMap.get(p.mainCategory)

            // Try to extract savings from priceDisplay if it mentions "Save"
            const savingsMatch = p.priceDisplay.match(/Save\s*([€$£]?\d+[\d,.]*)/i)
            const savings = savingsMatch ? savingsMatch[1] : undefined

            return {
                id: p.id,
                name: p.name,
                tagline: p.salesCopy?.tagline || '',
                icon: category?.icon || null,
                priceDisplay: p.priceDisplay,
                savings
            }
        })
        .filter((p): p is ParentProductInfo => p !== null)

    // If no valid parent products found, return null
    if (parentProducts.length === 0) {
        return null
    }

    return (
        <Section className='bg-secondary/5 border-secondary/20 border-y'>
            <div className='mx-auto max-w-4xl'>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='mb-8 text-center'
                >
                    <div className='bg-secondary/20 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2'>
                        <FaGift className='text-secondary h-4 w-4' />
                        <span className='text-secondary text-sm font-semibold'>Get More Value</span>
                    </div>
                    <h2 className='text-primary mb-2 text-2xl font-bold sm:text-3xl'>
                        Also Available In
                    </h2>
                    <p className='text-primary/70'>Get this product as part of a bundle and save</p>
                </motion.div>

                {/* Parent products */}
                <motion.div
                    initial='hidden'
                    whileInView='visible'
                    viewport={{ once: true, margin: '-50px' }}
                    variants={containerVariants}
                    className='space-y-4'
                >
                    {parentProducts.map((parentProduct) => (
                        <motion.div key={parentProduct.id} variants={itemVariants}>
                            <Link
                                to={`/product/${parentProduct.id}`}
                                className='border-secondary/30 bg-background hover:border-secondary hover:shadow-secondary/10 group flex items-center gap-4 rounded-xl border-2 p-4 transition-all hover:shadow-lg sm:p-6'
                            >
                                {/* Icon */}
                                <div className='bg-secondary/10 group-hover:bg-secondary/20 hidden shrink-0 rounded-lg p-4 transition-colors sm:block'>
                                    <DynamicIcon
                                        iconName={parentProduct.icon}
                                        size='lg'
                                        className='text-secondary'
                                    />
                                </div>

                                {/* Content */}
                                <div className='min-w-0 flex-1'>
                                    <div className='text-primary text-lg font-bold sm:text-xl'>
                                        {parentProduct.name}
                                    </div>
                                    <div className='text-primary/70 mt-1 line-clamp-2 text-sm sm:text-base'>
                                        {parentProduct.tagline}
                                    </div>
                                    <div className='mt-2 flex flex-wrap items-center gap-2'>
                                        <span className='text-secondary text-lg font-bold'>
                                            {parentProduct.priceDisplay}
                                        </span>
                                        {parentProduct.savings && (
                                            <span className='bg-secondary/20 text-secondary rounded-full px-2 py-0.5 text-sm font-medium'>
                                                Save {parentProduct.savings}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className='text-secondary/50 group-hover:text-secondary shrink-0 transition-colors'>
                                    <FaArrowRight className='h-5 w-5 sm:h-6 sm:w-6' />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </Section>
    )
}

export default ProductIncludedIn
