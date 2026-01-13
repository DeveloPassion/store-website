#!/usr/bin/env bun

/**
 * Migration script: Extract sales copy from product JSON files
 *
 * This script migrates existing products to the new sales copy structure:
 * 1. Extract sales copy fields from product JSON files
 * 2. Create {product-id}-sales-copy-default.json files
 * 3. Update product JSON files: add activeSalesCopyId, remove sales copy fields
 * 4. Validate all changes with schemas
 *
 * Usage:
 *   bun run migrate:sales-copy                    # Migrate all products
 *   bun run migrate:sales-copy --dry-run          # Preview changes only
 *   bun run migrate:sales-copy --product knowii   # Migrate single product
 *
 * Exit codes:
 *   0 - Migration successful
 *   1 - Migration failed
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'
import { IndividualProductSchema } from '../src/schemas/product.schema.js'
import { SalesCopyFileSchema } from '../src/schemas/sales-copy.schema.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')
const BACKUP_SUFFIX = '.backup'

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const productIdArg = args.indexOf('--product')
const targetProductId = productIdArg !== -1 ? args[productIdArg + 1] : null

interface MigrationStats {
    total: number
    migrated: number
    skipped: number
    failed: number
}

interface ProductData {
    id: string
    [key: string]: unknown
}

/**
 * Extract sales copy fields from a product object
 */
function extractSalesCopyFields(product: ProductData): Record<string, unknown> {
    const salesCopyFields = [
        'tagline',
        'secondaryTagline',
        'problem',
        'problemPoints',
        'agitate',
        'agitatePoints',
        'solution',
        'solutionPoints',
        'description',
        'features',
        'benefits',
        'targetAudience',
        'perfectFor',
        'notForYou',
        'trustBadges',
        'guarantees',
        'metaTitle',
        'metaDescription',
        'keywords',
        'storytelling'
    ]

    const salesCopyData: Record<string, unknown> = {}

    for (const field of salesCopyFields) {
        if (product[field] !== undefined) {
            salesCopyData[field] = product[field]
        }
    }

    return salesCopyData
}

/**
 * Remove sales copy fields from a product object
 */
function removeSalesCopyFields(product: ProductData): ProductData {
    const fieldsToRemove = [
        'tagline',
        'secondaryTagline',
        'problem',
        'problemPoints',
        'agitate',
        'agitatePoints',
        'solution',
        'solutionPoints',
        'description',
        'features',
        'benefits',
        'targetAudience',
        'perfectFor',
        'notForYou',
        'trustBadges',
        'guarantees',
        'metaTitle',
        'metaDescription',
        'keywords',
        'storytelling'
    ]

    const cleanProduct = { ...product }

    for (const field of fieldsToRemove) {
        delete cleanProduct[field]
    }

    // Add activeSalesCopyId
    cleanProduct.activeSalesCopyId = 'default'

    return cleanProduct
}

/**
 * Check if product has sales copy fields
 */
function hasSalesCopyFields(product: ProductData): boolean {
    return (
        product.tagline !== undefined ||
        product.problem !== undefined ||
        product.description !== undefined ||
        product.features !== undefined
    )
}

/**
 * Check if product already has a sales copy file
 */
function hasSalesCopyFile(productId: string): boolean {
    const salesCopyPath = join(PRODUCTS_DIR, `${productId}-sales-copy-default.json`)
    return existsSync(salesCopyPath)
}

/**
 * Migrate a single product
 */
