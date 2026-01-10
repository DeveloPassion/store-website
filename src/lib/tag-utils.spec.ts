import { describe, it, expect } from 'bun:test'
import {
    buildTagsWithCounts,
    getFeaturedTags,
    getNonFeaturedTags,
    sortTagsByPriority,
    getFeaturedTagsSorted,
    getNonFeaturedTagsSorted
} from './tag-utils'
import type { Tag, TagId } from '@/types/tag'
import type { Product } from '@/types/product'

const createMockTag = (overrides: Partial<Tag> = {}): Tag => ({
    id: 'ai' as TagId, // Use valid tag ID from TagIdSchema
    name: 'Test Tag',
    description: 'Test description',
    featured: false,
    priority: 50,
    ...overrides
})

const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-id',
    permalink: 'test',
    name: 'Test Product',
    tagline: 'Test tagline',
    price: 100,
    priceDisplay: '$100',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'guides', // Use valid category ID from CategoryIdSchema
    secondaryCategories: [],
    tags: ['ai'], // At least one tag required
    problem: 'Test problem',
    problemPoints: ['Problem point 1'],
    agitate: 'Test agitate',
    agitatePoints: ['Agitate point 1'],
    solution: 'Test solution',
    solutionPoints: ['Solution point 1'],
    description: 'Test description',
    features: ['Feature 1'],
    benefits: { immediate: ['Benefit 1'] }, // Use proper benefits structure
    included: ['Item 1'],
    testimonials: [],
    faqs: [],
    targetAudience: [],
    perfectFor: [],
    notForYou: [],
    trustBadges: [],
    guarantees: [],
    crossSellIds: [],
    featured: false,
    bestseller: false,
    bestValue: false,
    status: 'active',
    priority: 50,
    ...overrides
})

