#!/usr/bin/env tsx

/**
 * Interactive CLI tool to manage products
 *
 * This script provides an easy way to manage products (list/add/edit/remove)
 * with interactive prompts featuring keyboard-navigable multi-select interfaces
 * for tags and categories.
 *
 * Usage:
 *   Interactive mode:
 *     npm run update:products
 *     tsx scripts/update-products.ts
 *
 *   CLI arguments mode:
 *     npm run update:products -- --operation list [--featured] [--status active] [--category guides] [--tag ai] [--format json|table|detailed]
 *     npm run update:products -- --operation add --name "Product Name" --tagline "..." --price 49.99 --priceTier standard --permalink abc123 --gumroadUrl "https://..." --mainCategory guides --tags "tag1,tag2" --problem "..." --agitate "..." --solution "..."
 *     npm run update:products -- --operation edit --id product-id [--name "..."] [--price 49.99] [--priority 95] [--tags "tag1,tag2"]
 *     npm run update:products -- --operation remove --id product-id [--force]
 *
 * Arguments:
 *   --operation <list|add|edit|remove>  Operation to perform (required for CLI mode)
 *   --id <string>                       Product ID (required for edit/remove)
 *   --name <string>                     Product name
 *   --tagline <string>                  Product tagline
 *   --price <number>                    Price in EUR
 *   --priceTier <string>                Price tier (free/budget/standard/premium/enterprise/subscription)
 *   --permalink <string>                Gumroad permalink code
 *   --gumroadUrl <string>               Full Gumroad URL
 *   --mainCategory <string>             Main category ID
 *   --tags <string>                     Comma-separated tag IDs
 *   --secondaryCategories <string>      Secondary categories format: "id:distant,id:distant"
 *   --featured <true|false>             Featured status
 *   --priority <number>                 Priority (higher = more prominent)
 *   --status <string>                   Status (active/coming-soon/archived)
 *   --problem <string>                  Problem description
 *   --agitate <string>                  Agitation description
 *   --solution <string>                 Solution description
 *   --force                             Force removal even if referenced
 *   --format <json|table|detailed>      Output format (for list only)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'
import inquirer from 'inquirer'
import { select } from '@inquirer/prompts'
import {
    ProductSchema,
    PriceTierSchema,
    ProductStatusSchema,
    ProductCategorySchema
} from '../src/schemas/product.schema.js'
import { TagsMapSchema } from '../src/schemas/tag.schema.js'
import { TagIdSchema } from '../src/schemas/tag.schema.js'
import { CategoriesArraySchema } from '../src/schemas/category.schema.js'
import type { Product, SecondaryCategory } from '../src/types/product'
import type { TagsMap, TagId } from '../src/types/tag'
import type { Category } from '../src/types/category'

// ANSI color codes for better UX
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')
const TAGS_FILE = resolve(__dirname, '../src/data/tags.json')
const CATEGORIES_FILE = resolve(__dirname, '../src/data/categories.json')

interface CliArgs {
    operation?: 'list' | 'add' | 'edit' | 'remove'
    id?: string
    name?: string
    tagline?: string
    secondaryTagline?: string
    price?: string
    priceDisplay?: string
    priceTier?: string
    permalink?: string
    gumroadUrl?: string
    mainCategory?: string
    tags?: string // comma-separated
    secondaryCategories?: string // format: "id:distant,id:distant"
    featured?: string
    priority?: string
    status?: string
    problem?: string
    agitate?: string
    solution?: string
    force?: boolean
    // List filters
    featured_filter?: boolean
    status_filter?: string
    category_filter?: string
    tag_filter?: string
    format?: 'json' | 'table' | 'detailed'
}

interface ProductReference {
    productId: string
    productName: string
    referenceType: 'crossSell'
}

// ============================================================================
// Display Functions
// ============================================================================

/**
 * Display welcome banner
 */
function showBanner(): void {
    console.clear()
    console.log(`
${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              📦  PRODUCT MANAGEMENT CLI  📦               ║
║                                                           ║
║         Add, edit, list, and remove products              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
`)
}

/**
 * Show operation header
 */
function showOperationHeader(operation: string, subtitle?: string): void {
    console.log(
        `\n${colors.bright}${colors.blue}▶ ${operation.toUpperCase()}${colors.reset}${subtitle ? ` ${colors.dim}${subtitle}${colors.reset}` : ''}\n`
    )
}

/**
 * Show success message
 */
function showSuccess(message: string): void {
    console.log(`\n${colors.bright}${colors.green}✅ ${message}${colors.reset}`)
}

/**
 * Show error message
 */
function showError(message: string): void {
    console.error(`\n${colors.bright}${colors.red}❌ ${message}${colors.reset}`)
}

/**
 * Show warning message
 */
function showWarning(message: string): void {
    console.log(`\n${colors.bright}${colors.yellow}⚠️  ${message}${colors.reset}`)
}

/**
 * Show info message
 */
function showInfo(message: string): void {
    console.log(`${colors.cyan}ℹ ${message}${colors.reset}`)
}

/**
 * Show section header
 */
function showSectionHeader(section: string): void {
    console.log(`\n${colors.bright}${colors.magenta}═══ ${section} ═══${colors.reset}\n`)
}

/**
 * Show product details summary
 */
