import { z } from 'zod'

/**
 * Media type - image or video
 */
export const MediaTypeSchema = z.enum(['image', 'video'])

/**
 * Media group - determines placement in the product page
 */
export const MediaGroupSchema = z.enum(['cover', 'main', 'secondary', 'bonus'])

/**
 * Individual media item schema
 */
export const MediaItemSchema = z.object({
    id: z.string().min(1),
    type: MediaTypeSchema,
    url: z
        .string()
        .min(1)
        .refine((val) => val.trim().length > 0, 'URL cannot be only whitespace'),
    title: z
        .string()
        .min(1)
        .refine((val) => val.trim().length > 0, 'Title cannot be only whitespace'),
    description: z.string().optional(),
    altText: z
        .string()
        .min(1)
        .refine((val) => val.trim().length > 0, 'Alt text cannot be only whitespace'),
    caption: z.string().optional(),
    order: z.number().int().min(0),
    group: MediaGroupSchema,
    youtubeId: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional()
})

/**
 * Array of media items
 */
export const MediaArraySchema = z.array(MediaItemSchema)

/**
 * File-level schema for Media JSON files
 * Wraps the array in a { data: [...] } object for valid JSON structure
 */
export const MediaFileSchema = z.object({
    data: MediaArraySchema
})

export type MediaType = z.infer<typeof MediaTypeSchema>
export type MediaGroup = z.infer<typeof MediaGroupSchema>
export type MediaItem = z.infer<typeof MediaItemSchema>
export type MediaFile = z.infer<typeof MediaFileSchema>
