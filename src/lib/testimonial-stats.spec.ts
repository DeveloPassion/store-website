import { describe, it, expect } from 'bun:test'
import {
    calculateTestimonialStats,
    formatAverageRating,
    type ProductWithTestimonials
} from './testimonial-stats'
import type { Product } from '@/schemas/product.schema'
import type { Testimonial } from '@/schemas/testimonial.schema'

// All testimonials are assumed to be 5-star
const createMockTestimonial = (id: string): Testimonial => ({
    id,
    author: `Author ${id}`,
    quote: `Quote ${id}`,
    featured: false
})

const createMockProduct = (id: string, testimonials: Testimonial[]): Product => ({
    id,
    name: `Product ${id}`,
    price: 99.99,
    priceDisplay: '€99.99',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'guides',
    secondaryCategories: [],
    tags: ['ai'],
    included: ['Item 1'],
    testimonials,
    faqs: [],
    media: [],
    featured: false,
    bestseller: false,
    bestValue: false,
    priority: 100,
    crossSellIds: [],
    landingPageUrl: null,
    dsebastienUrl: null,
    stats: null,
    variants: null,
    isSubscription: false,
    paymentFrequencies: null,
    defaultPaymentFrequency: null,
    activeSalesCopyId: 'default',
    salesCopy: {
        tagline: 'Test tagline',
        problem: 'Test problem',
        problemPoints: ['Problem 1'],
        agitate: 'Test agitate',
        agitatePoints: ['Agitate 1'],
        solution: 'Test solution',
        solutionPoints: ['Solution 1'],
        description: 'Test description',
        features: ['Feature 1'],
        benefits: { immediate: ['Benefit 1'], systematic: [], longTerm: [] },
        targetAudience: [],
        perfectFor: [],
        notForYou: [],
        trustBadges: [],
        guarantees: [],
        metaTitle: '',
        metaDescription: '',
        keywords: []
    }
})

describe('calculateTestimonialStats', () => {
    describe('with Product[] input', () => {
        it('should calculate stats correctly for products with testimonials', () => {
            const products: Product[] = [
                createMockProduct('1', [createMockTestimonial('t1'), createMockTestimonial('t2')]),
                createMockProduct('2', [createMockTestimonial('t3')]),
                createMockProduct('3', []) // No testimonials
            ]

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(3)
            expect(stats.productsWithTestimonials).toBe(2)
            expect(stats.averageRating).toBe(5) // All testimonials are 5-star
        })

        it('should handle products with no testimonials', () => {
            const products: Product[] = [createMockProduct('1', []), createMockProduct('2', [])]

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
            const products: Product[] = [createMockProduct('1', [])]

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(0)
            expect(stats.productsWithTestimonials).toBe(0)
            expect(stats.averageRating).toBe(0)
        })

        it('should calculate correct stats for single product with multiple testimonials', () => {
            const products: Product[] = [
                createMockProduct('1', [
                    createMockTestimonial('t1'),
                    createMockTestimonial('t2'),
                    createMockTestimonial('t3')
                ])
            ]

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(3)
            expect(stats.productsWithTestimonials).toBe(1)
            expect(stats.averageRating).toBe(5) // All testimonials are 5-star
        })

        it('should handle all testimonials as 5-star', () => {
            const products: Product[] = [
                createMockProduct('1', [createMockTestimonial('t1'), createMockTestimonial('t2')]),
                createMockProduct('2', [createMockTestimonial('t3')])
            ]

            const stats = calculateTestimonialStats(products)

            expect(stats.totalTestimonials).toBe(3)
            expect(stats.productsWithTestimonials).toBe(2)
            expect(stats.averageRating).toBe(5) // All testimonials are 5-star
        })

        it('should count testimonials across multiple products', () => {
            const products: Product[] = [
                createMockProduct('1', [createMockTestimonial('t1'), createMockTestimonial('t2')]),
                createMockProduct('2', [createMockTestimonial('t3')]),
                createMockProduct('3', [createMockTestimonial('t4'), createMockTestimonial('t5')])
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
                    product: createMockProduct('1', []),
                    testimonials: [createMockTestimonial('t1'), createMockTestimonial('t2')]
                },
                {
                    product: createMockProduct('2', []),
                    testimonials: [createMockTestimonial('t3')]
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
                    product: createMockProduct('1', []),
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
                    product: createMockProduct('1', []),
                    testimonials: [
                        createMockTestimonial('t1'),
                        createMockTestimonial('t2'),
                        createMockTestimonial('t3')
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
