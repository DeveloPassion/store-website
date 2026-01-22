/**
 * Placeholder Validator - Validates all placeholders before processing
 *
 * This module provides comprehensive validation of placeholders:
 * 1. Syntax validation (proper ${source.path} format)
 * 2. Source validation (stats, product, salesCopy, computed)
 * 3. Path validation (path exists in source data)
 * 4. Null value detection (warns if no default formatter)
 * 5. Formatter validation (known formatter names)
 *
 * Validation runs before processing to catch errors early and provide
 * detailed error messages with suggestions for fixes.
 *
 * @example
 * const errors = validatePlaceholders('my-product', context)
 * if (errors.length > 0) {
 *   // Report errors
 * }
 */

import type {
    PlaceholderContext,
    PlaceholderValidationError,
    PlaceholderErrorType
} from '../../../src/schemas/placeholder.schema.js'
import { findPlaceholders, parsePlaceholder } from './parser.js'
import { resolvePath, pathExists, getAvailablePaths } from './resolver.js'
import { hasDefaultFormatter } from './formatter.js'

/**
 * File types that may contain placeholders
 */
type PlaceholderFileType = 'product' | 'sales-copy' | 'faq' | 'testimonials' | 'media' | 'stats'

/**
 * Create a validation error object
 */
function createError(
    file: string,
    location: string,
    placeholder: string,
    errorType: PlaceholderErrorType,
    message: string,
    suggestion: string | null = null
): PlaceholderValidationError {
    return {
        file,
        location,
        placeholder,
        errorType,
        message,
        suggestion
    }
}

/**
 * Validate a single placeholder expression
 *
 * @param placeholder - The placeholder expression
 * @param context - The placeholder context
 * @param file - Source file name for error reporting
 * @param location - JSON path location for error reporting
 * @returns Array of validation errors (empty if valid)
 */
function validatePlaceholder(
    placeholder: string,
    context: PlaceholderContext,
    file: string,
    location: string
): PlaceholderValidationError[] {
    const errors: PlaceholderValidationError[] = []

    // Parse the placeholder
    const parsed = parsePlaceholder(placeholder)

    if (!parsed) {
        // Could be invalid syntax or unknown source/formatter
        // Try to provide more specific error

        // Check if it looks like a placeholder but with invalid source
        const sourceMatch = placeholder.match(/\$\{([a-zA-Z]+)\./)
        if (sourceMatch) {
            const source = sourceMatch[1]
            const validSources = ['stats', 'product', 'salesCopy', 'computed']
            if (!validSources.includes(source)) {
                errors.push(
                    createError(
                        file,
                        location,
                        placeholder,
                        'UNKNOWN_SOURCE',
                        `Unknown source "${source}"`,
                        `Valid sources: ${validSources.join(', ')}`
                    )
                )
                return errors
            }
        }

        // Check for unknown formatter
        const formatterMatch = placeholder.match(/\|([a-zA-Z]+)/)
        if (formatterMatch) {
            const formatter = formatterMatch[1]
            const validFormatters = ['currency', 'number', 'round', 'suffix', 'prefix', 'default']
            if (!validFormatters.includes(formatter)) {
                errors.push(
                    createError(
                        file,
                        location,
                        placeholder,
                        'UNKNOWN_FORMATTER',
                        `Unknown formatter "${formatter}"`,
                        `Valid formatters: ${validFormatters.join(', ')}`
                    )
                )
                return errors
            }
        }

        // Generic syntax error
        errors.push(
            createError(
                file,
                location,
                placeholder,
                'INVALID_SYNTAX',
                `Invalid placeholder syntax`,
                'Format: ${source.path} or ${source.path|formatter}'
            )
        )
        return errors
    }

    // Check if the path exists
    if (!pathExists(context, parsed.source, parsed.path)) {
        // Get available paths for suggestion
        const availablePaths = getAvailablePaths(context, parsed.source)
        const suggestion =
            availablePaths.length > 0
                ? `Available paths in ${parsed.source}: ${availablePaths.slice(0, 5).join(', ')}${availablePaths.length > 5 ? '...' : ''}`
                : `Source "${parsed.source}" is null or has no accessible paths`

        errors.push(
            createError(
                file,
                location,
                placeholder,
                'INVALID_PATH',
                `Path "${parsed.path}" not found in source "${parsed.source}"`,
                suggestion
            )
        )
        return errors
    }

    // Check if value is null without default formatter
    const resolved = resolvePath(context, parsed.source, parsed.path)
    if (resolved.success && (resolved.value === null || resolved.value === undefined)) {
        if (!hasDefaultFormatter(parsed.formatters)) {
            errors.push(
                createError(
                    file,
                    location,
                    placeholder,
                    'NULL_VALUE',
                    `Value is null but no default formatter provided`,
                    `Add |default:fallback to handle null values: ${placeholder.slice(0, -1)}|default:N/A}`
                )
            )
        }
    }

    return errors
}

/**
 * Scan an object for all placeholder strings and their locations
 *
 * @param obj - The object to scan
 * @param basePath - Base path for location tracking
 * @returns Array of { location, value } for each string containing placeholders
 */
function findAllPlaceholderStrings(
    obj: unknown,
    basePath: string = ''
): Array<{ location: string; value: string; placeholders: string[] }> {
    const results: Array<{ location: string; value: string; placeholders: string[] }> = []

    if (obj === null || obj === undefined) {
        return results
    }

    if (typeof obj === 'string') {
        const placeholders = findPlaceholders(obj)
        if (placeholders.length > 0) {
            results.push({ location: basePath, value: obj, placeholders })
        }
        return results
    }

    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            const itemPath = basePath ? `${basePath}[${index}]` : `[${index}]`
            results.push(...findAllPlaceholderStrings(item, itemPath))
        })
        return results
    }

    if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
            const propPath = basePath ? `${basePath}.${key}` : key
            results.push(...findAllPlaceholderStrings(value, propPath))
        }
    }

    return results
}

