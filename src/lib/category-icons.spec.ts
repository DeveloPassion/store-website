import { describe, it, expect } from 'bun:test'
import { categoryIconMap, getCategoryIcon } from './category-icons'
import { iconRegistry, getIcon } from './icon-registry'

describe('Category Icons', () => {
    describe('categoryIconMap', () => {
        it('should be the same as iconRegistry', () => {
            expect(categoryIconMap).toBe(iconRegistry)
        })

        it('should contain all icons from iconRegistry', () => {
            expect(Object.keys(categoryIconMap).length).toBe(Object.keys(iconRegistry).length)
        })

        it('should have the same icon components as iconRegistry', () => {
            Object.keys(iconRegistry).forEach((key) => {
                expect(categoryIconMap[key]).toBe(iconRegistry[key])
            })
        })

        it('should be a backwards compatibility export', () => {
            expect(categoryIconMap).toEqual(iconRegistry)
        })
    })

    describe('getCategoryIcon', () => {
        it('should return icon component for valid icon name', () => {
            const icon = getCategoryIcon('FaRobot')
            expect(icon).toBeDefined()
            const expectedFaRobot = iconRegistry['FaRobot'] as import('react-icons').IconType
            expect(icon as import('react-icons').IconType).toBe(expectedFaRobot)
        })

        it('should return icon component for Font Awesome icons', () => {
            const expectedFaCalendarAlt = iconRegistry[
                'FaCalendarAlt'
            ] as import('react-icons').IconType
            expect(getCategoryIcon('FaCalendarAlt') as import('react-icons').IconType).toBe(
                expectedFaCalendarAlt
            )
            const expectedFaGraduationCap = iconRegistry[
                'FaGraduationCap'
            ] as import('react-icons').IconType
            expect(getCategoryIcon('FaGraduationCap') as import('react-icons').IconType).toBe(
                expectedFaGraduationCap
            )
            const expectedFaBook = iconRegistry['FaBook'] as import('react-icons').IconType
            expect(getCategoryIcon('FaBook') as import('react-icons').IconType).toBe(expectedFaBook)
            const expectedFaTools = iconRegistry['FaTools'] as import('react-icons').IconType
            expect(getCategoryIcon('FaTools') as import('react-icons').IconType).toBe(
                expectedFaTools
            )
        })

        it('should return icon component for Simple Icons', () => {
            const expectedSiObsidian = iconRegistry['SiObsidian'] as import('react-icons').IconType
            expect(getCategoryIcon('SiObsidian') as import('react-icons').IconType).toBe(
                expectedSiObsidian
            )
            const expectedSiNotion = iconRegistry['SiNotion'] as import('react-icons').IconType
            expect(getCategoryIcon('SiNotion') as import('react-icons').IconType).toBe(
                expectedSiNotion
            )
            const expectedSiTrello = iconRegistry['SiTrello'] as import('react-icons').IconType
            expect(getCategoryIcon('SiTrello') as import('react-icons').IconType).toBe(
                expectedSiTrello
            )
        })

        it('should return icon component for Font Awesome 6 icons', () => {
            const expectedFaXTwitter = iconRegistry['FaXTwitter'] as import('react-icons').IconType
            expect(getCategoryIcon('FaXTwitter') as import('react-icons').IconType).toBe(
                expectedFaXTwitter
            )
            const expectedFaThreads = iconRegistry['FaThreads'] as import('react-icons').IconType
            expect(getCategoryIcon('FaThreads') as import('react-icons').IconType).toBe(
                expectedFaThreads
            )
        })

        it('should return undefined for invalid icon name', () => {
            const icon = getCategoryIcon('InvalidIcon')
            expect(icon).toBeUndefined()
        })

        it('should return undefined for empty string', () => {
            const icon = getCategoryIcon('')
            expect(icon).toBeUndefined()
        })

        it('should return undefined for undefined input', () => {
            const icon = getCategoryIcon(undefined)
            expect(icon).toBeUndefined()
        })

        it('should be case-sensitive', () => {
            expect(getCategoryIcon('farobot')).toBeUndefined()
            expect(getCategoryIcon('FaRobot')).toBeDefined()
            expect(getCategoryIcon('FAROBOT')).toBeUndefined()
        })

        it('should not match partial icon names', () => {
            expect(getCategoryIcon('FaRo')).toBeUndefined()
            expect(getCategoryIcon('Robot')).toBeUndefined()
            expect(getCategoryIcon('Fa')).toBeUndefined()
        })

        it('should handle whitespace in icon name', () => {
            expect(getCategoryIcon(' FaRobot ')).toBeUndefined()
            expect(getCategoryIcon('Fa Robot')).toBeUndefined()
            expect(getCategoryIcon(' FaRobot')).toBeUndefined()
            expect(getCategoryIcon('FaRobot ')).toBeUndefined()
        })

        it('should handle special characters in icon name', () => {
            expect(getCategoryIcon('FaRobot!')).toBeUndefined()
            expect(getCategoryIcon('Fa-Robot')).toBeUndefined()
            expect(getCategoryIcon('Fa_Robot')).toBeUndefined()
        })

        it('should handle common category icons', () => {
            const commonIcons = [
                'FaGraduationCap',
                'FaBook',
                'FaBookOpen',
                'FaTools',
                'FaUsers',
                'FaFileAlt',
                'FaBrain',
                'FaPen',
                'FaBoxOpen',
                'FaStore'
            ]
            commonIcons.forEach((iconName) => {
                const icon = getCategoryIcon(iconName)
                expect(icon).toBeDefined()
                expect(icon as import('react-icons').IconType).toBe(
                    iconRegistry[iconName] as import('react-icons').IconType
                )
            })
        })
    })

    describe('getCategoryIcon - Immutability', () => {
        it('should return the same icon component on multiple calls', () => {
            const icon1 = getCategoryIcon('FaRobot')
            const icon2 = getCategoryIcon('FaRobot')
            expect(icon1).toBe(icon2)
        })

        it('should return undefined consistently for invalid names', () => {
            const icon1 = getCategoryIcon('InvalidIcon')
            const icon2 = getCategoryIcon('InvalidIcon')
            expect(icon1).toBeUndefined()
            expect(icon2).toBeUndefined()
        })

        it('should not modify input parameter', () => {
            const iconName = 'FaRobot'
            getCategoryIcon(iconName)
            expect(iconName).toBe('FaRobot')
        })
    })

    describe('getCategoryIcon - Edge Cases', () => {
        it('should handle null as undefined', () => {
            // TypeScript won't allow null, but testing runtime behavior
            const icon = getCategoryIcon(null as unknown as string)
            expect(icon).toBeUndefined()
        })

        it('should handle number as icon name', () => {
            const icon = getCategoryIcon(123 as unknown as string)
            expect(icon).toBeUndefined()
        })

        it('should handle object as icon name', () => {
            const icon = getCategoryIcon({} as unknown as string)
            expect(icon).toBeUndefined()
        })

        it('should handle array as icon name', () => {
            const icon = getCategoryIcon([] as unknown as string)
            expect(icon).toBeUndefined()
        })

        it('should handle boolean as icon name', () => {
            const icon = getCategoryIcon(true as unknown as string)
            expect(icon).toBeUndefined()
        })
    })

    describe('getCategoryIcon - Consistency with getIcon', () => {
        it('should behave identically to getIcon for valid names', () => {
            const testIcons = ['FaRobot', 'FaGraduationCap', 'SiObsidian', 'FaXTwitter', 'FaBook']
            testIcons.forEach((iconName) => {
                expect(getCategoryIcon(iconName))!.toBe(getIcon(iconName))
            })
        })

        it('should behave identically to getIcon for invalid names', () => {
            const testIcons = ['InvalidIcon', '', 'farobot', 'FAROBOT']
            testIcons.forEach((iconName) => {
                expect(getCategoryIcon(iconName))!.toBe(getIcon(iconName))
            })
        })

        it('should behave identically to getIcon for undefined', () => {
            expect(getCategoryIcon(undefined))!.toBe(getIcon(undefined))
        })
    })
})
