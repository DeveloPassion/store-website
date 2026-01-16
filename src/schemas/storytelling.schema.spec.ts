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

    it('should validate origin story with all nullable fields set to null', () => {
        const minimalData = {
            title: 'Our Origin',
            subtitle: null,
            story: 'The beginning of our journey to build something amazing.',
            inspirationPoint: null,
            genesisDate: null,
            icon: null
        }
        expect(() => OriginStorySchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty title', () => {
        const invalidData = {
            title: '',
            subtitle: null,
            story: 'Valid story content here.',
            inspirationPoint: null,
            genesisDate: null,
            icon: null
        }
        expect(() => OriginStorySchema.parse(invalidData)).toThrow()
    })

    it('should reject story that is too short', () => {
        const invalidData = {
            title: 'Our Origin',
            subtitle: null,
            story: 'Short',
            inspirationPoint: null,
            genesisDate: null,
            icon: null
        }
        expect(() => OriginStorySchema.parse(invalidData)).toThrow()
    })

    it('should accept story exactly 10 characters', () => {
        const validData = {
            title: 'Our Origin',
            subtitle: null,
            story: '1234567890',
            inspirationPoint: null,
            genesisDate: null,
            icon: null
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

    it('should validate creator journey with all nullable fields set to null', () => {
        const minimalData = {
            title: 'Journey',
            subtitle: null,
            story: 'My personal story of transformation and growth.',
            struggles: null,
            achievements: null,
            credentials: null,
            icon: null
        }
        expect(() => CreatorJourneySchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty title', () => {
        const invalidData = {
            title: '',
            subtitle: null,
            story: 'Valid story.',
            struggles: null,
            achievements: null,
            credentials: null,
            icon: null
        }
        expect(() => CreatorJourneySchema.parse(invalidData)).toThrow()
    })

    it('should accept empty arrays for struggles and achievements', () => {
        const validData = {
            title: 'Journey',
            subtitle: null,
            story: 'My story here and more text.',
            struggles: [],
            achievements: [],
            credentials: null,
            icon: null
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

    it('should validate phase with all nullable fields set to null', () => {
        const minimalData = {
            title: 'During',
            description: 'Implementation phase where things start to change.',
            points: null,
            icon: null
        }
        expect(() => TransformationPhaseSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty title', () => {
        const invalidData = {
            title: '',
            description: 'Valid description here.',
            points: null,
            icon: null
        }
        expect(() => TransformationPhaseSchema.parse(invalidData)).toThrow()
    })

    it('should reject short description', () => {
        const invalidData = {
            title: 'After',
            description: 'Short',
            points: null,
            icon: null
        }
        expect(() => TransformationPhaseSchema.parse(invalidData)).toThrow()
    })
})

describe('TransformationArcSchema', () => {
    // Helper to create a valid phase
    const createPhase = (title: string, description: string, overrides = {}) => ({
        title,
        description,
        points: null,
        icon: null,
        ...overrides
    })

    it('should validate a valid transformation arc', () => {
        const validData = {
            title: 'Your Transformation Journey',
            subtitle: 'From chaos to clarity',
            before: createPhase('Before', 'Struggling with manual work and disorganization.', {
                points: ['No system', 'Wasted time'],
                icon: 'FaSadTear'
            }),
            during: createPhase('During', 'Learning and implementing the new system.', {
                points: ['Training', 'Setup'],
                icon: null
            }),
            after: createPhase('After', 'Enjoying streamlined workflows and productivity.', {
                points: ['Efficient', 'Organized'],
                icon: 'FaSmile'
            }),
            timeline: '3-6 months'
        }
        expect(() => TransformationArcSchema.parse(validData)).not.toThrow()
    })

    it('should validate transformation arc with all nullable fields set to null', () => {
        const minimalData = {
            title: 'Transformation',
            subtitle: null,
            before: createPhase('Before', 'Old way was painful and slow.'),
            during: createPhase('During', 'Transition period happens.'),
            after: createPhase('After', 'New way is much better.'),
            timeline: null
        }
        expect(() => TransformationArcSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject missing phases', () => {
        const invalidData = {
            title: 'Transformation',
            subtitle: null,
            before: createPhase('Before', 'Old way was painful.'),
            timeline: null
        }
        expect(() => TransformationArcSchema.parse(invalidData)).toThrow()
    })
})

describe('SuccessStorySchema', () => {
    // Helper to create a valid success story with all nullable fields
    const createSuccessStory = (name: string, result: string, overrides = {}) => ({
        name,
        role: null,
        company: null,
        result,
        metrics: null,
        quote: null,
        image: null,
        avatarUrl: null,
        ...overrides
    })

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

    it('should validate success story with all nullable fields set to null', () => {
        const minimalData = createSuccessStory(
            'Jane Smith',
            'Achieved amazing results with this product.'
        )
        expect(() => SuccessStorySchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty name', () => {
        const invalidData = createSuccessStory('', 'Great results here.')
        expect(() => SuccessStorySchema.parse(invalidData)).toThrow()
    })

    it('should reject short result', () => {
        const invalidData = createSuccessStory('John', 'Good')
        expect(() => SuccessStorySchema.parse(invalidData)).toThrow()
    })

    it('should accept empty metrics array', () => {
        const validData = createSuccessStory('Sarah', 'Got excellent results here.', {
            metrics: []
        })
        expect(() => SuccessStorySchema.parse(validData)).not.toThrow()
    })

    it('should validate metrics with all required fields', () => {
        const validData = createSuccessStory('Mike', 'Outstanding performance here.', {
            metrics: [{ label: 'ROI', value: '300%', icon: null }]
        })
        expect(() => SuccessStorySchema.parse(validData)).not.toThrow()
    })

    it('should reject metrics with empty label or value', () => {
        const invalidData = createSuccessStory('Tom', 'Great results achieved here.', {
            metrics: [{ label: '', value: '100%', icon: null }]
        })
        expect(() => SuccessStorySchema.parse(invalidData)).toThrow()
    })
})

describe('SuccessStoriesSchema', () => {
    // Helper to create a valid success story
    const createSuccessStory = (name: string, result: string) => ({
        name,
        role: null,
        company: null,
        result,
        metrics: null,
        quote: null,
        image: null,
        avatarUrl: null
    })

    it('should validate a valid success stories collection', () => {
        const validData = {
            title: 'Customer Success Stories',
            subtitle: 'Real results from real users',
            stories: [
                createSuccessStory('Alice', 'Transformed her business completely.'),
                createSuccessStory('Bob', 'Saved 20 hours per month with this tool.')
            ]
        }
        expect(() => SuccessStoriesSchema.parse(validData)).not.toThrow()
    })

    it('should reject empty stories array', () => {
        const invalidData = {
            title: 'Success Stories',
            subtitle: null,
            stories: []
        }
        expect(() => SuccessStoriesSchema.parse(invalidData)).toThrow()
    })

    it('should validate with one story minimum', () => {
        const validData = {
            title: 'Success Story',
            subtitle: null,
            stories: [createSuccessStory('Chris', 'Amazing transformation achieved.')]
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

    it('should validate step with null icon', () => {
        const minimalData = {
            title: 'Step 2',
            description: 'Implement the solution here.',
            icon: null,
            order: 1
        }
        expect(() => MethodologyStepSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject negative order', () => {
        const invalidData = {
            title: 'Step',
            description: 'Do something here.',
            icon: null,
            order: -1
        }
        expect(() => MethodologyStepSchema.parse(invalidData)).toThrow()
    })

    it('should reject non-integer order', () => {
        const invalidData = {
            title: 'Step',
            description: 'Do something here.',
            icon: null,
            order: 1.5
        }
        expect(() => MethodologyStepSchema.parse(invalidData)).toThrow()
    })
})

describe('MethodologySchema', () => {
    // Helper to create a valid step
    const createStep = (title: string, description: string, order: number) => ({
        title,
        description,
        icon: null,
        order
    })

    it('should validate a valid methodology', () => {
        const validData = {
            title: 'Our Process',
            subtitle: 'A proven system for success',
            steps: [
                createStep('Step 1', 'First thing to do here.', 0),
                createStep('Step 2', 'Second thing to do here.', 1)
            ],
            philosophy: 'We believe in systematic, repeatable approaches.',
            differentiation: 'Unlike others, we focus on long-term sustainability.'
        }
        expect(() => MethodologySchema.parse(validData)).not.toThrow()
    })

    it('should validate methodology with all nullable fields set to null', () => {
        const minimalData = {
            title: 'Method',
            subtitle: null,
            steps: [createStep('Do this', 'Follow these steps here.', 0)],
            philosophy: null,
            differentiation: null
        }
        expect(() => MethodologySchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty steps array', () => {
        const invalidData = {
            title: 'Method',
            subtitle: null,
            steps: [],
            philosophy: null,
            differentiation: null
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

    it('should validate vision with all nullable fields set to null', () => {
        const minimalData = {
            title: 'Vision',
            subtitle: null,
            mission: 'Make the world better through technology.',
            values: null,
            futureGoals: null,
            biggerPicture: null,
            icon: null
        }
        expect(() => VisionSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty title', () => {
        const invalidData = {
            title: '',
            subtitle: null,
            mission: 'Valid mission here.',
            values: null,
            futureGoals: null,
            biggerPicture: null,
            icon: null
        }
        expect(() => VisionSchema.parse(invalidData)).toThrow()
    })

    it('should reject short mission', () => {
        const invalidData = {
            title: 'Vision',
            subtitle: null,
            mission: 'Short',
            values: null,
            futureGoals: null,
            biggerPicture: null,
            icon: null
        }
        expect(() => VisionSchema.parse(invalidData)).toThrow()
    })

    it('should accept empty values and futureGoals arrays', () => {
        const validData = {
            title: 'Vision',
            subtitle: null,
            mission: 'Our guiding mission statement.',
            values: [],
            futureGoals: [],
            biggerPicture: null,
            icon: null
        }
        expect(() => VisionSchema.parse(validData)).not.toThrow()
    })

    it('should validate value objects properly', () => {
        const validData = {
            title: 'Vision',
            subtitle: null,
            mission: 'Make things better for everyone.',
            values: [
                { title: 'Integrity', description: 'We do what is right always.', icon: null }
            ],
            futureGoals: null,
            biggerPicture: null,
            icon: null
        }
        expect(() => VisionSchema.parse(validData)).not.toThrow()
    })

    it('should reject value with empty title', () => {
        const invalidData = {
            title: 'Vision',
            subtitle: null,
            mission: 'Make things better for all.',
            values: [{ title: '', description: 'Description here and more.', icon: null }],
            futureGoals: null,
            biggerPicture: null,
            icon: null
        }
        expect(() => VisionSchema.parse(invalidData)).toThrow()
    })
})

describe('StorytellingSchema', () => {
    // Helpers for creating valid objects
    const createOriginStory = () => ({
        title: 'Origin',
        subtitle: null,
        story: 'How we started this journey and built something amazing.',
        inspirationPoint: null,
        genesisDate: null,
        icon: null
    })

    const createCreatorJourney = () => ({
        title: 'Journey',
        subtitle: null,
        story: 'My personal path to creating this product.',
        struggles: null,
        achievements: null,
        credentials: null,
        icon: null
    })

    const createPhase = (title: string, description: string) => ({
        title,
        description,
        points: null,
        icon: null
    })

    const createTransformationArc = () => ({
        title: 'Transform',
        subtitle: null,
        before: createPhase('Before', 'Old way of doing things was painful.'),
        during: createPhase('During', 'Transition period happens here.'),
        after: createPhase('After', 'New way is much better now.'),
        timeline: null
    })

    const createSuccessStories = () => ({
        title: 'Stories',
        subtitle: null,
        stories: [
            {
                name: 'User',
                role: null,
                company: null,
                result: 'Great results achieved with this tool.',
                metrics: null,
                quote: null,
                image: null,
                avatarUrl: null
            }
        ]
    })

    const createMethodology = () => ({
        title: 'Method',
        subtitle: null,
        steps: [{ title: 'Step 1', description: 'Do this first step here.', icon: null, order: 0 }],
        philosophy: null,
        differentiation: null
    })

    const createVision = () => ({
        title: 'Vision',
        subtitle: null,
        mission: 'Our mission statement goes here.',
        values: null,
        futureGoals: null,
        biggerPicture: null,
        icon: null
    })

    it('should validate with all sections present', () => {
        const validData = {
            originStory: createOriginStory(),
            creatorJourney: createCreatorJourney(),
            transformationArc: createTransformationArc(),
            successStories: createSuccessStories(),
            methodology: createMethodology(),
            vision: createVision()
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

    it('should validate with some sections present', () => {
        const validData = {
            originStory: createOriginStory(),
            creatorJourney: null,
            transformationArc: null,
            successStories: null,
            methodology: null,
            vision: createVision()
        }
        expect(() => StorytellingSchema.parse(validData)).not.toThrow()
    })

    it('should validate with mixed null sections', () => {
        const validData = {
            originStory: null,
            creatorJourney: null,
            transformationArc: null,
            successStories: null,
            methodology: null,
            vision: createVision()
        }
        expect(() => StorytellingSchema.parse(validData)).not.toThrow()
    })
})