/**
 * Validate all placeholders in a data object
 *
 * @param data - The data object to validate
 * @param fileType - Type of file for error reporting
 * @param productId - Product ID for file name construction
 * @param context - The placeholder context
 * @returns Array of validation errors
 */
export function validatePlaceholdersInData(
    data: unknown,
    fileType: PlaceholderFileType,
    productId: string,
    context: PlaceholderContext
): PlaceholderValidationError[] {
    const errors: PlaceholderValidationError[] = []

    // Determine file name for error reporting
    let fileName: string
    switch (fileType) {
        case 'product':
            fileName = `${productId}.json`
            break
        case 'sales-copy':
            fileName = `${productId}-sales-copy-*.json`
            break
        case 'faq':
            fileName = `${productId}-faq.json`
            break
        case 'testimonials':
            fileName = `${productId}-testimonials.json`
            break
        case 'media':
            fileName = `${productId}-media.json`
            break
        case 'stats':
            fileName = `${productId}-stats.json`
            break
        default:
            fileName = 'unknown'
    }

    // Find all strings containing placeholders
    const placeholderStrings = findAllPlaceholderStrings(data)

    // Validate each placeholder
    for (const { location, placeholders } of placeholderStrings) {
        for (const placeholder of placeholders) {
            const placeholderErrors = validatePlaceholder(placeholder, context, fileName, location)
            errors.push(...placeholderErrors)
        }
    }

    return errors
}

/**
 * Validate all placeholders for a product across all its data files
 * This is the main entry point for validation during aggregation
 *
 * @param productId - The product ID
 * @param context - The placeholder context with all loaded data
 * @param options - Validation options
 * @returns Array of all validation errors
 */
export function validatePlaceholders(
    productId: string,
    context: PlaceholderContext,
    options: {
        validateProduct?: boolean
        validateSalesCopy?: boolean
        validateFaqs?: boolean
        validateTestimonials?: boolean
    } = {}
): PlaceholderValidationError[] {
    const {
        validateProduct = true,
        validateSalesCopy = true,
        // These options are available but not currently implemented
        // Placeholders in FAQs/testimonials are processed but not pre-validated
        validateFaqs: _validateFaqs = true,
        validateTestimonials: _validateTestimonials = true
    } = options
    // Suppress unused variable warnings
    void _validateFaqs
    void _validateTestimonials

    const errors: PlaceholderValidationError[] = []

    // Validate product data (contents field mainly)
    if (validateProduct) {
        // Only validate string fields that might have placeholders
        // Product data like contents could have placeholders
        const productData = { contents: (context.product as Record<string, unknown>).contents }
        errors.push(...validatePlaceholdersInData(productData, 'product', productId, context))
    }

    // Validate sales copy (most likely to have placeholders)
    if (validateSalesCopy && context.salesCopy) {
        errors.push(
            ...validatePlaceholdersInData(context.salesCopy, 'sales-copy', productId, context)
        )
    }

    return errors
}

/**
 * Format validation errors for console output
 *
 * @param errors - Array of validation errors
 * @param productId - Product ID for header
 * @returns Formatted error string
 */
export function formatValidationErrors(
    errors: PlaceholderValidationError[],
    productId: string
): string {
    if (errors.length === 0) {
        return ''
    }

    const lines: string[] = [`❌ ${productId}: ${errors.length} invalid placeholder(s)`]

    for (const error of errors) {
        lines.push(`   - ${error.file}:${error.location}: ${error.message}`)
        lines.push(`     Placeholder: ${error.placeholder}`)
        if (error.suggestion) {
            lines.push(`     Suggestion: ${error.suggestion}`)
        }
    }

    return lines.join('\n')
}

/**
 * Check if any errors are blocking (should stop aggregation in strict mode)
 * Some errors like NULL_VALUE might be warnings in non-strict mode
 *
 * @param errors - Array of validation errors
 * @returns True if any error is blocking
 */
export function hasBlockingErrors(errors: PlaceholderValidationError[]): boolean {
    const blockingTypes: PlaceholderErrorType[] = [
        'INVALID_SYNTAX',
        'UNKNOWN_SOURCE',
        'INVALID_PATH',
        'UNKNOWN_FORMATTER'
    ]
    return errors.some((e) => blockingTypes.includes(e.errorType))
}

/**
 * Filter errors by type
 *
 * @param errors - Array of validation errors
 * @param type - Error type to filter for
 * @returns Filtered errors
 */
export function filterErrorsByType(
    errors: PlaceholderValidationError[],
    type: PlaceholderErrorType
): PlaceholderValidationError[] {
    return errors.filter((e) => e.errorType === type)
}
