#!/usr/bin/env tsx
/**
 * Migrate product tags to use normalized TagId values
 * This script updates all products.json tags to match the tag IDs in tags.json
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_FILE = resolve(__dirname, '../src/data/products.json')
const TAGS_FILE = resolve(__dirname, '../src/data/tags.json')

function normalizeTagId(tag: string): string {
    return tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function main() {
    console.log('🔄 Migrating product tags to normalized TagId format...\n')

    // Load products and tags
    const productsData = JSON.parse(readFileSync(PRODUCTS_FILE, 'utf-8'))
    const tagsData = JSON.parse(readFileSync(TAGS_FILE, 'utf-8'))
    const validTagIds = new Set(Object.keys(tagsData))

    console.log(`Found ${productsData.length} products`)
    console.log(`Found ${validTagIds.size} valid tag IDs\n`)

    let totalTagsUpdated = 0
    let invalidTags: Array<{ productId: string; tag: string; normalized: string }> = []

    // Normalize all product tags
    productsData.forEach((product: any) => {
        const originalTags = product.tags
        const normalizedTags = originalTags.map((tag: string) => {
            const normalized = normalizeTagId(tag)

            // Check if normalized tag exists in tags.json
            if (!validTagIds.has(normalized)) {
                invalidTags.push({
                    productId: product.id,
                    tag: tag,
                    normalized: normalized
                })
            }

            if (tag !== normalized) {
                totalTagsUpdated++
            }

            return normalized
        })

        product.tags = normalizedTags
    })

    if (invalidTags.length > 0) {
        console.error('❌ Found invalid tags that do not exist in tags.json:\n')
        invalidTags.forEach(({ productId, tag, normalized }) => {
            console.error(`  Product: ${productId}`)
            console.error(`    Original: "${tag}"`)
            console.error(`    Normalized: "${normalized}"`)
            console.error(`    → Tag ID not found in tags.json!\n`)
        })
        console.error('\n💡 These tags need to be added to tags.json first\n')
        process.exit(1)
    }

    // Write updated products
    writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 4) + '\n', 'utf-8')

    console.log(`✅ Migration complete!`)
    console.log(`   Updated ${totalTagsUpdated} tag references`)
    console.log(`   All product tags now use normalized TagId format\n`)

    console.log('📝 Next steps:')
    console.log('   1. Run: npm run validate:products')
    console.log('   2. Run: npm run validate:all')
    console.log('   3. Test the application')
}

main()
