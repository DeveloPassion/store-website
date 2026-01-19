import { z } from 'zod'

/**
 * Schema for a redirect entry in redirects.json
 * Used by scripts/generate-redirects.ts to generate public/_redirects
 */
export const RedirectEntrySchema = z.object({
    /**
     * Source path (e.g., "/affiliates", "/*")
     */
    source: z.string().min(1, 'Source path is required'),

    /**
     * Destination URL or path
     * Can be an internal path (/index.html) or external URL (https://...)
     */
    destination: z.string().min(1, 'Destination is required'),

    /**
     * HTTP status code for the redirect
     * Common values: 301 (permanent), 302 (temporary), 200 (rewrite/SPA)
     */
    httpStatusCode: z.number().int().min(100).max(599)
})

/**
 * Schema for the src/data/redirects.json file
 */
export const RedirectsFileSchema = z.object({
    redirects: z.array(RedirectEntrySchema)
})

// Export TypeScript types
export type RedirectEntry = z.infer<typeof RedirectEntrySchema>
export type RedirectsFile = z.infer<typeof RedirectsFileSchema>
