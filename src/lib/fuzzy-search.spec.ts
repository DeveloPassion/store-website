import { describe, it, expect } from 'bun:test'
import { fuzzySearch, simpleFuzzySearch, type FuzzySearchConfig } from './fuzzy-search'

interface TestProduct {
    id: string
    name: string
    description: string
    tags: string[]
}

describe('fuzzy-search', () => {
    const mockProducts: TestProduct[] = [
        {
            id: '1',
            name: 'Obsidian Starter Kit',
            description: 'A comprehensive kit for getting started with Obsidian',
            tags: ['obsidian', 'pkm', 'note-taking']
        },
        {
            id: '2',
            name: 'TypeScript Course',
            description: 'Learn TypeScript from scratch',
            tags: ['typescript', 'programming', 'course']
        },
        {
            id: '3',
            name: 'Knowledge Management System',
            description: 'Build your personal knowledge base',
            tags: ['knowledge', 'pkm', 'productivity']
        },
        {
            id: '4',
            name: 'React Fundamentals',
            description: 'Master React basics',
            tags: ['react', 'javascript', 'frontend']
        }
    ]

    const config: FuzzySearchConfig<'name' | 'description' | 'tags'> = {
        fields: {
            name: { weight: 5 },
            description: { weight: 2 },
            tags: { weight: 3 }
        }
    }

    const getFieldValue = (
        product: TestProduct,
        field: 'name' | 'description' | 'tags'
    ): string | string[] => {
        switch (field) {
            case 'name':
                return product.name
            case 'description':
                return product.description
            case 'tags':
                return product.tags
        }
    }

    describe('fuzzySearch', () => {
        it('should return empty array for empty query', () => {
            const result = fuzzySearch(mockProducts, '', config, getFieldValue)
            expect(result).toEqual([])
        })

        it('should return empty array for whitespace-only query', () => {
            const result = fuzzySearch(mockProducts, '   ', config, getFieldValue)
            expect(result).toEqual([])
        })

        it('should find exact string matches', () => {
            const result = fuzzySearch(mockProducts, 'Obsidian', config, getFieldValue)
            expect(result.length).toBeGreaterThan(0)
            expect(result[0]!.name).toBe('Obsidian Starter Kit')
        })

        it('should be case insensitive', () => {
            const result = fuzzySearch(mockProducts, 'obsidian', config, getFieldValue)
            expect(result.length).toBeGreaterThan(0)
            expect(result[0]!.name).toBe('Obsidian Starter Kit')
        })

        it('should find fuzzy/partial matches', () => {
            // "obsk" should match "Obsidian Starter Kit"
            const result = fuzzySearch(mockProducts, 'obsk', config, getFieldValue)
            expect(result.length).toBeGreaterThan(0)
            expect(result[0]!.name).toBe('Obsidian Starter Kit')
        })

        it('should find abbreviation-style matches', () => {
            // "tsc" should match "TypeScript Course"
            const result = fuzzySearch(mockProducts, 'tsc', config, getFieldValue)
            expect(result.length).toBeGreaterThan(0)
            expect(result[0]!.name).toBe('TypeScript Course')
        })

        it('should search in tags', () => {
            const result = fuzzySearch(mockProducts, 'pkm', config, getFieldValue)
            expect(result.length).toBe(2)
            // Both products with "pkm" tag should be found
            const names = result.map((p) => p.name)
            expect(names).toContain('Obsidian Starter Kit')
            expect(names).toContain('Knowledge Management System')
        })

        it('should rank title matches higher than tag matches', () => {
            // "react" appears in both a title and as a tag
            const result = fuzzySearch(mockProducts, 'react', config, getFieldValue)
            expect(result.length).toBeGreaterThan(0)
            // React Fundamentals should be first (title match with higher weight)
            expect(result[0]!.name).toBe('React Fundamentals')
        })

        it('should respect the limit option', () => {
            // Search for something that matches multiple items
            const result = fuzzySearch(mockProducts, 'p', config, getFieldValue, { limit: 2 })
            expect(result.length).toBe(2)
        })

        it('should return all matches when limit is not specified', () => {
            const result = fuzzySearch(mockProducts, 'a', config, getFieldValue)
            // Multiple products should match "a"
            expect(result.length).toBeGreaterThan(1)
        })

        it('should handle items with null/undefined field values', () => {
            const itemsWithNulls = [
                { id: '1', name: 'Test Product', description: null as unknown as string, tags: [] }
            ]
            const result = fuzzySearch(itemsWithNulls, 'test', config, (item, field) => {
                if (field === 'name') return item.name
                if (field === 'description') return item.description
                return item.tags
            })
            expect(result.length).toBe(1)
        })

        it('should not mutate the original array', () => {
            const original = [...mockProducts]
            fuzzySearch(mockProducts, 'obsidian', config, getFieldValue)
            expect(mockProducts).toEqual(original)
        })

        it('should handle empty items array', () => {
            const result = fuzzySearch([], 'test', config, getFieldValue)
            expect(result).toEqual([])
        })

        it('should find substring matches', () => {
            const result = fuzzySearch(mockProducts, 'starter', config, getFieldValue)
            expect(result.length).toBeGreaterThan(0)
            expect(result[0]!.name).toBe('Obsidian Starter Kit')
        })

        it('should rank exact matches higher than substring matches', () => {
            const items = [
                { id: '1', name: 'Knowledge Base', description: '', tags: [] },
                { id: '2', name: 'Knowledge', description: '', tags: [] }
            ]
            const result = fuzzySearch(items, 'knowledge', config, (item, field) => {
                if (field === 'name') return item.name
                if (field === 'description') return item.description
                return item.tags
            })
            expect(result.length).toBe(2)
            // Exact match should be ranked higher
            expect(result[0]!.name).toBe('Knowledge')
        })
    })

    describe('simpleFuzzySearch', () => {
        const items = ['Apple', 'Banana', 'Orange', 'Grape', 'Application']

        it('should search on a single text field', () => {
            const result = simpleFuzzySearch(items, 'apple', (item) => item)
            expect(result.length).toBeGreaterThan(0)
            expect(result[0]).toBe('Apple')
        })

        it('should find fuzzy matches', () => {
            const result = simpleFuzzySearch(items, 'app', (item) => item)
            expect(result.length).toBe(2)
            expect(result).toContain('Apple')
            expect(result).toContain('Application')
        })

        it('should return empty array for empty query', () => {
            const result = simpleFuzzySearch(items, '', (item) => item)
            expect(result).toEqual([])
        })

        it('should respect the limit option', () => {
            const result = simpleFuzzySearch(items, 'a', (item) => item, { limit: 2 })
            expect(result.length).toBe(2)
        })

        it('should be case insensitive', () => {
            const result = simpleFuzzySearch(items, 'BANANA', (item) => item)
            expect(result.length).toBe(1)
            expect(result[0]).toBe('Banana')
        })
    })
})
