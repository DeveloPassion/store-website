import { motion } from 'framer-motion'
import Section from '@/components/ui/section'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'
import productsData from '@/data/products.json'
import type { Product } from '@/schemas/product.schema'

interface ProductRelatedProps {
    product: Product
}

const ProductRelated: React.FC<ProductRelatedProps> = ({ product }) => {
    // Get related products based on crossSellIds
    const allProducts = productsData as Product[]
    const relatedProducts = product.crossSellIds
        .map((id) => allProducts.find((p) => p.id === id))
        .filter((p): p is Product => p !== undefined)

    // Don't render if no related products
    if (relatedProducts.length === 0) {
        return null
    }

    return (
        <Section
            id='related-products'
            className='border-primary/10 from-background to-primary/5 scroll-mt-16 border-t bg-gradient-to-b'
        >
            <div className='mx-auto max-w-7xl'>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='mb-8 text-center md:mb-10'
                >
                    <h2 className='mb-2 text-2xl font-bold sm:text-3xl md:mb-3 md:text-4xl lg:text-5xl'>
                        You Might Also Like
                    </h2>
                    <p className='text-primary/70 mx-auto max-w-2xl text-base sm:text-lg md:text-xl'>
                        Explore these complementary products to enhance your experience
                    </p>
                </motion.div>

                {/* Product Grid */}
                <div
                    className={`grid gap-6 ${
                        relatedProducts.length === 1
                            ? 'mx-auto max-w-sm'
                            : relatedProducts.length === 2
                              ? 'sm:grid-cols-2 lg:mx-auto lg:max-w-4xl'
                              : relatedProducts.length === 3
                                ? 'sm:grid-cols-2 lg:grid-cols-3'
                                : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }`}
                >
                    {relatedProducts.map((relatedProduct, index) => (
                        <motion.div
                            key={relatedProduct.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                        >
                            <ProductCardEcommerce product={relatedProduct} compactBadges />
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    )
}

export default ProductRelated
