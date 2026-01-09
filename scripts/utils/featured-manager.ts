/**
 * Featured Manager Utility
 *
 * Shared logic for managing featured status and priorities across tags and categories.
 * Provides reusable functions for both CLIs to ensure consistent behavior.
 */

import { colors, showSeparator, showWarning, showSuccess } from './cli-display.js'

/**
 * Common interface for featured items (tags or categories)
 */
export interface FeaturedItem {
    id: string
    name: string
    featured: boolean
    priority: number
}

/**
 * Statistics about featured items
 */
export interface FeaturedStats {
    totalCount: number
    featuredCount: number
    nonFeaturedCount: number
    featuredRange: { min: number; max: number }
    nonFeaturedRange: { min: number; max: number }
    hasPriorityGaps: boolean
    gapDetails?: Array<{ expected: number; actual: number }>
}

/**
 * Configuration for renumbering priorities
 */
export interface RenumberConfig {
    featuredStart: number // Starting priority for featured items (e.g., 1)
    featuredEnd: number // Maximum priority for featured items (e.g., 8 for tags, 7 for categories)
    nonFeaturedStart: number // Starting priority for non-featured items (e.g., 21 for tags, 8 for categories)
}

/**
 * Calculate statistics about featured items
 */
export function calculateFeaturedStats(
    items: FeaturedItem[],
    config: RenumberConfig
): FeaturedStats {
    const featured = items.filter((i) => i.featured)
    const nonFeatured = items.filter((i) => !i.featured)

    // Calculate ranges
    const featuredPriorities = featured.map((i) => i.priority).sort((a, b) => a - b)
    const nonFeaturedPriorities = nonFeatured.map((i) => i.priority).sort((a, b) => a - b)

    const featuredRange = {
        min: featuredPriorities.length > 0 ? featuredPriorities[0] : config.featuredStart,
        max:
            featuredPriorities.length > 0
                ? featuredPriorities[featuredPriorities.length - 1]
                : config.featuredStart
    }

    const nonFeaturedRange = {
        min: nonFeaturedPriorities.length > 0 ? nonFeaturedPriorities[0] : config.nonFeaturedStart,
        max:
            nonFeaturedPriorities.length > 0
                ? nonFeaturedPriorities[nonFeaturedPriorities.length - 1]
                : config.nonFeaturedStart
    }

    // Detect priority gaps
    const gapDetails: Array<{ expected: number; actual: number }> = []
    let hasPriorityGaps = false

    // Check featured items for gaps
    if (featured.length > 0) {
        const sortedFeatured = [...featured].sort((a, b) => a.priority - b.priority)
        for (let i = 0; i < sortedFeatured.length; i++) {
            const expected = config.featuredStart + i
            const actual = sortedFeatured[i].priority
            if (expected !== actual) {
                hasPriorityGaps = true
                gapDetails.push({ expected, actual })
            }
        }
    }

    // Check non-featured items for gaps
    if (nonFeatured.length > 0) {
        const sortedNonFeatured = [...nonFeatured].sort((a, b) => a.priority - b.priority)
        for (let i = 0; i < sortedNonFeatured.length; i++) {
            const expected = config.nonFeaturedStart + i
            const actual = sortedNonFeatured[i].priority
            if (expected !== actual) {
                hasPriorityGaps = true
                gapDetails.push({ expected, actual })
            }
        }
    }

    return {
        totalCount: items.length,
        featuredCount: featured.length,
        nonFeaturedCount: nonFeatured.length,
        featuredRange,
        nonFeaturedRange,
        hasPriorityGaps,
        gapDetails: gapDetails.length > 0 ? gapDetails : undefined
    }
}

/**
 * Auto-renumber priorities to eliminate gaps
 * Preserves relative order within featured and non-featured groups
 */
export function autoRenumberPriorities(
    items: FeaturedItem[],
    config: RenumberConfig
): FeaturedItem[] {
    // Create a deep copy to avoid mutating input
    const itemsCopy = items.map((item) => ({ ...item }))

    // Separate featured and non-featured
    const featured = itemsCopy.filter((i) => i.featured)
    const nonFeatured = itemsCopy.filter((i) => !i.featured)

    // Sort by current priority to preserve relative order
    featured.sort((a, b) => a.priority - b.priority)
    nonFeatured.sort((a, b) => a.priority - b.priority)

    // Renumber featured items sequentially
    featured.forEach((item, index) => {
        item.priority = config.featuredStart + index
    })

    // Renumber non-featured items sequentially
    nonFeatured.forEach((item, index) => {
        item.priority = config.nonFeaturedStart + index
    })

    return [...featured, ...nonFeatured]
}

