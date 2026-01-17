/**
 * MarkdownContent component - Renders markdown text with proper styling
 *
 * Supports:
 * - Links (external with icon, internal without)
 * - Bold (**text**)
 * - Italic (*text*)
 * - Inline code (`code`)
 * - Line breaks
 * - GFM: Strikethrough (~~text~~)
 * - GFM: Task lists (- [x] done, - [ ] pending)
 * - GFM: Autolinks (https://example.com)
 * - Blockquotes (> quote)
 * - Ordered lists (1. item)
 *
 * Tables are explicitly disabled for security/styling consistency.
 * HTML is sanitized to prevent XSS attacks.
 *
 * Designed for inline text content (FAQ answers, descriptions, etc.)
 */

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { FaExternalLinkAlt } from 'react-icons/fa'

interface MarkdownContentProps {
    /** The markdown content to render */
    content: string
    /** Additional CSS classes to apply to the wrapper */
    className?: string
    /** Whether to render as inline (span) or block (div). Default: false (block) */
    inline?: boolean
    /** Auto-detect inline vs block based on content structure. Default: false */
    autoDetect?: boolean
}

/**
 * Determines if content should be rendered inline based on its structure.
 * Returns true for single-line content without block-level elements.
 */
const shouldRenderInline = (content: string): boolean => {
    // Multi-line content should be block
    if (content.includes('\n')) return false

    // Block-level markdown patterns
    const blockPatterns = [
        /^#+\s/, // Headers
        /^>\s/, // Blockquotes
        /^[-*+]\s/, // Unordered lists
        /^\d+\.\s/, // Ordered lists
        /^```/, // Code blocks
        /^\|.*\|/, // Tables
        /^---+$/, // Horizontal rules
        /^- \[[ x]\]/i // Task lists
    ]

    return !blockPatterns.some((pattern) => pattern.test(content.trim()))
}

/**
 * Custom sanitization schema that disables tables for consistent styling
 */
const sanitizeSchema = {
    ...defaultSchema,
    tagNames: (defaultSchema.tagNames || []).filter(
        (tag) =>
            !['table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'].includes(
                tag
            )
    )
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
    inline = false,
    autoDetect = false
}) => {
    if (!content) return null

    // Determine if we should render inline
    const renderInline = autoDetect ? shouldRenderInline(content) : inline
    const Wrapper = renderInline ? 'span' : 'div'

    return (
        <Wrapper className={className}>
            <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
                components={{
                    // Paragraphs - render as spans when inline, divs when block
                    p: ({ children }) =>
                        renderInline ? (
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
                    // Strikethrough (GFM)
                    del: ({ children }) => (
                        <del className='text-primary/50 line-through'>{children}</del>
                    ),
                    // Inline code
                    code: ({ children }) => (
                        <code className='bg-primary/10 rounded px-1.5 py-0.5 font-mono text-sm'>
                            {children}
                        </code>
                    ),
                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className='border-secondary/50 text-primary/80 my-2 border-l-4 pl-4 italic'>
                            {children}
                        </blockquote>
                    ),
                    // Unordered lists
                    ul: ({ children }) => <ul className='my-2 list-disc pl-4'>{children}</ul>,
                    // Ordered lists
                    ol: ({ children }) => <ol className='my-2 list-decimal pl-4'>{children}</ol>,
                    // List items
                    li: ({ children }) => <li className='mb-1'>{children}</li>,
                    // Task list checkboxes (GFM) - disabled, styled
                    input: ({ checked, type }) => {
                        if (type === 'checkbox') {
                            return (
                                <input
                                    type='checkbox'
                                    checked={checked}
                                    disabled
                                    className='accent-secondary pointer-events-none mr-2'
                                    aria-label={checked ? 'Completed task' : 'Pending task'}
                                />
                            )
                        }
                        return null
                    },
                    // Disable tables - return null for all table elements
                    table: () => null,
                    thead: () => null,
                    tbody: () => null,
                    tr: () => null,
                    th: () => null,
                    td: () => null
                }}
            >
                {content}
            </Markdown>
        </Wrapper>
    )
}
