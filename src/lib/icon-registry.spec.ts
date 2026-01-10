import { describe, it, expect } from 'bun:test'
import { iconRegistry, getIcon, getIconWithFallback } from './icon-registry'
import { FaTag, FaRocket } from 'react-icons/fa'

describe('Icon Registry', () => {
    describe('iconRegistry', () => {
        it('should contain Font Awesome icons', () => {
            expect(iconRegistry['FaCalendarAlt']).toBeDefined()
            expect(iconRegistry['FaMicrophone']).toBeDefined()
            expect(iconRegistry['FaGhost']).toBeDefined()
            expect(iconRegistry['FaYoutube']).toBeDefined()
            expect(iconRegistry['FaTerminal']).toBeDefined()
            expect(iconRegistry['FaLightbulb']).toBeDefined()
            expect(iconRegistry['FaTools']).toBeDefined()
            expect(iconRegistry['FaRobot']).toBeDefined()
            expect(iconRegistry['FaCode']).toBeDefined()
            expect(iconRegistry['FaGlobe']).toBeDefined()
        })

        it('should contain Simple Icons', () => {
            expect(iconRegistry['SiObsidian']).toBeDefined()
            expect(iconRegistry['SiAngular']).toBeDefined()
            expect(iconRegistry['SiNotion']).toBeDefined()
            expect(iconRegistry['SiTrello']).toBeDefined()
            expect(iconRegistry['SiSubstack']).toBeDefined()
            expect(iconRegistry['SiBluesky']).toBeDefined()
            expect(iconRegistry['SiBuymeacoffee']).toBeDefined()
        })

        it('should contain Font Awesome 6 icons', () => {
            expect(iconRegistry['FaXTwitter']).toBeDefined()
            expect(iconRegistry['FaThreads']).toBeDefined()
        })

        it('should contain all expected social media icons', () => {
            expect(iconRegistry['FaGithub']).toBeDefined()
            expect(iconRegistry['FaLinkedin']).toBeDefined()
            expect(iconRegistry['FaReddit']).toBeDefined()
            expect(iconRegistry['FaTiktok']).toBeDefined()
            expect(iconRegistry['FaMedium']).toBeDefined()
            expect(iconRegistry['FaHackerNews']).toBeDefined()
        })

        it('should contain all expected category icons', () => {
            expect(iconRegistry['FaGraduationCap']).toBeDefined()
            expect(iconRegistry['FaBook']).toBeDefined()
            expect(iconRegistry['FaBookOpen']).toBeDefined()
            expect(iconRegistry['FaDatabase']).toBeDefined()
            expect(iconRegistry['FaNewspaper']).toBeDefined()
            expect(iconRegistry['FaUsers']).toBeDefined()
            expect(iconRegistry['FaFileAlt']).toBeDefined()
            expect(iconRegistry['FaBrain']).toBeDefined()
        })

        it('should not contain undefined icons', () => {
            const iconValues = Object.values(iconRegistry)
            iconValues.forEach((icon) => {
                expect(icon).toBeDefined()
                expect(icon).not.toBeUndefined()
                expect(icon).not.toBeNull()
            })
        })

        it('should have all icons as React components', () => {
            const iconValues = Object.values(iconRegistry)
            iconValues.forEach((icon) => {
                expect(typeof icon).toBe('function')
            })
        })

        it('should map icon names correctly', () => {
            const expectedFaRobot = iconRegistry['FaRobot'] as import('react-icons').IconType
            expect(expectedFaRobot).toBe(expectedFaRobot)
            const expectedSiObsidian = iconRegistry['SiObsidian'] as import('react-icons').IconType
            expect(expectedSiObsidian).toBe(expectedSiObsidian)
            const expectedFaXTwitter = iconRegistry['FaXTwitter'] as import('react-icons').IconType
            expect(expectedFaXTwitter).toBe(expectedFaXTwitter)
        })
    })

    describe('getIcon', () => {
        it('should return icon component for valid icon name', () => {
            const icon = getIcon('FaRobot')
            expect(icon).toBeDefined()
            const expectedFaRobot = iconRegistry['FaRobot'] as import('react-icons').IconType
            expect(icon as import('react-icons').IconType).toBe(expectedFaRobot)
        })

        it('should return icon component for Font Awesome icons', () => {
            expect(getIcon('FaCalendarAlt'))!.toBe(iconRegistry['FaCalendarAlt'])
            expect(getIcon('FaMicrophone'))!.toBe(iconRegistry['FaMicrophone'])
            expect(getIcon('FaGhost'))!.toBe(iconRegistry['FaGhost'])
        })

        it('should return icon component for Simple Icons', () => {
            expect(getIcon('SiObsidian'))!.toBe(iconRegistry['SiObsidian'])
            expect(getIcon('SiNotion'))!.toBe(iconRegistry['SiNotion'])
            expect(getIcon('SiTrello'))!.toBe(iconRegistry['SiTrello'])
        })

        it('should return icon component for Font Awesome 6 icons', () => {
            expect(getIcon('FaXTwitter'))!.toBe(iconRegistry['FaXTwitter'])
            expect(getIcon('FaThreads'))!.toBe(iconRegistry['FaThreads'])
        })

        it('should return undefined for invalid icon name', () => {
            const icon = getIcon('InvalidIcon')
            expect(icon).toBeUndefined()
        })

        it('should return undefined for empty string', () => {
            const icon = getIcon('')
            expect(icon).toBeUndefined()
        })

        it('should return undefined for undefined input', () => {
            const icon = getIcon(undefined)
            expect(icon).toBeUndefined()
        })

        it('should be case-sensitive', () => {
            expect(getIcon('farobot')).toBeUndefined()
            expect(getIcon('FaRobot')).toBeDefined()
            expect(getIcon('FAROBOT')).toBeUndefined()
        })

        it('should not match partial icon names', () => {
            expect(getIcon('FaRo')).toBeUndefined()
            expect(getIcon('Robot')).toBeUndefined()
        })

        it('should handle whitespace in icon name', () => {
            expect(getIcon(' FaRobot ')).toBeUndefined()
            expect(getIcon('Fa Robot')).toBeUndefined()
        })

        it('should handle special characters in icon name', () => {
            expect(getIcon('FaRobot!')).toBeUndefined()
            expect(getIcon('Fa-Robot')).toBeUndefined()
        })
    })

    describe('getIconWithFallback', () => {
        it('should return icon component for valid icon name', () => {
            const icon = getIconWithFallback('FaRobot', FaTag)
            expect(icon).toBeDefined()
            const expectedFaRobot = iconRegistry['FaRobot'] as import('react-icons').IconType
            expect(icon as import('react-icons').IconType).toBe(expectedFaRobot)
        })

        it('should return fallback icon for invalid icon name', () => {
            const icon = getIconWithFallback('InvalidIcon', FaTag)
            expect(icon).toBeDefined()
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should return fallback icon for undefined icon name', () => {
            const icon = getIconWithFallback(undefined, FaTag)
            expect(icon).toBeDefined()
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should return fallback icon for empty string', () => {
            const icon = getIconWithFallback('', FaTag)
            expect(icon).toBeDefined()
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should work with different fallback icons', () => {
            const iconWithFaTag = getIconWithFallback('InvalidIcon', FaTag)
            const iconWithFaRocket = getIconWithFallback('InvalidIcon', FaRocket)

            expect(iconWithFaTag).toBe(FaTag)
            expect(iconWithFaRocket).toBe(FaRocket)
            expect(iconWithFaTag).not.toBe(iconWithFaRocket)
        })

        it('should prefer valid icon over fallback', () => {
            const icon = getIconWithFallback('FaRobot', FaTag)
            expect(icon).not.toBe(FaTag)
            const expectedFaRobot = iconRegistry['FaRobot'] as import('react-icons').IconType
            expect(icon as import('react-icons').IconType).toBe(expectedFaRobot)
        })

        it('should handle Font Awesome icons with fallback', () => {
            const expectedFaCalendarAlt = iconRegistry[
                'FaCalendarAlt'
            ] as import('react-icons').IconType
            const expectedFaMicrophone = iconRegistry[
                'FaMicrophone'
            ] as import('react-icons').IconType
            expect(getIconWithFallback('FaCalendarAlt', FaTag)).toBe(expectedFaCalendarAlt)
            expect(getIconWithFallback('FaMicrophone', FaTag)).toBe(expectedFaMicrophone)
        })

        it('should handle Simple Icons with fallback', () => {
            const expectedSiObsidian = iconRegistry['SiObsidian'] as import('react-icons').IconType
            const expectedSiNotion = iconRegistry['SiNotion'] as import('react-icons').IconType
            expect(getIconWithFallback('SiObsidian', FaTag)).toBe(expectedSiObsidian)
            expect(getIconWithFallback('SiNotion', FaTag)).toBe(expectedSiNotion)
        })

        it('should handle Font Awesome 6 icons with fallback', () => {
            const expectedFaXTwitter = iconRegistry['FaXTwitter'] as import('react-icons').IconType
            const expectedFaThreads = iconRegistry['FaThreads'] as import('react-icons').IconType
            expect(getIconWithFallback('FaXTwitter', FaTag)).toBe(expectedFaXTwitter)
            expect(getIconWithFallback('FaThreads', FaTag)).toBe(expectedFaThreads)
        })

        it('should be case-sensitive with fallback', () => {
            const expectedFaRobot = iconRegistry['FaRobot'] as import('react-icons').IconType
            expect(getIconWithFallback('farobot', FaTag)).toBe(FaTag)
            expect(getIconWithFallback('FaRobot', FaTag)).toBe(expectedFaRobot)
        })
    })

    describe('Icon Registry - Edge Cases', () => {
        it('should not have duplicate icon names', () => {
            const iconNames = Object.keys(iconRegistry)
            const uniqueNames = new Set(iconNames)
            expect(iconNames.length).toBe(uniqueNames.size)
        })

        it('should have consistent icon naming pattern', () => {
            const iconNames = Object.keys(iconRegistry)
            iconNames.forEach((_name) => {
                expect(_name).toMatch(/^(Fa|Si)[A-Z]/)
            })
        })

        it('should not contain null or undefined values', () => {
            Object.entries(iconRegistry).forEach(([, icon]) => {
                expect(icon).not.toBeNull()
                expect(icon).not.toBeUndefined()
            })
        })

        it('should have at least 30 icons registered', () => {
            const iconCount = Object.keys(iconRegistry).length
            expect(iconCount).toBeGreaterThanOrEqual(30)
        })
    })

    describe('getIcon - Immutability', () => {
        it('should return the same icon component on multiple calls', () => {
            const icon1 = getIcon('FaRobot')
            const icon2 = getIcon('FaRobot')
            expect(icon1).toBe(icon2)
        })

        it('should not modify input parameter', () => {
            const iconName = 'FaRobot'
            getIcon(iconName)
            expect(iconName).toBe('FaRobot')
        })
    })

    describe('getIconWithFallback - Immutability', () => {
        it('should return the same icon component on multiple calls', () => {
            const icon1 = getIconWithFallback('FaRobot', FaTag)
            const icon2 = getIconWithFallback('FaRobot', FaTag)
            expect(icon1).toBe(icon2)
        })

        it('should return the same fallback on multiple calls', () => {
            const icon1 = getIconWithFallback('InvalidIcon', FaTag)
            const icon2 = getIconWithFallback('InvalidIcon', FaTag)
            expect(icon1).toBe(icon2)
        })

        it('should not modify input parameters', () => {
            const iconName = 'FaRobot'
            const fallback = FaTag
            getIconWithFallback(iconName, fallback)
            expect(iconName).toBe('FaRobot')
            expect(fallback).toBe(FaTag)
        })
    })
})
