#!/usr/bin/env bun

/**
 * Data File Format Migration Script
 *
 * Migrates FAQ, Testimonial, and Media JSON files from invalid root-level arrays
 * to proper JSON objects with a "data" property wrapper.
 *
 * Old format (INVALID):
 *   [{ "id": "faq-1", ... }]
 *
 * New format (VALID):
 *   { "data": [{ "id": "faq-1", ... }] }
 *
 * Usage:
 *   bun run scripts/migrate-data-files.ts [--dry-run] [--type=faq|testimonials|media|all]
 *
 * Options:
 *   --dry-run          Preview changes without modifying files
 *   --type=<type>      Migrate specific file type (default: all)
 *
 * Examples:
 *   bun run scripts/migrate-data-files.ts --dry-run
 *   bun run scripts/migrate-data-files.ts --type=faq
 *   bun run scripts/migrate-data-files.ts --type=all
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { FAQsArraySchema, FAQFileSchema, type FAQsArray } from '../src/schemas/faq.schema.js'
import {
    TestimonialsArraySchema,
    TestimonialFileSchema,
    type TestimonialsArray
} from '../src/schemas/testimonial.schema.js'
import { MediaArraySchema, MediaFileSchema, type MediaItem } from '../src/schemas/media.schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')

// Parse CLI arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const typeArg = args.find((arg) => arg.startsWith('--type='))
const fileType = typeArg ? typeArg.split('=')[1] : 'all'

interface MigrationStats {
    total: number
    migrated: number
    alreadyMigrated: number
    errors: number
}

interface MigrationResult {
    filePath: string
    status: 'migrated' | 'already-migrated' | 'error'
    error?: string
}

/**
 * Check if a file is already in the new format
 */
function isNewFormat(data: unknown): boolean {
    return (
        typeof data === 'object' &&
        data !== null &&
        'data' in data &&
        Array.isArray((data as { data: unknown }).data)
    )
}

/**
 * Migrate a single FAQ file
 */
