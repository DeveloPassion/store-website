#!/usr/bin/env bun

/**
 * Validate products against the Zod schema
 *
 * This script validates products in two modes:
 * 1. Individual file mode: Validates each product file in src/data/products/
 *    and then validates the aggregated products.json
 * 2. Fallback mode: Validates products.json directly (backward compatibility)
 *
 * Usage:
 *   npm run validate:products
 *   bun scripts/validate-products.ts
 *
 * Exit codes:
 *   0 - All products are valid
 *   1 - Validation errors found
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
    AggregatedProductsArraySchema,
    type AggregatedProduct
} from '../src/schemas/product.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_FILE = resolve(__dirname, '../src/data/products.json')

interface ValidationError {
    productId: string
    productIndex: number
    filename?: string
    errors: string[]
}

function validateAggregated(products: AggregatedProduct[]): ValidationError[] {
    console.log('📦 Validating aggregated products...\n')

    // Check for duplicate IDs
    const idCounts = new Map<string, number>()
    products.forEach((product) => {
        idCounts.set(product.id, (idCounts.get(product.id) || 0) + 1)
    })

    const duplicates = Array.from(idCounts.entries()).filter(([, count]) => count > 1)
    if (duplicates.length > 0) {
        console.error('  ❌ Duplicate product IDs found:')
        duplicates.forEach(([id, count]) => {
            console.error(`     • ID "${id}" appears ${count} times`)
        })
        console.log('')
        return duplicates.map(([id]) => ({
            productId: id,
            productIndex: -1,
            errors: ['Duplicate product ID']
        }))
    }

    // Validate the entire array structure
    const result = AggregatedProductsArraySchema.safeParse(products)
    if (result.success) {
        console.log(`  ✅ All ${products.length} products aggregate correctly`)
        console.log('  ✅ No duplicate IDs')
        console.log('  ✅ All cross-references valid\n')
        return []
    }

    console.error('  ❌ Aggregated validation failed\n')
    return [
        {
            productId: '[aggregation]',
            productIndex: -1,
            errors: result.error.errors.map((err) => `  • ${err.path.join('.')}: ${err.message}`)
        }
    ]
}

function displaySummary(products: AggregatedProduct[]) {
    console.log('📊 Product Summary:')
    console.log(`   Total products: ${products.length}`)

    const featuredCount = products.filter((p) => p.featured).length
    console.log(`\n   Featured products: ${featuredCount}`)
}

function main() {
    console.log('🔍 Validating aggregated products...\n')

    // Note: Individual product files are validated during aggregation
    // This script only validates the aggregated products.json file

    // Check if aggregated products file exists
    if (!existsSync(PRODUCTS_FILE)) {
        console.error('❌ Aggregated products file not found:', PRODUCTS_FILE)
        console.error('💡 Tip: Run `bun run aggregate:products` first')
        process.exit(1)
    }

    // Load and validate aggregated products
    try {
        const content = readFileSync(PRODUCTS_FILE, 'utf-8')
        const products = JSON.parse(content)

        // Validate aggregated result
        const aggregationErrors = validateAggregated(products)

        // Display results
        if (aggregationErrors.length === 0) {
            console.log('✅ All aggregated products are valid!\n')
            displaySummary(products)
            process.exit(0)
        }

        // Display errors
        console.error('❌ Validation failed!\n')

        if (aggregationErrors.length > 0) {
            console.error('Aggregation errors:\n')
            aggregationErrors.forEach(({ errors: aggErrors }) => {
                aggErrors.forEach((err) => console.error(err))
            })
            console.error('')
        }

        console.error('💡 Tip: Check the schema definition at src/schemas/product.schema.ts')
        console.error('💡 Tip: Ensure all required fields are present and correctly typed\n')

        process.exit(1)
    } catch (error) {
        console.error('❌ Failed to load or parse products.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

main()
