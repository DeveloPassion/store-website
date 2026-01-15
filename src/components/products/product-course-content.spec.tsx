import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import ProductCourseContent from './product-course-content'
import type { Product } from '@/schemas/product.schema'

// Mock framer-motion
mock.module('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { initial, whileInView, viewport, transition, variants, ...domProps } =
                props as Record<string, unknown>
            return <div {...domProps}>{children}</div>
        }
    }
}))

const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-product',
    name: 'Test Product',
    price: 99.99,
    priceDisplay: '€99.99',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    mainCategory: 'courses',
    secondaryCategories: [],
    tags: ['ai'],
    included: ['Item 1'],
    testimonials: [],
    faqs: [],
    featured: false,
    bestseller: false,
    bestValue: false,
    priority: 50,
    crossSellIds: [],
    media: [],
    landingPageUrl: null,
    dsebastienUrl: null,
    stats: null,
    variants: null,
    isSubscription: false,
    paymentFrequencies: null,
    defaultPaymentFrequency: null,
    activeSalesCopyId: 'default',
    salesCopy: {
        tagline: 'Test tagline',
        problem: 'Test problem',
        problemPoints: ['Problem point 1'],
        agitate: 'Test agitate',
        agitatePoints: ['Agitate point 1'],
        solution: 'Test solution',
        solutionPoints: ['Solution point 1'],
        description: 'Test description',
        features: ['Feature 1'],
        benefits: { immediate: ['Benefit 1'], systematic: [], longTerm: [] },
        targetAudience: [],
        perfectFor: [],
        notForYou: [],
        trustBadges: [],
        guarantees: [],
        metaTitle: '',
        metaDescription: '',
        keywords: []
    },
    ...overrides
})

describe('ProductCourseContent Component', () => {
    describe('conditional rendering', () => {
        it('should render nothing when salesCopy is undefined', () => {
            const product = createMockProduct({ salesCopy: undefined })
            const { container } = render(<ProductCourseContent product={product} />)
            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when courseContent is undefined', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: undefined
                }
            })
            const { container } = render(<ProductCourseContent product={product} />)
            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when courseContent is null', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: null
                }
            })
            const { container } = render(<ProductCourseContent product={product} />)
            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when modules array is empty', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        sectionTitle: 'Course Content',
                        modules: []
                    }
                }
            })
            const { container } = render(<ProductCourseContent product={product} />)
            expect(container.innerHTML).toBe('')
        })
    })

    describe('header rendering', () => {
        it('should render default title when not provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText("What's Inside the Course")).toBeInTheDocument()
        })

        it('should render custom title when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        sectionTitle: 'Course Curriculum',
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText('Course Curriculum')).toBeInTheDocument()
        })

        it('should render description when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        sectionDescription: 'A comprehensive curriculum from beginner to expert',
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(
                getByText('A comprehensive curriculum from beginner to expert')
            ).toBeInTheDocument()
        })
    })

    describe('meta badges', () => {
        it('should render total duration when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        totalDuration: '12 hours',
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText('12 hours')).toBeInTheDocument()
        })

        it('should render difficulty badge when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        difficulty: 'beginner',
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText('Beginner')).toBeInTheDocument()
        })

        it('should render intermediate difficulty', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        difficulty: 'intermediate',
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText('Intermediate')).toBeInTheDocument()
        })

        it('should render advanced difficulty', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        difficulty: 'advanced',
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText('Advanced')).toBeInTheDocument()
        })

        it('should render module and lesson counts', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }, { name: 'Section 2' }]
                            },
                            {
                                name: 'Module 2',
                                sections: [{ name: 'Section 3' }]
                            }
                        ]
                    }
                }
            })
            const { container } = render(<ProductCourseContent product={product} />)
            // Check for module and lesson counts (format: "2 modules · 3 lessons")
            expect(container.textContent).toContain('2 modules')
            expect(container.textContent).toContain('3 lessons')
        })

        it('should use singular form for 1 module', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { container } = render(<ProductCourseContent product={product} />)
            expect(container.textContent).toContain('1 module')
            expect(container.textContent).toContain('1 lesson')
        })
    })

    describe('prerequisites rendering', () => {
        it('should render prerequisites when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        prerequisites: ['Basic computer skills', 'Obsidian installed'],
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText('Prerequisites')).toBeInTheDocument()
            expect(getByText('Basic computer skills')).toBeInTheDocument()
            expect(getByText('Obsidian installed')).toBeInTheDocument()
        })

        it('should not render prerequisites section when empty array', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        prerequisites: [],
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { queryByText } = render(<ProductCourseContent product={product} />)
            expect(queryByText('Prerequisites')).toBeNull()
        })

        it('should not render prerequisites section when undefined', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { queryByText } = render(<ProductCourseContent product={product} />)
            expect(queryByText('Prerequisites')).toBeNull()
        })
    })

    describe('module accordion', () => {
        it('should render all modules', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Getting Started',
                                sections: [{ name: 'Section 1' }]
                            },
                            {
                                name: 'Advanced Topics',
                                sections: [{ name: 'Section 2' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText('Getting Started')).toBeInTheDocument()
            expect(getByText('Advanced Topics')).toBeInTheDocument()
        })

        it('should render module duration when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Module 1',
                                duration: '45 min',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText('45 min')).toBeInTheDocument()
        })

        it('should render section count', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'S1' }, { name: 'S2' }, { name: 'S3' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText('3 lessons')).toBeInTheDocument()
        })

        it('should render module number when no icon provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            },
                            {
                                name: 'Module 2',
                                sections: [{ name: 'Section 2' }]
                            }
                        ]
                    }
                }
            })
            const { container } = render(<ProductCourseContent product={product} />)
            // The numbers appear in the module icon boxes
            const numbers = container.querySelectorAll('.text-secondary.text-sm.font-bold')
            expect(numbers.length).toBeGreaterThanOrEqual(1)
        })

        it('should render emoji icons for modules', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Getting Started',
                                icon: '🚀',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { getByText } = render(<ProductCourseContent product={product} />)
            expect(getByText('🚀')).toBeInTheDocument()
        })

        // Note: Accordion expand/collapse tests are skipped because Headless UI
        // Disclosure component uses HTMLFieldSetElement which is not available
        // in the test environment. Test accordion behavior manually in browser.
    })

    // Note: Section rendering tests are skipped because they require
    // expanding the accordion, and Headless UI Disclosure component uses
    // HTMLFieldSetElement which is not available in the test environment.
    // Test section rendering manually in browser by expanding modules.

    describe('accessibility', () => {
        it('should render section element', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { container } = render(<ProductCourseContent product={product} />)
            expect(container.querySelector('section')).toBeInTheDocument()
        })

        it('should have proper button role for accordion triggers', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    courseContent: {
                        modules: [
                            {
                                name: 'Module 1',
                                sections: [{ name: 'Section 1' }]
                            }
                        ]
                    }
                }
            })
            const { container } = render(<ProductCourseContent product={product} />)
            const buttons = container.querySelectorAll('button')
            expect(buttons.length).toBeGreaterThanOrEqual(1)
        })
    })
})
