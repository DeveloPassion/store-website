import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { MarkdownContent } from './markdown-content'

describe('MarkdownContent Component', () => {
    describe('Basic Rendering', () => {
        it('should render plain text content', () => {
            const { getByText } = render(<MarkdownContent content='Hello, world!' />)
            expect(getByText('Hello, world!')).toBeTruthy()
        })

        it('should return null for empty content', () => {
            const { container } = render(<MarkdownContent content='' />)
            expect(container.firstChild).toBeNull()
        })

        it('should render as div by default (block mode)', () => {
            const { container } = render(<MarkdownContent content='Test content' />)
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('div')
        })

        it('should render as span when inline prop is true', () => {
            const { container } = render(<MarkdownContent content='Test content' inline />)
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('span')
        })

        it('should apply custom className', () => {
            const { container } = render(
                <MarkdownContent content='Test' className='custom-class' />
            )
            expect((container.firstChild as HTMLElement)?.classList?.contains('custom-class')).toBe(
                true
            )
        })
    })

    describe('Link Rendering', () => {
        it('should render external links with target="_blank"', () => {
            const { getByRole } = render(
                <MarkdownContent content='Visit [Gumroad](https://gumroad.com)' />
            )
            const link = getByRole('link', { name: /Gumroad/i })

            expect(link).toBeTruthy()
            expect(link.getAttribute('href')).toBe('https://gumroad.com')
            expect(link.getAttribute('target')).toBe('_blank')
            expect(link.getAttribute('rel')).toBe('noopener noreferrer')
        })

        it('should render external link icon for external links', () => {
            const { container } = render(
                <MarkdownContent content='Visit [Google](https://google.com)' />
            )
            const svg = container.querySelector('svg')

            expect(svg).toBeTruthy()
            expect(svg?.getAttribute('aria-hidden')).toBe('true')
        })

        it('should render internal links without target="_blank"', () => {
            const { getByRole } = render(<MarkdownContent content='See [products](/products)' />)
            const link = getByRole('link', { name: 'products' })

            expect(link).toBeTruthy()
            expect(link.getAttribute('href')).toBe('/products')
            expect(link.getAttribute('target')).toBeNull()
            expect(link.getAttribute('rel')).toBeNull()
        })

        it('should not render external icon for internal links', () => {
            const { container } = render(<MarkdownContent content='See [FAQ](/faq)' />)
            const svg = container.querySelector('svg')

            expect(svg).toBeNull()
        })

        it('should not render external icon for mailto links', () => {
            const { container, getByRole } = render(
                <MarkdownContent content='Email [me](mailto:test@example.com)' />
            )
            const link = getByRole('link', { name: 'me' })

            expect(link.getAttribute('href')).toBe('mailto:test@example.com')
            expect(link.getAttribute('target')).toBeNull()
            expect(container.querySelector('svg')).toBeNull()
        })

        it('should not render external icon for anchor links', () => {
            const { container, getByRole } = render(
                <MarkdownContent content='Jump to [section](#section)' />
            )
            const link = getByRole('link', { name: 'section' })

            expect(link.getAttribute('href')).toBe('#section')
            expect(link.getAttribute('target')).toBeNull()
            expect(container.querySelector('svg')).toBeNull()
        })

        it('should treat store.dsebastien.net URLs as internal', () => {
            const { container, getByRole } = render(
                <MarkdownContent content='Visit [store](https://store.dsebastien.net/products)' />
            )
            const link = getByRole('link', { name: 'store' })

            expect(link.getAttribute('target')).toBeNull()
            expect(container.querySelector('svg')).toBeNull()
        })

        it('should apply secondary color class to links', () => {
            const { getByRole } = render(
                <MarkdownContent content='Click [here](https://example.com)' />
            )
            const link = getByRole('link', { name: /here/i })

            expect(link.className).toContain('text-secondary')
        })
    })

    describe('Text Formatting', () => {
        it('should render bold text', () => {
            const { container } = render(<MarkdownContent content='This is **bold** text' />)
            const strong = container.querySelector('strong')

            expect(strong).toBeTruthy()
            expect(strong?.textContent).toBe('bold')
            expect(strong?.className).toContain('font-semibold')
        })

        it('should render italic text', () => {
            const { container } = render(<MarkdownContent content='This is *italic* text' />)
            const em = container.querySelector('em')

            expect(em).toBeTruthy()
            expect(em?.textContent).toBe('italic')
            expect(em?.className).toContain('italic')
        })

        it('should render inline code', () => {
            const { container } = render(<MarkdownContent content='Use the `code` command' />)
            const code = container.querySelector('code')

            expect(code).toBeTruthy()
            expect(code?.textContent).toBe('code')
            expect(code?.className).toContain('font-mono')
        })

        it('should render combined formatting', () => {
            const { container } = render(
                <MarkdownContent content='This is **bold** and *italic* and `code`' />
            )

            expect(container.querySelector('strong')).toBeTruthy()
            expect(container.querySelector('em')).toBeTruthy()
            expect(container.querySelector('code')).toBeTruthy()
        })
    })

    describe('Inline Mode', () => {
        it('should render paragraphs as spans in inline mode', () => {
            const { container } = render(<MarkdownContent content='Paragraph text' inline />)
            // In inline mode, p elements become spans
            const p = container.querySelector('p')
            expect(p).toBeNull()
        })

        it('should preserve text content in inline mode', () => {
            const { getByText } = render(<MarkdownContent content='Hello world!' inline />)
            expect(getByText('Hello world!')).toBeTruthy()
        })
    })

    describe('Complex Content', () => {
        it('should handle multiple links in content', () => {
            const { getAllByRole } = render(
                <MarkdownContent content='Visit [Google](https://google.com) or [internal](/page)' />
            )

            const links = getAllByRole('link')
            expect(links).toHaveLength(2)
            expect(links[0]?.getAttribute('target')).toBe('_blank')
            expect(links[1]?.getAttribute('target')).toBeNull()
        })

        it('should handle link with bold text inside', () => {
            const { container, getByRole } = render(
                <MarkdownContent content='Click [**here**](https://example.com)' />
            )

            const link = getByRole('link')
            const strong = container.querySelector('a strong')

            expect(link).toBeTruthy()
            expect(strong).toBeTruthy()
        })

        it('should handle mixed content with links and formatting', () => {
            const { container, getByRole } = render(
                <MarkdownContent content='All products are sold through [Gumroad](https://gumroad.com), a **trusted** e-commerce platform.' />
            )

            expect(getByRole('link', { name: /Gumroad/i })).toBeTruthy()
            expect(container.querySelector('strong')?.textContent).toBe('trusted')
        })
    })

    describe('List Rendering', () => {
        it('should render unordered lists', () => {
            const content = `- Item 1
- Item 2
- Item 3`
            const { container } = render(<MarkdownContent content={content} />)
            const ul = container.querySelector('ul')
            const items = container.querySelectorAll('li')

            expect(ul).toBeTruthy()
            expect(items).toHaveLength(3)
        })

        it('should apply proper list styling', () => {
            const { container } = render(<MarkdownContent content='- Test item' />)
            const ul = container.querySelector('ul')

            expect(ul?.className).toContain('list-disc')
        })
    })

    describe('Edge Cases', () => {
        it('should handle content with special characters', () => {
            const { getByText } = render(<MarkdownContent content={"It's a test with quotes"} />)
            // Content should render without errors
            expect(getByText(/It's a test with quotes/)).toBeTruthy()
        })

        it('should handle content with newlines', () => {
            const content = `Line 1

Line 2`
            const { container } = render(<MarkdownContent content={content} />)
            const paragraphs = container.querySelectorAll('p')

            expect(paragraphs.length).toBeGreaterThanOrEqual(1)
        })

        it('should handle empty link href gracefully', () => {
            const { container } = render(<MarkdownContent content='[link]()' />)
            const link = container.querySelector('a')
            expect(link).toBeTruthy()
            expect(link?.getAttribute('target')).toBeNull()
        })
    })
})
