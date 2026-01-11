#!/usr/bin/env bun
/**
 * Interactive CLI for managing redirects.
 * Supports list, add, and remove operations with arrow-key navigation.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { parseArgs } from 'util'
import { select, input, confirm } from '@inquirer/prompts'
import type { RedirectEntry, RedirectsConfig, RedirectType } from '../src/types/redirect'
import { RedirectsConfigSchema } from '../src/schemas/redirect.schema'
import {
    showBanner,
    showOperationHeader,
    showSuccess,
    showError,
    showGoodbye
} from './utils/cli-display.js'

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
            showError('Invalid redirects.json')
            result.error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`)
            })
            process.exit(1)
        }

        return result.data
    } catch (error) {
        showError('Error loading redirects')
        console.error(error instanceof Error ? error.message : String(error))
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
        showError('Validation failed')
        result.error.errors.forEach((err) => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`)
        })
        process.exit(1)
    }

    try {
        writeFileSync(REDIRECTS_PATH, JSON.stringify(redirects, null, 4) + '\n')
        showSuccess('Redirects saved successfully')
    } catch (error) {
        showError('Error saving redirects')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

/**
 * List all redirects
 */
function listRedirects(): void {
    showOperationHeader('List Redirects')

    const redirects = loadRedirects()

    if (redirects.length === 0) {
        console.log('\n  ℹ No redirects configured.\n')
        return
    }

    console.log(`\n📋 Total: ${redirects.length} redirect(s)\n`)
    for (const redirect of redirects) {
        const typeLabel = redirect.type === 'PERMANENT' ? '301' : '302'
        const typeBadge = redirect.type === 'PERMANENT' ? '🔒' : '🔄'
        console.log(`  ${typeBadge} ${redirect.from} → ${redirect.to} (${typeLabel})`)
        if (redirect.description) {
            console.log(`     Description: ${redirect.description}`)
        }
        console.log(`     Include in sitemap: ${redirect.includeInSitemap ? 'Yes' : 'No'}`)
        console.log()
    }
}

/**
 * Add a new redirect
 */
async function addRedirect(): Promise<void> {
    showOperationHeader('Add Redirect')

    try {
        const redirects = loadRedirects()

        // Get source path
        const from = await input({
            message: 'Source path (must start with /):',
            validate: (value) => {
                if (!value) return 'Source path is required'
                if (!value.startsWith('/')) return 'Source path must start with /'
                if (redirects.some((r) => r.from === value)) {
                    return 'A redirect from this path already exists'
                }
                return true
            }
        })

        // Get destination
        const to = await input({
            message: 'Destination URL or path:',
            validate: (value) => (value ? true : 'Destination is required')
        })

        // Get redirect type
        const type = await select<RedirectType>({
            message: 'Redirect type:',
            choices: [
                {
                    name: '🔄 TEMPORARY (302) - Default, more flexible',
                    value: 'TEMPORARY',
                    description: 'Use for temporary redirects, can be changed easily'
                },
                {
                    name: '🔒 PERMANENT (301) - For moved content',
                    value: 'PERMANENT',
                    description: 'Use for permanently moved content, better for SEO'
                }
            ],
            default: 'TEMPORARY'
        })

        // Get description
        const description = await input({
            message: 'Description (optional):',
            default: ''
        })

        // Get sitemap inclusion
        const includeInSitemap = await confirm({
            message: 'Include in sitemap?',
            default: false
        })

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

        showSuccess(`Added redirect: ${from} → ${to} (${type === 'PERMANENT' ? '301' : '302'})`)
        console.log()
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        throw error
    }
}

/**
 * Remove a redirect
 */
async function removeRedirect(): Promise<void> {
    showOperationHeader('Remove Redirect')

    const redirects = loadRedirects()

    if (redirects.length === 0) {
        console.log('\n  ℹ No redirects to remove.\n')
        return
    }

    try {
        // Select redirect to remove
        const from = await select({
            message: 'Select redirect to remove:',
            choices: redirects.map((r) => ({
                name: `${r.from} → ${r.to} (${r.type === 'PERMANENT' ? '301' : '302'})`,
                value: r.from,
                description: r.description || undefined
            }))
        })

        const redirect = redirects.find((r) => r.from === from)
        if (!redirect) {
            showError('Redirect not found')
            process.exit(1)
        }

        // Show details and confirm
        console.log(`\n  Redirect to remove:`)
        console.log(`    From: ${redirect.from}`)
        console.log(`    To: ${redirect.to}`)
        console.log(`    Type: ${redirect.type} (${redirect.type === 'PERMANENT' ? '301' : '302'})`)
        if (redirect.description) {
            console.log(`    Description: ${redirect.description}`)
        }
        console.log()

        const confirmed = await confirm({
            message: 'Confirm removal?',
            default: false
        })

        if (!confirmed) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }

        const index = redirects.findIndex((r) => r.from === from)
        const removed = redirects.splice(index, 1)[0]
        saveRedirects(redirects)

        showSuccess(`Removed redirect: ${removed.from} → ${removed.to}`)
        console.log()
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        throw error
    }
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
                showError('Invalid operation. Use: list, add, or remove')
                process.exit(1)
        }
        return
    }

    // Interactive mode
    showBanner('Redirects Manager', 'Manage Client-Side Redirects', '🔄')

    try {
        const choice = await select({
            message: 'What would you like to do?',
            choices: [
                {
                    name: '📋 List all redirects',
                    value: 'list',
                    description: 'View all configured redirects'
                },
                {
                    name: '➕ Add a new redirect',
                    value: 'add',
                    description: 'Create a new redirect'
                },
                {
                    name: '🗑️ Remove a redirect',
                    value: 'remove',
                    description: 'Delete an existing redirect'
                },
                {
                    name: '👋 Exit',
                    value: 'exit',
                    description: 'Exit the CLI'
                }
            ],
            pageSize: 10
        })

        switch (choice) {
            case 'list':
                listRedirects()
                break
            case 'add':
                await addRedirect()
                break
            case 'remove':
                await removeRedirect()
                break
            case 'exit':
                showGoodbye()
                break
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        showError('An error occurred')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

main()
