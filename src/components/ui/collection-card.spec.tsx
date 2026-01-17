import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { HashRouter } from 'react-router'
import { CollectionCard } from './collection-card'
import type { ColorKey } from '@/schemas/color-key.schema'

// Test helper to wrap components with Router
const renderWithRouter = (ui: React.ReactElement) => {
    return render(<HashRouter>{ui}</HashRouter>)
}

// Mock collection item with valid ColorKey
const createMockItem = (overrides: Record<string, unknown> = {}) => ({
    id: 'test-item',
    name: 'Test Item',
    description: 'Test description for the item',
    icon: 'FaTag',
    color: 'pink-500' as ColorKey,
    featured: true,
    ...overrides
})

describe('CollectionCard', () => {
    describe('basic rendering', () => {
        it('should render item name', () => {
            const item = createMockItem()
            const { getByText } = renderWithRouter(<CollectionCard item={item} basePath='/test' />)
            expect(getByText('Test Item')).toBeInTheDocument()
        })

        it('should render item description in detailed variant', () => {
            const item = createMockItem()
            const { getByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' variant='detailed' />
            )
            expect(getByText('Test description for the item')).toBeInTheDocument()
        })

        it('should not render description in simple variant', () => {
            const item = createMockItem()
            const { queryByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' variant='simple' />
            )
            expect(queryByText('Test description for the item')).not.toBeInTheDocument()
        })

        it('should render as link with correct href', () => {
            const item = createMockItem({ id: 'my-item' })
            const { container } = renderWithRouter(
                <CollectionCard item={item} basePath='/categories' />
            )
            const link = container.querySelector('a')
            expect(link?.getAttribute('href')).toBe('/categories/my-item')
        })
    })

    describe('variants', () => {
        it('should render detailed variant by default', () => {
            const item = createMockItem()
            const { getByText } = renderWithRouter(<CollectionCard item={item} basePath='/test' />)
            // Detailed variant shows description
            expect(getByText('Test description for the item')).toBeInTheDocument()
        })

        it('should render simple variant when specified', () => {
            const item = createMockItem()
            const { container, queryByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' variant='simple' />
            )
            // Simple variant doesn't show description
            expect(queryByText('Test description for the item')).not.toBeInTheDocument()
            // But shows the name
            expect(container.querySelector('.text-lg')).toBeInTheDocument()
        })
    })

    describe('icon rendering', () => {
        it('should render icon when provided', () => {
            const item = createMockItem({ icon: 'FaStar' })
            const { container } = renderWithRouter(<CollectionCard item={item} basePath='/test' />)
            // DynamicIcon component should be rendered
            const iconContainer = container.querySelector('.h-12.w-12.flex-shrink-0')
            expect(iconContainer).toBeInTheDocument()
        })

        it('should not render icon container when icon is undefined', () => {
            const item = createMockItem({ icon: undefined })
            const { container } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' variant='detailed' />
            )
            const iconContainer = container.querySelector('.h-12.w-12.flex-shrink-0')
            expect(iconContainer).not.toBeInTheDocument()
        })

        it('should apply color to icon container via Tailwind class', () => {
            const item = createMockItem({ icon: 'FaStar', color: 'red-500' as ColorKey })
            const { container } = renderWithRouter(<CollectionCard item={item} basePath='/test' />)
            const iconContainer = container.querySelector('.h-12.w-12.flex-shrink-0') as HTMLElement
            // Color is now set via Tailwind utility class mapping
            expect(iconContainer).toHaveClass('bg-red-500/15')
        })
    })

    describe('color styling', () => {
        it('should apply text color class to icon when color is provided', () => {
            const item = createMockItem({ color: 'pink-500' as ColorKey })
            const { container } = renderWithRouter(<CollectionCard item={item} basePath='/test' />)
            const icon = container.querySelector('svg')
            // Color is now set via Tailwind utility class mapping
            expect(icon).toHaveClass('text-pink-500')
        })

        it('should not apply color classes when color is undefined', () => {
            const item = createMockItem({ color: undefined })
            const { container } = renderWithRouter(<CollectionCard item={item} basePath='/test' />)
            const iconContainer = container.querySelector('.h-12.w-12.flex-shrink-0') as HTMLElement
            // Should fallback to default white/10 background
            expect(iconContainer).toHaveClass('bg-white/10')
        })
    })

    describe('featured badge', () => {
        it('should show featured badge when showFeaturedBadge=true and item.featured=true', () => {
            const item = createMockItem({ featured: true })
            const { getByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' showFeaturedBadge variant='detailed' />
            )
            expect(getByText('Featured')).toBeInTheDocument()
        })

        it('should not show featured badge when showFeaturedBadge=false', () => {
            const item = createMockItem({ featured: true })
            const { queryByText } = renderWithRouter(
                <CollectionCard
                    item={item}
                    basePath='/test'
                    showFeaturedBadge={false}
                    variant='detailed'
                />
            )
            expect(queryByText('Featured')).not.toBeInTheDocument()
        })

        it('should not show featured badge when item.featured=false', () => {
            const item = createMockItem({ featured: false })
            const { queryByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' showFeaturedBadge variant='detailed' />
            )
            expect(queryByText('Featured')).not.toBeInTheDocument()
        })

        it('should not show featured badge in simple variant', () => {
            const item = createMockItem({ featured: true })
            const { queryByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' showFeaturedBadge variant='simple' />
            )
            // Simple variant doesn't include the featured badge rendering
            expect(queryByText('Featured')).not.toBeInTheDocument()
        })
    })

    describe('count display', () => {
        it('should display count with singular label when count=1', () => {
            const item = createMockItem()
            const { getByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' count={1} />
            )
            expect(getByText('1 product')).toBeInTheDocument()
        })

        it('should display count with plural label when count>1', () => {
            const item = createMockItem()
            const { getByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' count={5} />
            )
            expect(getByText('5 products')).toBeInTheDocument()
        })

        it('should display count with plural label when count=0', () => {
            const item = createMockItem()
            const { getByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' count={0} />
            )
            expect(getByText('0 products')).toBeInTheDocument()
        })

        it('should not display count when not provided', () => {
            const item = createMockItem()
            const { container } = renderWithRouter(<CollectionCard item={item} basePath='/test' />)
            const statsDiv = container.querySelector('.mt-auto')
            expect(statsDiv).not.toBeInTheDocument()
        })

        it('should use custom countLabel when provided', () => {
            const item = createMockItem()
            const { getByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' count={3} countLabel='item' />
            )
            expect(getByText('3 items')).toBeInTheDocument()
        })

        it('should not display count in simple variant', () => {
            const item = createMockItem()
            const { container } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' count={5} variant='simple' />
            )
            const statsDiv = container.querySelector('.mt-auto')
            expect(statsDiv).not.toBeInTheDocument()
        })
    })

    describe('hover effects', () => {
        it('should have hover classes for transition effects', () => {
            const item = createMockItem()
            const { container } = renderWithRouter(<CollectionCard item={item} basePath='/test' />)
            const link = container.querySelector('a')
            expect(link).toHaveClass('hover:border-secondary/30')
            expect(link).toHaveClass('hover:scale-102')
            expect(link).toHaveClass('hover:shadow-lg')
        })

        it('should have group-hover classes for text color changes', () => {
            const item = createMockItem()
            const { container } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' variant='detailed' />
            )
            const title = container.querySelector('h3')
            expect(title).toHaveClass('group-hover:text-secondary')
        })
    })

    describe('accessibility', () => {
        it('should use semantic heading for title', () => {
            const item = createMockItem({ name: 'Accessible Title' })
            const { getByRole } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' variant='detailed' />
            )
            const heading = getByRole('heading', { level: 3 })
            expect(heading).toHaveTextContent('Accessible Title')
        })

        it('should have proper link structure', () => {
            const item = createMockItem()
            const { container } = renderWithRouter(<CollectionCard item={item} basePath='/test' />)
            const link = container.querySelector('a')
            expect(link).toHaveAttribute('href')
            expect(link).toHaveClass('cursor-pointer')
        })
    })

    describe('edge cases', () => {
        it('should handle empty description', () => {
            const item = createMockItem({ description: '' })
            const { queryByText } = renderWithRouter(
                <CollectionCard item={item} basePath='/test' variant='detailed' />
            )
            // MarkdownContent returns null for empty content, so nothing is rendered
            expect(queryByText('Test description for the item')).not.toBeInTheDocument()
        })

        it('should handle very long names', () => {
            const longName = 'A'.repeat(100)
            const item = createMockItem({ name: longName })
            const { getByText } = renderWithRouter(<CollectionCard item={item} basePath='/test' />)
            expect(getByText(longName)).toBeInTheDocument()
        })

        it('should handle all props together', () => {
            const item = createMockItem()
            const { getByText, getByRole, container } = renderWithRouter(
                <CollectionCard
                    item={item}
                    basePath='/categories'
                    count={42}
                    showFeaturedBadge
                    variant='detailed'
                    countLabel='resource'
                />
            )

            expect(getByText('Test Item')).toBeInTheDocument()
            expect(getByText('Test description for the item')).toBeInTheDocument()
            expect(getByText('Featured')).toBeInTheDocument()
            expect(getByText('42 resources')).toBeInTheDocument()
            expect(getByRole('heading')).toHaveTextContent('Test Item')

            const link = container.querySelector('a')
            expect(link?.getAttribute('href')).toBe('/categories/test-item')
        })
    })
})
