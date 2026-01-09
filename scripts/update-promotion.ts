#!/usr/bin/env tsx

/**
 * Interactive CLI tool to update promotion configuration
 *
 * This script provides an easy way to update the promotion banner configuration
 * with interactive prompts or direct CLI arguments.
 *
 * Usage:
 *   Interactive mode:
 *     npm run update:promotion
 *     tsx scripts/update-promotion.ts
 *
 *   CLI arguments mode:
 *     npm run update:promotion -- --behavior PROMOTIONS --text "Sale!" --link "https://..." --start "2026-02-01" --duration 30
 *     npm run update:promotion -- --behavior NEVER
 *
 * Arguments:
 *   --behavior <ALWAYS|NEVER|PROMOTIONS>  Banner behavior mode (required)
 *   --text <string>                       Promotion text (required)
 *   --link <url>                          Promotion link URL (required)
 *   --linkText <string>                   Link text (optional)
 *   --code <string>                       Discount code (optional)
 *   --start <date>                        Start date for PROMOTIONS (YYYY-MM-DD or ISO 8601)
 *   --duration <number>                   Duration in days (calculates end date)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'
import { addDays, parseISO, formatISO, isValid, parse } from 'date-fns'
import { PromotionConfigSchema } from '../src/schemas/promotion.schema.js'
import type { PromotionConfig, BannerBehavior } from '../src/types/promotion'
import {
    showBanner,
    showOperationHeader,
    showSuccess,
    showError,
    showGoodbye
} from './utils/cli-display.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROMOTION_FILE = resolve(__dirname, '../src/data/promotion.json')

interface CliArgs {
    behavior?: string
    text?: string
    link?: string
    linkText?: string
    code?: string
    start?: string
    duration?: string
}

// Parse CLI arguments
function parseArgs(): CliArgs {
    const args: CliArgs = {}
    const processArgs = process.argv.slice(2)

    for (let i = 0; i < processArgs.length; i++) {
        const arg = processArgs[i]
        const nextArg = processArgs[i + 1]

        if (arg.startsWith('--') && nextArg && !nextArg.startsWith('--')) {
            const key = arg.slice(2)
            switch (key) {
                case 'behavior':
                    args.behavior = nextArg
                    break
                case 'text':
                    args.text = nextArg
                    break
                case 'link':
                    args.link = nextArg
                    break
                case 'linkText':
                    args.linkText = nextArg
                    break
                case 'code':
                    args.code = nextArg
                    break
                case 'start':
                    args.start = nextArg
                    break
                case 'duration':
                    args.duration = nextArg
                    break
            }
            i++ // Skip next arg since we consumed it
        }
    }

    return args
}

// Create readline interface for interactive prompts
function createReadlineInterface() {
    return createInterface({
        input: process.stdin,
        output: process.stdout
    })
}

// Prompt user for input
function prompt(rl: ReturnType<typeof createReadlineInterface>, question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim())
        })
    })
}

// Parse date string (supports YYYY-MM-DD or ISO 8601)
function parseDate(dateStr: string): Date | null {
    // Try ISO 8601 first
    let date = parseISO(dateStr)
    if (isValid(date)) {
        return date
    }

    // Try YYYY-MM-DD format
    date = parse(dateStr, 'yyyy-MM-dd', new Date())
    if (isValid(date)) {
        return date
    }

    return null
}

// Format date to ISO 8601 with UTC timezone
function formatDateUTC(date: Date): string {
    return formatISO(date, { representation: 'complete' }).replace(/[+-]\d{2}:\d{2}$/, 'Z')
}

// Load current configuration
function loadCurrentConfig(): PromotionConfig | null {
    if (!existsSync(PROMOTION_FILE)) {
        return null
    }

    try {
        const content = readFileSync(PROMOTION_FILE, 'utf-8')
        return JSON.parse(content)
    } catch {
        console.error('⚠️  Could not parse existing promotion.json')
        return null
    }
}

// Interactive mode
async function interactiveMode() {
    const rl = createReadlineInterface()
    const currentConfig = loadCurrentConfig()

    console.log('\n🎨 Interactive Promotion Configuration Update\n')

    if (currentConfig) {
        console.log('Current configuration:')
        console.log(`  Behavior: ${currentConfig.bannerBehavior}`)
        console.log(`  Text: ${currentConfig.promoText}`)
        console.log(`  Link: ${currentConfig.promoLink}`)
        if (currentConfig.promoLinkText) {
            console.log(`  Link Text: ${currentConfig.promoLinkText}`)
        }
        if (currentConfig.discountCode) {
            console.log(`  Discount Code: ${currentConfig.discountCode}`)
        }
        if (currentConfig.promotionStart && currentConfig.promotionEnd) {
            console.log(`  Start: ${currentConfig.promotionStart}`)
            console.log(`  End: ${currentConfig.promotionEnd}`)
        }
        console.log('')
    }

    // Banner behavior
    const behavior =
        (await prompt(
            rl,
            'Banner behavior (ALWAYS/NEVER/PROMOTIONS) [current: ' +
                (currentConfig?.bannerBehavior || 'PROMOTIONS') +
                ']: '
        )) ||
        currentConfig?.bannerBehavior ||
        'PROMOTIONS'

    if (!['ALWAYS', 'NEVER', 'PROMOTIONS'].includes(behavior.toUpperCase())) {
        console.error('❌ Invalid behavior. Must be ALWAYS, NEVER, or PROMOTIONS')
        rl.close()
        process.exit(1)
    }

    const bannerBehavior = behavior.toUpperCase() as BannerBehavior

    // Promotion text
    const promoTextInput = await prompt(
        rl,
        'Promotion text [current: ' + (currentConfig?.promoText || 'required') + ']: '
    )
    const promoText = promoTextInput || currentConfig?.promoText || ''

    if (!promoText) {
        console.error('❌ Promotion text is required')
        rl.close()
        process.exit(1)
    }

    // Promotion link
    const promoLinkInput = await prompt(
        rl,
        'Promotion link URL [current: ' + (currentConfig?.promoLink || 'required') + ']: '
    )
    const promoLink = promoLinkInput || currentConfig?.promoLink || ''

    if (!promoLink) {
        console.error('❌ Promotion link is required')
        rl.close()
        process.exit(1)
    }

    // Optional fields
    const promoLinkTextInput = await prompt(
        rl,
        'Link text (optional) [current: ' + (currentConfig?.promoLinkText || 'none') + ']: '
    )
    const promoLinkText = promoLinkTextInput || currentConfig?.promoLinkText || undefined

    const discountCodeInput = await prompt(
        rl,
        'Discount code (optional) [current: ' + (currentConfig?.discountCode || 'none') + ']: '
    )
    const discountCode = discountCodeInput || currentConfig?.discountCode || undefined

    // Dates for PROMOTIONS mode
    let promotionStart: string | undefined
    let promotionEnd: string | undefined

    if (bannerBehavior === 'PROMOTIONS') {
        console.log('\n📅 Promotion timing (required for PROMOTIONS mode)\n')

        const startDateInput = await prompt(
            rl,
            'Start date (YYYY-MM-DD or ISO 8601) [current: ' +
                (currentConfig?.promotionStart || 'required') +
                ']: '
        )
        const startDateStr = startDateInput || currentConfig?.promotionStart || ''

        if (!startDateStr) {
            console.error('❌ Start date is required for PROMOTIONS mode')
            rl.close()
            process.exit(1)
        }

        const startDate = parseDate(startDateStr)
        if (!startDate) {
            console.error('❌ Invalid start date format. Use YYYY-MM-DD or ISO 8601')
            rl.close()
            process.exit(1)
        }

        const durationInput = await prompt(rl, 'Duration in days [default: 30]: ')
        const duration = parseInt(durationInput) || 30

        if (isNaN(duration) || duration <= 0) {
            console.error('❌ Duration must be a positive number')
            rl.close()
            process.exit(1)
        }

        // Calculate end date
        const endDate = addDays(startDate, duration)

        // Set times to start of day (00:00:00) for start and end of day (23:59:59) for end
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)

        promotionStart = formatDateUTC(startDate)
        promotionEnd = formatDateUTC(endDate)

        console.log(`\n✅ Calculated promotion period:`)
        console.log(`   Start: ${promotionStart}`)
        console.log(`   End: ${promotionEnd}`)
        console.log(`   Duration: ${duration} days\n`)
    }

    rl.close()

    // Build configuration object
    const config: PromotionConfig = {
        bannerBehavior,
        promoText,
        promoLink,
        ...(promoLinkText && { promoLinkText }),
        ...(discountCode && { discountCode }),
        ...(promotionStart && { promotionStart }),
        ...(promotionEnd && { promotionEnd })
    }

    return config
}

// CLI arguments mode
function cliMode(args: CliArgs): PromotionConfig | null {
    if (!args.behavior || !args.text || !args.link) {
        console.error('❌ CLI mode requires --behavior, --text, and --link arguments')
        console.error('   Run without arguments for interactive mode')
        return null
    }

    const behavior = args.behavior.toUpperCase()
    if (!['ALWAYS', 'NEVER', 'PROMOTIONS'].includes(behavior)) {
        console.error('❌ Invalid behavior. Must be ALWAYS, NEVER, or PROMOTIONS')
        return null
    }

    const bannerBehavior = behavior as BannerBehavior

    // Handle PROMOTIONS mode dates
    let promotionStart: string | undefined
    let promotionEnd: string | undefined

    if (bannerBehavior === 'PROMOTIONS') {
        if (!args.start || !args.duration) {
            console.error('❌ PROMOTIONS mode requires --start and --duration arguments')
            return null
        }

        const startDate = parseDate(args.start)
        if (!startDate) {
            console.error('❌ Invalid start date format. Use YYYY-MM-DD or ISO 8601')
            return null
        }

        const duration = parseInt(args.duration)
        if (isNaN(duration) || duration <= 0) {
            console.error('❌ Duration must be a positive number')
            return null
        }

        // Calculate end date
        const endDate = addDays(startDate, duration)

        // Set times
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)

        promotionStart = formatDateUTC(startDate)
        promotionEnd = formatDateUTC(endDate)

        console.log(`\n✅ Calculated promotion period:`)
        console.log(`   Start: ${promotionStart}`)
        console.log(`   End: ${promotionEnd}`)
        console.log(`   Duration: ${duration} days\n`)
    }

    const config: PromotionConfig = {
        bannerBehavior,
        promoText: args.text,
        promoLink: args.link,
        ...(args.linkText && { promoLinkText: args.linkText }),
        ...(args.code && { discountCode: args.code }),
        ...(promotionStart && { promotionStart }),
        ...(promotionEnd && { promotionEnd })
    }

    return config
}

// Save and validate configuration
function saveAndValidate(config: PromotionConfig) {
    console.log('\n🔍 Validating configuration...\n')

    // Validate against schema
    const result = PromotionConfigSchema.safeParse(config)

    if (!result.success) {
        console.error('❌ Validation failed!\n')
        result.error.errors.forEach((err) => {
            const path = err.path.join('.') || '[root]'
            console.error(`  • ${path}: ${err.message}`)
        })
        console.error('\n💡 Tip: Check the schema definition at src/schemas/promotion.schema.ts')
        return false
    }

    console.log('✅ Configuration is valid!\n')

    // Write to file
    try {
        const jsonContent = JSON.stringify(config, null, 2)
        writeFileSync(PROMOTION_FILE, jsonContent, 'utf-8')
        console.log(`✅ Promotion configuration saved to: ${PROMOTION_FILE}\n`)

        // Display summary
        console.log('📊 Updated Configuration:')
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
        return true
    } catch (error) {
        console.error('❌ Failed to write promotion.json')
        console.error(error instanceof Error ? error.message : String(error))
        return false
    }
}

// Main function
async function main() {
    const args = parseArgs()
    const hasCliArgs = Object.keys(args).length > 0

    let config: PromotionConfig | null = null

    try {
        if (hasCliArgs) {
            // CLI mode
            showOperationHeader('Promotion Configuration', 'CLI mode')
            config = cliMode(args)
        } else {
            // Interactive mode
            showBanner('Promotion Configuration', 'Configure promotion banner settings', '🎉')
            config = await interactiveMode()
        }

        if (!config) {
            showError('Configuration failed')
            process.exit(1)
        }

        const success = saveAndValidate(config)

        if (success) {
            showSuccess('Promotion configuration updated successfully')
        } else {
            showError('Configuration validation failed')
        }

        process.exit(success ? 0 : 1)
    } catch (error) {
        // Handle Ctrl+C gracefully
        if (error && typeof error === 'object' && 'name' in error) {
            if (error.name === 'ExitPromptError') {
                showGoodbye('Promotion Configuration CLI')
                process.exit(0)
            }
        }
        showError(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

main()
