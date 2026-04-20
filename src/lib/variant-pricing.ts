import type { PaymentFrequency, ProductVariant } from '@/schemas/product.schema'

export const FREQUENCY_ORDER: PaymentFrequency[] = [
    'monthly',
    'quarterly',
    'yearly',
    'biennial',
    'one-time'
]

const FREQUENCY_LABEL: Record<PaymentFrequency, string> = {
    'monthly': '/month',
    'quarterly': '/quarter',
    'yearly': '/year',
    'biennial': '/2 years',
    'one-time': ''
}

export const getVariantPriceForFrequency = (
    variant: ProductVariant,
    frequency: PaymentFrequency
): number | null => {
    if (!variant.prices) return null
    switch (frequency) {
        case 'monthly':
            return variant.prices.monthly
        case 'quarterly':
            return variant.prices.quarterly
        case 'yearly':
            return variant.prices.yearly
        case 'biennial':
            return variant.prices.biennial
        case 'one-time':
            return variant.prices.oneTime
    }
}

export const formatFrequencyPrice = (
    variant: ProductVariant,
    frequency: PaymentFrequency
): string => {
    const price = getVariantPriceForFrequency(variant, frequency)
    if (price === null || price === undefined) return variant.priceDisplay
    return `€${price.toFixed(2)}${FREQUENCY_LABEL[frequency]}`
}

/**
 * Frequencies actually offered by a variant based on non-null entries in `prices`.
 * Falls back to the product-level list when the variant has no per-frequency pricing.
 */
export const getVariantFrequencies = (
    variant: ProductVariant,
    productFrequencies: PaymentFrequency[] | null | undefined
): PaymentFrequency[] => {
    const fallback = productFrequencies ?? []
    if (!variant.prices) return fallback

    const available = FREQUENCY_ORDER.filter((freq) => {
        if (!fallback.includes(freq)) return false
        return getVariantPriceForFrequency(variant, freq) !== null
    })

    return available.length > 0 ? available : fallback
}
