/**
 * Gumroad API types
 * Based on https://gumroad.com/api
 */

/**
 * Configuration for the Gumroad API client
 */
export interface GumroadApiConfig {
    accessToken: string
    baseUrl?: string // Default: https://api.gumroad.com/v2
}

/**
 * Gumroad product from the /products endpoint
 */
export interface GumroadProduct {
    id: string
    name: string
    permalink: string | null // The product slug used in URLs (may be null for some products)
    preview_url: string | null
    description: string
    custom_permalink: string | null
    custom_receipt: string | null
    custom_summary: string | null
    price: number // Price in cents
    currency: string
    short_url: string
    formatted_price: string
    published: boolean
    shown_on_profile: boolean
    sales_count: number
    sales_usd_cents: number
    variants: GumroadVariant[] | null
    tags: string[]
}

/**
 * Gumroad product variant
 */
export interface GumroadVariant {
    title: string
    options: GumroadVariantOption[]
}

/**
 * Gumroad variant option
 */
export interface GumroadVariantOption {
    name: string
    price_difference: number
    is_pay_what_you_want: boolean
    recurrence: string | null
}

/**
 * Gumroad sale from the /sales endpoint
 * Note: Field names match the actual Gumroad API response
 */
export interface GumroadSale {
    id: string
    email: string
    full_name: string // Customer's full name
    seller_id: string
    timestamp: string
    daystamp: string
    created_at: string
    product_name: string
    product_id: string
    product_permalink: string
    price: number
    gumroad_fee: number
    quantity: number
    discover_fee_charged: boolean
    can_contact: boolean
    referrer: string
    card: {
        visual: string | null
        type: string | null
    }
    order_id: number
    // Product rating fields - actual Gumroad API field names
    product_rating?: number | null // Individual sale's rating (1-5, null if customer didn't rate)
    reviews_count?: number // Total number of reviews for the product
    average_rating?: number // Product's average rating
}

/**
 * Customer who hasn't left a review for their purchase(s)
 */
export interface CustomerWithoutReview {
    firstName: string
    lastName: string
    email: string
    productNames: string[] // Products purchased without review
    purchaseDate: string // Date of earliest purchase without review
}

/**
 * Gumroad API response wrapper for products
 */
export interface GumroadProductsResponse {
    success: boolean
    products: GumroadProduct[]
}

/**
 * Gumroad API response wrapper for a single product
 */
export interface GumroadProductResponse {
    success: boolean
    product: GumroadProduct
}

/**
 * Gumroad API response wrapper for sales
 */
export interface GumroadSalesResponse {
    success: boolean
    sales: GumroadSale[]
    next_page_url?: string
}

/**
 * Gumroad API response wrapper for a single sale
 */
export interface GumroadSaleResponse {
    success: boolean
    sale: GumroadSale
}

/**
 * Gumroad API error response
 */
export interface GumroadErrorResponse {
    success: false
    message: string
}

/**
 * Mapping between Gumroad product slug and local product ID
 */
export interface GumroadMapping {
    gumroadSlug: string // e.g., "obsidian-starter-kit" or "mghmmj"
    localProductId: string // e.g., "obsidian-starter-kit"
}

/**
 * Result of syncing a single product
 */
export interface SyncResult {
    localProductId: string
    gumroadPermalink: string
    status: 'success' | 'skipped' | 'error'
    message: string
    ratingsAdded?: number
    salesCount?: number
    userCountUpdated?: boolean
    priceMatch?: boolean
}

/**
 * Summary of the entire sync operation
 */
export interface SyncSummary {
    totalProducts: number
    synced: number
    skipped: number
    errors: number
    totalRatings: number
    totalSales: number
    priceMismatches: number
}
