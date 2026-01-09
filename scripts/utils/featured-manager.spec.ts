/**
 * Unit tests for featured-manager utility
 */

import { describe, it, expect } from 'vitest'
import {
    FeaturedItem,
    RenumberConfig,
    calculateFeaturedStats,
    autoRenumberPriorities,
    moveItemUp,
    moveItemDown,
    validateFeaturedOperation
} from './featured-manager.js'

// Mock data factories
const createMockItem = (overrides: Partial<FeaturedItem> = {}): FeaturedItem => ({
    id: 'test-id',
    name: 'Test Item',
    featured: false,
    priority: 50,
    ...overrides
})

const tagsConfig: RenumberConfig = {
    featuredStart: 1,
    featuredEnd: 8,
    nonFeaturedStart: 21
}

const categoriesConfig: RenumberConfig = {
    featuredStart: 1,
    featuredEnd: 7,
    nonFeaturedStart: 8
}

describe('calculateFeaturedStats', () => {
    it('should calculate correct counts', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 1 }),
            createMockItem({ id: 'item2', featured: true, priority: 2 }),
            createMockItem({ id: 'item3', featured: false, priority: 21 }),
            createMockItem({ id: 'item4', featured: false, priority: 22 })
        ]

        const stats = calculateFeaturedStats(items, tagsConfig)

        expect(stats.totalCount).toBe(4)
        expect(stats.featuredCount).toBe(2)
        expect(stats.nonFeaturedCount).toBe(2)
    })

    it('should detect no gaps when priorities are sequential', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 1 }),
            createMockItem({ id: 'item2', featured: true, priority: 2 }),
            createMockItem({ id: 'item3', featured: false, priority: 21 }),
            createMockItem({ id: 'item4', featured: false, priority: 22 })
        ]

        const stats = calculateFeaturedStats(items, tagsConfig)

        expect(stats.hasPriorityGaps).toBe(false)
        expect(stats.gapDetails).toBeUndefined()
    })

    it('should detect gaps in featured priorities', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 1 }),
            createMockItem({ id: 'item2', featured: true, priority: 3 }), // Gap: should be 2
            createMockItem({ id: 'item3', featured: false, priority: 21 })
        ]

        const stats = calculateFeaturedStats(items, tagsConfig)

        expect(stats.hasPriorityGaps).toBe(true)
        expect(stats.gapDetails).toBeDefined()
        expect(stats.gapDetails?.length).toBeGreaterThan(0)
    })

    it('should detect gaps in non-featured priorities', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 1 }),
            createMockItem({ id: 'item2', featured: false, priority: 21 }),
            createMockItem({ id: 'item3', featured: false, priority: 25 }) // Gap: should be 22
        ]

        const stats = calculateFeaturedStats(items, tagsConfig)

        expect(stats.hasPriorityGaps).toBe(true)
        expect(stats.gapDetails).toBeDefined()
    })

    it('should calculate correct ranges', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 2 }),
            createMockItem({ id: 'item2', featured: true, priority: 5 }),
            createMockItem({ id: 'item3', featured: false, priority: 25 }),
            createMockItem({ id: 'item4', featured: false, priority: 30 })
        ]

        const stats = calculateFeaturedStats(items, tagsConfig)

        expect(stats.featuredRange.min).toBe(2)
        expect(stats.featuredRange.max).toBe(5)
        expect(stats.nonFeaturedRange.min).toBe(25)
        expect(stats.nonFeaturedRange.max).toBe(30)
    })

    it('should handle empty array', () => {
        const stats = calculateFeaturedStats([], tagsConfig)

        expect(stats.totalCount).toBe(0)
        expect(stats.featuredCount).toBe(0)
        expect(stats.nonFeaturedCount).toBe(0)
        expect(stats.hasPriorityGaps).toBe(false)
    })

    it('should handle all featured items', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 1 }),
            createMockItem({ id: 'item2', featured: true, priority: 2 })
        ]

        const stats = calculateFeaturedStats(items, tagsConfig)

        expect(stats.featuredCount).toBe(2)
        expect(stats.nonFeaturedCount).toBe(0)
    })

    it('should handle no featured items', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: false, priority: 21 }),
            createMockItem({ id: 'item2', featured: false, priority: 22 })
        ]

        const stats = calculateFeaturedStats(items, tagsConfig)

        expect(stats.featuredCount).toBe(0)
        expect(stats.nonFeaturedCount).toBe(2)
    })
})