/**
 * Move an item up in the list (swap with item above)
 */
export function moveItemUp(items: FeaturedItem[], index: number): FeaturedItem[] {
    if (index === 0) {
        // Already at the top, can't move up
        return items
    }

    // Create a copy to avoid mutating input
    const itemsCopy = [...items]

    const current = itemsCopy[index]
    const above = itemsCopy[index - 1]

    // Swap priorities
    const tempPriority = current.priority
    current.priority = above.priority
    above.priority = tempPriority

    // Swap positions in array
    itemsCopy[index] = above
    itemsCopy[index - 1] = current

    return itemsCopy
}

/**
 * Move an item down in the list (swap with item below)
 */
export function moveItemDown(items: FeaturedItem[], index: number): FeaturedItem[] {
    if (index === items.length - 1) {
        // Already at the bottom, can't move down
        return items
    }

    // Create a copy to avoid mutating input
    const itemsCopy = [...items]

    const current = itemsCopy[index]
    const below = itemsCopy[index + 1]

    // Swap priorities
    const tempPriority = current.priority
    current.priority = below.priority
    below.priority = tempPriority

    // Swap positions in array
    itemsCopy[index] = below
    itemsCopy[index + 1] = current

    return itemsCopy
}

/**
 * Validate featured operation (duplicates, ranges)
 */
export function validateFeaturedOperation(
    items: FeaturedItem[],
    config: RenumberConfig
): { success: boolean; errors: string[] } {
    const errors: string[] = []

    // Check for duplicate priorities
    const priorities = new Map<number, string[]>()
    items.forEach((item) => {
        if (!priorities.has(item.priority)) {
            priorities.set(item.priority, [])
        }
        priorities.get(item.priority)!.push(item.name)
    })

    priorities.forEach((names, priority) => {
        if (names.length > 1) {
            errors.push(`Duplicate priority ${priority} detected: ${names.join(', ')}`)
        }
    })

    // Check priority ranges
    const featured = items.filter((i) => i.featured)
    featured.forEach((item) => {
        if (item.priority < config.featuredStart || item.priority >= config.nonFeaturedStart) {
            errors.push(
                `Featured item "${item.name}" has priority ${item.priority} outside valid range (${config.featuredStart}-${config.nonFeaturedStart - 1})`
            )
        }
    })

    const nonFeatured = items.filter((i) => !i.featured)
    nonFeatured.forEach((item) => {
        if (item.priority < config.nonFeaturedStart) {
            errors.push(
                `Non-featured item "${item.name}" has priority ${item.priority} below minimum (${config.nonFeaturedStart})`
            )
        }
    })

    return {
        success: errors.length === 0,
        errors
    }
}

/**
 * Display featured summary with statistics
 */
export function displayFeaturedSummary(stats: FeaturedStats, items: FeaturedItem[]): void {
    console.log(`\n${colors.bright}${colors.cyan}📊 Featured Summary${colors.reset}`)
    showSeparator()

    // Overview stats
    console.log(`${colors.bright}Total Items:${colors.reset} ${stats.totalCount}`)
    console.log(
        `${colors.bright}Featured:${colors.reset} ${colors.yellow}${stats.featuredCount}${colors.reset} (Priority ${stats.featuredRange.min}-${stats.featuredRange.max})`
    )
    console.log(
        `${colors.bright}Non-Featured:${colors.reset} ${stats.nonFeaturedCount} (Priority ${stats.nonFeaturedRange.min}+)`
    )

    if (stats.hasPriorityGaps) {
        showWarning(
            `Priority gaps detected (${stats.gapDetails?.length || 0} gaps) - consider using "Renumber All Priorities"`
        )
    } else {
        showSuccess('All priorities are sequential (no gaps)')
    }

    showSeparator()

    // List featured items
    const featured = items.filter((i) => i.featured).sort((a, b) => a.priority - b.priority)

    if (featured.length > 0) {
        console.log(`\n${colors.bright}${colors.yellow}⭐ Featured Items:${colors.reset}`)
        featured.forEach((item) => {
            console.log(
                `  ${colors.dim}${String(item.priority).padStart(2)}${colors.reset} ${item.name} ${colors.dim}(${item.id})${colors.reset}`
            )
        })
    } else {
        showWarning('No featured items found')
    }

    console.log()
}

