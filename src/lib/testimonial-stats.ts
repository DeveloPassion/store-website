import type { Product } from '@/schemas/product.schema'
import type { Testimonial } from '@/schemas/testimonial.schema'

export interface TestimonialStats {
    totalTestimonials: number
    averageRating: number
    productsWithTestimonials: number
}

export interface ProductWithTestimonials {
    product: Product
    testimonials: Testimonial[]
}

/**
 * Calculate testimonial statistics from products
 * Works with either Product[] or ProductWithTestimonials[]
 */
export function calculateTestimonialStats(
    input: Product[] | ProductWithTestimonials[]
): TestimonialStats {
    // Determine if input is Product[] or ProductWithTestimonials[]
    const isProductArray = input.length > 0 && input[0] && 'id' in input[0]

    let totalTestimonials = 0
    let totalRatingSum = 0
    let productsWithTestimonials = 0

    if (isProductArray) {
        // Handle Product[]
        const products = input as Product[]
        products.forEach((product) => {
            const testimonials = product.testimonials || []
            if (testimonials.length > 0) {
                productsWithTestimonials++
                totalTestimonials += testimonials.length
                const ratingSum = testimonials.reduce((sum, t) => sum + t.rating, 0)
                totalRatingSum += ratingSum
            }
        })
    } else {
        // Handle ProductWithTestimonials[]
        const productsWithTestimonialsArray = input as ProductWithTestimonials[]
        productsWithTestimonialsArray.forEach((pwt) => {
            if (pwt.testimonials.length > 0) {
                productsWithTestimonials++
                totalTestimonials += pwt.testimonials.length
                const ratingSum = pwt.testimonials.reduce((sum, t) => sum + t.rating, 0)
                totalRatingSum += ratingSum
            }
        })
    }

    const averageRating = totalTestimonials > 0 ? totalRatingSum / totalTestimonials : 0

    return {
        totalTestimonials,
        averageRating,
        productsWithTestimonials
    }
}

/**
 * Format average rating to one decimal place
 */
export function formatAverageRating(rating: number): string {
    return rating.toFixed(1)
}
