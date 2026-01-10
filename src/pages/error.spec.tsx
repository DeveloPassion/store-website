import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import ErrorPage from './error'

// Mock useRouteError hook
const mockUseRouteError = vi.fn()
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router')
    return {
        ...actual,
        useRouteError: () => mockUseRouteError()
    }
})

// Mock products data
vi.mock('@/data/products.json', () => ({
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
            status: 'active',
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
            status: 'active',
            priority: 90
        }
    ]
}))

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ErrorPage Component', () => {
    let originalTitle: string
    let originalEnv: string | undefined

    beforeEach(() => {
        // Store original values
        originalTitle = document.title
        originalEnv = process.env['NODE_ENV']

        // Create meta tags
        const metaTags = [
            { name: 'description', property: null },
            { name: null, property: 'og:title' },
            { name: null, property: 'og:description' },
            { name: null, property: 'og:url' },
            { name: null, property: 'og:image' }
        ]

        metaTags.forEach(({ name, property }) => {
            const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
            let meta = document.querySelector(selector)
            if (!meta) {
                meta = document.createElement('meta')
                if (name) meta.setAttribute('name', name)
                if (property) meta.setAttribute('property', property)
                document.head.appendChild(meta)
            }
        })

        // Reset mock
        mockUseRouteError.mockReturnValue(new Error('Test error message'))
    })

    afterEach(() => {
        // Restore original values
        document.title = originalTitle
        if (originalEnv !== undefined) {
            process.env['NODE_ENV'] = originalEnv
        }
        vi.clearAllMocks()
    })

    it('should render error heading', () => {
        renderWithRouter(<ErrorPage />)
        expect(screen.getByText('Oops! Something Went Wrong')).toBeInTheDocument()
    })

    it('should render error message', () => {
        renderWithRouter(<ErrorPage />)
        expect(screen.getByText(/We encountered an unexpected error/i)).toBeInTheDocument()
    })

    it('should display error details in development mode', () => {
        process.env['NODE_ENV'] = 'development'
        mockUseRouteError.mockReturnValue(new Error('Test error message'))

        renderWithRouter(<ErrorPage />)
        expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should not display error details in production mode', () => {
        process.env['NODE_ENV'] = 'production'
        mockUseRouteError.mockReturnValue(new Error('Test error message'))

        renderWithRouter(<ErrorPage />)
        expect(screen.queryByText('Test error message')).not.toBeInTheDocument()
    })

    it('should handle RouteErrorResponse', () => {
        // Create a proper RouteErrorResponse-like object with internal property
        const routeError = {
            status: 500,
            statusText: 'Internal Server Error',
            internal: true, // This property makes isRouteErrorResponse return true
            data: null
        }
        mockUseRouteError.mockReturnValue(routeError)

        process.env['NODE_ENV'] = 'development'
        renderWithRouter(<ErrorPage />)

        expect(screen.getByText('Internal Server Error')).toBeInTheDocument()
    })

    it('should handle Error instance', () => {
        const error = new Error('Something went wrong')
        mockUseRouteError.mockReturnValue(error)

        process.env['NODE_ENV'] = 'development'
        renderWithRouter(<ErrorPage />)

        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should handle unknown error type', () => {
        mockUseRouteError.mockReturnValue('Unknown error')

        process.env['NODE_ENV'] = 'development'
        renderWithRouter(<ErrorPage />)

        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })

    it('should render navigation links', () => {
        renderWithRouter(<ErrorPage />)

        const homeLinks = screen.getAllByRole('link', { name: /Go Home/i })
        expect(homeLinks.length).toBeGreaterThan(0)
        expect(homeLinks[0]).toHaveAttribute('href', '/')

        const productsLinks = screen.getAllByRole('link', { name: /All Products/i })
        expect(productsLinks.length).toBeGreaterThan(0)
        const topProductsLink = productsLinks.find((link) =>
            link.className.includes('border-primary/20')
        )
        expect(topProductsLink).toHaveAttribute('href', '/products')

        const helpLinks = screen.getAllByRole('link', { name: /Get Help/i })
        expect(helpLinks.length).toBeGreaterThan(0)
        expect(helpLinks[0]).toHaveAttribute('href', '/help')
    })

    it('should render popular destinations section', () => {
        renderWithRouter(<ErrorPage />)

        expect(screen.getByRole('heading', { name: /Popular Destinations/i })).toBeInTheDocument()

        // Check for card headings
        const headings = screen.getAllByRole('heading', { level: 3 })
        const headingTexts = headings.map((h) => h.textContent)
        expect(headingTexts).toContain('Featured Products')
        expect(headingTexts).toContain('Best Value')
        expect(headingTexts).toContain('Best Sellers')
        expect(headingTexts).toContain('All Products')
    })

    it('should render links to featured, best-value, and best-sellers pages', () => {
        renderWithRouter(<ErrorPage />)

        const links = screen.getAllByRole('link')

        const featuredLink = links.find((link) => link.getAttribute('href') === '/featured')
        expect(featuredLink).toBeInTheDocument()

        const bestValueLink = links.find((link) => link.getAttribute('href') === '/best-value')
        expect(bestValueLink).toBeInTheDocument()

        const bestSellersLink = links.find((link) => link.getAttribute('href') === '/best-sellers')
        expect(bestSellersLink).toBeInTheDocument()
    })

    it('should render featured products when available', () => {
        renderWithRouter(<ErrorPage />)

        expect(screen.getByText('Featured Product 1')).toBeInTheDocument()
        expect(screen.getByText('Featured Product 2')).toBeInTheDocument()
    })

    it('should limit featured products to 6', () => {
        renderWithRouter(<ErrorPage />)

        const productCards = screen.getAllByText(/Featured Product/i)
        expect(productCards.length).toBeLessThanOrEqual(6)
    })

    it('should set correct document title', () => {
        renderWithRouter(<ErrorPage />)
        expect(document.title).toBe('Error - Knowledge Forge')
    })

    it('should set correct meta description', () => {
        renderWithRouter(<ErrorPage />)
        const metaDesc = document.querySelector('meta[name="description"]')
        expect(metaDesc?.getAttribute('content')).toBe(
            'Something went wrong. Browse our featured products while we fix the issue.'
        )
    })

    it('should set correct og:title', () => {
        renderWithRouter(<ErrorPage />)
        const ogTitle = document.querySelector('meta[property="og:title"]')
        expect(ogTitle?.getAttribute('content')).toBe('Error - Knowledge Forge')
    })

    it('should set correct og:description', () => {
        renderWithRouter(<ErrorPage />)
        const ogDesc = document.querySelector('meta[property="og:description"]')
        expect(ogDesc?.getAttribute('content')).toBe(
            'Something went wrong. Browse our featured products while we fix the issue.'
        )
    })

    it('should set correct og:url', () => {
        renderWithRouter(<ErrorPage />)
        const ogUrl = document.querySelector('meta[property="og:url"]')
        expect(ogUrl?.getAttribute('content')).toBe('https://store.dsebastien.net/error')
    })

    it('should set correct og:image', () => {
        renderWithRouter(<ErrorPage />)
        const ogImage = document.querySelector('meta[property="og:image"]')
        expect(ogImage?.getAttribute('content')).toBe(
            'https://store.dsebastien.net/assets/images/social-card.png'
        )
    })

    it('should render bug icon', () => {
        const { container } = renderWithRouter(<ErrorPage />)
        const iconDiv = container.querySelector('.from-red-500.to-pink-500')
        expect(iconDiv).toBeInTheDocument()
    })

    it('should have proper responsive grid for featured products', () => {
        const { container } = renderWithRouter(<ErrorPage />)
        const grid = container.querySelector(
            '.grid.gap-6.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4'
        )
        expect(grid).toBeInTheDocument()
    })

    it('should render "View All Featured Products" link', () => {
        renderWithRouter(<ErrorPage />)
        const viewAllLink = screen.getByText('View All Featured Products →')
        expect(viewAllLink).toBeInTheDocument()
        expect(viewAllLink).toHaveAttribute('href', '/featured')
    })
})
