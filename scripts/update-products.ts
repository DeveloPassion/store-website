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
import { resolve, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'
import inquirer from 'inquirer'
import { ProductSchema } from '../src/schemas/product.schema.js'
import { TagsMapSchema } from '../src/schemas/tag.schema.js'
import { CategoriesArraySchema } from '../src/schemas/category.schema.js'
import type { Product, SecondaryCategory } from '../src/types/product'
import type { TagsMap, Tag } from '../src/types/tag'
import type { Category } from '../src/types/category'

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
            const key = arg.slice(2)
            ;(args as any)[key] = nextArg
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
    const files = readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith('.json'))

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
 * Select a product from list
 */
async function selectProduct(message: string): Promise<string> {
    const products = loadAllProducts()

    const choices = products.map((p) => ({
        name: `${p.name} (${p.id})${p.featured ? ' ★' : ''}`,
        value: p.id
    }))

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'product',
            message,
            choices,
            pageSize: 15
        }
    ])

    return answer.product
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
    let products = loadAllProducts()

    // Apply filters (check both _filter and direct versions for compatibility)
    if (args.featured_filter) {
        products = products.filter((p) => p.featured === true)
    }
    const statusFilter = args.status_filter || (args as any).status
    if (statusFilter) {
        products = products.filter((p) => p.status === statusFilter)
    }
    const categoryFilter = args.category_filter || (args as any).category
    if (categoryFilter) {
        products = products.filter((p) => p.mainCategory === categoryFilter)
    }
    const tagFilter = args.tag_filter || (args as any).tag
    if (tagFilter) {
        products = products.filter((p) => p.tags.includes(tagFilter as any))
    }

    const format = args.format || 'table'

    if (format === 'json') {
        console.log(JSON.stringify(products, null, 2))
        return
    }

    if (format === 'detailed') {
        console.log(`\n📦 Products (${products.length} total)\n`)
        for (const product of products) {
            console.log(`ID: ${product.id}`)
            console.log(`Name: ${product.name}`)
            console.log(`Tagline: ${product.tagline}`)
            console.log(`Price: ${product.priceDisplay} (${product.priceTier})`)
            console.log(`Main Category: ${product.mainCategory}`)
            console.log(`Tags: ${product.tags.join(', ')}`)
            console.log(`Status: ${product.status}`)
            console.log(`Priority: ${product.priority || 0}`)
            console.log(`Featured: ${product.featured ? '✓' : '✗'}`)
            console.log('─'.repeat(80))
        }
        return
    }

    // Table format (default)
    console.log(`\n📦 Products (${products.length} total)\n`)
    console.log(
        'ID'.padEnd(28) +
            'Name'.padEnd(32) +
            'Category'.padEnd(22) +
            'Status'.padEnd(12) +
            'Priority'.padEnd(10) +
            'Featured'
    )
    console.log('─'.repeat(120))

    for (const product of products) {
        const id = product.id.padEnd(28)
        const name = (
            product.name.length > 30 ? product.name.slice(0, 27) + '...' : product.name
        ).padEnd(32)
        const category = product.mainCategory.padEnd(22)
        const status = product.status.padEnd(12)
        const priority = String(product.priority || 0).padEnd(10)
        const featured = product.featured ? '✓' : ''

        console.log(id + name + category + status + priority + featured)
    }
}

// ============================================================================
// Operation: Add
// ============================================================================

