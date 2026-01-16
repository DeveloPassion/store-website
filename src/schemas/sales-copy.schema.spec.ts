import { describe, expect, it } from 'bun:test'
import { SalesCopyDataSchema, SalesCopyFileSchema } from './sales-copy.schema'

describe('SalesCopyDataSchema', () => {
    const validSalesCopyData = {
        tagline: 'Transform your knowledge workflow',
        secondaryTagline: 'The ultimate PKM solution',
        problem: 'Knowledge workers struggle with information overload',
        problemPoints: [
            'Scattered information across multiple tools',
            'No centralized knowledge base'
        ],
        agitate: 'This costs you time, money, and opportunities',
        agitatePoints: [
            'Wasted hours searching for information',
            'Missed deadlines due to disorganization'
        ],
        solution: 'Knowii brings everything together',
        solutionPoints: ['Unified knowledge workspace', 'AI-powered organization'],
        description: 'A comprehensive knowledge management solution.',
        features: ['Voice-to-text capture', 'AI categorization'],
        benefits: {
            immediate: ['Start capturing knowledge today'],
            systematic: ['Build a lasting knowledge base'],
            longTerm: ['Compound your expertise over time']
        },
        targetAudience: ['Knowledge workers', 'Researchers'],
        perfectFor: ['Content creators', 'Consultants'],
        notForYou: ['If you prefer paper notes'],
        trustBadges: ['30-day money-back guarantee', 'Secure & private'],
        guarantees: ['Full refund if not satisfied'],
        metaTitle: 'Knowii - Knowledge Management Made Easy',
        metaDescription: 'Transform your workflow with AI-powered knowledge management.',
        keywords: ['pkm', 'knowledge management', 'ai'],
        storytelling: null,
        timeline: null,
        courseContent: null
    }

    it('should validate complete sales copy data', () => {
        expect(() => SalesCopyDataSchema.parse(validSalesCopyData)).not.toThrow()
    })

    it('should validate sales copy data with minimal required fields', () => {
        const minimalData = {
            tagline: 'Great product',
            secondaryTagline: null,
            problem: 'People have problems',
            problemPoints: ['Problem 1'],
            agitate: 'Makes things worse',
            agitatePoints: ['Pain point 1'],
            solution: 'We solve it',
            solutionPoints: ['Benefit 1'],
            description: 'Product description here.',
            features: ['Feature 1'],
            benefits: {
                immediate: [],
                systematic: [],
                longTerm: []
            },
            targetAudience: [],
            perfectFor: [],
            notForYou: [],
            trustBadges: [],
            guarantees: [],
            metaTitle: '',
            metaDescription: '',
            keywords: [],
            storytelling: null,
            timeline: null,
            courseContent: null
        }
        expect(() => SalesCopyDataSchema.parse(minimalData)).not.toThrow()
    })

    it('should validate with storytelling section', () => {
        const dataWithStorytelling = {
            ...validSalesCopyData,
            storytelling: {
                originStory: {
                    title: 'How Knowii Was Born',
                    subtitle: null,
                    story: 'One day I realized there had to be a better way...',
                    inspirationPoint: null,
                    genesisDate: null,
                    icon: null
                },
                creatorJourney: null,
                transformationArc: null,
                successStories: null,
                methodology: null,
                vision: null
            }
        }
        expect(() => SalesCopyDataSchema.parse(dataWithStorytelling)).not.toThrow()
    })

    it('should validate without storytelling section', () => {
        expect(() => SalesCopyDataSchema.parse(validSalesCopyData)).not.toThrow()
    })

    it('should reject empty tagline', () => {
        const invalidData = {
            ...validSalesCopyData,
            tagline: ''
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty problem statement', () => {
        const invalidData = {
            ...validSalesCopyData,
            problem: ''
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty problemPoints array', () => {
        const invalidData = {
            ...validSalesCopyData,
            problemPoints: []
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty agitate statement', () => {
        const invalidData = {
            ...validSalesCopyData,
            agitate: ''
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty agitatePoints array', () => {
        const invalidData = {
            ...validSalesCopyData,
            agitatePoints: []
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty solution statement', () => {
        const invalidData = {
            ...validSalesCopyData,
            solution: ''
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty solutionPoints array', () => {
        const invalidData = {
            ...validSalesCopyData,
            solutionPoints: []
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty description', () => {
        const invalidData = {
            ...validSalesCopyData,
            description: ''
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty features array', () => {
        const invalidData = {
            ...validSalesCopyData,
            features: []
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should accept benefits with all empty arrays', () => {
        const validData = {
            ...validSalesCopyData,
            benefits: {
                immediate: [],
                systematic: [],
                longTerm: []
            }
        }
        expect(() => SalesCopyDataSchema.parse(validData)).not.toThrow()
    })

    it('should reject benefits with missing categories', () => {
        const invalidData = {
            ...validSalesCopyData,
            benefits: {}
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should accept empty targetAudience array', () => {
        const validData = {
            ...validSalesCopyData,
            targetAudience: []
        }
        expect(() => SalesCopyDataSchema.parse(validData)).not.toThrow()
    })

    it('should accept empty perfectFor array', () => {
        const validData = {
            ...validSalesCopyData,
            perfectFor: []
        }
        expect(() => SalesCopyDataSchema.parse(validData)).not.toThrow()
    })

    it('should accept empty notForYou array', () => {
        const validData = {
            ...validSalesCopyData,
            notForYou: []
        }
        expect(() => SalesCopyDataSchema.parse(validData)).not.toThrow()
    })

    it('should accept empty trustBadges array', () => {
        const validData = {
            ...validSalesCopyData,
            trustBadges: []
        }
        expect(() => SalesCopyDataSchema.parse(validData)).not.toThrow()
    })

    it('should accept empty guarantees array', () => {
        const validData = {
            ...validSalesCopyData,
            guarantees: []
        }
        expect(() => SalesCopyDataSchema.parse(validData)).not.toThrow()
    })

    it('should require SEO fields (even if empty)', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { metaTitle, metaDescription, keywords, ...invalidData } = validSalesCopyData
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should accept empty SEO fields', () => {
        const validData = {
            ...validSalesCopyData,
            metaTitle: '',
            metaDescription: '',
            keywords: []
        }
        expect(() => SalesCopyDataSchema.parse(validData)).not.toThrow()
    })

    it('should validate benefits with all three timeframes', () => {
        const validData = {
            ...validSalesCopyData,
            benefits: {
                immediate: ['Quick win 1'],
                systematic: ['Process improvement 1'],
                longTerm: ['Long-term benefit 1']
            }
        }
        expect(() => SalesCopyDataSchema.parse(validData)).not.toThrow()
    })

    it('should reject benefits with partial timeframes', () => {
        const invalidData = {
            ...validSalesCopyData,
            benefits: {
                immediate: ['Quick win 1']
            }
        }
        expect(() => SalesCopyDataSchema.parse(invalidData)).toThrow()
    })

    it('should accept empty arrays in benefits', () => {
        const validData = {
            ...validSalesCopyData,
            benefits: {
                immediate: [],
                systematic: [],
                longTerm: []
            }
        }
        expect(() => SalesCopyDataSchema.parse(validData)).not.toThrow()
    })
})

describe('SalesCopyFileSchema', () => {
    const validSalesCopyFile = {
        id: 'default',
        salesCopy: {
            tagline: 'Transform your knowledge workflow',
            secondaryTagline: null,
            problem: 'Knowledge workers struggle with information overload',
            problemPoints: ['Scattered information'],
            agitate: 'This costs you time',
            agitatePoints: ['Wasted hours'],
            solution: 'Knowii brings everything together',
            solutionPoints: ['Unified workspace'],
            description: 'A comprehensive solution.',
            features: ['Voice capture'],
            benefits: {
                immediate: [],
                systematic: [],
                longTerm: []
            },
            targetAudience: [],
            perfectFor: [],
            notForYou: [],
            trustBadges: [],
            guarantees: [],
            metaTitle: '',
            metaDescription: '',
            keywords: [],
            storytelling: null,
            timeline: null,
            courseContent: null
        }
    }

    it('should validate a complete sales copy file', () => {
        expect(() => SalesCopyFileSchema.parse(validSalesCopyFile)).not.toThrow()
    })

    it('should reject missing id', () => {
        const invalidData = {
            salesCopy: validSalesCopyFile.salesCopy
        }
        expect(() => SalesCopyFileSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty id', () => {
        const invalidData = {
            id: '',
            salesCopy: validSalesCopyFile.salesCopy
        }
        expect(() => SalesCopyFileSchema.parse(invalidData)).toThrow()
    })

    it('should reject missing salesCopy', () => {
        const invalidData = {
            id: 'default'
        }
        expect(() => SalesCopyFileSchema.parse(invalidData)).toThrow()
    })

    it('should reject invalid salesCopy data', () => {
        const invalidData = {
            id: 'default',
            salesCopy: {
                tagline: 'Valid',
                problem: '', // Invalid: empty
                problemPoints: ['Point']
            }
        }
        expect(() => SalesCopyFileSchema.parse(invalidData)).toThrow()
    })

    it('should validate file with storytelling', () => {
        const validData = {
            id: 'holiday-2026',
            salesCopy: {
                ...validSalesCopyFile.salesCopy,
                storytelling: {
                    originStory: null,
                    creatorJourney: null,
                    transformationArc: null,
                    successStories: null,
                    methodology: null,
                    vision: {
                        title: 'Our Vision',
                        subtitle: null,
                        mission: 'Empower knowledge workers worldwide.',
                        values: null,
                        futureGoals: null,
                        biggerPicture: null,
                        icon: null
                    }
                }
            }
        }
        expect(() => SalesCopyFileSchema.parse(validData)).not.toThrow()
    })

    it('should validate file with multiple IDs', () => {
        const validIds = ['default', 'holiday-2026', 'black-friday', 'v2', 'test-variant']
        validIds.forEach((id) => {
            const validData = {
                id,
                salesCopy: validSalesCopyFile.salesCopy
            }
            expect(() => SalesCopyFileSchema.parse(validData)).not.toThrow()
        })
    })

    it('should validate nested storytelling sections', () => {
        const validData = {
            id: 'storytelling-variant',
            salesCopy: {
                ...validSalesCopyFile.salesCopy,
                storytelling: {
                    originStory: {
                        title: 'Origin',
                        subtitle: null,
                        story: 'How we started building this amazing product.',
                        inspirationPoint: null,
                        genesisDate: null,
                        icon: null
                    },
                    creatorJourney: {
                        title: 'Journey',
                        subtitle: null,
                        story: 'My path to creating this solution.',
                        struggles: null,
                        achievements: null,
                        credentials: null,
                        icon: null
                    },
                    transformationArc: {
                        title: 'Transform',
                        subtitle: null,
                        before: {
                            title: 'Before',
                            description: 'Old way was very difficult.',
                            points: null,
                            icon: null
                        },
                        during: {
                            title: 'During',
                            description: 'Transition period here.',
                            points: null,
                            icon: null
                        },
                        after: {
                            title: 'After',
                            description: 'New way is much better.',
                            points: null,
                            icon: null
                        },
                        timeline: null
                    },
                    successStories: {
                        title: 'Stories',
                        subtitle: null,
                        stories: [
                            {
                                name: 'User',
                                role: null,
                                company: null,
                                result: 'Great results were achieved.',
                                metrics: null,
                                quote: null,
                                image: null,
                                avatarUrl: null
                            }
                        ]
                    },
                    methodology: {
                        title: 'Method',
                        subtitle: null,
                        steps: [
                            {
                                title: 'Step 1',
                                description: 'Do this first step.',
                                icon: null,
                                order: 0
                            }
                        ],
                        philosophy: null,
                        differentiation: null
                    },
                    vision: {
                        title: 'Vision',
                        subtitle: null,
                        mission: 'Our mission statement.',
                        values: null,
                        futureGoals: null,
                        biggerPicture: null,
                        icon: null
                    }
                }
            }
        }
        expect(() => SalesCopyFileSchema.parse(validData)).not.toThrow()
    })
})
