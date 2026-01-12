import { describe, it, expect } from 'bun:test'
import {
    containerVariants,
    itemVariants,
    headerVariants,
    createContainerVariants,
    createItemVariants
} from './animation-variants'

// Type helper for testing
type VariantValue = Record<string, unknown>

describe('animation-variants', () => {
    describe('containerVariants', () => {
        it('should have hidden and visible states', () => {
            expect(containerVariants['hidden']).toEqual({ opacity: 0 })
            expect(containerVariants['visible']).toHaveProperty('opacity', 1)
        })

        it('should stagger children with 0.1 delay', () => {
            const visible = containerVariants['visible'] as VariantValue
            expect(visible).toHaveProperty('transition')
            const transition = visible['transition'] as VariantValue
            expect(transition).toHaveProperty('staggerChildren', 0.1)
        })
    })

    describe('itemVariants', () => {
        it('should fade in and slide up', () => {
            expect(itemVariants['hidden']).toEqual({ opacity: 0, y: 20 })
            expect(itemVariants['visible']).toEqual({ opacity: 1, y: 0 })
        })

        it('should have correct animation properties', () => {
            const hidden = itemVariants['hidden'] as VariantValue
            const visible = itemVariants['visible'] as VariantValue
            expect(hidden).toHaveProperty('opacity', 0)
            expect(hidden).toHaveProperty('y', 20)
            expect(visible).toHaveProperty('opacity', 1)
            expect(visible).toHaveProperty('y', 0)
        })
    })

    describe('headerVariants', () => {
        it('should have same structure as itemVariants', () => {
            expect(headerVariants['hidden']).toEqual({ opacity: 0, y: 20 })
            expect(headerVariants['visible']).toEqual({ opacity: 1, y: 0 })
        })

        it('should have hidden and visible states', () => {
            expect(headerVariants).toHaveProperty('hidden')
            expect(headerVariants).toHaveProperty('visible')
        })
    })

    describe('createContainerVariants', () => {
        it('should use default stagger delay when not specified', () => {
            const variants = createContainerVariants()
            const visible = variants['visible'] as VariantValue
            const transition = visible['transition'] as VariantValue
            expect(transition).toHaveProperty('staggerChildren', 0.1)
        })

        it('should use custom stagger delay', () => {
            const variants = createContainerVariants(0.2)
            const visible = variants['visible'] as VariantValue
            const transition = visible['transition'] as VariantValue
            expect(transition).toHaveProperty('staggerChildren', 0.2)
        })

        it('should create variants with hidden state', () => {
            const variants = createContainerVariants(0.15)
            expect(variants['hidden']).toEqual({ opacity: 0 })
        })

        it('should create variants with visible state', () => {
            const variants = createContainerVariants(0.15)
            expect(variants['visible']).toHaveProperty('opacity', 1)
        })

        it('should handle zero delay', () => {
            const variants = createContainerVariants(0)
            const visible = variants['visible'] as VariantValue
            const transition = visible['transition'] as VariantValue
            expect(transition).toHaveProperty('staggerChildren', 0)
        })

        it('should handle large delay values', () => {
            const variants = createContainerVariants(1.5)
            const visible = variants['visible'] as VariantValue
            const transition = visible['transition'] as VariantValue
            expect(transition).toHaveProperty('staggerChildren', 1.5)
        })
    })

    describe('createItemVariants', () => {
        it('should use default y offset when not specified', () => {
            const variants = createItemVariants()
            const hidden = variants['hidden'] as VariantValue
            expect(hidden).toHaveProperty('y', 20)
        })

        it('should use custom y offset', () => {
            const variants = createItemVariants(30)
            const hidden = variants['hidden'] as VariantValue
            expect(hidden).toHaveProperty('y', 30)
        })

        it('should create variants with correct hidden state', () => {
            const variants = createItemVariants(40)
            expect(variants['hidden']).toEqual({ opacity: 0, y: 40 })
        })

        it('should create variants with correct visible state', () => {
            const variants = createItemVariants(50)
            expect(variants['visible']).toEqual({ opacity: 1, y: 0 })
        })

        it('should handle zero offset', () => {
            const variants = createItemVariants(0)
            expect(variants['hidden']).toEqual({ opacity: 0, y: 0 })
        })

        it('should handle negative offset', () => {
            const variants = createItemVariants(-10)
            expect(variants['hidden']).toEqual({ opacity: 0, y: -10 })
        })
    })

    describe('type safety', () => {
        it('should return Variants type from createContainerVariants', () => {
            const variants = createContainerVariants()
            expect(variants).toHaveProperty('hidden')
            expect(variants).toHaveProperty('visible')
        })

        it('should return Variants type from createItemVariants', () => {
            const variants = createItemVariants()
            expect(variants).toHaveProperty('hidden')
            expect(variants).toHaveProperty('visible')
        })
    })
})
