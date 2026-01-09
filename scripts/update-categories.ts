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
 *     npm run update:categories -- --operation manage-featured
 *
 * Arguments:
 *   --operation <list|add|modify|remove|remove-unused|manage-featured>  Operation to perform (required for CLI mode)
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
import { select, input } from '@inquirer/prompts'
import { CategorySchema } from '../src/schemas/category.schema.js'
import type { CategoriesArray, Category, CategoryId } from '../src/types/category'
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
const CATEGORIES_FILE = resolve(__dirname, '../src/data/categories.json')
const PRODUCTS_FILE = resolve(__dirname, '../src/data/products.json')

// Configuration for featured management
const CATEGORIES_FEATURED_CONFIG: RenumberConfig = {
    featuredStart: 1,
    featuredEnd: 7,
    nonFeaturedStart: 8
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

// Data adapter: Load categories as FeaturedItem array
function loadFeaturedData(): FeaturedItem[] {
    const categories = loadCategories()
    return categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        featured: cat.featured,
        priority: cat.priority
    }))
}

// Data adapter: Save featured changes back to categories
function saveFeaturedChanges(items: FeaturedItem[]): void {
    const categories = loadCategories()
    const itemMap = new Map(items.map((i) => [i.id, i]))

    // Update featured and priority for each category
    categories.forEach((cat) => {
        const updated = itemMap.get(cat.id)
        if (updated) {
            cat.featured = updated.featured
            cat.priority = updated.priority
        }
    })

    saveCategories(categories) // Auto-sorts by priority
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
        // Use select menu to choose category
        const sortedCategories = categories.sort((a, b) => {
            // Sort by featured first, then by name
            if (a.featured !== b.featured) {
                return a.featured ? -1 : 1
            }
            return a.name.localeCompare(b.name)
        })

        id = await select({
            message: 'Select category to modify:',
            choices: sortedCategories.map((cat) => ({
                name: `${cat.name} ${cat.featured ? '⭐' : ''} (${cat.id})`,
                value: cat.id,
                description: cat.description
            })),
            pageSize: 15
        })
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
        const nameInput = await input({
            message: 'Name (press Enter to keep current):',
            default: existingCategory.name
        })
        if (nameInput && nameInput !== existingCategory.name) updates.name = nameInput
    }

    if (args.description !== undefined) {
        updates.description = args.description
    } else if (rl) {
        const descInput = await input({
            message: 'Description (press Enter to keep current):',
            default: existingCategory.description
        })
        if (descInput && descInput !== existingCategory.description) updates.description = descInput
    }

    if (args.icon !== undefined) {
        updates.icon = args.icon
    } else if (rl) {
        const iconInput = await input({
            message: 'Icon (press Enter to keep current):',
            default: existingCategory.icon || ''
        })
        if (iconInput && iconInput !== (existingCategory.icon || '')) updates.icon = iconInput
    }

    if (args.color !== undefined) {
        updates.color = args.color
    } else if (rl) {
        const colorInput = await input({
            message: 'Color (press Enter to keep current):',
            default: existingCategory.color || ''
        })
        if (colorInput && colorInput !== (existingCategory.color || '')) updates.color = colorInput
    }

    if (args.featured !== undefined) {
        updates.featured = args.featured === 'true'
    } else if (rl) {
        const featuredInput = await select({
            message: 'Featured:',
            choices: [
                {
                    name: `Keep current (${existingCategory.featured ? 'Yes' : 'No'})`,
                    value: 'keep'
                },
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
            default: String(existingCategory.priority)
        })
        if (priorityInput && priorityInput !== String(existingCategory.priority))
            updates.priority = parseInt(priorityInput)
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
        // Use select menu to choose category
        const sortedCategories = categories.sort((a, b) => {
            // Sort by featured first, then by name
            if (a.featured !== b.featured) {
                return a.featured ? -1 : 1
            }
            return a.name.localeCompare(b.name)
        })

        id = await select({
            message: 'Select category to remove:',
            choices: sortedCategories.map((cat) => ({
                name: `${cat.name} ${cat.featured ? '⭐' : ''} (${cat.id})`,
                value: cat.id,
                description: cat.description
            })),
            pageSize: 15
        })
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
        const confirm = await select({
            message: 'Confirm removal?',
            choices: [
                { name: 'Yes, remove category', value: 'yes' },
                { name: 'No, cancel', value: 'no' }
            ]
        })
        if (confirm === 'no') {
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
        const confirm = await select({
            message: `Remove ${unused.length} unused category(ies)?`,
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

// Operation: Manage featured categories
async function operationManageFeatured(): Promise<void> {
    let managing = true

    while (managing) {
        console.clear()
        showOperationHeader('Manage Featured Categories', 'Bulk operations and reordering')

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
    const stats = calculateFeaturedStats(items, CATEGORIES_FEATURED_CONFIG)

    displayFeaturedSummary(stats, items)

    await input({ message: 'Press Enter to continue...' })
}

// Sub-operation: Toggle featured status (unified interface)
async function toggleFeaturedStatus(): Promise<void> {
    console.clear()
    showOperationHeader('Toggle Featured Status')

    const items = loadFeaturedData()
    const beforeStats = calculateFeaturedStats(items, CATEGORIES_FEATURED_CONFIG)

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
                'Select categories to feature (space to toggle, enter to confirm):\n' +
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
    const renumberedItems = autoRenumberPriorities(updatedItems, CATEGORIES_FEATURED_CONFIG)
    const afterStats = calculateFeaturedStats(renumberedItems, CATEGORIES_FEATURED_CONFIG)

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
    const validation = validateFeaturedOperation(renumberedItems, CATEGORIES_FEATURED_CONFIG)
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
        showWarning('Need at least 2 featured categories to reorder')
        await input({ message: 'Press Enter to continue...' })
        return
    }

    let selectedIndex = 0
    let reordering = true

    while (reordering) {
        console.clear()
        showOperationHeader('Reorder Featured Categories')
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
                const nonFeatured = items.filter((i) => !i.featured)
                const allItems = [...featuredItems, ...nonFeatured]

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
                    const validation = validateFeaturedOperation(
                        allItems,
                        CATEGORIES_FEATURED_CONFIG
                    )
                    if (!validation.success) {
                        showError('Validation failed:')
                        validation.errors.forEach((err) => console.error(`  • ${err}`))
                        await input({ message: 'Press Enter to continue...' })
                        break
                    }

                    saveFeaturedChanges(allItems)
                    showSuccess('Featured categories reordered successfully!')
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
    const stats = calculateFeaturedStats(items, CATEGORIES_FEATURED_CONFIG)

    console.log(`${colors.bright}Current Priority Distribution:${colors.reset}`)
    console.log(
        `  Featured: ${stats.featuredCount} categories (Priority ${stats.featuredRange.min}-${stats.featuredRange.max})`
    )
    console.log(
        `  Non-Featured: ${stats.nonFeaturedCount} categories (Priority ${stats.nonFeaturedRange.min}-${stats.nonFeaturedRange.max})`
    )

    if (!stats.hasPriorityGaps) {
        showSuccess('All priorities are already sequential (no gaps)')
        console.log('No renumbering needed.\n')
        await input({ message: 'Press Enter to continue...' })
        return
    }

    showWarning(`Detected ${stats.gapDetails?.length || 0} priority gap(s)`)
    console.log()

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

    const renumberedItems = autoRenumberPriorities(items, CATEGORIES_FEATURED_CONFIG)

    showRenumberComparison(items, renumberedItems)

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

    const validation = validateFeaturedOperation(renumberedItems, CATEGORIES_FEATURED_CONFIG)
    if (!validation.success) {
        showError('Validation failed:')
        validation.errors.forEach((err) => console.error(`  • ${err}`))
        await input({ message: 'Press Enter to continue...' })
        return
    }

    saveFeaturedChanges(renumberedItems)
    showSuccess('Priorities renumbered successfully!')

    await input({ message: 'Press Enter to continue...' })
}

// Interactive mode with menu loop
async function interactiveMode() {
    while (true) {
        showBanner('Category Management', 'Add, modify, list, and remove categories', '🏷️')

        const operation = await select({
            message: 'What would you like to do?',
            choices: [
                { name: '📋 List categories', value: 'list' },
                { name: '⭐ Manage featured categories', value: 'manage-featured' },
                { name: '➕ Add new category', value: 'add' },
                { name: '✏️ Modify existing category', value: 'modify' },
                { name: '🗑️ Remove category', value: 'remove' },
                { name: '🧹 Remove unused categories', value: 'remove-unused' },
                { name: '👋 Exit', value: 'exit' }
            ],
            pageSize: 10
        })

        if (operation === 'exit') {
            showGoodbye('Category Management CLI')
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
                showGoodbye('Category Management CLI')
                process.exit(0)
            }
        } catch (error) {
            // Handle errors gracefully
            if (error instanceof Error && error.message.includes('cancelled')) {
                showInfo('Operation cancelled')
            } else if (error instanceof Error && error.name === 'ExitPromptError') {
                showGoodbye('Category Management CLI')
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
                    showGoodbye('Category Management CLI')
                    process.exit(0)
                }
            }
            showError(error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    }
}

main()
