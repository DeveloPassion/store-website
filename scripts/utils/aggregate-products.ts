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
 *
 * If these files don't exist, the arrays will be empty.
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_DIR = resolve(__dirname, '../../src/data/products')
const OUTPUT_FILE = resolve(__dirname, '../../src/data/products.json')
const STRICT_MODE = process.env.STRICT_VALIDATION === 'true'

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
    faqs?: FAQ[]
    testimonials?: Testimonial[]
    media?: MediaItem[]
}

/**
 * Load FAQs for a product from {product-id}-faq.json
 * Returns empty array if file doesn't exist
 */
function loadFAQs(productId: string): FAQ[] {
    const faqPath = join(PRODUCTS_DIR, `${productId}-faq.json`)
    if (!existsSync(faqPath)) {
        return []
    }

    try {
        const content = readFileSync(faqPath, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        const message = `Failed to load FAQs for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        console.warn(`⚠️  ${message}`)
        if (STRICT_MODE) {
            throw new Error(message)
        }
        return []
    }
}

/**
 * Load testimonials for a product from {product-id}-testimonials.json
 * Returns empty array if file doesn't exist
 */
function loadTestimonials(productId: string): Testimonial[] {
    const testimonialsPath = join(PRODUCTS_DIR, `${productId}-testimonials.json`)
    if (!existsSync(testimonialsPath)) {
        return []
    }

    try {
        const content = readFileSync(testimonialsPath, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        const message = `Failed to load testimonials for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        console.warn(`⚠️  ${message}`)
        if (STRICT_MODE) {
            throw new Error(message)
        }
        return []
    }
}

/**
 * Load media for a product from {product-id}-media.json
 * Returns empty array if file doesn't exist
 */
function loadMedia(productId: string): MediaItem[] {
    const mediaPath = join(PRODUCTS_DIR, `${productId}-media.json`)
    if (!existsSync(mediaPath)) {
        return []
    }

    try {
        const content = readFileSync(mediaPath, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        const message = `Failed to load media for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        console.warn(`⚠️  ${message}`)
        if (STRICT_MODE) {
            throw new Error(message)
        }
        return []
    }
}

function main() {
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
    // Exclude FAQ, testimonial, and media files (they'll be loaded separately)
    let files: string[]
    try {
        files = readdirSync(PRODUCTS_DIR).filter(
            (file) =>
                file.endsWith('.json') &&
                !file.endsWith('-faq.json') &&
                !file.endsWith('-testimonials.json') &&
                !file.endsWith('-media.json')
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

            // Load FAQs, testimonials, and media for this product
            const faqs = loadFAQs(product.id)
            const testimonials = loadTestimonials(product.id)
            const media = loadMedia(product.id)

            // Create defensive copy with loaded content (don't mutate original)
            const aggregatedProduct = {
                ...product,
                faqs,
                testimonials,
                media
            }

            // Validate the aggregated product
            const validationResult = ProductSchema.safeParse(aggregatedProduct)
            if (!validationResult.success) {
                console.error(`  ❌ ${file}: Invalid product after adding FAQs/testimonials/media`)
                validationResult.error.errors.forEach((err) => {
                    console.error(`     - ${err.path.join('.')}: ${err.message}`)
                })
                errors.push(`  ❌ ${file}: Invalid product structure after mutation`)
                continue
            }

            products.push(aggregatedProduct)
            console.log(
                `  ✅ ${file} (id: ${product.id}, ${faqs.length} FAQs, ${testimonials.length} testimonials, ${media.length} media)`
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

main()
