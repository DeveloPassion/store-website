#!/usr/bin/env bun
/**
 * Migration script: Convert showSeeHowItWorks/seeHowItWorksText to howItWorks/mediaSections
 *
 * Migration logic:
 * - showSeeHowItWorks: false → howItWorks: null
 * - showSeeHowItWorks: true, seeHowItWorksText: null → howItWorks: { title: null, description: null, mediaIds: [] }
 * - showSeeHowItWorks: true, seeHowItWorksText: { heading, subheading } → howItWorks: { title: heading, description: subheading, mediaIds: [] }
 * - mediaSections: null (added for all files - complete auto behavior)
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const PRODUCTS_DIR = 'src/data/products'

interface OldSalesCopyData {
    showSeeHowItWorks: boolean
    seeHowItWorksText: { heading: string; subheading: string } | null
    [key: string]: unknown
}

interface NewHowItWorks {
    title: string | null
    description: string | null
    mediaIds: string[]
}

interface OldSalesCopyFile {
    id: string
    salesCopy: OldSalesCopyData
}

function migrate() {
    const salesCopyFiles = readdirSync(PRODUCTS_DIR).filter((f) => f.includes('-sales-copy-'))

    console.log(`Found ${salesCopyFiles.length} sales copy files to migrate\n`)

    let migratedCount = 0
    let skippedCount = 0

    for (const file of salesCopyFiles) {
        const filePath = join(PRODUCTS_DIR, file)
        const content = JSON.parse(readFileSync(filePath, 'utf-8')) as OldSalesCopyFile

        const { showSeeHowItWorks, seeHowItWorksText, ...rest } = content.salesCopy

        // Check if already migrated (has howItWorks field)
        if ('howItWorks' in content.salesCopy) {
            console.log(`Skipped (already migrated): ${file}`)
            skippedCount++
            continue
        }

        // Convert showSeeHowItWorks/seeHowItWorksText to new howItWorks format
        let howItWorks: NewHowItWorks | null

        if (showSeeHowItWorks === false) {
            // Section hidden
            howItWorks = null
        } else {
            // Section shown - use custom text or defaults
            howItWorks = {
                title: seeHowItWorksText?.heading ?? null,
                description: seeHowItWorksText?.subheading ?? null,
                mediaIds: [] // Start empty, can be populated later
            }
        }

        // Build the updated content
        const updated = {
            ...content,
            salesCopy: {
                ...rest,
                howItWorks,
                mediaSections: null // Complete auto for all sections
            }
        }

        writeFileSync(filePath, JSON.stringify(updated, null, 4))
        console.log(`Migrated: ${file}`)
        migratedCount++
    }

    console.log(`\n${'='.repeat(50)}`)
    console.log(`Migration complete!`)
    console.log(`  Migrated: ${migratedCount} files`)
    console.log(`  Skipped:  ${skippedCount} files`)
    console.log(`${'='.repeat(50)}`)
    console.log('\nNext steps:')
    console.log('1. Run validation: bun run validate:sales-copy')
    console.log('2. Populate howItWorks.mediaIds for products that should show media')
    console.log('3. Configure mediaSections for products needing custom section behavior')
}

migrate()
