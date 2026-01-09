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
 *
 * Arguments:
 *   --operation <list|add|modify|remove>  Operation to perform (required for CLI mode)
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
import { TagSchema } from '../src/schemas/tag.schema.js'
import type { TagsMap, Tag, TagId } from '../src/types/tag'
import type { Product } from '../src/types/product'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TAGS_FILE = resolve(__dirname, '../src/data/tags.json')
const PRODUCTS_FILE = resolve(__dirname, '../src/data/products.json')

interface CliArgs {
    operation?: 'list' | 'add' | 'modify' | 'remove'
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
                    args.operation = nextArg as 'list' | 'add' | 'modify' | 'remove'
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
        id = await prompt(rl, 'Tag ID to modify (required): ')
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
        const nameInput = await prompt(rl, `Name [current: ${existingTag.name}]: `)
        if (nameInput) updates.name = nameInput
    }

    if (args.description !== undefined) {
        updates.description = args.description
    } else if (rl) {
        const descInput = await prompt(rl, `Description [current: ${existingTag.description}]: `)
        if (descInput) updates.description = descInput
    }

    if (args.icon !== undefined) {
        updates.icon = args.icon
    } else if (rl) {
        const iconInput = await prompt(rl, `Icon [current: ${existingTag.icon || 'none'}]: `)
        if (iconInput) updates.icon = iconInput
    }

    if (args.color !== undefined) {
        updates.color = args.color
    } else if (rl) {
        const colorInput = await prompt(rl, `Color [current: ${existingTag.color || 'none'}]: `)
        if (colorInput) updates.color = colorInput
    }

    if (args.featured !== undefined) {
        updates.featured = args.featured === 'true'
    } else if (rl) {
        const featuredInput = await prompt(
            rl,
            `Featured (true/false) [current: ${existingTag.featured}]: `
        )
        if (featuredInput) updates.featured = featuredInput.toLowerCase() === 'true'
    }

    if (args.priority !== undefined) {
        updates.priority = parseInt(args.priority)
    } else if (rl) {
        const priorityInput = await prompt(rl, `Priority [current: ${existingTag.priority}]: `)
        if (priorityInput) updates.priority = parseInt(priorityInput)
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
        const oldVal = (existingTag as any)[key]
        const newVal = (updatedTag as any)[key]
        console.log(`   ${key}: ${oldVal} → ${newVal}`)
    })
    console.log('')

    // Confirm save
    if (rl) {
        const confirm = await prompt(rl, 'Confirm and save? [yes/no]: ')
        if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
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
        id = await prompt(rl, 'Tag ID to remove (required): ')
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
        const confirm = await prompt(rl, 'Confirm removal? [yes/no]: ')
        if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
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

// Interactive mode
async function interactiveMode() {
    const rl = createReadlineInterface()

    console.log('\n🔖 Tag Management Tool - Interactive Mode\n')
    console.log('Operations:')
    console.log('  1. list    - View all tags')
    console.log('  2. add     - Add a new tag')
    console.log('  3. modify  - Modify an existing tag')
    console.log('  4. remove  - Remove a tag')
    console.log('')

    const operation = await prompt(rl, 'Select operation (1-4 or operation name): ')

    let op: 'list' | 'add' | 'modify' | 'remove'
    switch (operation.toLowerCase()) {
        case '1':
        case 'list':
            op = 'list'
            break
        case '2':
        case 'add':
            op = 'add'
            break
        case '3':
        case 'modify':
            op = 'modify'
            break
        case '4':
        case 'remove':
            op = 'remove'
            break
        default:
            console.error('❌ Invalid operation')
            rl.close()
            process.exit(1)
    }

    switch (op) {
        case 'list':
            rl.close()
            await operationList({ format: 'table' })
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
        default:
            console.error(`❌ Unknown operation: ${args.operation}`)
            process.exit(1)
    }
}

// Main function
async function main() {
    console.log('🎯 Tag Management Tool\n')

    const args = parseArgs()
    const hasCliArgs = args.operation !== undefined

    if (hasCliArgs) {
        console.log('Running in CLI mode...\n')
        await cliMode(args)
    } else {
        console.log('Running in interactive mode...')
        console.log('(Use --operation <list|add|modify|remove> for CLI mode)\n')
        await interactiveMode()
    }
}

main()
