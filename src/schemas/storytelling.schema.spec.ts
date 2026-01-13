import { describe, expect, it } from 'bun:test'
import {
    OriginStorySchema,
    CreatorJourneySchema,
    TransformationPhaseSchema,
    TransformationArcSchema,
    SuccessStorySchema,
    SuccessStoriesSchema,
    MethodologyStepSchema,
    MethodologySchema,
    VisionSchema,
    StorytellingSchema
} from './storytelling.schema'

describe('OriginStorySchema', () => {
    it('should validate a valid origin story', () => {
        const validData = {
            title: 'How It All Began',
            subtitle: 'The genesis of our product',
            story: 'One day, I realized there had to be a better way...',
            inspirationPoint: 'Frustration with existing tools',
            genesisDate: '2024-01-01',
            icon: 'FaLightbulb'
        }
        expect(() => OriginStorySchema.parse(validData)).not.toThrow()
    })

    it('should validate origin story with minimal required fields', () => {
        const minimalData = {
            title: 'Our Origin',
            story: 'The beginning of our journey to build something amazing.'
        }
        expect(() => OriginStorySchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty title', () => {
        const invalidData = {
            title: '',
            story: 'Valid story content here.'
        }
        expect(() => OriginStorySchema.parse(invalidData)).toThrow()
    })

    it('should reject story that is too short', () => {
        const invalidData = {
            title: 'Our Origin',
            story: 'Short'
        }
        expect(() => OriginStorySchema.parse(invalidData)).toThrow()
    })

    it('should accept story exactly 10 characters', () => {
        const validData = {
            title: 'Our Origin',
            story: '1234567890'
        }
        expect(() => OriginStorySchema.parse(validData)).not.toThrow()
    })
})

describe('CreatorJourneySchema', () => {
    it('should validate a valid creator journey', () => {
        const validData = {
            title: 'My Journey',
            subtitle: 'From struggle to success',
            story: 'I spent 10 years learning the hard way...',
            struggles: ['Self-doubt', 'Financial challenges', 'Technical obstacles'],
            achievements: ['Built 3 successful products', 'Helped 10,000+ users'],
            credentials: 'PhD in Computer Science, 15 years industry experience',
            icon: 'FaRoad'
        }
        expect(() => CreatorJourneySchema.parse(validData)).not.toThrow()
    })

    it('should validate creator journey with minimal fields', () => {
        const minimalData = {
            title: 'Journey',
            story: 'My personal story of transformation and growth.'
        }
        expect(() => CreatorJourneySchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty title', () => {
        const invalidData = {
            title: '',
            story: 'Valid story.'
        }
        expect(() => CreatorJourneySchema.parse(invalidData)).toThrow()
    })

    it('should accept empty arrays for struggles and achievements', () => {
        const validData = {
            title: 'Journey',
            story: 'My story here.',
            struggles: [],
            achievements: []
        }
        expect(() => CreatorJourneySchema.parse(validData)).not.toThrow()
    })
})

describe('TransformationPhaseSchema', () => {
    it('should validate a valid transformation phase', () => {
        const validData = {
            title: 'Before',
            description: 'Life was hard before discovering the solution.',
            points: ['Struggling with manual processes', 'No clear system'],
            icon: 'FaSadTear'
        }
        expect(() => TransformationPhaseSchema.parse(validData)).not.toThrow()
    })

    it('should validate phase with minimal fields', () => {
        const minimalData = {
            title: 'During',
            description: 'Implementation phase where things start to change.'
        }
        expect(() => TransformationPhaseSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty title', () => {
        const invalidData = {
            title: '',
            description: 'Valid description.'
        }
        expect(() => TransformationPhaseSchema.parse(invalidData)).toThrow()
    })

    it('should reject short description', () => {
        const invalidData = {
            title: 'After',
            description: 'Short'
        }
        expect(() => TransformationPhaseSchema.parse(invalidData)).toThrow()
    })
})

describe('TransformationArcSchema', () => {
    it('should validate a valid transformation arc', () => {
        const validData = {
            title: 'Your Transformation Journey',
            subtitle: 'From chaos to clarity',
            before: {
                title: 'Before',
                description: 'Struggling with manual work and disorganization.',
                points: ['No system', 'Wasted time'],
                icon: 'FaSadTear'
            },
            during: {
                title: 'During',
                description: 'Learning and implementing the new system.',
                points: ['Training', 'Setup']
            },
            after: {
                title: 'After',
                description: 'Enjoying streamlined workflows and productivity.',
                points: ['Efficient', 'Organized'],
                icon: 'FaSmile'
            },
            timeline: '3-6 months'
        }
        expect(() => TransformationArcSchema.parse(validData)).not.toThrow()
    })

    it('should validate transformation arc with minimal fields', () => {
        const minimalData = {
            title: 'Transformation',
            before: { title: 'Before', description: 'Old way was painful.' },
            during: { title: 'During', description: 'Transition period.' },
            after: { title: 'After', description: 'New way is better.' }
        }
        expect(() => TransformationArcSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject missing phases', () => {
        const invalidData = {
            title: 'Transformation',
            before: { title: 'Before', description: 'Old way.' }
        }
        expect(() => TransformationArcSchema.parse(invalidData)).toThrow()
    })
})

describe('SuccessStorySchema', () => {
    it('should validate a valid success story', () => {
        const validData = {
            name: 'John Doe',
            role: 'CEO',
            company: 'Acme Corp',
            result: 'Increased productivity by 50% and saved 10 hours per week.',
            metrics: [
                { label: 'Time Saved', value: '10 hours/week', icon: 'FaClock' },
                { label: 'Productivity', value: '+50%', icon: 'FaChartLine' }
            ],
            quote: 'This product changed my life!',
            image: '/images/john-success.png',
            avatarUrl: '/images/john-avatar.jpg'
        }
        expect(() => SuccessStorySchema.parse(validData)).not.toThrow()
    })

    it('should validate success story with minimal fields', () => {
        const minimalData = {
            name: 'Jane Smith',
            result: 'Achieved amazing results with this product.'
        }
        expect(() => SuccessStorySchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty name', () => {
        const invalidData = {
            name: '',
            result: 'Great results.'
        }
        expect(() => SuccessStorySchema.parse(invalidData)).toThrow()
    })

    it('should reject short result', () => {
        const invalidData = {
            name: 'John',
            result: 'Good'
        }
        expect(() => SuccessStorySchema.parse(invalidData)).toThrow()
    })

    it('should accept empty metrics array', () => {
        const validData = {
            name: 'Sarah',
            result: 'Got excellent results.',
            metrics: []
        }
        expect(() => SuccessStorySchema.parse(validData)).not.toThrow()
    })

    it('should validate metrics with all required fields', () => {
        const validData = {
            name: 'Mike',
            result: 'Outstanding performance.',
            metrics: [{ label: 'ROI', value: '300%' }]
        }
        expect(() => SuccessStorySchema.parse(validData)).not.toThrow()
    })

    it('should reject metrics with empty label or value', () => {
        const invalidData = {
            name: 'Tom',
            result: 'Great results achieved.',
            metrics: [{ label: '', value: '100%' }]
        }
        expect(() => SuccessStorySchema.parse(invalidData)).toThrow()
    })
})

describe('SuccessStoriesSchema', () => {
    it('should validate a valid success stories collection', () => {
        const validData = {
            title: 'Customer Success Stories',
            subtitle: 'Real results from real users',
            stories: [
                {
                    name: 'Alice',
                    result: 'Transformed her business completely.'
                },
                {
                    name: 'Bob',
                    result: 'Saved 20 hours per month.'
                }
            ]
        }
        expect(() => SuccessStoriesSchema.parse(validData)).not.toThrow()
    })

    it('should reject empty stories array', () => {
        const invalidData = {
            title: 'Success Stories',
            stories: []
        }
        expect(() => SuccessStoriesSchema.parse(invalidData)).toThrow()
    })

    it('should validate with one story minimum', () => {
        const validData = {
            title: 'Success Story',
            stories: [{ name: 'Chris', result: 'Amazing transformation.' }]
        }
        expect(() => SuccessStoriesSchema.parse(validData)).not.toThrow()
    })
})

describe('MethodologyStepSchema', () => {
    it('should validate a valid methodology step', () => {
        const validData = {
            title: 'Step 1: Discovery',
            description: 'Understand your current situation and identify opportunities.',
            icon: 'FaSearch',
            order: 0
        }
        expect(() => MethodologyStepSchema.parse(validData)).not.toThrow()
    })

    it('should validate step with minimal fields', () => {
        const minimalData = {
            title: 'Step 2',
            description: 'Implement the solution.',
            order: 1
        }
        expect(() => MethodologyStepSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject negative order', () => {
        const invalidData = {
            title: 'Step',
            description: 'Do something.',
            order: -1
        }
        expect(() => MethodologyStepSchema.parse(invalidData)).toThrow()
    })

    it('should reject non-integer order', () => {
        const invalidData = {
            title: 'Step',
            description: 'Do something.',
            order: 1.5
        }
        expect(() => MethodologyStepSchema.parse(invalidData)).toThrow()
    })
})

describe('MethodologySchema', () => {
    it('should validate a valid methodology', () => {
        const validData = {
            title: 'Our Process',
            subtitle: 'A proven system for success',
            steps: [
                {
                    title: 'Step 1',
                    description: 'First thing to do.',
                    order: 0
                },
                {
                    title: 'Step 2',
                    description: 'Second thing to do.',
                    order: 1
                }
            ],
            philosophy: 'We believe in systematic, repeatable approaches.',
            differentiation: 'Unlike others, we focus on long-term sustainability.'
        }
        expect(() => MethodologySchema.parse(validData)).not.toThrow()
    })

    it('should validate methodology with minimal fields', () => {
        const minimalData = {
            title: 'Method',
            steps: [{ title: 'Do this', description: 'Follow these steps.', order: 0 }]
        }
        expect(() => MethodologySchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty steps array', () => {
        const invalidData = {
            title: 'Method',
            steps: []
        }
        expect(() => MethodologySchema.parse(invalidData)).toThrow()
    })
})

describe('VisionSchema', () => {
    it('should validate a valid vision', () => {
        const validData = {
            title: 'Our Vision',
            subtitle: 'Building the future together',
            mission: 'To empower knowledge workers worldwide.',
            values: [
                {
                    title: 'Transparency',
                    description: 'We believe in open, honest communication.',
                    icon: 'FaEye'
                },
                {
                    title: 'Excellence',
                    description: 'We strive for the highest quality.',
                    icon: 'FaStar'
                }
            ],
            futureGoals: ['Reach 1 million users', 'Expand to 50 countries'],
            biggerPicture: 'Creating a world where knowledge is accessible to all.',
            icon: 'FaMountain'
        }
        expect(() => VisionSchema.parse(validData)).not.toThrow()
    })

    it('should validate vision with minimal fields', () => {
        const minimalData = {
            title: 'Vision',
            mission: 'Make the world better through technology.'
        }
        expect(() => VisionSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty title', () => {
        const invalidData = {
            title: '',
            mission: 'Valid mission.'
        }
        expect(() => VisionSchema.parse(invalidData)).toThrow()
    })

    it('should reject short mission', () => {
        const invalidData = {
            title: 'Vision',
            mission: 'Short'
        }
        expect(() => VisionSchema.parse(invalidData)).toThrow()
    })

    it('should accept empty values and futureGoals arrays', () => {
        const validData = {
            title: 'Vision',
            mission: 'Our guiding mission statement.',
            values: [],
            futureGoals: []
        }
        expect(() => VisionSchema.parse(validData)).not.toThrow()
    })

    it('should validate value objects properly', () => {
        const validData = {
            title: 'Vision',
            mission: 'Make things better.',
            values: [{ title: 'Integrity', description: 'We do what is right.' }]
        }
        expect(() => VisionSchema.parse(validData)).not.toThrow()
    })

    it('should reject value with empty title', () => {
        const invalidData = {
            title: 'Vision',
            mission: 'Make things better.',
            values: [{ title: '', description: 'Description here.' }]
        }
        expect(() => VisionSchema.parse(invalidData)).toThrow()
    })
})

describe('StorytellingSchema', () => {
    it('should validate with all sections present', () => {
        const validData = {
            originStory: {
                title: 'Origin',
                story: 'How we started this journey and built something amazing.'
            },
            creatorJourney: {
                title: 'Journey',
                story: 'My personal path to creating this product.'
            },
            transformationArc: {
                title: 'Transform',
                before: { title: 'Before', description: 'Old way of doing things was painful.' },
                during: { title: 'During', description: 'Transition period.' },
                after: { title: 'After', description: 'New way is much better.' }
            },
            successStories: {
                title: 'Stories',
                stories: [{ name: 'User', result: 'Great results achieved.' }]
            },
            methodology: {
                title: 'Method',
                steps: [{ title: 'Step 1', description: 'Do this first step.', order: 0 }]
            },
            vision: {
                title: 'Vision',
                mission: 'Our mission statement goes here.'
            }
        }
        expect(() => StorytellingSchema.parse(validData)).not.toThrow()
    })

    it('should validate with all sections as null', () => {
        const validData = {
            originStory: null,
            creatorJourney: null,
            transformationArc: null,
            successStories: null,
            methodology: null,
            vision: null
        }
        expect(() => StorytellingSchema.parse(validData)).not.toThrow()
    })

    it('should validate with all sections omitted', () => {
        const validData = {}
        expect(() => StorytellingSchema.parse(validData)).not.toThrow()
    })

    it('should validate with some sections present', () => {
        const validData = {
            originStory: {
                title: 'Origin',
                story: 'How we began.'
            },
            vision: {
                title: 'Vision',
                mission: 'Our mission.'
            }
        }
        expect(() => StorytellingSchema.parse(validData)).not.toThrow()
    })

    it('should validate with mixed null and undefined sections', () => {
        const validData = {
            originStory: null,
            vision: {
                title: 'Vision',
                mission: 'Our mission.'
            }
        }
        expect(() => StorytellingSchema.parse(validData)).not.toThrow()
    })
})
