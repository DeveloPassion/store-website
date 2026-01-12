import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import AnimatedKnowledgeSystem from './animated-knowledge-system'

describe('AnimatedKnowledgeSystem', () => {
    describe('Rendering', () => {
        it('renders the text "Knowledge System"', () => {
            const { getByLabelText } = render(<AnimatedKnowledgeSystem />)
            expect(getByLabelText('Knowledge System')).toBeInTheDocument()
        })

        it('splits text into individual characters for animation', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const chars = container.querySelectorAll('.animate-char-reveal')
            // "Knowledge System" = 16 characters (including space)
            expect(chars).toHaveLength(16)
        })

        it('renders decorative particle effects', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const particles = container.querySelectorAll('.animate-particle')
            expect(particles).toHaveLength(3)
        })

        it('renders glow effect with proper ARIA hiding', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const glowEffect = container.querySelector('.animate-glow-pulse')
            expect(glowEffect).toBeInTheDocument()
            expect(glowEffect?.getAttribute('aria-hidden')).toBe('true')
        })

        it('renders shimmer overlay effect', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const shimmer = container.querySelector('.animate-shimmer')
            expect(shimmer).toBeInTheDocument()
        })
    })

    describe('Accessibility', () => {
        it('has proper aria-label for screen readers', () => {
            const { getByLabelText } = render(<AnimatedKnowledgeSystem />)
            expect(getByLabelText('Knowledge System')).toBeInTheDocument()
        })

        it('marks decorative elements as aria-hidden', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const decorativeElements = container.querySelectorAll('[aria-hidden="true"]')
            expect(decorativeElements.length).toBeGreaterThan(0)
        })

        it('includes prefers-reduced-motion media query in styles', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const styleElement = container.querySelector('style')
            expect(styleElement?.textContent).toContain('@media (prefers-reduced-motion: reduce)')
        })

        it('disables animations for reduced motion preference', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const styleElement = container.querySelector('style')
            const styleContent = styleElement?.textContent || ''

            // Check that reduced motion removes animations
            expect(styleContent).toContain('animation: none')
            expect(styleContent).toContain('opacity: 1')
            expect(styleContent).toContain('transform: none')
        })
    })

    describe('Animation Properties', () => {
        it('applies staggered animation delays to characters', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const chars = container.querySelectorAll('.animate-char-reveal')

            chars.forEach((char, index) => {
                const delay = (char as HTMLElement).style.animationDelay
                expect(delay).toBe(`${index * 0.05}s`)
            })
        })

        it('sets animation fill mode to both for characters', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const chars = container.querySelectorAll('.animate-char-reveal')

            chars.forEach((char) => {
                const fillMode = (char as HTMLElement).style.animationFillMode
                expect(fillMode).toBe('both')
            })
        })

        it('applies different animation durations to particles', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const particles = container.querySelectorAll('.animate-particle')

            particles.forEach((particle, index) => {
                const duration = (particle as HTMLElement).style.animationDuration
                expect(duration).toBe(`${2 + index * 0.5}s`)
            })
        })

        it('applies different animation delays to particles', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const particles = container.querySelectorAll('.animate-particle')

            particles.forEach((particle, index) => {
                const delay = (particle as HTMLElement).style.animationDelay
                expect(delay).toBe(`${index * 0.7}s`)
            })
        })
    })

    describe('Styling', () => {
        it('includes all required animation keyframes', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const styleElement = container.querySelector('style')
            const styleContent = styleElement?.textContent || ''

            expect(styleContent).toContain('@keyframes char-reveal')
            expect(styleContent).toContain('@keyframes shimmer')
            expect(styleContent).toContain('@keyframes glow-pulse')
            expect(styleContent).toContain('@keyframes particle')
        })

        it('applies gradient background to shimmer effect', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const shimmer = container.querySelector('.animate-shimmer') as HTMLElement

            expect(shimmer).toBeInTheDocument()
            expect(shimmer?.style.backgroundSize).toBe('200% 100%')
            // Note: webkit prefixed properties may not be accessible in test environment
        })

        it('uses non-breaking space for space character', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const chars = container.querySelectorAll('.animate-char-reveal')
            const spaceChar = chars[9] // Space is at index 9 in "Knowledge System"

            expect(spaceChar).toBeDefined()
            expect(spaceChar?.textContent).toBe('\u00A0')
        })
    })

    describe('Component Structure', () => {
        it('wraps content in a span with relative positioning', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)
            const wrapper = container.querySelector('.relative.inline-block')
            expect(wrapper).toBeInTheDocument()
        })

        it('contains all visual effect layers', () => {
            const { container } = render(<AnimatedKnowledgeSystem />)

            // Main text layer
            expect(container.querySelector('.animate-char-reveal')).toBeInTheDocument()

            // Shimmer layer
            expect(container.querySelector('.animate-shimmer')).toBeInTheDocument()

            // Glow layer
            expect(container.querySelector('.animate-glow-pulse')).toBeInTheDocument()

            // Particle layer
            expect(container.querySelector('.animate-particle')).toBeInTheDocument()
        })
    })
})
