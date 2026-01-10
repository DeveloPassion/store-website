#!/usr/bin/env bun

/**
 * Interactive CLI tool to manage product FAQs and testimonials
 *
 * Usage:
 *   Interactive mode:
 *     npm run manage:product-content
 *     bun scripts/manage-product-content.ts
 *
 *   CLI arguments mode:
 *     npm run manage:product-content -- --operation list --product product-id --type faqs
 *     npm run manage:product-content -- --operation add --product product-id --type testimonials
 *     npm run manage:product-content -- --operation edit --product product-id --type faqs --id faq-1
 *     npm run manage:product-content -- --operation remove --product product-id --type faqs --id faq-1
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'
import inquirer from 'inquirer'
import { select } from '@inquirer/prompts'
import { FAQsArraySchema } from '../src/schemas/faq.schema.js'
import { TestimonialsArraySchema } from '../src/schemas/testimonial.schema.js'
import type { FAQ } from '../src/types/faq'
import type { Testimonial } from '../src/types/testimonial'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')

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

interface CliArgs {
    operation?: 'list' | 'add' | 'edit' | 'remove'
    product?: string
    type?: 'faqs' | 'testimonials'
    id?: string
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
║         📝  PRODUCT CONTENT MANAGEMENT CLI  💬            ║
║                                                           ║
║          Manage FAQs and Testimonials for Products       ║
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
 * Prompt for confirmation
 */
