import { describe, expect, it } from 'bun:test'
import { parseUserCount, formatCustomerCount, calculateProductStats } from './product-stats'
import {
    createMockProduct as createBaseMockProduct,
    createMockTestimonial
} from '@/test-utils/mock-product'
import type { Product } from '@/schemas/product.schema'

describe('parseUserCount', () => {
    it('should return 0 for undefined input', () => {
        expect(parseUserCount(undefined)).toBe(0)
    })

    it('should return 0 for null input', () => {
        expect(parseUserCount(null)).toBe(0)
    })

    it('should return 0 for empty string', () => {
        expect(parseUserCount('')).toBe(0)
    })

    it('should parse simple numbers', () => {
        expect(parseUserCount('500')).toBe(500)
        expect(parseUserCount('1000')).toBe(1000)
    })

    it('should parse numbers with commas', () => {
        expect(parseUserCount('1,000')).toBe(1000)
        expect(parseUserCount('2,500')).toBe(2500)
        expect(parseUserCount('10,000')).toBe(10000)
    })

    it('should parse numbers with + suffix', () => {
        expect(parseUserCount('500+')).toBe(500)
        expect(parseUserCount('2,000+')).toBe(2000)
    })

    it('should parse numbers with text suffix', () => {
        expect(parseUserCount('2,000+ users')).toBe(2000)
        expect(parseUserCount('500 students')).toBe(500)
        expect(parseUserCount('1,500+ happy customers')).toBe(1500)
    })

    it('should return 0 for strings without numbers', () => {
        expect(parseUserCount('many users')).toBe(0)
        expect(parseUserCount('N/A')).toBe(0)
    })

    describe('with object format (StatItem)', () => {
        it('should parse value from object with custom label', () => {
            expect(parseUserCount({ value: '350+', label: 'Members' })).toBe(350)
            expect(parseUserCount({ value: '100+', label: 'Students' })).toBe(100)
        })

        it('should parse value from object with null label', () => {
            expect(parseUserCount({ value: '1,000+', label: null })).toBe(1000)
        })

        it('should parse complex values from object', () => {
            expect(parseUserCount({ value: '2,500+ users', label: 'Clients' })).toBe(2500)
        })

        it('should handle mixed products with string and object formats', () => {
            // This ensures backward compatibility works when mixed
            expect(parseUserCount('500+')).toBe(500)
            expect(parseUserCount({ value: '500+', label: 'Members' })).toBe(500)
        })
    })
})

describe('formatCustomerCount', () => {
    it('should return "0" for 0', () => {
        expect(formatCustomerCount(0)).toBe('0')
    })

    it('should round down to nearest 50 for counts under 1000', () => {
        expect(formatCustomerCount(49)).toBe('0')
        expect(formatCustomerCount(50)).toBe('50+')
        expect(formatCustomerCount(99)).toBe('50+')
        expect(formatCustomerCount(100)).toBe('100+')
        expect(formatCustomerCount(150)).toBe('150+')
        expect(formatCustomerCount(499)).toBe('450+')
        expect(formatCustomerCount(500)).toBe('500+')
        expect(formatCustomerCount(750)).toBe('750+')
        expect(formatCustomerCount(999)).toBe('950+')
    })

    it('should format thousands as K+', () => {
        expect(formatCustomerCount(1000)).toBe('1K+')
        expect(formatCustomerCount(1499)).toBe('1K+')
        expect(formatCustomerCount(2000)).toBe('2K+')
        expect(formatCustomerCount(3000)).toBe('3K+')
    })

    it('should format half-thousands as .5K+', () => {
        expect(formatCustomerCount(1500)).toBe('1.5K+')
        expect(formatCustomerCount(1999)).toBe('1.5K+')
        expect(formatCustomerCount(2500)).toBe('2.5K+')
        expect(formatCustomerCount(3500)).toBe('3.5K+')
    })

    it('should handle larger numbers', () => {
        expect(formatCustomerCount(5000)).toBe('5K+')
        expect(formatCustomerCount(10000)).toBe('10K+')
        expect(formatCustomerCount(10500)).toBe('10.5K+')
    })
})

