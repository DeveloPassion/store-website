import { z } from 'zod'

/**
 * Zod schema for color keys
 * SINGLE SOURCE OF TRUTH for color key validation
 *
 * Color keys map to Tailwind CSS color classes.
 * This allows categories and tags to reference colors by key
 * instead of hardcoded hex values.
 */

export const ColorKeySchema = z.enum([
    // Red shades
    'red-400',
    'red-500',
    // Orange shades
    'orange-400',
    'orange-500',
    // Amber shades
    'amber-400',
    'amber-500',
    // Yellow shades
    'yellow-100',
    'yellow-400',
    'yellow-500',
    // Green shades
    'green-400',
    'green-500',
    // Emerald shades
    'emerald-500',
    // Teal shades
    'teal-200',
    'teal-300',
    'teal-400',
    'teal-500',
    // Cyan shades
    'cyan-400',
    'cyan-500',
    // Sky shades
    'sky-200',
    'sky-400',
    // Blue shades
    'blue-400',
    'blue-500',
    // Indigo shades
    'indigo-500',
    // Violet shades
    'violet-500',
    'violet-600',
    'violet-700',
    // Purple shades
    'purple-200',
    'purple-300',
    'purple-500',
    // Pink shades
    'pink-200',
    'pink-300',
    'pink-400',
    'pink-500',
    // Gray shades (for neutral options)
    'gray-400',
    'gray-500'
])

export type ColorKey = z.infer<typeof ColorKeySchema>
