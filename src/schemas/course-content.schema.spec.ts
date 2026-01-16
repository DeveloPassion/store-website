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
            icon: 'FaDownload',
            url: null
        }
        expect(() => CourseSectionSchema.parse(validData)).not.toThrow()
    })

    it('should validate section with all required fields (nullable values)', () => {
        const minimalData = {
            name: 'Introduction',
            description: null,
            duration: null,
            icon: null,
            url: null
        }
        expect(() => CourseSectionSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty name', () => {
        const invalidData = {
            name: '',
            description: null,
            duration: null,
            icon: null,
            url: null
        }
        expect(() => CourseSectionSchema.parse(invalidData)).toThrow()
    })

    it('should accept null description', () => {
        const validData = {
            name: 'Section Name',
            description: null,
            duration: null,
            icon: null,
            url: null
        }
        const result = CourseSectionSchema.parse(validData)
        expect(result.description).toBeNull()
    })

    it('should require description field to be present', () => {
        const invalidData = {
            name: 'Section Name',
            duration: null,
            icon: null,
            url: null
            // description is missing - should fail since it's required (but nullable)
        }
        expect(() => CourseSectionSchema.parse(invalidData)).toThrow()
    })

    it('should accept null duration', () => {
        const validData = {
            name: 'Section Name',
            description: null,
            duration: null,
            icon: null,
            url: null
        }
        const result = CourseSectionSchema.parse(validData)
        expect(result.duration).toBeNull()
    })

    it('should accept null icon', () => {
        const validData = {
            name: 'Section Name',
            description: null,
            duration: null,
            icon: null,
            url: null
        }
        const result = CourseSectionSchema.parse(validData)
        expect(result.icon).toBeNull()
    })

    it('should accept emoji icon', () => {
        const validData = {
            name: 'Section Name',
            description: null,
            duration: null,
            icon: '🚀',
            url: null
        }
        expect(() => CourseSectionSchema.parse(validData)).not.toThrow()
    })

    it('should accept React icon name', () => {
        const validData = {
            name: 'Section Name',
            description: null,
            duration: null,
            icon: 'FaRocket',
            url: null
        }
        expect(() => CourseSectionSchema.parse(validData)).not.toThrow()
    })

    it('should accept valid URL for free lesson', () => {
        const validData = {
            name: 'Free Introduction',
            description: null,
            duration: null,
            icon: null,
            url: 'https://youtube.com/watch?v=abc123'
        }
        const result = CourseSectionSchema.parse(validData)
        expect(result.url).toBe('https://youtube.com/watch?v=abc123')
    })

    it('should accept null URL', () => {
        const validData = {
            name: 'Section Name',
            description: null,
            duration: null,
            icon: null,
            url: null
        }
        const result = CourseSectionSchema.parse(validData)
        expect(result.url).toBeNull()
    })

    it('should require url field to be present', () => {
        const invalidData = {
            name: 'Section Name',
            description: null,
            duration: null,
            icon: null
            // url is missing - should fail since it's required (but nullable)
        }
        expect(() => CourseSectionSchema.parse(invalidData)).toThrow()
    })

    it('should reject invalid URL format', () => {
        const invalidData = {
            name: 'Section Name',
            description: null,
            duration: null,
            icon: null,
            url: 'not-a-valid-url'
        }
        expect(() => CourseSectionSchema.parse(invalidData)).toThrow()
    })

    it('should accept section with all fields including URL', () => {
        const validData = {
            name: 'Introduction to PKM',
            description: 'Learn the fundamentals of Personal Knowledge Management',
            duration: '15 min',
            icon: '🚀',
            url: 'https://example.com/free-lesson'
        }
        const result = CourseSectionSchema.parse(validData)
        expect(result.name).toBe('Introduction to PKM')
        expect(result.url).toBe('https://example.com/free-lesson')
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
                    duration: '5 min',
                    icon: null,
                    url: null
                },
                {
                    name: 'Understanding the Interface',
                    description: 'Learn the key components',
                    duration: '10 min',
                    icon: null,
                    url: null
                }
            ]
        }
        expect(() => CourseModuleSchema.parse(validData)).not.toThrow()
    })

    it('should validate module with all required fields (nullable values)', () => {
        const minimalData = {
            name: 'Module 1',
            description: null,
            icon: null,
            duration: null,
            sections: [
                { name: 'Section 1', description: null, duration: null, icon: null, url: null }
            ]
        }
        expect(() => CourseModuleSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty module name', () => {
        const invalidData = {
            name: '',
            description: null,
            icon: null,
            duration: null,
            sections: [
                { name: 'Section 1', description: null, duration: null, icon: null, url: null }
            ]
        }
        expect(() => CourseModuleSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty sections array', () => {
        const invalidData = {
            name: 'Module Name',
            description: null,
            icon: null,
            duration: null,
            sections: []
        }
        expect(() => CourseModuleSchema.parse(invalidData)).toThrow()
    })

    it('should reject missing sections', () => {
        const invalidData = {
            name: 'Module Name',
            description: null,
            icon: null,
            duration: null
        }
        expect(() => CourseModuleSchema.parse(invalidData)).toThrow()
    })

    it('should accept null description', () => {
        const validData = {
            name: 'Module Name',
            description: null,
            icon: null,
            duration: null,
            sections: [
                { name: 'Section 1', description: null, duration: null, icon: null, url: null }
            ]
        }
        const result = CourseModuleSchema.parse(validData)
        expect(result.description).toBeNull()
    })

    it('should accept null icon', () => {
        const validData = {
            name: 'Module Name',
            description: null,
            icon: null,
            duration: null,
            sections: [
                { name: 'Section 1', description: null, duration: null, icon: null, url: null }
            ]
        }
        const result = CourseModuleSchema.parse(validData)
        expect(result.icon).toBeNull()
    })

    it('should accept null duration', () => {
        const validData = {
            name: 'Module Name',
            description: null,
            icon: null,
            duration: null,
            sections: [
                { name: 'Section 1', description: null, duration: null, icon: null, url: null }
            ]
        }
        const result = CourseModuleSchema.parse(validData)
        expect(result.duration).toBeNull()
    })

    it('should validate module with many sections', () => {
        const sections = Array.from({ length: 10 }, (_, i) => ({
            name: `Section ${i + 1}`,
            description: null,
            duration: `${5 + i} min`,
            icon: null,
            url: null
        }))
        const validData = {
            name: 'Large Module',
            description: null,
            icon: null,
            duration: null,
            sections
        }
        expect(() => CourseModuleSchema.parse(validData)).not.toThrow()
    })

    it('should preserve section order', () => {
        const validData = {
            name: 'Module',
            description: null,
            icon: null,
            duration: null,
            sections: [
                { name: 'First Section', description: null, duration: null, icon: null, url: null },
                {
                    name: 'Second Section',
                    description: null,
                    duration: null,
                    icon: null,
                    url: null
                },
                { name: 'Third Section', description: null, duration: null, icon: null, url: null }
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
            description: null,
            icon: null,
            duration: null,
            sections: [{ name: '', description: null, duration: null, icon: null, url: null }] // Empty section name
        }
        expect(() => CourseModuleSchema.parse(invalidData)).toThrow()
    })
})

describe('CourseContentSchema', () => {
    // Helper to create a valid section with all nullable fields
    const createSection = (name: string, overrides = {}) => ({
        name,
        description: null,
        duration: null,
        icon: null,
        url: null,
        ...overrides
    })

    // Helper to create a valid module with all nullable fields
    const createModule = (
        name: string,
        sections: ReturnType<typeof createSection>[],
        overrides = {}
    ) => ({
        name,
        description: null,
        icon: null,
        duration: null,
        sections,
        ...overrides
    })

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
                        createSection('Welcome', { duration: '5 min' }),
                        createSection('Course Overview', { duration: '15 min' })
                    ]
                },
                {
                    name: 'Core Concepts',
                    description: 'Learn the fundamentals',
                    icon: '📚',
                    duration: '3 hours',
                    sections: [
                        createSection('Concept 1', { duration: '45 min' }),
                        createSection('Concept 2', { duration: '45 min' }),
                        createSection('Practice Exercises', { duration: '1.5 hours' })
                    ]
                }
            ]
        }
        expect(() => CourseContentSchema.parse(validData)).not.toThrow()
    })

    it('should validate course content with all required fields (nullable values)', () => {
        const minimalData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: [createModule('Module 1', [createSection('Section 1')])]
        }
        expect(() => CourseContentSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty modules array', () => {
        const invalidData = {
            sectionTitle: 'Course Content',
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: []
        }
        expect(() => CourseContentSchema.parse(invalidData)).toThrow()
    })

    it('should reject missing modules', () => {
        const invalidData = {
            sectionTitle: 'Course Content',
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null
        }
        expect(() => CourseContentSchema.parse(invalidData)).toThrow()
    })

    it('should accept null sectionTitle', () => {
        const validData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: [createModule('Module', [createSection('Section')])]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.sectionTitle).toBeNull()
    })

    it('should accept null sectionDescription', () => {
        const validData = {
            sectionTitle: 'Title',
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: [createModule('Module', [createSection('Section')])]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.sectionDescription).toBeNull()
    })

    it('should accept null sectionIcon', () => {
        const validData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: [createModule('Module', [createSection('Section')])]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.sectionIcon).toBeNull()
    })

    it('should accept null totalDuration', () => {
        const validData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: [createModule('Module', [createSection('Section')])]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.totalDuration).toBeNull()
    })

    it('should accept null prerequisites', () => {
        const validData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: [createModule('Module', [createSection('Section')])]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.prerequisites).toBeNull()
    })

    it('should accept empty prerequisites array', () => {
        const validData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: [],
            difficulty: null,
            modules: [createModule('Module', [createSection('Section')])]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.prerequisites).toEqual([])
    })

    it('should accept null difficulty', () => {
        const validData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: [createModule('Module', [createSection('Section')])]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.difficulty).toBeNull()
    })

    it('should accept all difficulty levels', () => {
        const levels = ['beginner', 'intermediate', 'advanced'] as const
        for (const difficulty of levels) {
            const validData = {
                sectionTitle: null,
                sectionDescription: null,
                sectionIcon: null,
                totalDuration: null,
                prerequisites: null,
                difficulty,
                modules: [createModule('Module', [createSection('Section')])]
            }
            expect(() => CourseContentSchema.parse(validData)).not.toThrow()
        }
    })

    it('should reject invalid difficulty level', () => {
        const invalidData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: 'expert',
            modules: [createModule('Module', [createSection('Section')])]
        }
        expect(() => CourseContentSchema.parse(invalidData)).toThrow()
    })

    it('should validate course with many modules', () => {
        const modules = Array.from({ length: 20 }, (_, i) =>
            createModule(
                `Module ${i + 1}`,
                [createSection(`Section ${i + 1}.1`), createSection(`Section ${i + 1}.2`)],
                { duration: `${i + 1} hour${i > 0 ? 's' : ''}` }
            )
        )
        const validData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules
        }
        expect(() => CourseContentSchema.parse(validData)).not.toThrow()
    })

    it('should preserve module order', () => {
        const validData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: [
                createModule('First Module', [createSection('S1')]),
                createModule('Second Module', [createSection('S2')]),
                createModule('Third Module', [createSection('S3')])
            ]
        }
        const result = CourseContentSchema.parse(validData)
        expect(result.modules[0]?.name).toBe('First Module')
        expect(result.modules[1]?.name).toBe('Second Module')
        expect(result.modules[2]?.name).toBe('Third Module')
    })

    it('should reject invalid module within course', () => {
        const invalidData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: [createModule('', [createSection('Section')])] // Empty module name
        }
        expect(() => CourseContentSchema.parse(invalidData)).toThrow()
    })

    it('should reject module with invalid section', () => {
        const invalidData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: null,
            prerequisites: null,
            difficulty: null,
            modules: [createModule('Module', [createSection('')])] // Empty section name
        }
        expect(() => CourseContentSchema.parse(invalidData)).toThrow()
    })

    it('should accept various duration formats', () => {
        const validData = {
            sectionTitle: null,
            sectionDescription: null,
            sectionIcon: null,
            totalDuration: '2h 30min',
            prerequisites: null,
            difficulty: null,
            modules: [
                createModule(
                    'Module 1',
                    [
                        createSection('Section 1', { duration: '15 min' }),
                        createSection('Section 2', { duration: '30m' })
                    ],
                    { duration: '45 minutes' }
                )
            ]
        }
        expect(() => CourseContentSchema.parse(validData)).not.toThrow()
    })
})