describe('autoRenumberPriorities', () => {
    it('should renumber featured items sequentially', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 5 }),
            createMockItem({ id: 'item2', featured: true, priority: 3 }),
            createMockItem({ id: 'item3', featured: true, priority: 8 })
        ]

        const result = autoRenumberPriorities(items, tagsConfig)
        const featured = result.filter((i) => i.featured).sort((a, b) => a.priority - b.priority)

        expect(featured[0].priority).toBe(1)
        expect(featured[1].priority).toBe(2)
        expect(featured[2].priority).toBe(3)
    })

    it('should renumber non-featured items sequentially', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: false, priority: 25 }),
            createMockItem({ id: 'item2', featured: false, priority: 30 }),
            createMockItem({ id: 'item3', featured: false, priority: 21 })
        ]

        const result = autoRenumberPriorities(items, tagsConfig)
        const nonFeatured = result
            .filter((i) => !i.featured)
            .sort((a, b) => a.priority - b.priority)

        expect(nonFeatured[0].priority).toBe(21)
        expect(nonFeatured[1].priority).toBe(22)
        expect(nonFeatured[2].priority).toBe(23)
    })

    it('should preserve relative order within featured group', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'First', featured: true, priority: 3 }),
            createMockItem({ id: 'item2', name: 'Second', featured: true, priority: 5 }),
            createMockItem({ id: 'item3', name: 'Third', featured: true, priority: 7 })
        ]

        const result = autoRenumberPriorities(items, tagsConfig)
        const featured = result.filter((i) => i.featured).sort((a, b) => a.priority - b.priority)

        expect(featured[0].name).toBe('First')
        expect(featured[1].name).toBe('Second')
        expect(featured[2].name).toBe('Third')
    })

    it('should preserve relative order within non-featured group', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'Alpha', featured: false, priority: 30 }),
            createMockItem({ id: 'item2', name: 'Beta', featured: false, priority: 25 }),
            createMockItem({ id: 'item3', name: 'Gamma', featured: false, priority: 35 })
        ]

        const result = autoRenumberPriorities(items, tagsConfig)
        const nonFeatured = result
            .filter((i) => !i.featured)
            .sort((a, b) => a.priority - b.priority)

        expect(nonFeatured[0].name).toBe('Beta') // Was priority 25
        expect(nonFeatured[1].name).toBe('Alpha') // Was priority 30
        expect(nonFeatured[2].name).toBe('Gamma') // Was priority 35
    })

    it('should handle mixed featured and non-featured', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 5 }),
            createMockItem({ id: 'item2', featured: false, priority: 30 }),
            createMockItem({ id: 'item3', featured: true, priority: 3 }),
            createMockItem({ id: 'item4', featured: false, priority: 25 })
        ]

        const result = autoRenumberPriorities(items, tagsConfig)

        const featured = result.filter((i) => i.featured)
        const nonFeatured = result.filter((i) => !i.featured)

        expect(featured.length).toBe(2)
        expect(nonFeatured.length).toBe(2)

        featured.forEach((item, index) => {
            expect(item.priority).toBe(tagsConfig.featuredStart + index)
        })

        nonFeatured.forEach((item, index) => {
            expect(item.priority).toBe(tagsConfig.nonFeaturedStart + index)
        })
    })

    it('should work with categories config', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 5 }),
            createMockItem({ id: 'item2', featured: false, priority: 15 })
        ]

        const result = autoRenumberPriorities(items, categoriesConfig)

        const featured = result.find((i) => i.featured)
        const nonFeatured = result.find((i) => !i.featured)

        expect(featured?.priority).toBe(1)
        expect(nonFeatured?.priority).toBe(8) // Categories non-featured start at 8
    })

    it('should handle empty array', () => {
        const result = autoRenumberPriorities([], tagsConfig)
        expect(result).toEqual([])
    })

    it('should not mutate original array', () => {
        const items: FeaturedItem[] = [createMockItem({ id: 'item1', featured: true, priority: 5 })]
        const originalPriority = items[0].priority

        autoRenumberPriorities(items, tagsConfig)

        expect(items[0].priority).toBe(originalPriority) // Should remain unchanged
    })
})