function showProductDetails(product: Product): void {
    console.log(`\n${colors.bright}${colors.cyan}📦 Product Details${colors.reset}`)
    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
    console.log(`${colors.bright}ID:${colors.reset} ${colors.cyan}${product.id}${colors.reset}`)
    console.log(`${colors.bright}Name:${colors.reset} ${product.name}`)
    console.log(`${colors.bright}Tagline:${colors.reset} ${product.tagline}`)
    if (product.secondaryTagline) {
        console.log(`${colors.bright}Secondary Tagline:${colors.reset} ${product.secondaryTagline}`)
    }
    console.log(
        `${colors.bright}Price:${colors.reset} ${product.priceDisplay} ${colors.dim}(${product.priceTier})${colors.reset}`
    )
    console.log(`${colors.bright}Permalink:${colors.reset} ${product.permalink}`)
    console.log(
        `${colors.bright}Main Category:${colors.reset} ${product.mainCategory} ${colors.dim}(${loadCategories().find((c) => c.id === product.mainCategory)?.name})${colors.reset}`
    )
    if (product.secondaryCategories.length > 0) {
        console.log(
            `${colors.bright}Secondary Categories:${colors.reset} ${product.secondaryCategories
                .map((c) => `${c.id}${c.distant ? ' (distant)' : ''}`)
                .join(', ')}`
        )
    }
    console.log(
        `${colors.bright}Tags:${colors.reset} ${colors.dim}(${product.tags.length})${colors.reset} ${product.tags.join(', ')}`
    )
    const statusColor = product.status === 'active' ? colors.green : colors.yellow
    console.log(
        `${colors.bright}Status:${colors.reset} ${statusColor}${product.status}${colors.reset}`
    )
    console.log(`${colors.bright}Priority:${colors.reset} ${product.priority || 0}`)
    console.log(
        `${colors.bright}Featured:${colors.reset} ${product.featured ? `${colors.yellow}Yes ★${colors.reset}` : 'No'}`
    )
    console.log(`${colors.bright}Most Value:${colors.reset} ${product.mostValue ? 'Yes' : 'No'}`)
    console.log(`${colors.bright}Bestseller:${colors.reset} ${product.bestseller ? 'Yes' : 'No'}`)
    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
}

/**
 * Track changes to a product
 */
interface ProductChange {
    field: string
    oldValue: unknown
    newValue: unknown
}

const changes: ProductChange[] = []

function trackChange(field: string, oldValue: unknown, newValue: unknown): void {
    // Remove existing change for this field if any
    const existingIndex = changes.findIndex((c) => c.field === field)
    if (existingIndex >= 0) {
        changes.splice(existingIndex, 1)
    }
    // Add new change
    changes.push({ field, oldValue, newValue })
}

function showChanges(): void {
    if (changes.length === 0) {
        showInfo('No changes made yet')
        return
    }

    console.log(
        `\n${colors.bright}${colors.yellow}📝 Changes Summary (${changes.length})${colors.reset}`
    )
    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)

    for (const change of changes) {
        const oldStr =
            typeof change.oldValue === 'object'
                ? JSON.stringify(change.oldValue)
                : String(change.oldValue)
        const newStr =
            typeof change.newValue === 'object'
                ? JSON.stringify(change.newValue)
                : String(change.newValue)

        console.log(`${colors.bright}${change.field}:${colors.reset}`)
        console.log(`  ${colors.red}− ${oldStr}${colors.reset}`)
        console.log(`  ${colors.green}+ ${newStr}${colors.reset}`)
    }
    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
}

function clearChanges(): void {
    changes.length = 0
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse CLI arguments
 */
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
            const key = arg.slice(2) as keyof CliArgs
            args[key] = nextArg as never
            i++
        }
    }

    return args
}

/**
 * Load all products from individual files
 */
function loadAllProducts(): Product[] {
    const products: Product[] = []
    const files = readdirSync(PRODUCTS_DIR).filter(
        (f) => f.endsWith('.json') && !f.endsWith('-faq.json') && !f.endsWith('-testimonials.json')
    )

    for (const file of files) {
        const filePath = resolve(PRODUCTS_DIR, file)
        const content = readFileSync(filePath, 'utf-8')
        const product = JSON.parse(content) as Product
        products.push(product)
    }

    return products.sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

/**
 * Load a single product by ID
 */
function loadProduct(id: string): Product | null {
    const filePath = resolve(PRODUCTS_DIR, `${id}.json`)
    if (!existsSync(filePath)) {
        return null
    }
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as Product
}

/**
 * Save a product to its individual file
 */
function saveProduct(product: Product): void {
    const filePath = resolve(PRODUCTS_DIR, `${product.id}.json`)
    writeFileSync(filePath, JSON.stringify(product, null, 4) + '\n', 'utf-8')
}

/**
 * Remove a product file
 */
function removeProduct(id: string): void {
    const filePath = resolve(PRODUCTS_DIR, `${id}.json`)
    if (existsSync(filePath)) {
        unlinkSync(filePath)
    }
}

/**
 * Load tags
 */
function loadTags(): TagsMap {
    const content = readFileSync(TAGS_FILE, 'utf-8')
    const tags = JSON.parse(content)
    const result = TagsMapSchema.safeParse(tags)
    if (!result.success) {
        console.error('❌ Tags validation failed:', result.error.format())
        process.exit(1)
    }
    return result.data
}

/**
 * Load categories
 */
function loadCategories(): Category[] {
    const content = readFileSync(CATEGORIES_FILE, 'utf-8')
    const categories = JSON.parse(content)
    const result = CategoriesArraySchema.safeParse(categories)
    if (!result.success) {
        console.error('❌ Categories validation failed:', result.error.format())
        process.exit(1)
    }
    return result.data.sort((a, b) => a.priority - b.priority)
}

/**
 * Validate a product against the schema
 */
function validateProduct(product: Product): { success: boolean; errors: string[] } {
    const result = ProductSchema.safeParse(product)
    if (result.success) {
        return { success: true, errors: [] }
    }

    const errors = result.error.issues.map((issue) => {
        const path = issue.path.join('.')
        return `  • ${path}: ${issue.message}`
    })

    return { success: false, errors }
}

/**
 * Check if a product is referenced by other products
 */
function checkCrossReferences(productId: string): ProductReference[] {
    const references: ProductReference[] = []
    const products = loadAllProducts()

    for (const product of products) {
        if (product.id === productId) continue

        if (product.crossSellIds?.includes(productId)) {
            references.push({
                productId: product.id,
                productName: product.name,
                referenceType: 'crossSell'
            })
        }
    }

    return references
}

/**
 * Convert string to kebab-case for ID generation
 */
function toKebabCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

/**
 * Prompt for input using readline
 */
function prompt(question: string): Promise<string> {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close()
            resolve(answer.trim())
        })
    })
}

/**
 * Prompt for confirmation
 */
async function confirm(message: string): Promise<boolean> {
    const answer = await prompt(`${message} [yes/no]: `)
    return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y'
}

// ============================================================================
// Inquirer Selection Functions
// ============================================================================

