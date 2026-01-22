/**
 * Placeholder Processor - Deep traversal and replacement of placeholders
 *
 * This module handles the core placeholder processing:
 * 1. Deep traversal of objects to find all string fields
 * 2. Parsing and resolving placeholders in each string
 * 3. Applying formatters and replacing placeholder expressions
 *
 * @example
 * processString("Join ${stats.userCount} users!", context)
 * // Returns: "Join 1,000+ users!"
 *
 * processObject({ highlights: ["${stats.userCount} users"] }, context)
 * // Returns: { highlights: ["1,000+ users"] }
 */

import type { PlaceholderContext } from '../../../src/schemas/placeholder.schema.js'
import { findPlaceholders, parsePlaceholder } from './parser.js'
import { resolvePath } from './resolver.js'
import { applyFormatters, hasDefaultFormatter } from './formatter.js'

/**
 * Result of processing a single placeholder
 */
interface ProcessResult {
    original: string
    replacement: string | null
    error?: string
}

/**
 * Process a single placeholder expression and return its replacement
 *
 * @param expression - The placeholder expression (e.g., "${stats.userCount}")
 * @param context - The placeholder context
 * @returns ProcessResult with original and replacement (or error)
 */
function processPlaceholder(expression: string, context: PlaceholderContext): ProcessResult {
    // Parse the placeholder
    const parsed = parsePlaceholder(expression)
    if (!parsed) {
        return {
            original: expression,
            replacement: null,
            error: `Invalid placeholder syntax: ${expression}`
        }
    }

    // Resolve the path to get the value
    const resolved = resolvePath(context, parsed.source, parsed.path)

    // Handle resolution failure
    if (!resolved.success) {
        // Check if there's a default formatter
        if (hasDefaultFormatter(parsed.formatters)) {
            // Apply formatters to null to trigger default
            const formatted = applyFormatters(null, parsed.formatters, context)
            return {
                original: expression,
                replacement: formatted
            }
        }
        return {
            original: expression,
            replacement: null,
            error: resolved.error
        }
    }

    // Apply formatters to the resolved value
    const formatted = applyFormatters(resolved.value, parsed.formatters, context)

    // Handle null result (value was null and no default formatter)
    if (formatted === null) {
        return {
            original: expression,
            replacement: null,
            error: `Value is null and no default formatter provided for: ${expression}`
        }
    }

    return {
        original: expression,
        replacement: formatted
    }
}

/**
 * Process all placeholders in a string and replace them with values
 *
 * @param text - The text containing placeholders
 * @param context - The placeholder context
 * @returns Processed text with placeholders replaced
 *
 * @example
 * processString("Price: ${product.price|currency}", context)
 * // Returns: "Price: €149.99"
 *
 * processString("${stats.userCount|default:Many} users", context)
 * // Returns: "1,000+ users" (or "Many users" if stats.userCount is null)
 */
export function processString(text: string, context: PlaceholderContext): string {
    const placeholders = findPlaceholders(text)

    if (placeholders.length === 0) {
        return text
    }

    let result = text

    for (const placeholder of placeholders) {
        const processed = processPlaceholder(placeholder, context)

        if (processed.replacement !== null) {
            // Replace the placeholder with its value
            result = result.replace(placeholder, processed.replacement)
        }
        // If replacement is null (error or null value without default),
        // leave the placeholder unchanged (will be caught by validation)
    }

    return result
}

/**
 * Deep clone an object, processing all string values for placeholders
 *
 * @param obj - The object to process (will not be mutated)
 * @param context - The placeholder context
 * @returns New object with all placeholders replaced
 *
 * @example
 * processObject({
 *   highlights: ["${stats.userCount} Users"],
 *   price: "${product.price|currency}"
 * }, context)
 * // Returns: { highlights: ["1,000+ Users"], price: "€149.99" }
 */
export function processObject<T>(obj: T, context: PlaceholderContext): T {
    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return obj
    }

    // Handle strings - process placeholders
    if (typeof obj === 'string') {
        return processString(obj, context) as T
    }

    // Handle arrays - process each element
    if (Array.isArray(obj)) {
        return obj.map((item) => processObject(item, context)) as T
    }

    // Handle objects - process each property
    if (typeof obj === 'object') {
        const result: Record<string, unknown> = {}

        for (const [key, value] of Object.entries(obj)) {
            result[key] = processObject(value, context)
        }

        return result as T
    }

    // For primitives (number, boolean), return as-is
    return obj
}

/**
 * Check if a string contains any unresolved placeholders
 * Useful for validation after processing
 *
 * @param text - The text to check
 * @returns True if unresolved placeholders remain
 */
export function hasUnresolvedPlaceholders(text: string): boolean {
    return findPlaceholders(text).length > 0
}

/**
 * Find all unresolved placeholders in an object
 * Returns array of { path, placeholder } for each unresolved placeholder
 *
 * @param obj - The object to scan
 * @param basePath - Base path for error reporting (internal)
 * @returns Array of unresolved placeholder locations
 */
export function findUnresolvedPlaceholders(
    obj: unknown,
    basePath: string = ''
): Array<{ path: string; placeholder: string }> {
    const results: Array<{ path: string; placeholder: string }> = []

    if (obj === null || obj === undefined) {
        return results
    }

    if (typeof obj === 'string') {
        const placeholders = findPlaceholders(obj)
        for (const placeholder of placeholders) {
            results.push({ path: basePath, placeholder })
        }
        return results
    }

    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            const itemPath = basePath ? `${basePath}[${index}]` : `[${index}]`
            results.push(...findUnresolvedPlaceholders(item, itemPath))
        })
        return results
    }

    if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
            const propPath = basePath ? `${basePath}.${key}` : key
            results.push(...findUnresolvedPlaceholders(value, propPath))
        }
    }

    return results
}

/**
 * Process an object and return both the result and any processing errors
 * Useful for detailed error reporting during aggregation
 *
 * @param obj - The object to process
 * @param context - The placeholder context
 * @returns Object with processed result and any errors
 */
export function processObjectWithErrors<T>(
    obj: T,
    context: PlaceholderContext
): { result: T; errors: Array<{ path: string; placeholder: string; error: string }> } {
    const errors: Array<{ path: string; placeholder: string; error: string }> = []

    function processWithTracking(value: unknown, path: string): unknown {
        if (value === null || value === undefined) {
            return value
        }

        if (typeof value === 'string') {
            const placeholders = findPlaceholders(value)
            let result = value

            for (const placeholder of placeholders) {
                const processed = processPlaceholder(placeholder, context)
                if (processed.error) {
                    errors.push({ path, placeholder, error: processed.error })
                } else if (processed.replacement !== null) {
                    result = result.replace(placeholder, processed.replacement)
                }
            }

            return result
        }

        if (Array.isArray(value)) {
            return value.map((item, index) => {
                const itemPath = path ? `${path}[${index}]` : `[${index}]`
                return processWithTracking(item, itemPath)
            })
        }

        if (typeof value === 'object') {
            const result: Record<string, unknown> = {}
            for (const [key, val] of Object.entries(value)) {
                const propPath = path ? `${path}.${key}` : key
                result[key] = processWithTracking(val, propPath)
            }
            return result
        }

        return value
    }

    const result = processWithTracking(obj, '') as T
    return { result, errors }
}
