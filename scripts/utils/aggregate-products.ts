#!/usr/bin/env bun

/**
 * Aggregate individual product JSON files into a single products.json
 *
 * This script reads all product JSON files from src/data/products/ and
 * combines them into a single products.json file for backward compatibility
 * and optimal runtime performance.
 *
 * Additionally, it loads content from product-specific files:
 * - {product-id}-faq.json -> product.faqs[] (required array, empty if file missing)
 * - {product-id}-testimonials.json -> product.testimonials[] (required array, empty if file missing)
 * - {product-id}-media.json -> product.media[] (required array, empty if file missing)
 * - {product-id}-sales-copy-{variant}.json -> product.salesCopy.* (nested object: tagline, problem, features, etc.)
 * - {product-id}-stats.json -> product.stats, product.ratingsCount, product.averageRating (computed)
 *
 * Sales copy is strictly required and loaded based on product.activeSalesCopyId (e.g., "default", "holiday-2026").
 * If sales copy is missing or invalid, the product will be skipped during aggregation.
 *
 * Usage:
 *   npm run aggregate:products
 *   tsx scripts/utils/aggregate-products.ts
 *
 * Exit codes:
 *   0 - Aggregation successful
 *   1 - Aggregation failed
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import {
    IndividualProductSchema,
    AggregatedProductSchema,
    type IndividualProduct,
    type AggregatedProduct
} from '../../src/schemas/product.schema.js'
import { SalesCopyFileSchema, type SalesCopyData } from '../../src/schemas/sales-copy.schema.js'
import type { FAQ } from '../../src/schemas/faq.schema.js'
import type { Testimonial } from '../../src/schemas/testimonial.schema.js'
import type { MediaItem } from '../../src/schemas/media.schema.js'
import { StatsFileSchema, type Stats } from '../../src/schemas/stats.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Helper to get products directory (allow override for testing)
const getProductsDir = () =>
    process.env.TEST_PRODUCTS_DIR || resolve(__dirname, '../../src/data/products')

const OUTPUT_FILE = resolve(__dirname, '../../src/data/products.json')

// Helper to check strict mode (evaluated at runtime)
const isStrictMode = () => process.env.STRICT_VALIDATION === 'true'

/**
 * Load FAQs for a product from {product-id}-faq.json
 * Returns empty array if file doesn't exist
 * @internal - Exported for testing purposes only
 */
export function loadFAQs(productId: string): FAQ[] {
    const faqPath = join(getProductsDir(), `${productId}-faq.json`)
    if (!existsSync(faqPath)) {
        return []
    }

    try {
        const content = readFileSync(faqPath, 'utf-8')
        const file = JSON.parse(content)
        return file.data || []
    } catch (error) {
        if (error instanceof SyntaxError) {
            const message = `Failed to parse FAQ file for ${productId} (invalid JSON): ${error.message}`
            console.error(`❌ ${message}`)
            if (isStrictMode()) {
                throw new Error(message)
            }
            return []
        }
        const message = `Failed to load FAQs for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        console.error(`❌ ${message}`)
        if (isStrictMode()) {
            throw new Error(message)
        }
        return []
    }
}

/**
 * Load testimonials for a product from {product-id}-testimonials.json
 * Returns empty array if file doesn't exist
 * @internal - Exported for testing purposes only
 */
export function loadTestimonials(productId: string): Testimonial[] {
    const testimonialsPath = join(getProductsDir(), `${productId}-testimonials.json`)
    if (!existsSync(testimonialsPath)) {
        return []
    }

    try {
        const content = readFileSync(testimonialsPath, 'utf-8')
        const file = JSON.parse(content)
        return file.data || []
    } catch (error) {
        if (error instanceof SyntaxError) {
            const message = `Failed to parse testimonials file for ${productId} (invalid JSON): ${error.message}`
            console.error(`❌ ${message}`)
            if (isStrictMode()) {
                throw new Error(message)
            }
            return []
        }
        const message = `Failed to load testimonials for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        console.error(`❌ ${message}`)
        if (isStrictMode()) {
            throw new Error(message)
        }
        return []
    }
}

/**
 * Load media for a product from {product-id}-media.json
 * Returns empty array if file doesn't exist
 * @internal - Exported for testing purposes only
 */
