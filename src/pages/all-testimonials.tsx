import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import TestimonialCardLinked from '@/components/testimonials/testimonial-card-linked'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import QuickNavigation from '@/components/navigation/quick-navigation'
import productsData from '@/data/products.json'
import type { Product } from '@/schemas/product.schema'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'
import { calculateTestimonialStats, type ProductWithTestimonials } from '@/lib/testimonial-stats'
import { updateAllMetaTags } from '@/lib/update-meta-tags'

/**
 * Randomize array using Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = shuffled[i]
        shuffled[i] = shuffled[j]!
        shuffled[j] = temp!
    }
    return shuffled
}

/**
 * Sort testimonials with featured ones first
 */
function sortFeaturedFirst<T extends { featured: boolean }>(array: T[]): T[] {
    return [...array].sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return 0
    })
}

const ProductTestimonialsCarousel: React.FC<{
    productWithTestimonials: ProductWithTestimonials
}> = ({ productWithTestimonials }) => {
    const { product, testimonials } = productWithTestimonials
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    // Auto-rotate carousel
    useEffect(() => {
        if (testimonials.length <= 1) return

        const interval = setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [testimonials.length])

    const goToNext = () => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const goToPrevious = () => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const currentTestimonial = testimonials[currentIndex]

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 200 : -200,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 200 : -200,
            opacity: 0
        })
    }

    return (
        <div id={`testimonials-${product.id}`} className='mb-8 scroll-mt-24'>
            {/* Product Name Header */}
            <h3 className='mb-4 text-xl font-bold md:text-2xl'>{product.name}</h3>

            {/* Carousel */}
            <div className='relative overflow-hidden'>
                <div className='px-10 sm:px-14'>
                    {currentTestimonial && (
                        <AnimatePresence initial={false} custom={direction} mode='wait'>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial='enter'
                                animate='center'
                                exit='exit'
                                transition={{
                                    x: { type: 'spring', stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                            >
                                <TestimonialCardLinked
                                    testimonial={currentTestimonial}
                                    productName={product.name}
                                    productId={product.id}
                                />
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Navigation */}
                {testimonials.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary absolute top-1/2 left-1 -translate-y-1/2 rounded-full border-2 p-1.5 transition-all hover:scale-110 hover:text-white sm:left-2 sm:p-2'
                            aria-label='Previous testimonial'
                        >
                            <FaChevronLeft className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                        </button>
                        <button
                            onClick={goToNext}
                            className='bg-background/80 hover:bg-secondary text-primary/60 border-primary/20 hover:border-secondary absolute top-1/2 right-1 -translate-y-1/2 rounded-full border-2 p-1.5 transition-all hover:scale-110 hover:text-white sm:right-2 sm:p-2'
                            aria-label='Next testimonial'
                        >
                            <FaChevronRight className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                        </button>
                    </>
                )}

                {/* Indicators */}
                {testimonials.length > 1 && (
                    <div className='mt-5 sm:mt-6'>
                        {/* Counter for mobile */}
                        <div className='text-primary/60 text-center text-sm sm:hidden'>
                            {currentIndex + 1} / {testimonials.length}
                        </div>
                        {/* Dot indicators for larger screens */}
                        <div className='scrollbar-hide mx-auto hidden max-w-full justify-center gap-2 overflow-x-auto px-4 sm:flex'>
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setDirection(idx > currentIndex ? 1 : -1)
                                        setCurrentIndex(idx)
                                    }}
                                    className={`h-2 shrink-0 rounded-full transition-all ${
                                        idx === currentIndex
                                            ? 'bg-secondary w-8'
                                            : 'bg-primary/20 hover:bg-primary/40 w-2'
                                    }`}
                                    aria-label={`Go to testimonial ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const ProductTestimonialsGrid: React.FC<{
    productWithTestimonials: ProductWithTestimonials
}> = ({ productWithTestimonials }) => {
    const { product, testimonials } = productWithTestimonials

    return (
        <div id={`testimonials-${product.id}`} className='mb-12 scroll-mt-24'>
            {/* Product Name Header */}
            <h3 className='mb-6 text-2xl font-bold lg:text-3xl'>{product.name}</h3>

            {/* Grid */}
            <div
                className={`grid gap-4 md:gap-4 xl:gap-6 ${
                    testimonials.length === 1
                        ? 'mx-auto max-w-3xl'
                        : testimonials.length === 2
                          ? 'md:grid-cols-2'
                          : 'md:grid-cols-2 lg:grid-cols-3'
                }`}
            >
                {testimonials.map((testimonial, index) => (
                    <TestimonialCardLinked
                        key={testimonial.id}
                        testimonial={testimonial}
                        productName={product.name}
                        productId={product.id}
                        index={index}
                    />
                ))}
            </div>
        </div>
    )
}

const AllTestimonialsPage: React.FC = () => {
    const products = productsData as Product[]
    const [searchParams] = useSearchParams()
    const productIdParam = searchParams.get('product')

    // Find the filtered product if a product ID is provided
    const filteredProduct = useMemo(() => {
        if (!productIdParam) return null
        return products.find((p) => p.id === productIdParam)
    }, [products, productIdParam])

    // Determine the display mode
    const isProductMode = productIdParam !== null
    const isValidProduct = filteredProduct !== undefined && filteredProduct !== null
    const hasProductTestimonials =
        isValidProduct && filteredProduct.testimonials && filteredProduct.testimonials.length > 0

    // Set breadcrumbs based on mode
    useSetBreadcrumbs(
        isProductMode && isValidProduct
            ? [
                  { label: 'Home', href: '/' },
                  { label: 'Testimonials', href: '/testimonials' },
                  { label: filteredProduct.name }
              ]
            : [{ label: 'Home', href: '/' }, { label: 'All Testimonials' }]
    )

    // Filter products with testimonials and sort (featured first within each product, randomize product order)
    const productsWithTestimonials = useMemo(() => {
        const productsWithTestimonialsData = products
            .filter((product) => product.testimonials && product.testimonials.length > 0)
            .map((product) => ({
                product,
                testimonials: sortFeaturedFirst(product.testimonials || [])
            }))

        return shuffleArray(productsWithTestimonialsData)
    }, [products])

    // Get testimonials for a specific product (sorted with featured first)
    const singleProductTestimonials = useMemo(() => {
        if (!filteredProduct || !filteredProduct.testimonials) return []
        return sortFeaturedFirst(filteredProduct.testimonials)
    }, [filteredProduct])

    // Calculate stats based on mode
    const stats = useMemo(() => {
        if (isProductMode && isValidProduct && hasProductTestimonials) {
            return {
                totalTestimonials: singleProductTestimonials.length,
                averageRating: 5.0 // All testimonials are 5-star
            }
        }
        return calculateTestimonialStats(productsWithTestimonials)
    }, [
        isProductMode,
        isValidProduct,
        hasProductTestimonials,
        singleProductTestimonials,
        productsWithTestimonials
    ])
    const { totalTestimonials, averageRating } = stats

    // Update meta tags based on mode
    useEffect(() => {
        if (isProductMode && isValidProduct) {
            updateAllMetaTags({
                title: `${filteredProduct.name} Testimonials - Knowledge Forge`,
                description: `Read ${singleProductTestimonials.length} testimonials for ${filteredProduct.name}. See what customers are saying about their experience.`,
                url: `https://store.dsebastien.net/testimonials?product=${filteredProduct.id}`
            })
        } else {
            updateAllMetaTags({
                title: 'All Testimonials - Knowledge Forge',
                description: `Read ${totalTestimonials} authentic testimonials from satisfied customers across all our products. See what people are saying about their experience.`,
                url: 'https://store.dsebastien.net/testimonials'
            })
        }
    }, [
        isProductMode,
        isValidProduct,
        filteredProduct,
        singleProductTestimonials.length,
        totalTestimonials
    ])

    // Invalid product ID
    if (isProductMode && !isValidProduct) {
        return (
            <Section className='pt-16 pb-24 sm:pt-24'>
                <div className='w-full text-center'>
                    <Breadcrumb className='mb-6 flex justify-center' />
                    <div className='mb-4 text-6xl'>🔍</div>
                    <h1 className='mb-4 text-3xl font-bold'>Product Not Found</h1>
                    <p className='text-primary/60 mb-8'>
                        The product you're looking for doesn't exist or has been removed.
                    </p>
                    <QuickNavigation
                        title='Explore the products'
                        description='Discover our amazing products and their testimonials'
                    />
                </div>
            </Section>
        )
    }

    // Valid product but no testimonials
    if (isProductMode && isValidProduct && !hasProductTestimonials) {
        return (
            <Section className='pt-16 pb-24 sm:pt-24'>
                <div className='w-full text-center'>
                    <Breadcrumb className='mb-6 flex justify-center' />
                    <div className='mb-4 text-6xl'>💬</div>
                    <h1 className='mb-4 text-3xl font-bold'>No Testimonials Yet</h1>
                    <p className='text-primary/60 mb-8'>
                        There are no testimonials for {filteredProduct.name} yet. Be the first to
                        share your experience!
                    </p>
                    <QuickNavigation
                        title='Explore the products'
                        description='Discover our other products with customer testimonials'
                    />
                </div>
            </Section>
        )
    }

    // No testimonials at all (across all products)
    if (productsWithTestimonials.length === 0) {
        return (
            <Section className='py-16'>
                <div className='text-center'>
                    <h1 className='mb-4 text-3xl font-bold'>No Testimonials Available</h1>
                    <p className='text-primary/60'>
                        There are currently no testimonials to display.
                    </p>
                </div>
            </Section>
        )
    }

    // Single product mode with testimonials
    if (isProductMode && isValidProduct && hasProductTestimonials) {
        return (
            <>
                {/* Header Section */}
                <Section className='pt-16 pb-6 sm:pt-24 sm:pb-8'>
                    <div className='mx-auto max-w-7xl space-y-4 text-center'>
                        <Breadcrumb className='mb-6 flex justify-center' />

                        {/* Icon */}
                        <div className='mb-6 flex justify-center'>
                            <div className='from-secondary to-secondary/80 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-lg'>
                                <FaStar className='h-10 w-10 text-white' />
                            </div>
                        </div>

                        <h1 className='mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
                            {filteredProduct.name} Testimonials
                        </h1>
                        <p className='text-primary/70 mx-auto mb-6 max-w-2xl text-lg sm:text-xl'>
                            See what customers are saying about {filteredProduct.name}.
                        </p>

                        {/* Stats */}
                        <div className='mx-auto grid max-w-2xl gap-4 sm:grid-cols-2'>
                            <div className='bg-primary/5 rounded-lg p-4 text-center'>
                                <div className='text-secondary text-3xl font-bold'>
                                    {totalTestimonials}
                                </div>
                                <div className='text-primary/60 text-sm'>Total Testimonials</div>
                            </div>
                            <div className='bg-primary/5 rounded-lg p-4 text-center'>
                                <div className='flex items-center justify-center gap-2 text-3xl font-bold text-yellow-400'>
                                    {averageRating.toFixed(1)}
                                    <FaStar className='h-6 w-6' />
                                </div>
                                <div className='text-primary/60 text-sm'>Average Rating</div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Product Card */}
                <Section className='border-primary/10 border-t border-b py-8'>
                    <div className='mx-auto max-w-md'>
                        <ProductCardEcommerce product={filteredProduct} />
                    </div>
                </Section>

                {/* Testimonials Section */}
                <Section className='py-8 sm:py-12'>
                    <div className='w-full'>
                        <h2 className='mb-8 text-center text-2xl font-bold lg:text-3xl'>
                            All Customer Reviews
                        </h2>

                        {/* Grid */}
                        <div
                            className={`grid gap-4 md:gap-4 xl:gap-6 ${
                                singleProductTestimonials.length === 1
                                    ? 'mx-auto max-w-3xl'
                                    : singleProductTestimonials.length === 2
                                      ? 'md:grid-cols-2'
                                      : 'md:grid-cols-2 lg:grid-cols-3'
                            }`}
                        >
                            {singleProductTestimonials.map((testimonial, index) => (
                                <TestimonialCardLinked
                                    key={testimonial.id}
                                    testimonial={testimonial}
                                    productName={filteredProduct.name}
                                    productId={filteredProduct.id}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Quick Navigation */}
                <Section className='border-primary/10 border-t py-0'>
                    <QuickNavigation
                        title='Explore More Products'
                        description='Discover other products with amazing testimonials'
                    />
                </Section>
            </>
        )
    }

    // Default: All testimonials from all products
    return (
        <>
            {/* Header Section */}
            <Section className='pt-16 pb-6 sm:pt-24 sm:pb-8'>
                <div className='mx-auto max-w-7xl space-y-4 text-center'>
                    <Breadcrumb className='mb-6 flex justify-center' />

                    {/* Icon */}
                    <div className='mb-6 flex justify-center'>
                        <div className='from-secondary to-secondary/80 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-lg'>
                            <FaStar className='h-10 w-10 text-white' />
                        </div>
                    </div>

                    <h1 className='mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
                        Customer Testimonials
                    </h1>
                    <p className='text-primary/70 mx-auto mb-6 max-w-2xl text-lg sm:text-xl'>
                        Discover what our customers are saying about their experience with our
                        products.
                    </p>

                    {/* Stats */}
                    <div className='mx-auto grid max-w-2xl gap-4 sm:grid-cols-2'>
                        <div className='bg-primary/5 rounded-lg p-4 text-center'>
                            <div className='text-secondary text-3xl font-bold'>
                                {totalTestimonials}
                            </div>
                            <div className='text-primary/60 text-sm'>Total Testimonials</div>
                        </div>
                        <div className='bg-primary/5 rounded-lg p-4 text-center'>
                            <div className='flex items-center justify-center gap-2 text-3xl font-bold text-yellow-400'>
                                {averageRating.toFixed(1)}
                                <FaStar className='h-6 w-6' />
                            </div>
                            <div className='text-primary/60 text-sm'>Average Rating</div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Quick Navigation */}
            <Section className='border-primary/10 border-t border-b py-0'>
                <QuickNavigation
                    title='Explore the products'
                    description='Discover the products behind these amazing testimonials'
                />
            </Section>

            {/* Testimonials Section */}
            <Section className='py-8 sm:py-12'>
                <div className='w-full'>
                    {/* Mobile View (Carousels) */}
                    <div className='md:hidden'>
                        {productsWithTestimonials.map((pwt) => (
                            <ProductTestimonialsCarousel
                                key={pwt.product.id}
                                productWithTestimonials={pwt}
                            />
                        ))}
                    </div>

                    {/* Desktop View (Grids) */}
                    <div className='hidden md:block'>
                        {productsWithTestimonials.map((pwt) => (
                            <ProductTestimonialsGrid
                                key={pwt.product.id}
                                productWithTestimonials={pwt}
                            />
                        ))}
                    </div>
                </div>
            </Section>
        </>
    )
}

export default AllTestimonialsPage
