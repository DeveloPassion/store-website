/**
 * Plausible Analytics API Client
 * Handles API requests to Plausible Stats API v1
 */

import type {
    PlausibleApiConfig,
    PlausiblePeriod,
    PlausibleAggregateResponse,
    PlausibleBreakdownResponse,
    AggregateStats,
    ComparisonStats,
    TrafficSource,
    TopPage
} from './types.js'
import { PERIOD_DAYS } from './types.js'

const DEFAULT_BASE_URL = 'https://plausible.io'
const THROTTLE_MS = 200 // Delay between requests
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000

/**
 * Plausible Analytics API Client
 *
 * Features:
 * - Bearer token authentication
 * - Request throttling (200ms between requests)
 * - Exponential backoff on rate limit (429)
 * - Aggregate stats with comparison
 * - Top sources and top pages breakdown
 */
export class PlausibleApiClient {
    private readonly apiKey: string
    private readonly siteId: string
    private readonly baseUrl: string
    private lastRequestTime = 0

    constructor(config: PlausibleApiConfig) {
        this.apiKey = config.apiKey
        this.siteId = config.siteId
        this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '')
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
     * Make an authenticated request to the Plausible API
     */
    private async request<T>(
        endpoint: string,
        params: Record<string, string> = {},
        retryCount = 0
    ): Promise<T> {
        await this.throttle()

        const queryParams = new URLSearchParams({
            site_id: this.siteId,
            ...params
        })

        const url = `${this.baseUrl}/api/v1/stats${endpoint}?${queryParams.toString()}`

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`
                }
            })

            // Handle rate limiting with exponential backoff
            if (response.status === 429) {
                if (retryCount < MAX_RETRIES) {
                    const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount)
                    await new Promise((resolve) => setTimeout(resolve, backoffMs))
                    return this.request<T>(endpoint, params, retryCount + 1)
                }
                throw new PlausibleApiError('Rate limit exceeded after retries', 429)
            }

            if (!response.ok) {
                const errorBody = await response.text().catch(() => '')
                throw new PlausibleApiError(errorBody || `HTTP ${response.status}`, response.status)
            }

            return response.json() as Promise<T>
        } catch (error) {
            if (error instanceof PlausibleApiError) {
                throw error
            }

            // Network errors - retry with backoff
            if (retryCount < MAX_RETRIES) {
                const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount)
                await new Promise((resolve) => setTimeout(resolve, backoffMs))
                return this.request<T>(endpoint, params, retryCount + 1)
            }

            throw new PlausibleApiError(error instanceof Error ? error.message : 'Network error', 0)
        }
    }

    /**
     * Convert our period format to Plausible API format
     */
    private getPeriodParam(period: PlausiblePeriod): string {
        // Plausible uses different format for some periods
        switch (period) {
            case '7d':
                return '7d'
            case '30d':
                return '30d'
            case '6mo':
                return '6mo'
            case '12mo':
                return '12mo'
            case 'all':
                return 'all'
            default:
                return '30d'
        }
    }

    /**
     * Get aggregate stats for a period
     */
    async getAggregateStats(period: PlausiblePeriod): Promise<AggregateStats> {
        const response = await this.request<PlausibleAggregateResponse>('/aggregate', {
            period: this.getPeriodParam(period),
            metrics: 'visitors,pageviews,bounce_rate,visit_duration'
        })

        return {
            visitors: response.results.visitors?.value ?? 0,
            pageviews: response.results.pageviews?.value ?? 0,
            bounceRate: response.results.bounce_rate?.value ?? 0,
            visitDuration: response.results.visit_duration?.value ?? 0
        }
    }

    /**
     * Get aggregate stats with comparison to previous period
     */
    async getAggregateStatsWithComparison(period: PlausiblePeriod): Promise<{
        current: AggregateStats
        comparison: ComparisonStats
    }> {
        // Get current period stats
        const currentResponse = await this.request<PlausibleAggregateResponse>('/aggregate', {
            period: this.getPeriodParam(period),
            metrics: 'visitors,pageviews,bounce_rate,visit_duration'
        })

        const current: AggregateStats = {
            visitors: currentResponse.results.visitors?.value ?? 0,
            pageviews: currentResponse.results.pageviews?.value ?? 0,
            bounceRate: currentResponse.results.bounce_rate?.value ?? 0,
            visitDuration: currentResponse.results.visit_duration?.value ?? 0
        }

        // Get previous period stats via custom date range
        const previousStats = await this.getPreviousPeriodStats(period)

        const comparison: ComparisonStats = {
            visitors: {
                value: previousStats.visitors,
                change: current.visitors - previousStats.visitors,
                changePercent: calculateChangePercent(previousStats.visitors, current.visitors)
            },
            pageviews: {
                value: previousStats.pageviews,
                change: current.pageviews - previousStats.pageviews,
                changePercent: calculateChangePercent(previousStats.pageviews, current.pageviews)
            },
            bounceRate: {
                value: previousStats.bounceRate,
                change: Math.round((current.bounceRate - previousStats.bounceRate) * 10) / 10
            },
            visitDuration: {
                value: previousStats.visitDuration,
                change: Math.round(current.visitDuration - previousStats.visitDuration)
            }
        }

        return { current, comparison }
    }

    /**
     * Get stats for the previous period
     */
    private async getPreviousPeriodStats(period: PlausiblePeriod): Promise<AggregateStats> {
        const days = PERIOD_DAYS[period]

        if (!days) {
            // For 'all' period, we can't compare to previous
            return { visitors: 0, pageviews: 0, bounceRate: 0, visitDuration: 0 }
        }

        // Calculate date range for previous period
        const now = new Date()
        const periodEnd = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000)

        const formatDate = (d: Date): string => d.toISOString().split('T')[0]

        const response = await this.request<PlausibleAggregateResponse>('/aggregate', {
            period: 'custom',
            date: `${formatDate(periodStart)},${formatDate(periodEnd)}`,
            metrics: 'visitors,pageviews,bounce_rate,visit_duration'
        })

        return {
            visitors: response.results.visitors?.value ?? 0,
            pageviews: response.results.pageviews?.value ?? 0,
            bounceRate: response.results.bounce_rate?.value ?? 0,
            visitDuration: response.results.visit_duration?.value ?? 0
        }
    }

    /**
     * Get top traffic sources
     */
    async getTopSources(period: PlausiblePeriod, limit = 5): Promise<TrafficSource[]> {
        const response = await this.request<PlausibleBreakdownResponse>('/breakdown', {
            period: this.getPeriodParam(period),
            property: 'visit:source',
            metrics: 'visitors',
            limit: String(limit)
        })

        return response.results.map((item) => ({
            name: (item.source as string) || 'Direct / None',
            visitors: item.visitors
        }))
    }

    /**
     * Get top pages
     */
    async getTopPages(period: PlausiblePeriod, limit = 10): Promise<TopPage[]> {
        const response = await this.request<PlausibleBreakdownResponse>('/breakdown', {
            period: this.getPeriodParam(period),
            property: 'event:page',
            metrics: 'visitors',
            limit: String(limit)
        })

        return response.results.map((item) => ({
            page: item.page as string,
            visitors: item.visitors
        }))
    }
}

/**
 * Custom error class for Plausible API errors
 */
export class PlausibleApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message)
        this.name = 'PlausibleApiError'
    }
}

/**
 * Calculate percentage change between two values
 */
function calculateChangePercent(previous: number, current: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0
    }
    return Math.round(((current - previous) / previous) * 1000) / 10 // Round to 1 decimal
}
