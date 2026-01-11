#!/usr/bin/env bun

/**
 * Interactive CLI tool to manage taglines
 *
 * This script provides an easy way to manage taglines with interactive prompts
 * or direct CLI arguments.
 *
 * Usage:
 *   Interactive mode:
 *     npm run update:taglines
 *     bun scripts/update-taglines.ts
 *
 *   CLI arguments mode:
 *     npm run update:taglines -- --operation list
 *     npm run update:taglines -- --operation add --id "new-1" --text "New Tagline" --category "default" --featured true
 *     npm run update:taglines -- --operation edit --id "action-1" --text "Updated Text"
 *     npm run update:taglines -- --operation remove --id "action-1"
 *     npm run update:taglines -- --operation toggle-featured --id "action-1"
 *
 * Arguments:
 *   --operation <list|add|edit|remove|toggle-featured>  Operation to perform (required)
 *   --id <string>                                        Tagline ID (required for add/edit/remove/toggle-featured)
 *   --text <string>                                      Tagline text (required for add, optional for edit)
 *   --category <string>                                  Category (required for add, optional for edit)
 *   --featured <boolean>                                 Featured status (optional for add/edit)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { select, input, confirm } from '@inquirer/prompts'
import { TaglinesArraySchema } from '../src/schemas/tagline.schema.js'
import type { Tagline, TaglineCategory } from '../src/types/tagline'
import {
    showBanner,
    showOperationHeader,
    showSuccess,
    showError,
    showGoodbye
} from './utils/cli-display.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TAGLINES_FILE = resolve(__dirname, '../src/data/taglines.json')

interface CliArgs {
    operation?: string
    id?: string
    text?: string
    category?: string
    featured?: string
}

const VALID_CATEGORIES: TaglineCategory[] = [
    'default',
    'problem-focused',
    'transformation-focused',
    'outcome-focused',
    'identity-focused',
    'action-focused'
]

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
                case 'operation':
                    args.operation = nextArg
                    break
                case 'id':
                    args.id = nextArg
                    break
                case 'text':
                    args.text = nextArg
                    break
                case 'category':
                    args.category = nextArg
                    break
                case 'featured':
                    args.featured = nextArg
                    break
            }
            i++ // Skip next arg since we consumed it
        }
    }

    return args
}

// Load taglines from file
function loadTaglines(): Tagline[] {
    try {
        const content = readFileSync(TAGLINES_FILE, 'utf-8')
        const data = JSON.parse(content)
        const result = TaglinesArraySchema.safeParse(data)

        if (!result.success) {
            showError('Invalid taglines.json format. Run validate:taglines for details.')
            process.exit(1)
        }

        return result.data
    } catch (error) {
        showError('Failed to read taglines.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Save taglines to file
function saveTaglines(taglines: Tagline[]): void {
    try {
        const result = TaglinesArraySchema.safeParse(taglines)

        if (!result.success) {
            showError('Validation failed before saving')
            console.error(result.error.errors)
            process.exit(1)
        }

        const content = JSON.stringify(result.data, null, 2) + '\n'
        writeFileSync(TAGLINES_FILE, content, 'utf-8')
    } catch (error) {
        showError('Failed to save taglines.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// List all taglines
function listTaglines(taglines: Tagline[]): void {
    showOperationHeader('List Taglines')

    const featured = taglines.filter((t) => t.featured)
    const nonFeatured = taglines.filter((t) => !t.featured)

    console.log(`\n📊 Total: ${taglines.length} taglines\n`)
    console.log(`✨ Featured: ${featured.length}`)
    console.log(`📝 Non-featured: ${nonFeatured.length}\n`)

    // Group by category
    const byCategory = taglines.reduce(
        (acc, tagline) => {
            if (!acc[tagline.category]) {
                acc[tagline.category] = []
            }
            acc[tagline.category].push(tagline)
            return acc
        },
        {} as Record<string, Tagline[]>
    )

    VALID_CATEGORIES.forEach((category) => {
        const categoryTaglines = byCategory[category] || []
        if (categoryTaglines.length > 0) {
            console.log(`\n📁 ${category} (${categoryTaglines.length}):`)
            categoryTaglines.forEach((t) => {
                const featuredBadge = t.featured ? ' ✨' : ''
                console.log(`   ${t.id}:${featuredBadge}`)
                console.log(`      "${t.text}"`)
            })
        }
    })

    console.log('')
}

// Add a new tagline
async function addTagline(taglines: Tagline[], args: CliArgs): Promise<void> {
    showOperationHeader('Add Tagline')

    try {
        // Get ID
        let id = args.id
        if (!id) {
            id = await input({
                message: 'Enter tagline ID (e.g., "custom-1"):',
                validate: (value) => {
                    if (!value) return 'ID is required'
                    if (taglines.some((t) => t.id === value)) {
                        return `Tagline with ID "${value}" already exists`
                    }
                    return true
                }
            })
        } else {
            // Check for duplicate ID
            if (taglines.some((t) => t.id === id)) {
                showError(`Tagline with ID "${id}" already exists`)
                process.exit(1)
            }
        }

        // Get text
        let text = args.text
        if (!text) {
            text = await input({
                message: 'Enter tagline text:',
                validate: (value) => (value ? true : 'Text is required')
            })
        }

        // Get category
        let category = args.category
        if (!category) {
            category = await select({
                message: 'Select category:',
                choices: VALID_CATEGORIES.map((cat) => ({
                    name: cat,
                    value: cat
                }))
            })
        }

        // Validate category
        if (!VALID_CATEGORIES.includes(category as TaglineCategory)) {
            showError(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`)
            process.exit(1)
        }

        // Get featured status
        let featured = false
        if (args.featured !== undefined) {
            featured = args.featured.toLowerCase() === 'true'
        } else {
            featured = await confirm({
                message: 'Featured?',
                default: false
            })
        }

        const newTagline: Tagline = {
            id,
            text,
            category: category as TaglineCategory,
            featured
        }

        taglines.push(newTagline)
        saveTaglines(taglines)

        showSuccess(`Added tagline "${id}"`)
        console.log(`\n  Text: "${text}"`)
        console.log(`  Category: ${category}`)
        console.log(`  Featured: ${featured}\n`)
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        throw error
    }
}

// Edit an existing tagline
async function editTagline(taglines: Tagline[], args: CliArgs): Promise<void> {
    showOperationHeader('Edit Tagline')

    try {
        // Get ID
        let id = args.id
        if (!id) {
            id = await input({
                message: 'Enter tagline ID to edit:',
                validate: (value) => {
                    if (!value) return 'ID is required'
                    if (!taglines.find((t) => t.id === value)) {
                        return `Tagline with ID "${value}" not found`
                    }
                    return true
                }
            })
        } else {
            const taglineIndex = taglines.findIndex((t) => t.id === id)
            if (taglineIndex === -1) {
                showError(`Tagline with ID "${id}" not found`)
                process.exit(1)
            }
        }

        const taglineIndex = taglines.findIndex((t) => t.id === id)
        const tagline = taglines[taglineIndex]

        console.log(`\n  Current values:`)
        console.log(`    Text: "${tagline.text}"`)
        console.log(`    Category: ${tagline.category}`)
        console.log(`    Featured: ${tagline.featured}\n`)

        // Get new text (optional)
        let text = args.text
        if (!text && !args.category && args.featured === undefined) {
            text = await input({
                message: 'New text (leave empty to keep current):',
                default: ''
            })
        }

        // Get new category (optional)
        let category = args.category
        if (!category && !args.text && args.featured === undefined) {
            const categoryChoice = await select({
                message: 'New category (or skip to keep current):',
                choices: [
                    { name: `Keep current (${tagline.category})`, value: '' },
                    ...VALID_CATEGORIES.map((cat) => ({
                        name: cat,
                        value: cat
                    }))
                ]
            })
            if (categoryChoice) {
                category = categoryChoice
            }
        }

        // Validate category if provided
        if (category && !VALID_CATEGORIES.includes(category as TaglineCategory)) {
            showError(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`)
            process.exit(1)
        }

        // Get new featured status (optional)
        let featured: boolean | undefined
        if (args.featured !== undefined) {
            featured = args.featured.toLowerCase() === 'true'
        } else if (!args.text && !args.category) {
            const featuredChoice = await select({
                message: 'Featured status:',
                choices: [
                    { name: `Keep current (${tagline.featured})`, value: 'keep' },
                    { name: 'Yes (featured)', value: 'true' },
                    { name: 'No (not featured)', value: 'false' }
                ]
            })
            if (featuredChoice === 'true') {
                featured = true
            } else if (featuredChoice === 'false') {
                featured = false
            }
        }

        // Update tagline
        if (text) tagline.text = text
        if (category) tagline.category = category as TaglineCategory
        if (featured !== undefined) tagline.featured = featured

        taglines[taglineIndex] = tagline
        saveTaglines(taglines)

        showSuccess(`Updated tagline "${id}"`)
        console.log(`\n  New values:`)
        console.log(`    Text: "${tagline.text}"`)
        console.log(`    Category: ${tagline.category}`)
        console.log(`    Featured: ${tagline.featured}\n`)
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        throw error
    }
}

// Remove a tagline
async function removeTagline(taglines: Tagline[], args: CliArgs): Promise<void> {
    showOperationHeader('Remove Tagline')

    try {
        // Get ID
        let id = args.id
        if (!id) {
            id = await input({
                message: 'Enter tagline ID to remove:',
                validate: (value) => {
                    if (!value) return 'ID is required'
                    if (!taglines.find((t) => t.id === value)) {
                        return `Tagline with ID "${value}" not found`
                    }
                    return true
                }
            })
        } else {
            const taglineIndex = taglines.findIndex((t) => t.id === id)
            if (taglineIndex === -1) {
                showError(`Tagline with ID "${id}" not found`)
                process.exit(1)
            }
        }

        const taglineIndex = taglines.findIndex((t) => t.id === id)
        const tagline = taglines[taglineIndex]

        console.log(`\n  Tagline to remove:`)
        console.log(`    ID: ${tagline.id}`)
        console.log(`    Text: "${tagline.text}"`)
        console.log(`    Category: ${tagline.category}`)
        console.log(`    Featured: ${tagline.featured}\n`)

        const confirmed = await confirm({
            message: 'Confirm removal?',
            default: false
        })

        if (!confirmed) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }

        taglines.splice(taglineIndex, 1)
        saveTaglines(taglines)

        showSuccess(`Removed tagline "${id}"\n`)
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        throw error
    }
}

// Toggle featured status
async function toggleFeatured(taglines: Tagline[], args: CliArgs): Promise<void> {
    showOperationHeader('Toggle Featured Status')

    try {
        // Get ID
        let id = args.id
        if (!id) {
            id = await input({
                message: 'Enter tagline ID:',
                validate: (value) => {
                    if (!value) return 'ID is required'
                    if (!taglines.find((t) => t.id === value)) {
                        return `Tagline with ID "${value}" not found`
                    }
                    return true
                }
            })
        } else {
            const taglineIndex = taglines.findIndex((t) => t.id === id)
            if (taglineIndex === -1) {
                showError(`Tagline with ID "${id}" not found`)
                process.exit(1)
            }
        }

        const taglineIndex = taglines.findIndex((t) => t.id === id)
        const tagline = taglines[taglineIndex]
        tagline.featured = !tagline.featured

        taglines[taglineIndex] = tagline
        saveTaglines(taglines)

        const status = tagline.featured ? 'featured' : 'non-featured'
        showSuccess(`Toggled tagline "${id}" to ${status}\n`)
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        throw error
    }
}

// Main function
async function main() {
    showBanner('Taglines Manager', 'Manage Homepage Taglines', '✨')

    const args = parseArgs()
    const taglines = loadTaglines()

    // If operation is provided via CLI args, execute directly
    if (args.operation) {
        switch (args.operation) {
            case 'list':
                listTaglines(taglines)
                break
            case 'add':
                await addTagline(taglines, args)
                break
            case 'edit':
                await editTagline(taglines, args)
                break
            case 'remove':
                await removeTagline(taglines, args)
                break
            case 'toggle-featured':
                await toggleFeatured(taglines, args)
                break
            default:
                showError(`Unknown operation: ${args.operation}`)
                console.log('\nValid operations: list, add, edit, remove, toggle-featured\n')
                process.exit(1)
        }
        return
    }

    // Interactive mode
    try {
        const operation = await select({
            message: 'What would you like to do?',
            choices: [
                {
                    name: '📋 List all taglines',
                    value: 'list',
                    description: 'View all taglines grouped by category'
                },
                {
                    name: '➕ Add a new tagline',
                    value: 'add',
                    description: 'Create a new tagline'
                },
                {
                    name: '✏️ Edit a tagline',
                    value: 'edit',
                    description: 'Update an existing tagline'
                },
                {
                    name: '🗑️ Remove a tagline',
                    value: 'remove',
                    description: 'Delete a tagline'
                },
                {
                    name: '⭐ Toggle featured status',
                    value: 'toggle-featured',
                    description: 'Toggle featured flag on a tagline'
                },
                {
                    name: '👋 Exit',
                    value: 'exit',
                    description: 'Exit the CLI'
                }
            ],
            pageSize: 10
        })

        switch (operation) {
            case 'list':
                listTaglines(taglines)
                break
            case 'add':
                await addTagline(taglines, {})
                break
            case 'edit':
                await editTagline(taglines, {})
                break
            case 'remove':
                await removeTagline(taglines, {})
                break
            case 'toggle-featured':
                await toggleFeatured(taglines, {})
                break
            case 'exit':
                showGoodbye()
                break
        }
    } catch (error) {
        showError('An error occurred')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

main()
