#!/usr/bin/env bun

/**
 * Sync Gumroad Data
 *
 * Fetches ratings, sales counts, and price data from Gumroad API
 * and updates local product stats files.
 *
 * Features:
 * - Sync ratings from Gumroad sales to {product-id}-stats.json files
 * - Update userCount based on sales (only if higher than existing)
 * - Verify prices match between local and Gumroad
 * - Uses _redirects file for Gumroad slug → local product mapping
 *
 * Usage:
 *   bun run sync:gumroad
 *   bun scripts/sync-gumroad.ts
 *
 * Requires GUMROAD_ACCESS_TOKEN environment variable (from .env file)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { select } from '@inquirer/prompts'
import { GumroadApiClient, GumroadApiError } from './utils/gumroad/api-client.js'
import { parseRedirects, getUniqueLocalProductIds } from './utils/gumroad/redirects-parser.js'
import type {
    GumroadMapping,
    GumroadProduct,
    GumroadSale,
    SyncResult,
    SyncSummary
} from './utils/gumroad/types.js'
import { StatsFileSchema, type Stats, type Rating } from '../src/schemas/stats.schema.js'
import { IndividualProductSchema, type IndividualProduct } from '../src/schemas/product.schema.js'
import {
    colors,
    showBanner,
    showError,
    showInfo,
    showOperationHeader,
    showSectionHeader,
    showGoodbye
} from './utils/cli-display.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Directories
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')
const REDIRECTS_FILE = resolve(__dirname, '../public/_redirects')

// Products to exclude from userCount updates (data is meaningless for these)
const USER_COUNT_BLACKLIST = new Set(['knowii-community', 'knowledge-worker-kit'])

/**
 * Load and parse the _redirects file
 */
function loadRedirectsMappings(): GumroadMapping[] {
    if (!existsSync(REDIRECTS_FILE)) {
        throw new Error(`_redirects file not found at ${REDIRECTS_FILE}`)
    }
    const content = readFileSync(REDIRECTS_FILE, 'utf-8')
    return parseRedirects(content)
}

/**
 * Load a local product JSON file
 */
function loadLocalProduct(productId: string): IndividualProduct | null {
    const productPath = join(PRODUCTS_DIR, `${productId}.json`)
    if (!existsSync(productPath)) {
        return null
    }
    try {
        const content = readFileSync(productPath, 'utf-8')
        const parsed = JSON.parse(content)
        const result = IndividualProductSchema.safeParse(parsed)
        if (result.success) {
            return result.data
        }
        console.error(`  ${colors.dim}Invalid product schema for ${productId}${colors.reset}`)
        return null
    } catch {
        return null
    }
}

/**
 * Load existing stats for a product
 */
function loadStats(productId: string): Stats {
    const statsPath = join(PRODUCTS_DIR, `${productId}-stats.json`)
    if (!existsSync(statsPath)) {
        return {}
    }
    try {
        const content = readFileSync(statsPath, 'utf-8')
        const parsed = JSON.parse(content)
        const result = StatsFileSchema.safeParse(parsed)
        if (result.success) {
            return result.data.data
        }
        return {}
    } catch {
        return {}
    }
}

/**
 * Save stats for a product
 */
function saveStats(productId: string, stats: Stats): void {
    const statsPath = join(PRODUCTS_DIR, `${productId}-stats.json`)
    const output = { data: stats }
    writeFileSync(statsPath, JSON.stringify(output, null, 4) + '\n')
}

/**
 * Parse existing userCount to extract numeric value
 */
function parseUserCount(userCount: string | undefined): number {
    if (!userCount) return 0
    // Match patterns like "500+ users", "1,000+ users", "10 users"
    const match = userCount.match(/^([\d,]+)\+?\s*users?$/i)
    if (!match) return 0
    return parseInt(match[1].replace(/,/g, ''), 10)
}

/**
 * Format a number as userCount string
 */
function formatUserCount(count: number): string {
    if (count === 0) return '0'
    if (count < 10) return `${count}+`
    if (count < 50) return `${Math.floor(count / 10) * 10}+`
    if (count < 100) return `${Math.floor(count / 50) * 50}+`
    if (count < 1000) return `${Math.floor(count / 100) * 100}+`
    const thousands = Math.floor(count / 1000)
    return `${thousands.toLocaleString()},000+`
}