export function loadMedia(productId: string): MediaItem[] {
    const mediaPath = join(getProductsDir(), `${productId}-media.json`)
    if (!existsSync(mediaPath)) {
        return []
    }

    try {
        const content = readFileSync(mediaPath, 'utf-8')
        const file = JSON.parse(content)
        return file.data || []
    } catch (error) {
        if (error instanceof SyntaxError) {
            const message = `Failed to parse media file for ${productId} (invalid JSON): ${error.message}`
            console.error(`❌ ${message}`)
            if (isStrictMode()) {
                throw new Error(message)
            }
            return []
        }
        const message = `Failed to load media for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        console.error(`❌ ${message}`)
        if (isStrictMode()) {
            throw new Error(message)
        }
        return []
    }
}

/**
 * Load stats for a product from {product-id}-stats.json
 * Returns null if file doesn't exist
 * @internal - Exported for testing purposes only
 */
export function loadStats(productId: string): Stats | null {
    const statsPath = join(getProductsDir(), `${productId}-stats.json`)
    if (!existsSync(statsPath)) {
        return null
    }

    try {
        const content = readFileSync(statsPath, 'utf-8')
        const file = JSON.parse(content)

        // Validate stats file structure
        const validationResult = StatsFileSchema.safeParse(file)
        if (!validationResult.success) {
            const message = `Invalid stats file for ${productId}`
            console.error(`❌ ${message}`)
            validationResult.error.issues.forEach((err) => {
                console.error(`     - ${err.path.join('.')}: ${err.message}`)
            })
            if (isStrictMode()) {
                throw new Error(message)
            }
            return null
        }

        return validationResult.data.data
    } catch (error) {
        if (error instanceof SyntaxError) {
            const message = `Failed to parse stats file for ${productId} (invalid JSON): ${error.message}`
            console.error(`❌ ${message}`)
            if (isStrictMode()) {
                throw new Error(message)
            }
            return null
        }
        const message = `Failed to load stats for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        console.error(`❌ ${message}`)
        if (isStrictMode()) {
            throw new Error(message)
        }
        return null
    }
}

/**
 * Compute ratingsCount and averageRating from Stats and testimonials
 * Testimonials count as 5-star ratings
 * Returns undefined values if no valid ratings found
 * @internal - Exported for testing purposes only
 */
export function computeRatings(
    stats: Stats | null,
    testimonialCount: number = 0
): { ratingsCount?: number; averageRating?: number } {
    const allRatings: number[] = []

    // Add ratings from stats.ratings (from -stats.json file)
    if (stats?.ratings) {
        for (const source of Object.values(stats.ratings)) {
            for (const ratingEntry of source) {
                if (ratingEntry.rating !== null && ratingEntry.rating !== undefined) {
                    allRatings.push(ratingEntry.rating)
                }
            }
        }
    }

    // Add testimonials as 5-star ratings
    for (let i = 0; i < testimonialCount; i++) {
        allRatings.push(5)
    }

    if (allRatings.length === 0) {
        return {}
    }

    const sum = allRatings.reduce((acc, val) => acc + val, 0)
    return {
        ratingsCount: allRatings.length,
        averageRating: Math.round((sum / allRatings.length) * 100) / 100 // Round to 2 decimal places
    }
}

/**
 * Discover all sales copy variant files for a product
 * Returns array of variant IDs (e.g., ['default', 'holiday-2026'])
 * @internal - Exported for testing purposes only
 */
