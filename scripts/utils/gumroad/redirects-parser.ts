/**
 * Redirects Parser
 * Parses the /public/_redirects file to extract Gumroad slug to local product ID mappings
 */

import type { GumroadMapping } from './types.js'

/**
 * Parse _redirects file content to extract Gumroad → local product ID mappings
 *
 * Expected format:
 * /l/{gumroad-slug} /product/{local-product-id} 301
 *
 * @param content - The contents of the _redirects file
 * @returns Array of GumroadMapping objects
 */
export function parseRedirects(content: string): GumroadMapping[] {
    const mappings: GumroadMapping[] = []
    const lines = content.split('\n')

    for (const line of lines) {
        const trimmed = line.trim()

        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) {
            continue
        }

        // Parse redirect line: /l/{slug} /product/{id} 301
        const match = trimmed.match(/^\/l\/([^\s]+)\s+\/product\/([^\s]+)\s+301$/)

        if (match) {
            const [, gumroadSlug, localProductId] = match
            mappings.push({
                gumroadSlug,
                localProductId
            })
        }
    }

    return mappings
}

/**
 * Find local product ID for a given Gumroad slug
 *
 * @param mappings - Array of GumroadMapping objects (from parseRedirects)
 * @param gumroadSlug - The Gumroad product slug/permalink to look up
 * @returns The local product ID, or null if not found
 */
export function findLocalProductId(mappings: GumroadMapping[], gumroadSlug: string): string | null {
    const mapping = mappings.find((m) => m.gumroadSlug.toLowerCase() === gumroadSlug.toLowerCase())
    return mapping?.localProductId ?? null
}

/**
 * Find all local product IDs that map to a given Gumroad slug
 * (Multiple local products may share the same Gumroad product, e.g., variants)
 *
 * @param mappings - Array of GumroadMapping objects (from parseRedirects)
 * @param gumroadSlug - The Gumroad product slug/permalink to look up
 * @returns Array of local product IDs
 */
export function findAllLocalProductIds(mappings: GumroadMapping[], gumroadSlug: string): string[] {
    return mappings
        .filter((m) => m.gumroadSlug.toLowerCase() === gumroadSlug.toLowerCase())
        .map((m) => m.localProductId)
}

/**
 * Get unique local product IDs from mappings
 * (Deduplicates since multiple slugs can point to the same product)
 *
 * @param mappings - Array of GumroadMapping objects
 * @returns Array of unique local product IDs
 */
export function getUniqueLocalProductIds(mappings: GumroadMapping[]): string[] {
    return [...new Set(mappings.map((m) => m.localProductId))]
}

/**
 * Get all Gumroad slugs that map to a specific local product ID
 *
 * @param mappings - Array of GumroadMapping objects
 * @param localProductId - The local product ID to look up
 * @returns Array of Gumroad slugs
 */
export function findGumroadSlugsForProduct(
    mappings: GumroadMapping[],
    localProductId: string
): string[] {
    return mappings.filter((m) => m.localProductId === localProductId).map((m) => m.gumroadSlug)
}
