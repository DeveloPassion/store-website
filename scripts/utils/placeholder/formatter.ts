/**
 * Placeholder Formatter - Applies formatters to resolved values
 *
 * This module handles the third phase of placeholder processing:
 * 1. Applying individual formatters (currency, number, round, etc.)
 * 2. Chaining multiple formatters in sequence
 * 3. Handling formatter arguments
 *
 * Formatters:
 * - currency: Format as currency using product.currency (e.g., €129.99)
 * - number: Format with locale-specific thousands separator (e.g., 1,234)
 * - round: Round to N decimal places (e.g., round:1 → 4.9)
 * - suffix: Append text (e.g., suffix: users → "1,000+ users")
 * - prefix: Prepend text (e.g., prefix:Only  → "Only €129.99")
 * - default: Fallback value if source is null/undefined
 *
 * @example
 * applyFormatter(149.99, 'currency', null, context)
 * // Returns: "€149.99"
 *
 * applyFormatters(4.837, [{ name: 'round', arg: '1' }], context)
 * // Returns: "4.8"
 */

import type {
    ParsedFormatter,
    PlaceholderContext,
    FormatterName
} from '../../../src/schemas/placeholder.schema.js'

/**
 * Currency symbols by currency code
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    CHF: 'CHF ',
    CAD: 'CA$',
    AUD: 'A$',
    INR: '₹'
}

/**
 * Get currency symbol from product context
 * Defaults to EUR if not specified
 */
function getCurrencySymbol(context: PlaceholderContext): string {
    const currency = context.product?.currency as string | undefined
    return CURRENCY_SYMBOLS[currency ?? 'EUR'] ?? '€'
}

/**
 * Format a numeric value as currency
 *
 * @param value - The numeric value to format
 * @param context - The placeholder context (for currency info)
 * @returns Formatted currency string
 */
function formatCurrency(value: unknown, context: PlaceholderContext): string {
    const symbol = getCurrencySymbol(context)

    // Handle numeric values
    if (typeof value === 'number') {
        // Format with 2 decimal places for currency
        const formatted = value.toFixed(2)
        return `${symbol}${formatted}`
    }

    // Handle string values that might be numeric
    if (typeof value === 'string') {
        const num = parseFloat(value)
        if (!isNaN(num)) {
            return `${symbol}${num.toFixed(2)}`
        }
        // Non-numeric string, just prepend symbol
        return `${symbol}${value}`
    }

    // For other types, convert to string and prepend symbol
    return `${symbol}${String(value)}`
}

/**
 * Format a numeric value with thousands separator
 *
 * @param value - The value to format
 * @returns Formatted number string
 */
function formatNumber(value: unknown): string {
    if (typeof value === 'number') {
        return value.toLocaleString('en-US')
    }

    if (typeof value === 'string') {
        const num = parseFloat(value)
        if (!isNaN(num)) {
            return num.toLocaleString('en-US')
        }
    }

    return String(value)
}

/**
 * Round a numeric value to N decimal places
 *
 * @param value - The value to round
 * @param decimals - Number of decimal places (default: 0)
 * @returns Rounded value as string
 */
function formatRound(value: unknown, decimals: number = 0): string {
    let num: number

    if (typeof value === 'number') {
        num = value
    } else if (typeof value === 'string') {
        num = parseFloat(value)
        if (isNaN(num)) {
            return value
        }
    } else {
        return String(value)
    }

    return num.toFixed(decimals)
}

/**
 * Append a suffix to the value
 *
 * @param value - The value to suffix
 * @param suffix - The text to append
 * @returns Value with suffix appended
 */
function formatSuffix(value: unknown, suffix: string): string {
    return `${String(value)}${suffix}`
}

/**
 * Prepend a prefix to the value
 *
 * @param value - The value to prefix
 * @param prefix - The text to prepend
 * @returns Value with prefix prepended
 */
function formatPrefix(value: unknown, prefix: string): string {
    return `${prefix}${String(value)}`
}

/**
 * Apply a single formatter to a value
 *
 * @param value - The value to format (can be null/undefined)
 * @param formatter - The formatter name
 * @param arg - Optional formatter argument
 * @param context - The placeholder context
 * @returns Formatted value as string, or null if value is null and no default
 */
export function applyFormatter(
    value: unknown,
    formatter: FormatterName,
    arg: string | null,
    context: PlaceholderContext
): string | null {
    // Handle default formatter for null/undefined values
    if (formatter === 'default') {
        if (value === null || value === undefined) {
            return arg ?? ''
        }
        return String(value)
    }

    // For non-default formatters, null/undefined values pass through as null
    if (value === null || value === undefined) {
        return null
    }

    switch (formatter) {
        case 'currency':
            return formatCurrency(value, context)

        case 'number':
            return formatNumber(value)

        case 'round': {
            const decimals = arg ? parseInt(arg, 10) : 0
            return formatRound(value, isNaN(decimals) ? 0 : decimals)
        }

        case 'suffix':
            return formatSuffix(value, arg ?? '')

        case 'prefix':
            return formatPrefix(value, arg ?? '')

        default:
            // Unknown formatter - return value as string
            return String(value)
    }
}

/**
 * Apply a chain of formatters to a value
 * Formatters are applied in order, left to right
 *
 * @param value - The initial value
 * @param formatters - Array of formatters to apply
 * @param context - The placeholder context
 * @returns Final formatted value, or null if null and no default
 *
 * @example
 * applyFormatters(149.99, [
 *   { name: 'currency', arg: null },
 *   { name: 'prefix', arg: 'Only ' }
 * ], context)
 * // Returns: "Only €149.99"
 */
export function applyFormatters(
    value: unknown,
    formatters: ParsedFormatter[],
    context: PlaceholderContext
): string | null {
    let current: unknown = value

    for (const formatter of formatters) {
        const result = applyFormatter(current, formatter.name, formatter.arg, context)

        // If we get null and there are more formatters, check if any is default
        if (result === null) {
            // Check if remaining formatters include default
            const remainingIndex = formatters.indexOf(formatter) + 1
            const hasDefault = formatters.slice(remainingIndex).some((f) => f.name === 'default')
            if (!hasDefault) {
                return null
            }
            // Continue with null to let default formatter handle it
            current = null
        } else {
            current = result
        }
    }

    // Final conversion to string
    if (current === null || current === undefined) {
        return null
    }

    return String(current)
}

/**
 * Check if formatters include a default formatter
 * Useful for validation to know if null values will be handled
 *
 * @param formatters - Array of formatters
 * @returns True if any formatter is 'default'
 */
export function hasDefaultFormatter(formatters: ParsedFormatter[]): boolean {
    return formatters.some((f) => f.name === 'default')
}

/**
 * Get the default value from formatters if present
 *
 * @param formatters - Array of formatters
 * @returns The default value argument, or undefined if no default formatter
 */
export function getDefaultValue(formatters: ParsedFormatter[]): string | undefined {
    const defaultFormatter = formatters.find((f) => f.name === 'default')
    return defaultFormatter?.arg ?? undefined
}
