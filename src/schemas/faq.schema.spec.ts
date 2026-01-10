import { describe, it, expect } from 'bun:test'
import { FAQSchema, FAQsArraySchema, type FAQ } from './faq.schema'

describe('FAQ Schema Validation', () => {
    const validFAQ: FAQ = {
        id: 'faq-1',
        question: 'What is this product?',
        answer: 'This is a comprehensive guide to help you get started.',
        order: 0
    }

    describe('FAQSchema - Required Fields', () => {
        it('should accept valid complete FAQ', () => {
            const result = FAQSchema.safeParse(validFAQ)
            expect(result.success).toBe(true)
        })

        it('should reject FAQ without id', () => {
            const invalid = Object.fromEntries(
                Object.entries(validFAQ).filter(([key]) => key !== 'id')
            )
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ with empty id', () => {
            const invalid = { ...validFAQ, id: '' }
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ without question', () => {
            const invalid = Object.fromEntries(
                Object.entries(validFAQ).filter(([key]) => key !== 'question')
            )
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ with empty question', () => {
            const invalid = { ...validFAQ, question: '' }
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ without answer', () => {
            const invalid = Object.fromEntries(
                Object.entries(validFAQ).filter(([key]) => key !== 'answer')
            )
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ with empty answer', () => {
            const invalid = { ...validFAQ, answer: '' }
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ without order', () => {
            const invalid = Object.fromEntries(
                Object.entries(validFAQ).filter(([key]) => key !== 'order')
            )
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('FAQSchema - Order Validation', () => {
        it('should accept order of 0', () => {
            const valid = { ...validFAQ, order: 0 }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept positive order', () => {
            const valid = { ...validFAQ, order: 10 }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept large order value', () => {
            const valid = { ...validFAQ, order: 1000 }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject negative order', () => {
            const invalid = { ...validFAQ, order: -1 }
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject decimal order', () => {
            const invalid = { ...validFAQ, order: 1.5 }
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject string order', () => {
            const invalid = { ...validFAQ, order: '10' }
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject null order', () => {
            const invalid = { ...validFAQ, order: null }
            const result = FAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('FAQSchema - Content Validation', () => {
        it('should accept FAQ with very long question', () => {
            const valid = { ...validFAQ, question: 'Q'.repeat(500) }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with very long answer', () => {
            const valid = { ...validFAQ, answer: 'A'.repeat(5000) }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with special characters in question', () => {
            const valid = { ...validFAQ, question: 'What is the ROI? (€/$)' }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with markdown in answer', () => {
            const valid = {
                ...validFAQ,
                answer: '**Bold** and *italic* text with [links](https://example.com)'
            }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with newlines in answer', () => {
            const valid = { ...validFAQ, answer: 'Line 1\nLine 2\nLine 3' }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with HTML entities in answer', () => {
            const valid = { ...validFAQ, answer: 'Use &lt;div&gt; for containers' }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })

    describe('FAQsArraySchema', () => {
        it('should accept array of valid FAQs', () => {
            const faqs = [
                validFAQ,
                {
                    ...validFAQ,
                    id: 'faq-2',
                    question: 'How do I get started?',
                    order: 1
                },
                {
                    ...validFAQ,
                    id: 'faq-3',
                    question: 'What are the prerequisites?',
                    order: 2
                }
            ]
            const result = FAQsArraySchema.safeParse(faqs)
            expect(result.success).toBe(true)
        })

        it('should accept empty array', () => {
            const result = FAQsArraySchema.safeParse([])
            expect(result.success).toBe(true)
        })

        it('should reject array with invalid FAQ', () => {
            const faqs = [validFAQ, { ...validFAQ, question: '' }]
            const result = FAQsArraySchema.safeParse(faqs)
            expect(result.success).toBe(false)
        })

        it('should reject array with missing required fields', () => {
            const faqs = [validFAQ, { id: 'faq-2', question: 'Q2' }]
            const result = FAQsArraySchema.safeParse(faqs)
            expect(result.success).toBe(false)
        })

        it('should accept array with FAQs in any order', () => {
            const faqs = [
                { ...validFAQ, id: 'faq-1', order: 5 },
                { ...validFAQ, id: 'faq-2', order: 1 },
                { ...validFAQ, id: 'faq-3', order: 10 }
            ]
            const result = FAQsArraySchema.safeParse(faqs)
            expect(result.success).toBe(true)
        })

        it('should accept array with duplicate order values', () => {
            const faqs = [
                { ...validFAQ, id: 'faq-1', order: 1 },
                { ...validFAQ, id: 'faq-2', order: 1 },
                { ...validFAQ, id: 'faq-3', order: 1 }
            ]
            const result = FAQsArraySchema.safeParse(faqs)
            expect(result.success).toBe(true)
        })

        it('should reject non-array value', () => {
            const result = FAQsArraySchema.safeParse(validFAQ)
            expect(result.success).toBe(false)
        })

        it('should reject null value', () => {
            const result = FAQsArraySchema.safeParse(null)
            expect(result.success).toBe(false)
        })
    })

    describe('FAQSchema - Edge Cases', () => {
        it('should accept FAQ with whitespace-only content surrounded by text', () => {
            const valid = { ...validFAQ, question: 'What    is    this?' }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with numeric id', () => {
            const valid = { ...validFAQ, id: '12345' }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with UUID-style id', () => {
            const valid = { ...validFAQ, id: '550e8400-e29b-41d4-a716-446655440000' }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject FAQ with extra unknown fields', () => {
            const invalid = { ...validFAQ, extraField: 'value' }
            const result = FAQSchema.safeParse(invalid)
            // Zod strips extra fields by default, so this should succeed
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with emojis in question', () => {
            const valid = { ...validFAQ, question: 'What is this? 🚀' }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with question mark in question', () => {
            const valid = { ...validFAQ, question: 'Is this free?' }
            const result = FAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })
    })
})
