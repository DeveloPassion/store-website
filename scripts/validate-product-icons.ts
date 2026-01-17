#!/usr/bin/env bun

/**
 * Validate icons across all data JSON files
 *
 * This script validates that all icon values in data files are either:
 * 1. Emojis (recommended for product files)
 * 2. Valid icon names registered in the icon registry
 * 3. URLs (for external icons)
 *
 * Files validated:
 * - All product files in src/data/products/
 * - src/data/tags.json
 * - src/data/categories.json
 * - src/data/faq-global.json
 * - src/data/resources.json
 * - src/data/socials.json
 *
 * Usage:
 *   npm run validate:product-icons
 *   bun scripts/validate-product-icons.ts
 *
 * Exit codes:
 *   0 - All icons are valid
 *   1 - Validation errors found
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = resolve(__dirname, '..')
const DATA_DIR = resolve(__dirname, '../src/data')
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')
const ICON_REGISTRY_PATH = resolve(__dirname, '../src/lib/icon-registry.ts')

// Additional data files to validate (relative to DATA_DIR)
const ADDITIONAL_DATA_FILES = [
    'tags.json',
    'categories.json',
    'faq-global.json',
    'resources.json',
    'socials.json'
]

interface IconError {
    file: string
    path: string
    iconValue: string
    message: string
}

interface ValidationStats {
    totalFiles: number
    totalIcons: number
    emojiCount: number
    registryIconCount: number
    urlCount: number
    invalidCount: number
}

/**
 * Load valid icon names from the icon registry
 */
function loadRegisteredIcons(): Set<string> {
    if (!existsSync(ICON_REGISTRY_PATH)) {
        console.error('❌ Icon registry not found:', ICON_REGISTRY_PATH)
        process.exit(1)
    }

    const content = readFileSync(ICON_REGISTRY_PATH, 'utf-8')

    // Extract icon names from the iconRegistry object
    // Matches lines like "    FaCalendarAlt," or "    FaCalendarAlt"
    const iconNames = new Set<string>()

    // Match icon names in the registry export
    const registryMatch = content.match(/export const iconRegistry[^{]*\{([^}]+)\}/s)
    if (registryMatch) {
        const registryContent = registryMatch[1]
        // Match icon names (they are the property names, which are the same as variable names)
        const iconMatches = registryContent.matchAll(/^\s+(\w+),?\s*(?:\/\/.*)?$/gm)
        for (const match of iconMatches) {
            iconNames.add(match[1])
        }
    }

    return iconNames
}

/**
 * Check if a string is an emoji
 * Uses a comprehensive approach to detect emojis
 */
function isEmoji(str: string): boolean {
    if (!str || str.length === 0) return false

    // Remove variation selectors and zero-width joiners for length check
    const cleaned = str.replace(/[\uFE0F\u200D]/g, '')

    // If empty after cleaning, not valid
    if (cleaned.length === 0) return false

    // Check if it looks like an icon name (starts with capital letter, contains only alphanumerics)
    if (/^[A-Z][a-zA-Z0-9]+$/.test(str)) {
        return false
    }

    // Check if it's a URL
    if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')) {
        return false
    }

    // Comprehensive emoji detection using Unicode properties
    // This regex matches:
    // - Extended pictographics (most emojis)
    // - Emoji presentation sequences
    // - Emoji modifier sequences
    // - Emoji ZWJ sequences
    // - Regional indicators (flags)
    // - Miscellaneous symbols that can be emojis
    const emojiRegex =
        /^(?:[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2300}-\u{23FF}]|[\u{2B00}-\u{2BFF}]|[\u{25A0}-\u{25FF}]|[\u{2190}-\u{21FF}]|[\u{2000}-\u{206F}]|[\u{2070}-\u{209F}]|[\u{20A0}-\u{20CF}]|[\u{2100}-\u{214F}]|[\u{2150}-\u{218F}]|[\u{2460}-\u{24FF}]|[\u{2500}-\u{257F}]|[\u{2580}-\u{259F}]|[\u{25A0}-\u{25FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{2900}-\u{297F}]|[\u{2980}-\u{29FF}]|[\u{2A00}-\u{2AFF}]|[\u{3000}-\u{303F}]|[\u{3200}-\u{32FF}]|[\u{1FA00}-\u{1FAFF}]|[\u{1F900}-\u{1F9FF}]|[\u{FE00}-\u{FE0F}]|[\u{200D}]|[\u{20E3}]|[\u{E0020}-\u{E007F}])+$/u

    return emojiRegex.test(str)
}

/**
 * Check if a string is a URL
 */
function isUrl(str: string): boolean {
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')
}

/**
 * Check if a string is a valid registered icon name
 */
function isRegisteredIcon(str: string, registeredIcons: Set<string>): boolean {
    return registeredIcons.has(str)
}

/**
 * Recursively extract all icon values from an object
 */
function extractIconValues(
    obj: unknown,
    path: string = ''
): Array<{ path: string; value: string }> {
    const icons: Array<{ path: string; value: string }> = []

    if (obj === null || obj === undefined) {
        return icons
    }

    if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                icons.push(...extractIconValues(item, `${path}[${index}]`))
            })
        } else {
            const record = obj as Record<string, unknown>
            for (const [key, value] of Object.entries(record)) {
                const newPath = path ? `${path}.${key}` : key

                // Check if this is an icon field
                if (
                    (key === 'icon' || key === 'sectionIcon') &&
                    typeof value === 'string' &&
                    value.length > 0
                ) {
                    icons.push({ path: newPath, value })
                }

                // Recurse into nested objects
                if (typeof value === 'object') {
                    icons.push(...extractIconValues(value, newPath))
                }
            }
        }
    }

    return icons
}

