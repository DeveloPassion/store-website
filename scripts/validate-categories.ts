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

    if (result.success) {
        console.log(`✅ All ${result.data.length} categories are valid!\n`)

        // Display summary
        console.log('📊 Category Summary:')
        console.log(`   Total categories: ${result.data.length}`)
        console.log('\n   Categories:')
        result.data.forEach((cat) => {
            console.log(`     - ${cat.id}: ${cat.name}`)
        })

        process.exit(0)
    }

    // Validation failed - provide detailed error messages
    console.error('❌ Validation failed!\n')

    const errors: ValidationError[] = []

    // Parse individual categories to identify which ones have errors
    if (Array.isArray(categoriesData)) {
        categoriesData.forEach((category: any, index: number) => {
            const categoryResult = CategorySchema.safeParse(category)
            if (!categoryResult.success && categoryResult.error?.errors) {
                const categoryErrors = categoryResult.error.errors.map((err) => {
                    const path = err.path.join('.') || '[root]'
                    return `  • ${path}: ${err.message}`
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
    }

    console.error('\n💡 Tip: Check the schema definition at src/schemas/category.schema.ts\n')
    process.exit(1)
}

main()
