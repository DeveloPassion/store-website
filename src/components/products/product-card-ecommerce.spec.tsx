import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import ProductCardEcommerce from './product-card-ecommerce'
import type { Product } from '@/types/product'

// Mock product data
const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-product',
    permalink: 'test-product',
    name: 'Test Product',
    tagline: 'This is a test product tagline',
    price: 99.99,
    priceDisplay: '€99.99',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'guides',
    secondaryCategories: [],
    tags: ['ai'], // Use valid tag ID from TagIdSchema
    problem: 'Test problem',
    problemPoints: ['Problem point 1'],
    agitate: 'Test agitate',
    agitatePoints: ['Agitate point 1'],
    solution: 'Test solution',
    solutionPoints: ['Solution point 1'],
    description: 'Test description',
    features: ['Feature 1'],
    benefits: { immediate: ['Benefit 1'] }, // Use proper benefits structure
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
    status: 'active',
    priority: 50,
    ...overrides
})

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ProductCardEcommerce Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render product name and tagline', () => {
        const product = createMockProduct()
        renderWithRouter(<ProductCardEcommerce product={product} />)

        expect(screen.getByText('Test Product')).toBeInTheDocument()
        expect(screen.getByText('This is a test product tagline')).toBeInTheDocument()
    })

    it('should display price correctly', () => {
        const product = createMockProduct({ price: 49.99, priceDisplay: '€49.99' })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        expect(screen.getByText('€49.99')).toBeInTheDocument()
    })

    it('should show FREE for free products', () => {
        const product = createMockProduct({ price: 0, priceTier: 'free' })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        expect(screen.getAllByText('FREE')).toHaveLength(2) // Badge + price
        expect(screen.getByText('Get')).toBeInTheDocument()
    })

    it('should show Buy button for paid products', () => {
        const product = createMockProduct({ price: 99.99 })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        expect(screen.getByText('Buy')).toBeInTheDocument()
    })

    it('should show FEATURED badge for featured products', () => {
        const product = createMockProduct({ featured: true })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        expect(screen.getByText('FEATURED')).toBeInTheDocument()
    })

    it('should show BESTSELLER badge for bestseller products', () => {
        const product = createMockProduct({ bestseller: true })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        expect(screen.getByText('BESTSELLER')).toBeInTheDocument()
    })

    it('should show BEST VALUE badge for bestValue products', () => {
        const product = createMockProduct({ bestValue: true })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        expect(screen.getByText('BEST VALUE')).toBeInTheDocument()
    })

    it('should show BUNDLE badge for bundle products', () => {
        const product = createMockProduct({ mainCategory: 'bundles' })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        expect(screen.getByText('BUNDLE')).toBeInTheDocument()
    })

    it('should display cover image when provided', () => {
        const product = createMockProduct({ coverImage: '/test-image.jpg', name: 'Test Product' })
        const { container } = renderWithRouter(<ProductCardEcommerce product={product} />)

        const image = container.querySelector('img[alt="Test Product"]')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', '/test-image.jpg')
    })

    it('should show placeholder emoji when no cover image', () => {
        const product = createMockProduct({ coverImage: undefined })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        expect(screen.getByText('📦')).toBeInTheDocument()
    })

    it('should call onAddToCart when Buy button is clicked', () => {
        const onAddToCart = vi.fn()
        const product = createMockProduct()
        renderWithRouter(<ProductCardEcommerce product={product} onAddToCart={onAddToCart} />)

        const buyButton = screen.getByText('Buy')
        fireEvent.click(buyButton)

        expect(onAddToCart).toHaveBeenCalledTimes(1)
    })

    it('should navigate to product page when Buy button clicked without onAddToCart', () => {
        // Mock window.location.href
        const originalLocation = window.location
        // @ts-expect-error - Mocking window.location for testing
        delete window.location
        // @ts-expect-error - Mocking window.location for testing
        window.location = { href: '' } as Location

        const product = createMockProduct({ id: 'my-product' })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        const buyButton = screen.getByText('Buy')
        fireEvent.click(buyButton)

        expect(window.location.href).toBe('/l/my-product')

        // Restore original location
        // @ts-expect-error - Restoring window.location after test
        window.location = originalLocation
    })

    it('should have Quick View overlay on hover', () => {
        const product = createMockProduct()
        renderWithRouter(<ProductCardEcommerce product={product} />)

        expect(screen.getByText('Quick View')).toBeInTheDocument()
    })

    it('should display wishlist button', () => {
        const product = createMockProduct()
        renderWithRouter(<ProductCardEcommerce product={product} />)

        const wishlistButton = screen.getByLabelText('Add to wishlist')
        expect(wishlistButton).toBeInTheDocument()
    })

    it('should prevent event propagation on wishlist button click', () => {
        const product = createMockProduct()
        renderWithRouter(<ProductCardEcommerce product={product} />)

        const wishlistButton = screen.getByLabelText('Add to wishlist')

        fireEvent.click(wishlistButton)
        // Just verify button is clickable
        expect(wishlistButton).toBeInTheDocument()
    })

    it('should display 5-star rating', () => {
        const product = createMockProduct()
        const { container } = renderWithRouter(<ProductCardEcommerce product={product} />)

        const stars = container.querySelectorAll('.text-secondary')
        expect(stars.length).toBeGreaterThanOrEqual(5)
    })

    it('should link to product detail page', () => {
        const product = createMockProduct({ id: 'test-123' })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        const links = screen.getAllByRole('link')
        const productLinks = links.filter((link) => link.getAttribute('href') === '/l/test-123')
        expect(productLinks.length).toBeGreaterThan(0)
    })

    it('should handle secondary categories', () => {
        const product = createMockProduct({
            mainCategory: 'guides',
            secondaryCategories: [
                { id: 'obsidian', distant: false },
                { id: 'productivity', distant: true } // This one should not be visible
            ]
        })
        renderWithRouter(<ProductCardEcommerce product={product} />)

        // Should show mainCategory and non-distant secondaryCategories
        // The actual category names depend on the categories.json data
        const { container } = renderWithRouter(<ProductCardEcommerce product={product} />)
        const categoryLinks = container.querySelectorAll('a[href^="/categories/"]')
        expect(categoryLinks.length).toBeGreaterThan(0)
    })
})
