#!/usr/bin/env bun

/**
 * Validate product links across the codebase
 *
 * This script validates that all /product/xxx links reference valid product IDs.
 * It scans TypeScript, TSX, and JSON files for product link patterns.
 *
 * Usage:
 *   npm run validate:product-links
 *   bun scripts/validate-product-links.ts
 *
 * Exit codes:
 *   0 - All product links are valid
 *   1 - Validation errors found
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs'
import { resolve, dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = resolve(__dirname, '..')
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')
const SRC_DIR = resolve(__dirname, '../src')

type ErrorType = 'invalid-id' | 'wrong-path'

interface ProductLinkError {
    file: string
    line: number
    productId: string
    context: string
    message: string
    errorType: ErrorType
}

interface ProductLinkMatch {
    file: string
    line: number
    productId: string
    context: string
    isDynamic: boolean
    isWrongPath: boolean // /products/ instead of /product/
}

/**
 * Load all valid product IDs from the products directory
 */
function loadProductIds(): Set<string> {
    if (!existsSync(PRODUCTS_DIR)) {
        console.error('❌ Products directory not found:', PRODUCTS_DIR)
        process.exit(1)
    }

    const files = readdirSync(PRODUCTS_DIR).filter(
        (file) =>
            file.endsWith('.json') &&
            !file.endsWith('-faq.json') &&
            !file.endsWith('-testimonials.json') &&
            !file.endsWith('-media.json') &&
            !file.endsWith('-stats.json') &&
            !file.includes('-sales-copy-')
    )

    const productIds = new Set<string>()

    for (const file of files) {
        try {
            const filepath = join(PRODUCTS_DIR, file)
            const content = readFileSync(filepath, 'utf-8')
            const product = JSON.parse(content)
            if (product.id) {
                productIds.add(product.id)
            }
        } catch (error) {
            console.error(`❌ Failed to load product file: ${file}`)
            console.error(error instanceof Error ? error.message : String(error))
        }
    }

    return productIds
}

/**
 * Recursively get all files matching extensions
 */
function getFilesRecursively(
    dir: string,
    extensions: string[],
    excludePatterns: string[] = []
): string[] {
    const files: string[] = []

    if (!existsSync(dir)) {
        return files
    }

    const entries = readdirSync(dir)

    for (const entry of entries) {
        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
            // Skip node_modules and dist
            if (entry === 'node_modules' || entry === 'dist') {
                continue
            }
            files.push(...getFilesRecursively(fullPath, extensions, excludePatterns))
        } else if (extensions.some((ext) => entry.endsWith(ext))) {
            // Skip files matching exclude patterns
            if (excludePatterns.some((pattern) => entry === pattern || entry.endsWith(pattern))) {
                continue
            }
            files.push(fullPath)
        }
    }

    return files
}

/**
 * Extract product links from a file
 */
