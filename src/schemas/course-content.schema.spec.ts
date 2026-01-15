import { describe, expect, it } from 'bun:test'
import {
    CourseSectionSchema,
    CourseModuleSchema,
    CourseContentSchema,
    DifficultySchema
} from './course-content.schema'

describe('DifficultySchema', () => {
    it('should accept beginner', () => {
        expect(() => DifficultySchema.parse('beginner')).not.toThrow()
    })

    it('should accept intermediate', () => {
        expect(() => DifficultySchema.parse('intermediate')).not.toThrow()
    })

    it('should accept advanced', () => {
        expect(() => DifficultySchema.parse('advanced')).not.toThrow()
    })

    it('should reject invalid values', () => {
        expect(() => DifficultySchema.parse('expert')).toThrow()
        expect(() => DifficultySchema.parse('BEGINNER')).toThrow()
        expect(() => DifficultySchema.parse('')).toThrow()
    })
})

describe('CourseSectionSchema', () => {
    it('should validate a valid section with all fields', () => {
        const validData = {
            name: 'Installing Obsidian',
            description: 'Learn how to download and install Obsidian on your computer',
            duration: '5 min',
            icon: 'FaDownload'
        }
        expect(() => CourseSectionSchema.parse(validData)).not.toThrow()
    })

    it('should validate section with minimal required fields', () => {
        const minimalData = {
            name: 'Introduction'
        }
        expect(() => CourseSectionSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty name', () => {
        const invalidData = {
            name: ''
        }
        expect(() => CourseSectionSchema.parse(invalidData)).toThrow()
    })

    it('should accept null description', () => {
        const validData = {
            name: 'Section Name',
            description: null
        }
        const result = CourseSectionSchema.parse(validData)
        expect(result.description).toBeNull()
    })

    it('should accept undefined description', () => {
        const validData = {
            name: 'Section Name',
            description: undefined
        }
        const result = CourseSectionSchema.parse(validData)
        expect(result.description).toBeUndefined()
    })

    it('should accept null duration', () => {
        const validData = {
            name: 'Section Name',
            duration: null
        }
        const result = CourseSectionSchema.parse(validData)
        expect(result.duration).toBeNull()
    })

    it('should accept null icon', () => {
        const validData = {
            name: 'Section Name',
            icon: null
        }
        const result = CourseSectionSchema.parse(validData)
        expect(result.icon).toBeNull()
    })

    it('should accept emoji icon', () => {
        const validData = {
            name: 'Section Name',
            icon: '🚀'
        }
        expect(() => CourseSectionSchema.parse(validData)).not.toThrow()
    })

    it('should accept React icon name', () => {
        const validData = {
            name: 'Section Name',
            icon: 'FaRocket'
        }
        expect(() => CourseSectionSchema.parse(validData)).not.toThrow()
    })
})

describe('CourseModuleSchema', () => {
    it('should validate a valid module with all fields', () => {
        const validData = {
            name: 'Getting Started with Obsidian',
            description: 'Install, configure, and understand the Obsidian interface',
            icon: 'FaRocket',
            duration: '25 min',
            sections: [
                {
                    name: 'Installing Obsidian',
                    description: 'Download and install the app',
                    duration: '5 min'
                },
                {
                    name: 'Understanding the Interface',
                    description: 'Learn the key components',
                    duration: '10 min'
                }
            ]
        }
        expect(() => CourseModuleSchema.parse(validData)).not.toThrow()
    })

    it('should validate module with minimal required fields', () => {
        const minimalData = {
            name: 'Module 1',
            sections: [{ name: 'Section 1' }]
        }
        expect(() => CourseModuleSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty module name', () => {
        const invalidData = {
            name: '',
            sections: [{ name: 'Section 1' }]
        }
        expect(() => CourseModuleSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty sections array', () => {
        const invalidData = {
            name: 'Module Name',
            sections: []
        }
        expect(() => CourseModuleSchema.parse(invalidData)).toThrow()
    })

    it('should reject missing sections', () => {
        const invalidData = {
            name: 'Module Name'
        }
        expect(() => CourseModuleSchema.parse(invalidData)).toThrow()
    })

    it('should accept null description', () => {
        const validData = {
            name: 'Module Name',
            description: null,
            sections: [{ name: 'Section 1' }]
        }
        const result = CourseModuleSchema.parse(validData)
        expect(result.description).toBeNull()
    })

    it('should accept null icon', () => {
        const validData = {
            name: 'Module Name',
            icon: null,
            sections: [{ name: 'Section 1' }]
        }
        const result = CourseModuleSchema.parse(validData)
        expect(result.icon).toBeNull()
    })

    it('should accept null duration', () => {
        const validData = {
            name: 'Module Name',
            duration: null,
            sections: [{ name: 'Section 1' }]
        }
        const result = CourseModuleSchema.parse(validData)
        expect(result.duration).toBeNull()
    })

    it('should validate module with many sections', () => {
        const sections = Array.from({ length: 10 }, (_, i) => ({
            name: `Section ${i + 1}`,
            duration: `${5 + i} min`
        }))
        const validData = {
            name: 'Large Module',
            sections
        }
        expect(() => CourseModuleSchema.parse(validData)).not.toThrow()
    })

    it('should preserve section order', () => {
        const validData = {
            name: 'Module',
            sections: [
                { name: 'First Section' },
                { name: 'Second Section' },
                { name: 'Third Section' }
            ]
        }
        const result = CourseModuleSchema.parse(validData)
        expect(result.sections[0]?.name).toBe('First Section')
        expect(result.sections[1]?.name).toBe('Second Section')
        expect(result.sections[2]?.name).toBe('Third Section')
    })

    it('should reject invalid section within module', () => {
        const invalidData = {
            name: 'Module',
            sections: [{ name: '' }] // Empty section name
        }
        expect(() => CourseModuleSchema.parse(invalidData)).toThrow()
    })
})

describe('CourseContentSchema', () => {
    it('should validate complete course content with all fields', () => {
        const validData = {
            sectionTitle: "What's Inside the Course",
            sectionDescription: 'A comprehensive curriculum from beginner to expert',
            sectionIcon: 'FaGraduationCap',
            totalDuration: '12 hours',
            prerequisites: ['Basic computer skills', 'Obsidian installed'],
            difficulty: 'beginner' as const,
            modules: [
                {
                    name: 'Getting Started',
                    description: 'Introduction to the course',
                    icon: '🚀',
                    duration: '1 hour',
                    sections: [
                        { name: 'Welcome', duration: '5 min' },
                        { name: 'Course Overview', duration: '15 min' }
                    ]
                },
                {
                    name: 'Core Concepts',
                    description: 'Learn the fundamentals',
                    icon: '📚',
                    duration: '3 hours',
                    sections: [
                        { name: 'Concept 1', duration: '45 min' },
                        { name: 'Concept 2', duration: '45 min' },
                        { name: 'Practice Exercises', duration: '1.5 hours' }
                    ]
                }
            ]
        }
        expect(() => CourseContentSchema.parse(validData)).not.toThrow()
    })

    it('should validate course content with minimal fields', () => {
        const minimalData = {
            modules: [
                {
                    name: 'Module 1',
                    sections: [{ name: 'Section 1' }]
                }
            ]
        }
        expect(() => CourseContentSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty modules array', () => {
        const invalidData = {
            sectionTitle: 'Course Content',
            modules: []
        }
        expect(() => CourseContentSchema.parse(invalidData)).toThrow()
    })

    it('should reject missing modules', () => {
        const invalidData = {
            sectionTitle: 'Course Content'
        }
        expect(() => CourseContentSchema.parse(invalidData)).toThrow()
    })

    it('should accept optional sectionTitle', () => {
        const validData = {
            modules: [{ name: 'Module', sections: [{ name: 'Section' }] }]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.sectionTitle).toBeUndefined()
    })

    it('should accept optional sectionDescription', () => {
        const validData = {
            sectionTitle: 'Title',
            modules: [{ name: 'Module', sections: [{ name: 'Section' }] }]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.sectionDescription).toBeUndefined()
    })

    it('should accept optional sectionIcon', () => {
        const validData = {
            modules: [{ name: 'Module', sections: [{ name: 'Section' }] }]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.sectionIcon).toBeUndefined()
    })

    it('should accept optional totalDuration', () => {
        const validData = {
            modules: [{ name: 'Module', sections: [{ name: 'Section' }] }]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.totalDuration).toBeUndefined()
    })

    it('should accept optional prerequisites', () => {
        const validData = {
            modules: [{ name: 'Module', sections: [{ name: 'Section' }] }]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.prerequisites).toBeUndefined()
    })

    it('should accept empty prerequisites array', () => {
        const validData = {
            prerequisites: [],
            modules: [{ name: 'Module', sections: [{ name: 'Section' }] }]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.prerequisites).toEqual([])
    })

    it('should accept optional difficulty', () => {
        const validData = {
            modules: [{ name: 'Module', sections: [{ name: 'Section' }] }]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.difficulty).toBeUndefined()
    })

    it('should accept all difficulty levels', () => {
        const levels = ['beginner', 'intermediate', 'advanced'] as const
        for (const difficulty of levels) {
            const validData = {
                difficulty,
                modules: [{ name: 'Module', sections: [{ name: 'Section' }] }]
            }
            expect(() => CourseContentSchema.parse(validData)).not.toThrow()
        }
    })

    it('should reject invalid difficulty level', () => {
        const invalidData = {
            difficulty: 'expert',
            modules: [{ name: 'Module', sections: [{ name: 'Section' }] }]
        }
        expect(() => CourseContentSchema.parse(invalidData)).toThrow()
    })

    it('should validate course with many modules', () => {
        const modules = Array.from({ length: 20 }, (_, i) => ({
            name: `Module ${i + 1}`,
            duration: `${i + 1} hour${i > 0 ? 's' : ''}`,
            sections: [{ name: `Section ${i + 1}.1` }, { name: `Section ${i + 1}.2` }]
        }))
        const validData = { modules }
        expect(() => CourseContentSchema.parse(validData)).not.toThrow()
    })

    it('should preserve module order', () => {
        const validData = {
            modules: [
                { name: 'First Module', sections: [{ name: 'S1' }] },
                { name: 'Second Module', sections: [{ name: 'S2' }] },
                { name: 'Third Module', sections: [{ name: 'S3' }] }
            ]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.modules[0]?.name).toBe('First Module')
        expect(result.modules[1]?.name).toBe('Second Module')
        expect(result.modules[2]?.name).toBe('Third Module')
    })

    it('should reject invalid module within course', () => {
        const invalidData = {
            modules: [
                { name: '', sections: [{ name: 'Section' }] } // Empty module name
            ]
        }
        expect(() => CourseContentSchema.parse(invalidData)).toThrow()
    })

    it('should reject module with invalid section', () => {
        const invalidData = {
            modules: [
                { name: 'Module', sections: [{ name: '' }] } // Empty section name
            ]
        }
        expect(() => CourseContentSchema.parse(invalidData)).toThrow()
    })

    it('should accept various duration formats', () => {
        const validData = {
            totalDuration: '2h 30min',
            modules: [
                {
                    name: 'Module 1',
                    duration: '45 minutes',
                    sections: [
                        { name: 'Section 1', duration: '15 min' },
                        { name: 'Section 2', duration: '30m' }
                    ]
                }
            ]
        }
        expect(() => CourseContentSchema.parse(validData)).not.toThrow()
    })
})
