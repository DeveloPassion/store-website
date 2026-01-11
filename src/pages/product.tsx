import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import ProductHero from '@/components/products/product-hero'
import ProductPAS from '@/components/products/product-pas'
import ProductFeatures from '@/components/products/product-features'
import ProductScreenshots from '@/components/products/product-screenshots'
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

            // Update og:image - use product coverImage if available, otherwise default
            const ogImage = document.querySelector('meta[property="og:image"]')
            if (ogImage) {
                const imageUrl = product.coverImage
                    ? `https://store.dsebastien.net${product.coverImage}`
                    : 'https://store.dsebastien.net/assets/images/social-card.png'
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
            <div className='mx-auto max-w-7xl px-6 pt-16 sm:px-10 sm:pt-24 md:px-16 lg:px-20'>
                <Breadcrumb />
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
            <ProductScreenshots product={product} />
            <ProductBenefits product={product} />
            <ProductTestimonials product={product} />
            <ProductFAQ product={product} />
            <ProductCTA product={product} />
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
