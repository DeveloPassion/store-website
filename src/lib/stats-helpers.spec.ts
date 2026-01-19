import { describe, expect, it } from 'bun:test'
import { resolveStatItem, getStatValue } from './stats-helpers'

describe('resolveStatItem', () => {
    describe('with null/undefined input', () => {
        it('should return null for null input', () => {
            expect(resolveStatItem(null, 'Users')).toBeNull()
        })

        it('should return null for undefined input', () => {
            expect(resolveStatItem(undefined, 'Users')).toBeNull()
        })
    })

    describe('with string input (backward compatible)', () => {
        it('should use default label for simple string', () => {
            const result = resolveStatItem('350+', 'Users')
            expect(result).toEqual({ value: '350+', label: 'Users' })
        })

        it('should preserve the full string value', () => {
            const result = resolveStatItem('2,000+ happy customers', 'Users')
            expect(result).toEqual({ value: '2,000+ happy customers', label: 'Users' })
        })

        it('should work with different default labels', () => {
            expect(resolveStatItem('100+', 'Students')).toEqual({
                value: '100+',
                label: 'Students'
            })
            expect(resolveStatItem('10+', 'Participants')).toEqual({
                value: '10+',
                label: 'Participants'
            })
        })
    })

    describe('with object input (new format)', () => {
        it('should use custom label when provided', () => {
            const result = resolveStatItem({ value: '350+', label: 'Members' }, 'Users')
            expect(result).toEqual({ value: '350+', label: 'Members' })
        })

        it('should use default label when object label is null', () => {
            const result = resolveStatItem({ value: '1,000+', label: null }, 'Users')
            expect(result).toEqual({ value: '1,000+', label: 'Users' })
        })

        it('should preserve the full value string in object format', () => {
            const result = resolveStatItem(
                { value: '10+ hours/week', label: 'Time Saved' },
                'Hours'
            )
            expect(result).toEqual({ value: '10+ hours/week', label: 'Time Saved' })
        })
    })

    describe('real-world examples', () => {
        it('should handle knowii-community Members label', () => {
            const result = resolveStatItem({ value: '350+', label: 'Members' }, 'Users')
            expect(result).toEqual({ value: '350+', label: 'Members' })
        })

        it('should handle course Students label', () => {
            const result = resolveStatItem({ value: '100+', label: 'Students' }, 'Users')
            expect(result).toEqual({ value: '100+', label: 'Students' })
        })

        it('should handle coaching Clients label', () => {
            const result = resolveStatItem({ value: '100+', label: 'Clients' }, 'Users')
            expect(result).toEqual({ value: '100+', label: 'Clients' })
        })

        it('should handle time saved with default label', () => {
            const result = resolveStatItem('10+ hours/week', 'Time Saved')
            expect(result).toEqual({ value: '10+ hours/week', label: 'Time Saved' })
        })
    })
})

describe('getStatValue', () => {
    describe('with null/undefined input', () => {
        it('should return undefined for null', () => {
            expect(getStatValue(null)).toBeUndefined()
        })

        it('should return undefined for undefined', () => {
            expect(getStatValue(undefined)).toBeUndefined()
        })
    })

    describe('with string input', () => {
        it('should return the string as-is', () => {
            expect(getStatValue('350+')).toBe('350+')
        })

        it('should return complex strings', () => {
            expect(getStatValue('2,000+ users')).toBe('2,000+ users')
        })
    })

    describe('with object input', () => {
        it('should extract value from object', () => {
            expect(getStatValue({ value: '350+', label: 'Members' })).toBe('350+')
        })

        it('should extract value when label is null', () => {
            expect(getStatValue({ value: '1,000+', label: null })).toBe('1,000+')
        })
    })
})
