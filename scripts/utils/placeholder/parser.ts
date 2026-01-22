/**
 * Placeholder Parser - Extracts and parses ${...} placeholder expressions
 *
 * This module handles the first phase of placeholder processing:
 * 1. Finding all placeholder expressions in a string
 * 2. Parsing expressions into structured components (source, path, formatters)
 *
 * @example
 * findPlaceholders("Price: ${product.price|currency}")
 * // Returns: ["${product.price|currency}"]
 *
 * parsePlaceholder("${product.price|currency}")
 * // Returns: { raw: "${product.price|currency}", source: "product", path: "price", formatters: [{ name: "currency", arg: null }] }
 */

import {
    PLACEHOLDER_PATTERN,
    PlaceholderSourceSchema,
    FormatterNameSchema,
    type ParsedPlaceholder,
    type ParsedFormatter,
    type PlaceholderSource
} from '../../../src/schemas/placeholder.schema.js'

/**
 * Find all placeholder expressions in a text string
 *
 * @param text - The text to search for placeholders
 * @returns Array of placeholder expressions (including ${...} delimiters)
 *
 * @example
 * findPlaceholders("Hello ${stats.userCount} users!")
 * // Returns: ["${stats.userCount}"]
 *
 * findPlaceholders("${product.price|currency} - ${stats.timeSaved}")
 * // Returns: ["${product.price|currency}", "${stats.timeSaved}"]
 */
export function findPlaceholders(text: string): string[] {
    // Reset regex lastIndex to ensure consistent behavior
    const regex = new RegExp(PLACEHOLDER_PATTERN.source, PLACEHOLDER_PATTERN.flags)
    const matches: string[] = []

    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
        matches.push(match[0])
    }

    return matches
}

/**
 * Check if a text contains any placeholder expressions
 *
 * @param text - The text to check
 * @returns True if the text contains at least one placeholder
 */
export function hasPlaceholders(text: string): boolean {
    const regex = new RegExp(PLACEHOLDER_PATTERN.source, PLACEHOLDER_PATTERN.flags)
    return regex.test(text)
}

/**
 * Parse a single formatter segment (e.g., "currency" or "round:1")
 *
 * @param segment - Formatter segment without the leading |
 * @returns Parsed formatter with name and optional argument, or null if invalid
 */
function parseFormatter(segment: string): ParsedFormatter | null {
    const colonIndex = segment.indexOf(':')

    let name: string
    let arg: string | null = null

    if (colonIndex === -1) {
        // No argument, just trim the name
        name = segment.trim()
    } else {
        // Name before colon (trim it), argument after colon (preserve spaces)
        name = segment.slice(0, colonIndex).trim()
        arg = segment.slice(colonIndex + 1)
    }

    // Validate formatter name
    const validation = FormatterNameSchema.safeParse(name)
    if (!validation.success) {
        return null
    }

    return {
        name: validation.data,
        arg
    }
}

/**
 * Parse a placeholder expression into its components
 *
 * @param expression - The full placeholder expression including ${...}
 * @returns Parsed placeholder object, or null if the expression is invalid
 *
 * @example
 * parsePlaceholder("${stats.userCount}")
 * // Returns: { raw: "${stats.userCount}", source: "stats", path: "userCount", formatters: [] }
 *
 * parsePlaceholder("${product.price|currency|prefix:From }")
 * // Returns: {
 * //   raw: "${product.price|currency|prefix:From }",
 * //   source: "product",
 * //   path: "price",
 * //   formatters: [
 * //     { name: "currency", arg: null },
 * //     { name: "prefix", arg: "From " }
 * //   ]
 * // }
 */
export function parsePlaceholder(expression: string): ParsedPlaceholder | null {
    // Verify the expression is a valid placeholder format
    if (!expression.startsWith('${') || !expression.endsWith('}')) {
        return null
    }

    // Extract content between ${ and }
    const content = expression.slice(2, -1)

    // Split by | to separate path from formatters
    const parts = content.split('|')
    if (parts.length === 0 || !parts[0]) {
        return null
    }

    // Parse source.path
    const sourcePath = parts[0]
    const dotIndex = sourcePath.indexOf('.')

    if (dotIndex === -1) {
        return null // Must have at least source.field
    }

    const sourceStr = sourcePath.slice(0, dotIndex)
    const path = sourcePath.slice(dotIndex + 1)

    if (!path) {
        return null // Path cannot be empty
    }

    // Validate source
    const sourceValidation = PlaceholderSourceSchema.safeParse(sourceStr)
    if (!sourceValidation.success) {
        // Return partial result for error reporting (source is still set for error context)
        // But return null to indicate parsing failed
        return null
    }

    const source: PlaceholderSource = sourceValidation.data

    // Parse formatters (parts[1] onwards)
    const formatters: ParsedFormatter[] = []
    for (let i = 1; i < parts.length; i++) {
        const formatter = parseFormatter(parts[i])
        if (formatter === null) {
            // Invalid formatter - return null to indicate parsing failed
            // The validator will provide detailed error reporting
            return null
        }
        formatters.push(formatter)
    }

    return {
        raw: expression,
        source,
        path,
        formatters
    }
}

/**
 * Extract all unique placeholder expressions from a text
 * Useful for validation to avoid duplicate error reporting
 *
 * @param text - The text to search
 * @returns Set of unique placeholder expressions
 */
export function findUniquePlaceholders(text: string): Set<string> {
    return new Set(findPlaceholders(text))
}

/**
 * Parse all placeholders in a text and return results
 * Returns both successful parses and raw expressions for failed parses
 *
 * @param text - The text containing placeholders
 * @returns Object with parsed placeholders and failed expressions
 */
export function parseAllPlaceholders(text: string): {
    parsed: ParsedPlaceholder[]
    failed: string[]
} {
    const expressions = findPlaceholders(text)
    const parsed: ParsedPlaceholder[] = []
    const failed: string[] = []

    for (const expr of expressions) {
        const result = parsePlaceholder(expr)
        if (result) {
            parsed.push(result)
        } else {
            failed.push(expr)
        }
    }

    return { parsed, failed }
}
