/**
 * Ghost Admin API Client
 * Handles API requests to Ghost Admin API with JWT authentication
 */

import type {
    GhostAdminApiConfig,
    GhostMember,
    GhostMembersResponse,
    MemberCounts,
    MemberGrowthStats,
    CalculatedMrr
} from './types.js'

const THROTTLE_MS = 200 // Delay between requests
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000
const JWT_EXPIRY_MINUTES = 5

/**
 * Ghost Admin API Client
 *
 * Features:
 * - JWT authentication (HS256 signing)
 * - Request throttling (200ms between requests)
 * - Exponential backoff on rate limit (429)
 * - Automatic pagination handling for members
 */
export class GhostAdminApiClient {
    private readonly siteUrl: string
    private readonly apiKeyId: string
    private readonly apiKeySecret: string
    private lastRequestTime = 0

    constructor(config: GhostAdminApiConfig) {
        this.siteUrl = config.siteUrl.replace(/\/$/, '') // Remove trailing slash
        const [id, secret] = config.adminApiKey.split(':')
        if (!id || !secret) {
            throw new GhostApiError('Invalid Admin API key format. Expected "id:secret" format.', 0)
        }
        this.apiKeyId = id
        this.apiKeySecret = secret
    }

    /**
     * Generate JWT token for Ghost Admin API authentication
     */
    private async generateJwt(): Promise<string> {
        const now = Math.floor(Date.now() / 1000)

        // Header
        const header = {
            alg: 'HS256',
            typ: 'JWT',
            kid: this.apiKeyId
        }

        // Payload
        const payload = {
            iat: now,
            exp: now + JWT_EXPIRY_MINUTES * 60,
            aud: '/admin/'
        }

        // Base64URL encode
        const base64UrlEncode = (obj: object): string => {
            const json = JSON.stringify(obj)
            const base64 = btoa(json)
            return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
        }

        const headerEncoded = base64UrlEncode(header)
        const payloadEncoded = base64UrlEncode(payload)
        const signingInput = `${headerEncoded}.${payloadEncoded}`

        // Sign with HMAC-SHA256 using hex-decoded secret
        const secretBytes = hexToBytes(this.apiKeySecret)
        const key = await crypto.subtle.importKey(
            'raw',
            secretBytes,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        )

        const encoder = new TextEncoder()
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput))

        // Convert signature to base64url
        const signatureArray = new Uint8Array(signature)
        const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
        const signatureBase64Url = signatureBase64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '')

        return `${signingInput}.${signatureBase64Url}`
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
     * Make an authenticated request to the Ghost Admin API
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        retryCount = 0
    ): Promise<T> {
        await this.throttle()

        const jwt = await this.generateJwt()
        const url = `${this.siteUrl}/ghost/api/admin${endpoint}`
        const headers: HeadersInit = {
            'Authorization': `Ghost ${jwt}`,
            'Accept-Version': 'v5.0',
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
                throw new GhostApiError('Rate limit exceeded after retries', 429)
            }

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}))
                const message = errorBody?.errors?.[0]?.message ?? `HTTP ${response.status}`
                throw new GhostApiError(message, response.status)
            }

            return response.json() as Promise<T>
        } catch (error) {
            if (error instanceof GhostApiError) {
                throw error
            }

            // Network errors - retry with backoff
            if (retryCount < MAX_RETRIES) {
                const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount)
                await new Promise((resolve) => setTimeout(resolve, backoffMs))
                return this.request<T>(endpoint, options, retryCount + 1)
            }

            throw new GhostApiError(error instanceof Error ? error.message : 'Network error', 0)
        }
    }

    /**
     * Fetch all members (handles pagination)
     */
    async fetchAllMembers(): Promise<GhostMember[]> {
        const allMembers: GhostMember[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
            const response = await this.request<GhostMembersResponse>(
                `/members/?page=${page}&limit=100&include=newsletters,labels`
            )

            allMembers.push(...response.members)

            // Check for more pages
            if (response.meta.pagination.next) {
                page++
            } else {
                hasMore = false
            }
        }

        return allMembers
    }

    /**
     * Get member counts (free, paid, comped)
     */
    async getMemberCounts(): Promise<MemberCounts> {
        const members = await this.fetchAllMembers()

        const counts: MemberCounts = {
            total: members.length,
            free: 0,
            paid: 0,
            comped: 0
        }

        for (const member of members) {
            switch (member.status) {
                case 'free':
                    counts.free++
                    break
                case 'paid':
                    counts.paid++
                    break
                case 'comped':
                    counts.comped++
                    break
            }
        }

        return counts
    }

    /**
     * Calculate member growth for a period
     * @param periodDays Number of days to look back (7, 30, 180, 365)
     */
    async getMemberGrowth(periodDays: number): Promise<MemberGrowthStats> {
        const members = await this.fetchAllMembers()
        const now = new Date()
        const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

        // Count members created within the period
        const newMembers = members.filter((m) => new Date(m.created_at) >= periodStart)

        // Calculate growth rate
        const previousTotal = members.length - newMembers.length
        const growthRate = previousTotal > 0 ? (newMembers.length / previousTotal) * 100 : 0

        return {
            newThisPeriod: newMembers.length,
            growthRate: Math.round(growthRate * 10) / 10 // Round to 1 decimal
        }
    }

    /**
     * Calculate MRR from active subscriptions
     * Normalizes yearly subscriptions to monthly (yearly / 12)
     */
    async calculateMrr(): Promise<CalculatedMrr> {
        const members = await this.fetchAllMembers()

        let totalMrr = 0
        let currency = 'EUR' // Default

        for (const member of members) {
            if (member.status !== 'paid') continue

            for (const subscription of member.subscriptions) {
                if (subscription.status !== 'active') continue

                // Get price in smallest unit (cents)
                const amount = subscription.price.amount
                const interval = subscription.price.interval
                currency = subscription.price.currency.toUpperCase()

                // Normalize to monthly
                const monthlyAmount = interval === 'year' ? amount / 12 : amount

                // Convert from cents to currency units
                totalMrr += monthlyAmount / 100
            }
        }

        return {
            amount: Math.round(totalMrr * 100) / 100, // Round to 2 decimals
            currency
        }
    }

    /**
     * Get average email open rate across all members
     */
    async getAverageOpenRate(): Promise<number> {
        const members = await this.fetchAllMembers()

        const membersWithOpenRate = members.filter(
            (m) => m.email_open_rate !== null && m.email_count > 0
        )

        if (membersWithOpenRate.length === 0) {
            return 0
        }

        const totalOpenRate = membersWithOpenRate.reduce(
            (sum, m) => sum + (m.email_open_rate ?? 0),
            0
        )

        return Math.round((totalOpenRate / membersWithOpenRate.length) * 10) / 10
    }
}

/**
 * Custom error class for Ghost API errors
 */
export class GhostApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message)
        this.name = 'GhostApiError'
    }
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }
    return bytes
}