function prompt(question: string): Promise<string> {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) => {
        rl.question(question, (answer: string) => {
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

        if (arg.startsWith('--') && nextArg && !nextArg.startsWith('--')) {
            const key = arg.slice(2) as keyof CliArgs
            args[key] = nextArg as never
            i++
        }
    }

    return args
}

/**
 * Load available products
 */
function loadAvailableProducts(): string[] {
    const productFiles = readdirSync(PRODUCTS_DIR).filter(
        (f) => f.endsWith('.json') && !f.endsWith('-faq.json') && !f.endsWith('-testimonials.json')
    )

    return productFiles.map((f) => f.replace('.json', '')).sort()
}

/**
 * Get product name from file
 */
function getProductName(productId: string): string {
    const filePath = join(PRODUCTS_DIR, `${productId}.json`)
    if (!existsSync(filePath)) return productId

    try {
        const content = readFileSync(filePath, 'utf-8')
        const product = JSON.parse(content)
        return product.name || productId
    } catch {
        return productId
    }
}

/**
 * Generate a random alphanumeric string
 */
function generateRandomString(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * Generate FAQ ID with product prefix
 */
function generateFaqId(productId: string): string {
    return `${productId}-faq-${generateRandomString(8)}`
}

/**
 * Generate testimonial ID with product prefix
 */
function generateTestimonialId(productId: string): string {
    return `${productId}-testimonial-${generateRandomString(8)}`
}

// ============================================================================
// FAQ Management
// ============================================================================

function getFaqPath(productId: string): string {
    return join(PRODUCTS_DIR, `${productId}-faq.json`)
}

function loadFaqs(productId: string): FAQ[] {
    const faqPath = getFaqPath(productId)
    if (!existsSync(faqPath)) {
        return []
    }

    try {
        const content = readFileSync(faqPath, 'utf-8')
        const faqs = JSON.parse(content)
        const result = FAQsArraySchema.safeParse(faqs)

        if (!result.success) {
            showError(`Invalid FAQ data: ${result.error.message}`)
            return []
        }

        return result.data
    } catch (error) {
        showError(`Failed to load FAQs: ${error instanceof Error ? error.message : String(error)}`)
        return []
    }
}

function saveFaqs(productId: string, faqs: FAQ[]): boolean {
    const faqPath = getFaqPath(productId)

    // Validate before saving
    const result = FAQsArraySchema.safeParse(faqs)
    if (!result.success) {
        showError(`Validation failed: ${result.error.message}`)
        return false
    }

    // Sort by order
    const sorted = [...faqs].sort((a, b) => a.order - b.order)

    try {
        const json = JSON.stringify(sorted, null, 4)
        writeFileSync(faqPath, json + '\n', 'utf-8')
        return true
    } catch (error) {
        showError(`Failed to save FAQs: ${error instanceof Error ? error.message : String(error)}`)
        return false
    }
}

async function manageFaqs(productId: string): Promise<void> {
    const productName = getProductName(productId)
    showOperationHeader(`Managing FAQs`, `${productName} (${productId})`)

    while (true) {
        const faqs = loadFaqs(productId)

        const action = await select({
            message: `Current FAQs: ${faqs.length}. What would you like to do?`,
            choices: [
                { name: '📋 List all FAQs', value: 'list' },
                { name: '➕ Add new FAQ', value: 'add' },
                { name: '✏️ Edit existing FAQ', value: 'edit' },
                { name: '🗑️ Delete FAQ', value: 'delete' },
                { name: '← Back', value: 'back' }
            ],
            pageSize: 10
        })

        if (action === 'back') break

        if (action === 'list') {
            if (faqs.length === 0) {
                showInfo('No FAQs found')
            } else {
                console.log(`\n${colors.bright}📋 FAQs (${faqs.length} total)${colors.reset}\n`)
                console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
                faqs.forEach((faq) => {
                    console.log(
                        `${colors.cyan}[${faq.order}]${colors.reset} ${colors.bright}${faq.id}${colors.reset}`
                    )
                    console.log(`  ${colors.bright}Q:${colors.reset} ${faq.question}`)
                    console.log(
                        `  ${colors.bright}A:${colors.reset} ${faq.answer.substring(0, 100)}${faq.answer.length > 100 ? '...' : ''}`
                    )
                    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
                })
            }
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        } else if (action === 'add') {
            showSectionHeader('Add New FAQ')

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'id',
                    message: 'FAQ ID:',
                    default: generateFaqId(productId),
                    validate: (input) => {
                        if (!input) return 'ID is required'
                        if (faqs.some((f) => f.id === input)) return 'ID already exists'
                        return true
                    }
                },
                {
                    type: 'input',
                    name: 'question',
                    message: 'Question:',
                    validate: (input) => (input ? true : 'Question is required')
                },
                {
                    type: 'input',
                    name: 'answer',
                    message: 'Answer:',
                    validate: (input) => (input ? true : 'Answer is required')
                },
                {
                    type: 'number',
                    name: 'order',
                    message: 'Display order:',
                    default: faqs.length + 1
                }
            ])

            const newFaq: FAQ = {
                id: answers.id,
                question: answers.question,
                answer: answers.answer,
                order: answers.order
            }

            faqs.push(newFaq)
            if (saveFaqs(productId, faqs)) {
                showSuccess(`FAQ added: ${newFaq.id}`)
            }
        } else if (action === 'edit') {
            if (faqs.length === 0) {
                showWarning('No FAQs to edit')
                continue
            }

            const { faqId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'faqId',
                    message: 'Select FAQ to edit:',
                    choices: faqs.map((f) => ({
                        name: `[${f.order}] ${f.question}`,
                        value: f.id
                    })),
                    pageSize: 15
                }
            ])

            const faq = faqs.find((f) => f.id === faqId)
            if (!faq) continue

            showSectionHeader(`Edit FAQ: ${faq.id}`)

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'question',
                    message: 'Question:',
                    default: faq.question
                },
                {
                    type: 'input',
                    name: 'answer',
                    message: 'Answer:',
                    default: faq.answer
                },
                {
                    type: 'number',
                    name: 'order',
                    message: 'Display order:',
                    default: faq.order
                }
            ])

            faq.question = answers.question
            faq.answer = answers.answer
            faq.order = answers.order

            if (saveFaqs(productId, faqs)) {
                showSuccess(`FAQ updated: ${faq.id}`)
            }
        } else if (action === 'delete') {
            if (faqs.length === 0) {
                showWarning('No FAQs to delete')
                continue
            }

            const { faqId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'faqId',
                    message: 'Select FAQ to delete:',
                    choices: faqs.map((f) => ({
                        name: `[${f.order}] ${f.question}`,
                        value: f.id
                    })),
                    pageSize: 15
                }
            ])

            const confirmed = await confirm(`${colors.red}Delete this FAQ?${colors.reset}`)

            if (confirmed) {
                const updated = faqs.filter((f) => f.id !== faqId)
                if (saveFaqs(productId, updated)) {
                    showSuccess(`FAQ deleted: ${faqId}`)
                }
            }
        }
    }
}

