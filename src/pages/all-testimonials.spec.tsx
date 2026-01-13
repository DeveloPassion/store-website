import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import AllTestimonialsPage from './all-testimonials'
import { BreadcrumbProvider } from '@/contexts/breadcrumb-context'

// Mock products data with testimonials
mock.module('@/data/products.json', () => ({
    default: [
        {
            id: 'product-1',
            name: 'Product One',
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
            testimonials: [
                {
                    id: 'testimonial-1',
                    author: 'John Doe',
                    rating: 5,
                    quote: 'Amazing product! Highly recommended.',
                    featured: true
                },
                {
                    id: 'testimonial-2',
                    author: 'Jane Smith',
                    rating: 5,
                    quote: 'Life-changing experience.',
                    featured: false,
                    role: 'Developer',
                    company: 'Tech Corp'
                }
            ],
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
            name: 'Product Two',
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
            testimonials: [
                {
                    id: 'testimonial-3',
                    author: 'Bob Johnson',
                    rating: 4,
                    quote: 'Great value for money.',
                    featured: true
                }
            ],
            faqs: [],
            targetAudience: [],
            perfectFor: [],
            notForYou: [],
            trustBadges: [],
            guarantees: [],
            crossSellIds: [],
            featured: false,
            bestseller: true,
            bestValue: false,
            priority: 90
        },
        {
            id: 'product-3',
            name: 'Product Three',
            tagline: 'Test tagline 3',
            price: 0,
            priceDisplay: 'FREE',
            priceTier: 'free',
            gumroadUrl: 'https://gumroad.com/test3',
            mainCategory: 'resources',
            secondaryCategories: [],
            tags: ['learning'],
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
            featured: false,
            bestseller: false,
            bestValue: false,
            priority: 50
        }
    ]
}))

const renderWithRouter = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <BreadcrumbProvider>{component}</BreadcrumbProvider>
        </BrowserRouter>
    )
}

describe('AllTestimonialsPage Component', () => {
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

    it('should render page heading', () => {
        const { getByText } = renderWithRouter(<AllTestimonialsPage />)
        expect(getByText('Customer Testimonials')).toBeInTheDocument()
    })

    it('should render page description', () => {
        const { getByText } = renderWithRouter(<AllTestimonialsPage />)
        expect(
            getByText(/Discover what our customers are saying about their experience/i)
        ).toBeInTheDocument()
    })

    it('should display correct total testimonials count', () => {
        const { getByText } = renderWithRouter(<AllTestimonialsPage />)
        // Product 1 has 2 testimonials, Product 2 has 1, Product 3 has 0 = 3 total
        expect(getByText('3')).toBeInTheDocument()
        expect(getByText('Total Testimonials')).toBeInTheDocument()
    })

    it('should display average rating', () => {
        const { getByText } = renderWithRouter(<AllTestimonialsPage />)
        // All testimonials: (5+5+4)/3 = 4.666... rounded to 4.7
        expect(getByText('4.7')).toBeInTheDocument()
        expect(getByText('Average Rating')).toBeInTheDocument()
    })

    it('should render testimonials from products', () => {
        const { getAllByText } = renderWithRouter(<AllTestimonialsPage />)
        // Each testimonial appears in both mobile (carousel) and desktop (grid) views
        expect(getAllByText('"Amazing product! Highly recommended."').length).toBeGreaterThan(0)
        expect(getAllByText('"Life-changing experience."').length).toBeGreaterThan(0)
        expect(getAllByText('"Great value for money."').length).toBeGreaterThan(0)
    })

    it('should render author names', () => {
        const { getAllByText } = renderWithRouter(<AllTestimonialsPage />)
        // Each author appears in both mobile and desktop views
        expect(getAllByText('John Doe').length).toBeGreaterThan(0)
        expect(getAllByText('Jane Smith').length).toBeGreaterThan(0)
        expect(getAllByText('Bob Johnson').length).toBeGreaterThan(0)
    })

    it('should not display products without testimonials', () => {
        const { queryByText } = renderWithRouter(<AllTestimonialsPage />)
        // Product Three has no testimonials, so its name should not appear in the testimonials list
        // Note: It might appear in navigation or other places, but not in the main content
        // Since we're checking for the product name heading in testimonials section, it should not be there
        // Just verify the page renders without errors when there are products with no testimonials
        expect(queryByText('Product Three')).not.toBeInTheDocument()
    })

    it('should set correct document title', () => {
        renderWithRouter(<AllTestimonialsPage />)
        expect(document.title).toBe('All Testimonials - Knowledge Forge')
    })

    it('should set correct meta description', () => {
        renderWithRouter(<AllTestimonialsPage />)
        const metaDesc = document.querySelector('meta[name="description"]')
        expect(metaDesc?.getAttribute('content')).toContain(
            'authentic testimonials from satisfied customers'
        )
    })

    it('should set correct og:title', () => {
        renderWithRouter(<AllTestimonialsPage />)
        const ogTitle = document.querySelector('meta[property="og:title"]')
        expect(ogTitle?.getAttribute('content')).toBe('All Testimonials - Knowledge Forge')
    })

    it('should set correct og:url', () => {
        renderWithRouter(<AllTestimonialsPage />)
        const ogUrl = document.querySelector('meta[property="og:url"]')
        expect(ogUrl?.getAttribute('content')).toContain('/testimonials')
    })

    it('should set correct og:image', () => {
        renderWithRouter(<AllTestimonialsPage />)
        const ogImage = document.querySelector('meta[property="og:image"]')
        expect(ogImage?.getAttribute('content')).toContain('social-card.png')
    })

    it('should render breadcrumb', () => {
        const { container } = renderWithRouter(<AllTestimonialsPage />)
        const breadcrumb = container.querySelector('nav[aria-label="Breadcrumb"]')
        expect(breadcrumb).toBeInTheDocument()
    })

    it('should render desktop grid layout on desktop', () => {
        const { container } = renderWithRouter(<AllTestimonialsPage />)
        const desktopGrid = container.querySelector('.hidden.md\\:block')
        expect(desktopGrid).toBeInTheDocument()
    })

    it('should render mobile carousel layout on mobile', () => {
        const { container } = renderWithRouter(<AllTestimonialsPage />)
        const mobileCarousel = container.querySelector('.md\\:hidden')
        expect(mobileCarousel).toBeInTheDocument()
    })

    it('should show stats section', () => {
        const { container } = renderWithRouter(<AllTestimonialsPage />)
        const statsSection = container.querySelector('.grid.gap-4.sm\\:grid-cols-2')
        expect(statsSection).toBeInTheDocument()
    })

    it('should handle empty testimonials gracefully', () => {
        // This test verifies that Product 3 with no testimonials doesn't break the page
        const { container } = renderWithRouter(<AllTestimonialsPage />)
        // Page should still render without errors
        expect(container).toBeInTheDocument()
    })
})
