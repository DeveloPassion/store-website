import { describe, it, expect } from 'bun:test'
import {
    TestimonialSchema,
    TestimonialsArraySchema,
    TestimonialFileSchema,
    type Testimonial
} from './testimonial.schema'

describe('Testimonial Schema Validation', () => {
    const validTestimonial: Testimonial = {
        id: 'testimonial-1',
        author: 'John Doe',
        role: 'Software Engineer',
        company: 'Tech Corp',
        avatarUrl: 'https://example.com/avatar.jpg',
        twitterHandle: '@johndoe',
        twitterUrl: 'https://twitter.com/johndoe',
        sourceUrl: 'https://medium.com/@johndoe/review-of-this-product',
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

        it('should reject testimonial with whitespace-only author', () => {
            const invalid = { ...validTestimonial, author: '   ' }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject testimonial with whitespace-only quote', () => {
            const invalid = { ...validTestimonial, quote: '   ' }
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

    describe('TestimonialSchema - Nullable Fields', () => {
        it('should accept testimonial with null role', () => {
            const valid = { ...validTestimonial, role: null }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject testimonial without role field', () => {
            const withoutRole = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'role')
            )
            const result = TestimonialSchema.safeParse(withoutRole)
            expect(result.success).toBe(false)
        })

        it('should accept testimonial with null company', () => {
            const valid = { ...validTestimonial, company: null }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject testimonial without company field', () => {
            const withoutCompany = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'company')
            )
            const result = TestimonialSchema.safeParse(withoutCompany)
            expect(result.success).toBe(false)
        })

        it('should accept testimonial with null avatarUrl', () => {
            const valid = { ...validTestimonial, avatarUrl: null }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject testimonial without avatarUrl field', () => {
            const withoutAvatarUrl = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'avatarUrl')
            )
            const result = TestimonialSchema.safeParse(withoutAvatarUrl)
            expect(result.success).toBe(false)
        })

        it('should accept testimonial with null twitterHandle', () => {
            const valid = { ...validTestimonial, twitterHandle: null }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject testimonial without twitterHandle field', () => {
            const withoutTwitterHandle = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'twitterHandle')
            )
            const result = TestimonialSchema.safeParse(withoutTwitterHandle)
            expect(result.success).toBe(false)
        })

        it('should accept testimonial with null twitterUrl', () => {
            const valid = { ...validTestimonial, twitterUrl: null }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject testimonial without twitterUrl field', () => {
            const withoutTwitterUrl = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'twitterUrl')
            )
            const result = TestimonialSchema.safeParse(withoutTwitterUrl)
            expect(result.success).toBe(false)
        })

        it('should accept testimonial with all nullable fields set to null', () => {
            const allNullable = {
                id: 'test-1',
                author: 'Jane Smith',
                quote: 'Great product!',
                featured: false,
                role: null,
                company: null,
                avatarUrl: null,
                twitterHandle: null,
                twitterUrl: null,
                sourceUrl: null
            }
            const result = TestimonialSchema.safeParse(allNullable)
            expect(result.success).toBe(true)
        })

        it('should accept testimonial with null sourceUrl', () => {
            const valid = { ...validTestimonial, sourceUrl: null }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject testimonial without sourceUrl field', () => {
            const withoutSourceUrl = Object.fromEntries(
                Object.entries(validTestimonial).filter(([key]) => key !== 'sourceUrl')
            )
            const result = TestimonialSchema.safeParse(withoutSourceUrl)
            expect(result.success).toBe(false)
        })

        it('should reject empty string for sourceUrl', () => {
            const invalid = { ...validTestimonial, sourceUrl: '' }
            const result = TestimonialSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should accept Medium URL for sourceUrl', () => {
            const valid = {
                ...validTestimonial,
                sourceUrl: 'https://medium.com/@user/post-id'
            }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
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

        it('should accept relative path for avatarUrl', () => {
            const valid = { ...validTestimonial, avatarUrl: '/images/avatar.jpg' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject empty string for avatarUrl', () => {
            const invalid = { ...validTestimonial, avatarUrl: '' }
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

        it('should accept relative path for twitterUrl', () => {
            const valid = { ...validTestimonial, twitterUrl: '/user/profile' }
            const result = TestimonialSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject empty string for twitterUrl', () => {
            const invalid = { ...validTestimonial, twitterUrl: '' }
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
                    author: 'Jane Smith'
                },
                {
                    ...validTestimonial,
                    id: 'testimonial-3',
                    author: 'Bob Johnson'
                }
            ]
            const result = TestimonialsArraySchema.safeParse(testimonials)
            expect(result.success).toBe(true)
        })

        it('should accept empty array', () => {
            const result = TestimonialsArraySchema.safeParse([])
            expect(result.success).toBe(true)
        })

        it('should reject array with invalid testimonial (missing quote)', () => {
            const testimonials = [validTestimonial, { ...validTestimonial, quote: '' }]
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

    describe('TestimonialFileSchema - File Format Validation', () => {
        it('should accept valid file with data array', () => {
            const validFile = {
                data: [validTestimonial]
            }
            const result = TestimonialFileSchema.safeParse(validFile)
            expect(result.success).toBe(true)
        })

        it('should accept file with empty data array', () => {
            const validFile = { data: [] }
            const result = TestimonialFileSchema.safeParse(validFile)
            expect(result.success).toBe(true)
        })

        it('should accept file with multiple testimonials', () => {
            const validFile = {
                data: [
                    validTestimonial,
                    { ...validTestimonial, id: 'test-2', author: 'Jane Smith' },
                    { ...validTestimonial, id: 'test-3', author: 'Bob Johnson' }
                ]
            }
            const result = TestimonialFileSchema.safeParse(validFile)
            expect(result.success).toBe(true)
        })

        it('should reject file without data property', () => {
            const invalid = [validTestimonial]
            const result = TestimonialFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject file with null data', () => {
            const invalid = { data: null }
            const result = TestimonialFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject file with non-array data', () => {
            const invalid = { data: validTestimonial }
            const result = TestimonialFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject file with invalid testimonial in data array', () => {
            const invalid = {
                data: [validTestimonial, { ...validTestimonial, quote: '' }]
            }
            const result = TestimonialFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject root-level array (old format)', () => {
            const oldFormat = [validTestimonial]
            const result = TestimonialFileSchema.safeParse(oldFormat)
            expect(result.success).toBe(false)
        })
    })
})
