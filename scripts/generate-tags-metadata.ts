#!/usr/bin/env tsx
/**
 * Generate initial tags.json from existing product tags
 *
 * This script:
 * 1. Extracts all unique tags from products.json
 * 2. Creates metadata entries with default values
 * 3. Outputs tags.json template for manual curation
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
// @ts-expect-error - JSON import
import productsData from '../src/data/products.json' assert { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUTPUT_FILE = resolve(__dirname, '../src/data/tags.json')

function normalizeTagId(tag: string): string {
    return tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function generateDisplayName(tagId: string): string {
    // Special cases for acronyms
    const acronyms = new Set(['pkm', 'ai', 'seo', 'api', 'ui', 'ux', 'it', 'hr'])

    if (acronyms.has(tagId)) {
        return tagId.toUpperCase()
    }

    // Convert kebab-case to Title Case
    return tagId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

function main() {
    console.log('🏗️  Generating tags metadata from products.json...\n')

    // Extract all unique tags
    const tagSet = new Set<string>()
    productsData.forEach((product: { tags: string[] }) => {
        product.tags.forEach((tag: string) => tagSet.add(tag))
    })

    console.log(`Found ${tagSet.size} unique tags\n`)

    // Generate metadata for each tag
    const tagsMetadata: Record<string, any> = {}
    let priority = 21 // Start non-featured at 21

    Array.from(tagSet)
        .sort()
        .forEach((tag) => {
            const id = normalizeTagId(tag)
            const name = generateDisplayName(id)

            tagsMetadata[id] = {
                id,
                name,
                description: `Resources and tools for ${name.toLowerCase()}`,
                icon: 'FaTag', // Default, manually update for featured
                color: '#999999', // Default gray, manually update
                featured: false, // Manually mark featured ones
                priority: priority++
            }
        })

    // Write to file
    writeFileSync(OUTPUT_FILE, JSON.stringify(tagsMetadata, null, 2) + '\n', 'utf-8')

    console.log(`✅ Generated ${OUTPUT_FILE}`)
    console.log('\n📝 Next steps:')
    console.log('   1. Review generated tags.json')
    console.log('   2. Mark ~5-8 tags as featured (featured: true)')
    console.log('   3. Assign priorities 1-8 to featured tags')
    console.log('   4. Choose meaningful colors and icons for featured tags')
    console.log('   5. Improve descriptions for featured tags')
    console.log('   6. Run: npm run validate:tags')
}

main()
