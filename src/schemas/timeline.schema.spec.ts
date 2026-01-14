import { describe, expect, it } from 'bun:test'
import { TimelineMilestoneSchema, TimelineSchema } from './timeline.schema'

describe('TimelineMilestoneSchema', () => {
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

    it('should validate milestone with minimal required fields', () => {
        const minimalData = {
            id: 'day-1',
            timeframe: 'Day 1',
            title: 'Getting Started',
            description: 'Begin your journey with the basic setup process.'
        }
        expect(() => TimelineMilestoneSchema.parse(minimalData)).not.toThrow()
    })

    it('should reject empty id', () => {
        const invalidData = {
            id: '',
            timeframe: 'Week 1',
            title: 'Foundation',
            description: 'Valid description here.'
        }
        expect(() => TimelineMilestoneSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty timeframe', () => {
        const invalidData = {
            id: 'week-1',
            timeframe: '',
            title: 'Foundation',
            description: 'Valid description here.'
        }
        expect(() => TimelineMilestoneSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty title', () => {
        const invalidData = {
            id: 'week-1',
            timeframe: 'Week 1',
            title: '',
            description: 'Valid description here.'
        }
        expect(() => TimelineMilestoneSchema.parse(invalidData)).toThrow()
    })

    it('should reject description that is too short', () => {
        const invalidData = {
            id: 'week-1',
            timeframe: 'Week 1',
            title: 'Foundation',
            description: 'Short'
        }
        expect(() => TimelineMilestoneSchema.parse(invalidData)).toThrow()
    })

    it('should accept description exactly 10 characters', () => {
        const validData = {
            id: 'week-1',
            timeframe: 'Week 1',
            title: 'Foundation',
            description: '1234567890'
        }
        expect(() => TimelineMilestoneSchema.parse(validData)).not.toThrow()
    })

    it('should accept empty highlights array', () => {
        const validData = {
            id: 'week-1',
            timeframe: 'Week 1',
            title: 'Foundation',
            description: 'Valid description here.',
            highlights: []
        }
        expect(() => TimelineMilestoneSchema.parse(validData)).not.toThrow()
    })

    it('should accept milestone without optional fields', () => {
        const validData = {
            id: 'month-1',
            timeframe: 'Month 1',
            title: 'Building Momentum',
            description: 'Develop consistent capture habits and see your knowledge graph emerge'
        }
        const result = TimelineMilestoneSchema.parse(validData)
        expect(result.highlights).toBeUndefined()
        expect(result.icon).toBeUndefined()
    })
})

describe('TimelineSchema', () => {
    it('should validate a valid timeline with all fields', () => {
        const validData = {
            title: 'Your Transformation Journey',
            subtitle: "Here's what you'll achieve over the coming weeks",
            milestones: [
                {
                    id: 'week-1',
                    timeframe: 'Week 1',
                    title: 'Foundation',
                    description:
                        'Set up your knowledge management system and capture your first 50 notes',
                    highlights: [
                        'System configured',
                        'Initial capture workflow',
                        'First connections made'
                    ]
                },
                {
                    id: 'month-1',
                    timeframe: 'Month 1',
                    title: 'Building Momentum',
                    description:
                        'Develop consistent capture habits and see your knowledge graph emerge',
                    highlights: [
                        'Daily review routine',
                        '200+ notes captured',
                        'First insights surface'
                    ]
                },
                {
                    id: 'month-3',
                    timeframe: 'Month 3',
                    title: 'Compound Growth',
                    description:
                        'Experience the compound effect as connections multiply and insights accelerate',
                    highlights: [
                        'Knowledge compounds',
                        'Original ideas emerge',
                        'Productivity doubles'
                    ]
                }
            ]
        }
        expect(() => TimelineSchema.parse(validData)).not.toThrow()
    })

    it('should validate timeline with minimal fields (only milestones)', () => {
        const minimalData = {
            milestones: [
                {
                    id: 'day-1',
                    timeframe: 'Day 1',
                    title: 'Start',
                    description: 'Begin your journey today.'
                }
            ]
        }
        expect(() => TimelineSchema.parse(minimalData)).not.toThrow()
    })

    it('should use default values for optional title and subtitle', () => {
        const minimalData = {
            milestones: [
                {
                    id: 'week-1',
                    timeframe: 'Week 1',
                    title: 'Foundation',
                    description: 'Build your foundation.'
                }
            ]
        }
        const result = TimelineSchema.parse(minimalData)
        expect(result.title).toBeUndefined()
        expect(result.subtitle).toBeUndefined()
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
            milestones: [
                {
                    id: 'step-1',
                    timeframe: 'Today',
                    title: 'Get Started',
                    description: 'Take your first step today.'
                }
            ]
        }
        expect(() => TimelineSchema.parse(validData)).not.toThrow()
    })

    it('should validate timeline with many milestones', () => {
        const milestones = Array.from({ length: 10 }, (_, i) => ({
            id: `step-${i + 1}`,
            timeframe: `Week ${i + 1}`,
            title: `Milestone ${i + 1}`,
            description: `Description for milestone ${i + 1} in the journey.`
        }))
        const validData = { milestones }
        expect(() => TimelineSchema.parse(validData)).not.toThrow()
    })

    it('should accept various timeframe formats', () => {
        const validData = {
            milestones: [
                {
                    id: 'day-1',
                    timeframe: 'Day 1',
                    title: 'First Day',
                    description: 'Your first day starts here.'
                },
                {
                    id: 'week-1',
                    timeframe: 'Week 1',
                    title: 'First Week',
                    description: 'Your first week journey.'
                },
                {
                    id: 'month-1',
                    timeframe: 'Month 1',
                    title: 'First Month',
                    description: 'Your first month progress.'
                },
                {
                    id: 'quarter-1',
                    timeframe: '3 Months',
                    title: 'First Quarter',
                    description: 'Your first quarter results.'
                },
                {
                    id: 'year-1',
                    timeframe: 'Year 1',
                    title: 'First Year',
                    description: 'Your first year transformation.'
                }
            ]
        }
        expect(() => TimelineSchema.parse(validData)).not.toThrow()
    })

    it('should reject milestones with invalid structure', () => {
        const invalidData = {
            milestones: [
                {
                    id: 'week-1',
                    timeframe: 'Week 1',
                    title: '', // Empty title
                    description: 'Valid description here.'
                }
            ]
        }
        expect(() => TimelineSchema.parse(invalidData)).toThrow()
    })

    it('should preserve milestone order', () => {
        const validData = {
            milestones: [
                {
                    id: 'first',
                    timeframe: 'Day 1',
                    title: 'First',
                    description: 'First milestone.'
                },
                {
                    id: 'second',
                    timeframe: 'Day 2',
                    title: 'Second',
                    description: 'Second milestone.'
                },
                { id: 'third', timeframe: 'Day 3', title: 'Third', description: 'Third milestone.' }
            ]
        }
        const result = TimelineSchema.parse(validData)
        expect(result.milestones).toBeDefined()
        expect(result.milestones[0]?.id).toBe('first')
        expect(result.milestones[1]?.id).toBe('second')
        expect(result.milestones[2]?.id).toBe('third')
    })
})
