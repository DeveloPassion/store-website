import { z } from 'zod'

/**
 * Individual milestone in the transformation timeline
 * Represents what the user achieves at a specific point in time
 */
export const TimelineMilestoneSchema = z.object({
    id: z.string().min(1, 'Milestone ID is required'),
    timeframe: z.string().min(1, 'Timeframe is required'), // "Week 1", "Month 1", "Day 1"
    title: z.string().min(1, 'Title is required'), // "Foundation Built"
    description: z.string().min(10, 'Description must be at least 10 characters'),
    highlights: z.array(z.string()).optional(), // Optional bullet points
    icon: z.string().optional() // Optional icon name
})

/**
 * Full transformation timeline structure
 * Shows the progression of benefits over time
 */
export const TimelineSchema = z.object({
    title: z.string().optional(), // Defaults to "Your Transformation Journey"
    subtitle: z.string().optional(), // Defaults to "See what you'll achieve over time"
    milestones: z.array(TimelineMilestoneSchema).min(1, 'At least one milestone is required')
})

// Export TypeScript types
export type TimelineMilestone = z.infer<typeof TimelineMilestoneSchema>
export type Timeline = z.infer<typeof TimelineSchema>
