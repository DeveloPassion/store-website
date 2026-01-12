import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductHero from '@/components/products/product-hero'
import ProductPAS from '@/components/products/product-pas'
import ProductFeatures from '@/components/products/product-features'
import MediaCarouselSection from '@/components/products/media-carousel-section'
import ProductBenefits from '@/components/products/product-benefits'
import ProductTestimonials from '@/components/products/product-testimonials'
import ProductFAQ from '@/components/products/product-faq'
import ProductCTA from '@/components/products/product-cta'
import StickyBuyButton from '@/components/products/sticky-buy-button'
import productsData from '@/data/products.json'
import type { Product, ProductVariant } from '@/types/product'
import type { PaymentFrequency } from '@/schemas/product.schema'
import { useSetBreadcrumbs } from '@/hooks/use-set-breadcrumbs'

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
            document.title = product.metaTitle || `${product.name} - Knowledge Forge`

            // Update meta description
            if (product.metaDescription) {
                const metaDescription = document.querySelector('meta[name="description"]')
                if (metaDescription) {
                    metaDescription.setAttribute('content', product.metaDescription)
                }
            }

            // Update og:image - use cover image if available, otherwise default social card
            const ogImage = document.querySelector('meta[property="og:image"]')
            if (ogImage) {
                let imageUrl = 'https://store.dsebastien.net/assets/images/social-card.png'

                // Find cover images and use the primary one (lowest order = highest priority)
                const coverImage = product.media
                    ?.filter((item) => item.type === 'image' && item.group === 'cover')
                    .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))[0]

                if (coverImage) {
                    // Convert relative URLs to absolute
                    imageUrl = coverImage.url.startsWith('http')
                        ? coverImage.url
                        : `https://store.dsebastien.net${coverImage.url}`
                }

                ogImage.setAttribute('content', imageUrl)
            }

            // Update og:title
            const ogTitle = document.querySelector('meta[property="og:title"]')
            if (ogTitle) {
                ogTitle.setAttribute(
                    'content',
                    product.metaTitle || `${product.name} - Knowledge Forge`
                )
            }

            // Update og:description
            const ogDescription = document.querySelector('meta[property="og:description"]')
            if (ogDescription && product.metaDescription) {
                ogDescription.setAttribute('content', product.metaDescription)
            }

            // Update og:url
            const ogUrl = document.querySelector('meta[property="og:url"]')
            if (ogUrl) {
                ogUrl.setAttribute('content', `https://store.dsebastien.net/products/${product.id}`)
            }
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
            <ProductFeatures product={product} />
            <MediaCarouselSection
                product={product}
                group='main'
                heading='See It In Action'
                description={`Explore screenshots and videos to see exactly what you'll get with ${product.name}`}
            />
            <ProductBenefits product={product} />
            <MediaCarouselSection
                product={product}
                group='secondary'
                heading='Dive Deeper'
                description='Take a closer look at the details and features'
            />
            <ProductTestimonials product={product} />
            <ProductFAQ product={product} />
            <ProductCTA product={product} />
            <MediaCarouselSection
                product={product}
                group='bonus'
                heading='Bonus Content'
                description='Additional resources and insights'
            />
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
