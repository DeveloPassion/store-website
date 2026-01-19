import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductHero from '@/components/products/product-hero'
import ProductPAS from '@/components/products/product-pas'
import ProductOriginStory from '@/components/products/product-origin-story'
import ProductCreatorJourney from '@/components/products/product-creator-journey'
import ProductFeatures from '@/components/products/product-features'
import ProductCourseContent from '@/components/products/product-course-content'
import ProductMethodology from '@/components/products/product-methodology'
import MediaCarouselSection from '@/components/products/media-carousel-section'
import ProductBenefits from '@/components/products/product-benefits'
import ProductTransformationArc from '@/components/products/product-transformation-arc'
import ProductTimeline from '@/components/products/product-timeline'
import ProductSuccessStories from '@/components/products/product-success-stories'
import ProductTestimonials from '@/components/products/product-testimonials'
import ProductFAQ from '@/components/products/product-faq'
import ProductVision from '@/components/products/product-vision'
import ProductCTA from '@/components/products/product-cta'
import ProductRelated from '@/components/products/product-related'
import StickyBuyButton from '@/components/products/sticky-buy-button'
import HowItWorksSection from '@/components/products/how-it-works-section'
import productsData from '@/data/products.json'
import type { Product, ProductVariant } from '@/schemas/product.schema'
import type { PaymentFrequency } from '@/schemas/product.schema'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'
import { updateAllMetaTags } from '@/lib/update-meta-tags'

const ProductPage: React.FC = () => {
    const { productSlug } = useParams<{ productSlug: string }>()
    const navigate = useNavigate()
    const heroBuyButtonRef = useRef<HTMLAnchorElement>(null)

    // Find product by slug (id field in JSON)
    const product = (productsData as Product[]).find((p) => p.id === productSlug)

    // Lifted state for variant and payment frequency selection (shared with ProductHero and StickyBuyButton)
    // Initialize with product data - state will be properly set when product loads
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
        () => product?.variants?.[0]
    )
    const [selectedFrequency, setSelectedFrequency] = useState<PaymentFrequency>(
        () => product?.defaultPaymentFrequency || 'monthly'
    )

    // Set breadcrumbs
    useSetBreadcrumbs(
        product
            ? [
                  { label: 'Home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: product.name }
              ]
            : []
    )

    // Update document title and meta tags
    useEffect(() => {
        if (product) {
            const title = product.salesCopy?.metaTitle || `${product.name} - Knowledge Forge`
            const description =
                product.salesCopy?.metaDescription ||
                product.salesCopy?.description ||
                `${product.name} - Available at Knowledge Forge`
            const url = `https://store.dsebastien.net/product/${product.id}`

            // Find cover image - use the primary one (lowest order = highest priority)
            const coverImage = product.media
                ?.filter((item) => item.type === 'image' && item.group === 'cover')
                .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))[0]

            // Convert relative URLs to absolute
            const image = coverImage
                ? coverImage.url.startsWith('http')
                    ? coverImage.url
                    : `https://store.dsebastien.net${coverImage.url}`
                : undefined

            // Update all meta tags (title, description, OG, Twitter, canonical)
            updateAllMetaTags({ title, description, url, image })
        } else {
            document.title = 'Product Not Found - Knowledge Forge'
        }
    }, [product])

    // Handle 404
    if (!product) {
        return (
            <div className='container mx-auto flex min-h-screen items-center justify-center px-6'>
                <div className='text-center'>
                    <h1 className='mb-4 text-6xl font-bold'>404</h1>
                    <h2 className='mb-4 text-2xl font-semibold'>Product Not Found</h2>
                    <p className='text-primary/70 mb-8'>
                        The product you're looking for doesn't exist or has been moved.
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        className='bg-secondary hover:bg-secondary/90 rounded-lg px-6 py-3 font-semibold text-white transition-colors'
                    >
                        View All Products
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='mx-auto max-w-[1800px] px-6 pt-8 sm:px-10 sm:pt-12 md:px-16 md:pt-16 lg:px-20 xl:px-32 2xl:max-w-[2200px]'>
                <Breadcrumb className='mb-6 flex justify-center' />
            </div>
            <ProductHero
                product={product}
                buyButtonRef={heroBuyButtonRef}
                selectedVariant={selectedVariant}
                setSelectedVariant={setSelectedVariant}
                selectedFrequency={selectedFrequency}
                setSelectedFrequency={setSelectedFrequency}
            />
            <ProductPAS product={product} />
            {/* Origin Story & Creator Journey: Build emotional connection and credibility after PAS */}
            <ProductOriginStory product={product} />
            <ProductCreatorJourney product={product} />
            <HowItWorksSection product={product} />
            <ProductFeatures product={product} />
            {/* Course Content: For course products, show module structure after features */}
            <ProductCourseContent product={product} />
            {/* Methodology: Explain HOW it works after showing WHAT's included */}
            <ProductMethodology product={product} />
            <MediaCarouselSection
                product={product}
                group='main'
                heading='See It In Action'
                description={`Explore screenshots and videos to see exactly what you'll get with ${product.name}`}
                includeAllVideos={true}
            />
            <ProductBenefits product={product} />
            {/* Transformation Arc & Timeline: Visualize the journey after benefits */}
            <ProductTransformationArc product={product} />
            <ProductTimeline product={product} />
            <MediaCarouselSection
                product={product}
                group='secondary'
                heading='Dive Deeper'
                description={
                    product.landingPageUrl ? (
                        <>
                            Take a closer look at the details and features.{' '}
                            <a
                                href={product.landingPageUrl}
                                target='_blank'
                                rel='noopener'
                                className='text-secondary hover:text-secondary-text underline'
                            >
                                Learn more on the product page
                            </a>
                            .
                        </>
                    ) : (
                        'Take a closer look at the details and features'
                    )
                }
            />
            {/* Success Stories & Testimonials: Social proof cluster */}
            <ProductSuccessStories product={product} />
            <ProductTestimonials product={product} />
            <ProductFAQ product={product} />
            {/* Vision: Reinforce mission alignment before final CTA */}
            <ProductVision product={product} />
            <ProductCTA product={product} />
            <MediaCarouselSection
                product={product}
                group='bonus'
                heading='Bonus Content'
                description='Additional resources and insights'
            />
            <ProductRelated product={product} />
            <StickyBuyButton
                product={product}
                heroButtonRef={heroBuyButtonRef}
                selectedVariant={selectedVariant}
                selectedFrequency={selectedFrequency}
            />
        </>
    )
}

export default ProductPage
