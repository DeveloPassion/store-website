/**
 * Placeholder Resolver - Resolves placeholder paths to actual values
 *
 * This module handles the second phase of placeholder processing:
 * 1. Looking up values from the appropriate source in the context
 * 2. Navigating nested object paths (including array indices)
 * 3. Handling special types like StatItem (extracting .value from objects)
 *
 * @example
 * resolvePath(context, 'stats', 'userCount')
 * // Returns: "1,000+" (extracts value from StatItem if needed)
 *
 * resolvePath(context, 'product', 'variants.0.price')
 * // Returns: 149.99
 */

import type {
    PlaceholderContext,
    PlaceholderSource
} from '../../../src/schemas/placeholder.schema.js'

/**
 * Result of resolving a placeholder path
 */
export interface ResolveResult {
    success: boolean
    value: unknown
    error?: string
}

/**
 * Check if a value is a StatItem object (has value and optional label)
 * StatItem can be either a string or { value: string, label: string | null }
 */
function isStatItemObject(value: unknown): value is { value: string; label: string | null } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'value' in value &&
        typeof (value as Record<string, unknown>).value === 'string'
    )
}

/**
 * Extract the actual value from a StatItem
 * If it's already a string, return it; if it's an object, return the value property
 */
function extractStatItemValue(value: unknown): unknown {
    if (isStatItemObject(value)) {
        return value.value
    }
    return value
}

/**
 * Navigate a dot-separated path through an object
 * Supports array index access (e.g., "variants.0.price")
 *
 * @param obj - The object to navigate
 * @param path - Dot-separated path string
 * @returns The value at the path, or undefined if not found
 */
function navigatePath(obj: unknown, path: string): unknown {
    const parts = path.split('.')
    let current: unknown = obj

    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined
        }

        if (typeof current !== 'object') {
            return undefined
        }

        // Handle array index access
        if (Array.isArray(current)) {
            const index = parseInt(part, 10)
            if (isNaN(index) || index < 0 || index >= current.length) {
                return undefined
            }
            current = current[index]
        } else {
            // Object property access
            current = (current as Record<string, unknown>)[part]
        }
    }

    return current
}

/**
 * Get the source object from the context
 *
 * @param context - The placeholder context
 * @param source - The source name (stats, product, salesCopy, computed)
 * @returns The source object, or null if not available
 */
function getSourceObject(context: PlaceholderContext, source: PlaceholderSource): unknown {
    switch (source) {
        case 'stats':
            return context.stats
        case 'product':
            return context.product
        case 'salesCopy':
            return context.salesCopy
        case 'computed':
            return context.computed
        default:
            return null
    }
}

/**
 * Check if a path points to a stat field that should have StatItem extraction
 * These are the fields in stats.json that use StatItem type
 */
function isStatItemPath(source: PlaceholderSource, path: string): boolean {
    if (source !== 'stats') {
        return false
    }
    // userCount and timeSaved use StatItem type
    const topLevelPath = path.split('.')[0]
    return topLevelPath === 'userCount' || topLevelPath === 'timeSaved'
}

/**
 * Resolve a placeholder path to its value in the context
 *
 * @param context - The placeholder context containing all data sources
 * @param source - The source to look up (stats, product, salesCopy, computed)
 * @param path - The dot-separated path within the source
 * @returns ResolveResult with success status and value or error
 *
 * @example
 * // Simple stat lookup
 * resolvePath(context, 'stats', 'userCount')
 * // Returns: { success: true, value: "1,000+" }
 *
 * // Nested product path
 * resolvePath(context, 'product', 'variants.0.price')
 * // Returns: { success: true, value: 149.99 }
 *
 * // Computed value
 * resolvePath(context, 'computed', 'ratingsCount')
 * // Returns: { success: true, value: 42 }
 */
export function resolvePath(
    context: PlaceholderContext,
    source: PlaceholderSource,
    path: string
): ResolveResult {
    // Get the source object
    const sourceObj = getSourceObject(context, source)

    // Handle null source (e.g., stats might be null)
    if (sourceObj === null || sourceObj === undefined) {
        return {
            success: false,
            value: undefined,
            error: `Source "${source}" is null or undefined`
        }
    }

    // Navigate to the value
    let value = navigatePath(sourceObj, path)

    // Handle StatItem extraction for stats.userCount and stats.timeSaved
    if (isStatItemPath(source, path) && value !== undefined && value !== null) {
        value = extractStatItemValue(value)
    }

    // Check if we found a value
    if (value === undefined) {
        return {
            success: false,
            value: undefined,
            error: `Path "${path}" not found in source "${source}"`
        }
    }

    return {
        success: true,
        value
    }
}

/**
 * Check if a path exists in the context (regardless of null/undefined value)
 * Useful for validation to distinguish between missing paths and null values
 *
 * @param context - The placeholder context
 * @param source - The source name
 * @param path - The path within the source
 * @returns True if the path exists (even if the value is null)
 */
export function pathExists(
    context: PlaceholderContext,
    source: PlaceholderSource,
    path: string
): boolean {
    const sourceObj = getSourceObject(context, source)

    if (sourceObj === null || sourceObj === undefined) {
        return false
    }

    const parts = path.split('.')
    let current: unknown = sourceObj

    for (let i = 0; i < parts.length; i++) {
        if (current === null || current === undefined) {
            return false
        }

        if (typeof current !== 'object') {
            return false
        }

        const part = parts[i]

        if (Array.isArray(current)) {
            const index = parseInt(part, 10)
            if (isNaN(index) || index < 0 || index >= current.length) {
                return false
            }
            current = current[index]
        } else {
            const obj = current as Record<string, unknown>
            if (!(part in obj)) {
                return false
            }
            current = obj[part]
        }
    }

    return true
}

/**
 * Get all available paths for a given source
 * Useful for debugging and error suggestions
 *
 * @param context - The placeholder context
 * @param source - The source name
 * @param maxDepth - Maximum depth to traverse (default: 3)
 * @returns Array of available paths
 */
export function getAvailablePaths(
    context: PlaceholderContext,
    source: PlaceholderSource,
    maxDepth: number = 3
): string[] {
    const sourceObj = getSourceObject(context, source)
    if (sourceObj === null || sourceObj === undefined) {
        return []
    }

    const paths: string[] = []

    function traverse(obj: unknown, currentPath: string, depth: number): void {
        if (depth > maxDepth) {
            return
        }

        if (obj === null || obj === undefined) {
            return
        }

        if (typeof obj !== 'object') {
            return
        }

        if (Array.isArray(obj)) {
            // For arrays, just show first few indices
            for (let i = 0; i < Math.min(obj.length, 3); i++) {
                const indexPath = currentPath ? `${currentPath}.${i}` : String(i)
                paths.push(indexPath)
                traverse(obj[i], indexPath, depth + 1)
            }
        } else {
            for (const [key, value] of Object.entries(obj)) {
                const keyPath = currentPath ? `${currentPath}.${key}` : key
                paths.push(keyPath)
                traverse(value, keyPath, depth + 1)
            }
        }
    }

    traverse(sourceObj, '', 0)
    return paths
}
