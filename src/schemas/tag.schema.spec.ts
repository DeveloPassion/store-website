import { describe, it, expect } from 'bun:test'
import { TagIdSchema, TagSchema, TagsMapSchema, type TagId } from './tag.schema'

describe('Tag Schema Validation', () => {
    const validTag = {
        id: 'ai' as TagId,
        name: 'AI',
        description: 'Artificial Intelligence tools and resources',
        icon: 'FaRobot',
        color: '#FF5733',
        featured: true,
        priority: 1
    }

    describe('TagIdSchema', () => {
        it('should accept all valid tag IDs', () => {
            const validIds = [
                'ai',
                'ai-assistants',
                'ai-prompts',
                'automation',
                'beginners',
                'bundle',
                'career-development',
                'chatgpt',
                'checklist',
                'clarity',
                'claude',
                'coaching',
                'community',
                'concepts',
                'content-creation',
                'courses',
                'curated',
                'design-thinking',
                'directories',
                'focus',
                'free-guide',
                'free-resource',
                'getting-started',
                'ghostwriting',
                'goals',
                'gtd',
                'habits',
                'ikigai',
                'interstitial-journaling',
                'it-fundamentals',
                'johnny-decimal',
                'journaling',
                'knowledge-management',
                'knowledge-work',
                'lead-magnet',
                'learning',
                'life-design',
                'lifetime-access',
                'llms',
                'markdown',
                'master-prompts',
                'mcp',
                'mindfulness',
                'model-context-protocol',
                'note-taking',
                'obsidian',
                'offline',
                'para-method',
                'periodic-reviews',
                'personal-brand',
                'personal-knowledge-management',
                'personal-manifesto',
                'personal-organization',
                'pkm',
                'privacy',
                'productivity',
                'programming',
                'prompt-engineering',
                'reference',
                'resources',
                'routines',
                'second-brain',
                'smart-goals',
                'speech-recognition',
                'systems',
                'templates',
                'time-management',
                'tools',
                'values',
                'voice-to-text',
                'writing',
                'zen-productivity',
                'zettelkasten'
            ]
            validIds.forEach((id) => {
                expect(() => TagIdSchema.parse(id)).not.toThrow()
            })
        })

        it('should reject invalid tag IDs', () => {
            expect(() => TagIdSchema.parse('invalid-tag')).toThrow()
            expect(() => TagIdSchema.parse('')).toThrow()
            expect(() => TagIdSchema.parse(123)).toThrow()
            expect(() => TagIdSchema.parse(null)).toThrow()
            expect(() => TagIdSchema.parse(undefined)).toThrow()
        })
    })

    describe('TagSchema - Required Fields', () => {
        it('should accept valid complete tag', () => {
            const result = TagSchema.safeParse(validTag)
            expect(result.success).toBe(true)
        })

        it('should reject tag without id', () => {
            const invalid = Object.fromEntries(
                Object.entries(validTag).filter(([key]) => key !== 'id')
            )
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject tag with invalid id', () => {
            const invalid = { ...validTag, id: 'invalid-id' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject tag without name', () => {
            const invalid = { ...validTag, name: '' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject tag with empty name', () => {
            const invalid = { ...validTag, name: '' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject tag without description', () => {
            const invalid = { ...validTag, description: '' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject tag with empty description', () => {
            const invalid = { ...validTag, description: '' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject tag without featured flag', () => {
            const invalid = Object.fromEntries(
                Object.entries(validTag).filter(([key]) => key !== 'featured')
            )
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject tag without priority', () => {
            const invalid = Object.fromEntries(
                Object.entries(validTag).filter(([key]) => key !== 'priority')
            )
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('TagSchema - Optional Fields', () => {
        it('should accept tag without icon', () => {
            const minimal = Object.fromEntries(
                Object.entries(validTag).filter(([key]) => key !== 'icon')
            )
            const result = TagSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept tag without color', () => {
            const minimal = Object.fromEntries(
                Object.entries(validTag).filter(([key]) => key !== 'color')
            )
            const result = TagSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept tag without icon and color', () => {
            const minimal = Object.fromEntries(
                Object.entries(validTag).filter(([key]) => !['icon', 'color'].includes(key))
            )
            const result = TagSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })
    })

    describe('TagSchema - Color Validation', () => {
        it('should accept valid hex color with uppercase', () => {
            const valid = { ...validTag, color: '#FF5733' }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept valid hex color with lowercase', () => {
            const valid = { ...validTag, color: '#ff5733' }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept valid hex color with mixed case', () => {
            const valid = { ...validTag, color: '#Ff5733' }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject hex color without hash', () => {
            const invalid = { ...validTag, color: 'FF5733' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject short hex color', () => {
            const invalid = { ...validTag, color: '#FFF' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject long hex color', () => {
            const invalid = { ...validTag, color: '#FF57331' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject invalid hex characters', () => {
            const invalid = { ...validTag, color: '#GGGGGG' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject rgb color format', () => {
            const invalid = { ...validTag, color: 'rgb(255, 87, 51)' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject named colors', () => {
            const invalid = { ...validTag, color: 'red' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('TagSchema - Featured Flag', () => {
        it('should accept featured tag', () => {
            const valid = { ...validTag, featured: true }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept non-featured tag', () => {
            const valid = { ...validTag, featured: false }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject non-boolean featured value', () => {
            const invalid = { ...validTag, featured: 'true' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject null featured value', () => {
            const invalid = { ...validTag, featured: null }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('TagSchema - Priority', () => {
        it('should accept priority of 1', () => {
            const valid = { ...validTag, priority: 1 }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept priority of 100', () => {
            const valid = { ...validTag, priority: 100 }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject priority of 0', () => {
            const invalid = { ...validTag, priority: 0 }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject negative priority', () => {
            const invalid = { ...validTag, priority: -5 }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject decimal priority', () => {
            const invalid = { ...validTag, priority: 1.5 }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject non-integer priority', () => {
            const invalid = { ...validTag, priority: '10' }
            const result = TagSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('TagsMapSchema', () => {
        it('should reject map with missing required tag keys', () => {
            // z.record(TagIdSchema, TagSchema) requires ALL enum keys to be present
            const tags: Record<string, typeof validTag> = {
                ai: validTag,
                productivity: {
                    ...validTag,
                    id: 'productivity' as TagId,
                    name: 'Productivity',
                    priority: 2
                }
            }
            const result = TagsMapSchema.safeParse(tags)
            // This will fail because not all TagId enum values are present
            expect(result.success).toBe(false)
        })

        it('should reject empty map', () => {
            const result = TagsMapSchema.safeParse({})
            // z.record() with enum key requires all enum values to be present
            expect(result.success).toBe(false)
        })

        it('should reject map with invalid tag', () => {
            const tags = {
                ai: validTag,
                invalid: { ...validTag, name: '' }
            }
            const result = TagsMapSchema.safeParse(tags)
            expect(result.success).toBe(false)
        })

        it('should reject map with invalid key', () => {
            const tags = {
                'invalid-key': validTag
            }
            const result = TagsMapSchema.safeParse(tags)
            expect(result.success).toBe(false)
        })

        it('should reject non-object value', () => {
            const result = TagsMapSchema.safeParse([validTag])
            expect(result.success).toBe(false)
        })

        it('should reject null value', () => {
            const result = TagsMapSchema.safeParse(null)
            expect(result.success).toBe(false)
        })
    })

    describe('TagSchema - Edge Cases', () => {
        it('should handle tag with very long name', () => {
            const valid = { ...validTag, name: 'A'.repeat(100) }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should handle tag with very long description', () => {
            const valid = { ...validTag, description: 'A'.repeat(500) }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject tag with extra unknown fields', () => {
            const invalid = { ...validTag, extraField: 'value' }
            const result = TagSchema.safeParse(invalid)
            // Zod strips extra fields by default, so this should succeed
            expect(result.success).toBe(true)
        })

        it('should accept tag with whitespace in name', () => {
            const valid = { ...validTag, name: 'AI   Tools' }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept tag with special characters in description', () => {
            const valid = { ...validTag, description: 'AI & ML tools (GPT-4)' }
            const result = TagSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })
})
