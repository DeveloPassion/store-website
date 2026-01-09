#!/usr/bin/env tsx

/**
 * Interactive CLI tool to update categories configuration
 *
 * This script provides an easy way to manage categories (add/modify/remove)
 * with interactive prompts or direct CLI arguments.
 *
 * Usage:
 *   Interactive mode:
 *     npm run update:categories
 *     tsx scripts/update-categories.ts
 *
 *   CLI arguments mode:
 *     npm run update:categories -- --operation list [--featured] [--format json|table]
 *     npm run update:categories -- --operation add --name "Category Name" --description "..." [--id custom-id] [--icon FaIcon] [--color #FF6B6B] [--featured true] [--priority 15]
 *     npm run update:categories -- --operation modify --id "category-id" [--name "..."] [--description "..."] [--icon "..."] [--color "..."] [--featured true|false] [--priority 15]
 *     npm run update:categories -- --operation remove --id "category-id" [--force]
 *     npm run update:categories -- --operation remove-unused [--force]
 *
 * Arguments:
 *   --operation <list|add|modify|remove|remove-unused>  Operation to perform (required for CLI mode)
 *   --id <string>                         Category ID (required for modify/remove, optional for add)
 *   --name <string>                       Category name (required for add, optional for modify)
 *   --description <string>                Category description (required for add, optional for modify)
 *   --icon <string>                       React icon name (optional)
 *   --color <string>                      Color value (optional, can be hex or any valid CSS color)
 *   --featured <true|false>               Featured status (optional)
 *   --priority <number>                   Priority (1-7 featured, 8-23 non-featured) (optional)
 *   --force                               Force removal even if used in secondaryCategories (optional, for remove only)
 *   --featured                            Filter featured only (optional, for list only)
 *   --format <json|table>                 Output format (optional, for list only, default: table)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'
import { CategorySchema } from '../src/schemas/category.schema.js'
import type { CategoriesArray, Category, CategoryId } from '../src/types/category'
import type { Product } from '../src/types/product'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CATEGORIES_FILE = resolve(__dirname, '../src/data/categories.json')
const PRODUCTS_FILE = resolve(__dirname, '../src/data/products.json')

interface CliArgs {
    operation?: 'list' | 'add' | 'modify' | 'remove' | 'remove-unused'
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

interface CategoryUsage {
    asMain: ProductReference[]
    asSecondary: ProductReference[]
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

// Load categories from JSON file
function loadCategories(): CategoriesArray {
    if (!existsSync(CATEGORIES_FILE)) {
        console.error(`❌ Categories file not found: ${CATEGORIES_FILE}`)
        process.exit(1)
    }

    try {
        const content = readFileSync(CATEGORIES_FILE, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        console.error('❌ Failed to parse categories.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Save categories to JSON file
function saveCategories(categories: CategoriesArray): void {
    try {
        // Sort by priority before saving
        const sorted = categories.sort((a, b) => a.priority - b.priority)
        const jsonContent = JSON.stringify(sorted, null, 2)
        writeFileSync(CATEGORIES_FILE, jsonContent, 'utf-8')
    } catch (error) {
        console.error('❌ Failed to write categories.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Find category by ID
function findCategoryById(categories: CategoriesArray, id: string): Category | null {
    return categories.find((cat) => cat.id === id) || null
}

// Check if category is used in products
function checkCategoryUsage(categoryId: string): CategoryUsage {
    if (!existsSync(PRODUCTS_FILE)) {
        console.warn('⚠️  Products file not found, skipping usage check')
        return { asMain: [], asSecondary: [] }
    }

    try {
        const content = readFileSync(PRODUCTS_FILE, 'utf-8')
        const products = JSON.parse(content)

        const asMain = products
            .filter((p: Product) => p.mainCategory === categoryId)
            .map((p: Product) => ({
                productId: p.id,
                productName: p.name
            }))

        const asSecondary = products
            .filter(
                (p: Product) =>
                    p.secondaryCategories &&
                    p.secondaryCategories.some((sc) => sc.id === categoryId)
            )
            .map((p: Product) => ({
                productId: p.id,
                productName: p.name
            }))

        return { asMain, asSecondary }
    } catch {
        console.warn('⚠️  Could not check product usage')
        return { asMain: [], asSecondary: [] }
    }
}

// Validate category data
function validateCategory(category: Category): { success: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate using Zod schema
    const result = CategorySchema.safeParse(category)
    if (!result.success) {
        result.error.errors.forEach((err) => {
            const path = err.path.join('.') || 'category'
            errors.push(`${path}: ${err.message}`)
        })
    }

    // Additional validation for hex color format (schema doesn't enforce this for categories)
    if (category.color && !/^#[0-9A-Fa-f]{6}$/.test(category.color)) {
        console.warn(
            `⚠️  Color '${category.color}' is not in standard hex format (#RRGGBB). This is allowed but not recommended.`
        )
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
    const categories = loadCategories()

    let filtered = categories
    if (options.featuredFilter) {
        filtered = categories.filter((cat) => cat.featured)
    }

    // Sort by priority
    filtered.sort((a, b) => a.priority - b.priority)

    if (options.format === 'json') {
        console.log(JSON.stringify(filtered, null, 2))
        return
    }

    // Table format (default)
    console.log('\n📋 Categories List\n')
    console.log(
        `${'ID'.padEnd(30)} ${'Name'.padEnd(30)} ${'Featured'.padEnd(10)} ${'Priority'.padEnd(10)}`
    )
    console.log('-'.repeat(85))

    filtered.forEach((cat) => {
        const featuredStr = cat.featured ? '✓ Yes' : 'No'
        console.log(
            `${cat.id.padEnd(30)} ${cat.name.padEnd(30)} ${featuredStr.padEnd(10)} ${String(cat.priority).padEnd(10)}`
        )
    })

    console.log(`\nTotal: ${filtered.length} category(ies)`)
    if (options.featuredFilter) {
        console.log(`(Showing featured categories only)`)
    }
    console.log('')
}

// Add operation
async function operationAdd(
    args: CliArgs,
    rl?: ReturnType<typeof createReadlineInterface>
): Promise<void> {
    const categories = loadCategories()

    console.log('\n📁 Category Management Tool - Add Operation\n')

    // Get category name
    let name = args.name
    if (!name && rl) {
        name = await prompt(rl, 'Category name (required): ')
    }

    if (!name) {
        console.error('❌ Category name is required')
        process.exit(1)
    }

    // Generate suggested ID
    const suggestedId = generateIdFromName(name)

    // Get category ID
    let id = args.id
    if (!id && rl) {
        console.log(`Suggested ID: ${suggestedId}`)
        const idInput = await prompt(
            rl,
            `Category ID (press Enter for suggested) [${suggestedId}]: `
        )
        id = idInput || suggestedId
    } else if (!id) {
        id = suggestedId
    }

    // Check if ID already exists
    if (findCategoryById(categories, id)) {
        console.error(`❌ Category with ID '${id}' already exists`)
        console.error('   Choose a different ID or modify the existing category')
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
        icon = await prompt(rl, 'Icon (optional, e.g., FaTools, FaRobot): ')
    }

    let color = args.color
    if (color === undefined && rl) {
        color = await prompt(rl, 'Color (optional, hex format #RRGGBB recommended): ')
    }

    let featured = args.featured === 'true'
    if (args.featured === undefined && rl) {
        const featuredInput = await prompt(rl, 'Featured (true/false) [false]: ')
        featured = featuredInput.toLowerCase() === 'true'
    }

    let priority = args.priority ? parseInt(args.priority) : undefined
    if (priority === undefined && rl) {
        const defaultPriority = featured ? 5 : 15
        const priorityInput = await prompt(
            rl,
            `Priority (1-7 for featured, 8-23 for non-featured) [${defaultPriority}]: `
        )
        priority = priorityInput ? parseInt(priorityInput) : defaultPriority
    }

    if (priority === undefined) {
        priority = featured ? 5 : 15
    }

    // Build category object
    const category: Category = {
        id: id as CategoryId,
        name,
        description,
        featured,
        priority,
        ...(icon && { icon }),
        ...(color && { color })
    }

    // Validate category
    console.log('\n🔍 Validating category...')
    const validation = validateCategory(category)

    if (!validation.success) {
        console.error('\n❌ Validation failed!\n')
        validation.errors.forEach((err) => console.error(`  • ${err}`))
        console.error('\n💡 Tip: Check the schema at src/schemas/category.schema.ts')
        process.exit(1)
    }

    console.log('✅ Category is valid!\n')

    // Display category summary
    console.log('📊 New Category:')
    console.log(`   ID: ${category.id}`)
    console.log(`   Name: ${category.name}`)
    console.log(`   Description: ${category.description}`)
    if (category.icon) console.log(`   Icon: ${category.icon}`)
    if (category.color) console.log(`   Color: ${category.color}`)
    console.log(`   Featured: ${category.featured}`)
    console.log(`   Priority: ${category.priority}`)
    console.log('')

    // Confirm save
    if (rl) {
        const confirm = await prompt(rl, 'Confirm and save? [yes/no]: ')
        if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
            console.log('❌ Operation cancelled')
            process.exit(0)
        }
    }

    // Add category to collection
    categories.push(category)
    saveCategories(categories)

    console.log('✅ Category added successfully to categories.json!\n')
    console.log('⚠️  IMPORTANT: Update the schema enum at src/schemas/category.schema.ts')
    console.log(`   Add "${category.id}" to the CategoryIdSchema enum array.`)
    console.log('   Then run: npm run validate:categories\n')
}

// Modify operation
async function operationModify(
    args: CliArgs,
    rl?: ReturnType<typeof createReadlineInterface>
): Promise<void> {
    const categories = loadCategories()

    console.log('\n✏️  Category Management Tool - Modify Operation\n')

    // Get category ID
    let id = args.id
    if (!id && rl) {
        id = await prompt(rl, 'Category ID to modify (required): ')
    }

    if (!id) {
        console.error('❌ Category ID is required for modify operation')
        process.exit(1)
    }

    // Check if category exists
    const existingCategory = findCategoryById(categories, id)
    if (!existingCategory) {
        console.error(`❌ Category with ID '${id}' not found`)
        process.exit(1)
    }

    console.log('Current category:')
    console.log(`  Name: ${existingCategory.name}`)
    console.log(`  Description: ${existingCategory.description}`)
    console.log(`  Icon: ${existingCategory.icon || 'none'}`)
    console.log(`  Color: ${existingCategory.color || 'none'}`)
    console.log(`  Featured: ${existingCategory.featured}`)
    console.log(`  Priority: ${existingCategory.priority}`)
    console.log('')

    // Collect updates
    const updates: Partial<Category> = {}

    if (args.name !== undefined) {
        updates.name = args.name
    } else if (rl) {
        const nameInput = await prompt(rl, `Name [current: ${existingCategory.name}]: `)
        if (nameInput) updates.name = nameInput
    }

    if (args.description !== undefined) {
        updates.description = args.description
    } else if (rl) {
        const descInput = await prompt(
            rl,
            `Description [current: ${existingCategory.description}]: `
        )
        if (descInput) updates.description = descInput
    }

    if (args.icon !== undefined) {
        updates.icon = args.icon
    } else if (rl) {
        const iconInput = await prompt(rl, `Icon [current: ${existingCategory.icon || 'none'}]: `)
        if (iconInput) updates.icon = iconInput
    }

    if (args.color !== undefined) {
        updates.color = args.color
    } else if (rl) {
        const colorInput = await prompt(
            rl,
            `Color [current: ${existingCategory.color || 'none'}]: `
        )
        if (colorInput) updates.color = colorInput
    }

    if (args.featured !== undefined) {
        updates.featured = args.featured === 'true'
    } else if (rl) {
        const featuredInput = await prompt(
            rl,
            `Featured (true/false) [current: ${existingCategory.featured}]: `
        )
        if (featuredInput) updates.featured = featuredInput.toLowerCase() === 'true'
    }

    if (args.priority !== undefined) {
        updates.priority = parseInt(args.priority)
    } else if (rl) {
        const priorityInput = await prompt(rl, `Priority [current: ${existingCategory.priority}]: `)
        if (priorityInput) updates.priority = parseInt(priorityInput)
    }

    // Check if any updates provided
    if (Object.keys(updates).length === 0) {
        console.log('⚠️  No changes provided, category unchanged')
        process.exit(0)
    }

    // Merge updates
    const updatedCategory: Category = { ...existingCategory, ...updates }

    // Validate updated category
    console.log('\n🔍 Validating updated category...')
    const validation = validateCategory(updatedCategory)

    if (!validation.success) {
        console.error('\n❌ Validation failed!\n')
        validation.errors.forEach((err) => console.error(`  • ${err}`))
        process.exit(1)
    }

    console.log('✅ Updated category is valid!\n')

    // Show changes
    console.log('📊 Changes:')
    Object.keys(updates).forEach((key) => {
        const oldVal = (existingCategory as Record<string, unknown>)[key]
        const newVal = (updatedCategory as Record<string, unknown>)[key]
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

    // Update category in array
    const index = categories.findIndex((cat) => cat.id === id)
    categories[index] = updatedCategory
    saveCategories(categories)

    console.log('✅ Category updated successfully!\n')
}

// Remove operation
async function operationRemove(
    args: CliArgs,
    rl?: ReturnType<typeof createReadlineInterface>
): Promise<void> {
    const categories = loadCategories()

    console.log('\n🗑️  Category Management Tool - Remove Operation\n')

    // Get category ID
    let id = args.id
    if (!id && rl) {
        id = await prompt(rl, 'Category ID to remove (required): ')
    }

    if (!id) {
        console.error('❌ Category ID is required for remove operation')
        process.exit(1)
    }

    // Check if category exists
    const category = findCategoryById(categories, id)
    if (!category) {
        console.error(`❌ Category with ID '${id}' not found`)
        process.exit(1)
    }

    console.log('Category to remove:')
    console.log(`  ID: ${category.id}`)
    console.log(`  Name: ${category.name}`)
    console.log(`  Description: ${category.description}`)
    console.log('')

    // Check product usage
    console.log('⚠️  Checking product usage...\n')
    const usage = checkCategoryUsage(id)

    const totalUsage = usage.asMain.length + usage.asSecondary.length

    if (totalUsage > 0) {
        console.log('Found usage:')

        if (usage.asMain.length > 0) {
            console.log(`  As Main Category (${usage.asMain.length} product(s)):`)
            usage.asMain.forEach((ref) => {
                console.log(`    • ${ref.productId} (${ref.productName})`)
            })
        }

        if (usage.asSecondary.length > 0) {
            console.log(`  As Secondary Category (${usage.asSecondary.length} product(s)):`)
            usage.asSecondary.forEach((ref) => {
                console.log(`    • ${ref.productId} (${ref.productName})`)
            })
        }

        console.log('')

        // CRITICAL: Cannot remove if used as mainCategory (even with --force)
        if (usage.asMain.length > 0) {
            console.error('❌ Cannot remove category used as mainCategory in products.')
            console.error(
                '   You must update those products to use a different mainCategory first.'
            )
            console.error(
                '   This restriction applies even with --force flag to prevent data corruption.'
            )
            process.exit(1)
        }

        // If only used in secondaryCategories, allow with --force
        if (usage.asSecondary.length > 0 && !args.force) {
            console.error('❌ Cannot remove category used in secondaryCategories')
            console.error('   Remove category from products first, or use --force flag')
            process.exit(1)
        }

        if (args.force) {
            console.log('⚠️  --force flag provided, proceeding with removal')
            console.log('   WARNING: This will break secondaryCategories references in products!\n')
        }
    } else {
        console.log('✅ Category is not used in any products\n')
    }

    // Confirm removal
    if (rl) {
        const confirm = await prompt(rl, 'Confirm removal? [yes/no]: ')
        if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
            console.log('❌ Operation cancelled')
            process.exit(0)
        }
    }

    // Remove category
    const filtered = categories.filter((cat) => cat.id !== id)
    saveCategories(filtered)

    console.log('✅ Category removed successfully!\n')
    console.log('⚠️  IMPORTANT: Update the schema enum at src/schemas/category.schema.ts')
    console.log(`   Remove "${id}" from the CategoryIdSchema enum array.`)
    console.log('   Then run: npm run validate:categories\n')

    if (usage.asSecondary.length > 0) {
        console.log(
            '⚠️  IMPORTANT: Update products to remove this category from secondaryCategories'
        )
        console.log('   Run npm run validate:products to find broken references\n')
    }
}

// Remove unused operation
async function operationRemoveUnused(
    args: CliArgs,
    rl?: ReturnType<typeof createReadlineInterface>
): Promise<void> {
    const categories = loadCategories()

    console.log('\n🧹 Category Management Tool - Remove Unused Operation\n')

    // Check if products file exists
    if (!existsSync(PRODUCTS_FILE)) {
        console.error('❌ Products file not found, cannot determine usage')
        console.error(`   Expected: ${PRODUCTS_FILE}`)
        console.error('   Run: npm run aggregate:products\n')
        process.exit(1)
    }

    console.log('⚠️  Checking category usage across all products...\n')

    // Find all unused categories
    const unused: Category[] = []
    for (const category of categories) {
        const usage = checkCategoryUsage(category.id)
        if (usage.asMain.length === 0 && usage.asSecondary.length === 0) {
            unused.push(category)
        }
    }

    if (unused.length === 0) {
        console.log('✅ All categories are currently in use!')
        console.log('   No unused categories to remove.\n')
        process.exit(0)
    }

    console.log(`Found ${unused.length} unused category(ies):\n`)
    unused.forEach((category) => {
        console.log(`  • ${category.id} (${category.name})`)
    })
    console.log('')

    // Confirm removal
    if (rl) {
        console.log('⚠️  This will remove all unused categories from categories.json')
        console.log(
            '   You will still need to update the schema enum at src/schemas/category.schema.ts\n'
        )
        const confirm = await prompt(rl, `Remove ${unused.length} unused category(ies)? [yes/no]: `)
        if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
            console.log('❌ Operation cancelled')
            process.exit(0)
        }
    } else if (!args.force) {
        console.error('❌ In non-interactive mode, use --force to confirm removal')
        process.exit(1)
    }

    // Remove unused categories
    const unusedIds = new Set(unused.map((c) => c.id))
    const filtered = categories.filter((cat) => !unusedIds.has(cat.id))
    saveCategories(filtered)

    console.log(`\n✅ Successfully removed ${unused.length} unused category(ies)!\n`)
    console.log('⚠️  IMPORTANT: Update the schema enum at src/schemas/category.schema.ts')
    console.log('   Remove the following IDs from the CategoryIdSchema enum array:')
    unused.forEach((category) => {
        console.log(`   - "${category.id}"`)
    })
    console.log('   Then run: npm run validate:categories\n')
}

// Interactive mode
async function interactiveMode() {
    const rl = createReadlineInterface()

    console.log('\n📁 Category Management Tool - Interactive Mode\n')
    console.log('Operations:')
    console.log('  1. list          - View all categories')
    console.log('  2. add           - Add a new category')
    console.log('  3. modify        - Modify an existing category')
    console.log('  4. remove        - Remove a category')
    console.log('  5. remove-unused - Remove all unused categories')
    console.log('')

    const operation = await prompt(rl, 'Select operation (1-5 or operation name): ')

    let op: 'list' | 'add' | 'modify' | 'remove' | 'remove-unused'
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
        case '5':
        case 'remove-unused':
            op = 'remove-unused'
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
        case 'remove-unused':
            await operationRemoveUnused({}, rl)
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
        case 'remove-unused':
            await operationRemoveUnused(args)
            break
        default:
            console.error(`❌ Unknown operation: ${args.operation}`)
            process.exit(1)
    }
}

// Main function
async function main() {
    console.log('🎯 Category Management Tool\n')

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
