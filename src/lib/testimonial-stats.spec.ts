import { describe, it, expect } from 'bun:test'
import {
    calculateTestimonialStats,
    formatAverageRating,
    type ProductWithTestimonials
} from './testimonial-stats'
import {
    createMockProduct as createBaseMockProduct,
    createMockTestimonial as createBaseTestimonial
} from '@/test-utils/mock-product'
import type { Product } from '@/schemas/product.schema'
import type { Testimonial } from '@/schemas/testimonial.schema'

// Helper for this test file - creates products with specific testimonials
const createProductWithTestimonials = (id: string, testimonials: Testimonial[]): Product =>
    createBaseMockProduct({
        id,
        name: `Product ${id}`,
        testimonials,
        testimonialsCount: testimonials.length,
        priority: 100
    })

// Helper to create testimonials with sequential IDs
const createTestimonialWithId = (id: string): Testimonial =>
    createBaseTestimonial({
        id,
        author: `Author ${id}`,
        quote: `Quote ${id}`
    })

describe('calculateTestimonialStats', () => {
    describe('with Product[] input', () => {
        it('should calculate stats correctly for products with testimonials', () => {
            const products: Product[] = [
                createProductWithTestimonials('1', [
                    createTestimonialWithId('t1'),
                    createTestimonialWithId('t2')
                ]),
                createProductWithTestimonials('2', [createTestimonialWithId('t3')]),
                createProductWithTestimonials('3', []) // No testimonials
            ]

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(3)
            expect(stats.productsWithTestimonials).toBe(2)
            expect(stats.averageRating).toBe(5) // All testimonials are 5-star
        })

        it('should handle products with no testimonials', () => {
            const products: Product[] = [
                createProductWithTestimonials('1', []),
                createProductWithTestimonials('2', [])
            ]

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(0)
            expect(stats.productsWithTestimonials).toBe(0)
            expect(stats.averageRating).toBe(0)
        })

        it('should handle empty products array', () => {
            const products: Product[] = []

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(0)
            expect(stats.productsWithTestimonials).toBe(0)
            expect(stats.averageRating).toBe(0)
        })

        it('should handle products with empty testimonials', () => {
            const products: Product[] = [createProductWithTestimonials('1', [])]

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(0)
            expect(stats.productsWithTestimonials).toBe(0)
            expect(stats.averageRating).toBe(0)
        })

        it('should calculate correct stats for single product with multiple testimonials', () => {
            const products: Product[] = [
                createProductWithTestimonials('1', [
                    createTestimonialWithId('t1'),
                    createTestimonialWithId('t2'),
                    createTestimonialWithId('t3')
                ])
            ]

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(3)
            expect(stats.productsWithTestimonials).toBe(1)
            expect(stats.averageRating).toBe(5) // All testimonials are 5-star
        })

        it('should handle all testimonials as 5-star', () => {
            const products: Product[] = [
                createProductWithTestimonials('1', [
                    createTestimonialWithId('t1'),
                    createTestimonialWithId('t2')
                ]),
                createProductWithTestimonials('2', [createTestimonialWithId('t3')])
            ]

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(3)
            expect(stats.productsWithTestimonials).toBe(2)
            expect(stats.averageRating).toBe(5) // All testimonials are 5-star
        })

        it('should count testimonials across multiple products', () => {
            const products: Product[] = [
                createProductWithTestimonials('1', [
                    createTestimonialWithId('t1'),
                    createTestimonialWithId('t2')
                ]),
                createProductWithTestimonials('2', [createTestimonialWithId('t3')]),
                createProductWithTestimonials('3', [
                    createTestimonialWithId('t4'),
                    createTestimonialWithId('t5')
                ])
            ]

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(5)
            expect(stats.productsWithTestimonials).toBe(3)
            expect(stats.averageRating).toBe(5) // All testimonials are 5-star
        })
    })

    describe('with ProductWithTestimonials[] input', () => {
        it('should calculate stats correctly for ProductWithTestimonials', () => {
            const productsWithTestimonials: ProductWithTestimonials[] = [
                {
                    product: createProductWithTestimonials('1', []),
                    testimonials: [createTestimonialWithId('t1'), createTestimonialWithId('t2')]
                },
                {
                    product: createProductWithTestimonials('2', []),
                    testimonials: [createTestimonialWithId('t3')]
                }
            ]

            const stats = calculateTestimonialStats(productsWithTestimonials)

            expect(stats.totalTestimonials).toBe(3)
            expect(stats.productsWithTestimonials).toBe(2)
            expect(stats.averageRating).toBe(5) // All testimonials are 5-star
        })

        it('should handle ProductWithTestimonials with no testimonials', () => {
            const productsWithTestimonials: ProductWithTestimonials[] = [
                {
                    product: createProductWithTestimonials('1', []),
                    testimonials: []
                }
            ]

            const stats = calculateTestimonialStats(productsWithTestimonials)

            expect(stats.totalTestimonials).toBe(0)
            expect(stats.productsWithTestimonials).toBe(0)
            expect(stats.averageRating).toBe(0)
        })

        it('should handle empty ProductWithTestimonials array', () => {
            const productsWithTestimonials: ProductWithTestimonials[] = []

            const stats = calculateTestimonialStats(productsWithTestimonials)

            expect(stats.totalTestimonials).toBe(0)
            expect(stats.productsWithTestimonials).toBe(0)
            expect(stats.averageRating).toBe(0)
        })

        it('should calculate correct stats for single product with multiple testimonials', () => {
            const productsWithTestimonials: ProductWithTestimonials[] = [
                {
                    product: createProductWithTestimonials('1', []),
                    testimonials: [
                        createTestimonialWithId('t1'),
                        createTestimonialWithId('t2'),
                        createTestimonialWithId('t3')
                    ]
                }
            ]

            const stats = calculateTestimonialStats(productsWithTestimonials)

            expect(stats.totalTestimonials).toBe(3)
            expect(stats.productsWithTestimonials).toBe(1)
            expect(stats.averageRating).toBe(5) // All testimonials are 5-star
        })
    })
})

describe('formatAverageRating', () => {
    it('should format rating to one decimal place', () => {
        expect(formatAverageRating(4.9)).toBe('4.9')
        expect(formatAverageRating(4.567)).toBe('4.6')
        expect(formatAverageRating(5.0)).toBe('5.0')
        expect(formatAverageRating(3.14159)).toBe('3.1')
    })

    it('should handle zero rating', () => {
        expect(formatAverageRating(0)).toBe('0.0')
    })

    it('should handle perfect rating', () => {
        expect(formatAverageRating(5)).toBe('5.0')
    })

    it('should round correctly', () => {
        expect(formatAverageRating(4.44)).toBe('4.4')
        expect(formatAverageRating(4.45)).toBe('4.5')
        expect(formatAverageRating(4.95)).toBe('5.0')
    })
})
