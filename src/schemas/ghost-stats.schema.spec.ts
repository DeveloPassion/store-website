import { describe, it, expect } from 'bun:test'
import {
    GhostStatsFileSchema,
    StatsPeriodSchema,
    MemberStatsSchema,
    MrrSchema,
    ContentStatsSchema,
    VisitorMetricsSchema,
    TrafficSourceSchema,
    TopPageSchema,
    type GhostStatsFile,
    type StatsPeriod
} from './ghost-stats.schema.js'

describe('ghost-stats.schema', () => {
    describe('StatsPeriodSchema', () => {
        it('should accept valid periods', () => {
            const validPeriods: StatsPeriod[] = ['7d', '30d', '6mo', '12mo', 'all']
            for (const period of validPeriods) {
                expect(() => StatsPeriodSchema.parse(period)).not.toThrow()
            }
        })

        it('should reject invalid periods', () => {
            expect(() => StatsPeriodSchema.parse('1d')).toThrow()
            expect(() => StatsPeriodSchema.parse('90d')).toThrow()
            expect(() => StatsPeriodSchema.parse('')).toThrow()
        })
    })

    describe('MemberStatsSchema', () => {
        it('should accept valid member stats', () => {
            const validStats = {
                total: 1000,
                free: 800,
                paid: 150,
                comped: 50,
                growth: {
                    newThisPeriod: 45,
                    growthRate: 4.5
                }
            }
            expect(() => MemberStatsSchema.parse(validStats)).not.toThrow()
        })

        it('should reject negative member counts', () => {
            const invalidStats = {
                total: -1,
                free: 800,
                paid: 150,
                comped: 50,
                growth: { newThisPeriod: 45, growthRate: 4.5 }
            }
            expect(() => MemberStatsSchema.parse(invalidStats)).toThrow()
        })

        it('should allow negative growth rate', () => {
            const stats = {
                total: 1000,
                free: 800,
                paid: 150,
                comped: 50,
                growth: {
                    newThisPeriod: 0,
                    growthRate: -5.2
                }
            }
            expect(() => MemberStatsSchema.parse(stats)).not.toThrow()
        })
    })

    describe('MrrSchema', () => {
        it('should accept valid MRR data', () => {
            const validMrr = {
                amount: 1234.56,
                currency: 'EUR'
            }
            expect(() => MrrSchema.parse(validMrr)).not.toThrow()
        })

        it('should default currency to EUR', () => {
            const mrr = MrrSchema.parse({ amount: 100 })
            expect(mrr.currency).toBe('EUR')
        })

        it('should reject negative amounts', () => {
            expect(() => MrrSchema.parse({ amount: -100, currency: 'EUR' })).toThrow()
        })
    })

    describe('ContentStatsSchema', () => {
        it('should accept valid content stats', () => {
            const validStats = {
                blogPosts: 156,
                newsletters: 89,
                totalPosts: 245
            }
            expect(() => ContentStatsSchema.parse(validStats)).not.toThrow()
        })

        it('should reject negative post counts', () => {
            expect(() =>
                ContentStatsSchema.parse({
                    blogPosts: -1,
                    newsletters: 89,
                    totalPosts: 88
                })
            ).toThrow()
        })
    })

    describe('VisitorMetricsSchema', () => {
        it('should accept valid visitor metrics', () => {
            const validMetrics = {
                visitors: 12543,
                pageviews: 45231,
                bounceRate: 42.3,
                visitDuration: 145
            }
            expect(() => VisitorMetricsSchema.parse(validMetrics)).not.toThrow()
        })

        it('should reject bounce rate over 100', () => {
            expect(() =>
                VisitorMetricsSchema.parse({
                    visitors: 1000,
                    pageviews: 2000,
                    bounceRate: 150,
                    visitDuration: 60
                })
            ).toThrow()
        })

        it('should reject negative visit duration', () => {
            expect(() =>
                VisitorMetricsSchema.parse({
                    visitors: 1000,
                    pageviews: 2000,
                    bounceRate: 50,
                    visitDuration: -10
                })
            ).toThrow()
        })
    })

    describe('TrafficSourceSchema', () => {
        it('should accept valid traffic source', () => {
            const validSource = {
                name: 'Google',
                visitors: 4521
            }
            expect(() => TrafficSourceSchema.parse(validSource)).not.toThrow()
        })

        it('should reject empty name', () => {
            expect(() =>
                TrafficSourceSchema.parse({
                    name: '',
                    visitors: 100
                })
            ).toThrow()
        })
    })

    describe('TopPageSchema', () => {
        it('should accept valid top page', () => {
            const validPage = {
                page: '/obsidian-starter-kit',
                visitors: 3421
            }
            expect(() => TopPageSchema.parse(validPage)).not.toThrow()
        })

        it('should reject empty page path', () => {
            expect(() =>
                TopPageSchema.parse({
                    page: '',
                    visitors: 100
                })
            ).toThrow()
        })
    })

    describe('GhostStatsFileSchema', () => {
        it('should accept a complete valid stats file', () => {
            const validStats: GhostStatsFile = {
                fetchedAt: '2026-01-15T14:30:00.000Z',
                period: '30d',
                ghost: {
                    members: {
                        total: 1234,
                        free: 1100,
                        paid: 134,
                        comped: 0,
                        growth: {
                            newThisPeriod: 45,
                            growthRate: 3.8
                        }
                    },
                    mrr: {
                        amount: 1234.56,
                        currency: 'EUR'
                    },
                    content: {
                        blogPosts: 156,
                        newsletters: 89,
                        totalPosts: 245
                    }
                },
                plausible: {
                    current: {
                        visitors: 12543,
                        pageviews: 45231,
                        bounceRate: 42.3,
                        visitDuration: 145
                    },
                    comparison: {
                        visitors: { value: 10891, change: 1652, changePercent: 15.2 },
                        pageviews: { value: 41772, change: 3459, changePercent: 8.3 },
                        bounceRate: { value: 44.4, change: -2.1 },
                        visitDuration: { value: 133, change: 12 }
                    },
                    topSources: [
                        { name: 'Google', visitors: 4521 },
                        { name: 'Twitter', visitors: 2103 },
                        { name: 'Direct', visitors: 1892 }
                    ],
                    topPages: [
                        { page: '/obsidian-starter-kit', visitors: 3421 },
                        { page: '/pkm-library', visitors: 2891 }
                    ]
                },
                milestones: ['Total members reached: 1,000', 'Paid members reached: 100']
            }

            expect(() => GhostStatsFileSchema.parse(validStats)).not.toThrow()
        })

        it('should accept stats with empty milestones', () => {
            const stats: GhostStatsFile = {
                fetchedAt: '2026-01-15T14:30:00.000Z',
                period: '7d',
                ghost: {
                    members: {
                        total: 50,
                        free: 45,
                        paid: 5,
                        comped: 0,
                        growth: { newThisPeriod: 2, growthRate: 4.2 }
                    },
                    mrr: { amount: 50, currency: 'EUR' },
                    content: { blogPosts: 10, newsletters: 5, totalPosts: 15 }
                },
                plausible: {
                    current: {
                        visitors: 500,
                        pageviews: 1000,
                        bounceRate: 50,
                        visitDuration: 60
                    },
                    comparison: {
                        visitors: { value: 480, change: 20, changePercent: 4.2 },
                        pageviews: { value: 950, change: 50, changePercent: 5.3 },
                        bounceRate: { value: 52, change: -2 },
                        visitDuration: { value: 55, change: 5 }
                    },
                    topSources: [],
                    topPages: []
                },
                milestones: []
            }

            expect(() => GhostStatsFileSchema.parse(stats)).not.toThrow()
        })

        it('should reject invalid fetchedAt format', () => {
            const invalidStats = {
                fetchedAt: 'not-a-date',
                period: '30d',
                ghost: {
                    members: {
                        total: 100,
                        free: 90,
                        paid: 10,
                        comped: 0,
                        growth: { newThisPeriod: 5, growthRate: 5 }
                    },
                    mrr: { amount: 100, currency: 'EUR' },
                    content: { blogPosts: 10, newsletters: 5, totalPosts: 15 }
                },
                plausible: {
                    current: {
                        visitors: 100,
                        pageviews: 200,
                        bounceRate: 50,
                        visitDuration: 60
                    },
                    comparison: {
                        visitors: { value: 90, change: 10, changePercent: 11.1 },
                        pageviews: { value: 180, change: 20, changePercent: 11.1 },
                        bounceRate: { value: 52, change: -2 },
                        visitDuration: { value: 55, change: 5 }
                    },
                    topSources: [],
                    topPages: []
                },
                milestones: []
            }

            expect(() => GhostStatsFileSchema.parse(invalidStats)).toThrow()
        })

        it('should reject invalid period', () => {
            const invalidStats = {
                fetchedAt: '2026-01-15T14:30:00.000Z',
                period: 'invalid',
                ghost: {
                    members: {
                        total: 100,
                        free: 90,
                        paid: 10,
                        comped: 0,
                        growth: { newThisPeriod: 5, growthRate: 5 }
                    },
                    mrr: { amount: 100, currency: 'EUR' },
                    content: { blogPosts: 10, newsletters: 5, totalPosts: 15 }
                },
                plausible: {
                    current: {
                        visitors: 100,
                        pageviews: 200,
                        bounceRate: 50,
                        visitDuration: 60
                    },
                    comparison: {
                        visitors: { value: 90, change: 10, changePercent: 11.1 },
                        pageviews: { value: 180, change: 20, changePercent: 11.1 },
                        bounceRate: { value: 52, change: -2 },
                        visitDuration: { value: 55, change: 5 }
                    },
                    topSources: [],
                    topPages: []
                },
                milestones: []
            }

            expect(() => GhostStatsFileSchema.parse(invalidStats)).toThrow()
        })
    })
})