/**
 * Validate icons in a single data file
 */
function validateDataFile(
    filepath: string,
    registeredIcons: Set<string>
): { errors: IconError[]; stats: Omit<ValidationStats, 'totalFiles'> } {
    const errors: IconError[] = []
    const stats = {
        totalIcons: 0,
        emojiCount: 0,
        registryIconCount: 0,
        urlCount: 0,
        invalidCount: 0
    }

    try {
        const content = readFileSync(filepath, 'utf-8')
        const data = JSON.parse(content)

        const icons = extractIconValues(data)
        stats.totalIcons = icons.length

        for (const { path, value } of icons) {
            if (isEmoji(value)) {
                stats.emojiCount++
            } else if (isUrl(value)) {
                stats.urlCount++
            } else if (isRegisteredIcon(value, registeredIcons)) {
                stats.registryIconCount++
            } else {
                stats.invalidCount++
                errors.push({
                    file: relative(ROOT_DIR, filepath),
                    path,
                    iconValue: value,
                    message: `Unknown icon "${value}" - not an emoji, URL, or registered icon`
                })
            }
        }
    } catch (error) {
        console.error(`❌ Failed to parse file: ${filepath}`)
        console.error(error instanceof Error ? error.message : String(error))
    }

    return { errors, stats }
}

/**
 * Validate all icons in data files
 */
function validateAllIcons(): {
    errors: IconError[]
    stats: ValidationStats
    registeredIconCount: number
} {
    console.log('🔍 Scanning data files for icons...\n')

    const registeredIcons = loadRegisteredIcons()
    console.log(`📦 Found ${registeredIcons.size} registered icon(s) in icon registry\n`)

    if (!existsSync(PRODUCTS_DIR)) {
        console.error('❌ Products directory not found:', PRODUCTS_DIR)
        process.exit(1)
    }

    // Get all JSON files in the products directory
    const productFiles = readdirSync(PRODUCTS_DIR)
        .filter((file) => file.endsWith('.json'))
        .map((file) => join(PRODUCTS_DIR, file))

    // Get additional data files
    const additionalFiles = ADDITIONAL_DATA_FILES.map((file) => join(DATA_DIR, file)).filter(
        (filepath) => {
            if (!existsSync(filepath)) {
                console.warn(`⚠️  File not found: ${relative(ROOT_DIR, filepath)}`)
                return false
            }
            return true
        }
    )

    const allFiles = [...productFiles, ...additionalFiles]

    console.log(`📂 Scanning ${productFiles.length} product file(s)...`)
    console.log(`📂 Scanning ${additionalFiles.length} additional data file(s)...\n`)

    const allErrors: IconError[] = []
    const totalStats: ValidationStats = {
        totalFiles: allFiles.length,
        totalIcons: 0,
        emojiCount: 0,
        registryIconCount: 0,
        urlCount: 0,
        invalidCount: 0
    }

    for (const filepath of allFiles) {
        const { errors, stats } = validateDataFile(filepath, registeredIcons)

        allErrors.push(...errors)
        totalStats.totalIcons += stats.totalIcons
        totalStats.emojiCount += stats.emojiCount
        totalStats.registryIconCount += stats.registryIconCount
        totalStats.urlCount += stats.urlCount
        totalStats.invalidCount += stats.invalidCount
    }

    return {
        errors: allErrors,
        stats: totalStats,
        registeredIconCount: registeredIcons.size
    }
}

function displayStats(stats: ValidationStats, registeredIconCount: number) {
    console.log('📊 Scan Statistics:\n')
    console.log(`   Files scanned: ${stats.totalFiles}`)
    console.log(`   Registered icons available: ${registeredIconCount}`)
    console.log(`   Total icons found: ${stats.totalIcons}`)
    console.log(`   ├─ Emojis: ${stats.emojiCount}`)
    console.log(`   ├─ Registered icons: ${stats.registryIconCount}`)
    console.log(`   ├─ URLs: ${stats.urlCount}`)
    console.log(`   └─ Invalid: ${stats.invalidCount}`)
    console.log('')
}

function main() {
    console.log('🎨 Validating data file icons...\n')

    const { errors, stats, registeredIconCount } = validateAllIcons()

    if (errors.length === 0) {
        console.log('✅ All icons are valid!\n')
        displayStats(stats, registeredIconCount)
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
        {} as Record<string, IconError[]>
    )

    // Display summary header
    console.error('❌ Icon validation failed!\n')
    console.error(`Found ${errors.length} invalid icon(s):\n`)

    // Display summary table by file
    console.error('📊 Errors by file:\n')
    Object.entries(errorsByFile)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([file, fileErrors]) => {
            console.error(`   ${file}: ${fileErrors.length} error(s)`)
        })
    console.error('')

    // Display all errors
    console.error('📋 All invalid icons:\n')
    let errorNumber = 1
    Object.entries(errorsByFile)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([file, fileErrors]) => {
            console.error(`\n❌ ${file}`)
            fileErrors.forEach((error) => {
                console.error(`   ${errorNumber}. [${error.path}] "${error.iconValue}"`)
                errorNumber++
            })
        })
    console.error('')

    displayStats(stats, registeredIconCount)

    console.error('💡 Tips:')
    console.error('   • Use emojis for icons (e.g., "🚀", "💡", "🎯")')
    console.error('   • Or use registered icon names from src/lib/icon-registry.ts')
    console.error('   • Or use URLs for external icons (http://, https://, /)')
    console.error('   • To add a new icon, register it in src/lib/icon-registry.ts\n')

    process.exit(1)
}

main()
