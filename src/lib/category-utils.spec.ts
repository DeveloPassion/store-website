import { describe, it, expect } from 'vitest'
import {
    getFeaturedCategories,
    getNonFeaturedCategories,
    sortCategoriesByPriority,
    getFeaturedCategoriesSorted,
    getNonFeaturedCategoriesSorted
} from './category-utils'
import type { Category } from '@/types/category'

const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
    id: 'guides', // Use valid category ID from CategoryIdSchema
    name: 'Test Category',
    description: 'Test description',
    featured: false,
    priority: 50,
    ...overrides
})

describe('category-utils', () => {
    const mockCategories: Category[] = [
        createMockCategory({
            id: 'ai-mastery',
            name: 'Featured High',
            featured: true,
            priority: 1
        }),
        createMockCategory({ id: 'bundles', name: 'Featured Low', featured: true, priority: 5 }),
        createMockCategory({
            id: 'guides',
            name: 'Not Featured High',
            featured: false,
            priority: 2
        }),
        createMockCategory({ id: 'tools', name: 'Not Featured Low', featured: false, priority: 10 })
    ]

    describe('getFeaturedCategories', () => {
        it('should return only featured categories', () => {
            const result = getFeaturedCategories(mockCategories)
            expect(result).toHaveLength(2)
            expect(result.every((cat) => cat.featured)).toBe(true)
        })

        it('should return empty array when no featured categories', () => {
            const categories = [createMockCategory({ featured: false })]
            expect(getFeaturedCategories(categories)).toEqual([])
        })
    })

    describe('getNonFeaturedCategories', () => {
        it('should return only non-featured categories', () => {
            const result = getNonFeaturedCategories(mockCategories)
            expect(result).toHaveLength(2)
            expect(result.every((cat) => !cat.featured)).toBe(true)
        })

        it('should return empty array when all categories are featured', () => {
            const categories = [createMockCategory({ featured: true })]
            expect(getNonFeaturedCategories(categories)).toEqual([])
        })
    })

    describe('sortCategoriesByPriority', () => {
        it('should sort categories by priority ascending', () => {
            const sorted = sortCategoriesByPriority(mockCategories)
            expect(sorted[0]!.priority).toBe(1)
            expect(sorted[1]!.priority).toBe(2)
            expect(sorted[2]!.priority).toBe(5)
            expect(sorted[3]!.priority).toBe(10)
        })

        it('should sort alphabetically when priorities are equal', () => {
            const categories = [
                createMockCategory({ name: 'Zebra', priority: 5 }),
                createMockCategory({ name: 'Alpha', priority: 5 }),
                createMockCategory({ name: 'Beta', priority: 5 })
            ]

            const sorted = sortCategoriesByPriority(categories)
            expect(sorted[0]!.name).toBe('Alpha')
            expect(sorted[1]!.name).toBe('Beta')
            expect(sorted[2]!.name).toBe('Zebra')
        })

        it('should not mutate original array', () => {
            const original = [...mockCategories]
            sortCategoriesByPriority(mockCategories)
            expect(mockCategories).toEqual(original)
        })
    })

    describe('getFeaturedCategoriesSorted', () => {
        it('should return featured categories sorted by priority', () => {
            const result = getFeaturedCategoriesSorted(mockCategories)

            expect(result).toHaveLength(2)
            expect(result.every((cat) => cat.featured)).toBe(true)
            expect(result[0]!.priority).toBe(1)
            expect(result[1]!.priority).toBe(5)
        })

        it('should return empty array when no featured categories', () => {
            const categories = [createMockCategory({ featured: false })]
            expect(getFeaturedCategoriesSorted(categories)).toEqual([])
        })
    })

    describe('getNonFeaturedCategoriesSorted', () => {
        it('should return non-featured categories sorted by priority', () => {
            const result = getNonFeaturedCategoriesSorted(mockCategories)

            expect(result).toHaveLength(2)
            expect(result.every((cat) => !cat.featured)).toBe(true)
            expect(result[0]!.priority).toBe(2)
            expect(result[1]!.priority).toBe(10)
        })

        it('should return empty array when all categories are featured', () => {
            const categories = [createMockCategory({ featured: true })]
            expect(getNonFeaturedCategoriesSorted(categories)).toEqual([])
        })
    })
})