/**
 * Check if new userCount should replace existing
 * Only update if new value is higher (users may have joined via other channels)
 * Also respects the USER_COUNT_BLACKLIST
 */
function shouldUpdateUserCount(
    productId: string,
    existing: string | undefined,
    newCount: number
): boolean {
    // Check blacklist first
    if (USER_COUNT_BLACKLIST.has(productId)) {
        return false
    }
    const existingCount = parseUserCount(existing)
    return newCount > existingCount
}

/**
 * Extract ratings from Gumroad sales
 * Note: Uses product_rating field (the actual Gumroad API field name)
 */
function extractRatingsFromSales(sales: GumroadSale[]): Rating[] {
    const ratings: Rating[] = []
    for (const sale of sales) {
        // Only include sales that have a product_rating (most are null - only customers who rated have a value)
        if (sale.product_rating !== undefined && sale.product_rating !== null) {
            ratings.push({
                id: sale.id,
                rating: sale.product_rating,
                date: sale.created_at?.split('T')[0] || null
            })
        }
    }
    return ratings
}

/**
 * Merge ratings, preserving existing non-Gumroad ratings
 */
function mergeRatings(existingStats: Stats, newGumroadRatings: Rating[]): Stats['ratings'] {
    const merged: Stats['ratings'] = {}

    // Preserve existing non-Gumroad ratings
    if (existingStats.ratings) {
        for (const [source, ratings] of Object.entries(existingStats.ratings)) {
            if (source !== 'gumroad') {
                merged[source] = ratings
            }
        }
    }

    // Add/replace Gumroad ratings
    if (newGumroadRatings.length > 0) {
        merged.gumroad = newGumroadRatings
    }

    return Object.keys(merged).length > 0 ? merged : undefined
}

/**
 * Check if local price matches Gumroad price
 * Skips subscription products (complex variant pricing)
 */
function checkPriceMatch(
    localProduct: IndividualProduct,
    gumroadProduct: GumroadProduct
): {
    match: boolean
    localPrice: number
    gumroadPrice: number
    skipped: boolean
    skipReason?: string
} {
    // Skip subscription products - they have complex variant pricing
    if (localProduct.isSubscription) {
        return {
            match: true,
            localPrice: localProduct.price,
            gumroadPrice: gumroadProduct.price / 100,
            skipped: true,
            skipReason: 'subscription product'
        }
    }

    // Skip products with variants (non-subscription bundles, etc.)
    if (localProduct.variants && localProduct.variants.length > 0) {
        return {
            match: true,
            localPrice: localProduct.price,
            gumroadPrice: gumroadProduct.price / 100,
            skipped: true,
            skipReason: 'product has variants'
        }
    }

    // Gumroad price is in cents, local price is in euros/dollars
    const gumroadPriceEuros = gumroadProduct.price / 100
    const localPrice = localProduct.price
    // Allow small difference for rounding (0.01)
    const match = Math.abs(localPrice - gumroadPriceEuros) < 0.02
    return { match, localPrice, gumroadPrice: gumroadPriceEuros, skipped: false }
}

/**
 * Sync a single product
 */
