import { describe, it, expect } from 'bun:test'
import { tagIconMap, getTagIcon } from './tag-icons'
import { iconRegistry, getIconWithFallback } from './icon-registry'
import { getCategoryIcon } from './category-icons'
import { FaTag } from 'react-icons/fa'

describe('Tag Icons', () => {
    describe('tagIconMap', () => {
        it('should be the same as iconRegistry', () => {
            expect(tagIconMap).toBe(iconRegistry)
        })

        it('should contain all icons from iconRegistry', () => {
            expect(Object.keys(tagIconMap).length).toBe(Object.keys(iconRegistry).length)
        })

        it('should have the same icon components as iconRegistry', () => {
            Object.keys(iconRegistry).forEach((key) => {
                expect(tagIconMap[key]).toBe(iconRegistry[key])
            })
        })

        it('should be a backwards compatibility export', () => {
            expect(tagIconMap).toEqual(iconRegistry)
        })
    })

    describe('getTagIcon', () => {
        it('should return icon component for valid icon name', () => {
            const icon = getTagIcon('FaRobot')
            expect(icon).toBeDefined()
            const expectedFaRobot = iconRegistry['FaRobot'] as import('react-icons').IconType
            expect(icon as import('react-icons').IconType).toBe(expectedFaRobot)
        })

        it('should return icon component for Font Awesome icons', () => {
            const expectedFaCalendarAlt = iconRegistry[
                'FaCalendarAlt'
            ] as import('react-icons').IconType
            expect(getTagIcon('FaCalendarAlt') as import('react-icons').IconType).toBe(
                expectedFaCalendarAlt
            )
            const expectedFaRobot = iconRegistry['FaRobot'] as import('react-icons').IconType
            expect(getTagIcon('FaRobot') as import('react-icons').IconType).toBe(expectedFaRobot)
            const expectedFaBook = iconRegistry['FaBook'] as import('react-icons').IconType
            expect(getTagIcon('FaBook') as import('react-icons').IconType).toBe(expectedFaBook)
            const expectedFaBrain = iconRegistry['FaBrain'] as import('react-icons').IconType
            expect(getTagIcon('FaBrain') as import('react-icons').IconType).toBe(expectedFaBrain)
        })

        it('should return icon component for Simple Icons', () => {
            const expectedSiObsidian = iconRegistry['SiObsidian'] as import('react-icons').IconType
            expect(getTagIcon('SiObsidian') as import('react-icons').IconType).toBe(
                expectedSiObsidian
            )
            const expectedSiNotion = iconRegistry['SiNotion'] as import('react-icons').IconType
            expect(getTagIcon('SiNotion') as import('react-icons').IconType).toBe(expectedSiNotion)
            const expectedSiTrello = iconRegistry['SiTrello'] as import('react-icons').IconType
            expect(getTagIcon('SiTrello') as import('react-icons').IconType).toBe(expectedSiTrello)
        })

        it('should return icon component for Font Awesome 6 icons', () => {
            const expectedFaXTwitter = iconRegistry['FaXTwitter'] as import('react-icons').IconType
            expect(getTagIcon('FaXTwitter') as import('react-icons').IconType).toBe(
                expectedFaXTwitter
            )
            const expectedFaThreads = iconRegistry['FaThreads'] as import('react-icons').IconType
            expect(getTagIcon('FaThreads') as import('react-icons').IconType).toBe(
                expectedFaThreads
            )
        })

        it('should return FaTag fallback for invalid icon name', () => {
            const icon = getTagIcon('InvalidIcon')
            expect(icon).toBeDefined()
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should return FaTag fallback for empty string', () => {
            const icon = getTagIcon('')
            expect(icon).toBeDefined()
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should return FaTag fallback for undefined input', () => {
            const icon = getTagIcon(undefined)
            expect(icon).toBeDefined()
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should be case-sensitive and fallback to FaTag for wrong case', () => {
            expect(getTagIcon('farobot'))!.toBe(FaTag)
            const expectedFaRobot = iconRegistry['FaRobot'] as import('react-icons').IconType
            expect(getTagIcon('FaRobot') as import('react-icons').IconType).toBe(expectedFaRobot)
            expect(getTagIcon('FAROBOT'))!.toBe(FaTag)
        })

        it('should not match partial icon names and fallback to FaTag', () => {
            expect(getTagIcon('FaRo'))!.toBe(FaTag)
            expect(getTagIcon('Robot'))!.toBe(FaTag)
            expect(getTagIcon('Fa'))!.toBe(FaTag)
        })

        it('should handle whitespace and fallback to FaTag', () => {
            expect(getTagIcon(' FaRobot '))!.toBe(FaTag)
            expect(getTagIcon('Fa Robot'))!.toBe(FaTag)
            expect(getTagIcon(' FaRobot'))!.toBe(FaTag)
            expect(getTagIcon('FaRobot '))!.toBe(FaTag)
        })

        it('should handle special characters and fallback to FaTag', () => {
            expect(getTagIcon('FaRobot!'))!.toBe(FaTag)
            expect(getTagIcon('Fa-Robot'))!.toBe(FaTag)
            expect(getTagIcon('Fa_Robot'))!.toBe(FaTag)
        })

        it('should handle common tag icons', () => {
            const commonIcons = [
                'FaRobot',
                'FaBrain',
                'FaBook',
                'FaPen',
                'FaLightbulb',
                'FaCheckSquare',
                'FaGraduationCap'
            ]
            commonIcons.forEach((iconName) => {
                const icon = getTagIcon(iconName)
                expect(icon).toBeDefined()
                expect(icon as import('react-icons').IconType).toBe(
                    iconRegistry[iconName] as import('react-icons').IconType
                )
                expect(icon).not.toBe(FaTag)
            })
        })

        it('should always return a valid icon component', () => {
            const testNames = [
                'FaRobot',
                'InvalidIcon',
                '',
                undefined,
                'farobot',
                'FAROBOT',
                'FaRo',
                ' FaRobot ',
                'Fa-Robot'
            ]
            testNames.forEach((_name) => {
                const icon = getTagIcon(_name)
                expect(icon).toBeDefined()
                expect(typeof icon).toBe('function')
            })
        })

        it('should never return undefined or null', () => {
            const testNames = [
                'InvalidIcon',
                '',
                undefined,
                'not-an-icon',
                '12345',
                null as unknown as string
            ]
            testNames.forEach((_name) => {
                const icon = getTagIcon(_name)
                expect(icon).not.toBeUndefined()
                expect(icon).not.toBeNull()
            })
        })
    })

    describe('getTagIcon - Immutability', () => {
        it('should return the same icon component on multiple calls', () => {
            const icon1 = getTagIcon('FaRobot')
            const icon2 = getTagIcon('FaRobot')
            expect(icon1).toBe(icon2)
        })

        it('should return the same fallback on multiple calls', () => {
            const icon1 = getTagIcon('InvalidIcon')
            const icon2 = getTagIcon('InvalidIcon')
            expect(icon1).toBe(icon2)
            expect(icon1).toBe(FaTag)
        })

        it('should not modify input parameter', () => {
            const iconName = 'FaRobot'
            getTagIcon(iconName)
            expect(iconName).toBe('FaRobot')
        })
    })

    describe('getTagIcon - Fallback Behavior', () => {
        it('should use FaTag as fallback for all invalid inputs', () => {
            const invalidInputs = [
                'InvalidIcon',
                'NonExistentIcon',
                '',
                undefined,
                'farobot',
                'FAROBOT',
                '123',
                'fa-robot'
            ]
            invalidInputs.forEach((input) => {
                expect(getTagIcon(input))!.toBe(FaTag)
            })
        })

        it('should prefer valid icon over fallback', () => {
            const validIcons = ['FaRobot', 'FaBrain', 'SiObsidian', 'FaXTwitter']
            validIcons.forEach((iconName) => {
                const icon = getTagIcon(iconName)
                expect(icon).not.toBe(FaTag)
                expect(icon as import('react-icons').IconType).toBe(
                    iconRegistry[iconName] as import('react-icons').IconType
                )
            })
        })

        it('should have FaTag as a consistent fallback', () => {
            const fallback1 = getTagIcon('Invalid1')
            const fallback2 = getTagIcon('Invalid2')
            const fallback3 = getTagIcon('')
            const fallback4 = getTagIcon(undefined)

            expect(fallback1).toBe(FaTag)
            expect(fallback2).toBe(FaTag)
            expect(fallback3).toBe(FaTag)
            expect(fallback4).toBe(FaTag)
        })
    })

    describe('getTagIcon - Edge Cases', () => {
        it('should handle null as undefined and return FaTag', () => {
            const icon = getTagIcon(null as unknown as string)
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should handle number as icon name and return FaTag', () => {
            const icon = getTagIcon(123 as unknown as string)
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should handle object as icon name and return FaTag', () => {
            const icon = getTagIcon({} as unknown as string)
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should handle array as icon name and return FaTag', () => {
            const icon = getTagIcon([] as unknown as string)
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should handle boolean as icon name and return FaTag', () => {
            const icon = getTagIcon(true as unknown as string)
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should handle very long strings and return FaTag', () => {
            const icon = getTagIcon('A'.repeat(1000))
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })

        it('should handle unicode characters and return FaTag', () => {
            const icon = getTagIcon('🚀')
            expect(icon as import('react-icons').IconType).toBe(FaTag)
        })
    })

    describe('getTagIcon - Consistency with getIconWithFallback', () => {
        it('should behave identically to getIconWithFallback with FaTag', () => {
            const testIcons = [
                'FaRobot',
                'InvalidIcon',
                '',
                undefined,
                'farobot',
                'SiObsidian',
                'FaXTwitter'
            ]
            testIcons.forEach((iconName) => {
                expect(getTagIcon(iconName)).toBe(getIconWithFallback(iconName, FaTag))
            })
        })

        it('should always return a component like getIconWithFallback', () => {
            const testNames = ['Valid', 'Invalid', '', undefined]
            testNames.forEach((_name) => {
                const tagIcon = getTagIcon(_name)
                const fallbackIcon = getIconWithFallback(_name, FaTag)
                expect(typeof tagIcon).toBe('function')
                expect(typeof fallbackIcon).toBe('function')
            })
        })
    })

    describe('getTagIcon vs getCategoryIcon', () => {
        it('should return FaTag fallback while getCategoryIcon returns undefined', () => {
            const invalidName = 'InvalidIcon'
            expect(getTagIcon(invalidName))!.toBe(FaTag)
            expect(getCategoryIcon(invalidName)).toBeUndefined()
        })

        it('should return same icon as getCategoryIcon for valid names', () => {
            const validIcons = ['FaRobot', 'SiObsidian', 'FaBrain', 'FaBook']
            validIcons.forEach((iconName) => {
                expect(getTagIcon(iconName) as import('react-icons').IconType).toBe(
                    getCategoryIcon(iconName) as import('react-icons').IconType
                )
            })
        })

        it('should differ from getCategoryIcon only in fallback behavior', () => {
            // Valid icon - both should return the same
            expect(getTagIcon('FaRobot') as import('react-icons').IconType).toBe(
                getCategoryIcon('FaRobot') as import('react-icons').IconType
            )

            // Invalid icon - different behavior
            expect(getTagIcon('Invalid'))!.toBe(FaTag)
            expect(getCategoryIcon('Invalid')).toBeUndefined()
        })
    })
})
