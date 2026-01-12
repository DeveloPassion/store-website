#!/usr/bin/env bun

/**
 * Interactive CLI tool to manage animated hero texts
 *
 * This script provides an easy way to manage animated hero texts with interactive prompts
 * or direct CLI arguments.
 *
 * Usage:
 *   Interactive mode:
 *     npm run update:animated-hero-texts
 *     bun scripts/update-animated-hero-texts.ts
 *
 *   CLI arguments mode:
 *     npm run update:animated-hero-texts -- --operation list
 *     npm run update:animated-hero-texts -- --operation add --id "new-1" --text "New Text" --featured true
 *     npm run update:animated-hero-texts -- --operation edit --id "knowledge-system" --text "Updated Text"
 *     npm run update:animated-hero-texts -- --operation remove --id "old-1"
 *     npm run update:animated-hero-texts -- --operation toggle-featured --id "creation-system"
 *
 * Arguments:
 *   --operation <list|add|edit|remove|toggle-featured>  Operation to perform (required)
 *   --id <string>                                        Text ID (required for add/edit/remove/toggle-featured)
 *   --text <string>                                      Display text (required for add, optional for edit)
 *   --featured <boolean>                                 Featured status (optional for add/edit)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { select, input, confirm } from '@inquirer/prompts'
import { AnimatedHeroTextsArraySchema } from '../src/schemas/animated-hero-text.schema.js'
import type { AnimatedHeroText } from '../src/types/animated-hero-text'
import {
    showBanner,
    showOperationHeader,
    showSuccess,
    showError,
    showGoodbye
} from './utils/cli-display.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_FILE = resolve(__dirname, '../src/data/animated-hero-texts.json')

interface CliArgs {
    operation?: string
    id?: string
    text?: string
    featured?: string
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
                case 'operation':
                    args.operation = nextArg
                    break
                case 'id':
                    args.id = nextArg
                    break
                case 'text':
                    args.text = nextArg
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

// Load texts from file
function loadTexts(): AnimatedHeroText[] {
    try {
        const content = readFileSync(DATA_FILE, 'utf-8')
        const data = JSON.parse(content)
        const result = AnimatedHeroTextsArraySchema.safeParse(data)

        if (!result.success) {
            showError(
                'Invalid animated-hero-texts.json format. Run validate:animated-hero-texts for details.'
            )
            process.exit(1)
        }

        return result.data
    } catch (error) {
        showError('Failed to read animated-hero-texts.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Save texts to file
function saveTexts(texts: AnimatedHeroText[]): void {
    try {
        const result = AnimatedHeroTextsArraySchema.safeParse(texts)

        if (!result.success) {
            showError('Validation failed before saving')
            console.error(result.error.errors)
            process.exit(1)
        }

        const content = JSON.stringify(result.data, null, 4) + '\n'
        writeFileSync(DATA_FILE, content, 'utf-8')
    } catch (error) {
        showError('Failed to save animated-hero-texts.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// List all texts
function listTexts(texts: AnimatedHeroText[]): void {
    showOperationHeader('List Animated Hero Texts')

    const featured = texts.filter((t) => t.featured)
    const nonFeatured = texts.filter((t) => !t.featured)

    console.log(`\n📊 Total: ${texts.length} texts\n`)
    console.log(`✨ Featured: ${featured.length}`)
    console.log(`📝 Non-featured: ${nonFeatured.length}\n`)

    if (featured.length > 0) {
        console.log(`\n✨ Featured Texts:`)
        featured.forEach((t) => {
            console.log(`   ${t.id}:`)
            console.log(`      "${t.text}"`)
        })
    }

    if (nonFeatured.length > 0) {
        console.log(`\n📝 Non-featured Texts:`)
        nonFeatured.forEach((t) => {
            console.log(`   ${t.id}:`)
            console.log(`      "${t.text}"`)
        })
    }

    console.log('')
}

// Add a new text
async function addText(texts: AnimatedHeroText[], args: CliArgs): Promise<void> {
    showOperationHeader('Add Animated Hero Text')

    try {
        // Get ID
        let id = args.id
        if (!id) {
            id = await input({
                message: 'Enter text ID (e.g., "custom-1"):',
                validate: (value) => {
                    if (!value) return 'ID is required'
                    if (texts.some((t) => t.id === value)) {
                        return `Text with ID "${value}" already exists`
                    }
                    return true
                }
            })
        } else {
            // Check for duplicate ID
            if (texts.some((t) => t.id === id)) {
                showError(`Text with ID "${id}" already exists`)
                process.exit(1)
            }
        }

        // Get text
        let text = args.text
        if (!text) {
            text = await input({
                message: 'Enter display text:',
                validate: (value) => (value ? true : 'Text is required')
            })
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

        const newText: AnimatedHeroText = {
            id,
            text,
            featured
        }

        texts.push(newText)
        saveTexts(texts)

        showSuccess(`Added text "${id}"`)
        console.log(`\n  Text: "${text}"`)
        console.log(`  Featured: ${featured}\n`)
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        throw error
    }
}

// Edit an existing text
async function editText(texts: AnimatedHeroText[], args: CliArgs): Promise<void> {
    showOperationHeader('Edit Animated Hero Text')

    try {
        // Get ID
        let id = args.id
        if (!id) {
            id = await input({
                message: 'Enter text ID to edit:',
                validate: (value) => {
                    if (!value) return 'ID is required'
                    if (!texts.find((t) => t.id === value)) {
                        return `Text with ID "${value}" not found`
                    }
                    return true
                }
            })
        } else {
            const textIndex = texts.findIndex((t) => t.id === id)
            if (textIndex === -1) {
                showError(`Text with ID "${id}" not found`)
                process.exit(1)
            }
        }

        const textIndex = texts.findIndex((t) => t.id === id)
        const textItem = texts[textIndex]

        console.log(`\n  Current values:`)
        console.log(`    Text: "${textItem.text}"`)
        console.log(`    Featured: ${textItem.featured}\n`)

        // Get new text (optional)
        let text = args.text
        if (!text && args.featured === undefined) {
            text = await input({
                message: 'Enter new text (or press Enter to keep current):',
                default: textItem.text
            })
        }

        // Get featured status (optional)
        let featured = textItem.featured
        if (args.featured !== undefined) {
            featured = args.featured.toLowerCase() === 'true'
        } else if (!text || text === textItem.text) {
            featured = await confirm({
                message: 'Featured?',
                default: textItem.featured
            })
        }

        // Update fields
        if (text && text !== textItem.text) textItem.text = text
        if (featured !== textItem.featured) textItem.featured = featured

        texts[textIndex] = textItem
        saveTexts(texts)

        showSuccess(`Updated text "${id}"`)
        console.log(`\n  Text: "${textItem.text}"`)
        console.log(`  Featured: ${textItem.featured}\n`)
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        throw error
    }
}

// Remove a text
async function removeText(texts: AnimatedHeroText[], args: CliArgs): Promise<void> {
    showOperationHeader('Remove Animated Hero Text')

    try {
        // Get ID
        let id = args.id
        if (!id) {
            id = await input({
                message: 'Enter text ID to remove:',
                validate: (value) => {
                    if (!value) return 'ID is required'
                    if (!texts.find((t) => t.id === value)) {
                        return `Text with ID "${value}" not found`
                    }
                    return true
                }
            })
        } else {
            const textIndex = texts.findIndex((t) => t.id === id)
            if (textIndex === -1) {
                showError(`Text with ID "${id}" not found`)
                process.exit(1)
            }
        }

        const textIndex = texts.findIndex((t) => t.id === id)
        const textItem = texts[textIndex]

        console.log(`\n  Text to remove:`)
        console.log(`    ID: ${textItem.id}`)
        console.log(`    Text: "${textItem.text}"`)
        console.log(`    Featured: ${textItem.featured}\n`)

        const confirmed = await confirm({
            message: 'Are you sure you want to remove this text?',
            default: false
        })

        if (!confirmed) {
            console.log('\n  ❌ Cancelled\n')
            return
        }

        texts.splice(textIndex, 1)
        saveTexts(texts)

        showSuccess(`Removed text "${id}"`)
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        throw error
    }
}

// Toggle featured status
async function toggleFeatured(texts: AnimatedHeroText[], args: CliArgs): Promise<void> {
    showOperationHeader('Toggle Featured Status')

    try {
        // Get ID
        let id = args.id
        if (!id) {
            id = await input({
                message: 'Enter text ID:',
                validate: (value) => {
                    if (!value) return 'ID is required'
                    if (!texts.find((t) => t.id === value)) {
                        return `Text with ID "${value}" not found`
                    }
                    return true
                }
            })
        } else {
            const textIndex = texts.findIndex((t) => t.id === id)
            if (textIndex === -1) {
                showError(`Text with ID "${id}" not found`)
                process.exit(1)
            }
        }

        const textIndex = texts.findIndex((t) => t.id === id)
        const textItem = texts[textIndex]

        textItem.featured = !textItem.featured
        texts[textIndex] = textItem
        saveTexts(texts)

        showSuccess(`Toggled featured status for "${id}" to ${textItem.featured}`)
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n  ❌ Cancelled\n')
            process.exit(0)
        }
        throw error
    }
}

// Main CLI flow
async function main() {
    const args = parseArgs()
    const texts = loadTexts()

    // CLI mode - handle operation from arguments
    if (args.operation) {
        switch (args.operation) {
            case 'list':
                listTexts(texts)
                break
            case 'add':
                await addText(texts, args)
                break
            case 'edit':
                await editText(texts, args)
                break
            case 'remove':
                await removeText(texts, args)
                break
            case 'toggle-featured':
                await toggleFeatured(texts, args)
                break
            default:
                showError(`Invalid operation: ${args.operation}`)
                console.log('\nValid operations: list, add, edit, remove, toggle-featured\n')
                process.exit(1)
        }
        return
    }

    // Interactive mode - show banner and prompt for operation
    showBanner('Animated Hero Texts Manager', 'Manage animated hero text variations', '🎨')

    try {
        const operation = await select({
            message: 'What would you like to do?',
            choices: [
                { name: 'List all texts', value: 'list' },
                { name: 'Add new text', value: 'add' },
                { name: 'Edit existing text', value: 'edit' },
                { name: 'Remove text', value: 'remove' },
                { name: 'Toggle featured status', value: 'toggle-featured' },
                { name: 'Exit', value: 'exit' }
            ]
        })

        switch (operation) {
            case 'list':
                listTexts(texts)
                break
            case 'add':
                await addText(texts, {})
                break
            case 'edit':
                await editText(texts, {})
                break
            case 'remove':
                await removeText(texts, {})
                break
            case 'toggle-featured':
                await toggleFeatured(texts, {})
                break
            case 'exit':
                showGoodbye()
                return
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            showGoodbye()
            return
        }
        throw error
    }
}

main().catch((error) => {
    showError('An unexpected error occurred')
    console.error(error)
    process.exit(1)
})
