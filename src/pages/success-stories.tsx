import { useMemo, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaTrophy,
    FaStar,
    FaQuoteLeft,
    FaArrowRight,
    FaFilter,
    FaUser,
    FaLightbulb
} from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import type { Product } from '@/schemas/product.schema'
import type { Category } from '@/schemas/category.schema'
import type { Testimonial } from '@/schemas/testimonial.schema'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'
import { useProductStats } from '@/hooks/use-product-stats'
import { updateAllMetaTags } from '@/lib/update-meta-tags'
import type { MediaItem } from '@/schemas/media.schema'
import { useAnimationVariants } from '@/hooks/use-animation-variants'
import QuickNavigation from '@/components/navigation/quick-navigation'

// Shuffle array using Fisher-Yates algorithm
const shuffle = <T,>(array: T[]): T[] => {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = result[i]
        result[i] = result[j] as T
        result[j] = temp as T
    }
    return result
}

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

interface EnrichedTestimonial extends Testimonial {
    product: Product
}

const SuccessStoriesPage: React.FC = () => {
    const products = productsData as Product[]
    const categories = categoriesData as Category[]
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    // Animation variants for staggered animations
    const { containerVariants, itemVariants } = useAnimationVariants({ staggerDelay: 0.1 })
    const fastContainerVariants = useAnimationVariants({ staggerDelay: 0.05 }).containerVariants

    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Success Stories' }])

    useEffect(() => {
        updateAllMetaTags({
            title: 'Success Stories - Knowledge Forge',
            description:
                'Real stories from real customers. See how knowledge workers transformed their productivity and workflows.',
            url: 'https://store.dsebastien.net/success-stories'
        })
    }, [])

    // Collect all testimonials with product info, with randomization on each page load
    const allTestimonials = useMemo((): EnrichedTestimonial[] => {
        const testimonials: EnrichedTestimonial[] = []

        products.forEach((product) => {
            if (product.testimonials) {
                product.testimonials.forEach((t) => {
                    testimonials.push({
                        ...t,
                        product
                    })
                })
            }
        })

        // Separate truly featured testimonials from the rest
        const trulyFeatured = testimonials.filter((t) => t.featured)
        const nonFeatured = testimonials.filter((t) => !t.featured)

        // Group non-featured by priority tiers (flagship 90+, premium 70-89, standard 50-69, other <50)
        const flagship = nonFeatured.filter((t) => (t.product.priority || 0) >= 90)
        const premium = nonFeatured.filter(
            (t) => (t.product.priority || 0) >= 70 && (t.product.priority || 0) < 90
        )
        const standard = nonFeatured.filter(
            (t) => (t.product.priority || 0) >= 50 && (t.product.priority || 0) < 70
        )
        const other = nonFeatured.filter((t) => (t.product.priority || 0) < 50)

        // Shuffle within each tier for variety while maintaining tier hierarchy
        // Combine: featured first, then by priority tiers
        return [
            ...shuffle(trulyFeatured),
            ...shuffle(flagship),
            ...shuffle(premium),
            ...shuffle(standard),
            ...shuffle(other)
        ]
    }, [products])

    // Filter testimonials by category
    const filteredTestimonials = useMemo(() => {
        if (selectedCategory === 'all') return allTestimonials
        return allTestimonials.filter(
            (t) =>
                t.product.mainCategory === selectedCategory ||
                t.product.secondaryCategories.some((sc) => sc.id === selectedCategory)
        )
    }, [allTestimonials, selectedCategory])

    // Featured testimonials (longer, more detailed)
    const featuredTestimonials = useMemo(
        () => filteredTestimonials.filter((t) => t.featured || t.quote.length > 150).slice(0, 6),
        [filteredTestimonials]
    )

    // Regular testimonials
    const regularTestimonials = useMemo(
        () => filteredTestimonials.filter((t) => !featuredTestimonials.includes(t)).slice(0, 24),
        [filteredTestimonials, featuredTestimonials]
    )

    // Get product statistics (customers, testimonials, ratings)
    const { formattedCustomers, totalTestimonials, averageRating } = useProductStats()

    // Categories with testimonials
    const categoriesWithTestimonials = useMemo(() => {
        const categoryIds = new Set<string>()
        allTestimonials.forEach((t) => {
            categoryIds.add(t.product.mainCategory)
            t.product.secondaryCategories.forEach((sc) => categoryIds.add(sc.id))
        })
        return categories.filter((c) => categoryIds.has(c.id))
    }, [allTestimonials, categories])

    const getCategoryName = (id: string): string => {
        const cat = categories.find((c) => c.id === id)
        return (
            cat?.name ||
            id
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
        )
    }

    return (
        <>
            <Section className='pt-16 pb-12 sm:pt-24 sm:pb-16'>
                <motion.div
                    className='mx-auto max-w-[1400px] text-center'
                    initial='hidden'
                    animate='visible'
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants}>
                        <Breadcrumb className='mb-6 flex justify-center' />
                    </motion.div>
                    <motion.h1
                        className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'
                        variants={itemVariants}
                    >
                        <FaTrophy className='text-secondary mr-3 inline-block' />
                        Success Stories
                    </motion.h1>
                    <motion.p
                        className='text-primary/70 mx-auto max-w-2xl text-lg'
                        variants={itemVariants}
                    >
                        Real stories from real customers who transformed their productivity and
                        workflows.
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        className='mt-8 grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-12'
                        variants={itemVariants}
                    >
                        <motion.div
                            className='text-center'
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            <div className='text-secondary text-2xl font-bold sm:text-4xl'>
                                {formattedCustomers}
                            </div>
                            <div className='text-primary/60 text-xs sm:text-sm'>
                                Happy Customers
                            </div>
                        </motion.div>
                        <motion.div
                            className='text-center'
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            <div className='flex items-center justify-center gap-1 text-2xl font-bold text-yellow-400 sm:text-4xl'>
                                {averageRating.toFixed(1)}{' '}
                                <FaStar className='inline h-4 w-4 sm:h-6 sm:w-6' />
                            </div>
                            <div className='text-primary/60 text-xs sm:text-sm'>Average Rating</div>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        >
                            <Link to='/testimonials' className='group block text-center'>
                                <div className='text-success text-2xl font-bold transition-colors group-hover:opacity-80 sm:text-4xl'>
                                    {totalTestimonials}
                                </div>
                                <div className='text-primary/60 group-hover:text-primary text-xs transition-colors sm:text-sm'>
                                    Testimonials
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </Section>

            {/* Filter */}
            {categoriesWithTestimonials.length > 1 && (
                <Section className='pb-6 sm:pb-8'>
                    <motion.div
                        className='mx-auto max-w-4xl'
                        initial='hidden'
                        whileInView='visible'
                        viewport={{ once: true, margin: '-50px' }}
                        variants={containerVariants}
                    >
                        <div className='flex flex-wrap items-center justify-center gap-1.5 sm:gap-2'>
                            <motion.div variants={itemVariants}>
                                <FaFilter className='text-primary/40 h-3 w-3 sm:h-4 sm:w-4' />
                            </motion.div>
                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedCategory('all')}
                                className={`rounded-full px-3 py-1.5 text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                                    selectedCategory === 'all'
                                        ? 'bg-secondary text-white'
                                        : 'bg-primary/10 hover:bg-primary/20'
                                }`}
                            >
                                All Stories
                            </motion.button>
                            {categoriesWithTestimonials.slice(0, 6).map((cat) => (
                                <motion.button
                                    key={cat.id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`rounded-full px-3 py-1.5 text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                                        selectedCategory === cat.id
                                            ? 'bg-secondary text-white'
                                            : 'bg-primary/10 hover:bg-primary/20'
                                    }`}
                                >
                                    {cat.name}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </Section>
            )}

            {/* Featured Testimonials */}
            {featuredTestimonials.length > 0 && (
                <Section className='pb-8 sm:pb-12'>
                    <div className='mx-auto max-w-7xl'>
                        <motion.h2
                            className='mb-6 text-center text-lg font-bold sm:mb-8 sm:text-xl md:text-2xl'
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5 }}
                        >
                            Featured Stories
                        </motion.h2>
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={selectedCategory}
                                className='grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3'
                                initial='hidden'
                                whileInView='visible'
                                viewport={{ once: true, margin: '-100px' }}
                                variants={containerVariants}
                            >
                                {featuredTestimonials.map((testimonial, index) => (
                                    <motion.div
                                        key={`${testimonial.product.id}-${testimonial.author}-${index}`}
                                        variants={itemVariants}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        className='border-primary/10 hover:border-secondary/30 flex min-h-[280px] flex-col rounded-xl border p-4 transition-colors sm:min-h-[320px] sm:rounded-2xl sm:p-6'
                                    >
                                        <FaQuoteLeft className='text-secondary/30 mb-3 h-6 w-6 flex-shrink-0 sm:mb-4 sm:h-8 sm:w-8' />
                                        <p className='text-primary/90 mb-4 line-clamp-5 flex-1 text-sm leading-relaxed sm:mb-6 sm:line-clamp-6 sm:text-lg'>
                                            "{testimonial.quote}"
                                        </p>
                                        <div className='mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <div className='bg-secondary/20 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12'>
                                                    <FaUser className='text-secondary h-4 w-4 sm:h-5 sm:w-5' />
                                                </div>
                                                <div>
                                                    <div className='text-sm font-semibold sm:text-base'>
                                                        {testimonial.author}
                                                    </div>
                                                    <div className='flex items-center gap-0.5'>
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar
                                                                key={i}
                                                                className='h-2.5 w-2.5 text-yellow-400 sm:h-3 sm:w-3'
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/product/${testimonial.product.id}`}
                                                className='group flex items-center gap-2'
                                            >
                                                <div className='bg-primary/10 h-8 w-8 overflow-hidden rounded sm:h-10 sm:w-10'>
                                                    {getCoverImage(testimonial.product.media) ? (
                                                        <img
                                                            src={
                                                                getCoverImage(
                                                                    testimonial.product.media
                                                                )?.url
                                                            }
                                                            alt={testimonial.product.name}
                                                            className='h-full w-full object-cover'
                                                        />
                                                    ) : (
                                                        <div className='flex h-full w-full items-center justify-center text-sm sm:text-lg'>
                                                            📦
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className='group-hover:text-secondary text-xs font-medium transition-colors sm:text-sm'>
                                                        {testimonial.product.name}
                                                    </div>
                                                    <div className='text-primary/50 text-[10px] sm:text-xs'>
                                                        {getCategoryName(
                                                            testimonial.product.mainCategory
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </Section>
            )}

            {/* Regular Testimonials Grid */}
            {regularTestimonials.length > 0 && (
                <Section className='pb-12 sm:pb-16'>
                    <div className='mx-auto max-w-7xl'>
                        <motion.h2
                            className='mb-6 text-center text-lg font-bold sm:mb-8 sm:text-xl md:text-2xl'
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5 }}
                        >
                            More Success Stories
                        </motion.h2>
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={`regular-${selectedCategory}`}
                                className='grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4'
                                initial='hidden'
                                whileInView='visible'
                                viewport={{ once: true, margin: '-100px' }}
                                variants={fastContainerVariants}
                            >
                                {regularTestimonials.map((testimonial, index) => (
                                    <motion.div
                                        key={`${testimonial.product.id}-${testimonial.author}-regular-${index}`}
                                        variants={itemVariants}
                                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                        className='border-primary/10 hover:border-secondary/20 rounded-lg border p-3 transition-colors sm:rounded-xl sm:p-4'
                                    >
                                        <div className='mb-2 flex items-center gap-0.5 sm:mb-3 sm:gap-1'>
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar
                                                    key={i}
                                                    className='h-2.5 w-2.5 text-yellow-400 sm:h-3 sm:w-3'
                                                />
                                            ))}
                                        </div>
                                        <p className='text-primary/80 mb-3 line-clamp-4 text-xs sm:mb-4 sm:text-sm'>
                                            "{testimonial.quote}"
                                        </p>
                                        <div className='flex items-center justify-between gap-2'>
                                            <div className='min-w-0 flex-1 truncate text-xs font-medium sm:text-sm'>
                                                {testimonial.author}
                                            </div>
                                            <Link
                                                to={`/product/${testimonial.product.id}`}
                                                className='text-secondary hover:text-secondary/80 flex-shrink-0 text-[10px] transition-colors sm:text-xs'
                                            >
                                                View →
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {filteredTestimonials.length >
                            featuredTestimonials.length + regularTestimonials.length && (
                            <motion.div
                                className='mt-6 text-center sm:mt-8'
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <Link
                                    to='/testimonials'
                                    className='text-secondary hover:text-secondary/80 inline-flex items-center gap-2 text-sm transition-colors sm:text-base'
                                >
                                    View All {allTestimonials.length} Testimonials
                                    <FaArrowRight className='h-3 w-3 sm:h-4 sm:w-4' />
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </Section>
            )}

            {/* Empty State */}
            <AnimatePresence>
                {filteredTestimonials.length === 0 && (
                    <Section className='pb-12 sm:pb-16'>
                        <motion.div
                            className='text-center'
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className='text-4xl sm:text-5xl'
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.1
                                }}
                            >
                                🔍
                            </motion.div>
                            <motion.h3
                                className='mt-3 text-lg font-semibold sm:mt-4 sm:text-xl'
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                No stories in this category yet
                            </motion.h3>
                            <motion.p
                                className='text-primary/60 mt-2 text-sm sm:text-base'
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Try selecting a different category or view all stories.
                            </motion.p>
                            <motion.button
                                onClick={() => setSelectedCategory('all')}
                                className='bg-secondary hover:bg-secondary/90 mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors sm:mt-6 sm:px-6 sm:py-3 sm:text-base'
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                View All Stories
                            </motion.button>
                        </motion.div>
                    </Section>
                )}
            </AnimatePresence>

            {/* Quiz CTA */}
            <Section className='pb-12 sm:pb-16'>
                <motion.div
                    className='mx-auto max-w-2xl text-center'
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5 }}
                >
                    <div className='bg-secondary/5 border-secondary/20 rounded-xl border p-6 sm:p-8'>
                        <FaLightbulb className='text-secondary mx-auto mb-4 h-8 w-8' />
                        <h3 className='mb-2 text-xl font-bold sm:text-2xl'>
                            Want Similar Results?
                        </h3>
                        <p className='text-primary/70 mb-6'>
                            Find your perfect match with our quick quiz and start your own success
                            story.
                        </p>
                        <Link
                            to='/quiz'
                            className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-colors'
                        >
                            <FaLightbulb className='h-4 w-4' />
                            Find Your Perfect Match
                        </Link>
                    </div>
                </motion.div>
            </Section>

            {/* Quick Navigation CTA */}
            <Section className='border-primary/10 bg-primary/5 border-t border-b py-0'>
                <QuickNavigation
                    title='Ready to Write Your Success Story?'
                    description='Join thousands of knowledge workers who transformed their productivity'
                />
            </Section>
        </>
    )
}

export default SuccessStoriesPage