describe('tag-utils', () => {
    describe('buildTagsWithCounts', () => {
        it('should build tags with correct product counts', () => {
            const tagsMetadata = {
                ai: createMockTag({ id: 'ai' as TagId, name: 'React' }),
                automation: createMockTag({ id: 'automation' as TagId, name: 'TypeScript' }),
                coaching: createMockTag({ id: 'coaching' as TagId, name: 'Testing' })
            } as unknown as Record<TagId, Tag>

            const products: Product[] = [
                createMockProduct({ tags: ['ai' as TagId, 'automation' as TagId] }),
                createMockProduct({ tags: ['ai' as TagId, 'coaching' as TagId] }),
                createMockProduct({ tags: ['automation' as TagId] })
            ]

            const result = buildTagsWithCounts(products, tagsMetadata)

            const aiTag = result.find((t) => t.id === 'ai')
            const tsTag = result.find((t) => t.id === 'automation')
            const coachingTag = result.find((t) => t.id === 'coaching')

            expect(aiTag?.count).toBe(2)
            expect(tsTag?.count).toBe(2)
            expect(coachingTag?.count).toBe(1)
        })

        it('should set count to 0 for tags not used in any product', () => {
            const tagsMetadata = {
                ai: createMockTag({ id: 'ai' as TagId, name: 'Unused' })
            } as unknown as Record<TagId, Tag>

            const products: Product[] = [createMockProduct({ tags: [] })]

            const result = buildTagsWithCounts(products, tagsMetadata)
            expect(result[0]!.count).toBe(0)
        })

        it('should handle empty products array', () => {
            const tagsMetadata = {
                ai: createMockTag({ id: 'ai' as TagId, name: 'Tag 1' })
            } as unknown as Record<TagId, Tag>

            const result = buildTagsWithCounts([], tagsMetadata)
            expect(result[0]!.count).toBe(0)
        })

        it('should handle empty tags metadata', () => {
            const products: Product[] = [createMockProduct({ tags: ['ai' as TagId] })]

            const result = buildTagsWithCounts(products, {} as Record<TagId, Tag>)
            expect(result).toEqual([])
        })

        it('should preserve all tag properties', () => {
            const tagsMetadata = {
                ai: createMockTag({
                    id: 'ai' as TagId,
                    name: 'Test Tag',
                    description: 'Test Description',
                    featured: true,
                    priority: 5,
                    icon: 'FaTest',
                    color: '#FF0000'
                })
            } as unknown as Record<TagId, Tag>

            const products: Product[] = [createMockProduct({ tags: ['ai' as TagId] })]

            const result = buildTagsWithCounts(products, tagsMetadata)
            const tag = result[0]!

            expect(tag.id).toBe('ai')
            expect(tag.name).toBe('Test Tag')
            expect(tag.description).toBe('Test Description')
            expect(tag.featured).toBe(true)
            expect(tag.priority).toBe(5)
            expect(tag.icon).toBe('FaTest')
            expect(tag.color).toBe('#FF0000')
            expect(tag.count).toBe(1)
        })
    })

    const mockTags: Tag[] = [
        createMockTag({
            id: 'featured-high' as TagId,
            name: 'Featured High',
            featured: true,
            priority: 1
        }),
        createMockTag({
            id: 'featured-low' as TagId,
            name: 'Featured Low',
            featured: true,
            priority: 5
        }),
        createMockTag({
            id: 'not-featured-high' as TagId,
            name: 'Not Featured High',
            featured: false,
            priority: 2
        }),
        createMockTag({
            id: 'not-featured-low' as TagId,
            name: 'Not Featured Low',
            featured: false,
            priority: 10
        })
    ]

    describe('getFeaturedTags', () => {
        it('should return only featured tags', () => {
            const result = getFeaturedTags(mockTags)
            expect(result).toHaveLength(2)
            expect(result.every((tag) => tag.featured)).toBe(true)
        })

        it('should return empty array when no featured tags', () => {
            const tags = [createMockTag({ featured: false })]
            expect(getFeaturedTags(tags)).toEqual([])
        })
    })

    describe('getNonFeaturedTags', () => {
        it('should return only non-featured tags', () => {
            const result = getNonFeaturedTags(mockTags)
            expect(result).toHaveLength(2)
            expect(result.every((tag) => !tag.featured)).toBe(true)
        })

        it('should return empty array when all tags are featured', () => {
            const tags = [createMockTag({ featured: true })]
            expect(getNonFeaturedTags(tags)).toEqual([])
        })
    })

    describe('sortTagsByPriority', () => {
        it('should sort tags by priority ascending', () => {
            const sorted = sortTagsByPriority(mockTags)
            expect(sorted[0]!.priority).toBe(1)
            expect(sorted[1]!.priority).toBe(2)
            expect(sorted[2]!.priority).toBe(5)
            expect(sorted[3]!.priority).toBe(10)
        })

        it('should sort alphabetically when priorities are equal', () => {
            const tags = [
                createMockTag({ name: 'Zebra', priority: 5 }),
                createMockTag({ name: 'Alpha', priority: 5 }),
                createMockTag({ name: 'Beta', priority: 5 })
            ]

            const sorted = sortTagsByPriority(tags)
            expect(sorted[0]!.name).toBe('Alpha')
            expect(sorted[1]!.name).toBe('Beta')
            expect(sorted[2]!.name).toBe('Zebra')
        })

        it('should not mutate original array', () => {
            const original = [...mockTags]
            sortTagsByPriority(mockTags)
            expect(mockTags).toEqual(original)
        })
    })

    describe('getFeaturedTagsSorted', () => {
        it('should return featured tags sorted by priority', () => {
            const result = getFeaturedTagsSorted(mockTags)

            expect(result).toHaveLength(2)
            expect(result.every((tag) => tag.featured)).toBe(true)
            expect(result[0]!.priority).toBe(1)
            expect(result[1]!.priority).toBe(5)
        })

        it('should return empty array when no featured tags', () => {
            const tags = [createMockTag({ featured: false })]
            expect(getFeaturedTagsSorted(tags)).toEqual([])
        })
    })

    describe('getNonFeaturedTagsSorted', () => {
        it('should return non-featured tags sorted by priority', () => {
            const result = getNonFeaturedTagsSorted(mockTags)

            expect(result).toHaveLength(2)
            expect(result.every((tag) => !tag.featured)).toBe(true)
            expect(result[0]!.priority).toBe(2)
            expect(result[1]!.priority).toBe(10)
        })

        it('should return empty array when all tags are featured', () => {
            const tags = [createMockTag({ featured: true })]
            expect(getNonFeaturedTagsSorted(tags)).toEqual([])
        })
    })
})
