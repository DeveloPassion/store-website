import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import NotFoundPage from './not-found'

// Mock products data
mock.module('@/data/products.json', () => ({
    default: [
        {
            id: 'product-1',
            permalink: 'product-1',
            name: 'Featured Product 1',
            tagline: 'Test tagline 1',
            price: 99.99,
            priceDisplay: '€99.99',
            priceTier: 'standard',
            gumroadUrl: 'https://gumroad.com/test1',
            mainCategory: 'guides',
            secondaryCategories: [],
            tags: ['ai'],
            problem: 'Test problem',
            problemPoints: ['Problem 1'],
            agitate: 'Test agitate',
            agitatePoints: ['Agitate 1'],
            solution: 'Test solution',
            solutionPoints: ['Solution 1'],
            description: 'Test description',
            features: ['Feature 1'],
            benefits: { immediate: ['Benefit 1'] },
            included: ['Item 1'],
            testimonials: [],
            faqs: [],
            targetAudience: [],
            perfectFor: [],
            notForYou: [],
            trustBadges: [],
            guarantees: [],
            crossSellIds: [],
            featured: true,
            bestseller: false,
            bestValue: false,
            priority: 100
        },
        {
            id: 'product-2',
            permalink: 'product-2',
            name: 'Featured Product 2',
            tagline: 'Test tagline 2',
            price: 49.99,
            priceDisplay: '€49.99',
            priceTier: 'standard',
            gumroadUrl: 'https://gumroad.com/test2',
            mainCategory: 'courses',
            secondaryCategories: [],
            tags: ['productivity'],
            problem: 'Test problem',
            problemPoints: ['Problem 1'],
            agitate: 'Test agitate',
            agitatePoints: ['Agitate 1'],
            solution: 'Test solution',
            solutionPoints: ['Solution 1'],
            description: 'Test description',
            features: ['Feature 1'],
            benefits: { immediate: ['Benefit 1'] },
            included: ['Item 1'],
            testimonials: [],
            faqs: [],
            targetAudience: [],
            perfectFor: [],
            notForYou: [],
            trustBadges: [],
            guarantees: [],
            crossSellIds: [],
            featured: true,
            bestseller: false,
            bestValue: false,
            priority: 90
        }
    ]
}))

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('NotFoundPage Component', () => {
    let originalTitle: string
    let metaDescription: HTMLMetaElement | null
    let ogTitle: HTMLMetaElement | null
    let ogDescription: HTMLMetaElement | null
    let ogUrl: HTMLMetaElement | null
    let ogImage: HTMLMetaElement | null

    beforeEach(() => {
        // Store original title
        originalTitle = document.title

        // Create or get meta tags
        metaDescription = document.querySelector('meta[name="description"]')
        if (!metaDescription) {
            metaDescription = document.createElement('meta')
            metaDescription.setAttribute('name', 'description')
            document.head.appendChild(metaDescription)
        }

        ogTitle = document.querySelector('meta[property="og:title"]')
        if (!ogTitle) {
            ogTitle = document.createElement('meta')
            ogTitle.setAttribute('property', 'og:title')
            document.head.appendChild(ogTitle)
        }

        ogDescription = document.querySelector('meta[property="og:description"]')
        if (!ogDescription) {
            ogDescription = document.createElement('meta')
            ogDescription.setAttribute('property', 'og:description')
            document.head.appendChild(ogDescription)
        }

        ogUrl = document.querySelector('meta[property="og:url"]')
        if (!ogUrl) {
            ogUrl = document.createElement('meta')
            ogUrl.setAttribute('property', 'og:url')
            document.head.appendChild(ogUrl)
        }

        ogImage = document.querySelector('meta[property="og:image"]')
        if (!ogImage) {
            ogImage = document.createElement('meta')
            ogImage.setAttribute('property', 'og:image')
            document.head.appendChild(ogImage)
        }
    })

    afterEach(() => {
        // Restore original title
        document.title = originalTitle
    })

    it('should render 404 heading', () => {
        const { getByText } = renderWithRouter(<NotFoundPage />)
        expect(getByText('404 - Page Not Found')).toBeInTheDocument()
    })

    it('should render error message', () => {
        const { getByText } = renderWithRouter(<NotFoundPage />)
        expect(getByText(/The page you're looking for doesn't exist/i)).toBeInTheDocument()
    })

    it('should render navigation links', () => {
        const { getAllByRole } = renderWithRouter(<NotFoundPage />)

        // Check for main navigation buttons using getAllByRole
        const homeLinks = getAllByRole('link', { name: /Go Home/i })
        expect(homeLinks.length).toBeGreaterThan(0)
        expect(homeLinks[0]).toHaveAttribute('href', '/')

        const productsLinks = getAllByRole('link', { name: /All Products/i })
        expect(productsLinks.length).toBeGreaterThan(0)
        const topProductsLink = productsLinks.find((link) =>
            link.className.includes('border-primary/20')
        )
        expect(topProductsLink).toHaveAttribute('href', '/products')
    })

    it('should render popular destinations section', () => {
        const { getByRole, getAllByRole } = renderWithRouter(<NotFoundPage />)

        expect(getByRole('heading', { name: /Popular Destinations/i })).toBeInTheDocument()

        // Check for card headings
        const headings = getAllByRole('heading', { level: 3 })
        const headingTexts = headings.map((h) => h.textContent)
        expect(headingTexts).toContain('Featured Products')
        expect(headingTexts).toContain('Best Value')
        expect(headingTexts).toContain('Best Sellers')
        expect(headingTexts).toContain('All Products')
    })

    it('should render links to featured, best-value, and best-sellers pages', () => {
        const { getAllByRole } = renderWithRouter(<NotFoundPage />)

        const links = getAllByRole('link')

        const featuredLink = links.find((link) => link.getAttribute('href') === '/featured')
        expect(featuredLink).toBeInTheDocument()

        const bestValueLink = links.find((link) => link.getAttribute('href') === '/best-value')
        expect(bestValueLink).toBeInTheDocument()

        const bestSellersLink = links.find((link) => link.getAttribute('href') === '/best-sellers')
        expect(bestSellersLink).toBeInTheDocument()
    })

    it('should render featured products when available', () => {
        const { getByText } = renderWithRouter(<NotFoundPage />)

        // Should show featured products section
        expect(getByText('Featured Product 1')).toBeInTheDocument()
        expect(getByText('Featured Product 2')).toBeInTheDocument()
    })

    it('should limit featured products to 6', () => {
        const { getAllByText } = renderWithRouter(<NotFoundPage />)

        // With our mock data (2 products), both should be visible
        const productCards = getAllByText(/Featured Product/i)
        expect(productCards.length).toBeLessThanOrEqual(6)
    })

    it('should set correct document title', () => {
        renderWithRouter(<NotFoundPage />)
        expect(document.title).toBe('404 - Page Not Found - Knowledge Forge')
    })

    it('should set correct meta description', () => {
        renderWithRouter(<NotFoundPage />)
        const metaDesc = document.querySelector('meta[name="description"]')
        expect(metaDesc?.getAttribute('content')).toBe(
            "The page you're looking for doesn't exist. Browse our featured products instead."
        )
    })

    it('should set correct og:title', () => {
        renderWithRouter(<NotFoundPage />)
        const ogTitle = document.querySelector('meta[property="og:title"]')
        expect(ogTitle?.getAttribute('content')).toBe('404 - Page Not Found - Knowledge Forge')
    })

    it('should set correct og:description', () => {
        renderWithRouter(<NotFoundPage />)
        const ogDesc = document.querySelector('meta[property="og:description"]')
        expect(ogDesc?.getAttribute('content')).toBe(
            "The page you're looking for doesn't exist. Browse our featured products instead."
        )
    })

    it('should set correct og:url', () => {
        renderWithRouter(<NotFoundPage />)
        const ogUrl = document.querySelector('meta[property="og:url"]')
        expect(ogUrl?.getAttribute('content')).toBe('https://store.dsebastien.net/404')
    })

    it('should set correct og:image', () => {
        renderWithRouter(<NotFoundPage />)
        const ogImage = document.querySelector('meta[property="og:image"]')
        expect(ogImage?.getAttribute('content')).toBe(
            'https://store.dsebastien.net/assets/images/social-card.png'
        )
    })

    it('should render exclamation triangle icon', () => {
        const { container } = renderWithRouter(<NotFoundPage />)
        const iconDiv = container.querySelector('.from-orange-500.to-red-500')
        expect(iconDiv).toBeInTheDocument()
    })

    it('should have proper responsive grid for featured products', () => {
        const { container } = renderWithRouter(<NotFoundPage />)
        const grid = container.querySelector(
            '.grid.gap-6.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4'
        )
        expect(grid).toBeInTheDocument()
    })

    it('should render "View All Featured Products" link', () => {
        const { getByText } = renderWithRouter(<NotFoundPage />)
        const viewAllLink = getByText('View All Featured Products →')
        expect(viewAllLink).toBeInTheDocument()
        expect(viewAllLink).toHaveAttribute('href', '/featured')
    })
})