async function syncProduct(
    localProductId: string,
    gumroadProduct: GumroadProduct,
    client: GumroadApiClient,
    options: { syncRatings: boolean; syncSales: boolean; verifyPrices: boolean; debug?: boolean }
): Promise<SyncResult> {
    const result: SyncResult = {
        localProductId,
        gumroadPermalink: gumroadProduct.permalink,
        status: 'success',
        message: ''
    }

    try {
        const localProduct = loadLocalProduct(localProductId)
        if (!localProduct) {
            return {
                ...result,
                status: 'skipped',
                message: 'Local product not found'
            }
        }

        const existingStats = loadStats(localProductId)
        const updatedStats = { ...existingStats }
        const messages: string[] = []

        // Sync ratings
        if (options.syncRatings) {
            const sales = await client.getProductSales(gumroadProduct.id)

            // Debug: log first sale structure to diagnose rating field
            if (options.debug && sales.length > 0) {
                console.log(
                    `\n${colors.dim}[DEBUG] First sale for ${localProductId}:${colors.reset}`
                )
                console.log(colors.dim + JSON.stringify(sales[0], null, 2) + colors.reset)
            }

            const ratings = extractRatingsFromSales(sales)
            updatedStats.ratings = mergeRatings(existingStats, ratings)
            result.ratingsAdded = ratings.length
            messages.push(`${ratings.length} ratings from ${sales.length} sales`)
        }

        // Sync sales count
        if (options.syncSales) {
            const salesCount = gumroadProduct.sales_count
            result.salesCount = salesCount
            if (shouldUpdateUserCount(localProductId, existingStats.userCount, salesCount)) {
                updatedStats.userCount = formatUserCount(salesCount)
                result.userCountUpdated = true
                messages.push(`${salesCount} sales`)
            } else {
                const reason = USER_COUNT_BLACKLIST.has(localProductId)
                    ? 'blacklisted'
                    : 'kept existing'
                messages.push(`${salesCount} sales (${reason})`)
            }
        }

        // Verify prices (skip subscription products and products with variants)
        if (options.verifyPrices) {
            const priceCheck = checkPriceMatch(localProduct, gumroadProduct)
            if (priceCheck.skipped) {
                // Don't count as mismatch, just note it was skipped
                result.priceMatch = true
            } else {
                result.priceMatch = priceCheck.match
                if (!priceCheck.match) {
                    messages.push(
                        `Price mismatch: local €${priceCheck.localPrice.toFixed(2)} vs Gumroad €${priceCheck.gumroadPrice.toFixed(2)}`
                    )
                }
            }
        }

        // Save updated stats
        saveStats(localProductId, updatedStats)

        result.message = messages.join(', ')
        return result
    } catch (error) {
        return {
            ...result,
            status: 'error',
            message: error instanceof Error ? error.message : String(error)
        }
    }
}

/**
 * Display sync results
 */
function displayResults(results: SyncResult[], summary: SyncSummary): void {
    showOperationHeader('SYNC RESULTS')

    for (const result of results) {
        const statusIcon =
            result.status === 'success' ? '✅' : result.status === 'skipped' ? '⚠️' : '❌'
        const statusColor =
            result.status === 'success'
                ? colors.green
                : result.status === 'skipped'
                  ? colors.yellow
                  : colors.red

        console.log(
            `  ${statusIcon} ${colors.bright}${result.localProductId}${colors.reset}: ${statusColor}${result.message}${colors.reset}`
        )
    }

    // Price verification summary
    const priceMismatches = results.filter((r) => r.priceMatch === false)
    if (priceMismatches.length > 0) {
        showOperationHeader('PRICE MISMATCHES')
        for (const result of priceMismatches) {
            console.log(`  ⚠️  ${result.localProductId}: ${result.message}`)
        }
    }

    showSectionHeader('SUMMARY')
    console.log(
        `  Synced: ${summary.synced} | Skipped: ${summary.skipped} | Errors: ${summary.errors}`
    )
    console.log(`  Ratings: ${summary.totalRatings} | Price mismatches: ${summary.priceMismatches}`)
}

/**
 * Display product mappings
 */
function displayMappings(mappings: GumroadMapping[], gumroadProducts: GumroadProduct[]): void {
    showOperationHeader('PRODUCT MAPPINGS')

    const uniqueLocalIds = getUniqueLocalProductIds(mappings)

    for (const localId of uniqueLocalIds) {
        const slugsForProduct = mappings
            .filter((m) => m.localProductId === localId)
            .map((m) => m.gumroadSlug)

        // Find matching Gumroad product (use permalink or custom_permalink)
        const gumroadProduct = gumroadProducts.find((gp) => {
            const slug = gp.permalink || gp.custom_permalink
            return slug && slugsForProduct.some((s) => s.toLowerCase() === slug.toLowerCase())
        })

        const status = gumroadProduct ? colors.green + '✓' : colors.red + '✗'
        const gumroadInfo = gumroadProduct
            ? `(${gumroadProduct.sales_count} sales)`
            : '(not found on Gumroad)'

        console.log(
            `  ${status}${colors.reset} ${colors.bright}${localId}${colors.reset} → ${slugsForProduct.join(', ')} ${colors.dim}${gumroadInfo}${colors.reset}`
        )
    }
}