/**
 * Display reorder list with current selection highlighted
 */
export function displayReorderList(items: FeaturedItem[], selectedIndex: number): void {
    console.log(`\n${colors.bright}Featured Items (${items.length} total)${colors.reset}`)
    console.log(`${colors.dim}Use arrow keys to move the selected item${colors.reset}`)
    showSeparator()

    items.forEach((item, index) => {
        const isSelected = index === selectedIndex
        const prefix = isSelected ? `${colors.bright}${colors.cyan}►${colors.reset}` : ' '
        const nameStyle = isSelected ? `${colors.bright}${colors.cyan}` : ''
        const resetStyle = isSelected ? colors.reset : ''

        console.log(
            `${prefix} ${colors.dim}${String(item.priority).padStart(2)}${colors.reset} ${nameStyle}${item.name}${resetStyle} ${colors.dim}(${item.id})${colors.reset}`
        )
    })

    showSeparator()
}

/**
 * Show bulk operation summary (promote/demote)
 */
export function showBulkOperationSummary(
    operation: 'promote' | 'demote',
    changedItems: FeaturedItem[],
    beforeStats: FeaturedStats,
    afterStats: FeaturedStats
): void {
    const verb = operation === 'promote' ? 'Promoted' : 'Demoted'
    const preposition = operation === 'promote' ? 'to' : 'from'

    console.log(
        `\n${colors.bright}${colors.green}✅ ${verb} ${changedItems.length} item(s) ${preposition} featured${colors.reset}`
    )
    showSeparator()

    console.log(`${colors.bright}Before:${colors.reset}`)
    console.log(`  Featured: ${beforeStats.featuredCount}`)
    console.log(`  Non-Featured: ${beforeStats.nonFeaturedCount}`)

    console.log(`\n${colors.bright}After:${colors.reset}`)
    console.log(`  Featured: ${colors.yellow}${afterStats.featuredCount}${colors.reset}`)
    console.log(`  Non-Featured: ${afterStats.nonFeaturedCount}`)

    console.log(`\n${colors.bright}${colors.yellow}Changed items:${colors.reset}`)
    changedItems.forEach((item) => {
        console.log(`  • ${item.name} ${colors.dim}(Priority: ${item.priority})${colors.reset}`)
    })

    showSeparator()
}

/**
 * Show before/after comparison for renumbering
 */
export function showRenumberComparison(
    beforeItems: FeaturedItem[],
    afterItems: FeaturedItem[]
): void {
    console.log(`\n${colors.bright}${colors.cyan}Renumbering Preview${colors.reset}`)
    showSeparator()

    // Create map for easy lookup
    const beforeMap = new Map(beforeItems.map((item) => [item.id, item.priority]))

    // Find items with changed priorities
    const changedItems = afterItems.filter((item) => {
        const oldPriority = beforeMap.get(item.id)
        return oldPriority !== item.priority
    })

    if (changedItems.length === 0) {
        showSuccess('All priorities are already sequential (no changes needed)')
        return
    }

    console.log(`${colors.bright}Changes:${colors.reset} ${changedItems.length} items`)
    console.log()

    changedItems.forEach((item) => {
        const oldPriority = beforeMap.get(item.id)!
        const newPriority = item.priority
        console.log(
            `${colors.bright}${item.name}${colors.reset} ${colors.dim}(${item.id})${colors.reset}`
        )
        console.log(
            `  ${colors.red}− Priority: ${oldPriority}${colors.reset} ${colors.dim}(old)${colors.reset}`
        )
        console.log(
            `  ${colors.green}+ Priority: ${newPriority}${colors.reset} ${colors.dim}(new)${colors.reset}`
        )
    })

    showSeparator()
}
