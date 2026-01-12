import { describe, it, expect, vi } from 'bun:test'
import { render } from '@testing-library/react'
import { Button } from './button'
import { FaCheck, FaArrowRight } from 'react-icons/fa'

describe('Button', () => {
    describe('basic rendering', () => {
        it('should render children correctly', () => {
            const { getByText } = render(<Button>Click me</Button>)
            expect(getByText('Click me')).toBeInTheDocument()
        })

        it('should render as button element by default', () => {
            const { container } = render(<Button>Test</Button>)
            const button = container.querySelector('button')
            expect(button).toBeInTheDocument()
            expect(button?.tagName.toLowerCase()).toBe('button')
        })

        it('should render as anchor element when as="a"', () => {
            const { container } = render(
                <Button as='a' href='/test'>
                    Link Button
                </Button>
            )
            const anchor = container.querySelector('a')
            expect(anchor).toBeInTheDocument()
            expect(anchor?.tagName.toLowerCase()).toBe('a')
            expect(anchor).toHaveAttribute('href', '/test')
        })

        it('should have type="button" by default', () => {
            const { container } = render(<Button>Test</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveAttribute('type', 'button')
        })
    })

    describe('variants', () => {
        it('should apply primary variant classes by default', () => {
            const { container } = render(<Button>Primary</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('bg-secondary')
            expect(button).toHaveClass('hover:bg-secondary/90')
        })

        it('should apply secondary variant classes', () => {
            const { container } = render(<Button variant='secondary'>Secondary</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('bg-primary/10')
            expect(button).toHaveClass('hover:bg-primary/20')
        })

        it('should apply outline variant classes', () => {
            const { container } = render(<Button variant='outline'>Outline</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('border-2')
            expect(button).toHaveClass('border-primary/20')
        })

        it('should apply ghost variant classes', () => {
            const { container } = render(<Button variant='ghost'>Ghost</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('bg-transparent')
            expect(button).toHaveClass('hover:bg-primary/10')
        })
    })

    describe('sizes', () => {
        it('should apply medium size classes by default', () => {
            const { container } = render(<Button>Medium</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('px-6')
            expect(button).toHaveClass('py-3')
            expect(button).toHaveClass('text-base')
        })

        it('should apply small size classes', () => {
            const { container } = render(<Button size='sm'>Small</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('px-4')
            expect(button).toHaveClass('py-2')
            expect(button).toHaveClass('text-sm')
        })

        it('should apply large size classes', () => {
            const { container } = render(<Button size='lg'>Large</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('px-8')
            expect(button).toHaveClass('py-4')
            expect(button).toHaveClass('text-lg')
        })
    })

    describe('layout props', () => {
        it('should apply full width when fullWidth=true', () => {
            const { container } = render(<Button fullWidth>Full Width</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('w-full')
        })

        it('should not apply full width by default', () => {
            const { container } = render(<Button>Not Full</Button>)
            const button = container.querySelector('button')
            expect(button).not.toHaveClass('w-full')
        })
    })

    describe('icons', () => {
        it('should render left icon', () => {
            const { container } = render(
                <Button leftIcon={<FaCheck data-testid='left-icon' />}>With Left Icon</Button>
            )
            const icon = container.querySelector('[data-testid="left-icon"]')
            expect(icon).toBeInTheDocument()
        })

        it('should render right icon', () => {
            const { container } = render(
                <Button rightIcon={<FaArrowRight data-testid='right-icon' />}>
                    With Right Icon
                </Button>
            )
            const icon = container.querySelector('[data-testid="right-icon"]')
            expect(icon).toBeInTheDocument()
        })

        it('should render both left and right icons', () => {
            const { container } = render(
                <Button
                    leftIcon={<FaCheck data-testid='left-icon' />}
                    rightIcon={<FaArrowRight data-testid='right-icon' />}
                >
                    Both Icons
                </Button>
            )
            expect(container.querySelector('[data-testid="left-icon"]')).toBeInTheDocument()
            expect(container.querySelector('[data-testid="right-icon"]')).toBeInTheDocument()
        })
    })

    describe('loading state', () => {
        it('should show spinner when isLoading=true', () => {
            const { container } = render(<Button isLoading>Loading</Button>)
            const spinner = container.querySelector('.animate-spin')
            expect(spinner).toBeInTheDocument()
        })

        it('should hide left icon when loading', () => {
            const { container } = render(
                <Button isLoading leftIcon={<FaCheck data-testid='left-icon' />}>
                    Loading
                </Button>
            )
            const icon = container.querySelector('[data-testid="left-icon"]')
            expect(icon).not.toBeInTheDocument()
        })

        it('should hide right icon when loading', () => {
            const { container } = render(
                <Button isLoading rightIcon={<FaArrowRight data-testid='right-icon' />}>
                    Loading
                </Button>
            )
            const icon = container.querySelector('[data-testid="right-icon"]')
            expect(icon).not.toBeInTheDocument()
        })

        it('should disable button when loading', () => {
            const { container } = render(<Button isLoading>Loading</Button>)
            const button = container.querySelector('button')
            expect(button).toBeDisabled()
        })

        it('should set aria-disabled on anchor when loading', () => {
            const { container } = render(
                <Button as='a' href='/test' isLoading>
                    Loading Link
                </Button>
            )
            const anchor = container.querySelector('a')
            expect(anchor).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('disabled state', () => {
        it('should disable button when disabled=true', () => {
            const { container } = render(<Button disabled>Disabled</Button>)
            const button = container.querySelector('button')
            expect(button).toBeDisabled()
        })

        it('should apply disabled styling classes', () => {
            const { container } = render(<Button disabled>Disabled</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('disabled:opacity-50')
            expect(button).toHaveClass('disabled:cursor-not-allowed')
        })

        it('should set aria-disabled on anchor when disabled', () => {
            const { container } = render(
                <Button as='a' href='/test' disabled>
                    Disabled Link
                </Button>
            )
            const anchor = container.querySelector('a')
            expect(anchor).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('custom classes', () => {
        it('should merge custom className with base classes', () => {
            const { container } = render(<Button className='custom-class'>Custom</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('custom-class')
            expect(button).toHaveClass('rounded-lg') // Base class should still be present
        })

        it('should allow overriding default classes', () => {
            const { container } = render(<Button className='bg-red-500'>Override</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('bg-red-500')
        })
    })

    describe('event handlers', () => {
        it('should call onClick handler when clicked', () => {
            const handleClick = vi.fn()
            const { container } = render(<Button onClick={handleClick}>Clickable</Button>)
            const button = container.querySelector('button')
            button?.click()
            expect(handleClick).toHaveBeenCalledTimes(1)
        })

        it('should not call onClick when disabled', () => {
            const handleClick = vi.fn()
            const { container } = render(
                <Button onClick={handleClick} disabled>
                    Disabled
                </Button>
            )
            const button = container.querySelector('button')
            button?.click()
            expect(handleClick).not.toHaveBeenCalled()
        })

        it('should not call onClick when loading', () => {
            const handleClick = vi.fn()
            const { container } = render(
                <Button onClick={handleClick} isLoading>
                    Loading
                </Button>
            )
            const button = container.querySelector('button')
            button?.click()
            expect(handleClick).not.toHaveBeenCalled()
        })
    })

    describe('accessibility', () => {
        it('should have focus-visible ring styles', () => {
            const { container } = render(<Button>Focus Test</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveClass('focus:outline-none')
            expect(button).toHaveClass('focus-visible:ring-2')
            expect(button).toHaveClass('focus-visible:ring-secondary')
        })

        it('should support custom button type', () => {
            const { container } = render(<Button type='submit'>Submit</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveAttribute('type', 'submit')
        })

        it('should support aria-label', () => {
            const { container } = render(<Button aria-label='Custom Label'>Button</Button>)
            const button = container.querySelector('button')
            expect(button).toHaveAttribute('aria-label', 'Custom Label')
        })
    })

    describe('polymorphic rendering', () => {
        it('should forward ref to button element', () => {
            const ref = { current: null as HTMLButtonElement | null }
            render(<Button ref={ref}>With Ref</Button>)
            expect(ref.current).toBeInstanceOf(HTMLButtonElement)
        })

        it('should forward ref to anchor element', () => {
            const ref = { current: null as HTMLAnchorElement | null }
            render(
                <Button as='a' href='/test' ref={ref}>
                    Anchor Ref
                </Button>
            )
            expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
        })

        it('should pass through additional button props', () => {
            const { container } = render(
                <Button data-testid='custom-prop' title='Custom Title'>
                    Props Test
                </Button>
            )
            const button = container.querySelector('button')
            expect(button).toHaveAttribute('data-testid', 'custom-prop')
            expect(button).toHaveAttribute('title', 'Custom Title')
        })

        it('should pass through additional anchor props', () => {
            const { container } = render(
                <Button
                    as='a'
                    href='/test'
                    target='_blank'
                    rel='noopener noreferrer'
                    data-testid='link-prop'
                >
                    Link Props
                </Button>
            )
            const anchor = container.querySelector('a')
            expect(anchor).toHaveAttribute('target', '_blank')
            expect(anchor).toHaveAttribute('rel', 'noopener noreferrer')
            expect(anchor).toHaveAttribute('data-testid', 'link-prop')
        })
    })

    describe('edge cases', () => {
        it('should handle empty children gracefully', () => {
            const { container } = render(<Button>{''}</Button>)
            const button = container.querySelector('button')
            expect(button).toBeInTheDocument()
        })

        it('should handle all props together', () => {
            const handleClick = vi.fn()
            const { getByText, container } = render(
                <Button
                    variant='outline'
                    size='lg'
                    fullWidth
                    leftIcon={<FaCheck data-testid='icon' />}
                    onClick={handleClick}
                    className='custom'
                >
                    Complete Test
                </Button>
            )

            const button = container.querySelector('button')
            expect(button).toHaveClass('border-2') // outline variant
            expect(button).toHaveClass('px-8') // lg size
            expect(button).toHaveClass('w-full') // fullWidth
            expect(button).toHaveClass('custom') // custom class
            expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument()
            expect(getByText('Complete Test')).toBeInTheDocument()
        })
    })
})
