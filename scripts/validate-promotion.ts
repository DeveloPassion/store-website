#!/usr/bin/env bun

/**
 * Validate promotion configuration against the Zod schema
 *
 * This script validates the promotion.json file to ensure:
 * - Valid banner behavior enum
 * - Required dates when in PROMOTIONS mode
 * - Valid ISO 8601 timestamps
 * - Valid URLs
 * - Logical date ordering
 *
 * Usage:
 *   npm run validate:promotion
 *   bun scripts/validate-promotion.ts
 *
 * Exit codes:
 *   0 - Promotion config is valid
 *   1 - Validation errors found
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PromotionConfigSchema } from '../src/schemas/promotion.schema.js'
import type { PromotionConfig } from '../src/types/promotion'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROMOTION_FILE = resolve(__dirname, '../src/data/promotion.json')

function main() {
    console.log('🔍 Validating promotion configuration...\n')
    console.log(`Reading: ${PROMOTION_FILE}\n`)

    // Check if file exists
    if (!existsSync(PROMOTION_FILE)) {
        console.error('❌ promotion.json not found')
        console.error(`Expected location: ${PROMOTION_FILE}`)
        console.error('💡 Tip: Create the file with required fields\n')
        process.exit(1)
    }

    // Read and parse file
    let promotionData: unknown
    try {
        const fileContent = readFileSync(PROMOTION_FILE, 'utf-8')
        promotionData = JSON.parse(fileContent)
    } catch (error) {
        console.error('❌ Failed to read or parse promotion.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }

    // Validate against schema
    const result = PromotionConfigSchema.safeParse(promotionData)

    if (result.success) {
        console.log('✅ Promotion configuration is valid!\n')
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

    console.error('\n💡 Tip: Check the schema definition at src/schemas/promotion.schema.ts')
    console.error('💡 Tip: Ensure all required fields are present and correctly typed\n')

    process.exit(1)
}

function displaySummary(config: PromotionConfig) {
    console.log('📊 Promotion Summary:')
    console.log(`   Banner Behavior: ${config.bannerBehavior}`)
    console.log(`   Promo Text: "${config.promoText}"`)
    console.log(`   Link: ${config.promoLink}`)

    if (config.promoLinkText) {
        console.log(`   Link Text: "${config.promoLinkText}"`)
    }

    if (config.discountCode) {
        console.log(`   Discount Code: ${config.discountCode}`)
    }

    if (config.promotionStart && config.promotionEnd) {
        console.log(`\n   Promotion Period:`)
        console.log(`     Start: ${config.promotionStart}`)
        console.log(`     End: ${config.promotionEnd}`)

        const now = new Date()
        const start = new Date(config.promotionStart)
        const end = new Date(config.promotionEnd)

        if (now < start) {
            console.log(`     Status: ⏳ Not yet started`)
        } else if (now > end) {
            console.log(`     Status: ⏹️  Ended`)
        } else {
            console.log(`     Status: ✅ Active`)
        }
    }

    console.log('')
}

main()
