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

import { readFileSync, existsSync, readdirSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import {
    AggregatedProductsArraySchema,
    IndividualProductSchema,
    type AggregatedProduct,
    type IndividualProduct
} from '../src/schemas/product.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_FILE = resolve(__dirname, '../src/data/products.json')
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')

interface ValidationError {
    productId: string
    productIndex: number
    filename?: string
    errors: string[]
}

/**
 * Validate individual product files
 * Checks schema validity and ensures sales copy files exist
 */
function validateIndividualProducts(): ValidationError[] {
    console.log('📁 Validating individual product files...\n')

    if (!existsSync(PRODUCTS_DIR)) {
        console.error('  ❌ Products directory not found:', PRODUCTS_DIR)
        return [
            {
                productId: '[directory]',
                productIndex: -1,
                errors: ['Products directory not found']
            }
        ]
    }

    // Get all individual product files (exclude auxiliary files)
    const files = readdirSync(PRODUCTS_DIR).filter(
        (f) =>
            f.endsWith('.json') &&
            !f.endsWith('-faq.json') &&
            !f.endsWith('-testimonials.json') &&
            !f.endsWith('-media.json') &&
            !f.endsWith('-stats.json') &&
            !f.includes('-sales-copy-')
    )

    const errors: ValidationError[] = []
    let validCount = 0

    for (const file of files) {
        const filePath = join(PRODUCTS_DIR, file)
        const fileErrors: string[] = []

        try {
            const content = readFileSync(filePath, 'utf-8')
            const productData = JSON.parse(content)

            // Validate against IndividualProductSchema
            const result = IndividualProductSchema.safeParse(productData)
            if (!result.success) {
                result.error.errors.forEach((err) => {
                    fileErrors.push(`Schema: ${err.path.join('.')}: ${err.message}`)
                })
            }

            const productId = productData.id || file.replace('.json', '')
            const activeSalesCopyId = productData.activeSalesCopyId

            // Check activeSalesCopyId is set
            if (!activeSalesCopyId) {
                fileErrors.push(
                    'Missing activeSalesCopyId - every product must have an active sales copy'
                )
            } else {
                // Check sales copy file exists
                const salesCopyFile = `${productId}-sales-copy-${activeSalesCopyId}.json`
                const salesCopyPath = join(PRODUCTS_DIR, salesCopyFile)

                if (!existsSync(salesCopyPath)) {
                    fileErrors.push(
                        `Sales copy file not found: ${salesCopyFile} (activeSalesCopyId: "${activeSalesCopyId}")`
                    )
                }
            }

            if (fileErrors.length > 0) {
                errors.push({
                    productId,
                    productIndex: -1,
                    filename: file,
                    errors: fileErrors
                })
                console.log(`  ❌ ${file}`)
                fileErrors.forEach((err) => console.log(`     • ${err}`))
            } else {
                validCount++
                console.log(`  ✅ ${file}`)
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error)
            errors.push({
                productId: file.replace('.json', ''),
                productIndex: -1,
                filename: file,
                errors: [`Failed to parse: ${errorMsg}`]
            })
            console.log(`  ❌ ${file}: ${errorMsg}`)
        }
    }

    console.log(`\n  Summary: ${validCount}/${files.length} products valid\n`)

    return errors
}

/**
 * Validate includedProducts references across all products
 * Checks:
 * 1. All referenced product IDs exist (both root and variant level)
 * 2. No self-references (product can't include itself)
 * 3. No duplicates between root includedProducts and variant includedProducts
 */
function validateIncludedProducts(productsMap: Map<string, IndividualProduct>): ValidationError[] {
    console.log('🔗 Validating includedProducts references...\n')

    const errors: ValidationError[] = []
    const allProductIds = new Set(productsMap.keys())
    let validCount = 0
    let productsWithIncluded = 0

    for (const [productId, product] of productsMap) {
        const rootIncludedProducts = product.includedProducts || []
        const variants = product.variants || []

        // Check if this product has any included products (root or variant level)
        const hasRootIncluded = rootIncludedProducts.length > 0
        const hasVariantIncluded = variants.some(
            (v) => v.includedProducts && v.includedProducts.length > 0
        )

        if (!hasRootIncluded && !hasVariantIncluded) {
            continue // Skip products without any includedProducts
        }

        productsWithIncluded++
        const productErrors: string[] = []

        // Build set of root included product IDs for duplicate checking
        const rootIncludedIds = new Set<string>()

        // Check root includedProducts references
        for (const refId of rootIncludedProducts) {
            // Check for self-reference
            if (refId === productId) {
                productErrors.push(`Self-reference in includedProducts: "${refId}"`)
            }

            // Check if referenced product exists
            if (!allProductIds.has(refId)) {
                productErrors.push(
                    `Invalid product ID in includedProducts: "${refId}" does not exist`
                )
            }

            rootIncludedIds.add(refId)
        }

        // Check variant-level includedProducts references
        for (const variant of variants) {
            const variantIncluded = variant.includedProducts || []
            const variantName = variant.name

            for (const refId of variantIncluded) {
                // Check for self-reference
                if (refId === productId) {
                    productErrors.push(
                        `Self-reference in variant "${variantName}" includedProducts: "${refId}"`
                    )
                }

                // Check if referenced product exists
                if (!allProductIds.has(refId)) {
                    productErrors.push(
                        `Invalid product ID in variant "${variantName}" includedProducts: "${refId}" does not exist`
                    )
                }

                // Check for duplicates with root includedProducts
                if (rootIncludedIds.has(refId)) {
                    productErrors.push(
                        `Duplicate: "${refId}" appears in both root includedProducts and variant "${variantName}" includedProducts`
                    )
                }
            }
        }

        if (productErrors.length > 0) {
            errors.push({
                productId,
                productIndex: -1,
                filename: `${productId}.json`,
                errors: productErrors
            })
            console.log(`  ❌ ${productId}.json`)
            productErrors.forEach((err) => console.log(`     • ${err}`))
        } else {
            validCount++
        }
    }

    if (productsWithIncluded > 0) {
        console.log(
            `\n  Summary: ${validCount}/${productsWithIncluded} products with includedProducts valid\n`
        )
    } else {
        console.log('  No products have includedProducts defined\n')
    }

    return errors
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

    // Course-specific validation: Course products with courseContent must have at least 1 module
    const courseErrors: ValidationError[] = []
    for (const product of products) {
        if (product.mainCategory === 'courses' && product.salesCopy?.courseContent) {
            const modules = product.salesCopy.courseContent.modules
            if (!modules || modules.length === 0) {
                console.error(
                    `  ❌ Course product "${product.id}" has courseContent but no modules`
                )
                courseErrors.push({
                    productId: product.id,
                    productIndex: -1,
                    errors: ['Course product with courseContent must have at least one module']
                })
            }
        }
    }
    if (courseErrors.length > 0) {
        console.log('')
        return courseErrors
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
    console.log('🔍 Validating products...\n')

    // Step 1: Validate individual product files (schema + sales copy existence)
    const individualErrors = validateIndividualProducts()

    // Step 2: Load all individual products for cross-reference validation
    const productsMap = new Map<string, IndividualProduct>()
    if (existsSync(PRODUCTS_DIR)) {
        const files = readdirSync(PRODUCTS_DIR).filter(
            (f) =>
                f.endsWith('.json') &&
                !f.endsWith('-faq.json') &&
                !f.endsWith('-testimonials.json') &&
                !f.endsWith('-media.json') &&
                !f.endsWith('-stats.json') &&
                !f.includes('-sales-copy-')
        )

        for (const file of files) {
            try {
                const content = readFileSync(join(PRODUCTS_DIR, file), 'utf-8')
                const productData = JSON.parse(content)
                const result = IndividualProductSchema.safeParse(productData)
                if (result.success) {
                    productsMap.set(result.data.id, result.data)
                }
            } catch {
                // Errors already reported in validateIndividualProducts
            }
        }
    }

    // Step 3: Validate includedProducts cross-references
    const includedProductsErrors = validateIncludedProducts(productsMap)

    // Step 4: Check if aggregated products file exists
    if (!existsSync(PRODUCTS_FILE)) {
        console.error('❌ Aggregated products file not found:', PRODUCTS_FILE)
        console.error('💡 Tip: Run `bun run aggregate:products` first')
        process.exit(1)
    }

    // Step 5: Load and validate aggregated products
    try {
        const content = readFileSync(PRODUCTS_FILE, 'utf-8')
        const products = JSON.parse(content)

        // Validate aggregated result
        const aggregationErrors = validateAggregated(products)

        // Display results
        const hasErrors =
            individualErrors.length > 0 ||
            includedProductsErrors.length > 0 ||
            aggregationErrors.length > 0

        if (!hasErrors) {
            console.log('✅ All products are valid!\n')
            displaySummary(products)
            process.exit(0)
        }

        // Display errors
        console.error('❌ Validation failed!\n')

        if (individualErrors.length > 0) {
            console.error('Individual file errors:')
            individualErrors.forEach(({ filename, errors: fileErrors }) => {
                console.error(`  ${filename}:`)
                fileErrors.forEach((err) => console.error(`    • ${err}`))
            })
            console.error('')
        }

        if (includedProductsErrors.length > 0) {
            console.error('Included products errors:')
            includedProductsErrors.forEach(({ filename, errors: fileErrors }) => {
                console.error(`  ${filename}:`)
                fileErrors.forEach((err) => console.error(`    • ${err}`))
            })
            console.error('')
        }

        if (aggregationErrors.length > 0) {
            console.error('Aggregation errors:')
            aggregationErrors.forEach(({ errors: aggErrors }) => {
                aggErrors.forEach((err) => console.error(`    ${err}`))
            })
            console.error('')
        }

        console.error('💡 Tip: Check the schema definition at src/schemas/product.schema.ts')
        console.error('💡 Tip: Ensure all required fields are present and correctly typed')
        console.error(
            '💡 Tip: Ensure each product has a valid activeSalesCopyId with corresponding file\n'
        )

        process.exit(1)
    } catch (error) {
        console.error('❌ Failed to load or parse products.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

main()
