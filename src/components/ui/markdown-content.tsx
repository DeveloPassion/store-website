/**
 * MarkdownContent component - Renders markdown text with proper styling
 *
 * Supports:
 * - Links (external with icon, internal without)
 * - Bold (**text**)
 * - Italic (*text*)
 * - Inline code (`code`)
 * - Line breaks
 *
 * Designed for inline text content (FAQ answers, descriptions, etc.)
 */

import Markdown from 'react-markdown'
import { FaExternalLinkAlt } from 'react-icons/fa'

interface MarkdownContentProps {
    /** The markdown content to render */
    content: string
    /** Additional CSS classes to apply to the wrapper */
    className?: string
    /** Whether to render as inline (span) or block (div). Default: false (block) */
    inline?: boolean
}

/**
 * Determines if a URL is external (different domain)
 */
const isExternalUrl = (url: string): boolean => {
    if (!url) return false
    // Mailto links are not external
    if (url.startsWith('mailto:')) return false
    // Relative URLs are internal
    if (url.startsWith('/') || url.startsWith('#')) return false
    // URLs with protocol are external
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const urlObj = new URL(url)
            // Check if it's our domain
            return !urlObj.hostname.includes('store.dsebastien.net')
        } catch {
            return true
        }
    }
    return false
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
    content,
    className = '',
    inline = false
}) => {
    if (!content) return null

    const Wrapper = inline ? 'span' : 'div'

    return (
        <Wrapper className={className}>
            <Markdown
                components={{
                    // Paragraphs - render as spans when inline, divs when block
                    p: ({ children }) =>
                        inline ? (
                            <span>{children}</span>
                        ) : (
                            <p className='mb-2 last:mb-0'>{children}</p>
                        ),
                    // Links - styled with secondary color, external links get icon
                    a: ({ href, children }) => {
                        const external = isExternalUrl(href || '')
                        return (
                            <a
                                href={href}
                                target={external ? '_blank' : undefined}
                                rel={external ? 'noopener noreferrer' : undefined}
                                className='text-secondary hover:text-secondary-text inline-flex items-center gap-1 transition-colors'
                            >
                                {children}
                                {external && (
                                    <FaExternalLinkAlt
                                        className='h-3 w-3 shrink-0'
                                        aria-hidden='true'
                                    />
                                )}
                            </a>
                        )
                    },
                    // Strong/bold
                    strong: ({ children }) => <strong className='font-semibold'>{children}</strong>,
                    // Emphasis/italic
                    em: ({ children }) => <em className='italic'>{children}</em>,
                    // Inline code
                    code: ({ children }) => (
                        <code className='bg-primary/10 rounded px-1.5 py-0.5 font-mono text-sm'>
                            {children}
                        </code>
                    ),
                    // Lists (if needed)
                    ul: ({ children }) => <ul className='list-disc pl-4'>{children}</ul>,
                    li: ({ children }) => <li className='mb-1'>{children}</li>
                }}
            >
                {content}
            </Markdown>
        </Wrapper>
    )
}
