import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { useProductUrlState } from './use-product-url-state'
import type { Product, ProductVariant } from '@/schemas/product.schema'

// Helper to create a wrapper with MemoryRouter
const createWrapper = (initialEntries: string[] = ['/product/test']) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    )
    Wrapper.displayName = 'TestWrapper'
    return Wrapper
}

// Create minimal mock product with type assertion
const createMockProduct = (overrides: Partial<Product> = {}): Product =>
    ({
        id: 'test-product',
        name: 'Test Product',
        isSubscription: false,
        variants: null,
        defaultPaymentFrequency: null,
        paymentFrequencies: null,
        crossSellIds: [],
        targetExperienceLevel: 'all-levels',
        deliveryStyle: 'hybrid',
        ...overrides
    }) as Product

// Create minimal mock variant with type assertion
const createMockVariant = (overrides: Partial<ProductVariant> = {}): ProductVariant =>
    ({
        name: 'Test Variant',
        price: 99,
        priceDisplay: '€99',
        gumroadVariantId: 'test-variant',
        includedProducts: [],
        ...overrides
    }) as ProductVariant

describe('useProductUrlState', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    afterEach(() => {
        document.body.innerHTML = ''
    })

    describe('initialization', () => {
        it('should return undefined variant when product has no variants', () => {
            const product = createMockProduct({ variants: null })

            const { result } = renderHook(() => useProductUrlState({ product }), {
                wrapper: createWrapper()
            })

            expect(result.current.selectedVariant).toBeUndefined()
        })

        it('should return first variant when product has variants and no URL param', () => {
            const variant1 = createMockVariant({ name: 'Basic', gumroadVariantId: 'basic' })
            const variant2 = createMockVariant({ name: 'Pro', gumroadVariantId: 'pro' })
            const product = createMockProduct({ variants: [variant1, variant2] })

            const { result } = renderHook(() => useProductUrlState({ product }), {
                wrapper: createWrapper()
            })

            expect(result.current.selectedVariant).toEqual(variant1)
        })

        it('should return variant from URL param when valid', () => {
            const variant1 = createMockVariant({ name: 'Basic', gumroadVariantId: 'basic' })
            const variant2 = createMockVariant({ name: 'Pro', gumroadVariantId: 'pro' })
            const product = createMockProduct({ variants: [variant1, variant2] })

            const { result } = renderHook(() => useProductUrlState({ product }), {
                wrapper: createWrapper(['/product/test?variant=pro'])
            })

            expect(result.current.selectedVariant).toEqual(variant2)
        })

        it('should return default frequency for non-subscription products', () => {
            const product = createMockProduct({ isSubscription: false })

            const { result } = renderHook(() => useProductUrlState({ product }), {
                wrapper: createWrapper()
            })

            expect(result.current.selectedFrequency).toBe('monthly')
        })

        it('should return frequency from URL param for subscription products', () => {
            const product = createMockProduct({
                isSubscription: true,
                paymentFrequencies: ['monthly', 'yearly'],
                defaultPaymentFrequency: 'monthly'
            })

            const { result } = renderHook(() => useProductUrlState({ product }), {
                wrapper: createWrapper(['/product/test?frequency=yearly'])
            })

            expect(result.current.selectedFrequency).toBe('yearly')
        })

        it('should fall back to product default when URL frequency is invalid', () => {
            const product = createMockProduct({
                isSubscription: true,
                paymentFrequencies: ['monthly', 'yearly'],
                defaultPaymentFrequency: 'yearly'
            })

            const { result } = renderHook(() => useProductUrlState({ product }), {
                wrapper: createWrapper(['/product/test?frequency=invalid'])
            })

            expect(result.current.selectedFrequency).toBe('yearly')
        })
    })

    describe('setSelectedVariant', () => {
        it('should update selected variant state', () => {
            const variant1 = createMockVariant({ name: 'Basic', gumroadVariantId: 'basic' })
            const variant2 = createMockVariant({ name: 'Pro', gumroadVariantId: 'pro' })
            const product = createMockProduct({ variants: [variant1, variant2] })

            const { result } = renderHook(() => useProductUrlState({ product }), {
                wrapper: createWrapper()
            })

            expect(result.current.selectedVariant).toEqual(variant1)

            act(() => {
                result.current.setSelectedVariant(variant2)
            })

            expect(result.current.selectedVariant).toEqual(variant2)
        })
    })

    describe('setSelectedFrequency', () => {
        it('should update selected frequency state', () => {
            const product = createMockProduct({
                isSubscription: true,
                paymentFrequencies: ['monthly', 'yearly'],
                defaultPaymentFrequency: 'monthly'
            })

            const { result } = renderHook(() => useProductUrlState({ product }), {
                wrapper: createWrapper()
            })

            expect(result.current.selectedFrequency).toBe('monthly')

            act(() => {
                result.current.setSelectedFrequency('yearly')
            })

            expect(result.current.selectedFrequency).toBe('yearly')
        })
    })

    describe('with undefined product', () => {
        it('should handle undefined product gracefully', () => {
            const { result } = renderHook(() => useProductUrlState({ product: undefined }), {
                wrapper: createWrapper()
            })

            expect(result.current.selectedVariant).toBeUndefined()
            expect(result.current.selectedFrequency).toBe('monthly')
        })
    })
})
