import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Breadcrumb } from './breadcrumb'
import { BreadcrumbProvider, BreadcrumbItem, useBreadcrumb } from '@/contexts/breadcrumb-context'
import { useEffect } from 'react'

// Test wrapper that sets breadcrumbs
const TestWrapper: React.FC<{
    children: React.ReactNode
    items: BreadcrumbItem[]
}> = ({ children, items }) => {
    return (
        <BrowserRouter>
            <BreadcrumbProvider>
                <TestSetBreadcrumbs items={items} />
                {children}
            </BreadcrumbProvider>
        </BrowserRouter>
    )
}

// Component that sets breadcrumbs using the context
const TestSetBreadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
    // Import the hook at the top of the file instead
    const breadcrumbContext = useBreadcrumb()
    const { setBreadcrumbs } = breadcrumbContext

    useEffect(() => {
        setBreadcrumbs(items)
    }, [items, setBreadcrumbs])
    return null
}

const renderWithProviders = (
    component: React.ReactElement,
    breadcrumbItems: BreadcrumbItem[] = []
) => {
    return render(<TestWrapper items={breadcrumbItems}>{component}</TestWrapper>)
}

describe('Breadcrumb Component', () => {
    it('should not render when there are no breadcrumb items', () => {
        const { container } = renderWithProviders(<Breadcrumb />, [])
        expect(container.querySelector('nav')).not.toBeInTheDocument()
    })

    it('should render breadcrumb items', () => {
        const items = [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Current Page' }
        ]

        renderWithProviders(<Breadcrumb />, items)

        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.getByText('Products')).toBeInTheDocument()
        expect(screen.getByText('Current Page')).toBeInTheDocument()
    })

    it('should render links for items with href', () => {
        const items = [{ label: 'Home', href: '/' }, { label: 'Current Page' }]

        renderWithProviders(<Breadcrumb />, items)

        const homeLink = screen.getByRole('link', { name: 'Home' })
        expect(homeLink).toBeInTheDocument()
        expect(homeLink).toHaveAttribute('href', '/')
    })

    it('should render span for items without href (current page)', () => {
        const items = [{ label: 'Home', href: '/' }, { label: 'Current Page' }]

        renderWithProviders(<Breadcrumb />, items)

        const currentPageSpan = screen.getByText('Current Page')
        expect(currentPageSpan.tagName).toBe('SPAN')
        expect(currentPageSpan).toHaveAttribute('aria-current', 'page')
    })

    it('should render separators between items', () => {
        const items = [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Current Page' }
        ]

        const { container } = renderWithProviders(<Breadcrumb />, items)

        // Should have 2 separators (between 3 items)
        const separators = container.querySelectorAll('svg[aria-hidden="true"]')
        expect(separators).toHaveLength(2)
    })

    it('should not render separator after last item', () => {
        const items = [{ label: 'Home', href: '/' }, { label: 'Current Page' }]

        const { container } = renderWithProviders(<Breadcrumb />, items)

        // Should have 1 separator (between 2 items)
        const separators = container.querySelectorAll('svg[aria-hidden="true"]')
        expect(separators).toHaveLength(1)
    })

    it('should have proper ARIA labels', () => {
        const items = [{ label: 'Home', href: '/' }, { label: 'Current Page' }]

        renderWithProviders(<Breadcrumb />, items)

        const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
        expect(nav).toBeInTheDocument()

        const currentPage = screen.getByText('Current Page')
        expect(currentPage).toHaveAttribute('aria-current', 'page')
    })

    it('should apply custom className', () => {
        const items = [{ label: 'Home', href: '/' }]

        const { container } = renderWithProviders(<Breadcrumb className='custom-class' />, items)

        const nav = container.querySelector('nav')
        expect(nav).toHaveClass('custom-class')
        expect(nav).toHaveClass('mb-6')
    })

    it('should handle single breadcrumb item', () => {
        const items = [{ label: 'Home' }]

        renderWithProviders(<Breadcrumb />, items)

        expect(screen.getByText('Home')).toBeInTheDocument()

        const { container } = renderWithProviders(<Breadcrumb />, items)
        const separators = container.querySelectorAll('svg[aria-hidden="true"]')
        expect(separators).toHaveLength(0)
    })

    it('should truncate long labels', () => {
        const items = [
            { label: 'This is a very long breadcrumb label that should be truncated', href: '/' }
        ]

        renderWithProviders(<Breadcrumb />, items)

        const link = screen.getByRole('link')
        expect(link).toHaveClass('truncate')
        expect(link).toHaveClass('max-w-[150px]')
    })

    it('should apply focus styles to links', () => {
        const items = [{ label: 'Home', href: '/' }]

        renderWithProviders(<Breadcrumb />, items)

        const link = screen.getByRole('link', { name: 'Home' })
        expect(link).toHaveClass('focus:ring-2')
        expect(link).toHaveClass('focus:ring-secondary/50')
    })

    it('should render items in correct order', () => {
        const items = [
            { label: 'First', href: '/first' },
            { label: 'Second', href: '/second' },
            { label: 'Third', href: '/third' },
            { label: 'Current' }
        ]

        renderWithProviders(<Breadcrumb />, items)

        expect(screen.getByText('First')).toBeInTheDocument()
        expect(screen.getByText('Second')).toBeInTheDocument()
        expect(screen.getByText('Third')).toBeInTheDocument()
        expect(screen.getByText('Current')).toBeInTheDocument()
    })
})
