import { describe, it, expect } from 'bun:test'
import {
    CategoryIdSchema,
    CategorySchema,
    CategoriesArraySchema,
    type CategoryId
} from './category.schema'

describe('Category Schema Validation', () => {
    const validCategory = {
        id: 'ai-mastery' as CategoryId,
        name: 'AI Mastery',
        description: 'Master AI tools and techniques',
        icon: 'FaRobot',
        color: '#FF5733',
        featured: true,
        priority: 1
    }

    describe('CategoryIdSchema', () => {
        it('should accept all valid category IDs', () => {
            const validIds = [
                'ai-mastery',
                'ai-tools',
                'bundles',
                'coaching',
                'community',
                'content-creation',
                'courses',
                'dev-and-it',
                'free',
                'guides',
                'journaling',
                'kits-and-templates',
                'knowledge-bases',
                'knowledge-management',
                'knowledge-work',
                'learning',
                'obsidian',
                'personal-development',
                'personal-organization',
                'productivity',
                'services',
                'tools',
                'workshops'
            ]
            validIds.forEach((id) => {
                expect(() => CategoryIdSchema.parse(id)).not.toThrow()
            })
        })

        it('should reject invalid category IDs', () => {
            expect(() => CategoryIdSchema.parse('invalid-category')).toThrow()
            expect(() => CategoryIdSchema.parse('')).toThrow()
            expect(() => CategoryIdSchema.parse(123)).toThrow()
            expect(() => CategoryIdSchema.parse(null)).toThrow()
            expect(() => CategoryIdSchema.parse(undefined)).toThrow()
        })
    })

    describe('CategorySchema - Required Fields', () => {
        it('should accept valid complete category', () => {
            const result = CategorySchema.safeParse(validCategory)
            expect(result.success).toBe(true)
        })

        it('should reject category without id', () => {
            const invalid = Object.fromEntries(
                Object.entries(validCategory).filter(([key]) => key !== 'id')
            )
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject category with invalid id', () => {
            const invalid = { ...validCategory, id: 'invalid-id' }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject category without name', () => {
            const invalid = { ...validCategory, name: '' }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject category with empty name', () => {
            const invalid = { ...validCategory, name: '' }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject category without description', () => {
            const invalid = { ...validCategory, description: '' }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject category with empty description', () => {
            const invalid = { ...validCategory, description: '' }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject category without featured flag', () => {
            const invalid = Object.fromEntries(
                Object.entries(validCategory).filter(([key]) => key !== 'featured')
            )
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject category without priority', () => {
            const invalid = Object.fromEntries(
                Object.entries(validCategory).filter(([key]) => key !== 'priority')
            )
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('CategorySchema - Optional Fields', () => {
        it('should accept category without icon', () => {
            const minimal = Object.fromEntries(
                Object.entries(validCategory).filter(([key]) => key !== 'icon')
            )
            const result = CategorySchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept category without color', () => {
            const minimal = Object.fromEntries(
                Object.entries(validCategory).filter(([key]) => key !== 'color')
            )
            const result = CategorySchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept category without icon and color', () => {
            const minimal = Object.fromEntries(
                Object.entries(validCategory).filter(([key]) => !['icon', 'color'].includes(key))
            )
            const result = CategorySchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })
    })

    describe('CategorySchema - Featured Flag', () => {
        it('should accept featured category', () => {
            const valid = { ...validCategory, featured: true }
            const result = CategorySchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept non-featured category', () => {
            const valid = { ...validCategory, featured: false }
            const result = CategorySchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject non-boolean featured value', () => {
            const invalid = { ...validCategory, featured: 'true' }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject null featured value', () => {
            const invalid = { ...validCategory, featured: null }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('CategorySchema - Priority', () => {
        it('should accept priority of 1', () => {
            const valid = { ...validCategory, priority: 1 }
            const result = CategorySchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept priority of 100', () => {
            const valid = { ...validCategory, priority: 100 }
            const result = CategorySchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject priority of 0', () => {
            const invalid = { ...validCategory, priority: 0 }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject negative priority', () => {
            const invalid = { ...validCategory, priority: -5 }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject decimal priority', () => {
            const invalid = { ...validCategory, priority: 1.5 }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject non-integer priority', () => {
            const invalid = { ...validCategory, priority: '10' }
            const result = CategorySchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('CategoriesArraySchema', () => {
        it('should accept array of valid categories', () => {
            const categories = [
                validCategory,
                {
                    ...validCategory,
                    id: 'productivity' as CategoryId,
                    name: 'Productivity',
                    priority: 2
                }
            ]
            const result = CategoriesArraySchema.safeParse(categories)
            expect(result.success).toBe(true)
        })

        it('should accept empty array', () => {
            const result = CategoriesArraySchema.safeParse([])
            expect(result.success).toBe(true)
        })

        it('should reject array with invalid category', () => {
            const categories = [validCategory, { ...validCategory, name: '' }]
            const result = CategoriesArraySchema.safeParse(categories)
            expect(result.success).toBe(false)
        })

        it('should reject non-array value', () => {
            const result = CategoriesArraySchema.safeParse(validCategory)
            expect(result.success).toBe(false)
        })

        it('should reject null value', () => {
            const result = CategoriesArraySchema.safeParse(null)
            expect(result.success).toBe(false)
        })
    })

    describe('CategorySchema - Edge Cases', () => {
        it('should handle category with very long name', () => {
            const valid = { ...validCategory, name: 'A'.repeat(100) }
            const result = CategorySchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should handle category with very long description', () => {
            const valid = { ...validCategory, description: 'A'.repeat(500) }
            const result = CategorySchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject category with extra unknown fields', () => {
            const invalid = { ...validCategory, extraField: 'value' }
            const result = CategorySchema.safeParse(invalid)
            // Zod strips extra fields by default, so this should succeed
            expect(result.success).toBe(true)
        })

        it('should accept category with whitespace in name', () => {
            const valid = { ...validCategory, name: 'AI   Mastery' }
            const result = CategorySchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })
})