/**
 * Select main category using inquirer (single choice)
 */
async function selectMainCategory(current?: string): Promise<string> {
    const categories = loadCategories()

    const choices = categories.map((cat) => ({
        name: `${cat.name} (${cat.id})${cat.featured ? ' ★' : ''}`,
        value: cat.id
    }))

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'category',
            message: 'Select main category:',
            choices,
            default: current,
            pageSize: 15
        }
    ])

    return answer.category
}

/**
 * Select tags using inquirer (multi-select with validation)
 */
async function selectTags(current: string[] = []): Promise<string[]> {
    const tags = loadTags()
    const tagArray = Object.values(tags).sort((a, b) => a.priority - b.priority)

    const choices = tagArray.map((tag) => ({
        name: `${tag.name} (${tag.id})${tag.featured ? ' ★' : ''}`,
        value: tag.id,
        checked: current.includes(tag.id)
    }))

    const answer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'tags',
            message: 'Select tags (space to toggle, enter to confirm):',
            choices,
            pageSize: 20,
            validate: (input: string[]) => {
                if (input.length === 0) {
                    return 'Please select at least one tag'
                }
                return true
            }
        }
    ])

    return answer.tags
}

/**
 * Select secondary categories with distant flag (two-step process)
 */
async function selectSecondaryCategories(
    current: SecondaryCategory[] = []
): Promise<SecondaryCategory[]> {
    const categories = loadCategories()
    const currentIds = current.map((c) => c.id)

    // Step 1: Select which categories
    const choices = categories.map((cat) => ({
        name: `${cat.name} (${cat.id})${cat.featured ? ' ★' : ''}`,
        value: cat.id,
        checked: currentIds.includes(cat.id)
    }))

    const selectedAnswer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'categories',
            message: 'Select secondary categories (optional):',
            choices,
            pageSize: 15
        }
    ])

    if (selectedAnswer.categories.length === 0) {
        return []
    }

    // Step 2: Mark which ones are "distant"
    const distantChoices = selectedAnswer.categories.map((id: string) => {
        const existingItem = current.find((c) => c.id === id)
        const category = categories.find((c) => c.id === id)
        return {
            name: category?.name || id,
            value: id,
            checked: existingItem?.distant === true
        }
    })

    const distantAnswer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'distant',
            message: 'Mark which categories are "distant" (loosely related):',
            choices: distantChoices
        }
    ])

    return selectedAnswer.categories.map((id: string) => ({
        id,
        distant: distantAnswer.distant.includes(id)
    }))
}

/**
 * Select a product from list with enhanced display
 */
async function selectProduct(message: string): Promise<string> {
    const products = loadAllProducts()

    const choices = products.map((p) => {
        const statusEmoji = p.status === 'active' ? '✓' : p.status === 'coming-soon' ? '⏳' : '📦'
        const featuredMark = p.featured ? ' ★' : ''
        const price = p.priceDisplay || `€${p.price}`
        return {
            name: `${statusEmoji} ${p.name}${featuredMark} ${colors.dim}(${p.id} • ${price})${colors.reset}`,
            value: p.id,
            description: `${p.tagline} • ${p.mainCategory}`
        }
    })

    const answer = await select({
        message,
        choices,
        pageSize: 15
    })

    return answer
}

/**
 * Select price tier
 */
async function selectPriceTier(current?: string): Promise<string> {
    const choices = [
        { name: 'Free', value: 'free' },
        { name: 'Budget', value: 'budget' },
        { name: 'Standard', value: 'standard' },
        { name: 'Premium', value: 'premium' },
        { name: 'Enterprise', value: 'enterprise' },
        { name: 'Subscription', value: 'subscription' }
    ]

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'tier',
            message: 'Select price tier:',
            choices,
            default: current
        }
    ])

    return answer.tier
}

/**
 * Select status
 */
async function selectStatus(current?: string): Promise<string> {
    const choices = [
        { name: 'Active', value: 'active' },
        { name: 'Coming Soon', value: 'coming-soon' },
        { name: 'Archived', value: 'archived' }
    ]

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'status',
            message: 'Select status:',
            choices,
            default: current || 'active'
        }
    ])

    return answer.status
}

// ============================================================================
// Operation: List
// ============================================================================

async function operationList(args: CliArgs): Promise<void> {
    showOperationHeader('List Products')

    let products = loadAllProducts()

    // Apply filters (check both _filter and direct versions for compatibility)
    if (args.featured_filter) {
        products = products.filter((p) => p.featured === true)
        showInfo('Filter: Featured products only')
    }
    const statusFilter = args.status_filter || args.status
    if (statusFilter) {
        products = products.filter((p) => p.status === statusFilter)
        showInfo(`Filter: Status = ${statusFilter}`)
    }
    const categoryFilter = args.category_filter || (args as Record<string, unknown>).category
    if (typeof categoryFilter === 'string') {
        products = products.filter((p) => p.mainCategory === categoryFilter)
        showInfo(`Filter: Category = ${categoryFilter}`)
    }
    const tagFilter = args.tag_filter || (args as Record<string, unknown>).tag
    if (typeof tagFilter === 'string') {
        products = products.filter((p) => p.tags.includes(tagFilter as TagId))
        showInfo(`Filter: Tag = ${tagFilter}`)
    }

    const format = args.format || 'table'

    if (format === 'json') {
        console.log(JSON.stringify(products, null, 2))
        return
    }

    if (format === 'detailed') {
        console.log(`\n${colors.bright}📦 Products (${products.length} total)${colors.reset}\n`)
        for (const product of products) {
            console.log(
                `${colors.bright}ID:${colors.reset} ${colors.cyan}${product.id}${colors.reset}`
            )
            console.log(`${colors.bright}Name:${colors.reset} ${product.name}`)
            console.log(`${colors.bright}Tagline:${colors.reset} ${product.tagline}`)
            console.log(
                `${colors.bright}Price:${colors.reset} ${product.priceDisplay} ${colors.dim}(${product.priceTier})${colors.reset}`
            )
            console.log(`${colors.bright}Main Category:${colors.reset} ${product.mainCategory}`)
            console.log(`${colors.bright}Tags:${colors.reset} ${product.tags.join(', ')}`)
            console.log(`${colors.bright}Status:${colors.reset} ${product.status}`)
            console.log(`${colors.bright}Priority:${colors.reset} ${product.priority || 0}`)
            console.log(`${colors.bright}Featured:${colors.reset} ${product.featured ? '✓' : '✗'}`)
            console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
        }
        return
    }

    // Table format (default)
    console.log(`\n${colors.bright}📦 Products (${products.length} total)${colors.reset}\n`)
    console.log(
        `${colors.bright}${'ID'.padEnd(28)}${'Name'.padEnd(32)}${'Category'.padEnd(22)}${'Status'.padEnd(12)}${'Priority'.padEnd(10)}${'Featured'}${colors.reset}`
    )
    console.log(`${colors.dim}${'─'.repeat(120)}${colors.reset}`)

    for (const product of products) {
        const id = product.id.padEnd(28)
        const name = (
            product.name.length > 30 ? product.name.slice(0, 27) + '...' : product.name
        ).padEnd(32)
        const category = product.mainCategory.padEnd(22)
        const statusColor = product.status === 'active' ? colors.green : colors.yellow
        const status = `${statusColor}${product.status}${colors.reset}`.padEnd(
            12 + statusColor.length + colors.reset.length
        )
        const priority = String(product.priority || 0).padEnd(10)
        const featured = product.featured ? `${colors.yellow}★${colors.reset}` : ' '

        console.log(
            `${colors.cyan}${id}${colors.reset}${name}${category}${status}${priority}${featured}`
        )
    }
}