/**
 * Main sync function
 */
async function runSync(options: {
    syncRatings: boolean
    syncSales: boolean
    verifyPrices: boolean
    productFilter?: string
    debug?: boolean
}): Promise<void> {
    // Check for access token
    const accessToken = process.env.GUMROAD_ACCESS_TOKEN
    if (!accessToken) {
        showError('GUMROAD_ACCESS_TOKEN not found in environment')
        showInfo('Create a .env file with your Gumroad API token')
        showInfo('Example: GUMROAD_ACCESS_TOKEN=your_token_here')
        process.exit(1)
    }

    // Initialize client
    const client = new GumroadApiClient({ accessToken })

    // Load mappings from _redirects
    showInfo('Loading product mappings from _redirects...')
    const mappings = loadRedirectsMappings()
    const uniqueLocalIds = getUniqueLocalProductIds(mappings)
    showInfo(`Found ${uniqueLocalIds.length} local products with Gumroad mappings`)

    // Fetch Gumroad products
    showInfo('Fetching products from Gumroad API...')
    let gumroadProducts: GumroadProduct[]
    try {
        gumroadProducts = await client.getProducts()
        showInfo(`Found ${gumroadProducts.length} products on Gumroad`)
    } catch (error) {
        if (error instanceof GumroadApiError) {
            showError(`Gumroad API error: ${error.message} (status ${error.statusCode})`)
        } else {
            showError(`Failed to fetch Gumroad products: ${error}`)
        }
        process.exit(1)
    }

    showOperationHeader('SYNCING PRODUCTS')

    const results: SyncResult[] = []
    const summary: SyncSummary = {
        totalProducts: 0,
        synced: 0,
        skipped: 0,
        errors: 0,
        totalRatings: 0,
        totalSales: 0,
        priceMismatches: 0
    }

    // Determine which products to sync
    const productsToSync = options.productFilter
        ? uniqueLocalIds.filter((id) => id === options.productFilter)
        : uniqueLocalIds

    for (const localProductId of productsToSync) {
        summary.totalProducts++

        // Find Gumroad slugs for this local product
        const slugsForProduct = mappings
            .filter((m) => m.localProductId === localProductId)
            .map((m) => m.gumroadSlug)

        // Find matching Gumroad product (use permalink or custom_permalink)
        const gumroadProduct = gumroadProducts.find((gp) => {
            const slug = gp.permalink || gp.custom_permalink
            return slug && slugsForProduct.some((s) => s.toLowerCase() === slug.toLowerCase())
        })

        if (!gumroadProduct) {
            results.push({
                localProductId,
                gumroadPermalink: slugsForProduct[0] || 'unknown',
                status: 'skipped',
                message: 'No matching Gumroad product found'
            })
            summary.skipped++
            continue
        }

        const result = await syncProduct(localProductId, gumroadProduct, client, {
            ...options,
            debug: options.debug
        })
        results.push(result)

        if (result.status === 'success') {
            summary.synced++
            summary.totalRatings += result.ratingsAdded ?? 0
            summary.totalSales += result.salesCount ?? 0
            if (result.priceMatch === false) {
                summary.priceMismatches++
            }
        } else if (result.status === 'skipped') {
            summary.skipped++
        } else {
            summary.errors++
        }
    }

    displayResults(results, summary)
}

/**
 * Interactive menu
 */
