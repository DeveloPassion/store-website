#!/usr/bin/env bun

/**
 * Validate animated-hero-texts.json against the Zod schema
 *
 * This script ensures all animated hero texts in animated-hero-texts.json conform to the expected structure
 * and data types defined in src/schemas/animated-hero-text.schema.ts
 *
 * Usage:
 *   npm run validate:animated-hero-texts
 *   bun scripts/validate-animated-hero-texts.ts
 *
 * Exit codes:
 *   0 - All texts are valid
 *   1 - Validation errors found
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
    AnimatedHeroTextsArraySchema,
    AnimatedHeroTextSchema
} from '../src/schemas/animated-hero-text.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_FILE = resolve(__dirname, '../src/data/animated-hero-texts.json')

interface ValidationError {
    textId: string
    errors: string[]
}

function main() {
    console.log('🔍 Validating animated-hero-texts.json...\n')
    console.log(`Reading: ${DATA_FILE}\n`)

    let textsData: unknown
    try {
        const fileContent = readFileSync(DATA_FILE, 'utf-8')
        textsData = JSON.parse(fileContent)
    } catch (error) {
        console.error('❌ Failed to read or parse animated-hero-texts.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }

    // Validate the entire texts array
    const result = AnimatedHeroTextsArraySchema.safeParse(textsData)

    if (!result.success) {
        // Validation failed - provide detailed error messages
        console.error('❌ Schema validation failed!\n')

        const errors: ValidationError[] = []

        // Parse individual texts to identify which ones have errors
        if (Array.isArray(textsData)) {
            textsData.forEach((textData: unknown, index: number) => {
                const textResult = AnimatedHeroTextSchema.safeParse(textData)
                if (!textResult.success && textResult.error?.errors) {
                    const textErrors = textResult.error.errors.map((err) => {
                        const path = err.path.join('.') || '[root]'
                        const actualValue = err.path.reduce(
                            (obj: Record<string, unknown> | undefined, key) =>
                                (obj as Record<string, unknown>)?.[key] as
                                    | Record<string, unknown>
                                    | undefined,
                            textData as Record<string, unknown>
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
                            suggestion = '\n    → Text must be 50 characters or less'
                        } else if (path === 'featured' && err.code === 'invalid_type') {
                            suggestion = '\n    → Must be boolean (true or false)'
                        }

                        return `  • ${path}: ${err.message}${actualValueStr}${suggestion}`
                    })

                    const textId =
                        typeof textData === 'object' && textData !== null && 'id' in textData
                            ? String(textData.id)
                            : `[index ${index}]`

                    errors.push({
                        textId,
                        errors: textErrors
                    })
                }
            })
        }

        if (errors.length > 0) {
            console.error(`Found errors in ${errors.length} text(s):\n`)
            errors.forEach(({ textId, errors: textErrors }) => {
                console.error(`❌ Text: "${textId}"`)
                textErrors.forEach((err) => console.error(err))
                console.error('')
            })
        } else {
            // General structure error
            console.error('❌ Invalid file structure')
            console.error('Expected: Array of animated hero texts\n')
            if (result.error?.errors) {
                result.error.errors.forEach((err) => {
                    console.error(`  • ${err.path.join('.') || '[root]'}: ${err.message}`)
                })
            }
            console.error('')
        }

        console.error('💡 Common Issues:')
        console.error('   - ID: Must not be empty')
        console.error('   - Text: Must not be empty and <= 50 characters')
        console.error('   - Featured: Must be boolean (true or false)')
        console.error('')
        console.error('📖 Full schema: src/schemas/animated-hero-text.schema.ts\n')
        process.exit(1)
    }

    console.log(`✅ All ${result.data.length} texts passed schema validation!\n`)

    // Check for duplicate IDs
    console.log('🔍 Checking for duplicate text IDs...\n')

    const idCounts = new Map<string, number>()
    result.data.forEach((text) => {
        idCounts.set(text.id, (idCounts.get(text.id) || 0) + 1)
    })

    const duplicates = Array.from(idCounts.entries()).filter(([, count]) => count > 1)

    if (duplicates.length > 0) {
        console.error(`❌ ${duplicates.length} duplicate text ID(s) found:\n`)
        duplicates.forEach(([id, count]) => {
            console.error(`  ID: "${id}" appears ${count} times`)
        })
        console.error('\n💡 Each text must have a unique ID\n')
        process.exit(1)
    }

    console.log('✅ All text IDs are unique!\n')

    // Display summary
    const featured = result.data.filter((t) => t.featured)
    const nonFeatured = result.data.filter((t) => !t.featured)

    console.log('📊 Summary:')
    console.log(`   Total texts: ${result.data.length}`)
    console.log(`   Featured texts: ${featured.length}`)
    console.log(`   Non-featured texts: ${nonFeatured.length}\n`)

    if (featured.length > 0) {
        console.log('   Featured Texts:')
        featured.forEach((text) => {
            console.log(`     • ${text.text}`)
        })
    }

    console.log('\n✅ All validations passed!\n')
    process.exit(0)
}

main()
