import { describe, it, expect } from 'bun:test'
import {
    getFeatured,
    getNonFeatured,
    sortByPriority,
    getFeaturedSorted,
    getNonFeaturedSorted
} from './collection-utils'

interface TestItem {
    featured: boolean
    priority: number
    name: string
}

describe('collection-utils', () => {
    const mockItems: TestItem[] = [
        { name: 'Featured High Priority', featured: true, priority: 1 },
        { name: 'Featured Low Priority', featured: true, priority: 5 },
        { name: 'Not Featured High Priority', featured: false, priority: 2 },
        { name: 'Not Featured Low Priority', featured: false, priority: 10 },
        { name: 'Featured Same Priority A', featured: true, priority: 3 },
        { name: 'Featured Same Priority B', featured: true, priority: 3 }
    ]

    describe('getFeatured', () => {
        it('should return only featured items', () => {
            const result = getFeatured(mockItems)
            expect(result).toHaveLength(4)
            expect(result.every((item) => item.featured)).toBe(true)
        })

        it('should return empty array when no featured items', () => {
            const items: TestItem[] = [{ name: 'Test', featured: false, priority: 1 }]
            expect(getFeatured(items)).toEqual([])
        })

        it('should return empty array for empty input', () => {
            expect(getFeatured([])).toEqual([])
        })
    })

    describe('getNonFeatured', () => {
        it('should return only non-featured items', () => {
            const result = getNonFeatured(mockItems)
            expect(result).toHaveLength(2)
            expect(result.every((item) => !item.featured)).toBe(true)
        })

        it('should return empty array when all items are featured', () => {
            const items: TestItem[] = [{ name: 'Test', featured: true, priority: 1 }]
            expect(getNonFeatured(items)).toEqual([])
        })

        it('should return empty array for empty input', () => {
            expect(getNonFeatured([])).toEqual([])
        })
    })

    describe('sortByPriority', () => {
        it('should sort by priority ascending (lower number = higher priority)', () => {
            const items: TestItem[] = [
                { name: 'Low Priority', featured: false, priority: 10 },
                { name: 'High Priority', featured: false, priority: 1 },
                { name: 'Medium Priority', featured: false, priority: 5 }
            ]

            const sorted = sortByPriority(items)
            expect(sorted[0]!.priority).toBe(1)
            expect(sorted[1]!.priority).toBe(5)
            expect(sorted[2]!.priority).toBe(10)
        })

        it('should sort alphabetically when priorities are equal', () => {
            const items: TestItem[] = [
                { name: 'Zebra', featured: false, priority: 5 },
                { name: 'Alpha', featured: false, priority: 5 },
                { name: 'Beta', featured: false, priority: 5 }
            ]

            const sorted = sortByPriority(items)
            expect(sorted[0]!.name).toBe('Alpha')
            expect(sorted[1]!.name).toBe('Beta')
            expect(sorted[2]!.name).toBe('Zebra')
        })

        it('should not mutate original array', () => {
            const items: TestItem[] = [
                { name: 'B', featured: false, priority: 2 },
                { name: 'A', featured: false, priority: 1 }
            ]
            const original = [...items]

            sortByPriority(items)
            expect(items).toEqual(original)
        })

        it('should handle empty array', () => {
            expect(sortByPriority([])).toEqual([])
        })

        it('should handle single item', () => {
            const items: TestItem[] = [{ name: 'Only', featured: false, priority: 1 }]
            expect(sortByPriority(items)).toEqual(items)
        })
    })

    describe('getFeaturedSorted', () => {
        it('should return featured items sorted by priority', () => {
            const result = getFeaturedSorted(mockItems)

            expect(result).toHaveLength(4)
            expect(result.every((item) => item.featured)).toBe(true)
            expect(result[0]!.priority).toBe(1)
            expect(result[1]!.priority).toBe(3)
            expect(result[2]!.priority).toBe(3)
            expect(result[3]!.priority).toBe(5)
        })

        it('should sort alphabetically within same priority', () => {
            const result = getFeaturedSorted(mockItems)

            // Find items with priority 3
            const samePriorityItems = result.filter((item) => item.priority === 3)
            expect(samePriorityItems[0]!.name).toBe('Featured Same Priority A')
            expect(samePriorityItems[1]!.name).toBe('Featured Same Priority B')
        })

        it('should return empty array when no featured items', () => {
            const items: TestItem[] = [{ name: 'Test', featured: false, priority: 1 }]
            expect(getFeaturedSorted(items)).toEqual([])
        })

        it('should not mutate original array', () => {
            const original = [...mockItems]
            getFeaturedSorted(mockItems)
            expect(mockItems).toEqual(original)
        })
    })

    describe('getNonFeaturedSorted', () => {
        it('should return non-featured items sorted by priority', () => {
            const result = getNonFeaturedSorted(mockItems)

            expect(result).toHaveLength(2)
            expect(result.every((item) => !item.featured)).toBe(true)
            expect(result[0]!.priority).toBe(2)
            expect(result[1]!.priority).toBe(10)
        })

        it('should return empty array when all items are featured', () => {
            const items: TestItem[] = [{ name: 'Test', featured: true, priority: 1 }]
            expect(getNonFeaturedSorted(items)).toEqual([])
        })

        it('should not mutate original array', () => {
            const original = [...mockItems]
            getNonFeaturedSorted(mockItems)
            expect(mockItems).toEqual(original)
        })
    })
})
