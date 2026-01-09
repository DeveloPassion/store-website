#!/usr/bin/env tsx

/**
 * Validate cross-product relationships and references
 *
 * This script validates that all cross-references in products are valid:
 * - crossSellIds: References to other product IDs
 *
 * Note: FAQs and testimonials are now stored in separate files per product
 * ({product-id}-faq.json, {product-id}-testimonials.json) and are validated
 * by the main product validation script.
 *
 * Usage:
 *   npm run validate:relationships
 *   tsx scripts/validate-relationships.ts
 *
 * Exit codes:
 *   0 - All relationships are valid
 *   1 - Validation errors found
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')

interface Product {
    id: string
    crossSellIds: string[]
}

interface RelationshipError {
    productId: string
    filename: string
    field: 'crossSellIds'
    invalidId: string
    message: string
}

function loadProducts(): Product[] {
    if (!existsSync(PRODUCTS_DIR)) {
        console.error('❌ Products directory not found:', PRODUCTS_DIR)
        process.exit(1)
    }

    const files = readdirSync(PRODUCTS_DIR).filter(
        (file) =>
            file.endsWith('.json') &&
            !file.endsWith('-faq.json') &&
            !file.endsWith('-testimonials.json')
    )
    const products: Product[] = []

    for (const file of files) {
        try {
            const filepath = join(PRODUCTS_DIR, file)
            const content = readFileSync(filepath, 'utf-8')
            const product = JSON.parse(content)
            products.push(product)
        } catch (error) {
            console.error(`❌ Failed to load product file: ${file}`)
            console.error(error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    }

    return products
}

function validateRelationships(): RelationshipError[] {
    console.log('🔍 Validating cross-product relationships...\n')

    const products = loadProducts()

    console.log(`📦 Loaded ${products.length} product(s)\n`)

    const errors: RelationshipError[] = []

    // Build lookup set for fast validation
    const productIds = new Set(products.map((p) => p.id))

    console.log('🔗 Validating relationships...\n')

    // Validate each product
    products.forEach((product) => {
        const filename = `${product.id}.json`

        // Validate crossSellIds
        if (product.crossSellIds && Array.isArray(product.crossSellIds)) {
            product.crossSellIds.forEach((crossSellId: string) => {
                if (!productIds.has(crossSellId)) {
                    errors.push({
                        productId: product.id,
                        filename,
                        field: 'crossSellIds',
                        invalidId: crossSellId,
                        message: `Referenced product "${crossSellId}" does not exist`
                    })
                }
            })
        }
    })

    return errors
}

function displayStats(products: Product[]) {
    console.log('📊 Relationship Statistics:\n')

    // Count total cross-references
    const totalCrossSells = products.reduce((sum, p) => sum + (p.crossSellIds?.length || 0), 0)

    console.log(`   Cross-sell references: ${totalCrossSells}\n`)

    // Products with most cross-references
    const productsWithRefs = products
        .map((p) => ({
            id: p.id,
            totalRefs: p.crossSellIds?.length || 0
        }))
        .filter((p) => p.totalRefs > 0)
        .sort((a, b) => b.totalRefs - a.totalRefs)
        .slice(0, 5)

    if (productsWithRefs.length > 0) {
        console.log('   Products with most cross-sell references (top 5):')
        productsWithRefs.forEach((p) => {
            console.log(`     - ${p.id}: ${p.totalRefs} cross-sell(s)`)
        })
        console.log('')
    } else {
        console.log('   No cross-sell references found.\n')
    }
}

function main() {
    console.log('🔍 Validating product relationships...\n')

    const errors = validateRelationships()

    // Load data for stats
    const products = loadProducts()

    if (errors.length === 0) {
        console.log('✅ All relationships are valid!\n')
        displayStats(products)
        process.exit(0)
    }

    // Display errors
    console.error('❌ Relationship validation failed!\n')
    console.error(`Found ${errors.length} broken reference(s):\n`)

    // Group errors by product
    const errorsByProduct = errors.reduce(
        (acc, error) => {
            if (!acc[error.productId]) {
                acc[error.productId] = []
            }
            acc[error.productId].push(error)
            return acc
        },
        {} as Record<string, RelationshipError[]>
    )

    Object.entries(errorsByProduct).forEach(([, productErrors]) => {
        console.error(`❌ ${productErrors[0].filename}`)
        productErrors.forEach((error) => {
            console.error(`     • ${error.field}: ${error.message}`)
        })
        console.error('')
    })

    console.error('💡 Tip: Ensure all cross-sell product IDs exist')
    console.error('💡 Tip: Check that product IDs match their filenames (without .json)\n')

    process.exit(1)
}

main()
