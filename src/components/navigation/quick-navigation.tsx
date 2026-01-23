import { Link } from 'react-router'
import { motion } from 'framer-motion'

interface QuickNavigationProps {
    title?: string
    description?: string
    animated?: boolean
}

/**
 * Quick navigation links to main product collection pages
 * Reusable across empty states and info pages
 */
const QuickNavigation: React.FC<QuickNavigationProps> = ({
    title = 'Explore Our Collections',
    description = 'Discover the perfect products for your needs',
    animated = true
}) => {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    }

    const Container = animated ? motion.div : 'div'
    const ItemWrapper = animated ? motion.div : 'div'

    return (
        <Container
            {...(animated
                ? {
                      initial: 'hidden',
                      whileInView: 'visible',
                      viewport: { once: true },
                      variants: containerVariants
                  }
                : {})}
            className='py-8 text-center sm:py-12'
        >
            <h3 className='mb-3 text-2xl font-semibold sm:text-3xl'>{title}</h3>
            <p className='text-primary/60 mb-8 text-base sm:text-lg'>{description}</p>

            {/* Quick Links Grid */}
            <div className='mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 md:grid-cols-5'>
                <ItemWrapper {...(animated ? { variants: itemVariants } : {})}>
                    <Link
                        to='/quiz'
                        className='bg-secondary hover:bg-secondary/90 block rounded-lg px-6 py-4 font-semibold whitespace-nowrap text-white transition-all hover:scale-105'
                    >
                        💡 Take Quiz
                    </Link>
                </ItemWrapper>
                <ItemWrapper {...(animated ? { variants: itemVariants } : {})}>
                    <Link
                        to='/featured'
                        className='border-primary/20 hover:border-secondary/50 hover:bg-primary/5 block rounded-lg border bg-transparent px-6 py-4 font-semibold whitespace-nowrap transition-all hover:scale-105'
                    >
                        ⭐ Featured
                    </Link>
                </ItemWrapper>
                <ItemWrapper {...(animated ? { variants: itemVariants } : {})}>
                    <Link
                        to='/best-value'
                        className='border-primary/20 hover:border-secondary/50 hover:bg-primary/5 block rounded-lg border bg-transparent px-6 py-4 font-semibold whitespace-nowrap transition-all hover:scale-105'
                    >
                        💎 Best Value
                    </Link>
                </ItemWrapper>
                <ItemWrapper {...(animated ? { variants: itemVariants } : {})}>
                    <Link
                        to='/best-sellers'
                        className='border-primary/20 hover:border-secondary/50 hover:bg-primary/5 block rounded-lg border bg-transparent px-6 py-4 font-semibold whitespace-nowrap transition-all hover:scale-105'
                    >
                        🔥 Best Sellers
                    </Link>
                </ItemWrapper>
                <ItemWrapper {...(animated ? { variants: itemVariants } : {})}>
                    <Link
                        to='/products'
                        className='border-primary/20 hover:border-secondary/50 hover:bg-primary/5 block rounded-lg border bg-transparent px-6 py-4 font-semibold whitespace-nowrap transition-all hover:scale-105'
                    >
                        🛍️ All Products
                    </Link>
                </ItemWrapper>
            </div>
        </Container>
    )
}

export default QuickNavigation
