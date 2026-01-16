import { z } from 'zod'

/**
 * Redirect type enum
 * - TEMPORARY: 302 redirect (temporary, more flexible)
 * - PERMANENT: 301 redirect (permanent, search engines transfer ranking)
 */
export const RedirectTypeSchema = z.enum(['TEMPORARY', 'PERMANENT'])

/**
 * Individual redirect entry schema
 */
export const RedirectEntrySchema = z.object({
    /**
     * Source path (must start with /)
     */
    from: z
        .string()
        .regex(
            /^\/[a-zA-Z0-9\-_/]*$/,
            'Source path must start with / and contain only valid URL characters'
        ),

    /**
     * Destination URL or path
     * Can be an internal path (/path) or external URL (https://...)
     */
    to: z.string().min(1, 'Destination is required'),

    /**
     * Redirect type (301 or 302)
     * @default 'TEMPORARY'
     */
    type: RedirectTypeSchema.default('TEMPORARY'),

    /**
     * Nullable description for documentation
     */
    description: z.string().nullable(),

    /**
     * Whether to include this redirect in sitemap.xml
     * @default false
     */
    includeInSitemap: z.boolean().default(false)
})

/**
 * Redirects configuration schema (array of redirect entries)
 */
export const RedirectsConfigSchema = z
    .array(RedirectEntrySchema)
    .refine(
        (redirects) => {
            // Check for duplicate source paths
            const sources = redirects.map((r) => r.from)
            const uniqueSources = new Set(sources)
            return sources.length === uniqueSources.size
        },
        {
            message: 'Duplicate source paths detected. Each redirect source must be unique.'
        }
    )
    .refine(
        (redirects) => {
            // Detect redirect loops
            // Build a map of from -> to for quick lookup
            const redirectMap = new Map<string, string>()
            for (const redirect of redirects) {
                redirectMap.set(redirect.from, redirect.to)
            }

            // For each redirect, follow the chain and detect loops
            for (const redirect of redirects) {
                const visited = new Set<string>()
                let current = redirect.from

                // Follow the redirect chain
                while (redirectMap.has(current)) {
                    if (visited.has(current)) {
                        // Loop detected
                        return false
                    }
                    visited.add(current)
                    current = redirectMap.get(current)!

                    // Stop if we hit an external URL or internal path not in our redirects
                    if (
                        current.startsWith('http://') ||
                        current.startsWith('https://') ||
                        !redirectMap.has(current)
                    ) {
                        break
                    }
                }
            }

            return true
        },
        {
            message:
                'Redirect loop detected. Redirects cannot form a circular chain (e.g., A → B → A).'
        }
    )

// Export TypeScript types
export type RedirectType = z.infer<typeof RedirectTypeSchema>
export type RedirectEntry = z.infer<typeof RedirectEntrySchema>
export type RedirectsConfig = z.infer<typeof RedirectsConfigSchema>
