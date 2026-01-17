import { describe, it, expect } from 'bun:test'
import {
    GlobalFAQSchema,
    GlobalFAQsArraySchema,
    GlobalFAQFileSchema,
    GlobalFAQFeatureSchema,
    GlobalFAQStepSchema,
    GlobalFAQLinkSchema,
    type GlobalFAQ
} from './global-faq.schema'

describe('Global FAQ Schema Validation', () => {
    const validGlobalFAQ: GlobalFAQ = {
        id: 'faq-1',
        question: 'What is this product?',
        answer: 'This is a comprehensive guide to help you get started.',
        icon: null,
        order: 0,
        style: 'default',
        features: null,
        steps: null,
        bullets: null,
        links: null,
        additionalText: null
    }

    describe('GlobalFAQSchema - Required Fields', () => {
        it('should accept valid complete FAQ', () => {
            const result = GlobalFAQSchema.safeParse(validGlobalFAQ)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with minimal required fields', () => {
            const minimal = {
                id: 'faq-1',
                question: 'What is this?',
                answer: 'This is the answer.'
            }
            const result = GlobalFAQSchema.safeParse(minimal)
            expect(result.success).toBe(true)
        })

        it('should reject FAQ without id', () => {
            const invalid = Object.fromEntries(
                Object.entries(validGlobalFAQ).filter(([key]) => key !== 'id')
            )
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ with empty id', () => {
            const invalid = { ...validGlobalFAQ, id: '' }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ without question', () => {
            const invalid = Object.fromEntries(
                Object.entries(validGlobalFAQ).filter(([key]) => key !== 'question')
            )
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ with empty question', () => {
            const invalid = { ...validGlobalFAQ, question: '' }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ without answer', () => {
            const invalid = Object.fromEntries(
                Object.entries(validGlobalFAQ).filter(([key]) => key !== 'answer')
            )
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ with empty answer', () => {
            const invalid = { ...validGlobalFAQ, answer: '' }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ with whitespace-only question', () => {
            const invalid = { ...validGlobalFAQ, question: '   ' }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ with whitespace-only answer', () => {
            const invalid = { ...validGlobalFAQ, answer: '   ' }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('GlobalFAQSchema - Icon Field', () => {
        it('should accept FAQ with valid icon name', () => {
            const valid = { ...validGlobalFAQ, icon: 'FaShoppingCart' }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.icon).toBe('FaShoppingCart')
            }
        })

        it('should accept FAQ with null icon', () => {
            const valid = { ...validGlobalFAQ, icon: null }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should default icon to null when not provided', () => {
            const minimal = {
                id: 'faq-1',
                question: 'What is this?',
                answer: 'This is the answer.'
            }
            const result = GlobalFAQSchema.safeParse(minimal)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.icon).toBe(null)
            }
        })
    })

    describe('GlobalFAQSchema - Order Field', () => {
        it('should accept FAQ with valid order', () => {
            const valid = { ...validGlobalFAQ, order: 5 }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.order).toBe(5)
            }
        })

        it('should accept FAQ with order 0', () => {
            const valid = { ...validGlobalFAQ, order: 0 }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject FAQ with negative order', () => {
            const invalid = { ...validGlobalFAQ, order: -1 }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject FAQ with non-integer order', () => {
            const invalid = { ...validGlobalFAQ, order: 1.5 }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should default order to 0 when not provided', () => {
            const minimal = {
                id: 'faq-1',
                question: 'What is this?',
                answer: 'This is the answer.'
            }
            const result = GlobalFAQSchema.safeParse(minimal)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.order).toBe(0)
            }
        })
    })

    describe('GlobalFAQSchema - Style Field', () => {
        it('should accept FAQ with default style', () => {
            const valid = { ...validGlobalFAQ, style: 'default' as const }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with highlight style', () => {
            const valid = { ...validGlobalFAQ, style: 'highlight' as const }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject FAQ with invalid style', () => {
            const invalid = { ...validGlobalFAQ, style: 'invalid' }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should default style to default when not provided', () => {
            const minimal = {
                id: 'faq-1',
                question: 'What is this?',
                answer: 'This is the answer.'
            }
            const result = GlobalFAQSchema.safeParse(minimal)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.style).toBe('default')
            }
        })
    })

    describe('GlobalFAQFeatureSchema', () => {
        const validFeature = {
            icon: 'FaLock',
            title: 'Bank-Level Security',
            description: 'Your data is protected with industry-leading security.'
        }

        it('should accept valid feature', () => {
            const result = GlobalFAQFeatureSchema.safeParse(validFeature)
            expect(result.success).toBe(true)
        })

        it('should reject feature without icon', () => {
            const invalid = { title: 'Test', description: 'Test' }
            const result = GlobalFAQFeatureSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject feature without title', () => {
            const invalid = { icon: 'FaLock', description: 'Test' }
            const result = GlobalFAQFeatureSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject feature without description', () => {
            const invalid = { icon: 'FaLock', title: 'Test' }
            const result = GlobalFAQFeatureSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject feature with empty icon', () => {
            const invalid = { ...validFeature, icon: '' }
            const result = GlobalFAQFeatureSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject feature with empty title', () => {
            const invalid = { ...validFeature, title: '' }
            const result = GlobalFAQFeatureSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject feature with empty description', () => {
            const invalid = { ...validFeature, description: '' }
            const result = GlobalFAQFeatureSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('GlobalFAQStepSchema', () => {
        const validStep = {
            title: 'Browse products',
            description: 'on this website and click "Quick Open"'
        }

        it('should accept valid step', () => {
            const result = GlobalFAQStepSchema.safeParse(validStep)
            expect(result.success).toBe(true)
        })

        it('should reject step without title', () => {
            const invalid = { description: 'Test' }
            const result = GlobalFAQStepSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject step without description', () => {
            const invalid = { title: 'Test' }
            const result = GlobalFAQStepSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject step with empty title', () => {
            const invalid = { ...validStep, title: '' }
            const result = GlobalFAQStepSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject step with empty description', () => {
            const invalid = { ...validStep, description: '' }
            const result = GlobalFAQStepSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('GlobalFAQLinkSchema', () => {
        const validLink = {
            label: 'Contact Me',
            url: 'mailto:test@example.com',
            external: false,
            primary: true
        }

        it('should accept valid link', () => {
            const result = GlobalFAQLinkSchema.safeParse(validLink)
            expect(result.success).toBe(true)
        })

        it('should accept link with minimal fields', () => {
            const minimal = {
                label: 'Test',
                url: 'https://example.com'
            }
            const result = GlobalFAQLinkSchema.safeParse(minimal)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.external).toBe(false)
                expect(result.data.primary).toBe(false)
            }
        })

        it('should accept external link', () => {
            const external = { ...validLink, external: true }
            const result = GlobalFAQLinkSchema.safeParse(external)
            expect(result.success).toBe(true)
        })

        it('should reject link without label', () => {
            const invalid = { url: 'https://example.com' }
            const result = GlobalFAQLinkSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject link without url', () => {
            const invalid = { label: 'Test' }
            const result = GlobalFAQLinkSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject link with empty label', () => {
            const invalid = { ...validLink, label: '' }
            const result = GlobalFAQLinkSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject link with empty url', () => {
            const invalid = { ...validLink, url: '' }
            const result = GlobalFAQLinkSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('GlobalFAQSchema - Features Array', () => {
        it('should accept FAQ with valid features array', () => {
            const valid = {
                ...validGlobalFAQ,
                features: [
                    { icon: 'FaLock', title: 'Security', description: 'Secure payments' },
                    { icon: 'FaGlobe', title: 'Global', description: 'Available worldwide' }
                ]
            }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with null features', () => {
            const valid = { ...validGlobalFAQ, features: null }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject FAQ with invalid feature in array', () => {
            const invalid = {
                ...validGlobalFAQ,
                features: [{ icon: 'FaLock', title: '' }]
            }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('GlobalFAQSchema - Steps Array', () => {
        it('should accept FAQ with valid steps array', () => {
            const valid = {
                ...validGlobalFAQ,
                steps: [
                    { title: 'Step 1', description: 'Do this first' },
                    { title: 'Step 2', description: 'Then do this' }
                ]
            }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with null steps', () => {
            const valid = { ...validGlobalFAQ, steps: null }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject FAQ with invalid step in array', () => {
            const invalid = {
                ...validGlobalFAQ,
                steps: [{ title: '', description: 'Test' }]
            }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('GlobalFAQSchema - Bullets Array', () => {
        it('should accept FAQ with valid bullets array', () => {
            const valid = {
                ...validGlobalFAQ,
                bullets: ['First point', 'Second point', 'Third point']
            }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with null bullets', () => {
            const valid = { ...validGlobalFAQ, bullets: null }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject FAQ with empty string in bullets array', () => {
            const invalid = {
                ...validGlobalFAQ,
                bullets: ['Valid', '', 'Also valid']
            }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('GlobalFAQSchema - Links Array', () => {
        it('should accept FAQ with valid links array', () => {
            const valid = {
                ...validGlobalFAQ,
                links: [
                    {
                        label: 'Contact',
                        url: 'mailto:test@example.com',
                        external: false,
                        primary: true
                    },
                    {
                        label: 'Help',
                        url: 'https://help.example.com',
                        external: true,
                        primary: false
                    }
                ]
            }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with null links', () => {
            const valid = { ...validGlobalFAQ, links: null }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should reject FAQ with invalid link in array', () => {
            const invalid = {
                ...validGlobalFAQ,
                links: [{ label: '', url: 'https://example.com' }]
            }
            const result = GlobalFAQSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })
    })

    describe('GlobalFAQSchema - AdditionalText Field', () => {
        it('should accept FAQ with additionalText', () => {
            const valid = { ...validGlobalFAQ, additionalText: 'Some extra information.' }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with null additionalText', () => {
            const valid = { ...validGlobalFAQ, additionalText: null }
            const result = GlobalFAQSchema.safeParse(valid)
            expect(result.success).toBe(true)
        })

        it('should default additionalText to null when not provided', () => {
            const minimal = {
                id: 'faq-1',
                question: 'What is this?',
                answer: 'This is the answer.'
            }
            const result = GlobalFAQSchema.safeParse(minimal)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.additionalText).toBe(null)
            }
        })
    })

    describe('GlobalFAQsArraySchema', () => {
        it('should accept array of valid FAQs', () => {
            const faqs = [
                validGlobalFAQ,
                { ...validGlobalFAQ, id: 'faq-2', question: 'How do I get started?' },
                { ...validGlobalFAQ, id: 'faq-3', question: 'What are the prerequisites?' }
            ]
            const result = GlobalFAQsArraySchema.safeParse(faqs)
            expect(result.success).toBe(true)
        })

        it('should accept empty array', () => {
            const result = GlobalFAQsArraySchema.safeParse([])
            expect(result.success).toBe(true)
        })

        it('should reject array with invalid FAQ', () => {
            const faqs = [validGlobalFAQ, { ...validGlobalFAQ, question: '' }]
            const result = GlobalFAQsArraySchema.safeParse(faqs)
            expect(result.success).toBe(false)
        })

        it('should reject non-array value', () => {
            const result = GlobalFAQsArraySchema.safeParse(validGlobalFAQ)
            expect(result.success).toBe(false)
        })

        it('should reject null value', () => {
            const result = GlobalFAQsArraySchema.safeParse(null)
            expect(result.success).toBe(false)
        })
    })

    describe('GlobalFAQFileSchema - File Format Validation', () => {
        it('should accept valid file with data array', () => {
            const validFile = { data: [validGlobalFAQ] }
            const result = GlobalFAQFileSchema.safeParse(validFile)
            expect(result.success).toBe(true)
        })

        it('should accept file with empty data array', () => {
            const validFile = { data: [] }
            const result = GlobalFAQFileSchema.safeParse(validFile)
            expect(result.success).toBe(true)
        })

        it('should accept file with multiple FAQs', () => {
            const validFile = {
                data: [
                    validGlobalFAQ,
                    { ...validGlobalFAQ, id: 'faq-2' },
                    { ...validGlobalFAQ, id: 'faq-3' }
                ]
            }
            const result = GlobalFAQFileSchema.safeParse(validFile)
            expect(result.success).toBe(true)
        })

        it('should reject file without data property', () => {
            const invalid = [validGlobalFAQ]
            const result = GlobalFAQFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject file with null data', () => {
            const invalid = { data: null }
            const result = GlobalFAQFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject file with non-array data', () => {
            const invalid = { data: validGlobalFAQ }
            const result = GlobalFAQFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject file with invalid FAQ in data array', () => {
            const invalid = {
                data: [validGlobalFAQ, { ...validGlobalFAQ, question: '' }]
            }
            const result = GlobalFAQFileSchema.safeParse(invalid)
            expect(result.success).toBe(false)
        })

        it('should reject root-level array (wrong format)', () => {
            const wrongFormat = [validGlobalFAQ]
            const result = GlobalFAQFileSchema.safeParse(wrongFormat)
            expect(result.success).toBe(false)
        })
    })

    describe('GlobalFAQSchema - Complex Combinations', () => {
        it('should accept FAQ with all optional fields populated', () => {
            const complete: GlobalFAQ = {
                id: 'complete-faq',
                question: 'Complete FAQ example?',
                answer: 'This FAQ has all fields populated.',
                icon: 'FaShieldAlt',
                order: 10,
                style: 'highlight',
                features: [
                    { icon: 'FaLock', title: 'Security', description: 'Bank-level security' }
                ],
                steps: [{ title: 'Step 1', description: 'First step' }],
                bullets: ['Point 1', 'Point 2'],
                links: [
                    {
                        label: 'Contact',
                        url: 'mailto:test@example.com',
                        external: false,
                        primary: true
                    }
                ],
                additionalText: 'Additional information here.'
            }
            const result = GlobalFAQSchema.safeParse(complete)
            expect(result.success).toBe(true)
        })

        it('should accept FAQ with features and bullets together', () => {
            const mixed = {
                ...validGlobalFAQ,
                features: [{ icon: 'FaLock', title: 'Security', description: 'Secure' }],
                bullets: ['Extra point 1', 'Extra point 2']
            }
            const result = GlobalFAQSchema.safeParse(mixed)
            expect(result.success).toBe(true)
        })
    })
})
