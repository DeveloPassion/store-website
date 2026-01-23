import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import QuickNavigation from './quick-navigation'

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('QuickNavigation Component', () => {
    it('should render default title', () => {
        const { getByText } = renderWithRouter(<QuickNavigation animated={false} />)
        expect(getByText('Explore Our Collections')).toBeInTheDocument()
    })

    it('should render default description', () => {
        const { getByText } = renderWithRouter(<QuickNavigation animated={false} />)
        expect(getByText('Discover the perfect products for your needs')).toBeInTheDocument()
    })

    it('should render custom title', () => {
        const { getByText } = renderWithRouter(
            <QuickNavigation title='Custom Title' animated={false} />
        )
        expect(getByText('Custom Title')).toBeInTheDocument()
    })

    it('should render custom description', () => {
        const { getByText } = renderWithRouter(
            <QuickNavigation description='Custom description' animated={false} />
        )
        expect(getByText('Custom description')).toBeInTheDocument()
    })

    it('should render all five navigation links', () => {
        const { getAllByRole } = renderWithRouter(<QuickNavigation animated={false} />)
        const links = getAllByRole('link')
        expect(links.length).toBe(5)
    })

    it('should render Take Quiz link', () => {
        const { getByText } = renderWithRouter(<QuickNavigation animated={false} />)
        const quizLink = getByText('💡 Take Quiz')
        expect(quizLink).toBeInTheDocument()
        expect(quizLink).toHaveAttribute('href', '/quiz')
    })

    it('should render Featured link', () => {
        const { getByText } = renderWithRouter(<QuickNavigation animated={false} />)
        const featuredLink = getByText('⭐ Featured')
        expect(featuredLink).toBeInTheDocument()
        expect(featuredLink).toHaveAttribute('href', '/featured')
    })

    it('should render Best Value link', () => {
        const { getByText } = renderWithRouter(<QuickNavigation animated={false} />)
        const bestValueLink = getByText('💎 Best Value')
        expect(bestValueLink).toBeInTheDocument()
        expect(bestValueLink).toHaveAttribute('href', '/best-value')
    })

    it('should render Best Sellers link', () => {
        const { getByText } = renderWithRouter(<QuickNavigation animated={false} />)
        const bestSellersLink = getByText('🔥 Best Sellers')
        expect(bestSellersLink).toBeInTheDocument()
        expect(bestSellersLink).toHaveAttribute('href', '/best-sellers')
    })

    it('should render All Products link', () => {
        const { getByText } = renderWithRouter(<QuickNavigation animated={false} />)
        const allProductsLink = getByText('🛍️ All Products')
        expect(allProductsLink).toBeInTheDocument()
        expect(allProductsLink).toHaveAttribute('href', '/products')
    })

    it('should apply correct styling classes to grid', () => {
        const { container } = renderWithRouter(<QuickNavigation animated={false} />)
        const grid = container.querySelector(
            '.grid.max-w-4xl.gap-4.sm\\:grid-cols-2.md\\:grid-cols-5'
        )
        expect(grid).toBeInTheDocument()
    })

    it('should apply hover styles to links', () => {
        const { getByText } = renderWithRouter(<QuickNavigation animated={false} />)
        // Quiz link has secondary background with hover
        const quizLink = getByText('💡 Take Quiz')
        expect(quizLink.className).toContain('hover:bg-secondary/90')
        expect(quizLink.className).toContain('hover:scale-105')
        // Other links have transparent background with hover
        const featuredLink = getByText('⭐ Featured')
        expect(featuredLink.className).toContain('hover:bg-primary/5')
        expect(featuredLink.className).toContain('hover:scale-105')
    })

    it('should render without animation when animated=false', () => {
        const { container } = renderWithRouter(<QuickNavigation animated={false} />)
        // Check that component renders without errors
        expect(container).toBeInTheDocument()
    })
})
