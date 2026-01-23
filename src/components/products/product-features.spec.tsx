import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { render, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import ProductFeatures from './product-features'
import type { Product, ProductVariant } from '@/schemas/product.schema'

// Mock framer-motion
mock.module('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
            const {
                initial: _initial,
                whileInView: _whileInView,
                viewport: _viewport,
                animate: _animate,
                exit: _exit,
                transition: _transition,
                variants: _variants,
                ...domProps
            } = props as Record<string, unknown>
            void [_initial, _whileInView, _viewport, _animate, _exit, _transition, _variants]
            return <div {...domProps}>{children}</div>
        }
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// Mock products data
mock.module('@/data/products.json', () => ({
    default: [
        {
            id: 'included-product-1',
            name: 'Included Product 1',
            price: 49.99,
            priceDisplay: '€49.99',
            mainCategory: 'guides',
            includedProducts: [],
            variants: null,
            salesCopy: { tagline: 'Tagline for product 1' }
        },
        {
            id: 'included-product-2',
            name: 'Included Product 2',
            price: 29.99,
            priceDisplay: '€29.99',
            mainCategory: 'courses',
            includedProducts: [],
            variants: null,
            salesCopy: { tagline: 'Tagline for product 2' }
        },
        {
            id: 'nested-product',
            name: 'Nested Product',
            price: 19.99,
            priceDisplay: '€19.99',
            mainCategory: 'guides',
            includedProducts: [],
            variants: null,
            salesCopy: { tagline: 'Nested tagline' }
        },
        {
            id: 'bundle-product',
            name: 'Bundle Product',
            price: 99.99,
            priceDisplay: '€99.99',
            mainCategory: 'bundles',
            includedProducts: ['nested-product'],
            variants: null,
            salesCopy: { tagline: 'Bundle tagline' }
        }
    ]
}))

// Mock categories data
mock.module('@/data/categories.json', () => ({
    default: [
        { id: 'guides', name: 'Guides', icon: '📚' },
        { id: 'courses', name: 'Courses', icon: '🎓' },
        { id: 'bundles', name: 'Bundles', icon: '📦' }
    ]
}))

const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-product',
    name: 'Test Product',
    gumroadId: null,
    isGumroadProduct: false,
    gumroadProductSlugs: null,
    price: 99.99,
    priceDisplay: '€99.99',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'guides',
    secondaryCategories: [],
    tags: ['ai'],
    contents: ['Content item 1', 'Content item 2'],
    testimonials: [],
    faqs: [],
    featured: false,
    bestseller: false,
    bestValue: false,
    priority: 50,
    crossSellIds: [],
    targetExperienceLevel: null,
    deliveryStyle: null,
    media: [],
    landingPageUrl: null,
    dsebastienUrl: null,
    stats: null,
    variants: null,
    isSubscription: false,
    paymentFrequencies: null,
    defaultPaymentFrequency: null,
    activeSalesCopyId: 'default',
    ratingsCount: null,
    averageRating: null,
    testimonialsCount: 0,
    includedProducts: [],
    includedIn: [],
    salesCopy: {
        tagline: 'Test tagline',
        secondaryTagline: null,
        problem: 'Test problem',
        problemPoints: ['Problem point 1'],
        agitate: 'Test agitate',
        agitatePoints: ['Agitate point 1'],
        solution: 'Test solution',
        solutionPoints: ['Solution point 1'],
        description: 'Test description for the product',
        highlights: ['Highlight 1', 'Highlight 2'],
        benefits: { immediate: ['Benefit 1'], systematic: [], longTerm: [] },
        targetAudience: [],
        perfectFor: ['Perfect for item 1', 'Perfect for item 2'],
        notForYou: ['Not for you item 1'],
        trustBadges: [],
        guarantees: [],
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        storytelling: null,
        timeline: null,
        courseContent: null,
        howItWorks: null,
        mediaSections: null
    },
    ...overrides
})

