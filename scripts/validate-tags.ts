#!/usr/bin/env bun

/**
 * Validate tags.json against the Zod schema
 *
 * This script ensures all tags in tags.json conform to the expected structure
 * and data types defined in src/schemas/tag.schema.ts
 *
 * It also verifies that all product tags have corresponding metadata entries
 *
 * Usage:
 *   npm run validate:tags
 *   bun scripts/validate-tags.ts
 *
 * Exit codes:
 *   0 - All tags are valid
 *   1 - Validation errors found
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { TagsMapSchema, TagSchema } from '../src/schemas/tag.schema.js'
// @ts-expect-error - JSON import
import productsData from '../src/data/products.json' assert { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TAGS_FILE = resolve(__dirname, '../src/data/tags.json')

interface ValidationError {
    tagId: string
    errors: string[]
}

function main() {
    console.log('🔍 Validating tags.json...\n')
    console.log(`Reading: ${TAGS_FILE}\n`)

    let tagsData: unknown
    try {
        const fileContent = readFileSync(TAGS_FILE, 'utf-8')
        tagsData = JSON.parse(fileContent)
    } catch (error) {
        console.error('❌ Failed to read or parse tags.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }

    // Validate the entire tags map
    const result = TagsMapSchema.safeParse(tagsData)

    if (!result.success) {
        // Validation failed - provide detailed error messages
        console.error('❌ Schema validation failed!\n')

        const errors: ValidationError[] = []

        // Parse individual tags to identify which ones have errors
        if (typeof tagsData === 'object' && tagsData !== null) {
            Object.entries(tagsData).forEach(
                ([tagId, tagData]: [string, Record<string, unknown>]) => {
                    const tagResult = TagSchema.safeParse(tagData)
                    if (!tagResult.success && tagResult.error?.errors) {
                        const tagErrors = tagResult.error.errors.map((err) => {
                            const path = err.path.join('.') || '[root]'
                            const actualValue = err.path.reduce(
                                (obj: Record<string, unknown> | undefined, key) =>
                                    (obj as Record<string, unknown>)?.[key] as
                                        | Record<string, unknown>
                                        | undefined,
                                tagData as Record<string, unknown>
                            )
                            const actualValueStr =
                                actualValue !== undefined
                                    ? ` (got: ${JSON.stringify(actualValue)})`
                                    : ''

                            // Provide helpful suggestions based on error type
                            let suggestion = ''
                            if (path === 'color' && err.code === 'invalid_string') {
                                suggestion =
                                    '\n    → Color must be in hex format: #RRGGBB (e.g., "#FF6B6B")'
                            } else if (path === 'id' && err.code === 'invalid_enum_value') {
                                suggestion =
                                    '\n    → Tag ID must be added to TagIdSchema enum in src/schemas/tag.schema.ts'
                            } else if (path === 'priority' && err.code === 'too_small') {
                                suggestion =
                                    '\n    → Priority must be >= 1 (featured: 1-8, non-featured: 21+)'
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
                            tagId,
                            errors: tagErrors
                        })
                    }
                }
            )
        }

        if (errors.length > 0) {
            console.error(`Found errors in ${errors.length} tag(s):\n`)
            errors.forEach(({ tagId, errors: tagErrors }) => {
                console.error(`❌ Tag: "${tagId}"`)
                tagErrors.forEach((err) => console.error(err))
                console.error('')
            })
        } else {
            // General structure error
            console.error('❌ Invalid file structure')
            console.error('Expected: Object/map of tags with TagId keys\n')
            if (result.error?.errors) {
                result.error.errors.forEach((err) => {
                    console.error(`  • ${err.path.join('.') || '[root]'}: ${err.message}`)
                })
            }
            console.error('')
        }

        console.error('💡 Common Issues:')
        console.error('   - Color format: Must be hex (#RRGGBB), e.g., "#FF6B6B"')
        console.error('   - Priority: Featured tags (1-8), Non-featured (21+)')
        console.error('   - New tag IDs: Must be added to TagIdSchema enum in tag.schema.ts')
        console.error('   - Required fields: id, name, description, featured, priority')
        console.error('')
        console.error('📖 Full schema: src/schemas/tag.schema.ts\n')
        process.exit(1)
    }

    console.log(`✅ All ${Object.keys(result.data).length} tags passed schema validation!\n`)

    // Validate that all product tags are valid TagIds (products now use TagId[] directly)
    console.log('🔍 Checking product tags against valid TagIds...\n')

    const validTagIds = new Set(Object.keys(result.data))
    const invalidTags: Array<{ productId: string; tagId: string }> = []

    productsData.forEach((product: { id: string; tags: string[] }) => {
        product.tags.forEach((tagId: string) => {
            if (!validTagIds.has(tagId)) {
                invalidTags.push({ productId: product.id, tagId })
            }
        })
    })

    if (invalidTags.length > 0) {
        console.error(`❌ ${invalidTags.length} invalid product tag(s) found:\n`)
        invalidTags.forEach(({ productId, tagId }) => {
            console.error(`  Product: ${productId}`)
            console.error(`    Invalid TagId: "${tagId}"`)
            console.error(`    → Tag not found in tags.json!\n`)
        })
        console.error(
            '\n💡 All tags used in products must have entries in tags.json\n' +
                '   Run: bun scripts/utils/generate-tags-metadata.ts to add missing tags\n'
        )
        process.exit(1)
    }

    console.log('✅ All product tags are valid TagIds!\n')

    // Display summary
    const featured = Object.values(result.data).filter((t) => t.featured)
    const nonFeatured = Object.values(result.data).filter((t) => !t.featured)

    console.log('📊 Tag Summary:')
    console.log(`   Total tags: ${Object.keys(result.data).length}`)
    console.log(`   Featured tags: ${featured.length}`)
    console.log(`   Non-featured tags: ${nonFeatured.length}\n`)

    console.log('   Featured Tags:')
    featured
        .sort((a, b) => a.priority - b.priority)
        .forEach((tag) => {
            console.log(`     ${tag.priority}. ${tag.name} (${tag.id})`)
        })

    console.log('\n✅ All validations passed!\n')
    process.exit(0)
}

main()
