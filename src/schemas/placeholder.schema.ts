import { z } from 'zod'
import { ComputedValuesSchema } from './product.schema.js'

/**
 * Placeholder Schema - Build-time placeholder system for product JSON files
 * SINGLE SOURCE OF TRUTH for placeholder types and validation
 * Last updated: 2026-01-22
 *
 * Syntax: ${source.path} or ${source.path|formatter} or ${source.path|f1|f2:arg}
 *
 * Sources:
 * - stats.*: From {id}-stats.json (userCount, timeSaved, ratings)
 * - product.*: From {id}.json (price, name, discount, variants)
 * - salesCopy.*: From active sales copy (for cross-references)
 * - computed.*: Build-time values (ratingsCount, averageRating, testimonialsCount)
 *
 * Formatters:
 * - currency: Format as currency using product.currency (e.g., €129.99)
 * - number: Format with locale-specific thousands separator (e.g., 1,234)
 * - round: Round to N decimal places (e.g., round:1 → 4.9)
 * - suffix: Append text (e.g., suffix: users → "1,000+ users")
 * - prefix: Prepend text (e.g., prefix:Only  → "Only €129.99")
 * - default: Fallback value if source is null/undefined
 *
 * Note: ComputedValuesSchema is imported from product.schema.ts to avoid duplication.
 * The computed values (ratingsCount, averageRating, testimonialsCount, includedIn)
 * are defined once in product.schema.ts and reused here.
 */

/**
 * Regex pattern to match placeholder expressions
 * Matches: ${source.path} or ${source.path|formatter} or ${source.path|f1|f2:arg}
 *
 * Groups:
 * - Full match: ${stats.userCount|currency}
 * - Capture groups used in parsing
 */
export const PLACEHOLDER_PATTERN = /\$\{([a-zA-Z]+)\.([a-zA-Z0-9._]+)(\|[a-zA-Z0-9:_\s-]+)*\}/g

/**
 * Available placeholder sources
 */
export const PlaceholderSourceSchema = z.enum(['stats', 'product', 'salesCopy', 'computed'])

/**
 * Available formatter names
 */
export const FormatterNameSchema = z.enum([
    'currency',
    'number',
    'round',
    'suffix',
    'prefix',
    'default'
])

/**
 * Parsed formatter with name and optional argument
 */
export const ParsedFormatterSchema = z.object({
    name: FormatterNameSchema,
    arg: z.string().nullable()
})

/**
 * Fully parsed placeholder expression
 */
export const ParsedPlaceholderSchema = z.object({
    raw: z.string(), // Original expression including ${...}
    source: PlaceholderSourceSchema,
    path: z.string(), // Dot-separated path (e.g., "variants.0.price")
    formatters: z.array(ParsedFormatterSchema)
})

/**
 * Full context available for placeholder resolution
 * Contains all data sources needed to resolve any placeholder
 *
 * Note: ComputedValuesSchema is imported from product.schema.ts to avoid duplication.
 * Consumers needing ComputedValuesSchema directly should import from product.schema.ts
 */
export const PlaceholderContextSchema = z.object({
    product: z.record(z.string(), z.unknown()),
    stats: z.record(z.string(), z.unknown()).nullable(),
    salesCopy: z.record(z.string(), z.unknown()).nullable(),
    computed: ComputedValuesSchema
})

/**
 * Validation error types
 */
export const PlaceholderErrorTypeSchema = z.enum([
    'INVALID_SYNTAX', // Malformed placeholder expression
    'UNKNOWN_SOURCE', // Source not in allowed list
    'INVALID_PATH', // Path doesn't exist in source data
    'NULL_VALUE', // Value is null/undefined without default formatter
    'UNKNOWN_FORMATTER' // Formatter not in allowed list
])

/**
 * Validation error with location and suggestion
 */
export const PlaceholderValidationErrorSchema = z.object({
    file: z.string(), // Source file (e.g., "sales-copy-default.json")
    location: z.string(), // JSON path (e.g., "highlights[0]")
    placeholder: z.string(), // The problematic placeholder
    errorType: PlaceholderErrorTypeSchema,
    message: z.string(),
    suggestion: z.string().nullable()
})

// Export TypeScript types derived from Zod schemas
// Note: ComputedValues is re-exported from product.schema.ts above
export type PlaceholderSource = z.infer<typeof PlaceholderSourceSchema>
export type FormatterName = z.infer<typeof FormatterNameSchema>
export type ParsedFormatter = z.infer<typeof ParsedFormatterSchema>
export type ParsedPlaceholder = z.infer<typeof ParsedPlaceholderSchema>
export type PlaceholderContext = z.infer<typeof PlaceholderContextSchema>
export type PlaceholderErrorType = z.infer<typeof PlaceholderErrorTypeSchema>
export type PlaceholderValidationError = z.infer<typeof PlaceholderValidationErrorSchema>
