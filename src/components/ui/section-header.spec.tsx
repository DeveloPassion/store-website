import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { SectionHeader } from './section-header'
import { FaCheckCircle } from 'react-icons/fa'

describe('SectionHeader', () => {
    describe('basic rendering', () => {
        it('should render title correctly', () => {
            const { getByText } = render(<SectionHeader title='Test Title' />)
            expect(getByText('Test Title')).toBeInTheDocument()
        })

        it('should render subtitle when provided', () => {
            const { getByText } = render(<SectionHeader title='Test' subtitle='Test Subtitle' />)
            expect(getByText('Test Subtitle')).toBeInTheDocument()
        })

        it('should not render subtitle when not provided', () => {
            const { queryByText } = render(<SectionHeader title='Test' />)
            expect(queryByText('Test Subtitle')).not.toBeInTheDocument()
        })

        it('should render icon when provided', () => {
            const { container } = render(
                <SectionHeader title='Test' icon={<FaCheckCircle data-testid='icon' />} />
            )
            expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument()
        })

        it('should not render icon container when icon not provided', () => {
            const { container } = render(<SectionHeader title='Test' />)
            const iconContainer = container.querySelector('.mb-4.flex')
            expect(iconContainer).not.toBeInTheDocument()
        })
    })

    describe('size variants', () => {
        it('should apply small size classes', () => {
            const { getByText } = render(<SectionHeader title='Test' size='sm' />)
            const title = getByText('Test')
            expect(title).toHaveClass('text-2xl')
            expect(title).toHaveClass('sm:text-3xl')
        })

        it('should apply medium size classes', () => {
            const { getByText } = render(<SectionHeader title='Test' size='md' />)
            const title = getByText('Test')
            expect(title).toHaveClass('text-3xl')
            expect(title).toHaveClass('sm:text-4xl')
        })

        it('should apply large size classes by default', () => {
            const { getByText } = render(<SectionHeader title='Test' />)
            const title = getByText('Test')
            expect(title).toHaveClass('text-3xl')
            expect(title).toHaveClass('md:text-5xl')
        })

        it('should apply large size classes explicitly', () => {
            const { getByText } = render(<SectionHeader title='Test' size='lg' />)
            const title = getByText('Test')
            expect(title).toHaveClass('text-3xl')
            expect(title).toHaveClass('md:text-5xl')
        })
    })

    describe('alignment', () => {
        it('should apply center alignment by default', () => {
            const { container } = render(<SectionHeader title='Test' />)
            expect(container.firstChild).toHaveClass('text-center')
        })

        it('should apply left alignment', () => {
            const { container } = render(<SectionHeader title='Test' align='left' />)
            expect(container.firstChild).toHaveClass('text-left')
        })

        it('should apply right alignment', () => {
            const { container } = render(<SectionHeader title='Test' align='right' />)
            expect(container.firstChild).toHaveClass('text-right')
        })

        it('should center icon when alignment is center', () => {
            const { container } = render(
                <SectionHeader title='Test' icon={<FaCheckCircle />} align='center' />
            )
            const iconContainer = container.querySelector('.mb-4.flex')
            expect(iconContainer).toHaveClass('justify-center')
        })

        it('should not center icon when alignment is left', () => {
            const { container } = render(
                <SectionHeader title='Test' icon={<FaCheckCircle />} align='left' />
            )
            const iconContainer = container.querySelector('.mb-4.flex')
            expect(iconContainer).not.toHaveClass('justify-center')
        })
    })

    describe('custom classes', () => {
        it('should apply custom className to container', () => {
            const { container } = render(<SectionHeader title='Test' className='custom-class' />)
            expect(container.firstChild).toHaveClass('custom-class')
        })

        it('should apply custom titleClassName to title', () => {
            const { getByText } = render(
                <SectionHeader title='Test' titleClassName='custom-title' />
            )
            const title = getByText('Test')
            expect(title).toHaveClass('custom-title')
        })

        it('should apply custom subtitleClassName to subtitle', () => {
            const { getByText } = render(
                <SectionHeader
                    title='Test'
                    subtitle='Subtitle'
                    subtitleClassName='custom-subtitle'
                />
            )
            const subtitle = getByText('Subtitle')
            expect(subtitle).toHaveClass('custom-subtitle')
        })

        it('should preserve default classes when adding custom classes', () => {
            const { container } = render(<SectionHeader title='Test' className='custom-class' />)
            expect(container.firstChild).toHaveClass('mb-12')
            expect(container.firstChild).toHaveClass('custom-class')
        })
    })

    describe('animation', () => {
        it('should use motion.div by default', () => {
            const { container } = render(<SectionHeader title='Test' />)
            const element = container.firstChild as HTMLElement
            expect(element.tagName.toLowerCase()).toBe('div')
        })

        it('should use regular div when animation is disabled', () => {
            const { container } = render(<SectionHeader title='Test' disableAnimation />)
            const element = container.firstChild as HTMLElement
            expect(element.tagName.toLowerCase()).toBe('div')
        })
    })

    describe('accessibility', () => {
        it('should use semantic h2 for title', () => {
            const { getByRole } = render(<SectionHeader title='Test Title' />)
            const title = getByRole('heading', { level: 2 })
            expect(title).toHaveTextContent('Test Title')
        })

        it('should have proper heading hierarchy', () => {
            const { getByRole } = render(
                <SectionHeader title='Main Title' subtitle='Description' />
            )
            const heading = getByRole('heading', { level: 2 })
            expect(heading).toBeInTheDocument()
        })
    })

    describe('edge cases', () => {
        it('should handle empty subtitle gracefully', () => {
            const { container } = render(<SectionHeader title='Test' subtitle='' />)
            // Empty subtitle should not be rendered - check that there's no <p> tag
            const paragraphs = container.querySelectorAll('p')
            expect(paragraphs.length).toBe(0)
        })

        it('should handle very long titles', () => {
            const longTitle = 'A'.repeat(200)
            const { getByText } = render(<SectionHeader title={longTitle} />)
            expect(getByText(longTitle)).toBeInTheDocument()
        })

        it('should handle very long subtitles', () => {
            const longSubtitle = 'B'.repeat(500)
            const { getByText } = render(<SectionHeader title='Test' subtitle={longSubtitle} />)
            expect(getByText(longSubtitle)).toBeInTheDocument()
        })

        it('should handle all props together', () => {
            const { getByText, getByTestId } = render(
                <SectionHeader
                    title='Complete Test'
                    subtitle='With all props'
                    icon={<FaCheckCircle data-testid='complete-icon' />}
                    size='md'
                    align='left'
                    className='custom-container'
                    titleClassName='custom-title'
                    subtitleClassName='custom-subtitle'
                />
            )

            expect(getByText('Complete Test')).toBeInTheDocument()
            expect(getByText('With all props')).toBeInTheDocument()
            expect(getByTestId('complete-icon')).toBeInTheDocument()
        })
    })
})