function migrateProduct(productId: string, dryRun: boolean): boolean {
    const productPath = join(PRODUCTS_DIR, `${productId}.json`)

    if (!existsSync(productPath)) {
        console.error(`  ❌ Product file not found: ${productId}.json`)
        return false
    }

    try {
        // Read product file
        const content = readFileSync(productPath, 'utf-8')
        const product = JSON.parse(content) as ProductData

        // Check if product already migrated
        if (product.activeSalesCopyId) {
            console.log(`  ⏭️  ${productId}: Already migrated (has activeSalesCopyId)`)
            return false
        }

        // Check if product has sales copy file already
        if (hasSalesCopyFile(productId)) {
            console.log(`  ⏭️  ${productId}: Sales copy file already exists`)
            return false
        }

        // Check if product has sales copy fields
        if (!hasSalesCopyFields(product)) {
            console.log(`  ⏭️  ${productId}: No sales copy fields to extract`)
            return false
        }

        // Extract sales copy fields
        const salesCopyData = extractSalesCopyFields(product)

        // Create sales copy file object
        const salesCopyFile = {
            id: 'default',
            salesCopy: salesCopyData
        }

        // Validate sales copy file
        const salesCopyValidation = SalesCopyFileSchema.safeParse(salesCopyFile)
        if (!salesCopyValidation.success) {
            console.error(`  ❌ ${productId}: Invalid sales copy data`)
            salesCopyValidation.error.errors.forEach((err) => {
                console.error(`     - ${err.path.join('.')}: ${err.message}`)
            })
            return false
        }

        // Remove sales copy fields from product
        const cleanProduct = removeSalesCopyFields(product)

        // Validate clean product
        const productValidation = IndividualProductSchema.safeParse(cleanProduct)
        if (!productValidation.success) {
            console.error(`  ❌ ${productId}: Invalid product after removing sales copy`)
            productValidation.error.errors.forEach((err) => {
                console.error(`     - ${err.path.join('.')}: ${err.message}`)
            })
            return false
        }

        if (dryRun) {
            console.log(`  🔍 ${productId}: Would create sales copy file and update product`)
            console.log(`     - Sales copy fields: ${Object.keys(salesCopyData).length}`)
            return true
        }

        // Create backup
        const backupPath = `${productPath}${BACKUP_SUFFIX}`
        copyFileSync(productPath, backupPath)

        // Write sales copy file
        const salesCopyPath = join(PRODUCTS_DIR, `${productId}-sales-copy-default.json`)
        writeFileSync(salesCopyPath, JSON.stringify(salesCopyFile, null, 2) + '\n', 'utf-8')

        // Write updated product file
        writeFileSync(productPath, JSON.stringify(cleanProduct, null, 2) + '\n', 'utf-8')

        console.log(`  ✅ ${productId}: Migrated successfully`)
        return true
    } catch (error) {
        console.error(
            `  ❌ ${productId}: Migration failed - ${error instanceof Error ? error.message : String(error)}`
        )
        return false
    }
}

function main() {
    console.log('🔄 Migrating products to sales copy structure...\n')

    if (isDryRun) {
        console.log('🔍 DRY RUN MODE - No files will be modified\n')
    }

    if (targetProductId) {
        console.log(`🎯 Migrating single product: ${targetProductId}\n`)
    }

    // Check if products directory exists
    if (!existsSync(PRODUCTS_DIR)) {
        console.error('❌ Products directory does not exist:', PRODUCTS_DIR)
        process.exit(1)
    }

    // Get all product files
    let productFiles: string[]
    try {
        productFiles = readdirSync(PRODUCTS_DIR).filter(
            (file) =>
                file.endsWith('.json') &&
                !file.endsWith('-faq.json') &&
                !file.endsWith('-testimonials.json') &&
                !file.endsWith('-media.json') &&
                !file.includes('-sales-copy-') &&
                !file.endsWith('.backup')
        )
    } catch (error) {
        console.error('❌ Failed to read products directory')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }

    if (productFiles.length === 0) {
        console.error('❌ No product files found in:', PRODUCTS_DIR)
        process.exit(1)
    }

    // Filter to single product if specified
    if (targetProductId) {
        const targetFile = `${targetProductId}.json`
        if (!productFiles.includes(targetFile)) {
            console.error(`❌ Product not found: ${targetProductId}`)
            process.exit(1)
        }
        productFiles = [targetFile]
    }

    console.log(`Found ${productFiles.length} product file(s)\n`)

    const stats: MigrationStats = {
        total: productFiles.length,
        migrated: 0,
        skipped: 0,
        failed: 0
    }

    // Migrate each product
    for (const file of productFiles) {
        const productId = file.replace('.json', '')
        const success = migrateProduct(productId, isDryRun)

        if (success) {
            stats.migrated++
        } else {
            const wasSkipped = file.includes('⏭️')
            if (wasSkipped) {
                stats.skipped++
            } else {
                stats.failed++
            }
        }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('Migration Summary')
    console.log('='.repeat(60))
    console.log(`Total products:    ${stats.total}`)
    console.log(`Migrated:          ${stats.migrated}`)
    console.log(`Skipped:           ${stats.skipped}`)
    console.log(`Failed:            ${stats.failed}`)
    console.log('='.repeat(60))

    if (isDryRun) {
        console.log('\n🔍 Dry run completed - no files were modified')
        console.log('💡 Run without --dry-run to perform actual migration\n')
    } else if (stats.failed > 0) {
        console.error('\n❌ Migration completed with errors')
        console.error('💡 Check the errors above and fix any issues\n')
        process.exit(1)
    } else if (stats.migrated > 0) {
        console.log('\n✅ Migration completed successfully!')
        console.log(`💡 ${stats.migrated} product(s) migrated to new sales copy structure\n`)
        console.log('📝 Next steps:')
        console.log('   1. Review the changes in git diff')
        console.log('   2. Run: bun run validate:all')
        console.log('   3. Run: bun run aggregate:products')
        console.log('   4. Test the site: bun dev\n')
    } else {
        console.log('\n✅ No products needed migration\n')
    }

    process.exit(0)
}

// Only run main() if this script is executed directly
if (import.meta.main) {
    main()
}
