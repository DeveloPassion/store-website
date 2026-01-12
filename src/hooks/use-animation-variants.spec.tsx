import { describe, it, expect } from 'bun:test'
import { renderHook } from '@testing-library/react'
import { useAnimationVariants } from './use-animation-variants'
import { containerVariants, itemVariants, headerVariants } from '@/lib/animation-variants'

// Type helper for testing
type VariantValue = Record<string, unknown>

describe('useAnimationVariants', () => {
    describe('default behavior', () => {
        it('should return default variants when no options provided', () => {
            const { result } = renderHook(() => useAnimationVariants())

            expect(result.current.containerVariants).toEqual(containerVariants)
            expect(result.current.itemVariants).toEqual(itemVariants)
            expect(result.current.headerVariants).toEqual(headerVariants)
        })

        it('should return default variants when empty options object provided', () => {
            const { result } = renderHook(() => useAnimationVariants({}))

            expect(result.current.containerVariants).toEqual(containerVariants)
            expect(result.current.itemVariants).toEqual(itemVariants)
            expect(result.current.headerVariants).toEqual(headerVariants)
        })
    })

    describe('custom staggerDelay', () => {
        it('should return custom container variants with custom stagger delay', () => {
            const { result } = renderHook(() => useAnimationVariants({ staggerDelay: 0.2 }))

            const visible = result.current.containerVariants['visible'] as VariantValue
            const transition = visible['transition'] as VariantValue
            expect(transition).toHaveProperty('staggerChildren', 0.2)
        })

        it('should return default item variants when only stagger delay is customized', () => {
            const { result } = renderHook(() => useAnimationVariants({ staggerDelay: 0.2 }))

            expect(result.current.itemVariants).toEqual(itemVariants)
        })

        it('should return default header variants when only stagger delay is customized', () => {
            const { result } = renderHook(() => useAnimationVariants({ staggerDelay: 0.2 }))

            expect(result.current.headerVariants).toEqual(headerVariants)
        })
    })

    describe('custom itemYOffset', () => {
        it('should return custom item variants with custom y offset', () => {
            const { result } = renderHook(() => useAnimationVariants({ itemYOffset: 30 }))

            expect(result.current.itemVariants['hidden']).toEqual({
                opacity: 0,
                y: 30
            })
            expect(result.current.itemVariants['visible']).toEqual({
                opacity: 1,
                y: 0
            })
        })

        it('should return default container variants when only item offset is customized', () => {
            const { result } = renderHook(() => useAnimationVariants({ itemYOffset: 30 }))

            expect(result.current.containerVariants).toEqual(containerVariants)
        })

        it('should return default header variants when only item offset is customized', () => {
            const { result } = renderHook(() => useAnimationVariants({ itemYOffset: 30 }))

            expect(result.current.headerVariants).toEqual(headerVariants)
        })
    })

    describe('combined customization', () => {
        it('should handle both staggerDelay and itemYOffset customization', () => {
            const { result } = renderHook(() =>
                useAnimationVariants({ staggerDelay: 0.15, itemYOffset: 25 })
            )

            const visible = result.current.containerVariants['visible'] as VariantValue
            const transition = visible['transition'] as VariantValue
            expect(transition).toHaveProperty('staggerChildren', 0.15)
            expect(result.current.itemVariants['hidden']).toEqual({
                opacity: 0,
                y: 25
            })
            expect(result.current.itemVariants['visible']).toEqual({
                opacity: 1,
                y: 0
            })
        })

        it('should always return default header variants regardless of other options', () => {
            const { result } = renderHook(() =>
                useAnimationVariants({ staggerDelay: 0.15, itemYOffset: 25 })
            )

            expect(result.current.headerVariants).toEqual(headerVariants)
        })
    })

    describe('memoization', () => {
        it('should return same object reference when options unchanged', () => {
            const { result, rerender } = renderHook(() => useAnimationVariants())

            const firstResult = result.current
            rerender()
            const secondResult = result.current

            expect(firstResult).toBe(secondResult)
            expect(firstResult.containerVariants).toBe(secondResult.containerVariants)
            expect(firstResult.itemVariants).toBe(secondResult.itemVariants)
            expect(firstResult.headerVariants).toBe(secondResult.headerVariants)
        })

        it('should return same object when options object is stable', () => {
            const options = { staggerDelay: 0.2 }
            const { result, rerender } = renderHook(() => useAnimationVariants(options))

            const firstResult = result.current
            rerender()
            const secondResult = result.current

            expect(firstResult).toBe(secondResult)
        })

        it('should return new object when options change', () => {
            const { result, rerender } = renderHook(({ opts }) => useAnimationVariants(opts), {
                initialProps: { opts: { staggerDelay: 0.1 } }
            })

            const firstResult = result.current

            rerender({ opts: { staggerDelay: 0.2 } })
            const secondResult = result.current

            expect(firstResult).not.toBe(secondResult)
            expect(firstResult.containerVariants).not.toBe(secondResult.containerVariants)
        })
    })

    describe('edge cases', () => {
        it('should handle zero values', () => {
            const { result } = renderHook(() =>
                useAnimationVariants({ staggerDelay: 0, itemYOffset: 0 })
            )

            const visible = result.current.containerVariants['visible'] as VariantValue
            const transition = visible['transition'] as VariantValue
            expect(transition).toHaveProperty('staggerChildren', 0)
            expect(result.current.itemVariants['hidden']).toEqual({ opacity: 0, y: 0 })
        })

        it('should handle negative itemYOffset', () => {
            const { result } = renderHook(() => useAnimationVariants({ itemYOffset: -10 }))

            expect(result.current.itemVariants['hidden']).toEqual({
                opacity: 0,
                y: -10
            })
            expect(result.current.itemVariants['visible']).toEqual({
                opacity: 1,
                y: 0
            })
        })

        it('should handle large values', () => {
            const { result } = renderHook(() =>
                useAnimationVariants({ staggerDelay: 2.5, itemYOffset: 100 })
            )

            const visible = result.current.containerVariants['visible'] as VariantValue
            const transition = visible['transition'] as VariantValue
            expect(transition).toHaveProperty('staggerChildren', 2.5)

            const hidden = result.current.itemVariants['hidden'] as VariantValue
            expect(hidden).toHaveProperty('y', 100)
        })
    })

    describe('return value structure', () => {
        it('should return object with correct keys', () => {
            const { result } = renderHook(() => useAnimationVariants())

            expect(result.current).toHaveProperty('containerVariants')
            expect(result.current).toHaveProperty('itemVariants')
            expect(result.current).toHaveProperty('headerVariants')
        })

        it('should return variants with correct structure', () => {
            const { result } = renderHook(() => useAnimationVariants())

            expect(result.current.containerVariants).toHaveProperty('hidden')
            expect(result.current.containerVariants).toHaveProperty('visible')
            expect(result.current.itemVariants).toHaveProperty('hidden')
            expect(result.current.itemVariants).toHaveProperty('visible')
            expect(result.current.headerVariants).toHaveProperty('hidden')
            expect(result.current.headerVariants).toHaveProperty('visible')
        })
    })
})
