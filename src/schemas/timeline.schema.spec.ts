import { describe, expect, it } from 'bun:test'
import { TimelineMilestoneSchema, TimelineSchema } from './timeline.schema'

describe('TimelineMilestoneSchema', () => {
    // Helper to create a valid milestone with all nullable fields
    const createMilestone = (
        id: string,
        timeframe: string,
        title: string,
        description: string,
        overrides = {}
    ) => ({
        id,
        timeframe,
        title,
        description,
        highlights: null,
        icon: null,
        ...overrides
    })

    it('should validate a valid milestone with all fields', () => {
        const validData = {
            id: 'week-1',
            timeframe: 'Week 1',
            title: 'Foundation',
            description: 'Set up your knowledge management system and capture your first 50 notes',
            highlights: ['System configured', 'Initial capture workflow', 'First connections made'],
            icon: 'FaRocket'
        }
        expect(() => TimelineMilestoneSchema.parse(validData)).not.toThrow()
    })

    it('should validate milestone with all nullable fields set to null', () => {
        const minimalData = createMilestone(
            'day-1',
            'Day 1',
            'Getting Started',
            'Begin your journey with the basic setup process.'
        )
        expect(() => TimelineMilestoneSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty id', () => {
        const invalidData = createMilestone('', 'Week 1', 'Foundation', 'Valid description here.')
        expect(() => TimelineMilestoneSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty timeframe', () => {
        const invalidData = createMilestone('week-1', '', 'Foundation', 'Valid description here.')
        expect(() => TimelineMilestoneSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty title', () => {
        const invalidData = createMilestone('week-1', 'Week 1', '', 'Valid description here.')
        expect(() => TimelineMilestoneSchema.parse(invalidData)).toThrow()
    })

    it('should reject description that is too short', () => {
        const invalidData = createMilestone('week-1', 'Week 1', 'Foundation', 'Short')
        expect(() => TimelineMilestoneSchema.parse(invalidData)).toThrow()
    })

    it('should accept description exactly 10 characters', () => {
        const validData = createMilestone('week-1', 'Week 1', 'Foundation', '1234567890')
        expect(() => TimelineMilestoneSchema.parse(validData)).not.toThrow()
    })

    it('should accept empty highlights array', () => {
        const validData = createMilestone(
            'week-1',
            'Week 1',
            'Foundation',
            'Valid description here.',
            { highlights: [] }
        )
        expect(() => TimelineMilestoneSchema.parse(validData)).not.toThrow()
    })

    it('should accept null highlights and icon', () => {
        const validData = createMilestone(
            'month-1',
            'Month 1',
            'Building Momentum',
            'Develop consistent capture habits and see your knowledge graph emerge'
        )
        const result = TimelineMilestoneSchema.parse(validData)
        expect(result.highlights).toBeNull()
        expect(result.icon).toBeNull()
    })
})

describe('TimelineSchema', () => {
    // Helper to create a valid milestone with all nullable fields
    const createMilestone = (
        id: string,
        timeframe: string,
        title: string,
        description: string,
        overrides = {}
    ) => ({
        id,
        timeframe,
        title,
        description,
        highlights: null,
        icon: null,
        ...overrides
    })

    it('should validate a valid timeline with all fields', () => {
        const validData = {
            title: 'Your Transformation Journey',
            subtitle: "Here's what you'll achieve over the coming weeks",
            milestones: [
                createMilestone(
                    'week-1',
                    'Week 1',
                    'Foundation',
                    'Set up your knowledge management system and capture your first 50 notes',
                    {
                        highlights: [
                            'System configured',
                            'Initial capture workflow',
                            'First connections made'
                        ]
                    }
                ),
                createMilestone(
                    'month-1',
                    'Month 1',
                    'Building Momentum',
                    'Develop consistent capture habits and see your knowledge graph emerge',
                    {
                        highlights: [
                            'Daily review routine',
                            '200+ notes captured',
                            'First insights surface'
                        ]
                    }
                ),
                createMilestone(
                    'month-3',
                    'Month 3',
                    'Compound Growth',
                    'Experience the compound effect as connections multiply and insights accelerate',
                    {
                        highlights: [
                            'Knowledge compounds',
                            'Original ideas emerge',
                            'Productivity doubles'
                        ]
                    }
                )
            ]
        }
        expect(() => TimelineSchema.parse(validData)).not.toThrow()
    })

    it('should validate timeline with all nullable fields set to null', () => {
        const minimalData = {
            title: null,
            subtitle: null,
            milestones: [createMilestone('day-1', 'Day 1', 'Start', 'Begin your journey today.')]
        }
        expect(() => TimelineSchema.parse(minimalData)).not.toThrow()
    })

    it('should accept null title and subtitle', () => {
        const minimalData = {
            title: null,
            subtitle: null,
            milestones: [
                createMilestone('week-1', 'Week 1', 'Foundation', 'Build your foundation here.')
            ]
        }
        const result = TimelineSchema.parse(minimalData)
        expect(result.title).toBeNull()
        expect(result.subtitle).toBeNull()
    })

    it('should reject empty milestones array', () => {
        const invalidData = {
            title: 'Journey',
            subtitle: 'Your path',
            milestones: []
        }
        expect(() => TimelineSchema.parse(invalidData)).toThrow()
    })

    it('should validate timeline with single milestone', () => {
        const validData = {
            title: null,
            subtitle: null,
            milestones: [
                createMilestone('step-1', 'Today', 'Get Started', 'Take your first step today.')
            ]
        }
        expect(() => TimelineSchema.parse(validData)).not.toThrow()
    })

    it('should validate timeline with many milestones', () => {
        const milestones = Array.from({ length: 10 }, (_, i) =>
            createMilestone(
                `step-${i + 1}`,
                `Week ${i + 1}`,
                `Milestone ${i + 1}`,
                `Description for milestone ${i + 1} in the journey.`
            )
        )
        const validData = { title: null, subtitle: null, milestones }
        expect(() => TimelineSchema.parse(validData)).not.toThrow()
    })

    it('should accept various timeframe formats', () => {
        const validData = {
            title: null,
            subtitle: null,
            milestones: [
                createMilestone('day-1', 'Day 1', 'First Day', 'Your first day starts here.'),
                createMilestone('week-1', 'Week 1', 'First Week', 'Your first week journey.'),
                createMilestone('month-1', 'Month 1', 'First Month', 'Your first month progress.'),
                createMilestone(
                    'quarter-1',
                    '3 Months',
                    'First Quarter',
                    'Your first quarter results.'
                ),
                createMilestone('year-1', 'Year 1', 'First Year', 'Your first year transformation.')
            ]
        }
        expect(() => TimelineSchema.parse(validData)).not.toThrow()
    })

    it('should reject milestones with invalid structure', () => {
        const invalidData = {
            title: null,
            subtitle: null,
            milestones: [
                createMilestone('week-1', 'Week 1', '', 'Valid description here.') // Empty title
            ]
        }
        expect(() => TimelineSchema.parse(invalidData)).toThrow()
    })

    it('should preserve milestone order', () => {
        const validData = {
            title: null,
            subtitle: null,
            milestones: [
                createMilestone('first', 'Day 1', 'First', 'First milestone here.'),
                createMilestone('second', 'Day 2', 'Second', 'Second milestone here.'),
                createMilestone('third', 'Day 3', 'Third', 'Third milestone here.')
            ]
        }
        const result = TimelineSchema.parse(validData)
        expect(result.milestones).toBeDefined()
        expect(result.milestones[0]?.id).toBe('first')
        expect(result.milestones[1]?.id).toBe('second')
        expect(result.milestones[2]?.id).toBe('third')
    })
})
