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
 * - Check for missing products (Gumroad products not in local store)
 * - List customers who haven't left a review for their purchases
 * - Uses _redirects file for Gumroad slug → local product mapping
 *
 * Usage:
 *   bun run sync:gumroad                    # Interactive mode
 *   bun scripts/sync-gumroad.ts --all       # Sync all (ratings + sales + prices)
 *   bun scripts/sync-gumroad.ts --products       # List all Gumroad products
 *   bun scripts/sync-gumroad.ts --check-missing  # Find missing products
 *   bun scripts/sync-gumroad.ts --no-review      # List customers without reviews
 *   bun scripts/sync-gumroad.ts --export         # Export customers without reviews to JSON
 *
 * Requires GUMROAD_ACCESS_TOKEN environment variable (from .env file)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { select } from '@inquirer/prompts'
import { GumroadApiClient, GumroadApiError } from './utils/gumroad/api-client.js'
import { parseRedirects, getUniqueLocalProductIds } from './utils/gumroad/redirects-parser.js'
import type {
    CustomerWithoutReview,
    GumroadMapping,
    GumroadProduct,
    GumroadSale,
    SyncResult,
    SyncSummary
} from './utils/gumroad/types.js'
import {
    StatsFileSchema,
    type Stats,
    type Rating,
    type StatItem
} from '../src/schemas/stats.schema.js'
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

// Directories and files
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')
const REDIRECTS_FILE = resolve(__dirname, '../public/_redirects')
const EXPORTS_DIR = resolve(__dirname, '../exports')
const CUSTOMERS_EXPORT_FILE = resolve(EXPORTS_DIR, 'customers-without-reviews.json')

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
 * Default stats object with all required fields
 */
function getDefaultStats(): Stats {
    return {
        userCount: null,
        timeSaved: null,
        ratings: null,
        additionalStats: [],
        lastSale: null
    }
}

/**
 * Load existing stats for a product
 * Returns default stats if file doesn't exist or parsing fails
 * Gracefully handles schema changes by preserving existing data
 */
