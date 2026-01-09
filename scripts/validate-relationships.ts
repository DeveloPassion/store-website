#!/usr/bin/env tsx

/**
 * Validate cross-product relationships and references
 *
 * This script validates that all cross-references in products are valid:
 * - crossSellIds: References to other product IDs
 * - testimonialIds: References to testimonial IDs in testimonials.json
 * - faqIds: References to FAQ IDs in faqs.json
 *
 * Usage:
 *   npm run validate:relationships
 *   tsx scripts/validate-relationships.ts
 *
 * Exit codes:
 *   0 - All relationships are valid
 *   1 - Validation errors found
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')
const TESTIMONIALS_FILE = resolve(__dirname, '../src/data/testimonials.json')
const FAQS_FILE = resolve(__dirname, '../src/data/faqs.json')

interface Product {
    id: string
    crossSellIds: string[]
    testimonialIds: string[]
    faqIds: string[]
    [key: string]: any
}

interface Testimonial {
    id: string
    productId: string
    [key: string]: any
}

interface FAQ {
    id: string
    productId: string
    [key: string]: any
}

interface RelationshipError {
    productId: string
    filename: string
    field: 'crossSellIds' | 'testimonialIds' | 'faqIds'
    invalidId: string
    message: string
}

function loadProducts(): Product[] {
    if (!existsSync(PRODUCTS_DIR)) {
        console.error('❌ Products directory not found:', PRODUCTS_DIR)
        process.exit(1)
    }

    const files = readdirSync(PRODUCTS_DIR).filter((file) => file.endsWith('.json'))
    const products: Product[] = []

    for (const file of files) {
        try {
            const filepath = join(PRODUCTS_DIR, file)
            const content = readFileSync(filepath, 'utf-8')
            const product = JSON.parse(content)
            products.push(product)
        } catch (error) {
            console.error(`❌ Failed to load product file: ${file}`)
            console.error(error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    }

    return products
}

function loadTestimonials(): Testimonial[] {
    if (!existsSync(TESTIMONIALS_FILE)) {
        console.error('❌ Testimonials file not found:', TESTIMONIALS_FILE)
        process.exit(1)
    }

    try {
        const content = readFileSync(TESTIMONIALS_FILE, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        console.error('❌ Failed to load testimonials.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

function loadFAQs(): FAQ[] {
    if (!existsSync(FAQS_FILE)) {
        console.error('❌ FAQs file not found:', FAQS_FILE)
        process.exit(1)
    }

    try {
        const content = readFileSync(FAQS_FILE, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        console.error('❌ Failed to load faqs.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

function validateRelationships(): RelationshipError[] {
    console.log('🔍 Validating cross-product relationships...\n')

    const products = loadProducts()
    const testimonials = loadTestimonials()
    const faqs = loadFAQs()

    console.log(`📦 Loaded ${products.length} product(s)`)
    console.log(`💬 Loaded ${testimonials.length} testimonial(s)`)
    console.log(`❓ Loaded ${faqs.length} FAQ(s)\n`)

    const errors: RelationshipError[] = []

    // Build lookup sets for fast validation
    const productIds = new Set(products.map((p) => p.id))
    const testimonialIds = new Set(testimonials.map((t) => t.id))
    const faqIds = new Set(faqs.map((f) => f.id))

    console.log('🔗 Validating relationships...\n')

    // Validate each product
    products.forEach((product) => {
        const filename = `${product.id}.json`

        // Validate crossSellIds
        if (product.crossSellIds && Array.isArray(product.crossSellIds)) {
            product.crossSellIds.forEach((crossSellId: string) => {
                if (!productIds.has(crossSellId)) {
                    errors.push({
                        productId: product.id,
                        filename,
                        field: 'crossSellIds',
                        invalidId: crossSellId,
                        message: `Referenced product "${crossSellId}" does not exist`
                    })
                }
            })
        }

        // Validate testimonialIds
        if (product.testimonialIds && Array.isArray(product.testimonialIds)) {
            product.testimonialIds.forEach((testimonialId: string) => {
                if (!testimonialIds.has(testimonialId)) {
                    errors.push({
                        productId: product.id,
                        filename,
                        field: 'testimonialIds',
                        invalidId: testimonialId,
                        message: `Referenced testimonial "${testimonialId}" does not exist`
                    })
                }
            })
        }

        // Validate faqIds
        if (product.faqIds && Array.isArray(product.faqIds)) {
            product.faqIds.forEach((faqId: string) => {
                if (!faqIds.has(faqId)) {
                    errors.push({
                        productId: product.id,
                        filename,
                        field: 'faqIds',
                        invalidId: faqId,
                        message: `Referenced FAQ "${faqId}" does not exist`
                    })
                }
            })
        }
    })

    return errors
}

function displayStats(products: Product[], testimonials: Testimonial[], faqs: FAQ[]) {
    console.log('📊 Relationship Statistics:\n')

    // Count total cross-references
    const totalCrossSells = products.reduce((sum, p) => sum + (p.crossSellIds?.length || 0), 0)
    const totalTestimonialRefs = products.reduce(
        (sum, p) => sum + (p.testimonialIds?.length || 0),
        0
    )
    const totalFaqRefs = products.reduce((sum, p) => sum + (p.faqIds?.length || 0), 0)

    console.log(`   Cross-sell references: ${totalCrossSells}`)
    console.log(`   Testimonial references: ${totalTestimonialRefs}`)
    console.log(`   FAQ references: ${totalFaqRefs}`)
    console.log(`   Total references: ${totalCrossSells + totalTestimonialRefs + totalFaqRefs}\n`)

    // Products with most cross-references
    const productsWithRefs = products
        .map((p) => ({
            id: p.id,
            totalRefs:
                (p.crossSellIds?.length || 0) +
                (p.testimonialIds?.length || 0) +
                (p.faqIds?.length || 0)
        }))
        .filter((p) => p.totalRefs > 0)
        .sort((a, b) => b.totalRefs - a.totalRefs)
        .slice(0, 5)

    if (productsWithRefs.length > 0) {
        console.log('   Products with most references (top 5):')
        productsWithRefs.forEach((p) => {
            console.log(`     - ${p.id}: ${p.totalRefs} reference(s)`)
        })
        console.log('')
    }

    // Orphaned resources (testimonials/FAQs not referenced by any product)
    const referencedTestimonialIds = new Set(products.flatMap((p) => p.testimonialIds || []))
    const orphanedTestimonials = testimonials.filter((t) => !referencedTestimonialIds.has(t.id))

    const referencedFaqIds = new Set(products.flatMap((p) => p.faqIds || []))
    const orphanedFaqs = faqs.filter((f) => !referencedFaqIds.has(f.id))

    if (orphanedTestimonials.length > 0 || orphanedFaqs.length > 0) {
        console.log('   ⚠️  Orphaned Resources (not referenced by any product):')
        if (orphanedTestimonials.length > 0) {
            console.log(`     - ${orphanedTestimonials.length} orphaned testimonial(s):`)
            orphanedTestimonials.slice(0, 3).forEach((t) => {
                console.log(`         • ${t.id}`)
            })
            if (orphanedTestimonials.length > 3) {
                console.log(`         • ... and ${orphanedTestimonials.length - 3} more`)
            }
        }
        if (orphanedFaqs.length > 0) {
            console.log(`     - ${orphanedFaqs.length} orphaned FAQ(s):`)
            orphanedFaqs.slice(0, 3).forEach((f) => {
                console.log(`         • ${f.id}`)
            })
            if (orphanedFaqs.length > 3) {
                console.log(`         • ... and ${orphanedFaqs.length - 3} more`)
            }
        }
        console.log('')
    }
}

function main() {
    console.log('🔍 Validating product relationships...\n')

    const errors = validateRelationships()

    // Load data for stats
    const products = loadProducts()
    const testimonials = loadTestimonials()
    const faqs = loadFAQs()

    if (errors.length === 0) {
        console.log('✅ All relationships are valid!\n')
        displayStats(products, testimonials, faqs)
        process.exit(0)
    }

    // Display errors
    console.error('❌ Relationship validation failed!\n')
    console.error(`Found ${errors.length} broken reference(s):\n`)

    // Group errors by product
    const errorsByProduct = errors.reduce(
        (acc, error) => {
            if (!acc[error.productId]) {
                acc[error.productId] = []
            }
            acc[error.productId].push(error)
            return acc
        },
        {} as Record<string, RelationshipError[]>
    )

    Object.entries(errorsByProduct).forEach(([, productErrors]) => {
        console.error(`❌ ${productErrors[0].filename}`)
        productErrors.forEach((error) => {
            console.error(`     • ${error.field}: ${error.message}`)
        })
        console.error('')
    })

    console.error('💡 Tip: Ensure all referenced IDs exist in their respective files')
    console.error('💡 Tip: Check that product IDs match their filenames (without .json)')
    console.error('💡 Tip: Verify testimonialIds exist in src/data/testimonials.json')
    console.error('💡 Tip: Verify faqIds exist in src/data/faqs.json\n')

    process.exit(1)
}

main()
