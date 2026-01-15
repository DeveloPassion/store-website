/**
 * Milestone Detection
 * Detects achievement milestones for members, MRR, and content
 */

import type { MemberStats, ContentStats, Mrr } from '@/schemas/ghost-stats.schema.js'

// ============================================================================
// Milestone Thresholds Configuration
// ============================================================================

/**
 * Total member milestones
 */
export const MEMBER_MILESTONES = [100, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000]

/**
 * Paid member milestones
 */
export const PAID_MEMBER_MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]

/**
 * MRR milestones (in currency units, e.g., EUR)
 */
export const MRR_MILESTONES = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]

/**
 * Content (total posts) milestones
 */
export const CONTENT_MILESTONES = [25, 50, 100, 200, 500, 1000, 2000]

/**
 * Blog post milestones
 */
export const BLOG_MILESTONES = [10, 25, 50, 100, 200, 500, 1000]

/**
 * Newsletter milestones
 */
export const NEWSLETTER_MILESTONES = [10, 25, 50, 100, 200, 500, 1000]

// ============================================================================
// Milestone Detection Functions
// ============================================================================

/**
 * Find the highest milestone reached for a given value
 */
function getHighestMilestone(value: number, milestones: number[]): number | null {
    const reached = milestones.filter((m) => value >= m)
    return reached.length > 0 ? Math.max(...reached) : null
}

/**
 * Format a milestone message
 */
function formatMilestone(category: string, value: number, suffix?: string): string {
    const formattedValue = value.toLocaleString()
    return suffix ? `${category}: ${formattedValue} ${suffix}` : `${category}: ${formattedValue}`
}

/**
 * Detect member-related milestones
 */
export function detectMemberMilestones(members: MemberStats): string[] {
    const milestones: string[] = []

    // Total members milestone
    const totalMilestone = getHighestMilestone(members.total, MEMBER_MILESTONES)
    if (totalMilestone) {
        milestones.push(formatMilestone('Total members reached', totalMilestone))
    }

    // Paid members milestone
    const paidMilestone = getHighestMilestone(members.paid, PAID_MEMBER_MILESTONES)
    if (paidMilestone) {
        milestones.push(formatMilestone('Paid members reached', paidMilestone))
    }

    return milestones
}

/**
 * Detect MRR milestones
 */
export function detectMrrMilestones(mrr: Mrr): string[] {
    const milestones: string[] = []

    const mrrMilestone = getHighestMilestone(mrr.amount, MRR_MILESTONES)
    if (mrrMilestone) {
        milestones.push(formatMilestone('MRR reached', mrrMilestone, mrr.currency))
    }

    return milestones
}

/**
 * Detect content milestones
 */
export function detectContentMilestones(content: ContentStats): string[] {
    const milestones: string[] = []

    // Total posts milestone
    const totalMilestone = getHighestMilestone(content.totalPosts, CONTENT_MILESTONES)
    if (totalMilestone) {
        milestones.push(formatMilestone('Total posts reached', totalMilestone))
    }

    // Blog posts milestone
    const blogMilestone = getHighestMilestone(content.blogPosts, BLOG_MILESTONES)
    if (blogMilestone) {
        milestones.push(formatMilestone('Blog posts reached', blogMilestone))
    }

    // Newsletters milestone
    const newsletterMilestone = getHighestMilestone(content.newsletters, NEWSLETTER_MILESTONES)
    if (newsletterMilestone) {
        milestones.push(formatMilestone('Newsletters reached', newsletterMilestone))
    }

    return milestones
}

/**
 * Detect all milestones from stats
 */
export function detectAllMilestones(
    members: MemberStats,
    mrr: Mrr,
    content: ContentStats
): string[] {
    return [
        ...detectMemberMilestones(members),
        ...detectMrrMilestones(mrr),
        ...detectContentMilestones(content)
    ]
}

/**
 * Format milestones for console output with emoji
 */
export function formatMilestonesForConsole(milestones: string[]): string[] {
    return milestones.map((m) => `🎉 MILESTONE: ${m}!`)
}
