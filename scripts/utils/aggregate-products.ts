#!/usr/bin/env bun

/**
 * Aggregate individual product JSON files into a single products.json
 *
 * This script reads all product JSON files from src/data/products/ and
 * combines them into a single products.json file for backward compatibility
 * and optimal runtime performance.
 *
 * Additionally, it loads content from product-specific files:
 * - {product-id}-faq.json -> product.faqs[]
 * - {product-id}-testimonials.json -> product.testimonials[]
 * - {product-id}-media.json -> product.media[]
 * - {product-id}-sales-copy-{variant}.json -> product.tagline, problem, features, etc.
 *
 * If these files don't exist, the arrays will be empty or null.
 * Sales copy is loaded based on product.activeSalesCopyId (e.g., "default", "holiday-2026").
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
import { ProductSchema } from '../../src/schemas/product.schema.js'
import { SalesCopyFileSchema } from '../../src/schemas/sales-copy.schema.js'
import type { SalesCopyData } from '../../src/types/sales-copy.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Helper to get products directory (allow override for testing)
const getProductsDir = () =>
    process.env.TEST_PRODUCTS_DIR || resolve(__dirname, '../../src/data/products')

const OUTPUT_FILE = resolve(__dirname, '../../src/data/products.json')

// Helper to check strict mode (evaluated at runtime)
const isStrictMode = () => process.env.STRICT_VALIDATION === 'true'

interface FAQ {
    id: string
    question: string
    answer: string
    order: number
}

interface Testimonial {
    id: string
    author: string
    role?: string
    company?: string
    avatarUrl?: string
    twitterHandle?: string
    twitterUrl?: string
    rating: number
    quote: string
    featured: boolean
}

interface MediaItem {
    id: string
    type: 'image' | 'video'
    url: string
    title: string
    description?: string
    altText: string
    caption?: string
    order: number
    group: 'cover' | 'banner' | 'main' | 'secondary' | 'bonus'
    youtubeId?: string
    thumbnailUrl?: string
    width?: number
    height?: number
}

interface Product {
    id: string
    priority?: number
    activeSalesCopyId?: string
    faqs?: FAQ[]
    testimonials?: Testimonial[]
    media?: MediaItem[]
}

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
            validationResult.error.errors.forEach((err) => {
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
    // Exclude FAQ, testimonial, media, and sales-copy files (they'll be loaded separately)
    let files: string[]
    try {
        files = readdirSync(PRODUCTS_DIR).filter(
            (file) =>
                file.endsWith('.json') &&
                !file.endsWith('-faq.json') &&
                !file.endsWith('-testimonials.json') &&
                !file.endsWith('-media.json') &&
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
    const products: Product[] = []
    const errors: string[] = []

    for (const file of files) {
        const filePath = join(PRODUCTS_DIR, file)
        try {
            const content = readFileSync(filePath, 'utf-8')
            const product = JSON.parse(content)

            if (!product.id) {
                errors.push(`  ❌ ${file}: Missing 'id' field`)
                continue
            }

            // Load FAQs, testimonials, media, and sales copy for this product
            const faqs = loadFAQs(product.id)
            const testimonials = loadTestimonials(product.id)
            const media = loadMedia(product.id)
            const salesCopy = loadActiveSalesCopy(product.id, product.activeSalesCopyId)

            // Create defensive copy with loaded content (don't mutate original)
            // Spread sales copy fields conditionally to avoid overwriting with undefined
            const aggregatedProduct = {
                ...product,
                faqs,
                testimonials,
                media,
                ...(salesCopy
                    ? {
                          tagline: salesCopy.tagline,
                          secondaryTagline: salesCopy.secondaryTagline,
                          problem: salesCopy.problem,
                          problemPoints: salesCopy.problemPoints,
                          agitate: salesCopy.agitate,
                          agitatePoints: salesCopy.agitatePoints,
                          solution: salesCopy.solution,
                          solutionPoints: salesCopy.solutionPoints,
                          description: salesCopy.description,
                          features: salesCopy.features,
                          benefits: salesCopy.benefits,
                          targetAudience: salesCopy.targetAudience,
                          perfectFor: salesCopy.perfectFor,
                          notForYou: salesCopy.notForYou,
                          trustBadges: salesCopy.trustBadges,
                          guarantees: salesCopy.guarantees,
                          metaTitle: salesCopy.metaTitle,
                          metaDescription: salesCopy.metaDescription,
                          keywords: salesCopy.keywords,
                          storytelling: salesCopy.storytelling
                      }
                    : {})
            }

            // Validate the aggregated product
            const validationResult = ProductSchema.safeParse(aggregatedProduct)
            if (!validationResult.success) {
                console.error(
                    `  ❌ ${file}: Invalid product after adding FAQs/testimonials/media/sales-copy`
                )
                validationResult.error.errors.forEach((err) => {
                    console.error(`     - ${err.path.join('.')}: ${err.message}`)
                })
                errors.push(`  ❌ ${file}: Invalid product structure after mutation`)
                continue
            }

            products.push(aggregatedProduct)
            const salesCopyInfo = product.activeSalesCopyId
                ? `sales-copy: ${product.activeSalesCopyId}`
                : 'no sales-copy'
            console.log(
                `  ✅ ${file} (id: ${product.id}, ${faqs.length} FAQs, ${testimonials.length} testimonials, ${media.length} media, ${salesCopyInfo})`
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