// ============================================================================
// Testimonial Management
// ============================================================================

function getTestimonialPath(productId: string): string {
    return join(PRODUCTS_DIR, `${productId}-testimonials.json`)
}

function loadTestimonials(productId: string): Testimonial[] {
    const testimonialPath = getTestimonialPath(productId)
    if (!existsSync(testimonialPath)) {
        return []
    }

    try {
        const content = readFileSync(testimonialPath, 'utf-8')
        const testimonials = JSON.parse(content)
        const result = TestimonialsArraySchema.safeParse(testimonials)

        if (!result.success) {
            showError(`Invalid testimonial data: ${result.error.message}`)
            return []
        }

        return result.data
    } catch (error) {
        showError(
            `Failed to load testimonials: ${error instanceof Error ? error.message : String(error)}`
        )
        return []
    }
}

function saveTestimonials(productId: string, testimonials: Testimonial[]): boolean {
    const testimonialPath = getTestimonialPath(productId)

    // Validate before saving
    const result = TestimonialsArraySchema.safeParse(testimonials)
    if (!result.success) {
        showError(`Validation failed: ${result.error.message}`)
        return false
    }

    // Sort by featured (featured first), then by rating
    const sorted = [...testimonials].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        return b.rating - a.rating
    })

    try {
        const json = JSON.stringify(sorted, null, 4)
        writeFileSync(testimonialPath, json + '\n', 'utf-8')
        return true
    } catch (error) {
        showError(
            `Failed to save testimonials: ${error instanceof Error ? error.message : String(error)}`
        )
        return false
    }
}

