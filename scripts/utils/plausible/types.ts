/**
 * Plausible Analytics API Types
 * Type definitions for Plausible Stats API v1 responses
 */

// ============================================================================
// Configuration
// ============================================================================

export interface PlausibleApiConfig {
    apiKey: string
    siteId: string
    baseUrl?: string // Defaults to https://plausible.io
}

// ============================================================================
// API Periods
// ============================================================================

/**
 * Valid period values for Plausible API
 * - 7d: Last 7 days
 * - 30d: Last 30 days
 * - 6mo: Last 6 months
 * - 12mo: Last 12 months
 * - all: All time (since site was added)
 */
export type PlausiblePeriod = '7d' | '30d' | '6mo' | '12mo' | 'all'

/**
 * Map of period to number of days (for comparison calculations)
 */
export const PERIOD_DAYS: Record<PlausiblePeriod, number | null> = {
    '7d': 7,
    '30d': 30,
    '6mo': 180,
    '12mo': 365,
    'all': null // All time has no fixed days
}

// ============================================================================
// Aggregate Stats Response
// ============================================================================

export interface PlausibleMetricValue {
    value: number
}

export interface PlausibleAggregateResponse {
    results: {
        visitors?: PlausibleMetricValue
        visits?: PlausibleMetricValue
        pageviews?: PlausibleMetricValue
        bounce_rate?: PlausibleMetricValue
        visit_duration?: PlausibleMetricValue
        events?: PlausibleMetricValue
    }
}

// ============================================================================
// Breakdown Response
// ============================================================================

export interface PlausibleBreakdownItem {
    // The breakdown dimension value (e.g., country name, referrer, page path)
    [key: string]: string | number
    visitors: number
    visits?: number
    pageviews?: number
    bounce_rate?: number
    visit_duration?: number
}

export interface PlausibleBreakdownResponse {
    results: PlausibleBreakdownItem[]
}

// ============================================================================
// Timeseries Response
// ============================================================================

export interface PlausibleTimeseriesItem {
    date: string
    visitors?: number
    visits?: number
    pageviews?: number
    bounce_rate?: number
    visit_duration?: number
}

export interface PlausibleTimeseriesResponse {
    results: PlausibleTimeseriesItem[]
}

// ============================================================================
// Processed Stats Types
// ============================================================================

export interface AggregateStats {
    visitors: number
    pageviews: number
    bounceRate: number
    visitDuration: number
}

export interface ComparisonStats {
    visitors: { value: number; change: number; changePercent: number }
    pageviews: { value: number; change: number; changePercent: number }
    bounceRate: { value: number; change: number }
    visitDuration: { value: number; change: number }
}

export interface TrafficSource {
    name: string
    visitors: number
}

export interface TopPage {
    page: string
    visitors: number
}
