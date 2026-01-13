import { describe, it, expect } from 'bun:test'
import {
    getRandomTagline,
    getFeaturedTaglines,
    getTaglinesByCategory,
    getRandomFeaturedTagline,
    getTaglineById,
    getAllTaglineCategories,
    getDailySeed,
    getWeightedRandomTagline
} from './tagline-utils'
import type { Tagline } from '@/schemas/tagline.schema'

describe('tagline-utils', () => {
    // Test data
    const mockTaglines: Tagline[] = [
        {
            id: 'test-1',
            text: 'Test Tagline 1',
            category: 'default',
            featured: true
        },
        {
            id: 'test-2',
            text: 'Test Tagline 2',
            category: 'problem-focused',
            featured: false
        },
        {
            id: 'test-3',
            text: 'Test Tagline 3',
            category: 'default',
            featured: true
        },
        {
            id: 'test-4',
            text: 'Test Tagline 4',
            category: 'action-focused',
            featured: false
        },
        {
            id: 'test-5',
            text: 'Test Tagline 5',
            category: 'outcome-focused',
            featured: true
        }
    ]

    describe('getRandomTagline', () => {
        it('should return a tagline from the array', () => {
            const tagline = getRandomTagline(mockTaglines)
            expect(mockTaglines).toContainEqual(tagline)
        })

        it('should return consistent tagline with same seed', () => {
            const seed = 42
            const tagline1 = getRandomTagline(mockTaglines, seed)
            const tagline2 = getRandomTagline(mockTaglines, seed)
            expect(tagline1).toEqual(tagline2)
        })

        it('should throw error for empty array', () => {
            expect(() => getRandomTagline([])).toThrow('No taglines available')
        })

        it('should handle seed larger than array length', () => {
            const seed = 100
            const tagline = getRandomTagline(mockTaglines, seed)
            expect(mockTaglines).toContainEqual(tagline)
        })
    })

    describe('getFeaturedTaglines', () => {
        it('should return only featured taglines', () => {
            const featured = getFeaturedTaglines(mockTaglines)
            expect(featured).toHaveLength(3)
            expect(featured.every((t) => t.featured)).toBe(true)
        })

        it('should return empty array if no featured taglines', () => {
            const nonFeatured = mockTaglines.filter((t) => !t.featured)
            const featured = getFeaturedTaglines(nonFeatured)
            expect(featured).toHaveLength(0)
        })

        it('should not modify original array', () => {
            const original = [...mockTaglines]
            getFeaturedTaglines(mockTaglines)
            expect(mockTaglines).toEqual(original)
        })
    })

    describe('getTaglinesByCategory', () => {
        it('should return taglines filtered by category', () => {
            const defaultTaglines = getTaglinesByCategory(mockTaglines, 'default')
            expect(defaultTaglines).toHaveLength(2)
            expect(defaultTaglines.every((t) => t.category === 'default')).toBe(true)
        })

        it('should return empty array for category with no taglines', () => {
            const identityTaglines = getTaglinesByCategory(mockTaglines, 'identity-focused')
            expect(identityTaglines).toHaveLength(0)
        })

        it('should not modify original array', () => {
            const original = [...mockTaglines]
            getTaglinesByCategory(mockTaglines, 'default')
            expect(mockTaglines).toEqual(original)
        })
    })

    describe('getRandomFeaturedTagline', () => {
        it('should return a featured tagline', () => {
            const tagline = getRandomFeaturedTagline(mockTaglines)
            expect(tagline.featured).toBe(true)
        })

        it('should return consistent featured tagline with same seed', () => {
            const seed = 42
            const tagline1 = getRandomFeaturedTagline(mockTaglines, seed)
            const tagline2 = getRandomFeaturedTagline(mockTaglines, seed)
            expect(tagline1).toEqual(tagline2)
        })

        it('should throw error if no featured taglines', () => {
            const nonFeatured = mockTaglines.filter((t) => !t.featured)
            expect(() => getRandomFeaturedTagline(nonFeatured)).toThrow('No taglines available')
        })
    })

    describe('getTaglineById', () => {
        it('should return tagline with matching ID', () => {
            const tagline = getTaglineById(mockTaglines, 'test-3')
            expect(tagline).toBeDefined()
            expect(tagline?.id).toBe('test-3')
        })

        it('should return undefined for non-existent ID', () => {
            const tagline = getTaglineById(mockTaglines, 'non-existent')
            expect(tagline).toBeUndefined()
        })

        it('should return first match if duplicate IDs exist', () => {
            const duplicates: Tagline[] = [
                ...mockTaglines,
                {
                    id: 'test-1',
                    text: 'Duplicate',
                    category: 'default',
                    featured: false
                }
            ]
            const tagline = getTaglineById(duplicates, 'test-1')
            expect(tagline?.text).toBe('Test Tagline 1')
        })
    })

    describe('getAllTaglineCategories', () => {
        it('should return unique categories sorted', () => {
            const categories = getAllTaglineCategories(mockTaglines)
            expect(categories).toEqual([
                'action-focused',
                'default',
                'outcome-focused',
                'problem-focused'
            ])
        })

        it('should return empty array for empty taglines array', () => {
            const categories = getAllTaglineCategories([])
            expect(categories).toEqual([])
        })

        it('should handle single category', () => {
            const singleCategory = mockTaglines.filter((t) => t.category === 'default')
            const categories = getAllTaglineCategories(singleCategory)
            expect(categories).toEqual(['default'])
        })
    })

    describe('getDailySeed', () => {
        it('should return a number', () => {
            const seed = getDailySeed()
            expect(typeof seed).toBe('number')
        })

        it('should return consistent seed for same date', () => {
            const date = new Date('2026-01-11')
            const seed1 = getDailySeed(date)
            const seed2 = getDailySeed(date)
            expect(seed1).toBe(seed2)
        })

        it('should return different seeds for different dates', () => {
            const date1 = new Date('2026-01-11')
            const date2 = new Date('2026-01-12')
            const seed1 = getDailySeed(date1)
            const seed2 = getDailySeed(date2)
            expect(seed1).not.toBe(seed2)
        })

        it('should generate seed in expected format', () => {
            const date = new Date('2026-01-11')
            const seed = getDailySeed(date)
            // Expected: 2026 * 10000 + 1 * 100 + 11 = 20260111
            expect(seed).toBe(20260111)
        })

        it('should handle month boundaries correctly', () => {
            const date1 = new Date('2026-01-31')
            const date2 = new Date('2026-02-01')
            const seed1 = getDailySeed(date1)
            const seed2 = getDailySeed(date2)
            expect(seed1).toBe(20260131)
            expect(seed2).toBe(20260201)
        })
    })

    describe('getWeightedRandomTagline', () => {
        it('should return a tagline from the array', () => {
            const tagline = getWeightedRandomTagline(mockTaglines)
            expect(mockTaglines).toContainEqual(tagline)
        })

        it('should throw error for empty array', () => {
            expect(() => getWeightedRandomTagline([])).toThrow('No taglines available')
        })

        it('should return featured tagline when only featured exist', () => {
            const featuredOnly = mockTaglines.filter((t) => t.featured)
            const tagline = getWeightedRandomTagline(featuredOnly)
            expect(tagline.featured).toBe(true)
        })

        it('should return from all taglines when only non-featured exist', () => {
            const nonFeaturedOnly = mockTaglines.filter((t) => !t.featured)
            const tagline = getWeightedRandomTagline(nonFeaturedOnly)
            expect(nonFeaturedOnly).toContainEqual(tagline)
        })

        it('should respect weight parameter (100% featured)', () => {
            // With weight = 1.0, should always select featured
            const results = []
            for (let i = 0; i < 10; i++) {
                const tagline = getWeightedRandomTagline(mockTaglines, 1.0)
                results.push(tagline.featured)
            }
            // All should be featured
            expect(results.every((f) => f === true)).toBe(true)
        })

        it('should respect weight parameter (0% featured min)', () => {
            // With weight = 0.0, selects from all taglines
            const tagline = getWeightedRandomTagline(mockTaglines, 0.0)
            // Should return any tagline (could be featured or not)
            expect(mockTaglines).toContainEqual(tagline)
        })

        it('should ensure featured appears at least 25% with default weight', () => {
            // Run many times to get statistical distribution
            const results = { featured: 0, nonFeatured: 0 }
            const iterations = 1000

            for (let i = 0; i < iterations; i++) {
                const tagline = getWeightedRandomTagline(mockTaglines, 0.25)
                if (tagline.featured) {
                    results.featured++
                } else {
                    results.nonFeatured++
                }
            }

            // With 25% minimum weight, featured should appear AT LEAST 25%
            // But could be higher since featured are also in the general pool
            const featuredPercentage = results.featured / iterations
            expect(featuredPercentage).toBeGreaterThanOrEqual(0.2) // At least 20% (tolerance for randomness)
        })
    })
})