async function manageTestimonials(productId: string): Promise<void> {
    const productName = getProductName(productId)
    showOperationHeader(`Managing Testimonials`, `${productName} (${productId})`)

    while (true) {
        const testimonials = loadTestimonials(productId)

        const action = await select({
            message: `Current testimonials: ${testimonials.length}. What would you like to do?`,
            choices: [
                { name: '📋 List all testimonials', value: 'list' },
                { name: '➕ Add new testimonial', value: 'add' },
                { name: '✏️ Edit existing testimonial', value: 'edit' },
                { name: '🗑️ Delete testimonial', value: 'delete' },
                { name: '← Back', value: 'back' }
            ],
            pageSize: 10
        })

        if (action === 'back') break

        if (action === 'list') {
            if (testimonials.length === 0) {
                showInfo('No testimonials found')
            } else {
                console.log(
                    `\n${colors.bright}💬 Testimonials (${testimonials.length} total)${colors.reset}\n`
                )
                console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
                testimonials.forEach((t) => {
                    const featuredMark = t.featured ? `${colors.yellow}⭐${colors.reset}` : '  '
                    console.log(
                        `${featuredMark} ${colors.bright}${t.id}${colors.reset} - ${t.author} ${colors.dim}(${t.rating}/5)${colors.reset}`
                    )
                    console.log(
                        `  "${t.quote.substring(0, 100)}${t.quote.length > 100 ? '...' : ''}"`
                    )
                    if (t.role || t.company) {
                        console.log(
                            `  ${colors.dim}${t.role || ''}${t.role && t.company ? ' at ' : ''}${t.company || ''}${colors.reset}`
                        )
                    }
                    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
                })
            }
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        } else if (action === 'add') {
            showSectionHeader('Add New Testimonial')

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'id',
                    message: 'Testimonial ID:',
                    default: generateTestimonialId(productId),
                    validate: (input) => {
                        if (!input) return 'ID is required'
                        if (testimonials.some((t) => t.id === input)) return 'ID already exists'
                        return true
                    }
                },
                {
                    type: 'input',
                    name: 'author',
                    message: 'Author name:',
                    validate: (input) => (input ? true : 'Author is required')
                },
                {
                    type: 'input',
                    name: 'role',
                    message: 'Role (optional):'
                },
                {
                    type: 'input',
                    name: 'company',
                    message: 'Company (optional):'
                },
                {
                    type: 'input',
                    name: 'twitterHandle',
                    message: 'Twitter handle (optional, without @):'
                },
                {
                    type: 'input',
                    name: 'twitterUrl',
                    message: 'Twitter URL (optional):'
                },
                {
                    type: 'number',
                    name: 'rating',
                    message: 'Rating (1-5):',
                    default: 5,
                    validate: (input) => {
                        const num = Number(input)
                        if (num < 1 || num > 5) return 'Rating must be between 1 and 5'
                        return true
                    }
                },
                {
                    type: 'input',
                    name: 'quote',
                    message: 'Quote:',
                    validate: (input) => (input ? true : 'Quote is required')
                },
                {
                    type: 'confirm',
                    name: 'featured',
                    message: 'Featured?',
                    default: false
                }
            ])

            const newTestimonial: Testimonial = {
                id: answers.id,
                author: answers.author,
                rating: answers.rating,
                quote: answers.quote,
                featured: answers.featured
            }

            if (answers.role) newTestimonial.role = answers.role
            if (answers.company) newTestimonial.company = answers.company
            if (answers.twitterHandle) newTestimonial.twitterHandle = answers.twitterHandle
            if (answers.twitterUrl) newTestimonial.twitterUrl = answers.twitterUrl

            testimonials.push(newTestimonial)
            if (saveTestimonials(productId, testimonials)) {
                showSuccess(`Testimonial added: ${newTestimonial.id}`)
            }
        } else if (action === 'edit') {
            if (testimonials.length === 0) {
                showWarning('No testimonials to edit')
                continue
            }

            const { testimonialId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'testimonialId',
                    message: 'Select testimonial to edit:',
                    choices: testimonials.map((t) => ({
                        name: `${t.author} (${t.rating}/5) - "${t.quote.substring(0, 50)}..."`,
                        value: t.id
                    })),
                    pageSize: 15
                }
            ])

            const testimonial = testimonials.find((t) => t.id === testimonialId)
            if (!testimonial) continue

            showSectionHeader(`Edit Testimonial: ${testimonial.id}`)

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'author',
                    message: 'Author name:',
                    default: testimonial.author
                },
                {
                    type: 'input',
                    name: 'role',
                    message: 'Role (optional):',
                    default: testimonial.role || ''
                },
                {
                    type: 'input',
                    name: 'company',
                    message: 'Company (optional):',
                    default: testimonial.company || ''
                },
                {
                    type: 'input',
                    name: 'twitterHandle',
                    message: 'Twitter handle (optional):',
                    default: testimonial.twitterHandle || ''
                },
                {
                    type: 'input',
                    name: 'twitterUrl',
                    message: 'Twitter URL (optional):',
                    default: testimonial.twitterUrl || ''
                },
                {
                    type: 'number',
                    name: 'rating',
                    message: 'Rating (1-5):',
                    default: testimonial.rating
                },
                {
                    type: 'input',
                    name: 'quote',
                    message: 'Quote:',
                    default: testimonial.quote
                },
                {
                    type: 'confirm',
                    name: 'featured',
                    message: 'Featured?',
                    default: testimonial.featured
                }
            ])

            testimonial.author = answers.author
            testimonial.rating = answers.rating
            testimonial.quote = answers.quote
            testimonial.featured = answers.featured

            if (answers.role) {
                testimonial.role = answers.role
            } else {
                delete testimonial.role
            }

            if (answers.company) {
                testimonial.company = answers.company
            } else {
                delete testimonial.company
            }

            if (answers.twitterHandle) {
                testimonial.twitterHandle = answers.twitterHandle
            } else {
                delete testimonial.twitterHandle
            }

            if (answers.twitterUrl) {
                testimonial.twitterUrl = answers.twitterUrl
            } else {
                delete testimonial.twitterUrl
            }

            if (saveTestimonials(productId, testimonials)) {
                showSuccess(`Testimonial updated: ${testimonial.id}`)
            }
        } else if (action === 'delete') {
            if (testimonials.length === 0) {
                showWarning('No testimonials to delete')
                continue
            }

            const { testimonialId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'testimonialId',
                    message: 'Select testimonial to delete:',
                    choices: testimonials.map((t) => ({
                        name: `${t.author} - "${t.quote.substring(0, 50)}..."`,
                        value: t.id
                    })),
                    pageSize: 15
                }
            ])

            const confirmed = await confirm(`${colors.red}Delete this testimonial?${colors.reset}`)

            if (confirmed) {
                const updated = testimonials.filter((t) => t.id !== testimonialId)
                if (saveTestimonials(productId, updated)) {
                    showSuccess(`Testimonial deleted: ${testimonialId}`)
                }
            }
        }
    }
}

