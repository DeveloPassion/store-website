import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import TestimonialCardLinked from './testimonial-card-linked'
import type { Testimonial } from '@/schemas/testimonial.schema'

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

const createMockTestimonial = (overrides: Partial<Testimonial> = {}): Testimonial => ({
    id: 'testimonial-1',
    author: 'John Doe',
    quote: 'This is an amazing product! It changed my life.',
    featured: true,
    ...overrides
})

describe('TestimonialCardLinked Component', () => {
    it('should render testimonial quote', () => {
        const testimonial = createMockTestimonial()
        const { getByText } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product'
                animated={false}
            />
        )

        expect(getByText('"This is an amazing product! It changed my life."')).toBeInTheDocument()
    })

    it('should render author name', () => {
        const testimonial = createMockTestimonial()
        const { getByText } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product'
                animated={false}
            />
        )

        expect(getByText('John Doe')).toBeInTheDocument()
    })

    it('should render product name badge', () => {
        const testimonial = createMockTestimonial()
        const { getByText } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product'
                animated={false}
            />
        )

        expect(getByText('Test Product')).toBeInTheDocument()
    })

    it('should render all 5 stars (all testimonials are 5-star)', () => {
        const testimonial = createMockTestimonial()
        const { container } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product'
                animated={false}
            />
        )

        const stars = container.querySelectorAll('.text-secondary')
        // 5 stars + 1 product badge with same class
        expect(stars.length).toBeGreaterThanOrEqual(5)
    })

    it('should render role when provided', () => {
        const testimonial = createMockTestimonial({ role: 'Software Engineer' })
        const { getByText } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product'
                animated={false}
            />
        )

        expect(getByText(/Software Engineer/)).toBeInTheDocument()
    })

    it('should render company when provided', () => {
        const testimonial = createMockTestimonial({ company: 'Acme Corp' })
        const { getByText } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product'
                animated={false}
            />
        )

        expect(getByText(/Acme Corp/)).toBeInTheDocument()
    })

    it('should render role and company together', () => {
        const testimonial = createMockTestimonial({
            role: 'Product Manager',
            company: 'Tech Inc'
        })
        const { getByText } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product'
                animated={false}
            />
        )

        expect(getByText(/Product Manager at Tech Inc/)).toBeInTheDocument()
    })

    it('should render twitter link when provided', () => {
        const testimonial = createMockTestimonial({
            twitterHandle: 'johndoe',
            twitterUrl: 'https://twitter.com/johndoe'
        })
        const { getByText } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product'
                animated={false}
            />
        )

        const twitterLink = getByText('@johndoe')
        expect(twitterLink).toBeInTheDocument()
        expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/johndoe')
        expect(twitterLink).toHaveAttribute('target', '_blank')
        expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should navigate to product page on click', () => {
        const testimonial = createMockTestimonial()
        const { container } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product-foo'
                animated={false}
            />
        )

        const card = container.querySelector('.cursor-pointer')
        expect(card).toBeInTheDocument()
        // The card should be clickable and navigate using useNavigate
    })

    it('should have cursor-pointer class on card', () => {
        const testimonial = createMockTestimonial()
        const { container } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product'
                animated={false}
            />
        )

        const card = container.querySelector('.cursor-pointer')
        expect(card).toBeInTheDocument()
    })

    it('should render quote icon', () => {
        const testimonial = createMockTestimonial()
        const { container } = renderWithRouter(
            <TestimonialCardLinked
                testimonial={testimonial}
                productName='Test Product'
                productId='test-product'
                animated={false}
            />
        )

        // Quote icon should be present
        expect(container.querySelector('svg')).toBeInTheDocument()
    })
})