function loadStats(productId: string): Stats {
    const statsPath = join(PRODUCTS_DIR, `${productId}-stats.json`)
    const defaults = getDefaultStats()

    if (!existsSync(statsPath)) {
        return defaults
    }

    try {
        const content = readFileSync(statsPath, 'utf-8')
        const parsed = JSON.parse(content)
        const result = StatsFileSchema.safeParse(parsed)

        if (result.success) {
            return result.data.data
        }

        // Schema validation failed - try to preserve existing data
        // Merge raw data with defaults to ensure all required fields exist
        const rawData = parsed?.data || {}
        return {
            ...defaults,
            ...rawData,
            // Ensure additionalStats is always an array
            additionalStats: Array.isArray(rawData.additionalStats) ? rawData.additionalStats : []
        }
    } catch {
        return defaults
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
 * Parse existing userCount (string or StatItem) to extract numeric value
 */
function parseUserCount(userCount: StatItem | undefined | null): number {
    if (!userCount) return 0

    // Handle both string and object formats
    const value = typeof userCount === 'string' ? userCount : userCount.value

    // Match patterns like "500+ users", "1,000+ users", "10 users", "500+", etc.
    const match = value.match(/^([\d,]+)\+?/)
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
 * Update userCount while preserving custom label if present.
 * Returns the new StatItem value to save.
 */
function updateUserCountValue(existing: StatItem | undefined | null, newValue: string): StatItem {
    if (!existing || typeof existing === 'string') {
        // No custom label, just use the new value as a string
        return newValue
    }

    // Preserve the custom label from the existing object
    return {
        value: newValue,
        label: existing.label
    }
}

/**
 * Check if new userCount should replace existing
 * Only update if new value is higher (users may have joined via other channels)
 * Also respects the USER_COUNT_BLACKLIST
 */
function shouldUpdateUserCount(
    productId: string,
    existing: StatItem | undefined | null,
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
 * Get the most recent sale date from sales data
 * Returns null if no sales or if the most recent sale is older than 6 months
 */
function getLastSaleDate(sales: GumroadSale[]): string | null {
    if (sales.length === 0) {
        return null
    }

    // Find the most recent sale by created_at
    let mostRecent: string | null = null
    for (const sale of sales) {
        if (sale.created_at) {
            if (!mostRecent || sale.created_at > mostRecent) {
                mostRecent = sale.created_at
            }
        }
    }

    if (!mostRecent) {
        return null
    }

    // Check if the most recent sale is within 6 months
    const lastSaleDate = new Date(mostRecent)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    if (lastSaleDate < sixMonthsAgo) {
        return null // Too old, don't display
    }

    return mostRecent
}

/**
 * Parse full name into first and last name
 */
function parseFullName(fullName: string): { firstName: string; lastName: string } {
    const trimmed = fullName.trim()
    if (!trimmed) {
        return { firstName: '', lastName: '' }
    }
    const parts = trimmed.split(/\s+/)
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' }
    }
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ')
    return { firstName, lastName }
}

/**
 * Extract customers who haven't left a review for their purchases
 * Groups by email to consolidate multiple purchases
 */
function extractCustomersWithoutReview(sales: GumroadSale[]): CustomerWithoutReview[] {
    // Map: email -> customer data with all unreviewed products
    const customerMap = new Map<
        string,
        {
            firstName: string
            lastName: string
            email: string
            productNames: Set<string>
            earliestDate: string
        }
    >()

    for (const sale of sales) {
        // Skip sales that have a rating
        if (sale.product_rating !== undefined && sale.product_rating !== null) {
            continue
        }

        const email = sale.email.toLowerCase()
        const { firstName, lastName } = parseFullName(sale.full_name || '')
        const purchaseDate = sale.created_at?.split('T')[0] || ''

        if (customerMap.has(email)) {
            const existing = customerMap.get(email)!
            existing.productNames.add(sale.product_name)
            // Keep the earliest purchase date
            if (purchaseDate && (!existing.earliestDate || purchaseDate < existing.earliestDate)) {
                existing.earliestDate = purchaseDate
            }
        } else {
            customerMap.set(email, {
                firstName,
                lastName,
                email: sale.email,
                productNames: new Set([sale.product_name]),
                earliestDate: purchaseDate
            })
        }
    }

    // Convert to array and sort by earliest purchase date (newest first)
    return Array.from(customerMap.values())
        .map((c) => ({
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            productNames: Array.from(c.productNames),
            purchaseDate: c.earliestDate
        }))
        .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
}

/**
 * Display customers without reviews
 */
function displayCustomersWithoutReview(customers: CustomerWithoutReview[]): void {
    showOperationHeader('CUSTOMERS WITHOUT REVIEWS')

    if (customers.length === 0) {
        console.log(`  ${colors.green}✓${colors.reset} All customers have left reviews!`)
        return
    }

    console.log(
        `  Found ${colors.bright}${customers.length}${colors.reset} customers without reviews:\n`
    )

    // Table header
    console.log(
        `  ${colors.dim}${'First Name'.padEnd(20)} ${'Last Name'.padEnd(20)} ${'Email'.padEnd(40)} ${'Products'.padEnd(30)} ${'Purchase Date'}${colors.reset}`
    )
    console.log(`  ${colors.dim}${'-'.repeat(130)}${colors.reset}`)

    for (const customer of customers) {
        const firstName = (customer.firstName || '-').substring(0, 19).padEnd(20)
        const lastName = (customer.lastName || '-').substring(0, 19).padEnd(20)
        const email = customer.email.substring(0, 39).padEnd(40)
        const products = customer.productNames.join(', ').substring(0, 29).padEnd(30)
        const date = customer.purchaseDate || '-'

        console.log(`  ${firstName} ${lastName} ${email} ${products} ${date}`)
    }

    showSectionHeader('SUMMARY')
    console.log(`  Total customers without reviews: ${customers.length}`)

    // Count total unreviewed purchases
    const totalPurchases = customers.reduce((sum, c) => sum + c.productNames.length, 0)
    console.log(`  Total unreviewed purchases: ${totalPurchases}`)
}

/**
 * Export customers without reviews to a JSON file
 */
function exportCustomersToJson(customers: CustomerWithoutReview[], outputPath: string): void {
    const exportData = {
        exportedAt: new Date().toISOString(),
        totalCustomers: customers.length,
        totalUnreviewedPurchases: customers.reduce((sum, c) => sum + c.productNames.length, 0),
        customers: customers
    }

    // Ensure exports directory exists
    if (!existsSync(EXPORTS_DIR)) {
        mkdirSync(EXPORTS_DIR, { recursive: true })
    }

    const absolutePath = resolve(outputPath)
    writeFileSync(absolutePath, JSON.stringify(exportData, null, 2) + '\n')
    console.log(
        `  ${colors.green}✓${colors.reset} Exported ${customers.length} customers to ${colors.bright}${absolutePath}${colors.reset}`
    )
}

/**
 * Run the customers without review report
 */
async function runCustomersWithoutReview(exportPath?: string): Promise<void> {
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

    showInfo('Fetching all sales from Gumroad API (this may take a while)...')

    try {
        const allSales = await client.getAllSales()
        showInfo(`Fetched ${allSales.length} total sales`)

        const customersWithoutReview = extractCustomersWithoutReview(allSales)
        displayCustomersWithoutReview(customersWithoutReview)

        // Export to JSON if path provided
        if (exportPath) {
            exportCustomersToJson(customersWithoutReview, exportPath)
        }
    } catch (error) {
        if (error instanceof GumroadApiError) {
            showError(`Gumroad API error: ${error.message} (status ${error.statusCode})`)
        } else {
            showError(`Failed to fetch sales: ${error}`)
        }
        process.exit(1)
    }
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

    return Object.keys(merged).length > 0 ? merged : null
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

        // Sync ratings and lastSale
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

            // Update lastSale date (null if >6 months ago or no sales)
            const lastSale = getLastSaleDate(sales)
            updatedStats.lastSale = lastSale
            if (lastSale) {
                const lastSaleDate = lastSale.split('T')[0]
                messages.push(
                    `${ratings.length} ratings from ${sales.length} sales, last sale: ${lastSaleDate}`
                )
            } else {
                messages.push(`${ratings.length} ratings from ${sales.length} sales`)
            }
        }

        // Sync sales count
        if (options.syncSales) {
            const salesCount = gumroadProduct.sales_count
            result.salesCount = salesCount

            // Set userCount to null if fewer than 10 sales (not meaningful to display)
            if (salesCount < 10) {
                if (existingStats.userCount !== null) {
                    updatedStats.userCount = null
                    result.userCountUpdated = true
                    messages.push(`${salesCount} sales (too few, set to null)`)
                } else {
                    messages.push(`${salesCount} sales (too few)`)
                }
            } else if (shouldUpdateUserCount(localProductId, existingStats.userCount, salesCount)) {
                // Use updateUserCountValue to preserve custom labels (e.g., "Members", "Students")
                const formattedCount = formatUserCount(salesCount)
                updatedStats.userCount = updateUserCountValue(
                    existingStats.userCount,
                    formattedCount
                )
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
 * Display all Gumroad products
 */
function displayProducts(gumroadProducts: GumroadProduct[]): void {
    showOperationHeader('GUMROAD PRODUCTS')

    // Filter out unpublished (disabled) products
    const publishedProducts = gumroadProducts.filter((p) => p.published)
    const unpublishedCount = gumroadProducts.length - publishedProducts.length

    if (publishedProducts.length === 0) {
        console.log(`  ${colors.yellow}⚠️${colors.reset} No published products found on Gumroad`)
        return
    }

    // Sort by sales count (highest first)
    const sortedProducts = [...publishedProducts].sort((a, b) => b.sales_count - a.sales_count)

    // Table header
    console.log(
        `  ${colors.dim}${'Name'.padEnd(40)} ${'Slug'.padEnd(22)} ${'Price'.padEnd(10)} ${'Sales'.padEnd(7)} ${'Revenue'}${colors.reset}`
    )
    console.log(`  ${colors.dim}${'-'.repeat(95)}${colors.reset}`)

    for (const product of sortedProducts) {
        const name = product.name.substring(0, 39).padEnd(40)
        const slug = (product.permalink || product.custom_permalink || '-')
            .substring(0, 21)
            .padEnd(22)
        const price =
            product.price === 0
                ? 'Free'.padEnd(10)
                : `€${(product.price / 100).toFixed(2)}`.padEnd(10)
        const sales = String(product.sales_count).padEnd(7)
        const revenue = `$${(product.sales_usd_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

        console.log(`  ${name} ${slug} ${price} ${sales} ${revenue}`)
    }

    showSectionHeader('SUMMARY')
    console.log(`  Published products: ${publishedProducts.length}`)
    if (unpublishedCount > 0) {
        console.log(`  ${colors.dim}Unpublished (hidden): ${unpublishedCount}${colors.reset}`)
    }
    const totalSales = publishedProducts.reduce((sum, p) => sum + p.sales_count, 0)
    const totalRevenue = publishedProducts.reduce((sum, p) => sum + p.sales_usd_cents, 0)
    console.log(`  Total sales: ${totalSales}`)
    console.log(
        `  Total revenue: $${(totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    )
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
 * Get all local product IDs from product JSON files
 */
function getLocalProductIds(): string[] {
    const files = readdirSync(PRODUCTS_DIR)
    // Match only main product files (exclude -faq, -media, -sales-copy, -stats, -testimonials)
    const productFiles = files.filter((f) => {
        if (!f.endsWith('.json')) return false
        // Exclude auxiliary files
        if (
            f.includes('-faq.json') ||
            f.includes('-media.json') ||
            f.includes('-sales-copy-') ||
            f.includes('-stats.json') ||
            f.includes('-testimonials.json')
        ) {
            return false
        }
        return true
    })
    return productFiles.map((f) => f.replace('.json', ''))
}

/**
 * Check for missing products (Gumroad products not in local store)
 */
function checkMissingProducts(gumroadProducts: GumroadProduct[], mappings: GumroadMapping[]): void {
    showOperationHeader('MISSING PRODUCTS CHECK')

    const localProductIds = getLocalProductIds()
    const mappedGumroadSlugs = new Set(mappings.map((m) => m.gumroadSlug.toLowerCase()))

    // Find Gumroad products that don't have a mapping in _redirects
    const unmappedProducts: GumroadProduct[] = []
    const mappedProducts: GumroadProduct[] = []

    for (const gp of gumroadProducts) {
        const slug = (gp.permalink || gp.custom_permalink || '').toLowerCase()
        if (slug && mappedGumroadSlugs.has(slug)) {
            mappedProducts.push(gp)
        } else {
            unmappedProducts.push(gp)
        }
    }

    // Check mapped products to see if local file exists
    const missingLocalFiles: Array<{ gumroadProduct: GumroadProduct; mappedTo: string }> = []
    for (const gp of mappedProducts) {
        const slug = (gp.permalink || gp.custom_permalink || '').toLowerCase()
        const mapping = mappings.find((m) => m.gumroadSlug.toLowerCase() === slug)
        if (mapping && !localProductIds.includes(mapping.localProductId)) {
            missingLocalFiles.push({ gumroadProduct: gp, mappedTo: mapping.localProductId })
        }
    }

    // Display unmapped Gumroad products
    if (unmappedProducts.length > 0) {
        showSectionHeader('Gumroad products without _redirects mapping')
        for (const gp of unmappedProducts) {
            const slug = gp.permalink || gp.custom_permalink || 'no-slug'
            const priceDisplay = gp.price === 0 ? 'Free' : `€${(gp.price / 100).toFixed(2)}`
            console.log(
                `  ${colors.yellow}⚠️${colors.reset} ${colors.bright}${gp.name}${colors.reset}`
            )
            console.log(
                `     ${colors.dim}Slug: ${slug} | Price: ${priceDisplay} | Sales: ${gp.sales_count}${colors.reset}`
            )
        }
    } else {
        console.log(
            `  ${colors.green}✓${colors.reset} All Gumroad products have _redirects mappings`
        )
    }

    // Display products with mappings but missing local files
    if (missingLocalFiles.length > 0) {
        showSectionHeader('Mapped products missing local JSON files')
        for (const { gumroadProduct, mappedTo } of missingLocalFiles) {
            const slug = gumroadProduct.permalink || gumroadProduct.custom_permalink || 'no-slug'
            console.log(
                `  ${colors.red}✗${colors.reset} ${colors.bright}${gumroadProduct.name}${colors.reset}`
            )
            console.log(
                `     ${colors.dim}Slug: ${slug} → ${mappedTo}.json (missing)${colors.reset}`
            )
        }
    } else if (mappedProducts.length > 0) {
        console.log(`  ${colors.green}✓${colors.reset} All mapped products have local JSON files`)
    }

    // Summary
    showSectionHeader('SUMMARY')
    console.log(`  Total Gumroad products: ${gumroadProducts.length}`)
    console.log(`  Mapped to local store: ${mappedProducts.length}`)
    console.log(
        `  ${colors.yellow}Missing _redirects mapping: ${unmappedProducts.length}${colors.reset}`
    )
    console.log(
        `  ${colors.red}Missing local JSON files: ${missingLocalFiles.length}${colors.reset}`
    )
    console.log(`  Local product files: ${localProductIds.length}`)
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
                    name: '📦 List All Products',
                    value: 'list-products',
                    description: 'Show all Gumroad products with sales'
                },
                {
                    name: '📋 List Product Mappings',
                    value: 'list-mappings',
                    description: 'Show Gumroad → local product mappings'
                },
                {
                    name: '🔍 Check for Missing Products',
                    value: 'check-missing',
                    description: 'Find Gumroad products not in local store'
                },
                {
                    name: '📧 List Customers Without Reviews',
                    value: 'no-review',
                    description: "List customers who haven't left a review"
                },
                {
                    name: '📤 Export Customers Without Reviews to JSON',
                    value: 'export-no-review',
                    description: 'Export customer list to a JSON file'
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

        if (choice === 'list-products') {
            const accessToken = process.env.GUMROAD_ACCESS_TOKEN
            if (!accessToken) {
                showError('GUMROAD_ACCESS_TOKEN not found in environment')
                continue
            }

            const client = new GumroadApiClient({ accessToken })

            showInfo('Fetching products from Gumroad API...')
            try {
                const gumroadProducts = await client.getProducts()
                displayProducts(gumroadProducts)
            } catch (error) {
                showError(`Failed to fetch Gumroad products: ${error}`)
            }
            continue
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

        if (choice === 'check-missing') {
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
                checkMissingProducts(gumroadProducts, mappings)
            } catch (error) {
                showError(`Failed to fetch Gumroad products: ${error}`)
            }
            continue
        }

        if (choice === 'no-review') {
            await runCustomersWithoutReview()
            continue
        }

        if (choice === 'export-no-review') {
            await runCustomersWithoutReview(CUSTOMERS_EXPORT_FILE)
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
    listProducts?: boolean
    listMappings?: boolean
    checkMissing?: boolean
    noReview?: boolean
    exportNoReview?: boolean
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
        } else if (arg === '--products') {
            args.listProducts = true
        } else if (arg === '--list') {
            args.listMappings = true
        } else if (arg === '--check-missing') {
            args.checkMissing = true
        } else if (arg === '--no-review') {
            args.noReview = true
        } else if (arg === '--export') {
            args.exportNoReview = true
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
        args.listProducts ||
        args.listMappings ||
        args.checkMissing ||
        args.noReview ||
        args.exportNoReview
    ) {
        if (args.exportNoReview) {
            await runCustomersWithoutReview(CUSTOMERS_EXPORT_FILE)
            return
        }

        if (args.noReview) {
            await runCustomersWithoutReview()
            return
        }

        if (args.listProducts) {
            const accessToken = process.env.GUMROAD_ACCESS_TOKEN
            if (!accessToken) {
                showError('GUMROAD_ACCESS_TOKEN not found in environment')
                process.exit(1)
            }

            const client = new GumroadApiClient({ accessToken })
            showInfo('Fetching products from Gumroad API...')
            const gumroadProducts = await client.getProducts()
            displayProducts(gumroadProducts)
            return
        }

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

        if (args.checkMissing) {
            const accessToken = process.env.GUMROAD_ACCESS_TOKEN
            if (!accessToken) {
                showError('GUMROAD_ACCESS_TOKEN not found in environment')
                process.exit(1)
            }

            const client = new GumroadApiClient({ accessToken })
            const mappings = loadRedirectsMappings()
            const gumroadProducts = await client.getProducts()
            checkMissingProducts(gumroadProducts, mappings)
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
