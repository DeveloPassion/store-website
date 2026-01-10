import type { Product, ProductVariant, PaymentFrequency } from '@/schemas/product.schema'

export interface GumroadUrlOptions {
    variantId?: string
    quantity?: number
    paymentFrequency?: PaymentFrequency
    discountCode?: string
    wanted?: boolean
}

/**
 * Build a Gumroad purchase URL with required parameters
 * @param url - Base Gumroad URL
 * @param options - Optional parameters to add to the URL
 * @returns Complete Gumroad URL with parameters
 */
export const buildGumroadUrl = (
    url: string | undefined,
    options: GumroadUrlOptions = {}
): string => {
    if (!url) {
        return '#'
    }

    const { variantId, quantity = 1, paymentFrequency, discountCode, wanted = true } = options

    // Split URL into base and fragment
    const [baseUrl = '', fragment] = url.split('#')

    // Parse existing query parameters
    const urlObj = new URL(baseUrl)
    const params = urlObj.searchParams

    // Add parameters
    if (wanted) {
        params.set('wanted', 'true')
    }

    params.set('quantity', quantity.toString())

    if (variantId) {
        // Using Gumroad's variant parameter
        params.set('variant', variantId)
    }

    if (paymentFrequency && paymentFrequency !== 'one-time') {
        // Using Gumroad's boolean frequency parameters
        // Confirmed working: yearly=true, monthly=true, every_two_years=true
        switch (paymentFrequency) {
            case 'monthly':
                params.set('monthly', 'true')
                break
            case 'yearly':
                params.set('yearly', 'true')
                break
            case 'biennial':
                params.set('every_two_years', 'true')
                break
        }
    }

    if (discountCode) {
        params.set('offer_code', discountCode)
    }

    const finalUrl = urlObj.toString()

    // Reattach fragment if it exists
    return fragment ? `${finalUrl}#${fragment}` : finalUrl
}

/**
 * Helper to build Gumroad URL from product and variant selection
 * @param product - The product
 * @param selectedVariant - Optional selected variant
 * @param selectedFrequency - Optional selected payment frequency
 * @returns Complete Gumroad URL with appropriate parameters
 */
export const buildGumroadUrlFromProduct = (
    product: Product,
    selectedVariant?: ProductVariant,
    selectedFrequency?: PaymentFrequency
): string => {
    const variant = selectedVariant || product.variants?.[0]
    const url = variant?.gumroadUrl || product.gumroadUrl

    return buildGumroadUrl(url, {
        variantId: variant?.gumroadVariantId,
        paymentFrequency:
            selectedFrequency || variant?.paymentFrequency || product.defaultPaymentFrequency,
        quantity: 1,
        wanted: true
    })
}
