import type { Variants } from 'framer-motion'

/**
 * Standard container variants for staggered child animations
 * Used across product detail sections (features, benefits, PAS, FAQ)
 */
export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

/**
 * Stagger variant with customizable delay
 */
export function createContainerVariants(staggerDelay = 0.1): Variants {
    return {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay
            }
        }
    }
}

/**
 * Standard item variants for fade-in-up animation
 * Used for individual items within staggered containers
 */
export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

/**
 * Header variants for section headers
 * Used in product features, benefits, PAS sections
 */
export const headerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

/**
 * Custom item variants with configurable y offset
 */
export function createItemVariants(yOffset = 20): Variants {
    return {
        hidden: { opacity: 0, y: yOffset },
        visible: { opacity: 1, y: 0 }
    }
}
