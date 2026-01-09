#!/usr/bin/env tsx
/**
 * Generate TagId enum from tags.json
 * This updates the tag schema with all valid tag IDs
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TAGS_FILE = resolve(__dirname, '../src/data/tags.json')
const OUTPUT_FILE = resolve(__dirname, '../src/schemas/tag.schema.ts')

function main() {
    console.log('🔍 Reading tags.json...\n')

    const tagsData = JSON.parse(readFileSync(TAGS_FILE, 'utf-8'))
    const tagIds = Object.keys(tagsData).sort()

    console.log(`Found ${tagIds.length} tag IDs\n`)

    // Generate schema file content
    const schemaContent = `import { z } from 'zod'

/**
 * Zod schema for tag validation
 * Source of truth for tags.json
 * Last updated: ${new Date().toISOString().split('T')[0]}
 *
 * This schema validates tags.json entries to ensure data integrity.
 * Keep this schema in sync with the TypeScript types in src/types/tag.ts
 */

export const TagIdSchema = z.enum([
${tagIds.map((id) => `    '${id}'`).join(',\n')}
])

export const TagSchema = z.object({
    id: TagIdSchema,
    name: z.string().min(1, 'Tag name is required'),
    description: z.string().min(1, 'Tag description is required'),
    icon: z.string().optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be hex format (#RRGGBB)')
        .optional(),
    featured: z.boolean(),
    priority: z.number().int().min(1)
})

export const TagsMapSchema = z.record(TagIdSchema, TagSchema)

// Export TypeScript types derived from Zod schemas
export type TagId = z.infer<typeof TagIdSchema>
export type Tag = z.infer<typeof TagSchema>
export type TagsMap = z.infer<typeof TagsMapSchema>
`

    writeFileSync(OUTPUT_FILE, schemaContent, 'utf-8')

    console.log(`✅ Updated ${OUTPUT_FILE}`)
    console.log('\n📝 Next steps:')
    console.log('   1. Update src/types/tag.ts to export TagId type')
    console.log('   2. Update src/schemas/product.schema.ts to use TagIdSchema')
    console.log('   3. Migrate products.json to use normalized tag IDs')
}

main()
