import type { ColorKey } from '@/schemas/color-key.schema'

/**
 * Color classes mapping
 *
 * Maps color keys to Tailwind CSS utility classes for various use cases.
 * All classes are statically defined so Tailwind can detect them at build time.
 */

export interface ColorClasses {
    /** Text color class */
    text: string
    /** Solid background color class */
    bg: string
    /** Tinted (semi-transparent) background for cards */
    bgTint: string
    /** Border color class */
    border: string
}

/**
 * Static mapping of color keys to Tailwind classes.
 * Each entry provides classes for text, background, tinted background, and border.
 */
export const colorClassesMap: Record<ColorKey, ColorClasses> = {
    // Red shades
    'red-400': {
        text: 'text-red-400',
        bg: 'bg-red-400',
        bgTint: 'bg-red-400/15',
        border: 'border-red-400'
    },
    'red-500': {
        text: 'text-red-500',
        bg: 'bg-red-500',
        bgTint: 'bg-red-500/15',
        border: 'border-red-500'
    },
    // Orange shades
    'orange-400': {
        text: 'text-orange-400',
        bg: 'bg-orange-400',
        bgTint: 'bg-orange-400/15',
        border: 'border-orange-400'
    },
    'orange-500': {
        text: 'text-orange-500',
        bg: 'bg-orange-500',
        bgTint: 'bg-orange-500/15',
        border: 'border-orange-500'
    },
    // Amber shades
    'amber-400': {
        text: 'text-amber-400',
        bg: 'bg-amber-400',
        bgTint: 'bg-amber-400/15',
        border: 'border-amber-400'
    },
    'amber-500': {
        text: 'text-amber-500',
        bg: 'bg-amber-500',
        bgTint: 'bg-amber-500/15',
        border: 'border-amber-500'
    },
    // Yellow shades
    'yellow-100': {
        text: 'text-yellow-100',
        bg: 'bg-yellow-100',
        bgTint: 'bg-yellow-100/15',
        border: 'border-yellow-100'
    },
    'yellow-400': {
        text: 'text-yellow-400',
        bg: 'bg-yellow-400',
        bgTint: 'bg-yellow-400/15',
        border: 'border-yellow-400'
    },
    'yellow-500': {
        text: 'text-yellow-500',
        bg: 'bg-yellow-500',
        bgTint: 'bg-yellow-500/15',
        border: 'border-yellow-500'
    },
    // Green shades
    'green-400': {
        text: 'text-green-400',
        bg: 'bg-green-400',
        bgTint: 'bg-green-400/15',
        border: 'border-green-400'
    },
    'green-500': {
        text: 'text-green-500',
        bg: 'bg-green-500',
        bgTint: 'bg-green-500/15',
        border: 'border-green-500'
    },
    // Emerald shades
    'emerald-500': {
        text: 'text-emerald-500',
        bg: 'bg-emerald-500',
        bgTint: 'bg-emerald-500/15',
        border: 'border-emerald-500'
    },
    // Teal shades
    'teal-200': {
        text: 'text-teal-200',
        bg: 'bg-teal-200',
        bgTint: 'bg-teal-200/15',
        border: 'border-teal-200'
    },
    'teal-300': {
        text: 'text-teal-300',
        bg: 'bg-teal-300',
        bgTint: 'bg-teal-300/15',
        border: 'border-teal-300'
    },
    'teal-400': {
        text: 'text-teal-400',
        bg: 'bg-teal-400',
        bgTint: 'bg-teal-400/15',
        border: 'border-teal-400'
    },
    'teal-500': {
        text: 'text-teal-500',
        bg: 'bg-teal-500',
        bgTint: 'bg-teal-500/15',
        border: 'border-teal-500'
    },
    // Cyan shades
    'cyan-400': {
        text: 'text-cyan-400',
        bg: 'bg-cyan-400',
        bgTint: 'bg-cyan-400/15',
        border: 'border-cyan-400'
    },
    'cyan-500': {
        text: 'text-cyan-500',
        bg: 'bg-cyan-500',
        bgTint: 'bg-cyan-500/15',
        border: 'border-cyan-500'
    },
    // Sky shades
    'sky-200': {
        text: 'text-sky-200',
        bg: 'bg-sky-200',
        bgTint: 'bg-sky-200/15',
        border: 'border-sky-200'
    },
    'sky-400': {
        text: 'text-sky-400',
        bg: 'bg-sky-400',
        bgTint: 'bg-sky-400/15',
        border: 'border-sky-400'
    },
    // Blue shades
    'blue-400': {
        text: 'text-blue-400',
        bg: 'bg-blue-400',
        bgTint: 'bg-blue-400/15',
        border: 'border-blue-400'
    },
    'blue-500': {
        text: 'text-blue-500',
        bg: 'bg-blue-500',
        bgTint: 'bg-blue-500/15',
        border: 'border-blue-500'
    },
    // Indigo shades
    'indigo-500': {
        text: 'text-indigo-500',
        bg: 'bg-indigo-500',
        bgTint: 'bg-indigo-500/15',
        border: 'border-indigo-500'
    },
    // Violet shades
    'violet-500': {
        text: 'text-violet-500',
        bg: 'bg-violet-500',
        bgTint: 'bg-violet-500/15',
        border: 'border-violet-500'
    },
    'violet-600': {
        text: 'text-violet-600',
        bg: 'bg-violet-600',
        bgTint: 'bg-violet-600/15',
        border: 'border-violet-600'
    },
    'violet-700': {
        text: 'text-violet-700',
        bg: 'bg-violet-700',
        bgTint: 'bg-violet-700/15',
        border: 'border-violet-700'
    },
    // Purple shades
    'purple-200': {
        text: 'text-purple-200',
        bg: 'bg-purple-200',
        bgTint: 'bg-purple-200/15',
        border: 'border-purple-200'
    },
    'purple-300': {
        text: 'text-purple-300',
        bg: 'bg-purple-300',
        bgTint: 'bg-purple-300/15',
        border: 'border-purple-300'
    },
    'purple-500': {
        text: 'text-purple-500',
        bg: 'bg-purple-500',
        bgTint: 'bg-purple-500/15',
        border: 'border-purple-500'
    },
    // Pink shades
    'pink-200': {
        text: 'text-pink-200',
        bg: 'bg-pink-200',
        bgTint: 'bg-pink-200/15',
        border: 'border-pink-200'
    },
    'pink-300': {
        text: 'text-pink-300',
        bg: 'bg-pink-300',
        bgTint: 'bg-pink-300/15',
        border: 'border-pink-300'
    },
    'pink-400': {
        text: 'text-pink-400',
        bg: 'bg-pink-400',
        bgTint: 'bg-pink-400/15',
        border: 'border-pink-400'
    },
    'pink-500': {
        text: 'text-pink-500',
        bg: 'bg-pink-500',
        bgTint: 'bg-pink-500/15',
        border: 'border-pink-500'
    },
    // Gray shades
    'gray-400': {
        text: 'text-gray-400',
        bg: 'bg-gray-400',
        bgTint: 'bg-gray-400/15',
        border: 'border-gray-400'
    },
    'gray-500': {
        text: 'text-gray-500',
        bg: 'bg-gray-500',
        bgTint: 'bg-gray-500/15',
        border: 'border-gray-500'
    }
}

/**
 * Get color classes for a given color key.
 * Returns undefined if the color key is null or invalid.
 */
export function getColorClasses(colorKey: ColorKey | null | undefined): ColorClasses | undefined {
    if (!colorKey) return undefined
    return colorClassesMap[colorKey]
}

/**
 * Default color classes to use when no color is specified
 */
export const defaultColorClasses: ColorClasses = {
    text: 'text-gray-400',
    bg: 'bg-gray-400',
    bgTint: 'bg-gray-400/15',
    border: 'border-gray-400'
}
