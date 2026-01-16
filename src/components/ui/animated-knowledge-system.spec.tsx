import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import AnimatedKnowledgeSystem from './animated-knowledge-system'

describe('AnimatedKnowledgeSystem', () => {
    const testText = 'Knowledge System'

    describe('Rendering', () => {
        it('renders the provided text', () => {
            const { getByLabelText } = render(<AnimatedKnowledgeSystem text={testText} />)
            expect(getByLabelText(testText)).toBeInTheDocument()
        })

        it('splits text into individual characters for animation', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const chars = container.querySelectorAll('.animate-char-reveal')
            // "Knowledge System" = 16 characters (including space)
            expect(chars).toHaveLength(16)
        })

        it('renders decorative particle effects', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const particles = container.querySelectorAll('.animate-particle')
            expect(particles).toHaveLength(3)
        })

        it('renders glow effect with proper ARIA hiding', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const glowEffect = container.querySelector('.animate-glow-pulse')
            expect(glowEffect).toBeInTheDocument()
            expect(glowEffect?.getAttribute('aria-hidden')).toBe('true')
        })

        it('renders shimmer overlay effect', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const shimmer = container.querySelector('.animate-shimmer')
            expect(shimmer).toBeInTheDocument()
        })

        it('renders different text when provided', () => {
            const customText = 'Creation System'
            const { getByLabelText } = render(<AnimatedKnowledgeSystem text={customText} />)
            expect(getByLabelText(customText)).toBeInTheDocument()
        })
    })

    describe('Accessibility', () => {
        it('has proper aria-label for screen readers', () => {
            const { getByLabelText } = render(<AnimatedKnowledgeSystem text={testText} />)
            expect(getByLabelText(testText)).toBeInTheDocument()
        })

        it('marks decorative elements as aria-hidden', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const decorativeElements = container.querySelectorAll('[aria-hidden="true"]')
            expect(decorativeElements.length).toBeGreaterThan(0)
        })

        it('uses animate classes that support reduced motion (defined in CSS)', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            // Verify animate classes are applied - reduced motion handling is in CSS
            expect(container.querySelector('.animate-char-reveal')).toBeInTheDocument()
            expect(container.querySelector('.animate-shimmer')).toBeInTheDocument()
            expect(container.querySelector('.animate-glow-pulse')).toBeInTheDocument()
            expect(container.querySelector('.animate-particle')).toBeInTheDocument()
        })
    })

    describe('Animation Properties', () => {
        it('applies staggered animation delays to characters via CSS class', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const chars = container.querySelectorAll('.animate-char-reveal')

            chars.forEach((char, index) => {
                // Animation delay is set via Tailwind arbitrary property class
                expect((char as HTMLElement).className).toContain(
                    `[--animation-delay:${index * 0.05}s]`
                )
            })
        })

        it('has animate-char-reveal class for animation fill mode (defined in CSS)', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const chars = container.querySelectorAll('.animate-char-reveal')

            chars.forEach((char) => {
                expect(char).toHaveClass('animate-char-reveal')
            })
        })

        it('applies different animation durations to particles via CSS class', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const particles = container.querySelectorAll('.animate-particle')

            particles.forEach((particle, index) => {
                // Animation duration is set via Tailwind arbitrary property class
                expect((particle as HTMLElement).className).toContain(
                    `[animation-duration:${2 + index * 0.5}s]`
                )
            })
        })

        it('applies different animation delays to particles via CSS class', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const particles = container.querySelectorAll('.animate-particle')

            particles.forEach((particle, index) => {
                // Animation delay is set via Tailwind arbitrary property class
                expect((particle as HTMLElement).className).toContain(
                    `[--animation-delay:${index * 0.7}s]`
                )
            })
        })

        it('applies particle positions via CSS classes', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const particles = container.querySelectorAll('.animate-particle')

            particles.forEach((particle, index) => {
                const className = (particle as HTMLElement).className
                expect(className).toContain(`[--particle-left:${20 + index * 30}%]`)
                expect(className).toContain(`[--particle-top:${10 + index * 20}%]`)
            })
        })

        it('applies particle movement via CSS classes', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const particles = container.querySelectorAll('.animate-particle')
            const expectedPositions = [
                { x: 42, y: -75 },
                { x: -18, y: -52 },
                { x: 8, y: -93 }
            ]

            particles.forEach((particle, index) => {
                const className = (particle as HTMLElement).className
                const expected = expectedPositions[index]
                expect(className).toContain(`[--particle-x:${expected?.x}px]`)
                expect(className).toContain(`[--particle-y:${expected?.y}px]`)
            })
        })
    })

    describe('Styling', () => {
        it('uses CSS classes for animations (keyframes defined in external CSS)', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            // All animation classes should be present
            expect(container.querySelector('.animate-char-reveal')).toBeInTheDocument()
            expect(container.querySelector('.animate-shimmer')).toBeInTheDocument()
            expect(container.querySelector('.animate-glow-pulse')).toBeInTheDocument()
            expect(container.querySelector('.animate-particle')).toBeInTheDocument()
        })

        it('applies gradient background class to shimmer effect', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const shimmer = container.querySelector('.animate-shimmer') as HTMLElement

            expect(shimmer).toBeInTheDocument()
            expect(shimmer).toHaveClass('bg-gradient-to-r')
            expect(shimmer).toHaveClass('from-transparent')
            expect(shimmer).toHaveClass('via-white/40')
            expect(shimmer).toHaveClass('to-transparent')
        })

        it('uses non-breaking space for space character', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const chars = container.querySelectorAll('.animate-char-reveal')
            const spaceChar = chars[9] // Space is at index 9 in "Knowledge System"

            expect(spaceChar).toBeDefined()
            expect(spaceChar?.textContent).toBe('\u00A0')
        })
    })

    describe('Component Structure', () => {
        it('wraps content in a span with relative positioning', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const wrapper = container.querySelector('.relative.inline-block')
            expect(wrapper).toBeInTheDocument()
        })

        it('contains all visual effect layers', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)

            // Main text layer
            expect(container.querySelector('.animate-char-reveal')).toBeInTheDocument()

            // Shimmer layer
            expect(container.querySelector('.animate-shimmer')).toBeInTheDocument()

            // Glow layer
            expect(container.querySelector('.animate-glow-pulse')).toBeInTheDocument()

            // Particle layer
            expect(container.querySelector('.animate-particle')).toBeInTheDocument()
        })

        it('does not include inline style element (animations are in CSS file)', () => {
            const { container } = render(<AnimatedKnowledgeSystem text={testText} />)
            const styleElement = container.querySelector('style')
            expect(styleElement).not.toBeInTheDocument()
        })
    })
})
