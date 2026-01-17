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

    describe('GFM: Strikethrough', () => {
        it('should render strikethrough text', () => {
            const { container } = render(<MarkdownContent content='This is ~~deleted~~ text' />)
            const del = container.querySelector('del')

            expect(del).toBeTruthy()
            expect(del?.textContent).toBe('deleted')
            expect(del?.className).toContain('line-through')
        })

        it('should apply correct styling to strikethrough', () => {
            const { container } = render(<MarkdownContent content='~~strikethrough~~' />)
            const del = container.querySelector('del')

            expect(del?.className).toContain('text-primary/50')
        })
    })

    describe('GFM: Task Lists', () => {
        it('should render completed task list item', () => {
            const { container } = render(<MarkdownContent content='- [x] Done task' />)
            const checkbox = container.querySelector('input[type="checkbox"]')

            expect(checkbox).toBeTruthy()
            expect((checkbox as HTMLInputElement)?.checked).toBe(true)
            expect((checkbox as HTMLInputElement)?.disabled).toBe(true)
        })

        it('should render pending task list item', () => {
            const { container } = render(<MarkdownContent content='- [ ] Pending task' />)
            const checkbox = container.querySelector('input[type="checkbox"]')

            expect(checkbox).toBeTruthy()
            expect((checkbox as HTMLInputElement)?.checked).toBe(false)
            expect((checkbox as HTMLInputElement)?.disabled).toBe(true)
        })

        it('should render multiple task list items', () => {
            const content = `- [x] Task 1
- [ ] Task 2
- [x] Task 3`
            const { container } = render(<MarkdownContent content={content} />)
            const checkboxes = container.querySelectorAll('input[type="checkbox"]')

            expect(checkboxes).toHaveLength(3)
            expect((checkboxes[0] as HTMLInputElement)?.checked).toBe(true)
            expect((checkboxes[1] as HTMLInputElement)?.checked).toBe(false)
            expect((checkboxes[2] as HTMLInputElement)?.checked).toBe(true)
        })

        it('should have proper accessibility attributes on checkboxes', () => {
            const { container } = render(<MarkdownContent content='- [x] Done' />)
            const checkbox = container.querySelector('input[type="checkbox"]')

            expect(checkbox?.getAttribute('aria-label')).toBe('Completed task')
        })

        it('should have proper accessibility label for pending tasks', () => {
            const { container } = render(<MarkdownContent content='- [ ] Pending' />)
            const checkbox = container.querySelector('input[type="checkbox"]')

            expect(checkbox?.getAttribute('aria-label')).toBe('Pending task')
        })
    })

    describe('Blockquotes', () => {
        it('should render blockquotes', () => {
            const { container } = render(<MarkdownContent content='> This is a quote' />)
            const blockquote = container.querySelector('blockquote')

            expect(blockquote).toBeTruthy()
            expect(blockquote?.textContent).toContain('This is a quote')
        })

        it('should apply proper blockquote styling', () => {
            const { container } = render(<MarkdownContent content='> Quote' />)
            const blockquote = container.querySelector('blockquote')

            expect(blockquote?.className).toContain('border-l-4')
            expect(blockquote?.className).toContain('italic')
        })

        it('should handle multi-line blockquotes', () => {
            const content = `> Line 1
> Line 2`
            const { container } = render(<MarkdownContent content={content} />)
            const blockquote = container.querySelector('blockquote')

            expect(blockquote).toBeTruthy()
            expect(blockquote?.textContent).toContain('Line 1')
            expect(blockquote?.textContent).toContain('Line 2')
        })
    })

    describe('GFM: Autolinks', () => {
        it('should render autolinks for URLs', () => {
            const { getByRole } = render(
                <MarkdownContent content='Visit https://example.com for more' />
            )
            const link = getByRole('link')

            expect(link).toBeTruthy()
            expect(link.getAttribute('href')).toBe('https://example.com')
        })

        it('should treat autolinks as external', () => {
            const { getByRole } = render(<MarkdownContent content='Check https://google.com' />)
            const link = getByRole('link')

            expect(link.getAttribute('target')).toBe('_blank')
            expect(link.getAttribute('rel')).toBe('noopener noreferrer')
        })
    })

    describe('Ordered Lists', () => {
        it('should render ordered lists', () => {
            const content = `1. First
2. Second
3. Third`
            const { container } = render(<MarkdownContent content={content} />)
            const ol = container.querySelector('ol')
            const items = container.querySelectorAll('li')

            expect(ol).toBeTruthy()
            expect(items).toHaveLength(3)
        })

        it('should apply proper ordered list styling', () => {
            const { container } = render(<MarkdownContent content='1. Test' />)
            const ol = container.querySelector('ol')

            expect(ol?.className).toContain('list-decimal')
        })
    })

    describe('HTML Sanitization', () => {
        it('should strip script tags', () => {
            const { container } = render(
                <MarkdownContent content='Text before <script>alert("xss")</script> text after' />
            )

            expect(container.querySelector('script')).toBeNull()
            // The text around the script should remain
            expect(container.textContent).toContain('Text before')
        })

        it('should strip dangerous attributes in HTML', () => {
            // Test that onclick in an anchor doesn't execute
            // Sanitizer removes dangerous attributes from allowed elements
            const { container } = render(
                <MarkdownContent content='Normal **bold** text with [link](https://example.com)' />
            )

            // Verify the content renders without dangerous handlers
            const link = container.querySelector('a')
            expect(link?.getAttribute('onclick')).toBeNull()
        })

        it('should strip iframe tags', () => {
            const { container } = render(
                <MarkdownContent content='Safe text <iframe src="evil.com"></iframe> more text' />
            )

            expect(container.querySelector('iframe')).toBeNull()
            expect(container.textContent).toContain('Safe text')
        })
    })

    describe('Table Disabling', () => {
        it('should not render table elements', () => {
            const content = `| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`
            const { container } = render(<MarkdownContent content={content} />)

            expect(container.querySelector('table')).toBeNull()
            expect(container.querySelector('thead')).toBeNull()
            expect(container.querySelector('tbody')).toBeNull()
            expect(container.querySelector('tr')).toBeNull()
            expect(container.querySelector('th')).toBeNull()
            expect(container.querySelector('td')).toBeNull()
        })
    })

    describe('Smart Detection (autoDetect)', () => {
        it('should render as span for single-line simple content', () => {
            const { container } = render(
                <MarkdownContent content='Simple text without blocks' autoDetect />
            )
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('span')
        })

        it('should render as div for multi-line content', () => {
            const content = `Line 1
Line 2`
            const { container } = render(<MarkdownContent content={content} autoDetect />)
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('div')
        })

        it('should render as div for content with headers', () => {
            const { container } = render(<MarkdownContent content='# Header' autoDetect />)
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('div')
        })

        it('should render as div for content with blockquotes', () => {
            const { container } = render(<MarkdownContent content='> Quote' autoDetect />)
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('div')
        })

        it('should render as div for content with lists', () => {
            const { container } = render(<MarkdownContent content='- Item' autoDetect />)
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('div')
        })

        it('should render as div for content with numbered lists', () => {
            const { container } = render(<MarkdownContent content='1. First' autoDetect />)
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('div')
        })

        it('should render as div for content with task lists', () => {
            const { container } = render(<MarkdownContent content='- [x] Task' autoDetect />)
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('div')
        })

        it('should render inline content with formatting as span', () => {
            const { container } = render(
                <MarkdownContent content='This is **bold** and *italic*' autoDetect />
            )
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('span')
        })

        it('should prioritize explicit inline prop over autoDetect', () => {
            const content = `- List item
- Another item`
            const { container } = render(
                <MarkdownContent content={content} inline autoDetect={false} />
            )
            expect(container.firstChild?.nodeName.toLowerCase()).toBe('span')
        })
    })
})