async function interactiveMenu(): Promise<void> {
    showBanner('GUMROAD SYNC', 'Sync ratings, sales, and prices from Gumroad', '📊')

    while (true) {
        const choice = await select({
            message: 'What would you like to do?',
            choices: [
                {
                    name: '🔄 Sync All (ratings + sales + prices)',
                    value: 'sync-all',
                    description: 'Full sync of all data from Gumroad'
                },
                {
                    name: '📊 Sync Ratings Only',
                    value: 'sync-ratings',
                    description: 'Only sync ratings to stats files'
                },
                {
                    name: '👥 Sync Sales Counts Only',
                    value: 'sync-sales',
                    description: 'Only update userCount from sales'
                },
                {
                    name: '💰 Verify Prices Only',
                    value: 'verify-prices',
                    description: 'Compare local prices with Gumroad'
                },
                {
                    name: '📋 List Product Mappings',
                    value: 'list-mappings',
                    description: 'Show Gumroad → local product mappings'
                },
                {
                    name: '👋 Exit',
                    value: 'exit',
                    description: 'Exit the CLI'
                }
            ]
        })

        if (choice === 'exit') {
            showGoodbye('Gumroad Sync')
            return
        }

        if (choice === 'list-mappings') {
            const accessToken = process.env.GUMROAD_ACCESS_TOKEN
            if (!accessToken) {
                showError('GUMROAD_ACCESS_TOKEN not found in environment')
                continue
            }

            const client = new GumroadApiClient({ accessToken })
            const mappings = loadRedirectsMappings()

            showInfo('Fetching products from Gumroad API...')
            try {
                const gumroadProducts = await client.getProducts()
                displayMappings(mappings, gumroadProducts)
            } catch (error) {
                showError(`Failed to fetch Gumroad products: ${error}`)
            }
            continue
        }

        const options = {
            syncRatings: choice === 'sync-all' || choice === 'sync-ratings',
            syncSales: choice === 'sync-all' || choice === 'sync-sales',
            verifyPrices: choice === 'sync-all' || choice === 'verify-prices'
        }

        await runSync(options)

        const continueChoice = await select({
            message: 'What would you like to do next?',
            choices: [
                { name: '🔄 Return to menu', value: 'menu' },
                { name: '👋 Exit', value: 'exit' }
            ]
        })

        if (continueChoice === 'exit') {
            showGoodbye('Gumroad Sync')
            return
        }

        showBanner('GUMROAD SYNC', 'Sync ratings, sales, and prices from Gumroad', '📊')
    }
}

/**
 * Parse CLI arguments
 */
function parseArgs(): {
    syncAll?: boolean
    syncRatings?: boolean
    syncSales?: boolean
    verifyPrices?: boolean
    product?: string
    listMappings?: boolean
    debug?: boolean
} {
    const args: Record<string, string | boolean> = {}
    const processArgs = process.argv.slice(2)

    for (let i = 0; i < processArgs.length; i++) {
        const arg = processArgs[i]
        if (arg === '--all') {
            args.syncAll = true
        } else if (arg === '--ratings') {
            args.syncRatings = true
        } else if (arg === '--sales') {
            args.syncSales = true
        } else if (arg === '--prices') {
            args.verifyPrices = true
        } else if (arg === '--list') {
            args.listMappings = true
        } else if (arg === '--debug') {
            args.debug = true
        } else if (arg === '--product' && processArgs[i + 1]) {
            args.product = processArgs[i + 1]
            i++
        }
    }

    return args
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
    const args = parseArgs()

    // If CLI args provided, run in non-interactive mode
    if (
        args.syncAll ||
        args.syncRatings ||
        args.syncSales ||
        args.verifyPrices ||
        args.listMappings
    ) {
        if (args.listMappings) {
            const accessToken = process.env.GUMROAD_ACCESS_TOKEN
            if (!accessToken) {
                showError('GUMROAD_ACCESS_TOKEN not found in environment')
                process.exit(1)
            }

            const client = new GumroadApiClient({ accessToken })
            const mappings = loadRedirectsMappings()
            const gumroadProducts = await client.getProducts()
            displayMappings(mappings, gumroadProducts)
            return
        }

        const options = {
            syncRatings: args.syncAll || args.syncRatings || false,
            syncSales: args.syncAll || args.syncSales || false,
            verifyPrices: args.syncAll || args.verifyPrices || false,
            productFilter: typeof args.product === 'string' ? args.product : undefined,
            debug: args.debug || false
        }

        await runSync(options)
        return
    }

    // Interactive mode
    try {
        await interactiveMenu()
    } catch (error) {
        // Handle Ctrl+C gracefully
        if (error && typeof error === 'object' && 'name' in error) {
            if ((error as { name: string }).name === 'ExitPromptError') {
                showGoodbye('Gumroad Sync')
                process.exit(0)
            }
        }
        throw error
    }
}

if (import.meta.main) {
    main().catch((error) => {
        showError(`Unexpected error: ${error}`)
        process.exit(1)
    })
}
