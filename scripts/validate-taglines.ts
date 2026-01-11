#!/usr/bin/env bun

/**
 * Validate taglines.json against the Zod schema
 *
 * This script ensures all taglines in taglines.json conform to the expected structure
 * and data types defined in src/schemas/tagline.schema.ts
 *
 * Usage:
 *   npm run validate:taglines
 *   bun scripts/validate-taglines.ts
 *
 * Exit codes:
 *   0 - All taglines are valid
 *   1 - Validation errors found
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { TaglinesArraySchema, TaglineSchema } from '../src/schemas/tagline.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TAGLINES_FILE = resolve(__dirname, '../src/data/taglines.json')

interface ValidationError {
    taglineId: string
    errors: string[]
}

function main() {
    console.log('🔍 Validating taglines.json...\n')
    console.log(`Reading: ${TAGLINES_FILE}\n`)

    let taglinesData: unknown
    try {
        const fileContent = readFileSync(TAGLINES_FILE, 'utf-8')
        taglinesData = JSON.parse(fileContent)
    } catch (error) {
        console.error('❌ Failed to read or parse taglines.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }

    // Validate the entire taglines array
    const result = TaglinesArraySchema.safeParse(taglinesData)

    if (!result.success) {
        // Validation failed - provide detailed error messages
        console.error('❌ Schema validation failed!\n')

        const errors: ValidationError[] = []

        // Parse individual taglines to identify which ones have errors
        if (Array.isArray(taglinesData)) {
            taglinesData.forEach((taglineData: unknown, index: number) => {
                const taglineResult = TaglineSchema.safeParse(taglineData)
                if (!taglineResult.success && taglineResult.error?.errors) {
                    const taglineErrors = taglineResult.error.errors.map((err) => {
                        const path = err.path.join('.') || '[root]'
                        const actualValue = err.path.reduce(
                            (obj: Record<string, unknown> | undefined, key) =>
                                (obj as Record<string, unknown>)?.[key] as
                                    | Record<string, unknown>
                                    | undefined,
                            taglineData as Record<string, unknown>
                        )
                        const actualValueStr =
                            actualValue !== undefined
                                ? ` (got: ${JSON.stringify(actualValue)})`
                                : ''

                        // Provide helpful suggestions based on error type
                        let suggestion = ''
                        if (path === 'id' && err.code === 'too_small') {
                            suggestion = '\n    → ID cannot be empty'
                        } else if (path === 'text' && err.code === 'too_small') {
                            suggestion = '\n    → Text cannot be empty'
                        } else if (path === 'text' && err.code === 'too_big') {
                            suggestion = '\n    → Text must be 200 characters or less'
                        } else if (path === 'category' && err.code === 'invalid_enum_value') {
                            suggestion =
                                '\n    → Category must be one of: default, problem-focused, transformation-focused, outcome-focused, identity-focused, action-focused'
                        } else if (path === 'featured' && err.code === 'invalid_type') {
                            suggestion = '\n    → Must be boolean (true or false)'
                        }

                        return `  • ${path}: ${err.message}${actualValueStr}${suggestion}`
                    })

                    const taglineId =
                        typeof taglineData === 'object' &&
                        taglineData !== null &&
                        'id' in taglineData
                            ? String(taglineData.id)
                            : `[index ${index}]`

                    errors.push({
                        taglineId,
                        errors: taglineErrors
                    })
                }
            })
        }

        if (errors.length > 0) {
            console.error(`Found errors in ${errors.length} tagline(s):\n`)
            errors.forEach(({ taglineId, errors: taglineErrors }) => {
                console.error(`❌ Tagline: "${taglineId}"`)
                taglineErrors.forEach((err) => console.error(err))
                console.error('')
            })
        } else {
            // General structure error
            console.error('❌ Invalid file structure')
            console.error('Expected: Array of taglines\n')
            if (result.error?.errors) {
                result.error.errors.forEach((err) => {
                    console.error(`  • ${err.path.join('.') || '[root]'}: ${err.message}`)
                })
            }
            console.error('')
        }

        console.error('💡 Common Issues:')
        console.error('   - ID: Must not be empty')
        console.error('   - Text: Must not be empty and <= 200 characters')
        console.error(
            '   - Category: Must be one of: default, problem-focused, transformation-focused, outcome-focused, identity-focused, action-focused'
        )
        console.error('   - Featured: Must be boolean (true or false)')
        console.error('')
        console.error('📖 Full schema: src/schemas/tagline.schema.ts\n')
        process.exit(1)
    }

    console.log(`✅ All ${result.data.length} taglines passed schema validation!\n`)

    // Check for duplicate IDs
    console.log('🔍 Checking for duplicate tagline IDs...\n')

    const idCounts = new Map<string, number>()
    result.data.forEach((tagline) => {
        idCounts.set(tagline.id, (idCounts.get(tagline.id) || 0) + 1)
    })

    const duplicates = Array.from(idCounts.entries()).filter(([, count]) => count > 1)

    if (duplicates.length > 0) {
        console.error(`❌ ${duplicates.length} duplicate tagline ID(s) found:\n`)
        duplicates.forEach(([id, count]) => {
            console.error(`  ID: "${id}" appears ${count} times`)
        })
        console.error('\n💡 Each tagline must have a unique ID\n')
        process.exit(1)
    }

    console.log('✅ All tagline IDs are unique!\n')

    // Display summary
    const featured = result.data.filter((t) => t.featured)
    const nonFeatured = result.data.filter((t) => !t.featured)

    // Count by category
    const categoryCount = new Map<string, number>()
    result.data.forEach((tagline) => {
        categoryCount.set(tagline.category, (categoryCount.get(tagline.category) || 0) + 1)
    })

    console.log('📊 Tagline Summary:')
    console.log(`   Total taglines: ${result.data.length}`)
    console.log(`   Featured taglines: ${featured.length}`)
    console.log(`   Non-featured taglines: ${nonFeatured.length}\n`)

    console.log('   By Category:')
    Array.from(categoryCount.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([category, count]) => {
            console.log(`     ${category}: ${count}`)
        })

    console.log('\n   Featured Taglines:')
    featured.forEach((tagline) => {
        console.log(`     • ${tagline.text}`)
    })

    console.log('\n✅ All validations passed!\n')
    process.exit(0)
}

main()
