import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { DynamicIcon } from './dynamic-icon'

describe('DynamicIcon Component', () => {
    describe('Rendering', () => {
        it('should render icon for valid icon name', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' />)
            expect(container.querySelector('svg')).toBeTruthy()
        })

        it('should render nothing for invalid icon name', () => {
            const { container } = render(<DynamicIcon iconName='InvalidIcon' />)
            expect(container.querySelector('svg')).toBeNull()
            expect(container.firstChild).toBeNull()
        })

        it('should render nothing for empty string icon name', () => {
            const { container } = render(<DynamicIcon iconName='' />)
            expect(container.querySelector('svg')).toBeNull()
            expect(container.firstChild).toBeNull()
        })

        it('should render nothing for undefined icon name', () => {
            const { container } = render(<DynamicIcon iconName={undefined} />)
            expect(container.querySelector('svg')).toBeNull()
            expect(container.firstChild).toBeNull()
        })

        it('should render nothing without iconName prop', () => {
            const { container } = render(<DynamicIcon />)
            expect(container.querySelector('svg')).toBeNull()
            expect(container.firstChild).toBeNull()
        })
    })

    describe('Icon Types', () => {
        it('should render Font Awesome icons', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' />)
            expect(container.querySelector('svg')).toBeTruthy()
        })

        it('should render Simple Icons', () => {
            const { container } = render(<DynamicIcon iconName='SiObsidian' />)
            expect(container.querySelector('svg')).toBeTruthy()
        })

        it('should render Font Awesome 6 icons', () => {
            const { container } = render(<DynamicIcon iconName='FaXTwitter' />)
            expect(container.querySelector('svg')).toBeTruthy()
        })
    })

    describe('ClassName Prop', () => {
        it('should apply className to icon', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' className='test-class' />)
            const svg = container.querySelector('svg')
            expect(svg).toBeTruthy()
            expect(svg?.classList.contains('test-class')).toBe(true)
        })

        it('should apply multiple classes', () => {
            const { container } = render(
                <DynamicIcon iconName='FaRobot' className='class-one class-two class-three' />
            )
            const svg = container.querySelector('svg')
            expect(svg).toBeTruthy()
            expect(svg?.classList.contains('class-one')).toBe(true)
            expect(svg?.classList.contains('class-two')).toBe(true)
            expect(svg?.classList.contains('class-three')).toBe(true)
        })

        it('should work without className prop', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' />)
            expect(container.querySelector('svg')).toBeTruthy()
        })

        it('should handle empty className', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' className='' />)
            const svg = container.querySelector('svg')
            expect(svg).toBeTruthy()
        })
    })

    describe('Style Prop', () => {
        it('should apply style via wrapper span', () => {
            const style = { color: 'red', fontSize: '24px' }
            const { container } = render(<DynamicIcon iconName='FaRobot' style={style} />)

            const span = container.querySelector('span')
            expect(span).toBeTruthy()
            expect(span?.style.color).toBe('red')
            expect(span?.style.fontSize).toBe('24px')
        })

        it('should wrap icon in span when style is provided', () => {
            const { container } = render(
                <DynamicIcon iconName='FaRobot' style={{ color: 'blue' }} />
            )

            const span = container.querySelector('span')
            const svg = container.querySelector('svg')

            expect(span).toBeTruthy()
            expect(svg).toBeTruthy()
            expect(svg?.parentElement).toBe(span)
        })

        it('should not wrap icon in span when style is not provided', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' />)

            const span = container.querySelector('span')
            const svg = container.querySelector('svg')

            expect(span).toBeNull()
            expect(svg).toBeTruthy()
        })

        it('should apply className to icon even with style wrapper', () => {
            const { container } = render(
                <DynamicIcon iconName='FaRobot' className='test-class' style={{ color: 'blue' }} />
            )

            const svg = container.querySelector('svg')
            expect(svg).toBeTruthy()
            expect(svg?.classList.contains('test-class')).toBe(true)
        })

        it('should handle empty style object', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' style={{}} />)

            const span = container.querySelector('span')
            const svg = container.querySelector('svg')

            expect(span).toBeTruthy()
            expect(svg).toBeTruthy()
        })

        it('should handle complex style properties', () => {
            const style = {
                color: 'red',
                fontSize: '24px',
                marginTop: '10px',
                padding: '5px',
                backgroundColor: 'yellow'
            }
            const { container } = render(<DynamicIcon iconName='FaRobot' style={style} />)

            const span = container.querySelector('span')
            expect(span).toBeTruthy()
            expect(span?.style.color).toBe('red')
            expect(span?.style.fontSize).toBe('24px')
            expect(span?.style.marginTop).toBe('10px')
            expect(span?.style.padding).toBe('5px')
            expect(span?.style.backgroundColor).toBe('yellow')
        })
    })

    describe('Combined Props', () => {
        it('should work with all props provided', () => {
            const { container } = render(
                <DynamicIcon
                    iconName='FaRobot'
                    className='test-class'
                    style={{ color: 'red', fontSize: '20px' }}
                />
            )

            const span = container.querySelector('span')
            const svg = container.querySelector('svg')

            expect(span).toBeTruthy()
            expect(svg).toBeTruthy()
            expect(svg?.classList.contains('test-class')).toBe(true)
            expect(span?.style.color).toBe('red')
            expect(span?.style.fontSize).toBe('20px')
        })

        it('should work with only iconName', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' />)

            const svg = container.querySelector('svg')
            const span = container.querySelector('span')

            expect(svg).toBeTruthy()
            expect(span).toBeNull()
        })

        it('should work with iconName and className only', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' className='test-class' />)

            const svg = container.querySelector('svg')
            const span = container.querySelector('span')

            expect(svg).toBeTruthy()
            expect(span).toBeNull()
            expect(svg?.classList.contains('test-class')).toBe(true)
        })

        it('should work with iconName and style only', () => {
            const { container } = render(
                <DynamicIcon iconName='FaRobot' style={{ color: 'red' }} />
            )

            const span = container.querySelector('span')
            const svg = container.querySelector('svg')

            expect(span).toBeTruthy()
            expect(svg).toBeTruthy()
            expect(span?.style.color).toBe('red')
        })
    })

    describe('Edge Cases', () => {
        it('should handle case-sensitive icon names', () => {
            const { container: validContainer } = render(<DynamicIcon iconName='FaRobot' />)
            const { container: invalidContainer } = render(<DynamicIcon iconName='farobot' />)

            expect(validContainer.querySelector('svg')).toBeTruthy()
            expect(invalidContainer.querySelector('svg')).toBeNull()
        })

        it('should handle whitespace in icon name', () => {
            const { container } = render(<DynamicIcon iconName=' FaRobot ' />)
            expect(container.querySelector('svg')).toBeNull()
        })

        it('should render different icons correctly', () => {
            const { container: robotContainer } = render(<DynamicIcon iconName='FaRobot' />)
            const { container: bookContainer } = render(<DynamicIcon iconName='FaBook' />)

            expect(robotContainer.querySelector('svg')).toBeTruthy()
            expect(bookContainer.querySelector('svg')).toBeTruthy()
            expect(robotContainer.innerHTML).not.toBe(bookContainer.innerHTML)
        })

        it('should handle re-rendering with different icon names', () => {
            const { container, rerender } = render(<DynamicIcon iconName='FaRobot' />)

            expect(container.querySelector('svg')).toBeTruthy()

            rerender(<DynamicIcon iconName='FaBook' />)
            expect(container.querySelector('svg')).toBeTruthy()

            rerender(<DynamicIcon iconName='InvalidIcon' />)
            expect(container.querySelector('svg')).toBeNull()
        })

        it('should handle re-rendering with style changes', () => {
            const { container, rerender } = render(
                <DynamicIcon iconName='FaRobot' style={{ color: 'red' }} />
            )

            const span1 = container.querySelector('span')
            expect(span1?.style.color).toBe('red')

            rerender(<DynamicIcon iconName='FaRobot' style={{ color: 'blue' }} />)
            const span2 = container.querySelector('span')
            expect(span2?.style.color).toBe('blue')

            rerender(<DynamicIcon iconName='FaRobot' />)
            const span3 = container.querySelector('span')
            expect(span3).toBeNull()
        })
    })

    describe('Accessibility', () => {
        it('should render svg element that is accessible', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' />)
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.tagName.toLowerCase()).toBe('svg')
        })

        it('should allow custom aria attributes via className', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' className='aria-hidden' />)
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
        })
    })

    describe('URL and Image Support', () => {
        it('should render image for HTTP URL', () => {
            const { container } = render(<DynamicIcon iconName='https://example.com/icon.png' />)
            const img = container.querySelector('img')

            expect(img).toBeTruthy()
            expect(img?.getAttribute('src')).toBe('https://example.com/icon.png')
        })

        it('should render image for local path', () => {
            const { container } = render(<DynamicIcon iconName='/assets/icon.png' />)
            const img = container.querySelector('img')

            expect(img).toBeTruthy()
            expect(img?.getAttribute('src')).toBe('/assets/icon.png')
        })

        it('should apply size class to image', () => {
            const { container } = render(<DynamicIcon iconName='/icon.png' size='lg' />)
            const img = container.querySelector('img')

            expect(img).toBeTruthy()
            expect(img?.className).toContain('h-8')
            expect(img?.className).toContain('w-8')
        })

        it('should apply custom className to image', () => {
            const { container } = render(
                <DynamicIcon iconName='/icon.png' className='custom-class' />
            )
            const img = container.querySelector('img')

            expect(img).toBeTruthy()
            expect(img?.classList.contains('custom-class')).toBe(true)
        })
    })

    describe('Size Presets', () => {
        it('should apply sm size class', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' size='sm' />)
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.className).toContain('h-4')
            expect(svg?.className).toContain('w-4')
        })

        it('should apply md size class by default', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' />)
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.className).toContain('h-6')
            expect(svg?.className).toContain('w-6')
        })

        it('should apply lg size class', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' size='lg' />)
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.className).toContain('h-8')
            expect(svg?.className).toContain('w-8')
        })

        it('should apply xl size class', () => {
            const { container } = render(<DynamicIcon iconName='FaRobot' size='xl' />)
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.className).toContain('h-10')
            expect(svg?.className).toContain('w-10')
        })
    })

    describe('Brand Colors', () => {
        it('should apply brand color for FaYoutube', () => {
            const { container } = render(<DynamicIcon iconName='FaYoutube' />)
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.className).toContain('text-red-500')
        })

        it('should apply brand color for SiObsidian', () => {
            const { container } = render(<DynamicIcon iconName='SiObsidian' />)
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.className).toContain('text-purple-400')
        })

        it('should not apply brand color when useBrandColors is false', () => {
            const { container } = render(
                <DynamicIcon iconName='FaYoutube' useBrandColors={false} />
            )
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.className).not.toContain('text-red-500')
        })

        it('should combine brand color with custom className', () => {
            const { container } = render(
                <DynamicIcon iconName='FaYoutube' className='custom-class' />
            )
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.className).toContain('text-red-500')
            expect(svg?.classList.contains('custom-class')).toBe(true)
        })
    })

    describe('Combined Features', () => {
        it('should apply size and brand color together', () => {
            const { container } = render(<DynamicIcon iconName='FaYoutube' size='lg' />)
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.className).toContain('h-8')
            expect(svg?.className).toContain('text-red-500')
        })

        it('should apply size, brand color, and custom className', () => {
            const { container } = render(
                <DynamicIcon iconName='FaYoutube' size='sm' className='my-custom-class' />
            )
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.className).toContain('h-4')
            expect(svg?.className).toContain('text-red-500')
            expect(svg?.classList.contains('my-custom-class')).toBe(true)
        })
    })
})
