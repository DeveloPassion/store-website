import type { Product } from '@/types/product'

interface ProductScreenshotsProps {
    product: Product
}

/**
 * @deprecated This component is deprecated and replaced by MediaCarouselSection.
 * Keeping it for backwards compatibility but always returns null.
 * Use MediaCarouselSection with group="main" instead.
 */
const ProductScreenshots: React.FC<ProductScreenshotsProps> = () => {
    return null
}

export default ProductScreenshots
