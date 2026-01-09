import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
    it('should merge class names correctly', () => {
        expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
        const condition1 = false
        const condition2 = true
        expect(cn('foo', condition1 && 'bar', 'baz')).toBe('foo baz')
        expect(cn('foo', condition2 && 'bar', 'baz')).toBe('foo bar baz')
    })

    it('should handle undefined and null values', () => {
        expect(cn('foo', undefined, 'bar', null, 'baz')).toBe('foo bar baz')
    })

    it('should handle objects', () => {
        expect(cn('foo', { bar: true, baz: false })).toBe('foo bar')
    })

    it('should handle arrays', () => {
        expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
    })

    it('should handle Tailwind conflicts (using tailwind-merge)', () => {
        // tailwind-merge should resolve conflicts by keeping the last value
        expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should return empty string for no arguments', () => {
        expect(cn()).toBe('')
    })

    it('should handle complex combinations', () => {
        expect(cn('base', { active: true, disabled: false }, ['extra', 'classes'], 'final')).toBe(
            'base active extra classes final'
        )
    })
})
