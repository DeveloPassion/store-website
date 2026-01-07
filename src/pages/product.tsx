import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import ProductHero from '@/components/products/product-hero'
import ProductPAS from '@/components/products/product-pas'
import ProductFeatures from '@/components/products/product-features'
import ProductScreenshots from '@/components/products/product-screenshots'
import ProductBenefits from '@/components/products/product-benefits'
import ProductTestimonials from '@/components/products/product-testimonials'
import ProductFAQ from '@/components/products/product-faq'
import ProductCTA from '@/components/products/product-cta'
import productsData from '@/data/products.json'
import type { Product } from '@/types/product'

const ProductPage: React.FC = () => {
    const { productSlug } = useParams<{ productSlug: string }>()
    const navigate = useNavigate()

    // Find product by slug (id field in JSON)
    const product = (productsData as Product[]).find((p) => p.id === productSlug)

    // Update document title
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

    // Don't show archived products
    if (product.status === 'archived') {
        return (
            <div className='container mx-auto flex min-h-screen items-center justify-center px-6'>
                <div className='text-center'>
                    <h1 className='mb-4 text-4xl font-bold'>Product Unavailable</h1>
                    <p className='text-primary/70 mb-8'>
                        This product is no longer available for purchase.
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        className='bg-secondary hover:bg-secondary/90 rounded-lg px-6 py-3 font-semibold text-white transition-colors'
                    >
                        View Available Products
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <ProductHero product={product} />
            <ProductPAS product={product} />
            <ProductFeatures product={product} />
            <ProductScreenshots product={product} />
            <ProductBenefits product={product} />
            <ProductTestimonials product={product} />
            <ProductFAQ product={product} />
            <ProductCTA product={product} />
        </>
    )
}

export default ProductPage
