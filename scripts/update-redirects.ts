#!/usr/bin/env bun
/**
 * Interactive CLI for managing redirects.
 * Supports list, add, and remove operations.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { parseArgs } from 'util'
import type { RedirectEntry, RedirectsConfig, RedirectType } from '../src/types/redirect'
import { RedirectsConfigSchema } from '../src/schemas/redirect.schema'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REDIRECTS_PATH = join(__dirname, '../src/data/redirects.json')

/**
 * Load redirects from file
 */
function loadRedirects(): RedirectsConfig {
    if (!existsSync(REDIRECTS_PATH)) {
        return []
    }

    try {
        const content = readFileSync(REDIRECTS_PATH, 'utf-8')
        const parsed = JSON.parse(content)
        const result = RedirectsConfigSchema.safeParse(parsed)

        if (!result.success) {
            console.error('❌ Invalid redirects.json:')
            result.error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`)
            })
            process.exit(1)
        }

        return result.data
    } catch (error) {
        console.error('❌ Error loading redirects:', error)
        process.exit(1)
    }
}

/**
 * Save redirects to file
 */
function saveRedirects(redirects: RedirectsConfig): void {
    // Validate before saving
    const result = RedirectsConfigSchema.safeParse(redirects)

    if (!result.success) {
        console.error('❌ Validation failed:')
        result.error.errors.forEach((err) => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`)
        })
        process.exit(1)
    }

    try {
        writeFileSync(REDIRECTS_PATH, JSON.stringify(redirects, null, 4) + '\n')
        console.log('✅ Redirects saved successfully!')
    } catch (error) {
        console.error('❌ Error saving redirects:', error)
        process.exit(1)
    }
}

/**
 * List all redirects
 */
function listRedirects(): void {
    const redirects = loadRedirects()

    if (redirects.length === 0) {
        console.log('ℹ No redirects configured.')
        return
    }

    console.log(`📋 Configured Redirects (${redirects.length} total):\n`)
    for (const redirect of redirects) {
        const typeLabel = redirect.type === 'PERMANENT' ? '301' : '302'
        console.log(`  ${redirect.from} → ${redirect.to} (${typeLabel})`)
        if (redirect.description) {
            console.log(`    Description: ${redirect.description}`)
        }
        console.log(`    Include in sitemap: ${redirect.includeInSitemap ? 'Yes' : 'No'}`)
        console.log()
    }
}

/**
 * Prompt for user input
 */
async function prompt(message: string): Promise<string> {
    process.stdout.write(message)
    const buffer = new Uint8Array(1024)
    const bytesRead = await Bun.stdin.read(buffer)
    if (bytesRead === null) {
        return ''
    }
    return Buffer.from(buffer.subarray(0, bytesRead)).toString().trim()
}

/**
 * Add a new redirect
 */
async function addRedirect(): Promise<void> {
    console.log('➕ Add New Redirect\n')

    const redirects = loadRedirects()

    // Get source path
    const from = await prompt('Source path (must start with /): ')
    if (!from.startsWith('/')) {
        console.error('❌ Source path must start with /')
        process.exit(1)
    }

    // Check for duplicates
    if (redirects.some((r) => r.from === from)) {
        console.error('❌ A redirect from this path already exists')
        process.exit(1)
    }

    // Get destination
    const to = await prompt('Destination URL or path: ')
    if (!to) {
        console.error('❌ Destination is required')
        process.exit(1)
    }

    // Get redirect type
    const typeInput = await prompt('Redirect type (PERMANENT/TEMPORARY, default: TEMPORARY): ')
    const type: RedirectType = typeInput.toUpperCase() === 'PERMANENT' ? 'PERMANENT' : 'TEMPORARY'

    // Get description
    const description = await prompt('Description (optional): ')

    // Get sitemap inclusion
    const sitemapInput = await prompt('Include in sitemap? (y/N): ')
    const includeInSitemap = sitemapInput.toLowerCase() === 'y'

    // Create new redirect
    const newRedirect: RedirectEntry = {
        from,
        to,
        type,
        ...(description && { description }),
        includeInSitemap
    }

    // Add and save
    redirects.push(newRedirect)
    saveRedirects(redirects)

    console.log(`\n✅ Added redirect: ${from} → ${to} (${type === 'PERMANENT' ? '301' : '302'})`)
}

/**
 * Remove a redirect
 */
async function removeRedirect(): Promise<void> {
    console.log('➖ Remove Redirect\n')

    const redirects = loadRedirects()

    if (redirects.length === 0) {
        console.log('ℹ No redirects to remove.')
        return
    }

    // List current redirects
    console.log('Current redirects:')
    redirects.forEach((r, index) => {
        console.log(`  ${index + 1}. ${r.from} → ${r.to}`)
    })
    console.log()

    // Get source path to remove
    const from = await prompt('Source path to remove: ')

    const index = redirects.findIndex((r) => r.from === from)
    if (index === -1) {
        console.error('❌ Redirect not found')
        process.exit(1)
    }

    const removed = redirects.splice(index, 1)[0]
    saveRedirects(redirects)

    console.log(`\n✅ Removed redirect: ${removed.from} → ${removed.to}`)
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
    const { values } = parseArgs({
        args: Bun.argv.slice(2),
        options: {
            operation: {
                type: 'string',
                short: 'o'
            }
        },
        strict: false,
        allowPositionals: true
    })

    const operation = values.operation

    // CLI mode
    if (operation) {
        switch (operation.toLowerCase()) {
            case 'list':
                listRedirects()
                break
            case 'add':
                await addRedirect()
                break
            case 'remove':
                await removeRedirect()
                break
            default:
                console.error('❌ Invalid operation. Use: list, add, or remove')
                process.exit(1)
        }
        return
    }

    // Interactive mode
    console.log('🔄 Redirects Management CLI\n')
    console.log('Available operations:')
    console.log('  1. List redirects')
    console.log('  2. Add redirect')
    console.log('  3. Remove redirect')
    console.log()

    const choice = await prompt('Choose an operation (1-3): ')

    switch (choice) {
        case '1':
            listRedirects()
            break
        case '2':
            await addRedirect()
            break
        case '3':
            await removeRedirect()
            break
        default:
            console.error('❌ Invalid choice')
            process.exit(1)
    }
}

main()
