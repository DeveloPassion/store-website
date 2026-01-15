/**
 * Markdown Report Generator
 * Generates formatted Markdown reports from Ghost stats
 */

import type { GhostStatsFile, StatsPeriod } from '@/schemas/ghost-stats.schema.js'

// ============================================================================
// Period Display Names
// ============================================================================

const PERIOD_DISPLAY_NAMES: Record<StatsPeriod, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '6mo': 'Last 6 Months',
    '12mo': 'Last 12 Months',
    'all': 'All Time'
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format a number with thousands separator
 */
function formatNumber(value: number): string {
    return value.toLocaleString()
}

/**
 * Format a change value with sign
 */
function formatChange(value: number, isPercent = false): string {
    const sign = value > 0 ? '+' : ''
    const suffix = isPercent ? '%' : ''
    return `${sign}${value.toFixed(1)}${suffix}`
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string): string {
    return `${currency === 'EUR' ? '€' : currency} ${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`
}

/**
 * Format date for display
 */
function formatDate(isoDate: string): string {
    const date = new Date(isoDate)
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    })
}

// ============================================================================
// Report Generation
// ============================================================================

/**
 * Generate a Markdown report from stats
 */
export function generateMarkdownReport(stats: GhostStatsFile): string {
    const lines: string[] = []

    // Header
    lines.push('# Ghost Stats Report')
    lines.push('')
    lines.push(`**Generated:** ${formatDate(stats.fetchedAt)}`)
    lines.push(`**Period:** ${PERIOD_DISPLAY_NAMES[stats.period]}`)
    lines.push('')

    // Milestones (if any)
    if (stats.milestones.length > 0) {
        lines.push('## 🎉 Milestones')
        lines.push('')
        for (const milestone of stats.milestones) {
            lines.push(`- ${milestone}`)
        }
        lines.push('')
    }

    // Members Section
    lines.push('## Members')
    lines.push('')
    lines.push('| Metric | Value | Change |')
    lines.push('|--------|------:|-------:|')
    lines.push(
        `| Total Members | ${formatNumber(stats.ghost.members.total)} | ${formatChange(stats.ghost.members.growth.newThisPeriod)} (${formatChange(stats.ghost.members.growth.growthRate, true)}) |`
    )
    lines.push(`| Free Members | ${formatNumber(stats.ghost.members.free)} | - |`)
    lines.push(`| Paid Members | ${formatNumber(stats.ghost.members.paid)} | - |`)
    lines.push(`| Comped Members | ${formatNumber(stats.ghost.members.comped)} | - |`)
    lines.push('')

    // MRR Section
    lines.push('## Revenue')
    lines.push('')
    lines.push(
        `**Monthly Recurring Revenue (MRR):** ${formatCurrency(stats.ghost.mrr.amount, stats.ghost.mrr.currency)}`
    )
    lines.push('')

    // Content Section
    lines.push('## Content')
    lines.push('')
    lines.push('| Type | Count |')
    lines.push('|------|------:|')
    lines.push(`| Blog Posts | ${formatNumber(stats.ghost.content.blogPosts)} |`)
    lines.push(`| Newsletters | ${formatNumber(stats.ghost.content.newsletters)} |`)
    lines.push(`| **Total Posts** | **${formatNumber(stats.ghost.content.totalPosts)}** |`)
    lines.push('')

    // Visitors Section
    lines.push('## Visitors')
    lines.push('')
    lines.push('| Metric | Current | Previous | Change |')
    lines.push('|--------|--------:|---------:|-------:|')
    lines.push(
        `| Unique Visitors | ${formatNumber(stats.plausible.current.visitors)} | ${formatNumber(stats.plausible.comparison.visitors.value)} | ${formatChange(stats.plausible.comparison.visitors.changePercent, true)} |`
    )
    lines.push(
        `| Pageviews | ${formatNumber(stats.plausible.current.pageviews)} | ${formatNumber(stats.plausible.comparison.pageviews.value)} | ${formatChange(stats.plausible.comparison.pageviews.changePercent, true)} |`
    )
    lines.push(
        `| Bounce Rate | ${stats.plausible.current.bounceRate.toFixed(1)}% | ${stats.plausible.comparison.bounceRate.value.toFixed(1)}% | ${formatChange(stats.plausible.comparison.bounceRate.change)} pp |`
    )
    lines.push(
        `| Avg Duration | ${formatDuration(stats.plausible.current.visitDuration)} | ${formatDuration(stats.plausible.comparison.visitDuration.value)} | ${formatChange(stats.plausible.comparison.visitDuration.change)}s |`
    )
    lines.push('')

    // Top Traffic Sources
    lines.push('## Top Traffic Sources')
    lines.push('')
    if (stats.plausible.topSources.length > 0) {
        lines.push('| Rank | Source | Visitors |')
        lines.push('|-----:|--------|--------:|')
        stats.plausible.topSources.forEach((source, index) => {
            lines.push(`| ${index + 1} | ${source.name} | ${formatNumber(source.visitors)} |`)
        })
    } else {
        lines.push('*No traffic source data available*')
    }
    lines.push('')

    // Top Pages
    lines.push('## Top Pages')
    lines.push('')
    if (stats.plausible.topPages.length > 0) {
        lines.push('| Rank | Page | Visitors |')
        lines.push('|-----:|------|--------:|')
        stats.plausible.topPages.forEach((page, index) => {
            lines.push(`| ${index + 1} | \`${page.page}\` | ${formatNumber(page.visitors)} |`)
        })
    } else {
        lines.push('*No page data available*')
    }
    lines.push('')

    // Footer
    lines.push('---')
    lines.push('')
    lines.push('*Report generated by Ghost Stats CLI*')

    return lines.join('\n')
}

/**
 * Export the period display names for use in CLI
 */
export { PERIOD_DISPLAY_NAMES }
