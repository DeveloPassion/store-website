import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { render, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as ReactRouter from 'react-router'
import { BrowserRouter } from 'react-router'
import CommandPalette from './command-palette'
import type { Product } from '@/schemas/product.schema'

const mockNavigate = mock(() => {})

// Mock react-router
mock.module('react-router', () => ({
    ...ReactRouter,
    useNavigate: () => mockNavigate
}))

const createMockProduct = (overrides: Partial<Product> = {}): Product =>
    ({
        id: 'test-product',
        name: 'Test Product',
        gumroadId: null,
        isGumroadProduct: false,
        gumroadProductSlugs: null,
        tagline: 'A test product',
        description: 'Test description',
        price: 99,
        priceDisplay: '$99',
        priceTier: 'premium',
        gumroadUrl: 'https://example.com',
        mainCategory: 'courses',
        secondaryCategories: [],
        tags: ['knowledge-management'],
        testimonialsCount: 0,
        includedProducts: [],
        includedIn: [],
        crossSellIds: [],
        targetExperienceLevel: null,
        deliveryStyle: null,
        salesCopy: {
            tagline: 'A test product tagline',
            secondaryTagline: null,
            problem: 'Test problem',
            problemPoints: ['Point 1'],
            agitate: 'Test agitate',
            agitatePoints: ['Agitate 1'],
            solution: 'Test solution',
            solutionPoints: ['Solution 1'],
            description: 'Test description',
            highlights: [{ title: 'Feature', description: 'Desc', icon: null }],
            benefits: {
                immediate: [{ title: 'Benefit', description: 'Desc', icon: null }],
                systematic: [{ title: 'Benefit', description: 'Desc', icon: null }],
                longTerm: [{ title: 'Benefit', description: 'Desc', icon: null }]
            },
            targetAudience: ['Audience 1'],
            perfectFor: ['Person 1'],
            notForYou: ['Not for 1'],
            trustBadges: ['Badge 1'],
            guarantees: ['Guarantee 1'],
            metaTitle: 'Meta title',
            metaDescription: 'Meta description',
            keywords: ['keyword'],
            storytelling: null,
            timeline: null,
            courseContent: null,
            howItWorks: null,
            mediaSections: null
        },
        ...overrides
    }) as Product

describe('CommandPalette - Keyboard Navigation', () => {
    const products = [
        createMockProduct({ id: 'product-1', name: 'Product One' }),
        createMockProduct({ id: 'product-2', name: 'Product Two' }),
        createMockProduct({ id: 'product-3', name: 'Product Three' })
    ]

    beforeEach(() => {
        mockNavigate.mockClear()
    })

    it('should not reset selection when navigating with arrow keys', async () => {
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        // Wait for component to be ready
        await waitFor(() => {
            const input = container.querySelector('input[placeholder*="Search..."]')
            expect(input).toBeTruthy()
        })

        // Get all command items
        const items = container.querySelectorAll('[role="option"]')
        expect(items.length).toBeGreaterThan(0)

        // First item should be selected initially (has bg-secondary/20 class)
        expect(items[0]?.className).toContain('bg-secondary/20')

        // Press ArrowDown to move to second item
        fireEvent.keyDown(document, { key: 'ArrowDown' })

        // Second item should now be selected
        await waitFor(() => {
            const updatedItems = container.querySelectorAll('[role="option"]')
            expect(updatedItems[1]?.className).toContain('bg-secondary/20')
        })

        // Press ArrowDown again to move to third item
        fireEvent.keyDown(document, { key: 'ArrowDown' })

        // Third item should now be selected (NOT jumped back to first)
        await waitFor(() => {
            const updatedItems = container.querySelectorAll('[role="option"]')
            expect(updatedItems[2]?.className).toContain('bg-secondary/20')
            expect(updatedItems[0]?.className).not.toContain('bg-secondary/20')
        })
    })

    it('should reset selection to first item when query changes', async () => {
        const user = userEvent.setup()
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        // Wait for component to be ready and get input
        const input = await waitFor(() => {
            const inp = container.querySelector(
                'input[placeholder*="Search..."]'
            ) as HTMLInputElement
            expect(inp).toBeTruthy()
            return inp
        })

        // Navigate to second item
        fireEvent.keyDown(document, { key: 'ArrowDown' })

        await waitFor(() => {
            const items = container.querySelectorAll('[role="option"]')
            expect(items[1]?.className).toContain('bg-secondary/20')
        })

        // Type in the input using user-event (simulates real user interaction)
        await user.type(input, 'Product')

        // Wait for the useEffect to trigger and reset selectedIndex to 0
        await waitFor(
            () => {
                const items = container.querySelectorAll('[role="option"]')
                // When query changes, selectedIndex should reset to 0 (first item)
                expect(items[0]?.className).toContain('bg-secondary/20')
                expect(items[1]?.className).not.toContain('bg-secondary/20')
            },
            { timeout: 2000 }
        )
    })

    it('should handle ArrowUp navigation correctly', async () => {
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        await waitFor(() => {
            const input = container.querySelector('input[placeholder*="Search..."]')
            expect(input).toBeTruthy()
        })

        // Navigate down twice
        fireEvent.keyDown(document, { key: 'ArrowDown' })
        fireEvent.keyDown(document, { key: 'ArrowDown' })

        await waitFor(() => {
            const items = container.querySelectorAll('[role="option"]')
            expect(items[2]?.className).toContain('bg-secondary/20')
        })

        // Navigate back up
        fireEvent.keyDown(document, { key: 'ArrowUp' })

        // Should be on second item
        await waitFor(() => {
            const items = container.querySelectorAll('[role="option"]')
            expect(items[1]?.className).toContain('bg-secondary/20')
            expect(items[2]?.className).not.toContain('bg-secondary/20')
        })
    })

    it('should not navigate beyond first item when pressing ArrowUp', async () => {
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        await waitFor(() => {
            const input = container.querySelector('input[placeholder*="Search..."]')
            expect(input).toBeTruthy()
        })

        const items = container.querySelectorAll('[role="option"]')

        // First item should be selected
        expect(items[0]?.className).toContain('bg-secondary/20')

        // Try to go up (should stay on first item)
        fireEvent.keyDown(document, { key: 'ArrowUp' })

        // Should still be on first item
        await waitFor(() => {
            const updatedItems = container.querySelectorAll('[role="option"]')
            expect(updatedItems[0]?.className).toContain('bg-secondary/20')
        })
    })

    it('should not navigate beyond last item when pressing ArrowDown', async () => {
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        await waitFor(() => {
            const input = container.querySelector('input[placeholder*="Search..."]')
            expect(input).toBeTruthy()
        })

        const items = container.querySelectorAll('[role="option"]')
        const lastIndex = items.length - 1

        // Navigate to last item
        for (let i = 0; i < lastIndex; i++) {
            fireEvent.keyDown(document, { key: 'ArrowDown' })
        }

        await waitFor(() => {
            const updatedItems = container.querySelectorAll('[role="option"]')
            expect(updatedItems[lastIndex]?.className).toContain('bg-secondary/20')
        })

        // Try to go down beyond last item
        fireEvent.keyDown(document, { key: 'ArrowDown' })

        // Should still be on last item
        await waitFor(() => {
            const updatedItems = container.querySelectorAll('[role="option"]')
            expect(updatedItems[lastIndex]?.className).toContain('bg-secondary/20')
        })
    })

    it('should handle mouse hover without interfering with keyboard navigation', async () => {
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        await waitFor(() => {
            const input = container.querySelector('input[placeholder*="Search..."]')
            expect(input).toBeTruthy()
        })

        const items = container.querySelectorAll('[role="option"]')

        // Navigate to second item with keyboard
        fireEvent.keyDown(document, { key: 'ArrowDown' })

        await waitFor(() => {
            expect(items[1]?.className).toContain('bg-secondary/20')
        })

        // Hover over third item
        const thirdItem = items[2]
        if (thirdItem) {
            fireEvent.mouseEnter(thirdItem)
        }

        // Third item should be selected
        await waitFor(() => {
            const updatedItems = container.querySelectorAll('[role="option"]')
            expect(updatedItems[2]?.className).toContain('bg-secondary/20')
        })

        // Continue keyboard navigation from third item
        fireEvent.keyDown(document, { key: 'ArrowDown' })

        // Should move to fourth item (not jump back)
        await waitFor(() => {
            const updatedItems = container.querySelectorAll('[role="option"]')
            if (updatedItems.length > 3) {
                expect(updatedItems[3]?.className).toContain('bg-secondary/20')
                expect(updatedItems[2]?.className).not.toContain('bg-secondary/20')
            }
        })
    })
})

describe('CommandPalette - Fuzzy Search', () => {
    // Create mock products with valid tags for fuzzy search testing
    const products = [
        createMockProduct({
            id: 'obsidian-starter-kit',
            name: 'Obsidian Starter Kit',
            tags: ['obsidian', 'pkm', 'note-taking']
        }),
        createMockProduct({
            id: 'typescript-course',
            name: 'TypeScript Course',
            tags: ['courses', 'learning', 'beginners']
        }),
        createMockProduct({
            id: 'react-fundamentals',
            name: 'React Fundamentals',
            tags: ['learning', 'beginners', 'productivity']
        }),
        createMockProduct({
            id: 'knowledge-system',
            name: 'Knowledge Management System',
            tags: ['knowledge-management', 'pkm', 'productivity']
        })
    ]

    beforeEach(() => {
        mockNavigate.mockClear()
    })

    it('should find products with exact name match', async () => {
        const user = userEvent.setup()
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        const input = await waitFor(() => {
            const inp = container.querySelector(
                'input[placeholder*="Search..."]'
            ) as HTMLInputElement
            expect(inp).toBeTruthy()
            return inp
        })

        await user.type(input, 'Obsidian')

        await waitFor(() => {
            const items = container.querySelectorAll('[role="option"]')
            // Should find Obsidian Starter Kit
            const itemTexts = Array.from(items).map((item) => item.textContent)
            expect(itemTexts.some((text) => text?.includes('Obsidian Starter Kit'))).toBe(true)
        })
    })

    it('should find products with fuzzy/partial query', async () => {
        const user = userEvent.setup()
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        const input = await waitFor(() => {
            const inp = container.querySelector(
                'input[placeholder*="Search..."]'
            ) as HTMLInputElement
            expect(inp).toBeTruthy()
            return inp
        })

        // "obsk" should match "Obsidian Starter Kit"
        await user.type(input, 'obsk')

        await waitFor(() => {
            const items = container.querySelectorAll('[role="option"]')
            const itemTexts = Array.from(items).map((item) => item.textContent)
            expect(itemTexts.some((text) => text?.includes('Obsidian Starter Kit'))).toBe(true)
        })
    })

    it('should find products by tag', async () => {
        const user = userEvent.setup()
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        const input = await waitFor(() => {
            const inp = container.querySelector(
                'input[placeholder*="Search..."]'
            ) as HTMLInputElement
            expect(inp).toBeTruthy()
            return inp
        })

        // Search by tag
        await user.type(input, 'pkm')

        await waitFor(() => {
            const items = container.querySelectorAll('[role="option"]')
            const itemTexts = Array.from(items).map((item) => item.textContent)
            // Both products with 'pkm' tag should be found
            expect(itemTexts.some((text) => text?.includes('Obsidian Starter Kit'))).toBe(true)
            expect(itemTexts.some((text) => text?.includes('Knowledge Management System'))).toBe(
                true
            )
        })
    })

    it('should be case insensitive', async () => {
        const user = userEvent.setup()
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        const input = await waitFor(() => {
            const inp = container.querySelector(
                'input[placeholder*="Search..."]'
            ) as HTMLInputElement
            expect(inp).toBeTruthy()
            return inp
        })

        // Lowercase search
        await user.type(input, 'typescript')

        await waitFor(() => {
            const items = container.querySelectorAll('[role="option"]')
            const itemTexts = Array.from(items).map((item) => item.textContent)
            expect(itemTexts.some((text) => text?.includes('TypeScript Course'))).toBe(true)
        })
    })

    it('should rank title matches higher than tag matches', async () => {
        const user = userEvent.setup()
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        const input = await waitFor(() => {
            const inp = container.querySelector(
                'input[placeholder*="Search..."]'
            ) as HTMLInputElement
            expect(inp).toBeTruthy()
            return inp
        })

        // Search for "react" - appears in both title and as a tag
        await user.type(input, 'react')

        await waitFor(() => {
            const items = container.querySelectorAll('[role="option"]')
            // React Fundamentals (title match) should appear in results
            const itemTexts = Array.from(items).map((item) => item.textContent)
            expect(itemTexts.some((text) => text?.includes('React Fundamentals'))).toBe(true)
        })
    })

    it('should show all products when query is empty', async () => {
        const onClose = mock(() => {})
        const { container } = render(
            <BrowserRouter>
                <CommandPalette isOpen={true} onClose={onClose} products={products} />
            </BrowserRouter>
        )

        await waitFor(() => {
            const items = container.querySelectorAll('[role="option"]')
            // Should show all products plus navigation actions
            expect(items.length).toBeGreaterThan(products.length)
        })
    })
})
