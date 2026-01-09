#!/usr/bin/env tsx

/**
 * Interactive CLI tool to update tags configuration
 *
 * This script provides an easy way to manage tags (add/modify/remove)
 * with interactive prompts or direct CLI arguments.
 *
 * Usage:
 *   Interactive mode:
 *     npm run update:tags
 *     tsx scripts/update-tags.ts
 *
 *   CLI arguments mode:
 *     npm run update:tags -- --operation list [--featured] [--format json|table]
 *     npm run update:tags -- --operation add --name "Tag Name" --description "..." [--id custom-id] [--icon FaIcon] [--color #FF6B6B] [--featured true] [--priority 50]
 *     npm run update:tags -- --operation modify --id "tag-id" [--name "..."] [--description "..."] [--icon "..."] [--color "..."] [--featured true|false] [--priority 50]
 *     npm run update:tags -- --operation remove --id "tag-id" [--force]
 *     npm run update:tags -- --operation remove-unused [--force]
 *     npm run update:tags -- --operation manage-featured
 *
 * Arguments:
 *   --operation <list|add|modify|remove|remove-unused|manage-featured>  Operation to perform (required for CLI mode)
 *   --id <string>                         Tag ID (required for modify/remove, optional for add)
 *   --name <string>                       Tag name (required for add, optional for modify)
 *   --description <string>                Tag description (required for add, optional for modify)
 *   --icon <string>                       React icon name (optional)
 *   --color <string>                      Hex color (#RRGGBB) (optional)
 *   --featured <true|false>               Featured status (optional)
 *   --priority <number>                   Priority (1-8 featured, 21+ non-featured) (optional)
 *   --force                               Force removal even if tag is used (optional, for remove only)
 *   --featured                            Filter featured only (optional, for list only)
 *   --format <json|table>                 Output format (optional, for list only, default: table)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'
import { select, input } from '@inquirer/prompts'
import { TagSchema } from '../src/schemas/tag.schema.js'
import type { TagsMap, Tag, TagId } from '../src/types/tag'
import type { Product } from '../src/types/product'
import {
    showBanner,
    showError,
    showInfo,
    showGoodbye,
    showOperationHeader,
    showSuccess,
    showWarning,
    colors
} from './utils/cli-display.js'
import {
    FeaturedItem,
    RenumberConfig,
    calculateFeaturedStats,
    autoRenumberPriorities,
    moveItemUp,
    moveItemDown,
    validateFeaturedOperation,
    displayFeaturedSummary,
    displayReorderList,
    showRenumberComparison
} from './utils/featured-manager.js'
import inquirer from 'inquirer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TAGS_FILE = resolve(__dirname, '../src/data/tags.json')
const PRODUCTS_FILE = resolve(__dirname, '../src/data/products.json')

// Configuration for featured management
const TAGS_FEATURED_CONFIG: RenumberConfig = {
    featuredStart: 1,
    featuredEnd: 8,
    nonFeaturedStart: 21
}

interface CliArgs {
    operation?: 'list' | 'add' | 'modify' | 'remove' | 'remove-unused' | 'manage-featured'
    id?: string
    name?: string
    description?: string
    icon?: string
    color?: string
    featured?: string // 'true' | 'false'
    priority?: string // parsed to number
    force?: boolean
    featured_filter?: boolean // for list --featured
    format?: 'json' | 'table' // for list output
}

interface ProductReference {
    productId: string
    productName: string
}

// Parse CLI arguments
function parseArgs(): CliArgs {
    const args: CliArgs = {}
    const processArgs = process.argv.slice(2)

    for (let i = 0; i < processArgs.length; i++) {
        const arg = processArgs[i]
        const nextArg = processArgs[i + 1]

        if (arg === '--force') {
            args.force = true
            continue
        }

        if (arg === '--featured' && (!nextArg || nextArg.startsWith('--'))) {
            args.featured_filter = true
            continue
        }

        if (arg.startsWith('--') && nextArg && !nextArg.startsWith('--')) {
            const key = arg.slice(2)
            switch (key) {
                case 'operation':
                    args.operation = nextArg as
                        | 'list'
                        | 'add'
                        | 'modify'
                        | 'remove'
                        | 'remove-unused'
                    break
                case 'id':
                    args.id = nextArg
                    break
                case 'name':
                    args.name = nextArg
                    break
                case 'description':
                    args.description = nextArg
                    break
                case 'icon':
                    args.icon = nextArg
                    break
                case 'color':
                    args.color = nextArg
                    break
                case 'featured':
                    args.featured = nextArg
                    break
                case 'priority':
                    args.priority = nextArg
                    break
                case 'format':
                    args.format = nextArg as 'json' | 'table'
                    break
            }
            i++ // Skip next arg since we consumed it
        }
    }

    return args
}

// Generate kebab-case ID from name
function generateIdFromName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
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

// Load tags from JSON file
function loadTags(): TagsMap {
    if (!existsSync(TAGS_FILE)) {
        console.error(`❌ Tags file not found: ${TAGS_FILE}`)
        process.exit(1)
    }

    try {
        const content = readFileSync(TAGS_FILE, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        console.error('❌ Failed to parse tags.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Save tags to JSON file
function saveTags(tags: TagsMap): void {
    try {
        const jsonContent = JSON.stringify(tags, null, 2)
        writeFileSync(TAGS_FILE, jsonContent, 'utf-8')
    } catch (error) {
        console.error('❌ Failed to write tags.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Data adapter: Load tags as FeaturedItem array
function loadFeaturedData(): FeaturedItem[] {
    const tags = loadTags()
    return Object.values(tags).map((tag) => ({
        id: tag.id,
        name: tag.name,
        featured: tag.featured,
        priority: tag.priority
    }))
}

// Data adapter: Save featured changes back to tags
function saveFeaturedChanges(items: FeaturedItem[]): void {
    const tags = loadTags()

    // Update featured and priority for each item
    items.forEach((item) => {
        if (tags[item.id as TagId]) {
            tags[item.id as TagId].featured = item.featured
            tags[item.id as TagId].priority = item.priority
        }
    })

    saveTags(tags)
}

// Check if tag is used in products
function checkTagUsage(tagId: string): ProductReference[] {
    if (!existsSync(PRODUCTS_FILE)) {
        console.warn('⚠️  Products file not found, skipping usage check')
        return []
    }

    try {
        const content = readFileSync(PRODUCTS_FILE, 'utf-8')
        const products = JSON.parse(content)

        return products
            .filter((p: Product) => p.tags && p.tags.includes(tagId))
            .map((p: Product) => ({
                productId: p.id,
                productName: p.name
            }))
    } catch {
        console.warn('⚠️  Could not check product usage')
        return []
    }
}

// Validate tag data
function validateTag(tag: Tag): { success: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate using Zod schema
    const result = TagSchema.safeParse(tag)
    if (!result.success) {
        result.error.errors.forEach((err) => {
            const path = err.path.join('.') || 'tag'
            errors.push(`${path}: ${err.message}`)
        })
    }

    return {
        success: errors.length === 0,
        errors
    }
}

// List operation
async function operationList(options: {
    featuredFilter?: boolean
    format?: 'json' | 'table'
}): Promise<void> {
    const tags = loadTags()
    const tagEntries = Object.entries(tags)

    let filtered = tagEntries
    if (options.featuredFilter) {
        filtered = tagEntries.filter(([, tag]) => tag.featured)
    }

    // Sort by priority
    filtered.sort(([, a], [, b]) => a.priority - b.priority)

    if (options.format === 'json') {
        console.log(JSON.stringify(Object.fromEntries(filtered), null, 2))
        return
    }

    // Table format (default)
    console.log('\n📋 Tags List\n')
    console.log(
        `${'ID'.padEnd(30)} ${'Name'.padEnd(25)} ${'Featured'.padEnd(10)} ${'Priority'.padEnd(10)}`
    )
    console.log('-'.repeat(80))

    filtered.forEach(([id, tag]) => {
        const featuredStr = tag.featured ? '✓ Yes' : 'No'
        console.log(
            `${id.padEnd(30)} ${tag.name.padEnd(25)} ${featuredStr.padEnd(10)} ${String(tag.priority).padEnd(10)}`
        )
    })

    console.log(`\nTotal: ${filtered.length} tag(s)`)
    if (options.featuredFilter) {
        console.log(`(Showing featured tags only)`)
    }
    console.log('')
}

// Add operation
async function operationAdd(
    args: CliArgs,
    rl?: ReturnType<typeof createReadlineInterface>
): Promise<void> {
    const tags = loadTags()

    console.log('\n🔖 Tag Management Tool - Add Operation\n')

    // Get tag name
    let name = args.name
    if (!name && rl) {
        name = await prompt(rl, 'Tag name (required): ')
    }

    if (!name) {
        console.error('❌ Tag name is required')
        process.exit(1)
    }

    // Generate suggested ID
    const suggestedId = generateIdFromName(name)

    // Get tag ID
    let id = args.id
    if (!id && rl) {
        console.log(`Suggested ID: ${suggestedId}`)
        const idInput = await prompt(rl, `Tag ID (press Enter for suggested) [${suggestedId}]: `)
        id = idInput || suggestedId
    } else if (!id) {
        id = suggestedId
    }

    // Check if ID already exists
    if (tags[id as TagId]) {
        console.error(`❌ Tag with ID '${id}' already exists`)
        console.error('   Choose a different ID or modify the existing tag')
        process.exit(1)
    }

    // Get description
    let description = args.description
    if (!description && rl) {
        description = await prompt(rl, 'Description (required): ')
    }

    if (!description) {
        console.error('❌ Description is required')
        process.exit(1)
    }

    // Get optional fields
    let icon = args.icon
    if (icon === undefined && rl) {
        icon = await prompt(rl, 'Icon (optional, e.g., FaTag, FaRobot): ')
    }

    let color = args.color
    if (color === undefined && rl) {
        color = await prompt(rl, 'Color (optional, hex format #RRGGBB): ')
    }

    let featured = args.featured === 'true'
    if (args.featured === undefined && rl) {
        const featuredInput = await prompt(rl, 'Featured (true/false) [false]: ')
        featured = featuredInput.toLowerCase() === 'true'
    }

    let priority = args.priority ? parseInt(args.priority) : undefined
    if (priority === undefined && rl) {
        const defaultPriority = featured ? 1 : 50
        const priorityInput = await prompt(
            rl,
            `Priority (1-8 for featured, 21+ for non-featured) [${defaultPriority}]: `
        )
        priority = priorityInput ? parseInt(priorityInput) : defaultPriority
    }

    if (priority === undefined) {
        priority = featured ? 1 : 50
    }

    // Build tag object
    const tag: Tag = {
        id: id as TagId,
        name,
        description,
        featured,
        priority,
        ...(icon && { icon }),
        ...(color && { color })
    }

    // Validate tag
    console.log('\n🔍 Validating tag...')
    const validation = validateTag(tag)

    if (!validation.success) {
        console.error('\n❌ Validation failed!\n')
        validation.errors.forEach((err) => console.error(`  • ${err}`))
        console.error('\n💡 Tip: Check the schema at src/schemas/tag.schema.ts')
        process.exit(1)
    }

    console.log('✅ Tag is valid!\n')

    // Display tag summary
    console.log('📊 New Tag:')
    console.log(`   ID: ${tag.id}`)
    console.log(`   Name: ${tag.name}`)
    console.log(`   Description: ${tag.description}`)
    if (tag.icon) console.log(`   Icon: ${tag.icon}`)
    if (tag.color) console.log(`   Color: ${tag.color}`)
    console.log(`   Featured: ${tag.featured}`)
    console.log(`   Priority: ${tag.priority}`)
    console.log('')

    // Confirm save
    if (rl) {
        const confirm = await prompt(rl, 'Confirm and save? [yes/no]: ')
        if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
            console.log('❌ Operation cancelled')
            process.exit(0)
        }
    }

    // Add tag to collection
    tags[tag.id] = tag
    saveTags(tags)

    console.log('✅ Tag added successfully to tags.json!\n')
    console.log('⚠️  IMPORTANT: Update the schema enum at src/schemas/tag.schema.ts')
    console.log(`   Add "${tag.id}" to the TagIdSchema enum array.`)
    console.log('   Then run: npm run validate:tags\n')
}

// Modify operation
async function operationModify(
    args: CliArgs,
    rl?: ReturnType<typeof createReadlineInterface>
): Promise<void> {
    const tags = loadTags()

    console.log('\n✏️  Tag Management Tool - Modify Operation\n')

    // Get tag ID
    let id = args.id
    if (!id && rl) {
        // Use select menu to choose tag
        const tagEntries = Object.entries(tags)
        const sortedTags = tagEntries.sort(([, a], [, b]) => {
            // Sort by featured first, then by name
            if (a.featured !== b.featured) {
                return a.featured ? -1 : 1
            }
            return a.name.localeCompare(b.name)
        })

        id = await select({
            message: 'Select tag to modify:',
            choices: sortedTags.map(([tagId, tag]) => ({
                name: `${tag.name} ${tag.featured ? '⭐' : ''} (${tagId})`,
                value: tagId,
                description: tag.description
            })),
            pageSize: 15
        })
    }

    if (!id) {
        console.error('❌ Tag ID is required for modify operation')
        process.exit(1)
    }

    // Check if tag exists
    const existingTag = tags[id as TagId]
    if (!existingTag) {
        console.error(`❌ Tag with ID '${id}' not found`)
        process.exit(1)
    }

    console.log('Current tag:')
    console.log(`  Name: ${existingTag.name}`)
    console.log(`  Description: ${existingTag.description}`)
    console.log(`  Icon: ${existingTag.icon || 'none'}`)
    console.log(`  Color: ${existingTag.color || 'none'}`)
    console.log(`  Featured: ${existingTag.featured}`)
    console.log(`  Priority: ${existingTag.priority}`)
    console.log('')

    // Collect updates
    const updates: Partial<Tag> = {}

    if (args.name !== undefined) {
        updates.name = args.name
    } else if (rl) {
        const nameInput = await input({
            message: 'Name (press Enter to keep current):',
            default: existingTag.name
        })
        if (nameInput && nameInput !== existingTag.name) updates.name = nameInput
    }

    if (args.description !== undefined) {
        updates.description = args.description
    } else if (rl) {
        const descInput = await input({
            message: 'Description (press Enter to keep current):',
            default: existingTag.description
        })
        if (descInput && descInput !== existingTag.description) updates.description = descInput
    }

    if (args.icon !== undefined) {
        updates.icon = args.icon
    } else if (rl) {
        const iconInput = await input({
            message: 'Icon (press Enter to keep current):',
            default: existingTag.icon || ''
        })
        if (iconInput && iconInput !== (existingTag.icon || '')) updates.icon = iconInput
    }

    if (args.color !== undefined) {
        updates.color = args.color
    } else if (rl) {
        const colorInput = await input({
            message: 'Color (press Enter to keep current):',
            default: existingTag.color || ''
        })
        if (colorInput && colorInput !== (existingTag.color || '')) updates.color = colorInput
    }

    if (args.featured !== undefined) {
        updates.featured = args.featured === 'true'
    } else if (rl) {
        const featuredInput = await select({
            message: 'Featured:',
            choices: [
                { name: `Keep current (${existingTag.featured ? 'Yes' : 'No'})`, value: 'keep' },
                { name: 'Yes', value: 'true' },
                { name: 'No', value: 'false' }
            ],
            default: 'keep'
        })
        if (featuredInput === 'true') updates.featured = true
        else if (featuredInput === 'false') updates.featured = false
    }

    if (args.priority !== undefined) {
        updates.priority = parseInt(args.priority)
    } else if (rl) {
        const priorityInput = await input({
            message: 'Priority (press Enter to keep current):',
            default: String(existingTag.priority)
        })
        if (priorityInput && priorityInput !== String(existingTag.priority))
            updates.priority = parseInt(priorityInput)
    }

    // Check if any updates provided
    if (Object.keys(updates).length === 0) {
        console.log('⚠️  No changes provided, tag unchanged')
        process.exit(0)
    }

    // Merge updates
    const updatedTag: Tag = { ...existingTag, ...updates }

    // Validate updated tag
    console.log('\n🔍 Validating updated tag...')
    const validation = validateTag(updatedTag)

    if (!validation.success) {
        console.error('\n❌ Validation failed!\n')
        validation.errors.forEach((err) => console.error(`  • ${err}`))
        process.exit(1)
    }

    console.log('✅ Updated tag is valid!\n')

    // Show changes
    console.log('📊 Changes:')
    Object.keys(updates).forEach((key) => {
        const oldVal = (existingTag as Record<string, unknown>)[key]
        const newVal = (updatedTag as Record<string, unknown>)[key]
        console.log(`   ${key}: ${oldVal} → ${newVal}`)
    })
    console.log('')

    // Confirm save
    if (rl) {
        const confirm = await select({
            message: 'Confirm and save changes?',
            choices: [
                { name: 'Yes, save changes', value: 'yes' },
                { name: 'No, cancel', value: 'no' }
            ]
        })
        if (confirm === 'no') {
            console.log('❌ Operation cancelled')
            process.exit(0)
        }
    }

    // Update tag
    tags[id as TagId] = updatedTag
    saveTags(tags)

    console.log('✅ Tag updated successfully!\n')
}

// Remove operation
async function operationRemove(
    args: CliArgs,
    rl?: ReturnType<typeof createReadlineInterface>
): Promise<void> {
    const tags = loadTags()

    console.log('\n🗑️  Tag Management Tool - Remove Operation\n')

    // Get tag ID
    let id = args.id
    if (!id && rl) {
        // Use select menu to choose tag
        const tagEntries = Object.entries(tags)
        const sortedTags = tagEntries.sort(([, a], [, b]) => {
            // Sort by featured first, then by name
            if (a.featured !== b.featured) {
                return a.featured ? -1 : 1
            }
            return a.name.localeCompare(b.name)
        })

        id = await select({
            message: 'Select tag to remove:',
            choices: sortedTags.map(([tagId, tag]) => ({
                name: `${tag.name} ${tag.featured ? '⭐' : ''} (${tagId})`,
                value: tagId,
                description: tag.description
            })),
            pageSize: 15
        })
    }

    if (!id) {
        console.error('❌ Tag ID is required for remove operation')
        process.exit(1)
    }

    // Check if tag exists
    const tag = tags[id as TagId]
    if (!tag) {
        console.error(`❌ Tag with ID '${id}' not found`)
        process.exit(1)
    }

    console.log('Tag to remove:')
    console.log(`  ID: ${tag.id}`)
    console.log(`  Name: ${tag.name}`)
    console.log(`  Description: ${tag.description}`)
    console.log('')

    // Check product usage
    console.log('⚠️  Checking product usage...\n')
    const usage = checkTagUsage(id)

    if (usage.length > 0) {
        console.log(`Found usage in ${usage.length} product(s):`)
        usage.forEach((ref) => {
            console.log(`  • ${ref.productId} (${ref.productName})`)
        })
        console.log('')

        if (!args.force) {
            console.error('❌ Cannot remove tag that is in use')
            console.error('   Remove tag from products first, or use --force flag')
            process.exit(1)
        }

        console.log('⚠️  --force flag provided, proceeding with removal')
        console.log('   WARNING: This will break product references!\n')
    } else {
        console.log('✅ Tag is not used in any products\n')
    }

    // Confirm removal
    if (rl) {
        const confirm = await select({
            message: 'Confirm removal?',
            choices: [
                { name: 'Yes, remove tag', value: 'yes' },
                { name: 'No, cancel', value: 'no' }
            ]
        })
        if (confirm === 'no') {
            console.log('❌ Operation cancelled')
            process.exit(0)
        }
    }

    // Remove tag
    delete tags[id as TagId]
    saveTags(tags)

    console.log('✅ Tag removed successfully!\n')
    console.log('⚠️  IMPORTANT: Update the schema enum at src/schemas/tag.schema.ts')
    console.log(`   Remove "${id}" from the TagIdSchema enum array.`)
    console.log('   Then run: npm run validate:tags\n')
}

// Remove unused operation
async function operationRemoveUnused(
    args: CliArgs,
    rl?: ReturnType<typeof createReadlineInterface>
): Promise<void> {
    const tags = loadTags()

    console.log('\n🧹 Tag Management Tool - Remove Unused Operation\n')

    // Check if products file exists
    if (!existsSync(PRODUCTS_FILE)) {
        console.error('❌ Products file not found, cannot determine usage')
        console.error(`   Expected: ${PRODUCTS_FILE}`)
        console.error('   Run: npm run aggregate:products\n')
        process.exit(1)
    }

    console.log('⚠️  Checking tag usage across all products...\n')

    // Find all unused tags
    const unused: Tag[] = []
    for (const [tagId, tag] of Object.entries(tags)) {
        const usage = checkTagUsage(tagId)
        if (usage.length === 0) {
            unused.push(tag)
        }
    }

    if (unused.length === 0) {
        console.log('✅ All tags are currently in use!')
        console.log('   No unused tags to remove.\n')
        process.exit(0)
    }

    console.log(`Found ${unused.length} unused tag(s):\n`)
    unused.forEach((tag) => {
        console.log(`  • ${tag.id} (${tag.name})`)
    })
    console.log('')

    // Confirm removal
    if (rl) {
        console.log('⚠️  This will remove all unused tags from tags.json')
        console.log(
            '   You will still need to update the schema enum at src/schemas/tag.schema.ts\n'
        )
        const confirm = await select({
            message: `Remove ${unused.length} unused tag(s)?`,
            choices: [
                { name: 'Yes, remove all unused', value: 'yes' },
                { name: 'No, cancel', value: 'no' }
            ]
        })
        if (confirm === 'no') {
            console.log('❌ Operation cancelled')
            process.exit(0)
        }
    } else if (!args.force) {
        console.error('❌ In non-interactive mode, use --force to confirm removal')
        process.exit(1)
    }

    // Remove unused tags
    const unusedIds = new Set(unused.map((t) => t.id))
    for (const tagId of unusedIds) {
        delete tags[tagId as TagId]
    }
    saveTags(tags)

    console.log(`\n✅ Successfully removed ${unused.length} unused tag(s)!\n`)
    console.log('⚠️  IMPORTANT: Update the schema enum at src/schemas/tag.schema.ts')
    console.log('   Remove the following IDs from the TagIdSchema enum array:')
    unused.forEach((tag) => {
        console.log(`   - "${tag.id}"`)
    })
    console.log('   Then run: npm run validate:tags\n')
}

// Operation: Manage featured tags
async function operationManageFeatured(): Promise<void> {
    let managing = true

    while (managing) {
        console.clear()
        showOperationHeader('Manage Featured Tags', 'Bulk operations and reordering')

        const action = await select({
            message: 'Select action:',
            choices: [
                { name: '📊 View Featured Summary', value: 'view' },
                { name: '⭐ Toggle Featured Status', value: 'toggle' },
                { name: '🔄 Reorder Featured Items', value: 'reorder' },
                { name: '♻️ Renumber All Priorities', value: 'renumber' },
                { name: '← Back to Main Menu', value: 'back' }
            ],
            pageSize: 10
        })

        try {
            switch (action) {
                case 'view':
                    await viewFeaturedSummary()
                    break
                case 'toggle':
                    await toggleFeaturedStatus()
                    break
                case 'reorder':
                    await reorderFeatured()
                    break
                case 'renumber':
                    await renumberAll()
                    break
                case 'back':
                    managing = false
                    break
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'User cancelled operation') {
                showInfo('Operation cancelled')
            } else {
                throw error
            }
        }
    }
}

// Sub-operation: View featured summary
async function viewFeaturedSummary(): Promise<void> {
    console.clear()
    showOperationHeader('View Featured Summary')

    const items = loadFeaturedData()
    const stats = calculateFeaturedStats(items, TAGS_FEATURED_CONFIG)

    displayFeaturedSummary(stats, items)

    // Wait for user to continue
    await input({ message: 'Press Enter to continue...' })
}

// Sub-operation: Toggle featured status (unified interface)
async function toggleFeaturedStatus(): Promise<void> {
    console.clear()
    showOperationHeader('Toggle Featured Status')

    const items = loadFeaturedData()
    const beforeStats = calculateFeaturedStats(items, TAGS_FEATURED_CONFIG)

    // Show current state
    console.log(
        `${colors.dim}Current: ${colors.yellow}${beforeStats.featuredCount} featured${colors.reset}${colors.dim}, ${beforeStats.nonFeaturedCount} non-featured${colors.reset}\n`
    )

    // Create checkbox list with all items, pre-checked if featured
    const choices = items
        .sort((a, b) => {
            // Sort: featured first (by priority), then non-featured (alphabetically)
            if (a.featured !== b.featured) {
                return a.featured ? -1 : 1
            }
            return a.featured ? a.priority - b.priority : a.name.localeCompare(b.name)
        })
        .map((item) => ({
            name: `${item.name} ${item.featured ? '⭐' : ''} ${colors.dim}(${item.id})${colors.reset}`,
            value: item.id,
            checked: item.featured // Pre-check currently featured items
        }))

    const answer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedIds',
            message:
                'Select tags to feature (space to toggle, enter to confirm):\n' +
                `${colors.dim}  ⭐ = currently featured${colors.reset}`,
            choices,
            pageSize: 20
        }
    ])

    const selectedIds = new Set(answer.selectedIds as string[])

    // Determine what changed
    const promoted = items.filter((i) => !i.featured && selectedIds.has(i.id))
    const demoted = items.filter((i) => i.featured && !selectedIds.has(i.id))

    if (promoted.length === 0 && demoted.length === 0) {
        showInfo('No changes made')
        await input({ message: 'Press Enter to continue...' })
        return
    }

    // Update featured status
    const updatedItems = items.map((item) => ({
        ...item,
        featured: selectedIds.has(item.id)
    }))

    // Auto-renumber priorities
    const renumberedItems = autoRenumberPriorities(updatedItems, TAGS_FEATURED_CONFIG)
    const afterStats = calculateFeaturedStats(renumberedItems, TAGS_FEATURED_CONFIG)

    // Show summary
    console.clear()
    showOperationHeader('Changes Summary')

    console.log(`${colors.bright}Before:${colors.reset}`)
    console.log(`  Featured: ${beforeStats.featuredCount}`)
    console.log(`  Non-Featured: ${beforeStats.nonFeaturedCount}`)

    console.log(`\n${colors.bright}After:${colors.reset}`)
    console.log(`  Featured: ${colors.yellow}${afterStats.featuredCount}${colors.reset}`)
    console.log(`  Non-Featured: ${afterStats.nonFeaturedCount}`)

    if (promoted.length > 0) {
        console.log(
            `\n${colors.bright}${colors.green}⬆️ Promoted (${promoted.length}):${colors.reset}`
        )
        promoted.forEach((item) => {
            const newItem = renumberedItems.find((i) => i.id === item.id)
            console.log(
                `  • ${item.name} ${colors.dim}(Priority: ${newItem?.priority})${colors.reset}`
            )
        })
    }

    if (demoted.length > 0) {
        console.log(`\n${colors.bright}${colors.red}⬇️ Demoted (${demoted.length}):${colors.reset}`)
        demoted.forEach((item) => {
            const newItem = renumberedItems.find((i) => i.id === item.id)
            console.log(
                `  • ${item.name} ${colors.dim}(Priority: ${newItem?.priority})${colors.reset}`
            )
        })
    }

    console.log()

    // Confirm save
    const confirm = await select({
        message: 'Confirm and save changes?',
        choices: [
            { name: 'Yes, save changes', value: 'yes' },
            { name: 'No, cancel', value: 'no' }
        ]
    })

    if (confirm === 'no') {
        showInfo('Operation cancelled')
        await input({ message: 'Press Enter to continue...' })
        return
    }

    // Validate
    const validation = validateFeaturedOperation(renumberedItems, TAGS_FEATURED_CONFIG)
    if (!validation.success) {
        showError('Validation failed:')
        validation.errors.forEach((err) => console.error(`  • ${err}`))
        await input({ message: 'Press Enter to continue...' })
        return
    }

    // Save
    saveFeaturedChanges(renumberedItems)
    showSuccess(
        `Successfully updated featured status! (${promoted.length} promoted, ${demoted.length} demoted)`
    )

    await input({ message: 'Press Enter to continue...' })
}

// Sub-operation: Reorder featured items
async function reorderFeatured(): Promise<void> {
    const items = loadFeaturedData()
    let featuredItems = items.filter((i) => i.featured).sort((a, b) => a.priority - b.priority)

    if (featuredItems.length < 2) {
        showWarning('Need at least 2 featured tags to reorder')
        await input({ message: 'Press Enter to continue...' })
        return
    }

    let selectedIndex = 0
    let reordering = true

    while (reordering) {
        console.clear()
        showOperationHeader('Reorder Featured Tags')
        displayReorderList(featuredItems, selectedIndex)

        const action = await select({
            message: 'Select action:',
            choices: [
                { name: '⬆️ Move up', value: 'up', disabled: selectedIndex === 0 },
                {
                    name: '⬇️ Move down',
                    value: 'down',
                    disabled: selectedIndex === featuredItems.length - 1
                },
                { name: '📍 Select different item', value: 'select' },
                { name: '💾 Save changes', value: 'save' },
                { name: '❌ Cancel', value: 'cancel' }
            ],
            pageSize: 10
        })

        switch (action) {
            case 'up':
                featuredItems = moveItemUp(featuredItems, selectedIndex)
                selectedIndex--
                break
            case 'down':
                featuredItems = moveItemDown(featuredItems, selectedIndex)
                selectedIndex++
                break
            case 'select': {
                const selected = await select({
                    message: 'Select item to reorder:',
                    choices: featuredItems.map((item, index) => ({
                        name: `${item.priority}. ${item.name} (${item.id})`,
                        value: index
                    })),
                    pageSize: 15
                })
                selectedIndex = selected
                break
            }
            case 'save': {
                // Merge reordered featured with non-featured
                const nonFeatured = items.filter((i) => !i.featured)
                const allItems = [...featuredItems, ...nonFeatured]

                // Confirm save
                console.clear()
                showOperationHeader('Save Reorder Changes')
                console.log(`\n${colors.bright}New order:${colors.reset}`)
                featuredItems.forEach((item, index) => {
                    console.log(
                        `  ${colors.cyan}${index + 1}.${colors.reset} ${item.name} ${colors.dim}(Priority: ${item.priority})${colors.reset}`
                    )
                })
                console.log()

                const confirm = await select({
                    message: 'Save this new order?',
                    choices: [
                        { name: 'Yes, save changes', value: 'yes' },
                        { name: 'No, cancel', value: 'no' }
                    ]
                })

                if (confirm === 'yes') {
                    // Validate
                    const validation = validateFeaturedOperation(allItems, TAGS_FEATURED_CONFIG)
                    if (!validation.success) {
                        showError('Validation failed:')
                        validation.errors.forEach((err) => console.error(`  • ${err}`))
                        await input({ message: 'Press Enter to continue...' })
                        break
                    }

                    // Save
                    saveFeaturedChanges(allItems)
                    showSuccess('Featured tags reordered successfully!')
                    reordering = false
                } else {
                    showInfo('Reorder cancelled')
                    reordering = false
                }
                break
            }
            case 'cancel':
                showInfo('Reorder cancelled')
                reordering = false
                break
        }
    }

    await input({ message: 'Press Enter to continue...' })
}

// Sub-operation: Renumber all priorities
async function renumberAll(): Promise<void> {
    console.clear()
    showOperationHeader('Renumber All Priorities')

    const items = loadFeaturedData()
    const stats = calculateFeaturedStats(items, TAGS_FEATURED_CONFIG)

    // Show current state
    console.log(`${colors.bright}Current Priority Distribution:${colors.reset}`)
    console.log(
        `  Featured: ${stats.featuredCount} tags (Priority ${stats.featuredRange.min}-${stats.featuredRange.max})`
    )
    console.log(
        `  Non-Featured: ${stats.nonFeaturedCount} tags (Priority ${stats.nonFeaturedRange.min}-${stats.nonFeaturedRange.max})`
    )

    if (!stats.hasPriorityGaps) {
        showSuccess('All priorities are already sequential (no gaps)')
        console.log('No renumbering needed.\n')
        await input({ message: 'Press Enter to continue...' })
        return
    }

    showWarning(`Detected ${stats.gapDetails?.length || 0} priority gap(s)`)
    console.log()

    // Confirm renumbering
    const confirm = await select({
        message: 'Renumber all priorities to eliminate gaps?',
        choices: [
            { name: 'Yes, renumber all', value: 'yes' },
            { name: 'No, cancel', value: 'no' }
        ]
    })

    if (confirm === 'no') {
        showInfo('Renumber cancelled')
        await input({ message: 'Press Enter to continue...' })
        return
    }

    // Renumber
    const renumberedItems = autoRenumberPriorities(items, TAGS_FEATURED_CONFIG)

    // Show comparison
    showRenumberComparison(items, renumberedItems)

    // Final confirmation
    const finalConfirm = await select({
        message: 'Save these changes?',
        choices: [
            { name: 'Yes, save changes', value: 'yes' },
            { name: 'No, cancel', value: 'no' }
        ]
    })

    if (finalConfirm === 'no') {
        showInfo('Renumber cancelled')
        await input({ message: 'Press Enter to continue...' })
        return
    }

    // Validate
    const validation = validateFeaturedOperation(renumberedItems, TAGS_FEATURED_CONFIG)
    if (!validation.success) {
        showError('Validation failed:')
        validation.errors.forEach((err) => console.error(`  • ${err}`))
        await input({ message: 'Press Enter to continue...' })
        return
    }

    // Save
    saveFeaturedChanges(renumberedItems)
    showSuccess('Priorities renumbered successfully!')

    await input({ message: 'Press Enter to continue...' })
}

// Interactive mode
async function interactiveMode() {
    while (true) {
        showBanner('Tag Management', 'Add, modify, list, and remove tags', '🔖')

        const operation = await select({
            message: 'What would you like to do?',
            choices: [
                { name: '📋 List tags', value: 'list' },
                { name: '⭐ Manage featured tags', value: 'manage-featured' },
                { name: '➕ Add new tag', value: 'add' },
                { name: '✏️ Modify existing tag', value: 'modify' },
                { name: '🗑️ Remove tag', value: 'remove' },
                { name: '🧹 Remove unused tags', value: 'remove-unused' },
                { name: '👋 Exit', value: 'exit' }
            ],
            pageSize: 10
        })

        if (operation === 'exit') {
            showGoodbye('Tag Management CLI')
            process.exit(0)
        }

        // Execute the selected operation
        try {
            const rl = createReadlineInterface()

            switch (operation) {
                case 'list':
                    await operationList({ format: 'table' })
                    rl.close()
                    break
                case 'manage-featured':
                    await operationManageFeatured()
                    rl.close()
                    break
                case 'add':
                    await operationAdd({}, rl)
                    rl.close()
                    break
                case 'modify':
                    await operationModify({}, rl)
                    rl.close()
                    break
                case 'remove':
                    await operationRemove({}, rl)
                    rl.close()
                    break
                case 'remove-unused':
                    await operationRemoveUnused({}, rl)
                    rl.close()
                    break
            }

            // After operation completes, ask what to do next
            const nextAction = await select({
                message: 'What would you like to do next?',
                choices: [
                    { name: '🔄 Return to main menu', value: 'menu' },
                    { name: '👋 Exit', value: 'exit' }
                ]
            })

            if (nextAction === 'exit') {
                showGoodbye('Tag Management CLI')
                process.exit(0)
            }
        } catch (error) {
            // Handle errors gracefully
            if (error instanceof Error && error.message.includes('cancelled')) {
                showInfo('Operation cancelled')
            } else if (error instanceof Error && error.name === 'ExitPromptError') {
                showGoodbye('Tag Management CLI')
                process.exit(0)
            } else {
                showError(error instanceof Error ? error.message : String(error))
            }

            const continueAfterError = await select({
                message: 'An error occurred. What would you like to do?',
                choices: [
                    { name: '🔄 Return to main menu', value: true },
                    { name: '👋 Exit', value: false }
                ]
            })

            if (!continueAfterError) {
                process.exit(1)
            }
        }
    }
}

// CLI arguments mode
async function cliMode(args: CliArgs) {
    if (!args.operation) {
        console.error('❌ CLI mode requires --operation argument')
        console.error('   Run without arguments for interactive mode')
        process.exit(1)
    }

    switch (args.operation) {
        case 'list':
            await operationList({
                featuredFilter: args.featured_filter,
                format: args.format || 'table'
            })
            break
        case 'add':
            await operationAdd(args)
            break
        case 'modify':
            await operationModify(args)
            break
        case 'remove':
            await operationRemove(args)
            break
        case 'remove-unused':
            await operationRemoveUnused(args)
            break
        case 'manage-featured':
            await operationManageFeatured()
            break
        default:
            console.error(`❌ Unknown operation: ${args.operation}`)
            process.exit(1)
    }
}

// Main function
async function main() {
    const args = parseArgs()
    const hasCliArgs = args.operation !== undefined

    if (hasCliArgs) {
        // CLI mode - run operation and exit
        try {
            await cliMode(args)
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    } else {
        // Interactive mode - menu loop
        try {
            await interactiveMode()
        } catch (error) {
            // Handle Ctrl+C gracefully
            if (error && typeof error === 'object' && 'name' in error) {
                if (error.name === 'ExitPromptError') {
                    showGoodbye('Tag Management CLI')
                    process.exit(0)
                }
            }
            showError(error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    }
}

main()
