import { describe, it, expect } from 'bun:test'
import {
    detectMemberMilestones,
    detectMrrMilestones,
    detectContentMilestones,
    detectAllMilestones,
    formatMilestonesForConsole,
    MEMBER_MILESTONES,
    PAID_MEMBER_MILESTONES,
    MRR_MILESTONES,
    CONTENT_MILESTONES
} from './milestones.js'
import type { MemberStats, ContentStats, Mrr } from '@/schemas/ghost-stats.schema.js'

describe('milestones', () => {
    describe('detectMemberMilestones', () => {
        it('should detect total member milestones', () => {
            const members: MemberStats = {
                total: 1000,
                free: 900,
                paid: 100,
                comped: 0,
                growth: { newThisPeriod: 50, growthRate: 5 }
            }

            const milestones = detectMemberMilestones(members)

            expect(milestones).toContain('Total members reached: 1,000')
        })

        it('should detect paid member milestones', () => {
            const members: MemberStats = {
                total: 500,
                free: 400,
                paid: 100,
                comped: 0,
                growth: { newThisPeriod: 10, growthRate: 2 }
            }

            const milestones = detectMemberMilestones(members)

            expect(milestones).toContain('Paid members reached: 100')
        })

        it('should detect multiple milestones', () => {
            const members: MemberStats = {
                total: 5000,
                free: 4500,
                paid: 500,
                comped: 0,
                growth: { newThisPeriod: 100, growthRate: 2 }
            }

            const milestones = detectMemberMilestones(members)

            expect(milestones.length).toBe(2)
            expect(milestones).toContain('Total members reached: 5,000')
            expect(milestones).toContain('Paid members reached: 500')
        })

        it('should return empty array when no milestones reached', () => {
            const members: MemberStats = {
                total: 50,
                free: 45,
                paid: 5,
                comped: 0,
                growth: { newThisPeriod: 2, growthRate: 4 }
            }

            const milestones = detectMemberMilestones(members)

            expect(milestones).toEqual([])
        })

        it('should detect highest milestone only', () => {
            const members: MemberStats = {
                total: 1500,
                free: 1400,
                paid: 100,
                comped: 0,
                growth: { newThisPeriod: 50, growthRate: 3.4 }
            }

            const milestones = detectMemberMilestones(members)

            // Should only show the highest reached milestone (1000), not 100, 500
            expect(milestones.filter((m) => m.includes('Total'))).toHaveLength(1)
            expect(milestones).toContain('Total members reached: 1,000')
        })
    })

    describe('detectMrrMilestones', () => {
        it('should detect MRR milestones', () => {
            const mrr: Mrr = {
                amount: 1000,
                currency: 'EUR'
            }

            const milestones = detectMrrMilestones(mrr)

            expect(milestones).toContain('MRR reached: 1,000 EUR')
        })

        it('should return empty array when no MRR milestone reached', () => {
            const mrr: Mrr = {
                amount: 50,
                currency: 'EUR'
            }

            const milestones = detectMrrMilestones(mrr)

            expect(milestones).toEqual([])
        })

        it('should use the correct currency in the message', () => {
            const mrr: Mrr = {
                amount: 500,
                currency: 'USD'
            }

            const milestones = detectMrrMilestones(mrr)

            expect(milestones).toContain('MRR reached: 500 USD')
        })
    })

    describe('detectContentMilestones', () => {
        it('should detect total posts milestones', () => {
            const content: ContentStats = {
                blogPosts: 80,
                newsletters: 20,
                totalPosts: 100
            }

            const milestones = detectContentMilestones(content)

            expect(milestones).toContain('Total posts reached: 100')
        })

        it('should detect blog post milestones', () => {
            const content: ContentStats = {
                blogPosts: 50,
                newsletters: 10,
                totalPosts: 60
            }

            const milestones = detectContentMilestones(content)

            expect(milestones).toContain('Blog posts reached: 50')
        })

        it('should detect newsletter milestones', () => {
            const content: ContentStats = {
                blogPosts: 20,
                newsletters: 100,
                totalPosts: 120
            }

            const milestones = detectContentMilestones(content)

            expect(milestones).toContain('Newsletters reached: 100')
        })

        it('should detect multiple content milestones', () => {
            const content: ContentStats = {
                blogPosts: 100,
                newsletters: 50,
                totalPosts: 200
            }

            const milestones = detectContentMilestones(content)

            expect(milestones.length).toBe(3)
        })

        it('should return empty array when no milestones reached', () => {
            const content: ContentStats = {
                blogPosts: 5,
                newsletters: 3,
                totalPosts: 8
            }

            const milestones = detectContentMilestones(content)

            expect(milestones).toEqual([])
        })
    })

    describe('detectAllMilestones', () => {
        it('should combine all milestone types', () => {
            const members: MemberStats = {
                total: 1000,
                free: 900,
                paid: 100,
                comped: 0,
                growth: { newThisPeriod: 50, growthRate: 5 }
            }

            const mrr: Mrr = {
                amount: 1000,
                currency: 'EUR'
            }

            const content: ContentStats = {
                blogPosts: 100,
                newsletters: 50,
                totalPosts: 200
            }

            const milestones = detectAllMilestones(members, mrr, content)

            // Should have member milestones + MRR milestone + content milestones
            expect(milestones.length).toBeGreaterThan(3)
            expect(milestones.some((m) => m.includes('Total members'))).toBe(true)
            expect(milestones.some((m) => m.includes('MRR'))).toBe(true)
            expect(milestones.some((m) => m.includes('Total posts'))).toBe(true)
        })

        it('should return empty array when no milestones reached', () => {
            const members: MemberStats = {
                total: 10,
                free: 8,
                paid: 2,
                comped: 0,
                growth: { newThisPeriod: 1, growthRate: 10 }
            }

            const mrr: Mrr = {
                amount: 20,
                currency: 'EUR'
            }

            const content: ContentStats = {
                blogPosts: 3,
                newsletters: 2,
                totalPosts: 5
            }

            const milestones = detectAllMilestones(members, mrr, content)

            expect(milestones).toEqual([])
        })
    })

    describe('formatMilestonesForConsole', () => {
        it('should add emoji prefix to milestones', () => {
            const milestones = ['Total members reached: 1,000', 'MRR reached: 500 EUR']

            const formatted = formatMilestonesForConsole(milestones)

            expect(formatted[0]).toMatch(/^🎉 MILESTONE:/)
            expect(formatted[1]).toMatch(/^🎉 MILESTONE:/)
        })

        it('should add exclamation mark suffix', () => {
            const milestones = ['Total members reached: 1,000']

            const formatted = formatMilestonesForConsole(milestones)

            expect(formatted[0]).toMatch(/!$/)
        })

        it('should handle empty array', () => {
            const formatted = formatMilestonesForConsole([])

            expect(formatted).toEqual([])
        })
    })

    describe('milestone thresholds', () => {
        it('should have ascending member milestones', () => {
            for (let i = 1; i < MEMBER_MILESTONES.length; i++) {
                expect(MEMBER_MILESTONES[i]).toBeGreaterThan(MEMBER_MILESTONES[i - 1])
            }
        })

        it('should have ascending paid member milestones', () => {
            for (let i = 1; i < PAID_MEMBER_MILESTONES.length; i++) {
                expect(PAID_MEMBER_MILESTONES[i]).toBeGreaterThan(PAID_MEMBER_MILESTONES[i - 1])
            }
        })

        it('should have ascending MRR milestones', () => {
            for (let i = 1; i < MRR_MILESTONES.length; i++) {
                expect(MRR_MILESTONES[i]).toBeGreaterThan(MRR_MILESTONES[i - 1])
            }
        })

        it('should have ascending content milestones', () => {
            for (let i = 1; i < CONTENT_MILESTONES.length; i++) {
                expect(CONTENT_MILESTONES[i]).toBeGreaterThan(CONTENT_MILESTONES[i - 1])
            }
        })
    })
})
