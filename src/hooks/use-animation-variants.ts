import { useMemo } from 'react'
import type { Variants } from 'framer-motion'
import {
    containerVariants as defaultContainer,
    itemVariants as defaultItem,
    headerVariants as defaultHeader,
    createContainerVariants,
    createItemVariants
} from '@/lib/animation-variants'

interface AnimationVariantsOptions {
    staggerDelay?: number
    itemYOffset?: number
}

interface AnimationVariantsResult {
    containerVariants: Variants
    itemVariants: Variants
    headerVariants: Variants
}

/**
 * Hook to get animation variants with optional customization
 * Memoizes variants to prevent recreation on every render
 *
 * @param options - Optional customization for animation variants
 * @param options.staggerDelay - Custom delay between staggered children (default: 0.1)
 * @param options.itemYOffset - Custom Y offset for item animations (default: 20)
 * @returns Object containing containerVariants, itemVariants, and headerVariants
 *
 * @example
 * // Use default variants
 * const { containerVariants, itemVariants } = useAnimationVariants()
 *
 * @example
 * // Use custom stagger delay
 * const { containerVariants } = useAnimationVariants({ staggerDelay: 0.2 })
 *
 * @example
 * // Use custom item offset
 * const { itemVariants } = useAnimationVariants({ itemYOffset: 30 })
 */
export function useAnimationVariants(options?: AnimationVariantsOptions): AnimationVariantsResult {
    const staggerDelay = options?.staggerDelay
    const itemYOffset = options?.itemYOffset

    return useMemo(() => {
        const hasStaggerDelay = staggerDelay !== undefined
        const hasItemYOffset = itemYOffset !== undefined

        if (!hasStaggerDelay && !hasItemYOffset) {
            return {
                containerVariants: defaultContainer,
                itemVariants: defaultItem,
                headerVariants: defaultHeader
            }
        }

        return {
            containerVariants: hasStaggerDelay
                ? createContainerVariants(staggerDelay!)
                : defaultContainer,
            itemVariants: hasItemYOffset ? createItemVariants(itemYOffset!) : defaultItem,
            headerVariants: defaultHeader
        }
    }, [staggerDelay, itemYOffset])
}
