/**
 * Redirect utility functions for client-side redirect handling
 */

import type { RedirectEntry, RedirectsConfig } from '@/types/redirect'
import redirectsData from '@/data/redirects.json'

/**
 * Get all configured redirects
 * @returns Array of redirect entries
 */
export function getRedirects(): RedirectsConfig {
    return redirectsData as RedirectsConfig
}

/**
 * Find a redirect by source path
 * @param path - Source path to look up
 * @returns Redirect entry if found, null otherwise
 */
export function findRedirect(path: string): RedirectEntry | null {
    const redirects = getRedirects()
    return redirects.find((r) => r.from === path) || null
}

/**
 * Check if a path should redirect
 * @param path - Path to check
 * @returns true if path has a configured redirect, false otherwise
 */
export function shouldRedirect(path: string): boolean {
    return findRedirect(path) !== null
}