// ============================================================================
// Operation: Add
// ============================================================================

async function operationAdd(args: CliArgs): Promise<void> {
    showOperationHeader('Add Product', 'Create a new product')

    // Basic Information
    showSectionHeader('STEP 1/5: Basic Information')

    const name =
        args.name || (await prompt(`${colors.bright}Product Name${colors.reset} (required): `))
    if (!name) {
        showError('Product name is required')
        throw new Error('Product name is required')
    }

    const suggestedId = toKebabCase(name)
    const id =
        args.id ||
        (await prompt(
            `${colors.bright}Product ID${colors.reset} [${colors.cyan}${suggestedId}${colors.reset}]: `
        )) ||
        suggestedId

    // Check if ID already exists
    if (loadProduct(id)) {
        showError(`Product with ID "${id}" already exists`)
        throw new Error(`Product with ID "${id}" already exists`)
    }

    const tagline =
        args.tagline || (await prompt(`${colors.bright}Tagline${colors.reset} (required): `))
    if (!tagline) {
        showError('Tagline is required')
        throw new Error('Tagline is required')
    }

    const secondaryTagline =
        args.secondaryTagline ||
        (await prompt(`${colors.bright}Secondary Tagline${colors.reset} (optional): `)) ||
        undefined

    const permalink =
        args.permalink ||
        (await prompt(`${colors.bright}Permalink${colors.reset} (Gumroad code, required): `))
    if (!permalink) {
        showError('Permalink is required')
        throw new Error('Permalink is required')
    }

    // Pricing
    showSectionHeader('STEP 2/5: Pricing')

    const priceStr =
        args.price || (await prompt(`${colors.bright}Price in EUR${colors.reset} (required): `))
    const price = parseFloat(priceStr)
    if (isNaN(price)) {
        showError('Invalid price')
        throw new Error('Invalid price')
    }

    const priceDisplay =
        args.priceDisplay ||
        (await prompt(
            `${colors.bright}Price Display${colors.reset} [${colors.cyan}€${price.toFixed(2)}${colors.reset}]: `
        )) ||
        `€${price.toFixed(2)}`

    const priceTier = args.priceTier || (await selectPriceTier())

    const gumroadUrl =
        args.gumroadUrl ||
        (await prompt(`${colors.bright}Gumroad URL${colors.reset} (required): `)) ||
        `https://store.dsebastien.net/l/${permalink}`

    // Taxonomy
    showSectionHeader('STEP 3/5: Taxonomy')

    const mainCategory = args.mainCategory || (await selectMainCategory())

    const tags = args.tags ? args.tags.split(',').map((t) => t.trim()) : await selectTags()

    const secondaryCategories = args.secondaryCategories
        ? parseSecondaryCategories(args.secondaryCategories)
        : await selectSecondaryCategories()

    // Marketing Copy
    showSectionHeader('STEP 4/5: Marketing Copy')

    const problem =
        args.problem ||
        (await prompt(`${colors.bright}Problem Description${colors.reset} (required): `))
    if (!problem) {
        showError('Problem description is required')
        throw new Error('Problem description is required')
    }

    const agitate =
        args.agitate ||
        (await prompt(`${colors.bright}Agitation Description${colors.reset} (required): `))
    if (!agitate) {
        showError('Agitation description is required')
        throw new Error('Agitation description is required')
    }

    const solution =
        args.solution ||
        (await prompt(`${colors.bright}Solution Description${colors.reset} (required): `))
    if (!solution) {
        showError('Solution description is required')
        throw new Error('Solution description is required')
    }

    // Status and Priority
    const status = args.status || (await selectStatus())
    const priorityStr =
        args.priority ||
        (await prompt(`${colors.bright}Priority${colors.reset} (0-100, default 50): `)) ||
        '50'
    const priority = parseInt(priorityStr)

    const featuredStr =
        args.featured ||
        (await prompt(`${colors.bright}Featured?${colors.reset} [yes/no, default no]: `)) ||
        'no'
    const featured = featuredStr.toLowerCase() === 'yes' || featuredStr.toLowerCase() === 'true'

    // Review & Confirm
    showSectionHeader('STEP 5/5: Review')
    console.log(`${colors.bright}${colors.blue}📊 New Product Summary:${colors.reset}`)
    console.log(`   ${colors.bright}ID:${colors.reset} ${colors.cyan}${id}${colors.reset}`)
    console.log(`   ${colors.bright}Name:${colors.reset} ${name}`)
    console.log(`   ${colors.bright}Tagline:${colors.reset} ${tagline}`)
    console.log(
        `   ${colors.bright}Price:${colors.reset} ${priceDisplay} ${colors.dim}(${priceTier})${colors.reset}`
    )
    console.log(`   ${colors.bright}Main Category:${colors.reset} ${mainCategory}`)
    console.log(
        `   ${colors.bright}Secondary Categories:${colors.reset} ${secondaryCategories.length}`
    )
    console.log(
        `   ${colors.bright}Tags:${colors.reset} ${tags.length} ${colors.dim}(${tags.join(', ')})${colors.reset}`
    )
    console.log(`   ${colors.bright}Status:${colors.reset} ${status}`)
    console.log(`   ${colors.bright}Priority:${colors.reset} ${priority}`)
    console.log(`   ${colors.bright}Featured:${colors.reset} ${featured}`)
    console.log()

    const confirmed = await confirm(`${colors.yellow}Confirm and save?${colors.reset}`)
    if (!confirmed) {
        showWarning('Operation cancelled')
        throw new Error('Operation cancelled by user')
    }

    // Validate enum types
    const validatedPriceTier = PriceTierSchema.parse(priceTier)
    const validatedMainCategory = ProductCategorySchema.parse(mainCategory)
    const validatedTags = tags.map((tag) => TagIdSchema.parse(tag))
    const validatedStatus = ProductStatusSchema.parse(status)
    const validatedSecondaryCategories: SecondaryCategory[] = secondaryCategories.map((cat) => ({
        id: ProductCategorySchema.parse(cat.id),
        distant: cat.distant
    }))

    // Create minimal product
    const product: Product = {
        id,
        permalink,
        name,
        tagline,
        secondaryTagline,
        price,
        priceDisplay,
        priceTier: validatedPriceTier,
        gumroadUrl,
        mainCategory: validatedMainCategory,
        secondaryCategories: validatedSecondaryCategories,
        tags: validatedTags,
        problem,
        problemPoints: [],
        agitate,
        agitatePoints: [],
        solution,
        solutionPoints: [],
        description: '',
        features: [],
        benefits: [],
        included: [],
        targetAudience: [],
        perfectFor: [],
        notForYou: [],
        faqIds: [],
        testimonialIds: [],
        crossSellIds: [],
        featured,
        mostValue: false,
        bestseller: false,
        status: validatedStatus,
        priority,
        trustBadges: [],
        guarantees: []
    }

    // Validate
    const validation = validateProduct(product)
    if (!validation.success) {
        showError('Product validation failed:')
        validation.errors.forEach((err) => console.error(`  ${err}`))
        throw new Error('Product validation failed')
    }

    // Save
    saveProduct(product)
    showSuccess(`Product created at: src/data/products/${id}.json`)
    console.log(`\n${colors.bright}${colors.cyan}📋 Next steps:${colors.reset}`)
    console.log(
        `  ${colors.dim}1.${colors.reset} Run: ${colors.green}npm run validate:products${colors.reset}`
    )
    console.log(
        `  ${colors.dim}2.${colors.reset} Add marketing copy details by editing the file directly`
    )
    console.log(`  ${colors.dim}3.${colors.reset} Add media (coverImage, screenshots, videoUrl)`)
    console.log(
        `  ${colors.dim}4.${colors.reset} Test locally: ${colors.green}npm run dev${colors.reset}`
    )
}

