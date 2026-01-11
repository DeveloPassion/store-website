#!/usr/bin/env bun
/**
 * Validates the redirects.json file against the schema.
 * Gracefully handles missing file (redirects are optional).
 */

import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { RedirectsConfig } from '../src/types/redirect'
import { RedirectsConfigSchema } from '../src/schemas/redirect.schema'

const __dirname = dirname(fileURLToPath(import.meta.url))

function validateRedirects(): void {
    const redirectsPath = join(__dirname, '../src/data/redirects.json')

    // Check if file exists (it's optional)
    if (!existsSync(redirectsPath)) {
        console.log('ℹ No redirects.json found. Redirects are optional.')
        process.exit(0)
    }

    console.log('🔍 Validating redirects configuration...')

    try {
        // Read the file
        const fileContent = readFileSync(redirectsPath, 'utf-8')
        const parsedData = JSON.parse(fileContent)

        // Validate against schema
        const result = RedirectsConfigSchema.safeParse(parsedData)

        if (!result.success) {
            console.error('❌ Validation failed!')
            console.error('\nErrors:')
            result.error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`)
            })
            process.exit(1)
        }

        const redirects: RedirectsConfig = result.data

        console.log('✅ Redirects configuration is valid!')
        console.log(`\n📊 Redirects Summary:`)
        console.log(`   Total Redirects: ${redirects.length}`)

        if (redirects.length > 0) {
            console.log('\n   Configured Redirects:')
            for (const redirect of redirects) {
                const typeLabel = redirect.type === 'PERMANENT' ? '301' : '302'
                console.log(`     ${redirect.from} → ${redirect.to} (${typeLabel})`)
                if (redirect.description) {
                    console.log(`       ${redirect.description}`)
                }
            }
        }

        process.exit(0)
    } catch (error) {
        console.error('❌ Error reading or parsing redirects.json:')
        if (error instanceof Error) {
            console.error(`   ${error.message}`)
        } else {
            console.error(`   ${String(error)}`)
        }
        process.exit(1)
    }
}

validateRedirects()
