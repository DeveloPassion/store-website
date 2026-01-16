import { z } from 'zod'

/**
 * Difficulty level for courses
 */
export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced'])

/**
 * Individual section within a course module
 * Represents a lesson or topic covered in the module
 */
export const CourseSectionSchema = z.object({
    name: z.string().min(1, 'Section name is required'),
    description: z.string().nullable(), // Nullable
    duration: z.string().nullable(), // Nullable (e.g., "15 min")
    icon: z.string().nullable(), // Nullable (emoji or React icon name)
    url: z.string().url().nullable() // Nullable - URL to free lesson (if publicly accessible)
})

/**
 * Course module containing related sections
 * Represents a chapter or unit in the course
 */
export const CourseModuleSchema = z.object({
    name: z.string().min(1, 'Module name is required'),
    description: z.string().nullable(), // Nullable
    icon: z.string().nullable(), // Nullable (emoji or React icon name)
    duration: z.string().nullable(), // Nullable (e.g., "2 hours")
    sections: z.array(CourseSectionSchema).min(1, 'At least one section is required')
})

/**
 * Complete course content structure
 * Contains all information about course modules and sections
 *
 * Used in sales copy for course products to display:
 * - Course overview (title, description, meta info)
 * - Prerequisites
 * - Module breakdown with sections
 */
export const CourseContentSchema = z.object({
    sectionTitle: z.string().nullable(), // Default: "What's Inside the Course"
    sectionDescription: z.string().nullable(),
    sectionIcon: z.string().nullable(), // Emoji or React icon name
    totalDuration: z.string().nullable(), // e.g., "12 hours"
    prerequisites: z.array(z.string()).nullable(),
    difficulty: DifficultySchema.nullable(),
    modules: z.array(CourseModuleSchema).min(1, 'At least one module is required')
})

// Export TypeScript types
export type Difficulty = z.infer<typeof DifficultySchema>
export type CourseSection = z.infer<typeof CourseSectionSchema>
export type CourseModule = z.infer<typeof CourseModuleSchema>
export type CourseContent = z.infer<typeof CourseContentSchema>
