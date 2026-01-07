#!/usr/bin/env tsx

/**
 * Validate products.json against the Zod schema
 *
 * This script ensures all products in products.json conform to the expected structure
 * and data types defined in src/schemas/product.schema.ts
 *
 * Usage:
 *   npm run validate:products
 *   tsx scripts/validate-products.ts
 *
 * Exit codes:
 *   0 - All products are valid
 *   1 - Validation errors found
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { ProductsArraySchema, ProductSchema } from '../src/schemas/product.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_FILE = resolve(__dirname, '../src/data/products.json')

interface ValidationError {
    productId: string
    productIndex: number
    errors: string[]
}

function main() {
    console.log('🔍 Validating products.json...\n')
    console.log(`Reading: ${PRODUCTS_FILE}\n`)

    let productsData: unknown
    try {
        const fileContent = readFileSync(PRODUCTS_FILE, 'utf-8')
        productsData = JSON.parse(fileContent)
    } catch (error) {
        console.error('❌ Failed to read or parse products.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }

    // Validate the entire array
    const result = ProductsArraySchema.safeParse(productsData)

    if (result.success) {
        console.log(`✅ All ${result.data.length} products are valid!\n`)

        // Display summary
        console.log('📊 Product Summary:')
        console.log(`   Total products: ${result.data.length}`)

        const byStatus = result.data.reduce(
            (acc, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1
                return acc
            },
            {} as Record<string, number>
        )

        console.log('\n   By status:')
        Object.entries(byStatus).forEach(([status, count]) => {
            console.log(`     - ${status}: ${count}`)
        })

        const byType = result.data.reduce(
            (acc, p) => {
                acc[p.type] = (acc[p.type] || 0) + 1
                return acc
            },
            {} as Record<string, number>
        )

        console.log('\n   By type:')
        Object.entries(byType).forEach(([type, count]) => {
            console.log(`     - ${type}: ${count}`)
        })

        const featuredCount = result.data.filter((p) => p.featured).length
        console.log(`\n   Featured products: ${featuredCount}`)

        process.exit(0)
    }

    // Validation failed - parse errors
    console.error('❌ Validation failed!\n')

    const errors: ValidationError[] = []
    const zodError = result.error

    // Try to parse individual products to identify which ones are problematic
    if (Array.isArray(productsData)) {
        productsData.forEach((product: any, index: number) => {
            const productResult = ProductSchema.safeParse(product)
            if (!productResult.success && productResult.error && productResult.error.errors) {
                const productErrors = productResult.error.errors.map((err) => {
                    const path = err.path.join('.') || '[root]'
                    return `  • ${path}: ${err.message}`
                })

                errors.push({
                    productId: product?.id || `[unknown-${index}]`,
                    productIndex: index,
                    errors: productErrors
                })
            }
        })
    }

    // Display errors by product
    if (errors.length > 0) {
        console.error(`Found errors in ${errors.length} product(s):\n`)
        errors.forEach(({ productId, productIndex, errors: productErrors }) => {
            console.error(`❌ Product #${productIndex + 1}: "${productId}"`)
            productErrors.forEach((err) => console.error(err))
            console.error('')
        })
    } else if (zodError && zodError.errors) {
        // Display raw Zod errors if we couldn't parse individual products
        console.error('Validation errors:')
        zodError.errors.forEach((err) => {
            const path = err.path.join('.') || '[root]'
            console.error(`  • ${path}: ${err.message}`)
        })
    } else {
        console.error('Unknown validation error occurred')
        console.error('Raw error:', JSON.stringify(result.error, null, 2))
    }

    console.error('\n💡 Tip: Check the schema definition at src/schemas/product.schema.ts')
    console.error('💡 Tip: Ensure all required fields are present and correctly typed\n')

    process.exit(1)
}

main()