const createMockVariant = (overrides: Partial<ProductVariant> = {}): ProductVariant => ({
    name: 'Basic',
    price: 49,
    priceDisplay: '€49',
    description: 'Basic package',
    gumroadUrl: 'https://gumroad.com/test-basic',
    gumroadVariantId: 'basic',
    paymentFrequency: null,
    prices: null,
    includedProducts: [],
    ...overrides
})

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ProductFeatures Component', () => {
    beforeEach(() => {})

    describe("What's Included Section", () => {
        it('should render section header with title', () => {
            const product = createMockProduct()
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText("What's Included")).toBeInTheDocument()
        })

        it('should render product description in section header', () => {
            const product = createMockProduct()
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText('Test description for the product')).toBeInTheDocument()
        })

        it('should render all content items', () => {
            const product = createMockProduct({
                contents: ['**First content** item', 'Second content item', 'Third content item']
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText(/First content/)).toBeInTheDocument()
            expect(getByText('Second content item')).toBeInTheDocument()
            expect(getByText('Third content item')).toBeInTheDocument()
        })

        it('should render icons for each content item', () => {
            const product = createMockProduct({
                contents: ['Item 1', 'Item 2']
            })
            const { container } = renderWithRouter(<ProductFeatures product={product} />)

            // Each content item should have an icon
            const iconContainers = container.querySelectorAll('.bg-secondary\\/10')
            expect(iconContainers.length).toBe(2)
        })

        it('should handle empty contents gracefully', () => {
            const product = createMockProduct({ contents: [] })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            // Section should still render with header
            expect(getByText("What's Included")).toBeInTheDocument()
        })
    })

    describe('Bonuses Section (Included Products)', () => {
        it('should not render bonuses section when no included products', () => {
            const product = createMockProduct({ includedProducts: [] })
            const { queryByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(queryByText('🎁 Bonuses')).not.toBeInTheDocument()
        })

        it('should render bonuses section when product has included products', () => {
            const product = createMockProduct({
                includedProducts: ['included-product-1']
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText('🎁 Bonuses')).toBeInTheDocument()
        })

        it('should show correct count in drawer toggle button', () => {
            const product = createMockProduct({
                includedProducts: ['included-product-1', 'included-product-2']
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText(/2 Additional Products Included/)).toBeInTheDocument()
        })

        it('should use singular form for single product', () => {
            const product = createMockProduct({
                includedProducts: ['included-product-1']
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText(/1 Additional Product Included/)).toBeInTheDocument()
        })

        it('should show tap to see everything message', () => {
            const product = createMockProduct({
                includedProducts: ['included-product-1']
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText('Tap to see everything included')).toBeInTheDocument()
        })

        it('should toggle drawer open and closed', () => {
            const product = createMockProduct({
                includedProducts: ['included-product-1']
            })
            const { getByText, queryByText } = renderWithRouter(
                <ProductFeatures product={product} />
            )

            // Initially closed - included product should not be visible
            expect(queryByText('Included Product 1')).not.toBeInTheDocument()

            // Click to open
            const toggleButton = getByText(/1 Additional Product Included/)
            fireEvent.click(toggleButton)

            // Now the included product should be visible
            expect(getByText('Included Product 1')).toBeInTheDocument()

            // Click to close
            fireEvent.click(toggleButton)

            // Product should be hidden again
            expect(queryByText('Included Product 1')).not.toBeInTheDocument()
        })

        it('should display included product information correctly', () => {
            const product = createMockProduct({
                includedProducts: ['included-product-1']
            })
            const { getByText, getByRole } = renderWithRouter(<ProductFeatures product={product} />)

            // Open the drawer
            fireEvent.click(getByText(/1 Additional Product Included/))

            expect(getByText('Included Product 1')).toBeInTheDocument()
            expect(getByText('Tagline for product 1')).toBeInTheDocument()
            expect(getByText('€49.99')).toBeInTheDocument()

            // Check link to product page
            const productLink = getByRole('link', { name: /Included Product 1/ })
            expect(productLink).toHaveAttribute('href', '/product/included-product-1')
            expect(productLink).toHaveAttribute('target', '_blank')
        })

        it('should calculate and display total bonus value', () => {
            const product = createMockProduct({
                includedProducts: ['included-product-1', 'included-product-2']
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            // Total value: 49.99 + 29.99 = 79.98, displayed as €80+
            expect(getByText(/Total Value: €80\+/)).toBeInTheDocument()
        })

        it('should handle nested included products (bundles including other bundles)', () => {
            const product = createMockProduct({
                includedProducts: ['bundle-product']
            })
            const { getByText, queryByText } = renderWithRouter(
                <ProductFeatures product={product} />
            )

            // Open the drawer
            fireEvent.click(getByText(/Additional Product/))

            // Should show the bundle and the nested product
            expect(getByText('Bundle Product')).toBeInTheDocument()
            expect(getByText('Nested Product')).toBeInTheDocument()
            // Should not have duplicates
            expect(queryByText('Bundle Product')).toBeInTheDocument()
        })
    })

    describe('Variant Selector', () => {
        it('should not show variant selector when product has no variants', () => {
            const product = createMockProduct({ variants: null })
            const { queryByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(queryByText('Select Your Tier:')).not.toBeInTheDocument()
        })

        it('should not show variant selector for single variant', () => {
            const product = createMockProduct({
                variants: [createMockVariant()],
                includedProducts: ['included-product-1']
            })
            const { queryByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(queryByText('Select Your Tier:')).not.toBeInTheDocument()
        })

        it('should show variant selector for multiple variants with included products', () => {
            const variant1 = createMockVariant({
                name: 'Basic',
                gumroadVariantId: 'basic',
                includedProducts: []
            })
            const variant2 = createMockVariant({
                name: 'Pro',
                gumroadVariantId: 'pro',
                includedProducts: ['included-product-2']
            })
            const product = createMockProduct({
                includedProducts: ['included-product-1'],
                variants: [variant1, variant2]
            })
            const setSelectedVariant = mock(() => {})
            const { getByText } = renderWithRouter(
                <ProductFeatures
                    product={product}
                    selectedVariant={variant1}
                    setSelectedVariant={setSelectedVariant}
                />
            )

            expect(getByText('Select Your Tier:')).toBeInTheDocument()
            expect(getByText('Basic')).toBeInTheDocument()
            expect(getByText('Pro')).toBeInTheDocument()
        })

        it('should show Plan label for subscription products', () => {
            const variant1 = createMockVariant({
                name: 'Monthly',
                gumroadVariantId: 'monthly',
                includedProducts: []
            })
            const variant2 = createMockVariant({
                name: 'Yearly',
                gumroadVariantId: 'yearly',
                includedProducts: ['included-product-2']
            })
            const product = createMockProduct({
                isSubscription: true,
                includedProducts: ['included-product-1'],
                variants: [variant1, variant2]
            })
            const setSelectedVariant = mock(() => {})
            const { getByText } = renderWithRouter(
                <ProductFeatures
                    product={product}
                    selectedVariant={variant1}
                    setSelectedVariant={setSelectedVariant}
                />
            )

            expect(getByText('Select Your Plan:')).toBeInTheDocument()
        })

        it('should call setSelectedVariant when variant is clicked', () => {
            const setSelectedVariant = mock(() => {})
            const variant1 = createMockVariant({ name: 'Basic', gumroadVariantId: 'basic' })
            const variant2 = createMockVariant({
                name: 'Pro',
                gumroadVariantId: 'pro',
                includedProducts: ['included-product-2']
            })
            const product = createMockProduct({
                includedProducts: ['included-product-1'],
                variants: [variant1, variant2]
            })

            const { getByText } = renderWithRouter(
                <ProductFeatures
                    product={product}
                    selectedVariant={variant1}
                    setSelectedVariant={setSelectedVariant}
                />
            )

            fireEvent.click(getByText('Pro'))

            expect(setSelectedVariant).toHaveBeenCalledWith(variant2)
        })

        it('should display variant prices in selector', () => {
            const variant1 = createMockVariant({
                name: 'Basic',
                priceDisplay: '€29',
                gumroadVariantId: 'basic',
                includedProducts: []
            })
            const variant2 = createMockVariant({
                name: 'Pro',
                priceDisplay: '€59',
                gumroadVariantId: 'pro',
                includedProducts: ['included-product-2']
            })
            const product = createMockProduct({
                includedProducts: ['included-product-1'],
                variants: [variant1, variant2]
            })
            const setSelectedVariant = mock(() => {})
            const { getByText } = renderWithRouter(
                <ProductFeatures
                    product={product}
                    selectedVariant={variant1}
                    setSelectedVariant={setSelectedVariant}
                />
            )

            expect(getByText('€29')).toBeInTheDocument()
            expect(getByText('€59')).toBeInTheDocument()
        })

        it('should show locked/unlocked icons for variant-specific products', () => {
            const variant1 = createMockVariant({
                name: 'Basic',
                gumroadVariantId: 'basic',
                includedProducts: []
            })
            const variant2 = createMockVariant({
                name: 'Pro',
                gumroadVariantId: 'pro',
                includedProducts: ['included-product-2']
            })
            const product = createMockProduct({
                includedProducts: ['included-product-1'],
                variants: [variant1, variant2]
            })

            const setSelectedVariant = mock(() => {})
            const { getByText } = renderWithRouter(
                <ProductFeatures
                    product={product}
                    selectedVariant={variant1}
                    setSelectedVariant={setSelectedVariant}
                />
            )

            // Open drawer
            fireEvent.click(getByText(/Additional Product/))

            // Check for Always Included section
            expect(getByText('Always Included')).toBeInTheDocument()

            // Check for Pro Bonuses section (locked for Basic tier)
            expect(getByText('Pro Bonuses')).toBeInTheDocument()

            // Check that both products are rendered
            expect(getByText('Included Product 1')).toBeInTheDocument()
            expect(getByText('Included Product 2')).toBeInTheDocument()
        })
    })

    describe('Highlights Section', () => {
        it('should render highlights section when highlights exist', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    highlights: ['Highlight 1', 'Highlight 2']
                }
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText('Why Choose This')).toBeInTheDocument()
        })

        it('should render all highlight items', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    highlights: ['**Feature A**: Description A', '**Feature B**: Description B']
                }
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText(/Feature A/)).toBeInTheDocument()
            expect(getByText(/Feature B/)).toBeInTheDocument()
        })

        it('should not render highlights section when highlights are empty', () => {
            const product = createMockProduct({
                salesCopy: { ...createMockProduct().salesCopy, highlights: [] }
            })
            const { queryByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(queryByText('Why Choose This')).not.toBeInTheDocument()
        })

        it('should render check icons for each highlight', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    highlights: ['Highlight 1', 'Highlight 2']
                }
            })
            const { container } = renderWithRouter(<ProductFeatures product={product} />)

            // Highlights section has check icons (FaCheckCircle)
            const highlightGrid = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2')
            expect(highlightGrid).toBeInTheDocument()
        })
    })

    describe('Target Audience Section', () => {
        it('should render Perfect For section when perfectFor exists', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    perfectFor: ['Developers', 'Designers']
                }
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText('Perfect For You If:')).toBeInTheDocument()
            expect(getByText('Developers')).toBeInTheDocument()
            expect(getByText('Designers')).toBeInTheDocument()
        })

        it('should render Not For You section when notForYou exists', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    notForYou: ['Beginners', 'People who dislike learning']
                }
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText('Not For You If:')).toBeInTheDocument()
            expect(getByText('Beginners')).toBeInTheDocument()
            expect(getByText('People who dislike learning')).toBeInTheDocument()
        })

        it('should render both sections when both exist', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    perfectFor: ['Item 1'],
                    notForYou: ['Item 2']
                }
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(getByText('Perfect For You If:')).toBeInTheDocument()
            expect(getByText('Not For You If:')).toBeInTheDocument()
        })

        it('should not render target audience section when both are empty', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    perfectFor: [],
                    notForYou: []
                }
            })
            const { queryByText } = renderWithRouter(<ProductFeatures product={product} />)

            expect(queryByText('Perfect For You If:')).not.toBeInTheDocument()
            expect(queryByText('Not For You If:')).not.toBeInTheDocument()
        })

        it('should only render Perfect For when notForYou is empty', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    perfectFor: ['Developers'],
                    notForYou: []
                }
            })
            const { getByText, queryByText } = renderWithRouter(
                <ProductFeatures product={product} />
            )

            expect(getByText('Perfect For You If:')).toBeInTheDocument()
            expect(queryByText('Not For You If:')).not.toBeInTheDocument()
        })

        it('should only render Not For You when perfectFor is empty', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy,
                    perfectFor: [],
                    notForYou: ['Beginners']
                }
            })
            const { queryByText, getByText } = renderWithRouter(
                <ProductFeatures product={product} />
            )

            expect(queryByText('Perfect For You If:')).not.toBeInTheDocument()
            expect(getByText('Not For You If:')).toBeInTheDocument()
        })
    })

    describe('Styling and Layout', () => {
        it('should have proper section styling', () => {
            const product = createMockProduct()
            const { container } = renderWithRouter(<ProductFeatures product={product} />)

            const section = container.querySelector('section')
            expect(section).toHaveClass('border-t')
        })

        it('should have responsive grid for contents', () => {
            const product = createMockProduct({
                contents: ['Item 1', 'Item 2', 'Item 3']
            })
            const { container } = renderWithRouter(<ProductFeatures product={product} />)

            const grid = container.querySelector('.grid.gap-6.sm\\:grid-cols-2.lg\\:grid-cols-3')
            expect(grid).toBeInTheDocument()
        })

        it('should have max width container', () => {
            const product = createMockProduct()
            const { container } = renderWithRouter(<ProductFeatures product={product} />)

            const maxWidthContainer = container.querySelector('.max-w-6xl')
            expect(maxWidthContainer).toBeInTheDocument()
        })
    })

    describe('Edge Cases', () => {
        it('should handle product with null salesCopy gracefully', () => {
            const product = createMockProduct()
            // Force salesCopy to undefined to test edge case
            const productWithNoSalesCopy = {
                ...product,
                salesCopy: undefined
            } as unknown as Product
            const { getByText } = renderWithRouter(
                <ProductFeatures product={productWithNoSalesCopy} />
            )

            // Should still render the section header
            expect(getByText("What's Included")).toBeInTheDocument()
        })

        it('should handle product with missing included products in map', () => {
            const product = createMockProduct({
                includedProducts: ['non-existent-product']
            })
            const { getByText, queryByText } = renderWithRouter(
                <ProductFeatures product={product} />
            )

            // Open drawer
            fireEvent.click(getByText(/Additional Product/))

            // Non-existent product should be filtered out
            expect(queryByText('non-existent-product')).not.toBeInTheDocument()
        })

        it('should prevent self-reference in included products', () => {
            const product = createMockProduct({
                id: 'included-product-1',
                name: 'Self Product',
                includedProducts: ['included-product-1', 'included-product-2']
            })
            const { getByText } = renderWithRouter(<ProductFeatures product={product} />)

            // Open drawer - only 1 product should be counted (self-reference filtered)
            fireEvent.click(getByText(/1 Additional Product Included/))

            // Should only show included-product-2, not self-reference
            expect(getByText('Included Product 2')).toBeInTheDocument()
        })

        it('should handle variant with no gumroadVariantId', () => {
            const variant1 = createMockVariant({
                name: 'Basic',
                gumroadVariantId: null,
                includedProducts: []
            })
            const variant2 = createMockVariant({
                name: 'Pro',
                gumroadVariantId: null,
                includedProducts: ['included-product-2']
            })
            const product = createMockProduct({
                includedProducts: ['included-product-1'],
                variants: [variant1, variant2]
            })

            const setSelectedVariant = mock(() => {})
            const { getByText } = renderWithRouter(
                <ProductFeatures
                    product={product}
                    selectedVariant={variant1}
                    setSelectedVariant={setSelectedVariant}
                />
            )

            // Should still render variant selector
            expect(getByText('Select Your Tier:')).toBeInTheDocument()
            expect(getByText('Basic')).toBeInTheDocument()
            expect(getByText('Pro')).toBeInTheDocument()
        })
    })

    describe('IncludedProductCard', () => {
        it('should render product link with correct attributes', () => {
            const product = createMockProduct({
                includedProducts: ['included-product-1']
            })
            const { getByText, getByRole } = renderWithRouter(<ProductFeatures product={product} />)

            // Open drawer
            fireEvent.click(getByText(/Additional Product/))

            const productLink = getByRole('link', { name: /Included Product 1/ })
            expect(productLink).toHaveAttribute('href', '/product/included-product-1')
            expect(productLink).toHaveAttribute('target', '_blank')
            expect(productLink).toHaveAttribute('rel', 'noopener noreferrer')
        })

        it('should show external link icon', () => {
            const product = createMockProduct({
                includedProducts: ['included-product-1']
            })
            const { getByText, container } = renderWithRouter(<ProductFeatures product={product} />)

            // Open drawer
            fireEvent.click(getByText(/Additional Product/))

            // FaExternalLinkAlt icon should be present
            const externalIcons = container.querySelectorAll('svg')
            expect(externalIcons.length).toBeGreaterThan(0)
        })

        it('should apply unlocked styling when isUnlocked is true', () => {
            const product = createMockProduct({
                includedProducts: ['included-product-1']
            })
            const { getByText, getByRole } = renderWithRouter(<ProductFeatures product={product} />)

            // Open drawer
            fireEvent.click(getByText(/Additional Product/))

            const productLink = getByRole('link', { name: /Included Product 1/ })
            expect(productLink).toHaveClass('hover:border-secondary/30')
        })
    })
})