async function operationAdd(args: CliArgs): Promise<void> {
    console.log('\n📦 Product Management Tool - Add Operation\n')

    // Basic Information
    console.log('=== STEP 1/5: Basic Information ===\n')

    const name = args.name || (await prompt('Product Name (required): '))
    if (!name) {
        console.error('❌ Product name is required')
        process.exit(1)
    }

    const suggestedId = toKebabCase(name)
    const id = args.id || (await prompt(`Product ID [${suggestedId}]: `)) || suggestedId

    // Check if ID already exists
    if (loadProduct(id)) {
        console.error(`❌ Product with ID "${id}" already exists`)
        process.exit(1)
    }

    const tagline = args.tagline || (await prompt('Tagline (required): '))
    if (!tagline) {
        console.error('❌ Tagline is required')
        process.exit(1)
    }

    const secondaryTagline =
        args.secondaryTagline || (await prompt('Secondary Tagline (optional): ')) || undefined

    const permalink = args.permalink || (await prompt('Permalink (Gumroad code, required): '))
    if (!permalink) {
        console.error('❌ Permalink is required')
        process.exit(1)
    }

    // Pricing
    console.log('\n=== STEP 2/5: Pricing ===\n')

    const priceStr = args.price || (await prompt('Price in EUR (required): '))
    const price = parseFloat(priceStr)
    if (isNaN(price)) {
        console.error('❌ Invalid price')
        process.exit(1)
    }

    const priceDisplay =
        args.priceDisplay ||
        (await prompt(`Price Display [€${price.toFixed(2)}]: `)) ||
        `€${price.toFixed(2)}`

    const priceTier = args.priceTier || (await selectPriceTier())

    const gumroadUrl =
        args.gumroadUrl ||
        (await prompt('Gumroad URL (required): ')) ||
        `https://store.dsebastien.net/l/${permalink}`

    // Taxonomy
    console.log('\n=== STEP 3/5: Taxonomy ===\n')

    const mainCategory = args.mainCategory || (await selectMainCategory())

    const tags = args.tags ? args.tags.split(',').map((t) => t.trim()) : await selectTags()

    const secondaryCategories = args.secondaryCategories
        ? parseSecondaryCategories(args.secondaryCategories)
        : await selectSecondaryCategories()

    // Marketing Copy
    console.log('\n=== STEP 4/5: Marketing Copy ===\n')

    const problem = args.problem || (await prompt('Problem Description (required): '))
    if (!problem) {
        console.error('❌ Problem description is required')
        process.exit(1)
    }

    const agitate = args.agitate || (await prompt('Agitation Description (required): '))
    if (!agitate) {
        console.error('❌ Agitation description is required')
        process.exit(1)
    }

    const solution = args.solution || (await prompt('Solution Description (required): '))
    if (!solution) {
        console.error('❌ Solution description is required')
        process.exit(1)
    }

    // Status and Priority
    const status = args.status || (await selectStatus())
    const priorityStr = args.priority || (await prompt('Priority (0-100, default 50): ')) || '50'
    const priority = parseInt(priorityStr)

    const featuredStr = args.featured || (await prompt('Featured? [yes/no, default no]: ')) || 'no'
    const featured = featuredStr.toLowerCase() === 'yes' || featuredStr.toLowerCase() === 'true'

    // Review & Confirm
    console.log('\n=== STEP 5/5: Review ===\n')
    console.log('📊 New Product Summary:')
    console.log(`   ID: ${id}`)
    console.log(`   Name: ${name}`)
    console.log(`   Tagline: ${tagline}`)
    console.log(`   Price: ${priceDisplay} (${priceTier})`)
    console.log(`   Main Category: ${mainCategory}`)
    console.log(`   Secondary Categories: ${secondaryCategories.length}`)
    console.log(`   Tags: ${tags.length} (${tags.join(', ')})`)
    console.log(`   Status: ${status}`)
    console.log(`   Priority: ${priority}`)
    console.log(`   Featured: ${featured}`)
    console.log()

    const confirmed = await confirm('Confirm and save?')
    if (!confirmed) {
        console.log('❌ Operation cancelled')
        process.exit(0)
    }

    // Create minimal product
    const product: Product = {
        id,
        permalink,
        name,
        tagline,
        secondaryTagline,
        price,
        priceDisplay,
        priceTier: priceTier as any,
        gumroadUrl,
        mainCategory: mainCategory as any,
        secondaryCategories: secondaryCategories as any[],
        tags: tags as any[],
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
        status: status as any,
        priority,
        trustBadges: [],
        guarantees: []
    }

    // Validate
    const validation = validateProduct(product)
    if (!validation.success) {
        console.error('❌ Product validation failed:')
        validation.errors.forEach((err) => console.error(err))
        process.exit(1)
    }

    // Save
    saveProduct(product)
    console.log(`\n✅ Product created at: src/data/products/${id}.json`)
    console.log('\nNext steps:')
    console.log('  1. Run: npm run validate:products')
    console.log('  2. Add marketing copy details by editing the file directly')
    console.log('  3. Add media (coverImage, screenshots, videoUrl)')
    console.log('  4. Test locally: npm run dev')
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
    console.log('\n📦 Product Management Tool - Edit Operation\n')

    const productId = args.id || (await selectProduct('Select product to edit:'))
    const product = loadProduct(productId)

    if (!product) {
        console.error(`❌ Product not found: ${productId}`)
        process.exit(1)
    }

    console.log(`\nEditing: ${product.name} (${product.id})\n`)

    // Apply CLI argument updates
    if (args.name) product.name = args.name
    if (args.tagline) product.tagline = args.tagline
    if (args.secondaryTagline !== undefined)
        product.secondaryTagline = args.secondaryTagline || undefined
    if (args.price) product.price = parseFloat(args.price)
    if (args.priceDisplay) product.priceDisplay = args.priceDisplay
    if (args.priceTier) product.priceTier = args.priceTier as any
    if (args.permalink) product.permalink = args.permalink
    if (args.gumroadUrl) product.gumroadUrl = args.gumroadUrl
    if (args.mainCategory) product.mainCategory = args.mainCategory as any
    if (args.tags) product.tags = args.tags.split(',').map((t) => t.trim()) as any[]
    if (args.secondaryCategories)
        product.secondaryCategories = parseSecondaryCategories(args.secondaryCategories) as any[]
    if (args.featured !== undefined) product.featured = args.featured === 'true'
    if (args.priority) product.priority = parseInt(args.priority)
    if (args.status) product.status = args.status as any
    if (args.problem) product.problem = args.problem
    if (args.agitate) product.agitate = args.agitate
    if (args.solution) product.solution = args.solution

    // If no CLI args, use interactive mode
    if (!hasAnyEditArgs(args)) {
        const editChoice = await inquirer.prompt([
            {
                type: 'list',
                name: 'section',
                message: 'What would you like to edit?',
                choices: [
                    { name: '1. Basic info (name, tagline)', value: 'basic' },
                    { name: '2. Pricing', value: 'pricing' },
                    { name: '3. Taxonomy (categories, tags)', value: 'taxonomy' },
                    { name: '4. Meta/Status (featured, priority, status)', value: 'meta' },
                    { name: '5. Save and exit', value: 'save' }
                ]
            }
        ])

        switch (editChoice.section) {
            case 'basic':
                product.name = (await prompt(`Name [${product.name}]: `)) || product.name
                product.tagline =
                    (await prompt(`Tagline [${product.tagline}]: `)) || product.tagline
                break

            case 'pricing':
                const newPrice = await prompt(`Price [${product.price}]: `)
                if (newPrice) product.price = parseFloat(newPrice)
                product.priceDisplay =
                    (await prompt(`Price Display [${product.priceDisplay}]: `)) ||
                    product.priceDisplay
                product.priceTier = await selectPriceTier(product.priceTier)
                break

            case 'taxonomy':
                const taxonomyChoice = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'field',
                        message: 'Edit taxonomy:',
                        choices: [
                            { name: '1. Edit Main Category', value: 'main' },
                            { name: '2. Edit Tags', value: 'tags' },
                            { name: '3. Edit Secondary Categories', value: 'secondary' },
                            { name: '4. Back', value: 'back' }
                        ]
                    }
                ])

                switch (taxonomyChoice.field) {
                    case 'main':
                        product.mainCategory = (await selectMainCategory(
                            product.mainCategory
                        )) as any
                        break
                    case 'tags':
                        product.tags = (await selectTags(product.tags as string[])) as any[]
                        break
                    case 'secondary':
                        product.secondaryCategories = (await selectSecondaryCategories(
                            product.secondaryCategories as any[]
                        )) as any[]
                        break
                }
                break

            case 'meta':
                product.status = (await selectStatus(product.status)) as any
                const newPriority = await prompt(`Priority [${product.priority}]: `)
                if (newPriority) product.priority = parseInt(newPriority)
                const newFeatured = await prompt(`Featured [${product.featured ? 'yes' : 'no'}]: `)
                if (newFeatured) product.featured = newFeatured.toLowerCase() === 'yes'
                break

            case 'save':
                break
        }
    }

    // Validate
    const validation = validateProduct(product)
    if (!validation.success) {
        console.error('❌ Product validation failed:')
        validation.errors.forEach((err) => console.error(err))
        process.exit(1)
    }

    // Save
    saveProduct(product)
    console.log(`\n✅ Product updated: src/data/products/${product.id}.json`)

    const runValidation = await confirm('Run validation?')
    if (runValidation) {
        const { spawnSync } = await import('child_process')
        const result = spawnSync('npm', ['run', 'validate:products'], { stdio: 'inherit' })
        if (result.status !== 0) {
            process.exit(result.status || 1)
        }
    }
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
    console.log('\n📦 Product Management Tool - Remove Operation\n')

    const productId = args.id || (await selectProduct('Select product to remove:'))
    const product = loadProduct(productId)

    if (!product) {
        console.error(`❌ Product not found: ${productId}`)
        process.exit(1)
    }

    console.log('\nProduct to remove:')
    console.log(`  ID: ${product.id}`)
    console.log(`  Name: ${product.name}`)
    console.log(`  Status: ${product.status}`)
    console.log(`  File: src/data/products/${product.id}.json`)

    // Check cross-references
    console.log('\n⚠️  Checking cross-references...\n')
    const references = checkCrossReferences(product.id)

    if (references.length > 0) {
        console.log('Found references:')
        console.log(`  Cross-sell references (${references.length} products reference this):`)
        references.forEach((ref) => {
            console.log(`    • ${ref.productId} (${ref.productName})`)
        })

        if (!args.force) {
            console.log(
                '\n❌ Cannot remove product that is referenced in crossSellIds of other products.'
            )
            console.log('   Update those products first, or use --force flag.')
            process.exit(1)
        } else {
            console.log('\n⚠️  Forcing removal despite references...')
        }
    }

    const confirmed = await confirm('Confirm removal?')
    if (!confirmed) {
        console.log('❌ Operation cancelled')
        process.exit(0)
    }

    removeProduct(product.id)
    console.log(`\n✅ Product removed: src/data/products/${product.id}.json`)
    console.log('\n⚠️  IMPORTANT: Run validation to check for broken references:')
    console.log('   npm run validate:products')
}

// ============================================================================
// Main
// ============================================================================

async function main() {
    const args = parseArgs()

    // If no operation specified, use interactive mode
    if (!args.operation) {
        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'operation',
                message: 'What would you like to do?',
                choices: [
                    { name: 'List products', value: 'list' },
                    { name: 'Add new product', value: 'add' },
                    { name: 'Edit existing product', value: 'edit' },
                    { name: 'Remove product', value: 'remove' }
                ]
            }
        ])
        args.operation = answer.operation
    }

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
            console.error('❌ Invalid operation. Use: list, add, edit, or remove')
            process.exit(1)
    }
}

main().catch((error) => {
    console.error('❌ Error:', error.message)
    process.exit(1)
})
