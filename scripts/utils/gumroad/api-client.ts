/**
 * Gumroad API Client
 * Handles API requests to Gumroad with throttling and error handling
 */

import type {
    GumroadApiConfig,
    GumroadProduct,
    GumroadSale,
    GumroadProductsResponse,
    GumroadSalesResponse,
    GumroadErrorResponse
} from './types.js'

const DEFAULT_BASE_URL = 'https://api.gumroad.com/v2'
const THROTTLE_MS = 200 // Delay between requests
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000

/**
 * Gumroad API Client
 *
 * Features:
 * - Request throttling (200ms between requests)
 * - Exponential backoff on rate limit (429)
 * - Automatic pagination handling for sales
 */
export class GumroadApiClient {
    private readonly accessToken: string
    private readonly baseUrl: string
    private lastRequestTime = 0

    constructor(config: GumroadApiConfig) {
        this.accessToken = config.accessToken
        this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
    }

    /**
     * Throttle requests to avoid rate limiting
     */
    private async throttle(): Promise<void> {
        const now = Date.now()
        const timeSinceLastRequest = now - this.lastRequestTime

        if (timeSinceLastRequest < THROTTLE_MS) {
            await new Promise((resolve) => setTimeout(resolve, THROTTLE_MS - timeSinceLastRequest))
        }

        this.lastRequestTime = Date.now()
    }

    /**
     * Make an authenticated request to the Gumroad API
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        retryCount = 0
    ): Promise<T> {
        await this.throttle()

        const url = `${this.baseUrl}${endpoint}`
        const headers: HeadersInit = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            })

            // Handle rate limiting with exponential backoff
            if (response.status === 429) {
                if (retryCount < MAX_RETRIES) {
                    const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount)
                    await new Promise((resolve) => setTimeout(resolve, backoffMs))
                    return this.request<T>(endpoint, options, retryCount + 1)
                }
                throw new GumroadApiError('Rate limit exceeded after retries', 429)
            }

            if (!response.ok) {
                const errorBody = (await response.json().catch(() => ({}))) as
                    | GumroadErrorResponse
                    | Record<string, never>
                const message =
                    'message' in errorBody ? errorBody.message : `HTTP ${response.status}`
                throw new GumroadApiError(message, response.status)
            }

            return response.json() as Promise<T>
        } catch (error) {
            if (error instanceof GumroadApiError) {
                throw error
            }

            // Network errors - retry with backoff
            if (retryCount < MAX_RETRIES) {
                const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount)
                await new Promise((resolve) => setTimeout(resolve, backoffMs))
                return this.request<T>(endpoint, options, retryCount + 1)
            }

            throw new GumroadApiError(error instanceof Error ? error.message : 'Network error', 0)
        }
    }

    /**
     * Get all products for the authenticated user
     */
    async getProducts(): Promise<GumroadProduct[]> {
        const response = await this.request<GumroadProductsResponse>('/products')

        if (!response.success) {
            throw new GumroadApiError('Failed to fetch products', 0)
        }

        return response.products
    }

    /**
     * Get all sales for a specific product (handles pagination)
     *
     * @param productId - The Gumroad product ID
     * @param after - Optional date filter (ISO string) - only return sales after this date
     */
    async getProductSales(productId: string, after?: string): Promise<GumroadSale[]> {
        const allSales: GumroadSale[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
            const params = new URLSearchParams({
                product_id: productId,
                page: String(page)
            })

            if (after) {
                params.set('after', after)
            }

            const response = await this.request<GumroadSalesResponse>(`/sales?${params.toString()}`)

            if (!response.success) {
                throw new GumroadApiError('Failed to fetch sales', 0)
            }

            allSales.push(...response.sales)

            // Check for more pages
            if (response.next_page_url) {
                page++
            } else {
                hasMore = false
            }
        }

        return allSales
    }

    /**
     * Get all sales across all products (handles pagination)
     *
     * Note: The Gumroad API requires a product_id for the /sales endpoint,
     * so we fetch all products first and then get sales for each one.
     *
     * @param after - Optional date filter (ISO string) - only return sales after this date
     */
    async getAllSales(after?: string): Promise<GumroadSale[]> {
        // First, get all products
        const products = await this.getProducts()

        // Then fetch sales for each product
        const allSales: GumroadSale[] = []
        for (const product of products) {
            const productSales = await this.getProductSales(product.id, after)
            allSales.push(...productSales)
        }

        return allSales
    }
}

/**
 * Custom error class for Gumroad API errors
 */
export class GumroadApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message)
        this.name = 'GumroadApiError'
    }
}
