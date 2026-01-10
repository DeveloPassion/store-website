import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import Section from './section'

describe('Section Component', () => {
    it('should render children correctly', () => {
        const { getByText } = render(<Section>Test Content</Section>)
        expect(getByText('Test Content')).toBeInTheDocument()
    })

    it('should render as a section element', () => {
        const { container } = render(<Section>Content</Section>)
        const section = container.querySelector('section')
        expect(section).toBeInTheDocument()
    })

    it('should apply default styling when fullWidth is false', () => {
        const { container } = render(<Section>Content</Section>)
        const section = container.querySelector('section')
        expect(section).toHaveClass('max-w-[1800px]')
        expect(section).toHaveClass('2xl:max-w-[2200px]')
        expect(section).toHaveClass('mx-auto')
    })

    it('should not apply max-width classes when fullWidth is true', () => {
        const { container } = render(<Section fullWidth={true}>Content</Section>)
        const section = container.querySelector('section')
        expect(section).not.toHaveClass('max-w-[1800px]')
        expect(section).not.toHaveClass('mx-auto')
    })

    it('should apply custom className', () => {
        const { container } = render(<Section className='custom-class'>Content</Section>)
        const section = container.querySelector('section')
        expect(section).toHaveClass('custom-class')
    })

    it('should apply id attribute when provided', () => {
        const { container } = render(<Section id='test-section'>Content</Section>)
        const section = container.querySelector('section')
        expect(section).toHaveAttribute('id', 'test-section')
    })

    it('should have responsive padding classes', () => {
        const { container } = render(<Section>Content</Section>)
        const section = container.querySelector('section')
        expect(section).toHaveClass('py-12')
        expect(section).toHaveClass('sm:py-14')
        expect(section).toHaveClass('md:py-16')
        expect(section).toHaveClass('lg:py-20')
        expect(section).toHaveClass('xl:py-28')
    })

    it('should combine fullWidth and custom className correctly', () => {
        const { container } = render(
            <Section fullWidth={true} className='bg-blue-500'>
                Content
            </Section>
        )
        const section = container.querySelector('section')
        expect(section).toHaveClass('bg-blue-500')
        expect(section).not.toHaveClass('max-w-[1800px]')
    })

    it('should handle complex children', () => {
        const { getByText } = render(
            <Section>
                <div>
                    <h1>Title</h1>
                    <p>Paragraph</p>
                </div>
            </Section>
        )
        expect(getByText('Title')).toBeInTheDocument()
        expect(getByText('Paragraph')).toBeInTheDocument()
    })
})
