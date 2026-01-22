/**
 * Placeholder System - Build-time placeholder replacement for product JSON files
 *
 * This module provides a complete system for defining, validating, and resolving
 * placeholders in product data files. Placeholders allow centralizing frequently
 * changing values (user counts, prices, etc.) and automatically propagating updates.
 *
 * ## Usage
 *
 * In product JSON files, use the syntax: ${source.path} or ${source.path|formatter}
 *
 * Sources:
 * - stats.*: From {id}-stats.json (userCount, timeSaved, ratings)
 * - product.*: From {id}.json (price, name, variants)
 * - salesCopy.*: From active sales copy (for cross-references)
 * - computed.*: Build-time values (ratingsCount, averageRating, testimonialsCount)
 *
 * Formatters:
 * - currency: Format as currency (e.g., €129.99)
 * - number: Format with thousands separator (e.g., 1,234)
 * - round: Round to N decimal places (e.g., round:1 → 4.9)
 * - suffix: Append text (e.g., suffix: users)
 * - prefix: Prepend text (e.g., prefix:Only )
 * - default: Fallback value if null (e.g., default:N/A)
 *
 * ## Examples
 *
 * Basic:
 * ```json
 * "highlights": ["**${stats.userCount} Users**: Join our community"]
 * ```
 *
 * With formatters:
 * ```json
 * "price": "${product.price|currency|prefix:Only }"
 * "rating": "${computed.averageRating|round:1}/5 from ${computed.ratingsCount|number} reviews"
 * ```
 *
 * With default for nullable:
 * ```json
 * "timeSaved": "${stats.timeSaved|default:Significant time savings}"
 * ```
 *
 * @module placeholder
 */

// Re-export types from placeholder schema
export type {
    PlaceholderSource,
    FormatterName,
    ParsedFormatter,
    ParsedPlaceholder,
    PlaceholderContext,
    PlaceholderErrorType,
    PlaceholderValidationError
} from '../../../src/schemas/placeholder.schema.js'

export {
    PLACEHOLDER_PATTERN,
    PlaceholderSourceSchema,
    FormatterNameSchema,
    ParsedFormatterSchema,
    ParsedPlaceholderSchema,
    PlaceholderContextSchema,
    PlaceholderErrorTypeSchema,
    PlaceholderValidationErrorSchema
} from '../../../src/schemas/placeholder.schema.js'

// Parser exports
export {
    findPlaceholders,
    hasPlaceholders,
    parsePlaceholder,
    findUniquePlaceholders,
    parseAllPlaceholders
} from './parser.js'

// Resolver exports
export { resolvePath, pathExists, getAvailablePaths } from './resolver.js'
export type { ResolveResult } from './resolver.js'

// Formatter exports
export {
    applyFormatter,
    applyFormatters,
    hasDefaultFormatter,
    getDefaultValue
} from './formatter.js'

// Processor exports
export {
    processString,
    processObject,
    hasUnresolvedPlaceholders,
    findUnresolvedPlaceholders,
    processObjectWithErrors
} from './processor.js'

// Validator exports
export {
    validatePlaceholdersInData,
    validatePlaceholders,
    formatValidationErrors,
    hasBlockingErrors,
    filterErrorsByType
} from './validator.js'

/**
 * Create a placeholder context from loaded product data
 * This is a convenience function for building the context during aggregation
 *
 * @param product - The individual product data
 * @param stats - Stats data from {id}-stats.json (nullable)
 * @param salesCopy - Active sales copy data (nullable)
 * @param computed - Computed values from aggregation
 * @returns PlaceholderContext ready for processing
 */
export function createPlaceholderContext(
    product: Record<string, unknown>,
    stats: Record<string, unknown> | null,
    salesCopy: Record<string, unknown> | null,
    computed: {
        ratingsCount: number | null
        averageRating: number | null
        testimonialsCount: number
        includedIn: string[]
    }
): import('../../../src/schemas/placeholder.schema.js').PlaceholderContext {
    return {
        product,
        stats,
        salesCopy,
        computed
    }
}