/**
 * Parse secondary categories from CLI format "id:distant,id:distant"
 */
function parseSecondaryCategories(input: string): SecondaryCategory[] {
    return input
        .split(',')
        .map((pair) => {
            const [id, distantStr] = pair.split(':')
            return {
                id: id.trim(),
                distant: distantStr?.trim() === 'true'
            }
        })
        .filter((cat) => cat.id)
}

// ============================================================================
// Operation: Edit
// ============================================================================

async function operationEdit(args: CliArgs): Promise<void> {
    showOperationHeader('Edit Product', 'Modify an existing product')

    const productId = args.id || (await selectProduct('Select product to edit:'))
    const originalProduct = loadProduct(productId)

    if (!originalProduct) {
        showError(`Product not found: ${productId}`)
        throw new Error(`Product not found: ${productId}`)
    }

    // Create a working copy
    const product = JSON.parse(JSON.stringify(originalProduct)) as Product
    clearChanges()

    console.log(
        `\n${colors.bright}${colors.blue}Editing:${colors.reset} ${product.name} ${colors.dim}(${product.id})${colors.reset}`
    )

    // Apply CLI argument updates
    if (args.name) {
        trackChange('name', product.name, args.name)
        product.name = args.name
    }
    if (args.tagline) {
        trackChange('tagline', product.tagline, args.tagline)
        product.tagline = args.tagline
    }
    if (args.secondaryTagline !== undefined) {
        trackChange('secondaryTagline', product.secondaryTagline, args.secondaryTagline)
        product.secondaryTagline = args.secondaryTagline || undefined
    }
    if (args.price) {
        const newPrice = parseFloat(args.price)
        trackChange('price', product.price, newPrice)
        product.price = newPrice
    }
    if (args.priceDisplay) {
        trackChange('priceDisplay', product.priceDisplay, args.priceDisplay)
        product.priceDisplay = args.priceDisplay
    }
    if (args.priceTier) {
        const newTier = PriceTierSchema.parse(args.priceTier)
        trackChange('priceTier', product.priceTier, newTier)
        product.priceTier = newTier
    }
    if (args.permalink) {
        trackChange('permalink', product.permalink, args.permalink)
        product.permalink = args.permalink
    }
    if (args.gumroadUrl) {
        trackChange('gumroadUrl', product.gumroadUrl, args.gumroadUrl)
        product.gumroadUrl = args.gumroadUrl
    }
    if (args.mainCategory) {
        const newCategory = ProductCategorySchema.parse(args.mainCategory)
        trackChange('mainCategory', product.mainCategory, newCategory)
        product.mainCategory = newCategory
    }
    if (args.tags) {
        const tagArray = args.tags.split(',').map((t) => t.trim())
        const newTags = tagArray.map((tag) => TagIdSchema.parse(tag))
        trackChange('tags', product.tags, newTags)
        product.tags = newTags
    }
    if (args.secondaryCategories) {
        const parsedCategories = parseSecondaryCategories(args.secondaryCategories)
        const newSecondaryCategories = parsedCategories.map((cat) => ({
            id: ProductCategorySchema.parse(cat.id),
            distant: cat.distant
        }))
        trackChange('secondaryCategories', product.secondaryCategories, newSecondaryCategories)
        product.secondaryCategories = newSecondaryCategories
    }
    if (args.featured !== undefined) {
        const newFeatured = args.featured === 'true'
        trackChange('featured', product.featured, newFeatured)
        product.featured = newFeatured
    }
    if (args.priority) {
        const newPriority = parseInt(args.priority)
        trackChange('priority', product.priority, newPriority)
        product.priority = newPriority
    }
    if (args.status) {
        const newStatus = ProductStatusSchema.parse(args.status)
        trackChange('status', product.status, newStatus)
        product.status = newStatus
    }
    if (args.problem) {
        trackChange('problem', product.problem, args.problem)
        product.problem = args.problem
    }
    if (args.agitate) {
        trackChange('agitate', product.agitate, args.agitate)
        product.agitate = args.agitate
    }
    if (args.solution) {
        trackChange('solution', product.solution, args.solution)
        product.solution = args.solution
    }

    // If no CLI args, use interactive mode with enhanced menu
    if (!hasAnyEditArgs(args)) {
        let editing = true

        while (editing) {
            console.clear()
            showOperationHeader('Edit Product', 'Multi-field editor')
            showProductDetails(product)

            if (changes.length > 0) {
                showChanges()
            }

            const action = await select({
                message: 'What would you like to do?',
                choices: [
                    { name: '📝 Edit Basic Info', value: 'basic' },
                    { name: '💰 Edit Pricing', value: 'pricing' },
                    { name: '🏷️ Edit Taxonomy', value: 'taxonomy' },
                    { name: '⚙️ Edit Meta/Status', value: 'meta' },
                    { name: '🔍 View Current Details', value: 'view' },
                    { name: '📊 View Changes Summary', value: 'changes' },
                    { name: '💾 Save and Exit', value: 'save' },
                    { name: '❌ Cancel (Discard Changes)', value: 'cancel' }
                ],
                pageSize: 12
            })

            switch (action) {
                case 'basic':
                    await editBasicInfo(product)
                    break
                case 'pricing':
                    await editPricing(product)
                    break
                case 'taxonomy':
                    await editTaxonomy(product)
                    break
                case 'meta':
                    await editMeta(product)
                    break
                case 'view':
                    showProductDetails(product)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                case 'changes':
                    showChanges()
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                case 'save':
                    editing = false
                    break
                case 'cancel': {
                    const confirmCancel = await confirm(
                        `${colors.red}Discard all changes?${colors.reset}`
                    )
                    if (confirmCancel) {
                        showWarning('Changes discarded')
                        throw new Error('Edit cancelled by user')
                    }
                    break
                }
            }
        }
    }

    // Show final summary of changes
    if (changes.length > 0) {
        console.clear()
        showOperationHeader('Save Changes', 'Review and confirm')
        showChanges()

        const confirmSave = await confirm(`${colors.yellow}Save these changes?${colors.reset}`)
        if (!confirmSave) {
            showWarning('Changes discarded')
            throw new Error('Save cancelled by user')
        }
    } else if (!hasAnyEditArgs(args)) {
        showInfo('No changes made')
        return
    }

    // Validate
    const validation = validateProduct(product)
    if (!validation.success) {
        showError('Product validation failed:')
        validation.errors.forEach((err) => console.error(`  ${err}`))
        throw new Error('Product validation failed')
    }

    // Save
    saveProduct(product)
    clearChanges()
    showSuccess(`Product updated: src/data/products/${product.id}.json`)

    const runValidation = await confirm(`${colors.cyan}Run validation?${colors.reset}`)
    if (runValidation) {
        console.log(`\n${colors.bright}${colors.blue}→ Running validation...${colors.reset}\n`)
        const { spawnSync } = await import('child_process')
        const result = spawnSync('npm', ['run', 'validate:products'], { stdio: 'inherit' })
        if (result.status !== 0) {
            throw new Error('Validation failed')
        }
    }
}