describe('calculateProductStats', () => {
    // Use the shared mock with test-specific defaults
    const createMockProduct = (overrides: Partial<Product> = {}): Product =>
        createBaseMockProduct({
            priceTier: 'free',
            price: 0,
            priceDisplay: '$0',
            mainCategory: 'kits-and-templates',
            tags: [],
            ...overrides
        })

    it('should return zero stats for empty array', () => {
        const result = calculateProductStats([])
        expect(result).toEqual({
            totalCustomers: 0,
            formattedCustomers: '0',
            totalTestimonials: 0,
            averageRating: 0,
            productsWithRatings: 0
        })
    })

    it('should sum customer counts from multiple products', () => {
        const products = [
            createMockProduct({
                stats: {
                    userCount: '1,000+ users',
                    timeSaved: null,
                    ratings: null,
                    additionalStats: [],
                    lastSale: null
                }
            }),
            createMockProduct({
                stats: {
                    userCount: '500',
                    timeSaved: null,
                    ratings: null,
                    additionalStats: [],
                    lastSale: null
                }
            }),
            createMockProduct({
                stats: {
                    userCount: '2,500+ students',
                    timeSaved: null,
                    ratings: null,
                    additionalStats: [],
                    lastSale: null
                }
            })
        ]
        const result = calculateProductStats(products)
        expect(result.totalCustomers).toBe(4000)
        expect(result.formattedCustomers).toBe('4K+')
    })

    it('should count testimonials from all products', () => {
        const products = [
            createMockProduct({
                testimonials: [
                    createMockTestimonial({ id: '1', author: 'User 1', quote: 'Great!' }),
                    createMockTestimonial({ id: '2', author: 'User 2', quote: 'Amazing!' })
                ],
                testimonialsCount: 2
            }),
            createMockProduct({
                testimonials: [
                    createMockTestimonial({
                        id: '3',
                        author: 'User 3',
                        quote: 'Love it!',
                        featured: true
                    })
                ],
                testimonialsCount: 1
            })
        ]
        const result = calculateProductStats(products)
        expect(result.totalTestimonials).toBe(3)
    })

    it('should calculate average rating from products with ratings', () => {
        const products = [
            createMockProduct({ averageRating: 4.5 }),
            createMockProduct({ averageRating: 5.0 }),
            createMockProduct({ averageRating: null }) // Should be excluded
        ]
        const result = calculateProductStats(products)
        expect(result.averageRating).toBe(4.75)
        expect(result.productsWithRatings).toBe(2)
    })

    it('should handle products without stats', () => {
        const products = [
            createMockProduct({ stats: null }),
            createMockProduct({
                stats: {
                    userCount: null,
                    timeSaved: null,
                    ratings: null,
                    additionalStats: [],
                    lastSale: null
                }
            })
        ]
        const result = calculateProductStats(products)
        expect(result.totalCustomers).toBe(0)
        expect(result.formattedCustomers).toBe('0')
    })

    it('should calculate all stats together', () => {
        const products = [
            createMockProduct({
                stats: {
                    userCount: '1,500+ users',
                    timeSaved: null,
                    ratings: null,
                    additionalStats: [],
                    lastSale: null
                },
                testimonials: [
                    createMockTestimonial({ id: '1', author: 'User 1', quote: 'Great!' }),
                    createMockTestimonial({ id: '2', author: 'User 2', quote: 'Amazing!' })
                ],
                testimonialsCount: 2,
                averageRating: 4.8
            }),
            createMockProduct({
                stats: {
                    userCount: '500',
                    timeSaved: null,
                    ratings: null,
                    additionalStats: [],
                    lastSale: null
                },
                testimonials: [
                    createMockTestimonial({
                        id: '3',
                        author: 'User 3',
                        quote: 'Love it!',
                        featured: true
                    })
                ],
                testimonialsCount: 1,
                averageRating: 5.0
            })
        ]
        const result = calculateProductStats(products)
        expect(result.totalCustomers).toBe(2000)
        expect(result.formattedCustomers).toBe('2K+')
        expect(result.totalTestimonials).toBe(3)
        expect(result.averageRating).toBe(4.9)
        expect(result.productsWithRatings).toBe(2)
    })

    it('should handle mixed string and object stat formats', () => {
        const products = [
            createMockProduct({
                stats: {
                    userCount: '1,000+ users',
                    timeSaved: null,
                    ratings: null,
                    additionalStats: [],
                    lastSale: null
                }
            }),
            createMockProduct({
                stats: {
                    userCount: { value: '500+', label: 'Members' },
                    timeSaved: null,
                    ratings: null,
                    additionalStats: [],
                    lastSale: null
                }
            }),
            createMockProduct({
                stats: {
                    userCount: { value: '200+', label: null },
                    timeSaved: null,
                    ratings: null,
                    additionalStats: [],
                    lastSale: null
                }
            })
        ]
        const result = calculateProductStats(products)
        expect(result.totalCustomers).toBe(1700)
        expect(result.formattedCustomers).toBe('1.5K+')
    })
})
