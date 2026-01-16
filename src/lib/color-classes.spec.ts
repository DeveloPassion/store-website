import { describe, it, expect } from 'bun:test'
import { getColorClasses, colorClassesMap, defaultColorClasses } from './color-classes'
import type { ColorKey } from '@/schemas/color-key.schema'

describe('color-classes', () => {
    describe('colorClassesMap', () => {
        it('should have entries for all color keys', () => {
            // Check a sample of color keys exist
            expect(colorClassesMap['red-400']).toBeDefined()
            expect(colorClassesMap['blue-500']).toBeDefined()
            expect(colorClassesMap['pink-500']).toBeDefined()
            expect(colorClassesMap['violet-600']).toBeDefined()
            expect(colorClassesMap['emerald-500']).toBeDefined()
        })

        it('should have correct structure for each entry', () => {
            const entry = colorClassesMap['red-500']
            expect(entry).toHaveProperty('text')
            expect(entry).toHaveProperty('bg')
            expect(entry).toHaveProperty('bgTint')
            expect(entry).toHaveProperty('border')
        })

        it('should have correct class format for text', () => {
            expect(colorClassesMap['red-500'].text).toBe('text-red-500')
            expect(colorClassesMap['blue-400'].text).toBe('text-blue-400')
        })

        it('should have correct class format for bg', () => {
            expect(colorClassesMap['red-500'].bg).toBe('bg-red-500')
            expect(colorClassesMap['blue-400'].bg).toBe('bg-blue-400')
        })

        it('should have correct class format for bgTint', () => {
            expect(colorClassesMap['red-500'].bgTint).toBe('bg-red-500/15')
            expect(colorClassesMap['blue-400'].bgTint).toBe('bg-blue-400/15')
        })

        it('should have correct class format for border', () => {
            expect(colorClassesMap['red-500'].border).toBe('border-red-500')
            expect(colorClassesMap['blue-400'].border).toBe('border-blue-400')
        })
    })

    describe('getColorClasses', () => {
        it('should return color classes for valid color key', () => {
            const result = getColorClasses('pink-500')
            expect(result).toBeDefined()
            expect(result?.text).toBe('text-pink-500')
            expect(result?.bgTint).toBe('bg-pink-500/15')
        })

        it('should return undefined for null', () => {
            const result = getColorClasses(null)
            expect(result).toBeUndefined()
        })

        it('should return undefined for undefined', () => {
            const result = getColorClasses(undefined)
            expect(result).toBeUndefined()
        })

        it('should return correct classes for all color keys', () => {
            const testCases: ColorKey[] = [
                'red-400',
                'orange-500',
                'amber-400',
                'yellow-500',
                'green-400',
                'emerald-500',
                'teal-400',
                'cyan-500',
                'sky-400',
                'blue-500',
                'indigo-500',
                'violet-600',
                'purple-500',
                'pink-500',
                'gray-500'
            ]

            testCases.forEach((colorKey) => {
                const result = getColorClasses(colorKey)
                expect(result).toBeDefined()
                expect(result?.text).toContain(colorKey)
                expect(result?.bg).toContain(colorKey)
            })
        })
    })

    describe('defaultColorClasses', () => {
        it('should have correct default values', () => {
            expect(defaultColorClasses.text).toBe('text-gray-400')
            expect(defaultColorClasses.bg).toBe('bg-gray-400')
            expect(defaultColorClasses.bgTint).toBe('bg-gray-400/15')
            expect(defaultColorClasses.border).toBe('border-gray-400')
        })
    })
})