// ============================================================================
// Main Menu
// ============================================================================

async function mainMenu(): Promise<void> {
    while (true) {
        showBanner()

        const products = loadAvailableProducts()

        if (products.length === 0) {
            showError('No products found')
            process.exit(1)
        }

        // Step 1: Select product
        const productId = await select({
            message: 'Select product:',
            choices: products.map((id) => ({
                name: `${getProductName(id)} ${colors.dim}(${id})${colors.reset}`,
                value: id
            })),
            pageSize: 15
        })

        // Step 2: Select content type
        const contentType = await select({
            message: 'What would you like to manage?',
            choices: [
                { name: '📝 FAQs', value: 'faqs' },
                { name: '💬 Testimonials', value: 'testimonials' },
                { name: '← Back to product selection', value: 'back' },
                { name: '👋 Exit', value: 'exit' }
            ]
        })

        if (contentType === 'exit') {
            console.log(
                `\n${colors.bright}${colors.cyan}Thanks for using Product Content Management CLI! 👋${colors.reset}\n`
            )
            process.exit(0)
        }

        if (contentType === 'back') continue

        // Step 3: Manage content
        try {
            if (contentType === 'faqs') {
                await manageFaqs(productId)
            } else if (contentType === 'testimonials') {
                await manageTestimonials(productId)
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
                    `\n${colors.bright}${colors.cyan}Thanks for using Product Content Management CLI! 👋${colors.reset}\n`
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

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
    const args = parseArgs()

    // If CLI arguments provided, run in CLI mode (no menu loop)
    if (args.operation && args.product && args.type) {
        try {
            showOperationHeader(args.operation, `${getProductName(args.product)} - ${args.type}`)

            // Verify product exists
            const productPath = join(PRODUCTS_DIR, `${args.product}.json`)
            if (!existsSync(productPath)) {
                showError(`Product not found: ${args.product}`)
                process.exit(1)
            }

            if (args.type === 'faqs') {
                await manageFaqs(args.product)
            } else if (args.type === 'testimonials') {
                await manageTestimonials(args.product)
            } else {
                showError(`Invalid type: ${args.type}. Must be 'faqs' or 'testimonials'`)
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
                        `\n${colors.bright}${colors.cyan}Thanks for using Product Content Management CLI! 👋${colors.reset}\n`
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