function migrateFaqFile(filePath: string, dryRun: boolean): MigrationResult {
    try {
        const content = readFileSync(filePath, 'utf-8')
        const data = JSON.parse(content)

        // Check if already migrated
        if (isNewFormat(data)) {
            return { filePath, status: 'already-migrated' }
        }

        // Validate old format (should be array)
        const arrayResult = FAQsArraySchema.safeParse(data)
        if (!arrayResult.success) {
            return {
                filePath,
                status: 'error',
                error: `Invalid array format: ${arrayResult.error.message}`
            }
        }

        // Create new format
        const newData = { data: arrayResult.data }

        // Validate new format
        const fileResult = FAQFileSchema.safeParse(newData)
        if (!fileResult.success) {
            return {
                filePath,
                status: 'error',
                error: `New format validation failed: ${fileResult.error.message}`
            }
        }

        // Write to file if not dry run
        if (!dryRun) {
            const json = JSON.stringify(newData, null, 4)
            writeFileSync(filePath, json + '\n', 'utf-8')
        }

        return { filePath, status: 'migrated' }
    } catch (error) {
        return {
            filePath,
            status: 'error',
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

/**
 * Migrate a single Testimonial file
 */
function migrateTestimonialFile(filePath: string, dryRun: boolean): MigrationResult {
    try {
        const content = readFileSync(filePath, 'utf-8')
        const data = JSON.parse(content)

        // Check if already migrated
        if (isNewFormat(data)) {
            return { filePath, status: 'already-migrated' }
        }

        // Validate old format (should be array)
        const arrayResult = TestimonialsArraySchema.safeParse(data)
        if (!arrayResult.success) {
            return {
                filePath,
                status: 'error',
                error: `Invalid array format: ${arrayResult.error.message}`
            }
        }

        // Create new format
        const newData = { data: arrayResult.data }

        // Validate new format
        const fileResult = TestimonialFileSchema.safeParse(newData)
        if (!fileResult.success) {
            return {
                filePath,
                status: 'error',
                error: `New format validation failed: ${fileResult.error.message}`
            }
        }

        // Write to file if not dry run
        if (!dryRun) {
            const json = JSON.stringify(newData, null, 4)
            writeFileSync(filePath, json + '\n', 'utf-8')
        }

        return { filePath, status: 'migrated' }
    } catch (error) {
        return {
            filePath,
            status: 'error',
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

/**
 * Migrate a single Media file
 */
function migrateMediaFile(filePath: string, dryRun: boolean): MigrationResult {
    try {
        const content = readFileSync(filePath, 'utf-8')
        const data = JSON.parse(content)

        // Check if already migrated
        if (isNewFormat(data)) {
            return { filePath, status: 'already-migrated' }
        }

        // Validate old format (should be array)
        const arrayResult = MediaArraySchema.safeParse(data)
        if (!arrayResult.success) {
            return {
                filePath,
                status: 'error',
                error: `Invalid array format: ${arrayResult.error.message}`
            }
        }

        // Create new format
        const newData = { data: arrayResult.data }

        // Validate new format
        const fileResult = MediaFileSchema.safeParse(newData)
        if (!fileResult.success) {
            return {
                filePath,
                status: 'error',
                error: `New format validation failed: ${fileResult.error.message}`
            }
        }

        // Write to file if not dry run
        if (!dryRun) {
            const json = JSON.stringify(newData, null, 4)
            writeFileSync(filePath, json + '\n', 'utf-8')
        }

        return { filePath, status: 'migrated' }
    } catch (error) {
        return {
            filePath,
            status: 'error',
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

/**
 * Migrate all files of a specific type
 */
function migrateFiles(
    pattern: RegExp,
    migrateFunc: (filePath: string, dryRun: boolean) => MigrationResult,
    dryRun: boolean
): { results: MigrationResult[]; stats: MigrationStats } {
    const stats: MigrationStats = {
        total: 0,
        migrated: 0,
        alreadyMigrated: 0,
        errors: 0
    }
    const results: MigrationResult[] = []

    if (!existsSync(PRODUCTS_DIR)) {
        console.error('❌ Products directory does not exist:', PRODUCTS_DIR)
        return { results, stats }
    }

    const files = readdirSync(PRODUCTS_DIR).filter((file) => pattern.test(file))

    stats.total = files.length

    for (const file of files) {
        const filePath = join(PRODUCTS_DIR, file)
        const result = migrateFunc(filePath, dryRun)
        results.push(result)

        if (result.status === 'migrated') {
            stats.migrated++
        } else if (result.status === 'already-migrated') {
            stats.alreadyMigrated++
        } else if (result.status === 'error') {
            stats.errors++
        }
    }

    return { results, stats }
}

/**
 * Main migration function
 */
function main() {
    console.log('🔄 Data File Format Migration\n')
    console.log(`Directory: ${PRODUCTS_DIR}`)
    console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'LIVE MIGRATION'}`)
    console.log(`Type: ${fileType}\n`)

    const allResults: MigrationResult[] = []
    const allStats: Record<string, MigrationStats> = {}

    // Migrate FAQs
    if (fileType === 'all' || fileType === 'faq') {
        console.log('📝 Migrating FAQ files...')
        const { results, stats } = migrateFiles(/-faq\.json$/, migrateFaqFile, isDryRun)
        allResults.push(...results)
        allStats['FAQ'] = stats
        console.log(
            `   Total: ${stats.total}, Migrated: ${stats.migrated}, Already migrated: ${stats.alreadyMigrated}, Errors: ${stats.errors}\n`
        )
    }

    // Migrate Testimonials
    if (fileType === 'all' || fileType === 'testimonials') {
        console.log('💬 Migrating Testimonial files...')
        const { results, stats } = migrateFiles(
            /-testimonials\.json$/,
            migrateTestimonialFile,
            isDryRun
        )
        allResults.push(...results)
        allStats['Testimonials'] = stats
        console.log(
            `   Total: ${stats.total}, Migrated: ${stats.migrated}, Already migrated: ${stats.alreadyMigrated}, Errors: ${stats.errors}\n`
        )
    }

    // Migrate Media
    if (fileType === 'all' || fileType === 'media') {
        console.log('🖼️  Migrating Media files...')
        const { results, stats } = migrateFiles(/-media\.json$/, migrateMediaFile, isDryRun)
        allResults.push(...results)
        allStats['Media'] = stats
        console.log(
            `   Total: ${stats.total}, Migrated: ${stats.migrated}, Already migrated: ${stats.alreadyMigrated}, Errors: ${stats.errors}\n`
        )
    }

    // Print summary
    console.log('📊 Migration Summary')
    console.log('='.repeat(60))

    for (const [type, stats] of Object.entries(allStats)) {
        console.log(`\n${type}:`)
        console.log(`   Total files: ${stats.total}`)
        console.log(`   ✅ Migrated: ${stats.migrated}`)
        console.log(`   ⏭️  Already migrated: ${stats.alreadyMigrated}`)
        console.log(`   ❌ Errors: ${stats.errors}`)
    }

    // Print errors if any
    const errors = allResults.filter((r) => r.status === 'error')
    if (errors.length > 0) {
        console.log('\n❌ Errors encountered:')
        for (const error of errors) {
            console.log(`   ${error.filePath}`)
            console.log(`      ${error.error}`)
        }
    }

    // Print dry run reminder
    if (isDryRun) {
        console.log('\n💡 This was a dry run. No files were modified.')
        console.log('   Run without --dry-run to apply changes.\n')
    } else {
        console.log('\n✅ Migration complete!\n')
    }

    // Exit with error code if there were errors
    const totalErrors = Object.values(allStats).reduce((sum, s) => sum + s.errors, 0)
    process.exit(totalErrors > 0 ? 1 : 0)
}

// Run the migration
main()