describe('moveItemUp', () => {
    it('should swap priorities with item above', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'First', priority: 1 }),
            createMockItem({ id: 'item2', name: 'Second', priority: 2 }),
            createMockItem({ id: 'item3', name: 'Third', priority: 3 })
        ]

        const result = moveItemUp(items, 1) // Move "Second" up

        expect(result[0].name).toBe('Second')
        expect(result[0].priority).toBe(1)
        expect(result[1].name).toBe('First')
        expect(result[1].priority).toBe(2)
    })

    it('should not move item at index 0', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'First', priority: 1 }),
            createMockItem({ id: 'item2', name: 'Second', priority: 2 })
        ]

        const result = moveItemUp(items, 0) // Try to move first item up

        expect(result[0].name).toBe('First') // Should remain in place
        expect(result[0].priority).toBe(1)
    })

    it('should not mutate original array', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'First', priority: 1 }),
            createMockItem({ id: 'item2', name: 'Second', priority: 2 })
        ]

        const originalFirstName = items[0].name
        moveItemUp(items, 1)

        expect(items[0].name).toBe(originalFirstName) // Original should be unchanged
    })
})

describe('moveItemDown', () => {
    it('should swap priorities with item below', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'First', priority: 1 }),
            createMockItem({ id: 'item2', name: 'Second', priority: 2 }),
            createMockItem({ id: 'item3', name: 'Third', priority: 3 })
        ]

        const result = moveItemDown(items, 0) // Move "First" down

        expect(result[0].name).toBe('Second')
        expect(result[0].priority).toBe(1) // Gets First's priority
        expect(result[1].name).toBe('First')
        expect(result[1].priority).toBe(2) // Gets Second's priority
    })

    it('should not move item at last index', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'First', priority: 1 }),
            createMockItem({ id: 'item2', name: 'Second', priority: 2 })
        ]

        const result = moveItemDown(items, 1) // Try to move last item down

        expect(result[1].name).toBe('Second') // Should remain in place
        expect(result[1].priority).toBe(2)
    })

    it('should not mutate original array', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'First', priority: 1 }),
            createMockItem({ id: 'item2', name: 'Second', priority: 2 })
        ]

        const originalFirstName = items[0].name
        moveItemDown(items, 0)

        expect(items[0].name).toBe(originalFirstName) // Original should be unchanged
    })
})

describe('validateFeaturedOperation', () => {
    it('should pass validation for valid items', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 1 }),
            createMockItem({ id: 'item2', featured: true, priority: 2 }),
            createMockItem({ id: 'item3', featured: false, priority: 21 })
        ]

        const result = validateFeaturedOperation(items, tagsConfig)

        expect(result.success).toBe(true)
        expect(result.errors).toEqual([])
    })

    it('should allow any number of featured items', () => {
        const items: FeaturedItem[] = Array.from({ length: 20 }, (_, i) =>
            createMockItem({ id: `item${i}`, featured: true, priority: i + 1 })
        )

        const result = validateFeaturedOperation(items, tagsConfig)

        expect(result.success).toBe(true)
        expect(result.errors).toEqual([])
    })

    it('should detect duplicate priorities', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'First', featured: true, priority: 1 }),
            createMockItem({ id: 'item2', name: 'Second', featured: true, priority: 1 }) // Duplicate!
        ]

        const result = validateFeaturedOperation(items, tagsConfig)

        expect(result.success).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors[0]).toContain('Duplicate priority')
    })

    it('should detect featured item with priority outside valid range', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'Invalid', featured: true, priority: 25 }) // Should be 1-20 (below nonFeaturedStart)
        ]

        const result = validateFeaturedOperation(items, tagsConfig)

        expect(result.success).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors[0]).toContain('outside valid range')
    })

    it('should detect non-featured item below minimum priority', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'Invalid', featured: false, priority: 10 }) // Should be 21+
        ]

        const result = validateFeaturedOperation(items, tagsConfig)

        expect(result.success).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors[0]).toContain('below minimum')
    })

    it('should work with categories config', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', featured: true, priority: 1 }),
            createMockItem({ id: 'item2', featured: false, priority: 8 })
        ]

        const result = validateFeaturedOperation(items, categoriesConfig)

        expect(result.success).toBe(true)
        expect(result.errors).toEqual([])
    })

    it('should handle empty array', () => {
        const result = validateFeaturedOperation([], tagsConfig)

        expect(result.success).toBe(true)
        expect(result.errors).toEqual([])
    })

    it('should accumulate multiple errors', () => {
        const items: FeaturedItem[] = [
            createMockItem({ id: 'item1', name: 'Dup1', featured: true, priority: 1 }),
            createMockItem({ id: 'item2', name: 'Dup2', featured: true, priority: 1 }), // Duplicate
            createMockItem({ id: 'item3', name: 'OutOfRange', featured: true, priority: 50 }) // Out of range
        ]

        const result = validateFeaturedOperation(items, tagsConfig)

        expect(result.success).toBe(false)
        expect(result.errors.length).toBeGreaterThanOrEqual(2) // At least 2 errors
    })
})
