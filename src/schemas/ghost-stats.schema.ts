import { z } from 'zod'

/**
 * Ghost Stats Schema - Statistics from Ghost and Plausible Analytics
 * SINGLE SOURCE OF TRUTH for ghost stats types and validation
 * Last updated: 2026-01-15
 *
 * This schema validates ghost-stats.json output from the ghost-stats CLI.
 * Data is fetched from Ghost Admin/Content APIs and Plausible Analytics API.
 */

/**
 * Available time periods for stats
 */
export const StatsPeriodSchema = z.enum(['7d', '30d', '6mo', '12mo', 'all'])

/**
 * Member growth metrics
 */
export const MemberGrowthSchema = z.object({
    newThisPeriod: z.number().int().min(0),
    growthRate: z.number() // percentage, can be negative
})

/**
 * Member statistics from Ghost Admin API
 */
export const MemberStatsSchema = z.object({
    total: z.number().int().min(0),
    free: z.number().int().min(0),
    paid: z.number().int().min(0),
    comped: z.number().int().min(0),
    growth: MemberGrowthSchema
})

/**
 * MRR (Monthly Recurring Revenue) calculated from subscriptions
 */
export const MrrSchema = z.object({
    amount: z.number().min(0),
    currency: z.string().min(1).default('EUR')
})

/**
 * Content statistics from Ghost Content API
 */
export const ContentStatsSchema = z.object({
    blogPosts: z.number().int().min(0),
    newsletters: z.number().int().min(0),
    totalPosts: z.number().int().min(0)
})

/**
 * Ghost-specific stats (members, MRR, content)
 */
export const GhostStatsSchema = z.object({
    members: MemberStatsSchema,
    mrr: MrrSchema,
    content: ContentStatsSchema
})

/**
 * Current period visitor metrics from Plausible
 */
export const VisitorMetricsSchema = z.object({
    visitors: z.number().int().min(0),
    pageviews: z.number().int().min(0),
    bounceRate: z.number().min(0).max(100),
    visitDuration: z.number().min(0) // in seconds
})

/**
 * Metric with comparison to previous period
 */
export const MetricComparisonSchema = z.object({
    value: z.number(),
    change: z.number(), // absolute change
    changePercent: z.number() // percentage change
})

/**
 * Bounce rate comparison (no percentage, just absolute change)
 */
export const BounceRateComparisonSchema = z.object({
    value: z.number().min(0).max(100),
    change: z.number() // absolute change in percentage points
})

/**
 * Visit duration comparison (no percentage, just absolute change)
 */
export const VisitDurationComparisonSchema = z.object({
    value: z.number().min(0), // in seconds
    change: z.number() // absolute change in seconds
})

/**
 * Comparison metrics vs previous period
 */
export const VisitorComparisonSchema = z.object({
    visitors: MetricComparisonSchema,
    pageviews: MetricComparisonSchema,
    bounceRate: BounceRateComparisonSchema,
    visitDuration: VisitDurationComparisonSchema
})

/**
 * Traffic source entry
 */
export const TrafficSourceSchema = z.object({
    name: z.string().min(1),
    visitors: z.number().int().min(0)
})

/**
 * Top page entry
 */
export const TopPageSchema = z.object({
    page: z.string().min(1),
    visitors: z.number().int().min(0)
})

/**
 * Plausible analytics stats
 */
export const PlausibleStatsSchema = z.object({
    current: VisitorMetricsSchema,
    comparison: VisitorComparisonSchema,
    topSources: z.array(TrafficSourceSchema),
    topPages: z.array(TopPageSchema)
})

/**
 * Complete Ghost Stats schema for saved JSON file
 */
export const GhostStatsFileSchema = z.object({
    fetchedAt: z.string().datetime({ message: 'Must be ISO 8601 timestamp' }),
    period: StatsPeriodSchema,
    ghost: GhostStatsSchema,
    plausible: PlausibleStatsSchema,
    milestones: z.array(z.string())
})

// Export TypeScript types derived from Zod schemas
export type StatsPeriod = z.infer<typeof StatsPeriodSchema>
export type MemberGrowth = z.infer<typeof MemberGrowthSchema>
export type MemberStats = z.infer<typeof MemberStatsSchema>
export type Mrr = z.infer<typeof MrrSchema>
export type ContentStats = z.infer<typeof ContentStatsSchema>
export type GhostStats = z.infer<typeof GhostStatsSchema>
export type VisitorMetrics = z.infer<typeof VisitorMetricsSchema>
export type MetricComparison = z.infer<typeof MetricComparisonSchema>
export type BounceRateComparison = z.infer<typeof BounceRateComparisonSchema>
export type VisitDurationComparison = z.infer<typeof VisitDurationComparisonSchema>
export type VisitorComparison = z.infer<typeof VisitorComparisonSchema>
export type TrafficSource = z.infer<typeof TrafficSourceSchema>
export type TopPage = z.infer<typeof TopPageSchema>
export type PlausibleStats = z.infer<typeof PlausibleStatsSchema>
export type GhostStatsFile = z.infer<typeof GhostStatsFileSchema>
