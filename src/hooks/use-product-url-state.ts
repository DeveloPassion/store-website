import { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router'
import type { Product, ProductVariant, PaymentFrequency } from '@/schemas/product.schema'

// URL parameter names
const VARIANT_PARAM = 'variant'
const FREQUENCY_PARAM = 'frequency'

interface UseProductUrlStateOptions {
    product: Product | undefined
}

interface UseProductUrlStateReturn {
    selectedVariant: ProductVariant | undefined
    setSelectedVariant: (variant: ProductVariant | undefined) => void
    selectedFrequency: PaymentFrequency
    setSelectedFrequency: (frequency: PaymentFrequency) => void
}

/**
 * Hook to manage product variant and payment frequency state with URL synchronization.
 *
 * - Reads initial state from URL search params on mount
 * - Updates URL when selections change
 * - Falls back to product defaults if URL params are invalid
 *
 * URL format: /product/{id}?variant={gumroadVariantId}&frequency={monthly|yearly|biennial}
 */
export function useProductUrlState({
    product
}: UseProductUrlStateOptions): UseProductUrlStateReturn {
    const [searchParams] = useSearchParams()
    const location = useLocation()
    const navigate = useNavigate()

    // Get initial values from URL or fall back to product defaults
    const getInitialVariant = useCallback((): ProductVariant | undefined => {
        if (!product?.variants?.length) return undefined

        const variantParam = searchParams.get(VARIANT_PARAM)
        if (variantParam) {
            // Find variant by gumroadVariantId or name
            const found = product.variants.find(
                (v) =>
                    v.gumroadVariantId === variantParam ||
                    v.name.toLowerCase() === variantParam.toLowerCase()
            )
            if (found) return found
        }

        // Fall back to first variant
        return product.variants[0]
    }, [product, searchParams])

    const getInitialFrequency = useCallback((): PaymentFrequency => {
        if (!product?.isSubscription) return 'monthly'

        const frequencyParam = searchParams.get(FREQUENCY_PARAM)
        if (frequencyParam && isValidFrequency(frequencyParam, product)) {
            return frequencyParam as PaymentFrequency
        }

        // Fall back to product default
        return product.defaultPaymentFrequency || 'monthly'
    }, [product, searchParams])

    // State
    const [selectedVariant, setSelectedVariantState] = useState<ProductVariant | undefined>(
        getInitialVariant
    )
    const [selectedFrequency, setSelectedFrequencyState] =
        useState<PaymentFrequency>(getInitialFrequency)

    // Update URL when selections change (preserving hash)
    const updateUrl = useCallback(
        (variant: ProductVariant | undefined, frequency: PaymentFrequency) => {
            const newParams = new URLSearchParams(searchParams)

            // Update variant param
            if (variant?.gumroadVariantId) {
                newParams.set(VARIANT_PARAM, variant.gumroadVariantId)
            } else if (variant?.name) {
                newParams.set(VARIANT_PARAM, variant.name.toLowerCase().replace(/\s+/g, '-'))
            } else {
                newParams.delete(VARIANT_PARAM)
            }

            // Update frequency param (only for subscriptions)
            if (product?.isSubscription && frequency) {
                newParams.set(FREQUENCY_PARAM, frequency)
            } else {
                newParams.delete(FREQUENCY_PARAM)
            }

            // Only update if params actually changed
            if (newParams.toString() !== searchParams.toString()) {
                // Preserve the hash when updating URL
                const paramsString = newParams.toString()
                const newUrl = `${location.pathname}${paramsString ? `?${paramsString}` : ''}${location.hash}`
                navigate(newUrl, { replace: true })
            }
        },
        [product, searchParams, location.pathname, location.hash, navigate]
    )

    // Wrapped setters that also update URL
    const setSelectedVariant = useCallback(
        (variant: ProductVariant | undefined) => {
            setSelectedVariantState(variant)
            updateUrl(variant, selectedFrequency)
        },
        [selectedFrequency, updateUrl]
    )

    const setSelectedFrequency = useCallback(
        (frequency: PaymentFrequency) => {
            setSelectedFrequencyState(frequency)
            updateUrl(selectedVariant, frequency)
        },
        [selectedVariant, updateUrl]
    )

    // Sync URL on initial mount (to add default params if not present)
    useEffect(() => {
        if (product) {
            const hasVariants = product.variants && product.variants.length > 0
            const isSubscription = product.isSubscription

            // Only update URL if we have something meaningful to add
            if (hasVariants || isSubscription) {
                updateUrl(selectedVariant, selectedFrequency)
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps -- Only run on mount

    return {
        selectedVariant,
        setSelectedVariant,
        selectedFrequency,
        setSelectedFrequency
    }
}

/**
 * Check if a frequency string is valid for the given product
 */
function isValidFrequency(frequency: string, product: Product): boolean {
    const validFrequencies: PaymentFrequency[] = ['monthly', 'yearly', 'biennial']
    if (!validFrequencies.includes(frequency as PaymentFrequency)) {
        return false
    }

    // Check if product supports this frequency
    if (product.paymentFrequencies && product.paymentFrequencies.length > 0) {
        return product.paymentFrequencies.includes(frequency as PaymentFrequency)
    }

    return true
}
