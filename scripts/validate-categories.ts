#!/usr/bin/env tsx

/**
 * Validate categories.json against the Zod schema
 *
 * This script ensures all categories in categories.json conform to the expected structure
 * and data types defined in src/schemas/category.schema.ts
 *
 * Usage:
 *   npm run validate:categories
 *   tsx scripts/validate-categories.ts
 *
 * Exit codes:
 *   0 - All categories are valid
 *   1 - Validation errors found
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { CategoriesArraySchema, CategorySchema } from '../src/schemas/category.schema.js'
// @ts-expect-error - JSON import
import productsData from '../src/data/products.json' assert { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CATEGORIES_FILE = resolve(__dirname, '../src/data/categories.json')

interface ValidationError {
    categoryId: string
    categoryIndex: number
    errors: string[]
}

function main() {
    console.log('🔍 Validating categories.json...\n')
    console.log(`Reading: ${CATEGORIES_FILE}\n`)

    let categoriesData: unknown
    try {
        const fileContent = readFileSync(CATEGORIES_FILE, 'utf-8')
        categoriesData = JSON.parse(fileContent)
    } catch (error) {
        console.error('❌ Failed to read or parse categories.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }

    // Validate the entire array
    const result = CategoriesArraySchema.safeParse(categoriesData)

    if (!result.success) {
        // Validation failed - provide detailed error messages
        console.error('❌ Schema validation failed!\n')

        const errors: ValidationError[] = []

        // Parse individual categories to identify which ones have errors
        if (Array.isArray(categoriesData)) {
            categoriesData.forEach((category: Record<string, unknown>, index: number) => {
                const categoryResult = CategorySchema.safeParse(category)
                if (!categoryResult.success && categoryResult.error?.errors) {
                    const categoryErrors = categoryResult.error.errors.map((err) => {
                        const path = err.path.join('.') || '[root]'
                        const actualValue = err.path.reduce(
                            (obj: Record<string, unknown> | undefined, key) =>
                                (obj as Record<string, unknown>)?.[key] as
                                    | Record<string, unknown>
                                    | undefined,
                            category as Record<string, unknown>
                        )
                        const actualValueStr =
                            actualValue !== undefined
                                ? ` (got: ${JSON.stringify(actualValue)})`
                                : ''

                        // Provide helpful suggestions based on error type
                        let suggestion = ''
                        if (path === 'color' && err.code === 'invalid_string') {
                            suggestion =
                                '\n    → Color should be in hex format: #RRGGBB (e.g., "#4ECDC4") or any valid CSS color'
                        } else if (path === 'id' && err.code === 'invalid_enum_value') {
                            suggestion =
                                '\n    → Category ID must be added to CategoryIdSchema enum in src/schemas/category.schema.ts'
                        } else if (path === 'priority' && err.code === 'too_small') {
                            suggestion =
                                '\n    → Priority must be >= 1 (featured: 1-7, non-featured: 8+)'
                        } else if (
                            (path === 'name' || path === 'description') &&
                            err.code === 'too_small'
                        ) {
                            suggestion = '\n    → This field cannot be empty'
                        } else if (path === 'featured' && err.code === 'invalid_type') {
                            suggestion = '\n    → Must be boolean (true or false)'
                        }

                        return `  • ${path}: ${err.message}${actualValueStr}${suggestion}`
                    })

                    errors.push({
                        categoryId: category?.id || `[unknown-${index}]`,
                        categoryIndex: index,
                        errors: categoryErrors
                    })
                }
            })
        }

        if (errors.length > 0) {
            console.error(`Found errors in ${errors.length} category(ies):\n`)
            errors.forEach(({ categoryId, categoryIndex, errors: catErrors }) => {
                console.error(`❌ Category #${categoryIndex + 1}: "${categoryId}"`)
                catErrors.forEach((err) => console.error(err))
                console.error('')
            })
        } else {
            // General structure error
            console.error('❌ Invalid file structure')
            console.error('Expected: Array of category objects\n')
            result.error.errors.forEach((err) => {
                console.error(`  • ${err.path.join('.') || '[root]'}: ${err.message}`)
            })
            console.error('')
        }

        console.error('💡 Common Issues:')
        console.error('   - Priority: Featured categories (1-7), Non-featured (8+)')
        console.error(
            '   - New category IDs: Must be added to CategoryIdSchema enum in category.schema.ts'
        )
        console.error('   - Required fields: id, name, description, featured, priority')
        console.error('   - File structure: Must be an array, not an object')
        console.error('')
        console.error('📖 Full schema: src/schemas/category.schema.ts\n')
        process.exit(1)
    }

    console.log(`✅ All ${result.data.length} categories passed schema validation!\n`)

    // Validate that all product categories are valid CategoryIds
    console.log('🔍 Checking product categories against valid CategoryIds...\n')

    const validCategoryIds = new Set(result.data.map((cat) => cat.id))
    const invalidMainCategories: Array<{ productId: string; categoryId: string }> = []
    const invalidSecondaryCategories: Array<{ productId: string; categoryId: string }> = []

    productsData.forEach(
        (product: {
            id: string
            mainCategory: string
            secondaryCategories?: Array<{ id: string; distant: boolean }>
        }) => {
            // Check mainCategory
            if (!validCategoryIds.has(product.mainCategory)) {
                invalidMainCategories.push({
                    productId: product.id,
                    categoryId: product.mainCategory
                })
            }

            // Check secondaryCategories
            if (product.secondaryCategories) {
                product.secondaryCategories.forEach((secCat) => {
                    if (!validCategoryIds.has(secCat.id)) {
                        invalidSecondaryCategories.push({
                            productId: product.id,
                            categoryId: secCat.id
                        })
                    }
                })
            }
        }
    )

    let hasInvalidCategories = false

    if (invalidMainCategories.length > 0) {
        hasInvalidCategories = true
        console.error(
            `❌ ${invalidMainCategories.length} invalid product mainCategory value(s) found:\n`
        )
        invalidMainCategories.forEach(({ productId, categoryId }) => {
            console.error(`  Product: ${productId}`)
            console.error(`    Invalid mainCategory: "${categoryId}"`)
            console.error(`    → Category not found in categories.json!\n`)
        })
    }

    if (invalidSecondaryCategories.length > 0) {
        hasInvalidCategories = true
        console.error(
            `❌ ${invalidSecondaryCategories.length} invalid product secondaryCategory value(s) found:\n`
        )
        invalidSecondaryCategories.forEach(({ productId, categoryId }) => {
            console.error(`  Product: ${productId}`)
            console.error(`    Invalid secondaryCategory: "${categoryId}"`)
            console.error(`    → Category not found in categories.json!\n`)
        })
    }

    if (hasInvalidCategories) {
        console.error('\n💡 All categories used in products must have entries in categories.json')
        console.error(
            '   AND be added to CategoryIdSchema enum in src/schemas/category.schema.ts\n'
        )
        process.exit(1)
    }

    console.log('✅ All product categories are valid CategoryIds!\n')

    // Display summary
    const featured = result.data.filter((c) => c.featured)
    const nonFeatured = result.data.filter((c) => !c.featured)

    console.log('📊 Category Summary:')
    console.log(`   Total categories: ${result.data.length}`)
    console.log(`   Featured categories: ${featured.length}`)
    console.log(`   Non-featured categories: ${nonFeatured.length}\n`)

    console.log('   Featured Categories:')
    featured
        .sort((a, b) => a.priority - b.priority)
        .forEach((cat) => {
            console.log(`     ${cat.priority}. ${cat.name} (${cat.id})`)
        })

    console.log('\n✅ All validations passed!\n')
    process.exit(0)
}

main()
