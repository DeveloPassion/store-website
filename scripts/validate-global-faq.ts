#!/usr/bin/env bun

/**
 * Validate global FAQ configuration against the Zod schema
 *
 * This script validates the faq-global.json file to ensure:
 * - Valid FAQ structure with required fields
 * - Valid icon names (if provided)
 * - Valid order values
 * - Valid style enum values
 * - Valid features, steps, bullets, and links arrays
 *
 * Usage:
 *   npm run validate:global-faq
 *   bun scripts/validate-global-faq.ts
 *
 * Exit codes:
 *   0 - Global FAQ config is valid
 *   1 - Validation errors found
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { GlobalFAQFileSchema, type GlobalFAQFile } from '../src/schemas/global-faq.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const GLOBAL_FAQ_FILE = resolve(__dirname, '../src/data/faq-global.json')

function main() {
    console.log('🔍 Validating global FAQ configuration...\n')
    console.log(`Reading: ${GLOBAL_FAQ_FILE}\n`)

    // Check if file exists
    if (!existsSync(GLOBAL_FAQ_FILE)) {
        console.error('❌ faq-global.json not found')
        console.error(`Expected location: ${GLOBAL_FAQ_FILE}`)
        console.error('💡 Tip: Create the file with the required structure\n')
        process.exit(1)
    }

    // Read and parse file
    let faqData: unknown
    try {
        const fileContent = readFileSync(GLOBAL_FAQ_FILE, 'utf-8')
        faqData = JSON.parse(fileContent)
    } catch (error) {
        console.error('❌ Failed to read or parse faq-global.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }

    // Validate against schema
    const result = GlobalFAQFileSchema.safeParse(faqData)

    if (result.success) {
        console.log('✅ Global FAQ configuration is valid!\n')
        displaySummary(result.data)
        process.exit(0)
    }

    // Validation failed
    console.error('❌ Validation failed!\n')

    if (result.error && result.error.errors) {
        console.error('Found the following errors:\n')
        result.error.errors.forEach((err) => {
            const path = err.path.join('.') || '[root]'
            console.error(`  • ${path}: ${err.message}`)
        })
    }

    console.error('\n💡 Tip: Check the schema definition at src/schemas/global-faq.schema.ts')
    console.error('💡 Tip: Ensure all required fields are present and correctly typed\n')

    process.exit(1)
}

function displaySummary(config: GlobalFAQFile) {
    const faqs = config.data
    console.log('📊 Global FAQ Summary:')
    console.log(`   Total FAQs: ${faqs.length}`)

    // Count FAQs by style
    const defaultStyle = faqs.filter((f) => f.style === 'default').length
    const highlightStyle = faqs.filter((f) => f.style === 'highlight').length
    console.log(`   Default style: ${defaultStyle}`)
    console.log(`   Highlight style: ${highlightStyle}`)

    // Count FAQs with various content types
    const withIcon = faqs.filter((f) => f.icon).length
    const withFeatures = faqs.filter((f) => f.features && f.features.length > 0).length
    const withSteps = faqs.filter((f) => f.steps && f.steps.length > 0).length
    const withBullets = faqs.filter((f) => f.bullets && f.bullets.length > 0).length
    const withLinks = faqs.filter((f) => f.links && f.links.length > 0).length

    console.log(`\n   Content breakdown:`)
    console.log(`     With icon: ${withIcon}`)
    console.log(`     With features: ${withFeatures}`)
    console.log(`     With steps: ${withSteps}`)
    console.log(`     With bullets: ${withBullets}`)
    console.log(`     With links: ${withLinks}`)

    // List all FAQs
    console.log(`\n   FAQ entries (sorted by order):`)
    const sortedFaqs = [...faqs].sort((a, b) => a.order - b.order)
    sortedFaqs.forEach((faq, index) => {
        const icon = faq.icon ? ` [${faq.icon}]` : ''
        const style = faq.style === 'highlight' ? ' (highlight)' : ''
        console.log(`     ${index + 1}. [${faq.id}]${icon}${style}`)
        console.log(
            `        Q: ${faq.question.substring(0, 60)}${faq.question.length > 60 ? '...' : ''}`
        )
    })

    console.log('')
}

main()