function extractProductLinks(filepath: string): ProductLinkMatch[] {
    const matches: ProductLinkMatch[] = []
    const content = readFileSync(filepath, 'utf-8')
    const lines = content.split('\n')

    lines.forEach((line, index) => {
        const lineNumber = index + 1

        // Pattern 1: Hardcoded links in quotes - /product/xxx
        // Matches: "/product/some-id", '/product/some-id', `/product/some-id`
        const hardcodedRegex = /['"`](\/product\/([a-zA-Z0-9_-]+))['"`]/g
        let match
        while ((match = hardcodedRegex.exec(line)) !== null) {
            const productId = match[2]
            // Skip test files with test- prefix as they use mock IDs
            if (filepath.includes('.spec.') && productId.startsWith('test-')) {
                continue
            }
            matches.push({
                file: filepath,
                line: lineNumber,
                productId,
                context: line.trim(),
                isDynamic: false,
                isWrongPath: false
            })
        }

        // Pattern 2: Markdown links - [text](/product/xxx) or [text](/products/xxx)
        // Matches: [Click here](/product/some-id), [Product](/products/some-id)
        const markdownLinkRegex = /\]\(\/(products?)\/([a-zA-Z0-9_-]+)\)/g
        while ((match = markdownLinkRegex.exec(line)) !== null) {
            const pathPart = match[1] // "product" or "products"
            const productId = match[2]
            // Skip test files with test- prefix as they use mock IDs
            if (filepath.includes('.spec.') && productId.startsWith('test-')) {
                continue
            }
            matches.push({
                file: filepath,
                line: lineNumber,
                productId,
                context: line.trim(),
                isDynamic: false,
                isWrongPath: pathPart === 'products'
            })
        }

        // Pattern 3: Wrong path /products/xxx in quotes (should be /product/xxx)
        // Matches: "/products/some-id", '/products/some-id', `/products/some-id`
        const wrongPathRegex = /['"`](\/products\/([a-zA-Z0-9_-]+))['"`]/g
        while ((match = wrongPathRegex.exec(line)) !== null) {
            const productId = match[2]
            // Skip test files with test- prefix as they use mock IDs
            if (filepath.includes('.spec.') && productId.startsWith('test-')) {
                continue
            }
            matches.push({
                file: filepath,
                line: lineNumber,
                productId,
                context: line.trim(),
                isDynamic: false,
                isWrongPath: true
            })
        }

        // Pattern 4: Parenthesized links (not markdown) - (/product/xxx) or (/products/xxx)
        // Matches: (/product/some-id), (/products/some-id)
        // But NOT markdown links like ](/product/xxx) - those are handled by Pattern 2
        const parenLinkRegex = /(?<!\])\(\/(products?)\/([a-zA-Z0-9_-]+)\)/g
        while ((match = parenLinkRegex.exec(line)) !== null) {
            const pathPart = match[1] // "product" or "products"
            const productId = match[2]
            // Skip test files with test- prefix as they use mock IDs
            if (filepath.includes('.spec.') && productId.startsWith('test-')) {
                continue
            }
            matches.push({
                file: filepath,
                line: lineNumber,
                productId,
                context: line.trim(),
                isDynamic: false,
                isWrongPath: pathPart === 'products'
            })
        }
    })

    // Deduplicate matches (same file, line, productId)
    const seen = new Set<string>()
    return matches.filter((m) => {
        const key = `${m.file}:${m.line}:${m.productId}:${m.isWrongPath}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

/**
 * Validate all product links in the codebase
 */
function validateProductLinks(): {
    errors: ProductLinkError[]
    stats: { totalFiles: number; totalLinks: number; dynamicLinks: number }
} {
    console.log('🔍 Scanning for product links...\n')

    const productIds = loadProductIds()
    console.log(`📦 Found ${productIds.size} valid product ID(s)\n`)

    // Get all source files, excluding products.json (aggregated file) and media files
    const extensions = ['.ts', '.tsx', '.json']
    const excludePatterns = ['products.json', '-media.json']
    const files = getFilesRecursively(SRC_DIR, extensions, excludePatterns)

    console.log(`📂 Scanning ${files.length} file(s)...\n`)

    const errors: ProductLinkError[] = []
    let totalLinks = 0
    let dynamicLinks = 0

    for (const file of files) {
        const matches = extractProductLinks(file)
        totalLinks += matches.length

        for (const match of matches) {
            if (match.isDynamic) {
                dynamicLinks++
                continue
            }

            // Check for wrong path (/products/ instead of /product/)
            if (match.isWrongPath) {
                errors.push({
                    file: relative(ROOT_DIR, match.file),
                    line: match.line,
                    productId: match.productId,
                    context: match.context,
                    message: `Wrong path: "/products/${match.productId}" should be "/product/${match.productId}"`,
                    errorType: 'wrong-path'
                })
            }
            // Check for invalid product ID
            else if (!productIds.has(match.productId)) {
                errors.push({
                    file: relative(ROOT_DIR, match.file),
                    line: match.line,
                    productId: match.productId,
                    context: match.context,
                    message: `Product ID "${match.productId}" does not exist`,
                    errorType: 'invalid-id'
                })
            }
        }
    }

    return {
        errors,
        stats: {
            totalFiles: files.length,
            totalLinks,
            dynamicLinks
        }
    }
}

function displayStats(
    stats: { totalFiles: number; totalLinks: number; dynamicLinks: number },
    productCount: number
) {
    console.log('📊 Scan Statistics:\n')
    console.log(`   Files scanned: ${stats.totalFiles}`)
    console.log(`   Valid product IDs: ${productCount}`)
    console.log(`   Hardcoded product links found: ${stats.totalLinks}`)
    console.log('')
}

function main() {
    console.log('🔗 Validating product links...\n')

    const { errors, stats } = validateProductLinks()
    const productIds = loadProductIds()

    if (errors.length === 0) {
        console.log('✅ All product links are valid!\n')
        displayStats(stats, productIds.size)
        process.exit(0)
    }

    // Group errors by file
    const errorsByFile = errors.reduce(
        (acc, error) => {
            if (!acc[error.file]) {
                acc[error.file] = []
            }
            acc[error.file].push(error)
            return acc
        },
        {} as Record<string, ProductLinkError[]>
    )

    // Count by error type
    const wrongPathCount = errors.filter((e) => e.errorType === 'wrong-path').length
    const invalidIdCount = errors.filter((e) => e.errorType === 'invalid-id').length

    // Display summary header
    console.error('❌ Product link validation failed!\n')
    console.error(`Found ${errors.length} invalid product link(s):`)
    console.error(`   • Wrong path (/products/ instead of /product/): ${wrongPathCount}`)
    console.error(`   • Invalid product ID: ${invalidIdCount}`)
    console.error('')

    // Display summary table by file
    console.error('📊 Errors by file:\n')
    Object.entries(errorsByFile)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([file, fileErrors]) => {
            console.error(`   ${file}: ${fileErrors.length} error(s)`)
        })
    console.error('')

    // Display all errors - one line per error for compactness
    console.error('📋 All invalid links:\n')
    let errorNumber = 1
    Object.entries(errorsByFile)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([file, fileErrors]) => {
            console.error(`\n❌ ${file}`)
            fileErrors.forEach((error) => {
                const prefix = error.errorType === 'wrong-path' ? '🔀' : '❓'
                console.error(`   ${errorNumber}. ${prefix} Line ${error.line}: ${error.message}`)
                errorNumber++
            })
        })
    console.error('')

    console.error('\n💡 Tips:')
    console.error('   • Use "/product/xxx" (singular), NOT "/products/xxx" (plural)')
    console.error('   • Ensure product links reference existing product IDs')
    console.error('   • Use dynamic links like `/product/${product.id}` when possible\n')

    process.exit(1)
}

main()
