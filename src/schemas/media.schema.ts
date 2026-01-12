import { z } from 'zod'

/**
 * Media type - image or video
 */
export const MediaTypeSchema = z.enum(['image', 'video'])

/**
 * Media group - determines placement in the product page
 */
export const MediaGroupSchema = z.enum(['cover', 'banner', 'main', 'secondary', 'bonus'])

/**
 * Individual media item schema
 */
export const MediaItemSchema = z.object({
    id: z.string().min(1),
    type: MediaTypeSchema,
    url: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    altText: z.string().min(1),
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

export type MediaType = z.infer<typeof MediaTypeSchema>
export type MediaGroup = z.infer<typeof MediaGroupSchema>
export type MediaItem = z.infer<typeof MediaItemSchema>
