import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import ProductOriginStory from './product-origin-story'
import { createMockProduct } from '@/test-utils/mock-product'

// Mock framer-motion - filter out animation props before passing to DOM
mock.module('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
            const animationProps = ['initial', 'whileInView', 'viewport', 'transition', 'variants']
            const domProps = Object.fromEntries(
                Object.entries(props).filter(([key]) => !animationProps.includes(key))
            )
            return <div {...domProps}>{children}</div>
        }
    }
}))

describe('ProductOriginStory Component', () => {
    describe('conditional rendering', () => {
        it('should render nothing when storytelling is undefined', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    storytelling: null
                }
            })
            const { container } = render(<ProductOriginStory product={product} />)
            expect(container.innerHTML).toBe('')
        })

        it('should render nothing when originStory is null', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    storytelling: {
                        originStory: null,
                        creatorJourney: null,
                        transformationArc: null,
                        successStories: null,
                        methodology: null,
                        vision: null
                    }
                }
            })
            const { container } = render(<ProductOriginStory product={product} />)
            expect(container.innerHTML).toBe('')
        })
    })

    describe('content rendering', () => {
        it('should render origin story content', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    storytelling: {
                        originStory: {
                            title: 'Why We Exist',
                            subtitle: 'Our founding story',
                            story: 'This is how it all began with a simple idea.',
                            inspirationPoint: null,
                            genesisDate: null,
                            icon: null
                        },
                        creatorJourney: null,
                        transformationArc: null,
                        successStories: null,
                        methodology: null,
                        vision: null
                    }
                }
            })
            const { getByText } = render(<ProductOriginStory product={product} />)

            expect(getByText('Why We Exist')).toBeInTheDocument()
            expect(getByText('Our founding story')).toBeInTheDocument()
            expect(getByText('This is how it all began with a simple idea.')).toBeInTheDocument()
        })

        it('should render inspiration point when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    storytelling: {
                        originStory: {
                            title: 'Origin',
                            subtitle: null,
                            story: 'The story begins here.',
                            inspirationPoint: 'The moment everything changed',
                            genesisDate: null,
                            icon: null
                        },
                        creatorJourney: null,
                        transformationArc: null,
                        successStories: null,
                        methodology: null,
                        vision: null
                    }
                }
            })
            const { getByText } = render(<ProductOriginStory product={product} />)

            expect(getByText('"The moment everything changed"')).toBeInTheDocument()
        })

        it('should render emoji icon when provided', () => {
            const product = createMockProduct({
                salesCopy: {
                    ...createMockProduct().salesCopy!,
                    storytelling: {
                        originStory: {
                            title: 'Origin',
                            subtitle: null,
                            story: 'The story begins here.',
                            inspirationPoint: null,
                            genesisDate: null,
                            icon: '🚀'
                        },
                        creatorJourney: null,
                        transformationArc: null,
                        successStories: null,
                        methodology: null,
                        vision: null
                    }
                }
            })
            const { getByText } = render(<ProductOriginStory product={product} />)

            expect(getByText('🚀')).toBeInTheDocument()
        })
    })
})
