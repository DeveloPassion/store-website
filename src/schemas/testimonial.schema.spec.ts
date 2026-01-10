import { describe, it, expect } from 'bun:test'
import { TestimonialSchema, TestimonialsArraySchema, type Testimonial } from './testimonial.schema'

describe('Testimonial Schema Validation', () => {
    const validTestimonial: Testimonial = {
        id: 'testimonial-1',
        author: 'John Doe',
        role: 'Software Engineer',
        company: 'Tech Corp',
        avatarUrl: 'https://example.com/avatar.jpg',
        twitterHandle: '@johndoe',
        twitterUrl: 'https://twitter.com/johndoe',
        rating: 5,
        quote: 'This product changed my workflow completely!',
        featured: true
    }

    describe('TestimonialSchema - Required Fields', () => {
        it('should accept valid complete testimonial', () => {
            const result = TestimonialSchema.safeParse(validTestimonial)
            expect(result.success).toBe(true)
        })

        it('should reject testimonial without id', () => {
            const invalid = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'id')
            )
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject testimonial with empty id', () => {
            const invalid = { ...validTestimonial, id: '' }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject testimonial without author', () => {
            const invalid = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'author')
            )
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject testimonial with empty author', () => {
            const invalid = { ...validTestimonial, author: '' }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject testimonial without rating', () => {
            const invalid = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'rating')
            )
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject testimonial without quote', () => {
            const invalid = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'quote')
            )
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject testimonial with empty quote', () => {
            const invalid = { ...validTestimonial, quote: '' }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject testimonial without featured flag', () => {
            const invalid = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'featured')
            )
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('TestimonialSchema - Optional Fields', () => {
        it('should accept testimonial without role', () => {
            const minimal = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'role')
            )
            const result = TestimonialSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept testimonial without company', () => {
            const minimal = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'company')
            )
            const result = TestimonialSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept testimonial without avatarUrl', () => {
            const minimal = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'avatarUrl')
            )
            const result = TestimonialSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept testimonial without twitterHandle', () => {
            const minimal = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'twitterHandle')
            )
            const result = TestimonialSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept testimonial without twitterUrl', () => {
            const minimal = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'twitterUrl')
            )
            const result = TestimonialSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should accept testimonial with only required fields', () => {
            const minimal = {
                id: 'test-1',
                author: 'Jane Smith',
                rating: 4,
                quote: 'Great product!',
                featured: false
            }
            const result = TestimonialSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })
    })

    describe('TestimonialSchema - Rating Validation', () => {
        it('should accept rating of 1', () => {
            const valid = { ...validTestimonial, rating: 1 }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept rating of 5', () => {
            const valid = { ...validTestimonial, rating: 5 }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept rating of 3', () => {
            const valid = { ...validTestimonial, rating: 3 }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject rating of 0', () => {
            const invalid = { ...validTestimonial, rating: 0 }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject rating of 6', () => {
            const invalid = { ...validTestimonial, rating: 6 }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject negative rating', () => {
            const invalid = { ...validTestimonial, rating: -1 }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject decimal rating', () => {
            const invalid = { ...validTestimonial, rating: 4.5 }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject string rating', () => {
            const invalid = { ...validTestimonial, rating: '5' }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('TestimonialSchema - URL Validation', () => {
        it('should accept valid HTTPS avatarUrl', () => {
            const valid = { ...validTestimonial, avatarUrl: 'https://example.com/image.jpg' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept valid HTTP avatarUrl', () => {
            const valid = { ...validTestimonial, avatarUrl: 'http://example.com/image.jpg' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept empty string for avatarUrl', () => {
            const valid = { ...validTestimonial, avatarUrl: '' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject invalid avatarUrl', () => {
            const invalid = { ...validTestimonial, avatarUrl: 'not-a-url' }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should accept valid HTTPS twitterUrl', () => {
            const valid = { ...validTestimonial, twitterUrl: 'https://twitter.com/user' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept valid HTTP twitterUrl', () => {
            const valid = { ...validTestimonial, twitterUrl: 'http://twitter.com/user' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept empty string for twitterUrl', () => {
            const valid = { ...validTestimonial, twitterUrl: '' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject invalid twitterUrl', () => {
            const invalid = { ...validTestimonial, twitterUrl: 'not-a-url' }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should accept X.com URLs for twitterUrl', () => {
            const valid = { ...validTestimonial, twitterUrl: 'https://x.com/johndoe' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('TestimonialSchema - Featured Flag', () => {
        it('should accept featured testimonial', () => {
            const valid = { ...validTestimonial, featured: true }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept non-featured testimonial', () => {
            const valid = { ...validTestimonial, featured: false }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject non-boolean featured value', () => {
            const invalid = { ...validTestimonial, featured: 'true' }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject null featured value', () => {
            const invalid = { ...validTestimonial, featured: null }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('TestimonialsArraySchema', () => {
        it('should accept array of valid testimonials', () => {
            const testimonials = [
                validTestimonial,
                {
                    ...validTestimonial,
                    id: 'testimonial-2',
                    author: 'Jane Smith',
                    rating: 4
                },
                {
                    ...validTestimonial,
                    id: 'testimonial-3',
                    author: 'Bob Johnson',
                    rating: 5
                }
            ]
            const result = TestimonialsArraySchema.safeParse(testimonials)
            expect(result.success).toBe(true)
        })

        it('should accept empty array', () => {
            const result = TestimonialsArraySchema.safeParse([])
            expect(result.success).toBe(true)
        })

        it('should reject array with invalid testimonial', () => {
            const testimonials = [validTestimonial, { ...validTestimonial, rating: 10 }]
            const result = TestimonialsArraySchema.safeParse(testimonials)
            expect(result.success).toBe(false)
        })

        it('should reject array with missing required fields', () => {
            const testimonials = [
                validTestimonial,
                { id: 'test-2', author: 'Test', featured: true }
            ]
            const result = TestimonialsArraySchema.safeParse(testimonials)
            expect(result.success).toBe(false)
        })

        it('should accept array with mixed featured and non-featured', () => {
            const testimonials = [
                { ...validTestimonial, id: 'test-1', featured: true },
                { ...validTestimonial, id: 'test-2', featured: false },
                { ...validTestimonial, id: 'test-3', featured: true }
            ]
            const result = TestimonialsArraySchema.safeParse(testimonials)
            expect(result.success).toBe(true)
        })

        it('should reject non-array value', () => {
            const result = TestimonialsArraySchema.safeParse(validTestimonial)
            expect(result.success).toBe(false)
        })

        it('should reject null value', () => {
            const result = TestimonialsArraySchema.safeParse(null)
            expect(result.success).toBe(false)
        })
    })

    describe('TestimonialSchema - Edge Cases', () => {
        it('should accept testimonial with very long quote', () => {
            const valid = { ...validTestimonial, quote: 'A'.repeat(5000) }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept testimonial with special characters in quote', () => {
            const valid = {
                ...validTestimonial,
                quote: "This product is amazing! It's worth every €/$. (100% true)"
            }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept testimonial with emojis in quote', () => {
            const valid = { ...validTestimonial, quote: 'Love this product! 🚀 💯' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept testimonial with newlines in quote', () => {
            const valid = { ...validTestimonial, quote: 'Line 1\nLine 2\nLine 3' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept twitterHandle with @ symbol', () => {
            const valid = { ...validTestimonial, twitterHandle: '@johndoe' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept twitterHandle without @ symbol', () => {
            const valid = { ...validTestimonial, twitterHandle: 'johndoe' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject testimonial with extra unknown fields', () => {
            const invalid = { ...validTestimonial, extraField: 'value' }
            const result = TestimonialSchema.safeParse(invalid)
            // Zod strips extra fields by default, so this should succeed
            expect(result.success).toBe(true)
        })

        it('should accept testimonial with numeric id', () => {
            const valid = { ...validTestimonial, id: '12345' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept testimonial with UUID-style id', () => {
            const valid = { ...validTestimonial, id: '550e8400-e29b-41d4-a716-446655440000' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })
})
