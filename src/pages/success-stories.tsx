import { useMemo, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { FaTrophy, FaStar, FaQuoteLeft, FaArrowRight, FaFilter, FaUser } from 'react-icons/fa'
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

    useSetBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Success Stories' }])

    useEffect(() => {
        updateAllMetaTags({
            title: 'Success Stories - Knowledge Forge',
            description:
                'Real stories from real customers. See how knowledge workers transformed their productivity and workflows.',
            url: 'https://store.dsebastien.net/success-stories'
        })
    }, [])

    // Collect all testimonials with product info
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

        // Sort by featured first, then by product priority
        return testimonials.sort((a, b) => {
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            return (b.product.priority || 0) - (a.product.priority || 0)
        })
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
                <div className='mx-auto max-w-[1400px] text-center'>
                    <Breadcrumb className='mb-6 flex justify-center' />
                    <h1 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'>
                        <FaTrophy className='text-secondary mr-3 inline-block' />
                        Success Stories
                    </h1>
                    <p className='text-primary/70 mx-auto max-w-2xl text-lg'>
                        Real stories from real customers who transformed their productivity and
                        workflows.
                    </p>

                    {/* Stats */}
                    <div className='mt-8 grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-12'>
                        <div className='text-center'>
                            <div className='text-secondary text-2xl font-bold sm:text-4xl'>
                                {formattedCustomers}
                            </div>
                            <div className='text-primary/60 text-xs sm:text-sm'>
                                Happy Customers
                            </div>
                        </div>
                        <div className='text-center'>
                            <div className='flex items-center justify-center gap-1 text-2xl font-bold text-yellow-400 sm:text-4xl'>
                                {averageRating.toFixed(1)}{' '}
                                <FaStar className='inline h-4 w-4 sm:h-6 sm:w-6' />
                            </div>
                            <div className='text-primary/60 text-xs sm:text-sm'>Average Rating</div>
                        </div>
                        <Link
                            to='/testimonials'
                            className='group text-center transition-transform hover:scale-105'
                        >
                            <div className='text-2xl font-bold text-green-400 transition-colors group-hover:text-green-300 sm:text-4xl'>
                                {totalTestimonials}
                            </div>
                            <div className='text-primary/60 group-hover:text-primary text-xs transition-colors sm:text-sm'>
                                Testimonials
                            </div>
                        </Link>
                    </div>
                </div>
            </Section>

            {/* Filter */}
            {categoriesWithTestimonials.length > 1 && (
                <Section className='pb-6 sm:pb-8'>
                    <div className='mx-auto max-w-4xl'>
                        <div className='flex flex-wrap items-center justify-center gap-1.5 sm:gap-2'>
                            <FaFilter className='text-primary/40 h-3 w-3 sm:h-4 sm:w-4' />
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`rounded-full px-3 py-1.5 text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                                    selectedCategory === 'all'
                                        ? 'bg-secondary text-white'
                                        : 'bg-primary/10 hover:bg-primary/20'
                                }`}
                            >
                                All Stories
                            </button>
                            {categoriesWithTestimonials.slice(0, 6).map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`rounded-full px-3 py-1.5 text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                                        selectedCategory === cat.id
                                            ? 'bg-secondary text-white'
                                            : 'bg-primary/10 hover:bg-primary/20'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>
            )}

            {/* Featured Testimonials */}
            {featuredTestimonials.length > 0 && (
                <Section className='pb-8 sm:pb-12'>
                    <div className='mx-auto max-w-7xl'>
                        <h2 className='mb-6 text-center text-lg font-bold sm:mb-8 sm:text-xl md:text-2xl'>
                            Featured Stories
                        </h2>
                        <div className='grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3'>
                            {featuredTestimonials.map((testimonial, index) => (
                                <motion.div
                                    key={`${testimonial.product.id}-${testimonial.author}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
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
                                                            getCoverImage(testimonial.product.media)
                                                                ?.url
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
                        </div>
                    </div>
                </Section>
            )}

            {/* Regular Testimonials Grid */}
            {regularTestimonials.length > 0 && (
                <Section className='pb-12 sm:pb-16'>
                    <div className='mx-auto max-w-7xl'>
                        <h2 className='mb-6 text-center text-lg font-bold sm:mb-8 sm:text-xl md:text-2xl'>
                            More Success Stories
                        </h2>
                        <div className='grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4'>
                            {regularTestimonials.map((testimonial, index) => (
                                <motion.div
                                    key={`${testimonial.product.id}-${testimonial.author}-regular-${index}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className='border-primary/10 rounded-lg border p-3 sm:rounded-xl sm:p-4'
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
                        </div>

                        {filteredTestimonials.length >
                            featuredTestimonials.length + regularTestimonials.length && (
                            <div className='mt-6 text-center sm:mt-8'>
                                <Link
                                    to='/testimonials'
                                    className='text-secondary hover:text-secondary/80 inline-flex items-center gap-2 text-sm transition-colors sm:text-base'
                                >
                                    View All {allTestimonials.length} Testimonials
                                    <FaArrowRight className='h-3 w-3 sm:h-4 sm:w-4' />
                                </Link>
                            </div>
                        )}
                    </div>
                </Section>
            )}

            {/* Empty State */}
            {filteredTestimonials.length === 0 && (
                <Section className='pb-12 sm:pb-16'>
                    <div className='text-center'>
                        <div className='text-4xl sm:text-5xl'>🔍</div>
                        <h3 className='mt-3 text-lg font-semibold sm:mt-4 sm:text-xl'>
                            No stories in this category yet
                        </h3>
                        <p className='text-primary/60 mt-2 text-sm sm:text-base'>
                            Try selecting a different category or view all stories.
                        </p>
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className='bg-secondary hover:bg-secondary/90 mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors sm:mt-6 sm:px-6 sm:py-3 sm:text-base'
                        >
                            View All Stories
                        </button>
                    </div>
                </Section>
            )}

            {/* CTA Section */}
            <Section className='bg-secondary/5 py-10 sm:py-16'>
                <div className='mx-auto max-w-2xl text-center'>
                    <h2 className='mb-3 text-xl font-bold sm:mb-4 sm:text-2xl md:text-3xl'>
                        Ready to Write Your Success Story?
                    </h2>
                    <p className='text-primary/70 mb-6 text-sm sm:mb-8 sm:text-base'>
                        Join thousands of knowledge workers who have transformed their productivity
                        with our courses, templates, and tools.
                    </p>
                    <Link
                        to='/products'
                        className='bg-secondary hover:bg-secondary/90 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors sm:px-8 sm:py-4 sm:text-lg'
                    >
                        Browse All Products
                        <FaArrowRight className='h-4 w-4 sm:h-5 sm:w-5' />
                    </Link>
                </div>
            </Section>
        </>
    )
}

export default SuccessStoriesPage