export function discoverSalesCopyFiles(productId: string): string[] {
    try {
        const files = readdirSync(getProductsDir())
        const pattern = new RegExp(`^${productId}-sales-copy-(.+)\\.json$`)
        const variants: string[] = []

        for (const file of files) {
            const match = file.match(pattern)
            if (match && match[1]) {
                variants.push(match[1])
            }
        }

        return variants
    } catch (error) {
        const message = `Failed to discover sales copy files for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        console.error(`❌ ${message}`)
        if (isStrictMode()) {
            throw new Error(message)
        }
        return []
    }
}

/**
 * Load sales copy for a product from {product-id}-sales-copy-{variant}.json
 * Returns null if file doesn't exist or if activeSalesCopyId is not provided
 * @internal - Exported for testing purposes only
 */
export function loadActiveSalesCopy(
    productId: string,
    activeSalesCopyId?: string
): SalesCopyData | null {
    // If no active sales copy ID is specified, return null
    if (!activeSalesCopyId) {
        return null
    }

    const salesCopyPath = join(
        getProductsDir(),
        `${productId}-sales-copy-${activeSalesCopyId}.json`
    )

    if (!existsSync(salesCopyPath)) {
        const message = `Sales copy file not found for ${productId} variant "${activeSalesCopyId}": ${salesCopyPath}`
        console.error(`❌ ${message}`)
        if (isStrictMode()) {
            throw new Error(message)
        }
        return null
    }

    try {
        const content = readFileSync(salesCopyPath, 'utf-8')
        const file = JSON.parse(content)

        // Validate sales copy file structure
        const validationResult = SalesCopyFileSchema.safeParse(file)
        if (!validationResult.success) {
            const message = `Invalid sales copy file for ${productId} variant "${activeSalesCopyId}"`
            console.error(`❌ ${message}`)
            validationResult.error.issues.forEach((err) => {
                console.error(`     - ${err.path.join('.')}: ${err.message}`)
            })
            if (isStrictMode()) {
                throw new Error(message)
            }
            return null
        }

        return validationResult.data.salesCopy
    } catch (error) {
        if (error instanceof SyntaxError) {
            const message = `Failed to parse sales copy file for ${productId} variant "${activeSalesCopyId}" (invalid JSON): ${error.message}`
            console.error(`❌ ${message}`)
            if (isStrictMode()) {
                throw new Error(message)
            }
            return null
        }
        const message = `Failed to load sales copy for ${productId} variant "${activeSalesCopyId}": ${error instanceof Error ? error.message : String(error)}`
        console.error(`❌ ${message}`)
        if (isStrictMode()) {
            throw new Error(message)
        }
        return null
    }
}

function main() {
    const PRODUCTS_DIR = getProductsDir()
    console.log('🔄 Aggregating product files...\n')
    console.log(`Reading from: ${PRODUCTS_DIR}`)
    console.log(`Writing to: ${OUTPUT_FILE}\n`)

    // Check if products directory exists
    if (!existsSync(PRODUCTS_DIR)) {
        console.error('❌ Products directory does not exist:', PRODUCTS_DIR)
        console.error('💡 Tip: Create the directory or run split:products first\n')
        process.exit(1)
    }

    // Read all JSON files from products directory
    // Exclude FAQ, testimonial, media, stats, and sales-copy files (they'll be loaded separately)
    let files: string[]
    try {
        files = readdirSync(PRODUCTS_DIR).filter(
            (file) =>
                file.endsWith('.json') &&
                !file.endsWith('-faq.json') &&
                !file.endsWith('-testimonials.json') &&
                !file.endsWith('-media.json') &&
                !file.endsWith('-stats.json') &&
                !file.includes('-sales-copy-')
        )
    } catch (error) {
        console.error('❌ Failed to read products directory')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }

    if (files.length === 0) {
        console.error('❌ No JSON files found in products directory')
        console.error('💡 Tip: Add product JSON files or run split:products first\n')
        process.exit(1)
    }

    console.log(`Found ${files.length} product file(s):\n`)

    // Parse all product files
    const products: AggregatedProduct[] = []
    const errors: string[] = []

    for (const file of files) {
        const filePath = join(PRODUCTS_DIR, file)
        try {
            const content = readFileSync(filePath, 'utf-8')
            const productData = JSON.parse(content)

            // Validate individual product file structure first
            const individualValidation = IndividualProductSchema.safeParse(productData)
            if (!individualValidation.success) {
                console.error(`  ❌ ${file}: Invalid individual product schema`)
                individualValidation.error.issues.forEach((err) => {
                    console.error(`     - ${err.path.join('.')}: ${err.message}`)
                })
                errors.push(`  ❌ ${file}: Invalid individual product structure`)
                continue
            }

            const product: IndividualProduct = individualValidation.data

            if (!product.id) {
                errors.push(`  ❌ ${file}: Missing 'id' field`)
                continue
            }

            // Load FAQs, testimonials, media, stats, and sales copy for this product
            const faqs = loadFAQs(product.id)
            const testimonials = loadTestimonials(product.id)
            const media = loadMedia(product.id)
            const salesCopy = loadActiveSalesCopy(product.id, product.activeSalesCopyId)

            // Load stats and compute ratings (testimonials count as 5-star ratings)
            const stats = loadStats(product.id)
            const { ratingsCount, averageRating } = computeRatings(stats, testimonials.length)

            // Sales copy is strictly required in aggregated schema
            if (!salesCopy) {
                const message = `Missing or invalid sales copy for product ${product.id} (activeSalesCopyId: ${product.activeSalesCopyId})`
                console.error(`  ❌ ${file}: ${message}`)
                errors.push(`  ❌ ${file}: ${message}`)
                continue
            }

            // Create aggregated product with proper structure
            // salesCopy is a nested object (not spread into product)
            // stats is loaded from -stats.json file (null if missing)
            // ratingsCount and averageRating are computed from stats + testimonials
            const aggregatedProduct: AggregatedProduct = {
                ...product,
                faqs,
                testimonials,
                media,
                stats,
                salesCopy,
                ...(ratingsCount !== undefined && { ratingsCount }),
                ...(averageRating !== undefined && { averageRating })
            }

            // Validate the aggregated product
            const aggregatedValidation = AggregatedProductSchema.safeParse(aggregatedProduct)
            if (!aggregatedValidation.success) {
                console.error(
                    `  ❌ ${file}: Invalid aggregated product after adding FAQs/media/salesCopy`
                )
                aggregatedValidation.error.issues.forEach((err) => {
                    console.error(`     - ${err.path.join('.')}: ${err.message}`)
                })
                errors.push(`  ❌ ${file}: Invalid aggregated product structure`)
                continue
            }

            products.push(aggregatedValidation.data)
            const salesCopyInfo = product.activeSalesCopyId
                ? `sales-copy: ${product.activeSalesCopyId}`
                : 'no sales-copy'
            const ratingsInfo =
                ratingsCount !== undefined ? `${ratingsCount} ratings (avg: ${averageRating})` : ''
            console.log(
                `  ✅ ${file} (id: ${product.id}, ${faqs.length} FAQs, ${testimonials.length} testimonials, ${media.length} media, ${salesCopyInfo}${ratingsInfo ? ', ' + ratingsInfo : ''})`
            )
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error)
            errors.push(`  ❌ ${file}: ${errorMsg}`)
            console.error(`  ❌ ${file}: Failed to parse`)
        }
    }

    console.log('')

    // Report errors if any
    if (errors.length > 0) {
        console.error('❌ Failed to parse some product files:\n')
        errors.forEach((err) => console.error(err))
        console.error(
            '\n💡 Tip: Fix JSON syntax errors and ensure all products have an "id" field\n'
        )
        process.exit(1)
    }

    // Check for duplicate IDs
    const idCounts = new Map<string, string[]>()
    products.forEach((product) => {
        const files = idCounts.get(product.id) || []
        files.push(`${product.id}.json`)
        idCounts.set(product.id, files)
    })

    const duplicates = Array.from(idCounts.entries()).filter(([, files]) => files.length > 1)
    if (duplicates.length > 0) {
        console.error('❌ Duplicate product IDs found:\n')
        duplicates.forEach(([id, files]) => {
            console.error(`  • ID "${id}" appears in:`)
            files.forEach((file) => console.error(`    - ${file}`))
        })
        console.error('\n💡 Tip: Each product must have a unique ID\n')
        process.exit(1)
    }

    // Sort products by priority (descending), then by id (for deterministic output)
    products.sort((a, b) => {
        const priorityA = a.priority ?? 0
        const priorityB = b.priority ?? 0
        if (priorityA !== priorityB) {
            return priorityB - priorityA // Higher priority first
        }
        return a.id.localeCompare(b.id) // Alphabetical by id
    })

    // Write aggregated products.json
    try {
        const outputDir = dirname(OUTPUT_FILE)
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true })
        }

        const json = JSON.stringify(products, null, 2)
        writeFileSync(OUTPUT_FILE, json + '\n', 'utf-8')
        console.log(`✅ Successfully aggregated ${products.length} products`)
        console.log(`📄 Output written to: ${OUTPUT_FILE}\n`)
        process.exit(0)
    } catch (error) {
        console.error('❌ Failed to write products.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Only run main() if this script is executed directly (not imported for testing)
if (import.meta.main) {
    main()
}