/**
 * Edit basic information
 */
async function editBasicInfo(product: Product): Promise<void> {
    const field = await select({
        message: 'Which field do you want to edit?',
        choices: [
            {
                name: `Name: ${colors.cyan}${product.name}${colors.reset}`,
                value: 'name'
            },
            {
                name: `Tagline: ${colors.cyan}${product.tagline}${colors.reset}`,
                value: 'tagline'
            },
            {
                name: `Secondary Tagline: ${colors.cyan}${product.secondaryTagline || '(none)'}${colors.reset}`,
                value: 'secondaryTagline'
            },
            {
                name: `Permalink: ${colors.cyan}${product.permalink}${colors.reset}`,
                value: 'permalink'
            },
            { name: '← Back', value: 'back' }
        ]
    })

    if (field === 'back') return

    switch (field) {
        case 'name': {
            const oldValue = product.name
            const newValue = await prompt(
                `${colors.bright}Name${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (newValue && newValue !== oldValue) {
                trackChange('name', oldValue, newValue)
                product.name = newValue
                showSuccess('Name updated')
            }
            break
        }
        case 'tagline': {
            const oldValue = product.tagline
            const newValue = await prompt(
                `${colors.bright}Tagline${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (newValue && newValue !== oldValue) {
                trackChange('tagline', oldValue, newValue)
                product.tagline = newValue
                showSuccess('Tagline updated')
            }
            break
        }
        case 'secondaryTagline': {
            const oldValue = product.secondaryTagline
            const newValue = await prompt(
                `${colors.bright}Secondary Tagline${colors.reset} [${colors.cyan}${oldValue || '(none)'}${colors.reset}]: `
            )
            if (newValue !== oldValue) {
                trackChange('secondaryTagline', oldValue, newValue || undefined)
                product.secondaryTagline = newValue || undefined
                showSuccess('Secondary tagline updated')
            }
            break
        }
        case 'permalink': {
            const oldValue = product.permalink
            const newValue = await prompt(
                `${colors.bright}Permalink${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (newValue && newValue !== oldValue) {
                trackChange('permalink', oldValue, newValue)
                product.permalink = newValue
                showSuccess('Permalink updated')
            }
            break
        }
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Edit pricing information
 */
async function editPricing(product: Product): Promise<void> {
    const field = await select({
        message: 'Which field do you want to edit?',
        choices: [
            {
                name: `Price: ${colors.cyan}€${product.price}${colors.reset}`,
                value: 'price'
            },
            {
                name: `Price Display: ${colors.cyan}${product.priceDisplay}${colors.reset}`,
                value: 'priceDisplay'
            },
            {
                name: `Price Tier: ${colors.cyan}${product.priceTier}${colors.reset}`,
                value: 'priceTier'
            },
            {
                name: `Gumroad URL: ${colors.cyan}${product.gumroadUrl}${colors.reset}`,
                value: 'gumroadUrl'
            },
            { name: '← Back', value: 'back' }
        ]
    })

    if (field === 'back') return

    switch (field) {
        case 'price': {
            const oldValue = product.price
            const input = await prompt(
                `${colors.bright}Price (EUR)${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (input) {
                const newValue = parseFloat(input)
                if (!isNaN(newValue) && newValue !== oldValue) {
                    trackChange('price', oldValue, newValue)
                    product.price = newValue
                    showSuccess('Price updated')
                }
            }
            break
        }
        case 'priceDisplay': {
            const oldValue = product.priceDisplay
            const newValue = await prompt(
                `${colors.bright}Price Display${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (newValue && newValue !== oldValue) {
                trackChange('priceDisplay', oldValue, newValue)
                product.priceDisplay = newValue
                showSuccess('Price display updated')
            }
            break
        }
        case 'priceTier': {
            const oldValue = product.priceTier
            const newValue = await selectPriceTier(oldValue)
            if (newValue !== oldValue) {
                trackChange('priceTier', oldValue, newValue)
                product.priceTier = PriceTierSchema.parse(newValue)
                showSuccess('Price tier updated')
            }
            break
        }
        case 'gumroadUrl': {
            const oldValue = product.gumroadUrl
            const newValue = await prompt(
                `${colors.bright}Gumroad URL${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (newValue && newValue !== oldValue) {
                trackChange('gumroadUrl', oldValue, newValue)
                product.gumroadUrl = newValue
                showSuccess('Gumroad URL updated')
            }
            break
        }
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Edit taxonomy (categories and tags)
 */
async function editTaxonomy(product: Product): Promise<void> {
    const field = await select({
        message: 'Which field do you want to edit?',
        choices: [
            {
                name: `Main Category: ${colors.cyan}${product.mainCategory}${colors.reset}`,
                value: 'mainCategory'
            },
            {
                name: `Tags: ${colors.cyan}${product.tags.length} tags${colors.reset} ${colors.dim}(${product.tags.join(', ')})${colors.reset}`,
                value: 'tags'
            },
            {
                name: `Secondary Categories: ${colors.cyan}${product.secondaryCategories.length} categories${colors.reset}`,
                value: 'secondaryCategories'
            },
            { name: '← Back', value: 'back' }
        ]
    })

    if (field === 'back') return

    switch (field) {
        case 'mainCategory': {
            const oldValue = product.mainCategory
            const newValue = await selectMainCategory(oldValue)
            if (newValue !== oldValue) {
                trackChange('mainCategory', oldValue, newValue)
                product.mainCategory = ProductCategorySchema.parse(newValue)
                showSuccess('Main category updated')
            }
            break
        }
        case 'tags': {
            const oldValue = product.tags
            const newValue = await selectTags(oldValue)
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                trackChange('tags', oldValue, newValue)
                product.tags = newValue.map((tag) => TagIdSchema.parse(tag))
                showSuccess('Tags updated')
            }
            break
        }
        case 'secondaryCategories': {
            const oldValue = product.secondaryCategories
            const newValue = await selectSecondaryCategories(oldValue)
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                trackChange('secondaryCategories', oldValue, newValue)
                product.secondaryCategories = newValue.map((cat) => ({
                    id: ProductCategorySchema.parse(cat.id),
                    distant: cat.distant
                }))
                showSuccess('Secondary categories updated')
            }
            break
        }
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Edit meta/status information
 */
async function editMeta(product: Product): Promise<void> {
    const field = await select({
        message: 'Which field do you want to edit?',
        choices: [
            {
                name: `Status: ${colors.cyan}${product.status}${colors.reset}`,
                value: 'status'
            },
            {
                name: `Priority: ${colors.cyan}${product.priority || 0}${colors.reset}`,
                value: 'priority'
            },
            {
                name: `Featured: ${product.featured ? `${colors.yellow}Yes ★${colors.reset}` : `${colors.dim}No${colors.reset}`}`,
                value: 'featured'
            },
            {
                name: `Most Value: ${product.mostValue ? `${colors.green}Yes${colors.reset}` : `${colors.dim}No${colors.reset}`}`,
                value: 'mostValue'
            },
            {
                name: `Bestseller: ${product.bestseller ? `${colors.green}Yes${colors.reset}` : `${colors.dim}No${colors.reset}`}`,
                value: 'bestseller'
            },
            { name: '← Back', value: 'back' }
        ]
    })

    if (field === 'back') return

    switch (field) {
        case 'status': {
            const oldValue = product.status
            const newValue = await selectStatus(oldValue)
            if (newValue !== oldValue) {
                trackChange('status', oldValue, newValue)
                product.status = ProductStatusSchema.parse(newValue)
                showSuccess('Status updated')
            }
            break
        }
        case 'priority': {
            const oldValue = product.priority || 0
            const input = await prompt(
                `${colors.bright}Priority (0-100)${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (input) {
                const newValue = parseInt(input)
                if (!isNaN(newValue) && newValue !== oldValue) {
                    trackChange('priority', oldValue, newValue)
                    product.priority = newValue
                    showSuccess('Priority updated')
                }
            }
            break
        }
        case 'featured': {
            const oldValue = product.featured
            const newValue = await confirm(
                `${colors.bright}Featured?${colors.reset} [current: ${oldValue ? 'yes' : 'no'}]`
            )
            if (newValue !== oldValue) {
                trackChange('featured', oldValue, newValue)
                product.featured = newValue
                showSuccess('Featured status updated')
            }
            break
        }
        case 'mostValue': {
            const oldValue = product.mostValue
            const newValue = await confirm(
                `${colors.bright}Most Value?${colors.reset} [current: ${oldValue ? 'yes' : 'no'}]`
            )
            if (newValue !== oldValue) {
                trackChange('mostValue', oldValue, newValue)
                product.mostValue = newValue
                showSuccess('Most Value status updated')
            }
            break
        }
        case 'bestseller': {
            const oldValue = product.bestseller
            const newValue = await confirm(
                `${colors.bright}Bestseller?${colors.reset} [current: ${oldValue ? 'yes' : 'no'}]`
            )
            if (newValue !== oldValue) {
                trackChange('bestseller', oldValue, newValue)
                product.bestseller = newValue
                showSuccess('Bestseller status updated')
            }
            break
        }
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Check if any edit arguments are provided
 */
function hasAnyEditArgs(args: CliArgs): boolean {
    return !!(
        args.name ||
        args.tagline ||
        args.price ||
        args.priceDisplay ||
        args.priceTier ||
        args.mainCategory ||
        args.tags ||
        args.secondaryCategories ||
        args.featured ||
        args.priority ||
        args.status ||
        args.problem ||
        args.agitate ||
        args.solution
    )
}

// ============================================================================
// Operation: Remove
// ============================================================================

async function operationRemove(args: CliArgs): Promise<void> {
    showOperationHeader('Remove Product', 'Delete a product')

    const productId = args.id || (await selectProduct('Select product to remove:'))
    const product = loadProduct(productId)

    if (!product) {
        showError(`Product not found: ${productId}`)
        throw new Error(`Product not found: ${productId}`)
    }

    console.log(`\n${colors.bright}${colors.red}Product to remove:${colors.reset}`)
    console.log(`  ${colors.bright}ID:${colors.reset} ${colors.cyan}${product.id}${colors.reset}`)
    console.log(`  ${colors.bright}Name:${colors.reset} ${product.name}`)
    console.log(`  ${colors.bright}Status:${colors.reset} ${product.status}`)
    console.log(
        `  ${colors.bright}File:${colors.reset} ${colors.dim}src/data/products/${product.id}.json${colors.reset}`
    )

    // Check cross-references
    showWarning('Checking cross-references...')
    const references = checkCrossReferences(product.id)

    if (references.length > 0) {
        console.log(`\n${colors.bright}Found references:${colors.reset}`)
        console.log(
            `  ${colors.yellow}Cross-sell references (${references.length} products reference this):${colors.reset}`
        )
        references.forEach((ref) => {
            console.log(
                `    ${colors.dim}•${colors.reset} ${ref.productId} ${colors.dim}(${ref.productName})${colors.reset}`
            )
        })

        if (!args.force) {
            showError('Cannot remove product that is referenced in crossSellIds of other products.')
            console.log(
                `   ${colors.dim}Update those products first, or use --force flag.${colors.reset}`
            )
            throw new Error('Product is referenced by other products')
        } else {
            showWarning('Forcing removal despite references...')
        }
    }

    const confirmed = await confirm(`${colors.red}Confirm removal?${colors.reset}`)
    if (!confirmed) {
        showWarning('Operation cancelled')
        throw new Error('Operation cancelled by user')
    }

    removeProduct(product.id)
    showSuccess(`Product removed: src/data/products/${product.id}.json`)
    showWarning('IMPORTANT: Run validation to check for broken references:')
    console.log(`   ${colors.green}npm run validate:products${colors.reset}`)
}

// ============================================================================
// Main
// ============================================================================

/**
 * Main menu loop
 */
async function mainMenu(): Promise<void> {
    while (true) {
        showBanner()

        const operation = await select({
            message: 'What would you like to do?',
            choices: [
                { name: '📋 List products', value: 'list' },
                { name: '➕ Add new product', value: 'add' },
                { name: '✏️ Edit existing product', value: 'edit' },
                { name: '🗑️ Remove product', value: 'remove' },
                { name: '👋 Exit', value: 'exit' }
            ],
            pageSize: 10
        })

        if (operation === 'exit') {
            console.log(
                `\n${colors.bright}${colors.cyan}Thanks for using Product Management CLI! 👋${colors.reset}\n`
            )
            process.exit(0)
        }

        // Execute the selected operation
        try {
            const args: CliArgs = { operation: operation as 'list' | 'add' | 'edit' | 'remove' }

            switch (operation) {
                case 'list':
                    await operationList(args)
                    break
                case 'add':
                    await operationAdd(args)
                    break
                case 'edit':
                    await operationEdit(args)
                    break
                case 'remove':
                    await operationRemove(args)
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
                console.log(
                    `\n${colors.bright}${colors.cyan}Thanks for using Product Management CLI! 👋${colors.reset}\n`
                )
                process.exit(0)
            }
        } catch (error) {
            // Handle errors gracefully
            if (error instanceof Error && error.message.includes('cancelled')) {
                showInfo('Operation cancelled')
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

/**
 * Main entry point
 */
async function main() {
    const args = parseArgs()

    // If CLI arguments provided, run in CLI mode (no menu loop)
    if (args.operation) {
        try {
            switch (args.operation) {
                case 'list':
                    await operationList(args)
                    break
                case 'add':
                    await operationAdd(args)
                    break
                case 'edit':
                    await operationEdit(args)
                    break
                case 'remove':
                    await operationRemove(args)
                    break
                default:
                    showError('Invalid operation. Use: list, add, edit, or remove')
                    process.exit(1)
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    } else {
        // No CLI arguments - start interactive menu
        try {
            await mainMenu()
        } catch (error) {
            // Handle Ctrl+C gracefully
            if (error && typeof error === 'object' && 'name' in error) {
                if (error.name === 'ExitPromptError') {
                    console.log(
                        `\n${colors.bright}${colors.cyan}Thanks for using Product Management CLI! 👋${colors.reset}\n`
                    )
                    process.exit(0)
                }
            }
            showError(error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    }
}

main()
