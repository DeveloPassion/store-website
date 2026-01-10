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

import { readFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { ProductsArraySchema, ProductSchema } from '../src/schemas/product.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')
const PRODUCTS_FILE = resolve(__dirname, '../src/data/products.json')

interface ValidationError {
    productId: string
    productIndex: number
    filename?: string
    errors: string[]
}

interface Product {
    id: string
}

function validateIndividualFiles(): { products: Product[]; errors: ValidationError[] } {
    console.log('📁 Validating individual product files...\n')

    const files = readdirSync(PRODUCTS_DIR).filter(
        (file) =>
            file.endsWith('.json') &&
            !file.endsWith('-faq.json') &&
            !file.endsWith('-testimonials.json')
    )
    console.log(`Found ${files.length} product file(s)\n`)

    const products: Product[] = []
    const errors: ValidationError[] = []

    files.forEach((file, index) => {
        const filepath = join(PRODUCTS_DIR, file)
        try {
            const content = readFileSync(filepath, 'utf-8')
            const product = JSON.parse(content)

            const result = ProductSchema.safeParse(product)
            if (result.success) {
                products.push(result.data)
                console.log(`  ✅ ${file}`)
            } else {
                let productErrors: string[]
                if (result.error && result.error.issues) {
                    productErrors = result.error.issues.map((err) => {
                        const path = err.path.join('.') || '[root]'
                        return `     • ${path}: ${err.message}`
                    })
                } else {
                    productErrors = [
                        `     • Unknown validation error: ${JSON.stringify(result.error)}`
                    ]
                }

                errors.push({
                    productId: product?.id || `[unknown]`,
                    productIndex: index,
                    filename: file,
                    errors: productErrors
                })
                console.error(`  ❌ ${file}`)
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error)
            errors.push({
                productId: `[parse-error]`,
                productIndex: index,
                filename: file,
                errors: [`     • Parse error: ${errorMsg}`]
            })
            console.error(`  ❌ ${file}: Parse error`)
        }
    })

    console.log('')
    return { products, errors }
}

function validateAggregated(products: Product[]): ValidationError[] {
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
    const result = ProductsArraySchema.safeParse(products)
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

function displaySummary(products: Product[]) {
    console.log('📊 Product Summary:')
    console.log(`   Total products: ${products.length}`)

    const byStatus = products.reduce(
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

    const byType = products.reduce(
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

    const featuredCount = products.filter((p) => p.featured).length
    console.log(`\n   Featured products: ${featuredCount}`)
}

function validateDirectMode(): void {
    console.log('🔍 Validating products.json (direct mode)...\n')
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

    const result = ProductsArraySchema.safeParse(productsData)

    if (result.success) {
        console.log(`✅ All ${result.data.length} products are valid!\n`)
        displaySummary(result.data)
        process.exit(0)
    }

    // Validation failed
    console.error('❌ Validation failed!\n')

    const errors: ValidationError[] = []

    if (Array.isArray(productsData)) {
        productsData.forEach((product: Record<string, unknown>, index: number) => {
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

    if (errors.length > 0) {
        console.error(`Found errors in ${errors.length} product(s):\n`)
        errors.forEach(({ productId, productIndex, errors: productErrors }) => {
            console.error(`❌ Product #${productIndex + 1}: "${productId}"`)
            productErrors.forEach((err) => console.error(err))
            console.error('')
        })
    }

    console.error('💡 Tip: Check the schema definition at src/schemas/product.schema.ts')
    console.error('💡 Tip: Ensure all required fields are present and correctly typed\n')

    process.exit(1)
}

function main() {
    console.log('🔍 Validating products...\n')

    // Check if individual files directory exists
    const useIndividualFiles = existsSync(PRODUCTS_DIR)

    if (!useIndividualFiles) {
        console.log('Individual files directory not found. Using direct validation mode.\n')
        validateDirectMode()
        return
    }

    // Validate individual files
    const { products, errors: individualErrors } = validateIndividualFiles()

    // Validate aggregated result
    const aggregationErrors = validateAggregated(products)

    // Collect all errors
    const allErrors = [...individualErrors, ...aggregationErrors]

    // Display results
    if (allErrors.length === 0) {
        console.log('✅ All products are valid!\n')
        displaySummary(products)
        process.exit(0)
    }

    // Display errors
    console.error('❌ Validation failed!\n')

    if (individualErrors.length > 0) {
        console.error(`Found errors in ${individualErrors.length} product file(s):\n`)
        individualErrors.forEach(({ filename, productId, errors: productErrors }) => {
            console.error(`❌ ${filename || productId}`)
            productErrors.forEach((err) => console.error(err))
            console.error('')
        })
    }

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
}

main()
