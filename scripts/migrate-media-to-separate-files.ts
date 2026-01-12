#!/usr/bin/env bun

/**
 * Migration script to extract media from product.json files into separate media files
 *
 * This script:
 * 1. Reads all product JSON files
 * 2. Extracts the media array from each
 * 3. Saves to {product-id}-media.json
 * 4. Removes the media field from the product JSON
 *
 * Usage:
 *   bun scripts/migrate-media-to-separate-files.ts
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { MediaArraySchema } from '../src/schemas/media.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')

function main() {
    console.log('🔄 Migrating media to separate files...\n')
    console.log(`Products directory: ${PRODUCTS_DIR}\n`)

    // Read all product JSON files (exclude FAQ, testimonial, media files)
    const files = readdirSync(PRODUCTS_DIR).filter(
        (file) =>
            file.endsWith('.json') &&
            !file.endsWith('-faq.json') &&
            !file.endsWith('-testimonials.json') &&
            !file.endsWith('-media.json')
    )

    console.log(`Found ${files.length} product file(s)\n`)

    let migrated = 0
    let skipped = 0
    let errors = 0

    for (const file of files) {
        const filePath = join(PRODUCTS_DIR, file)
        const productId = file.replace('.json', '')

        try {
            // Read product file
            const content = readFileSync(filePath, 'utf-8')
            const product = JSON.parse(content)

            if (!product.id) {
                console.error(`  ❌ ${file}: Missing 'id' field`)
                errors++
                continue
            }

            // Check if product has media
            if (!product.media || !Array.isArray(product.media) || product.media.length === 0) {
                console.log(`  ⊝ ${file}: No media to migrate`)
                skipped++
                continue
            }

            const media = product.media

            // Validate media array
            const validationResult = MediaArraySchema.safeParse(media)
            if (!validationResult.success) {
                console.error(`  ❌ ${file}: Invalid media data`)
                validationResult.error.errors.forEach((err) => {
                    console.error(`     - ${err.path.join('.')}: ${err.message}`)
                })
                errors++
                continue
            }

            // Save media to separate file
            const mediaPath = join(PRODUCTS_DIR, `${productId}-media.json`)
            const mediaJson = JSON.stringify(validationResult.data, null, 4)
            writeFileSync(mediaPath, mediaJson + '\n', 'utf-8')

            // Remove media from product and save
            delete product.media
            const productJson = JSON.stringify(product, null, 4)
            writeFileSync(filePath, productJson + '\n', 'utf-8')

            console.log(`  ✅ ${file}: Migrated ${media.length} media item(s)`)
            migrated++
        } catch (error) {
            console.error(`  ❌ ${file}: ${error instanceof Error ? error.message : String(error)}`)
            errors++
        }
    }

    console.log(`\n📊 Migration Summary:`)
    console.log(`   Migrated: ${migrated}`)
    console.log(`   Skipped: ${skipped} (no media)`)
    console.log(`   Errors: ${errors}`)

    if (errors > 0) {
        console.error(`\n❌ Migration completed with errors`)
        process.exit(1)
    }

    console.log(`\n✅ Migration completed successfully`)
    process.exit(0)
}

main()
