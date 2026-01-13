import { describe, it, expect } from 'bun:test'
import {
    parseRedirects,
    findLocalProductId,
    findAllLocalProductIds,
    getUniqueLocalProductIds,
    findGumroadSlugsForProduct
} from './redirects-parser.js'

describe('redirects-parser', () => {
    const sampleRedirects = `
# Redirects: From Gumroad /l/:product-slug to /product/:id

## PKM Library
/l/PersonalKnowledgeManagementLibrary /product/pkm-library 301
/l/PersonalKnowledgeManagementLibrary /product/pkm-library 301

## Obsidian Starter Kit (OSK)
/l/obsidian-starter-kit /product/obsidian-starter-kit 301
/l/mghmmj /product/obsidian-starter-kit 301

## Everything Knowledge Bundle
/l/everything-knowledge /product/everything-knowledge-bundle 301
/l/lbocum /product/everything-knowledge-bundle 301

# Other redirects
/affiliates https://developassion.gumroad.com/affiliates 301

# SPA fallback - catch all non-file requests and serve index.html
/*  /index.html  200
`

    describe('parseRedirects', () => {
        it('should parse valid redirect lines', () => {
            const mappings = parseRedirects(sampleRedirects)

            expect(mappings.length).toBeGreaterThan(0)
            expect(
                mappings.some(
                    (m) =>
                        m.gumroadSlug === 'obsidian-starter-kit' &&
                        m.localProductId === 'obsidian-starter-kit'
                )
            ).toBe(true)
        })

        it('should handle short slugs', () => {
            const mappings = parseRedirects(sampleRedirects)

            expect(
                mappings.some(
                    (m) => m.gumroadSlug === 'mghmmj' && m.localProductId === 'obsidian-starter-kit'
                )
            ).toBe(true)
        })

        it('should skip comments', () => {
            const mappings = parseRedirects(sampleRedirects)

            expect(mappings.some((m) => m.gumroadSlug.startsWith('#'))).toBe(false)
        })

        it('should skip non-Gumroad redirects', () => {
            const mappings = parseRedirects(sampleRedirects)

            // /affiliates redirect should not be included
            expect(mappings.some((m) => m.gumroadSlug === 'affiliates')).toBe(false)
        })

        it('should skip SPA fallback', () => {
            const mappings = parseRedirects(sampleRedirects)

            expect(mappings.some((m) => m.gumroadSlug === '*')).toBe(false)
        })

        it('should handle empty content', () => {
            const mappings = parseRedirects('')

            expect(mappings).toEqual([])
        })

        it('should handle content with only comments', () => {
            const mappings = parseRedirects('# Just a comment\n# Another comment')

            expect(mappings).toEqual([])
        })

        it('should handle duplicate entries', () => {
            const mappings = parseRedirects(sampleRedirects)

            // PKM Library appears twice with the same slug
            const pkmMappings = mappings.filter(
                (m) => m.gumroadSlug === 'PersonalKnowledgeManagementLibrary'
            )
            expect(pkmMappings.length).toBe(2)
        })
    })

    describe('findLocalProductId', () => {
        it('should find local product ID by exact slug match', () => {
            const mappings = parseRedirects(sampleRedirects)

            const result = findLocalProductId(mappings, 'obsidian-starter-kit')

            expect(result).toBe('obsidian-starter-kit')
        })

        it('should find local product ID by short slug', () => {
            const mappings = parseRedirects(sampleRedirects)

            const result = findLocalProductId(mappings, 'mghmmj')

            expect(result).toBe('obsidian-starter-kit')
        })

        it('should be case-insensitive', () => {
            const mappings = parseRedirects(sampleRedirects)

            const result = findLocalProductId(mappings, 'OBSIDIAN-STARTER-KIT')

            expect(result).toBe('obsidian-starter-kit')
        })

        it('should return null for unknown slug', () => {
            const mappings = parseRedirects(sampleRedirects)

            const result = findLocalProductId(mappings, 'unknown-product')

            expect(result).toBeNull()
        })
    })

    describe('findAllLocalProductIds', () => {
        it('should return all matching local product IDs', () => {
            const mappings = parseRedirects(sampleRedirects)

            const results = findAllLocalProductIds(mappings, 'PersonalKnowledgeManagementLibrary')

            // Duplicates in file should both be returned
            expect(results.length).toBe(2)
            expect(results.every((id) => id === 'pkm-library')).toBe(true)
        })

        it('should return empty array for unknown slug', () => {
            const mappings = parseRedirects(sampleRedirects)

            const results = findAllLocalProductIds(mappings, 'unknown-product')

            expect(results).toEqual([])
        })
    })

    describe('getUniqueLocalProductIds', () => {
        it('should return unique local product IDs', () => {
            const mappings = parseRedirects(sampleRedirects)

            const uniqueIds = getUniqueLocalProductIds(mappings)

            // Should not have duplicates
            expect(new Set(uniqueIds).size).toBe(uniqueIds.length)

            // Should include known products
            expect(uniqueIds).toContain('pkm-library')
            expect(uniqueIds).toContain('obsidian-starter-kit')
            expect(uniqueIds).toContain('everything-knowledge-bundle')
        })
    })

    describe('findGumroadSlugsForProduct', () => {
        it('should return all Gumroad slugs for a local product', () => {
            const mappings = parseRedirects(sampleRedirects)

            const slugs = findGumroadSlugsForProduct(mappings, 'obsidian-starter-kit')

            expect(slugs).toContain('obsidian-starter-kit')
            expect(slugs).toContain('mghmmj')
            expect(slugs.length).toBe(2)
        })

        it('should return empty array for unknown product', () => {
            const mappings = parseRedirects(sampleRedirects)

            const slugs = findGumroadSlugsForProduct(mappings, 'unknown-product')

            expect(slugs).toEqual([])
        })
    })
})
