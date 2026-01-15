#!/usr/bin/env bun
/**
 * Ghost Stats CLI
 * Fetch and display stats from Ghost and Plausible Analytics
 *
 * Usage: bun run ghost:stats
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import * as readline from 'readline'
import { GhostAdminApiClient, GhostApiError } from './utils/ghost/admin-api-client.js'
import { GhostContentApiClient } from './utils/ghost/content-api-client.js'
import { PlausibleApiClient, PlausibleApiError } from './utils/plausible/api-client.js'
import { detectAllMilestones, formatMilestonesForConsole } from './utils/ghost/milestones.js'
import { generateMarkdownReport, PERIOD_DISPLAY_NAMES } from './utils/ghost/markdown-report.js'
import {
    colors,
    showBanner,
    showOperationHeader,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showGoodbye
} from './utils/cli-display.js'
import type {
    GhostStatsFile,
    StatsPeriod,
    MemberStats,
    ContentStats
} from '@/schemas/ghost-stats.schema.js'
import { GhostStatsFileSchema } from '@/schemas/ghost-stats.schema.js'
import type { PlausiblePeriod } from './utils/plausible/types.js'
import { PERIOD_DAYS } from './utils/plausible/types.js'

// ============================================================================
// Configuration
// ============================================================================

const EXPORTS_DIR = path.join(process.cwd(), 'exports')
const STATS_FILE_PATH = path.join(EXPORTS_DIR, 'ghost-stats.json')
const REPORT_FILE_PATH = path.join(EXPORTS_DIR, 'ghost-stats-report.md')

// Environment variables
const GHOST_SITE_URL = process.env.GHOST_SITE_URL
const GHOST_ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY
const PLAUSIBLE_API_KEY = process.env.PLAUSIBLE_API_KEY
const PLAUSIBLE_SITE_ID = process.env.PLAUSIBLE_SITE_ID

// ============================================================================
// Menu Options
// ============================================================================

type MenuOption = 'view' | 'save' | 'export' | 'view-saved' | 'exit'

const MENU_OPTIONS: { value: MenuOption; label: string; description: string }[] = [
    { value: 'view', label: '📊 View Stats', description: 'Fetch and display current stats' },
    { value: 'save', label: '💾 Save Stats (JSON)', description: 'Fetch and save to JSON file' },
    { value: 'export', label: '📝 Export Markdown', description: 'Generate Markdown report' },
    {
        value: 'view-saved',
        label: '📂 View Saved Stats',
        description: 'Display previously saved stats'
    },
    { value: 'exit', label: '🚪 Exit', description: 'Exit the CLI' }
]

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days (default)' },
    { value: '6mo', label: 'Last 6 months' },
    { value: '12mo', label: 'Last 12 months' },
    { value: 'all', label: 'All time' }
]

// ============================================================================
// Readline Interface
// ============================================================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim())
        })
    })
}

function close(): void {
    rl.close()
}

// ============================================================================
// Environment Validation
// ============================================================================

function validateEnvironment(): boolean {
    const missing: string[] = []

    if (!GHOST_SITE_URL) missing.push('GHOST_SITE_URL')
    if (!GHOST_ADMIN_API_KEY) missing.push('GHOST_ADMIN_API_KEY')
    if (!GHOST_CONTENT_API_KEY) missing.push('GHOST_CONTENT_API_KEY')
    if (!PLAUSIBLE_API_KEY) missing.push('PLAUSIBLE_API_KEY')
    if (!PLAUSIBLE_SITE_ID) missing.push('PLAUSIBLE_SITE_ID')

    if (missing.length > 0) {
        showError('Missing required environment variables:')
        for (const varName of missing) {
            console.log(`  - ${varName}`)
        }
        console.log('\nPlease add these to your .env file.')
        return false
    }

    return true
}

// ============================================================================
// API Clients
// ============================================================================

function createClients(): {
    adminClient: GhostAdminApiClient
    contentClient: GhostContentApiClient
    plausibleClient: PlausibleApiClient
} {
    const adminClient = new GhostAdminApiClient({
        siteUrl: GHOST_SITE_URL!,
        adminApiKey: GHOST_ADMIN_API_KEY!
    })

    const contentClient = new GhostContentApiClient({
        siteUrl: GHOST_SITE_URL!,
        contentApiKey: GHOST_CONTENT_API_KEY!
    })

    const plausibleClient = new PlausibleApiClient({
        apiKey: PLAUSIBLE_API_KEY!,
        siteId: PLAUSIBLE_SITE_ID!
    })

    return { adminClient, contentClient, plausibleClient }
}

// ============================================================================
// Stats Fetching
// ============================================================================

async function fetchStats(period: StatsPeriod): Promise<GhostStatsFile> {
    const { adminClient, contentClient, plausibleClient } = createClients()
    const periodDays = PERIOD_DAYS[period as PlausiblePeriod] ?? 30

    showInfo('Fetching member stats from Ghost Admin API...')
    const memberCounts = await adminClient.getMemberCounts()
    const memberGrowth = await adminClient.getMemberGrowth(periodDays)
    const mrr = await adminClient.calculateMrr()

    const members: MemberStats = {
        ...memberCounts,
        growth: memberGrowth
    }

    showInfo('Fetching content stats from Ghost Content API...')
    const blogPosts = await contentClient.getPostCountByTag('blog')
    const newsletters = await contentClient.getPostCountByTag('newsletter')
    const totalPosts = await contentClient.getTotalPostCount()

    const content: ContentStats = {
        blogPosts,
        newsletters,
        totalPosts
    }

    showInfo('Fetching visitor stats from Plausible...')
    const { current, comparison } = await plausibleClient.getAggregateStatsWithComparison(
        period as PlausiblePeriod
    )
    const topSources = await plausibleClient.getTopSources(period as PlausiblePeriod, 5)
    const topPages = await plausibleClient.getTopPages(period as PlausiblePeriod, 10)

    // Detect milestones
    const milestones = detectAllMilestones(members, mrr, content)

    const stats: GhostStatsFile = {
        fetchedAt: new Date().toISOString(),
        period,
        ghost: {
            members,
            mrr,
            content
        },
        plausible: {
            current,
            comparison,
            topSources,
            topPages
        },
        milestones
    }

    // Validate against schema
    GhostStatsFileSchema.parse(stats)

    return stats
}

// ============================================================================
// Display Functions
// ============================================================================

function formatNumber(value: number): string {
    return value.toLocaleString()
}

function formatChange(value: number, isPercent = false): string {
    const sign = value > 0 ? '+' : ''
    const suffix = isPercent ? '%' : ''
    const color = value > 0 ? colors.green : value < 0 ? colors.red : colors.dim
    return `${color}${sign}${value.toFixed(1)}${suffix}${colors.reset}`
}

function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
}

function formatCurrency(amount: number, currency: string): string {
    const symbol = currency === 'EUR' ? '€' : currency
    return `${symbol}${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`
}

function displayStats(stats: GhostStatsFile): void {
    const boxWidth = 60
    const periodLabel = PERIOD_DISPLAY_NAMES[stats.period]

    console.log('')
    console.log(`${colors.bright}${colors.cyan}╔${'═'.repeat(boxWidth - 2)}╗${colors.reset}`)
    console.log(
        `${colors.bright}${colors.cyan}║${centerText(`GHOST & PLAUSIBLE STATS (${periodLabel})`, boxWidth - 2)}║${colors.reset}`
    )
    console.log(`${colors.bright}${colors.cyan}╠${'═'.repeat(boxWidth - 2)}╣${colors.reset}`)

    // Milestones (if any)
    if (stats.milestones.length > 0) {
        const formattedMilestones = formatMilestonesForConsole(stats.milestones)
        for (const milestone of formattedMilestones) {
            console.log(
                `${colors.bright}${colors.cyan}║${colors.reset} ${colors.yellow}${milestone.padEnd(boxWidth - 4)}${colors.reset} ${colors.bright}${colors.cyan}║${colors.reset}`
            )
        }
        console.log(`${colors.bright}${colors.cyan}╠${'═'.repeat(boxWidth - 2)}╣${colors.reset}`)
    }

    // Members section
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset} ${colors.bright}MEMBERS${colors.reset}${' '.repeat(boxWidth - 11)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    const memberLine = `  Total: ${formatNumber(stats.ghost.members.total)}    Free: ${formatNumber(stats.ghost.members.free)}    Paid: ${formatNumber(stats.ghost.members.paid)}    Comped: ${formatNumber(stats.ghost.members.comped)}`
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset}${memberLine.padEnd(boxWidth - 2)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    const growthLine = `  Growth: ${formatChange(stats.ghost.members.growth.newThisPeriod)} new (${formatChange(stats.ghost.members.growth.growthRate, true)})`
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset}${padWithoutAnsi(growthLine, boxWidth - 2)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    const mrrLine = `  MRR: ${formatCurrency(stats.ghost.mrr.amount, stats.ghost.mrr.currency)}`
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset}${mrrLine.padEnd(boxWidth - 2)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    console.log(`${colors.bright}${colors.cyan}╠${'═'.repeat(boxWidth - 2)}╣${colors.reset}`)

    // Content section
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset} ${colors.bright}CONTENT${colors.reset}${' '.repeat(boxWidth - 11)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    const contentLine = `  Blog Posts: ${formatNumber(stats.ghost.content.blogPosts)}    Newsletters: ${formatNumber(stats.ghost.content.newsletters)}`
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset}${contentLine.padEnd(boxWidth - 2)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    console.log(`${colors.bright}${colors.cyan}╠${'═'.repeat(boxWidth - 2)}╣${colors.reset}`)

    // Visitors section
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset} ${colors.bright}VISITORS (vs previous period)${colors.reset}${' '.repeat(boxWidth - 33)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    const visitorsLine = `  Unique: ${formatNumber(stats.plausible.current.visitors)} (${formatChange(stats.plausible.comparison.visitors.changePercent, true)})    Pageviews: ${formatNumber(stats.plausible.current.pageviews)} (${formatChange(stats.plausible.comparison.pageviews.changePercent, true)})`
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset}${padWithoutAnsi(visitorsLine, boxWidth - 2)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    const metricsLine = `  Bounce: ${stats.plausible.current.bounceRate.toFixed(1)}% (${formatChange(stats.plausible.comparison.bounceRate.change)})    Duration: ${formatDuration(stats.plausible.current.visitDuration)} (${formatChange(stats.plausible.comparison.visitDuration.change)}s)`
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset}${padWithoutAnsi(metricsLine, boxWidth - 2)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    console.log(`${colors.bright}${colors.cyan}╠${'═'.repeat(boxWidth - 2)}╣${colors.reset}`)

    // Top Traffic Sources
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset} ${colors.bright}TOP TRAFFIC SOURCES${colors.reset}${' '.repeat(boxWidth - 23)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    for (let i = 0; i < stats.plausible.topSources.length; i++) {
        const source = stats.plausible.topSources[i]
        const sourceLine = `  ${i + 1}. ${source.name.padEnd(20)} ${formatNumber(source.visitors)} visitors`
        console.log(
            `${colors.bright}${colors.cyan}║${colors.reset}${sourceLine.padEnd(boxWidth - 2)}${colors.bright}${colors.cyan}║${colors.reset}`
        )
    }

    console.log(`${colors.bright}${colors.cyan}╠${'═'.repeat(boxWidth - 2)}╣${colors.reset}`)

    // Top Pages
    console.log(
        `${colors.bright}${colors.cyan}║${colors.reset} ${colors.bright}TOP PAGES${colors.reset}${' '.repeat(boxWidth - 13)}${colors.bright}${colors.cyan}║${colors.reset}`
    )

    const pagesToShow = Math.min(5, stats.plausible.topPages.length)
    for (let i = 0; i < pagesToShow; i++) {
        const page = stats.plausible.topPages[i]
        const truncatedPath = page.page.length > 30 ? page.page.substring(0, 27) + '...' : page.page
        const pageLine = `  ${i + 1}. ${truncatedPath.padEnd(32)} ${formatNumber(page.visitors)} views`
        console.log(
            `${colors.bright}${colors.cyan}║${colors.reset}${pageLine.padEnd(boxWidth - 2)}${colors.bright}${colors.cyan}║${colors.reset}`
        )
    }

    if (stats.plausible.topPages.length > pagesToShow) {
        const moreLine = `  ... (${stats.plausible.topPages.length - pagesToShow} more)`
        console.log(
            `${colors.bright}${colors.cyan}║${colors.reset}${colors.dim}${moreLine.padEnd(boxWidth - 2)}${colors.reset}${colors.bright}${colors.cyan}║${colors.reset}`
        )
    }

    console.log(`${colors.bright}${colors.cyan}╚${'═'.repeat(boxWidth - 2)}╝${colors.reset}`)
    console.log('')
}

function centerText(text: string, width: number): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2))
    return ' '.repeat(padding) + text + ' '.repeat(width - padding - text.length)
}

function padWithoutAnsi(text: string, width: number): string {
    // Strip ANSI codes for length calculation
    // eslint-disable-next-line no-control-regex
    const stripped = text.replace(/\x1b\[[0-9;]*m/g, '')
    const padding = Math.max(0, width - stripped.length)
    return text + ' '.repeat(padding)
}

// ============================================================================
// File Operations
// ============================================================================

async function ensureExportsDir(): Promise<void> {
    await fs.mkdir(EXPORTS_DIR, { recursive: true })
}

async function saveStats(stats: GhostStatsFile): Promise<void> {
    await ensureExportsDir()
    await fs.writeFile(STATS_FILE_PATH, JSON.stringify(stats, null, 2))
    showSuccess(`Stats saved to ${STATS_FILE_PATH}`)
}

async function saveMarkdownReport(stats: GhostStatsFile): Promise<void> {
    await ensureExportsDir()
    const report = generateMarkdownReport(stats)
    await fs.writeFile(REPORT_FILE_PATH, report)
    showSuccess(`Markdown report saved to ${REPORT_FILE_PATH}`)
}

async function loadSavedStats(): Promise<GhostStatsFile | null> {
    try {
        const content = await fs.readFile(STATS_FILE_PATH, 'utf-8')
        const data = JSON.parse(content)
        return GhostStatsFileSchema.parse(data)
    } catch {
        return null
    }
}

// ============================================================================
// Menu Functions
// ============================================================================

async function showMenu(): Promise<MenuOption> {
    console.log('\n')
    for (let i = 0; i < MENU_OPTIONS.length; i++) {
        const opt = MENU_OPTIONS[i]
        console.log(
            `  ${colors.bright}${i + 1}${colors.reset}. ${opt.label}  ${colors.dim}${opt.description}${colors.reset}`
        )
    }
    console.log('')

    const answer = await prompt(
        `${colors.cyan}Select option (1-${MENU_OPTIONS.length}): ${colors.reset}`
    )
    const index = parseInt(answer, 10) - 1

    if (index >= 0 && index < MENU_OPTIONS.length) {
        return MENU_OPTIONS[index].value
    }

    showWarning('Invalid option. Please try again.')
    return showMenu()
}

async function selectPeriod(): Promise<StatsPeriod> {
    console.log('\n')
    for (let i = 0; i < PERIOD_OPTIONS.length; i++) {
        const opt = PERIOD_OPTIONS[i]
        console.log(`  ${colors.bright}${i + 1}${colors.reset}. ${opt.label}`)
    }
    console.log('')

    const answer = await prompt(
        `${colors.cyan}Select period (1-${PERIOD_OPTIONS.length}, default: 2): ${colors.reset}`
    )

    if (!answer) {
        return '30d' // Default
    }

    const index = parseInt(answer, 10) - 1

    if (index >= 0 && index < PERIOD_OPTIONS.length) {
        return PERIOD_OPTIONS[index].value
    }

    showWarning('Invalid option. Using default (30 days).')
    return '30d'
}

// ============================================================================
// Main Actions
// ============================================================================

async function handleViewStats(): Promise<void> {
    showOperationHeader('View Stats')

    const period = await selectPeriod()

    try {
        console.log('')
        const stats = await fetchStats(period)
        displayStats(stats)
    } catch (error) {
        if (error instanceof GhostApiError) {
            showError(`Ghost API error: ${error.message}`)
        } else if (error instanceof PlausibleApiError) {
            showError(`Plausible API error: ${error.message}`)
        } else {
            showError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }
}

async function handleSaveStats(): Promise<void> {
    showOperationHeader('Save Stats (JSON)')

    const period = await selectPeriod()

    try {
        console.log('')
        const stats = await fetchStats(period)
        await saveStats(stats)
        displayStats(stats)
    } catch (error) {
        if (error instanceof GhostApiError) {
            showError(`Ghost API error: ${error.message}`)
        } else if (error instanceof PlausibleApiError) {
            showError(`Plausible API error: ${error.message}`)
        } else {
            showError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }
}

async function handleExportMarkdown(): Promise<void> {
    showOperationHeader('Export Markdown Report')

    const period = await selectPeriod()

    try {
        console.log('')
        const stats = await fetchStats(period)
        await saveMarkdownReport(stats)
        displayStats(stats)
    } catch (error) {
        if (error instanceof GhostApiError) {
            showError(`Ghost API error: ${error.message}`)
        } else if (error instanceof PlausibleApiError) {
            showError(`Plausible API error: ${error.message}`)
        } else {
            showError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }
}

async function handleViewSaved(): Promise<void> {
    showOperationHeader('View Saved Stats')

    const stats = await loadSavedStats()

    if (!stats) {
        showWarning('No saved stats found. Use "Save Stats" first.')
        return
    }

    displayStats(stats)
    showInfo(`Stats from: ${new Date(stats.fetchedAt).toLocaleString()}`)
}

// ============================================================================
// Main Loop
// ============================================================================

async function main(): Promise<void> {
    showBanner('Ghost Stats', 'Newsletter & Analytics Dashboard', '📊')

    if (!validateEnvironment()) {
        close()
        process.exit(1)
    }

    let running = true

    while (running) {
        const option = await showMenu()

        switch (option) {
            case 'view':
                await handleViewStats()
                break
            case 'save':
                await handleSaveStats()
                break
            case 'export':
                await handleExportMarkdown()
                break
            case 'view-saved':
                await handleViewSaved()
                break
            case 'exit':
                running = false
                break
        }

        if (running) {
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        }
    }

    showGoodbye('Ghost Stats CLI')
    close()
}

// Run
main().catch((error) => {
    showError(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    close()
    process.exit(1)
})
