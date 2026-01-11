import { describe, it, expect } from 'bun:test'
import { buildGumroadUrl, buildGumroadUrlFromProduct } from './gumroad-url'
import type { Product } from '@/schemas/product.schema'

describe('buildGumroadUrl', () => {
    describe('Basic URL building without options', () => {
        it('should add ?wanted=true and quantity=1 to URL without query parameters', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url)
            expect(result).toBe('https://gumroad.com/l/product?wanted=true&quantity=1')
        })

        it('should add parameters to URL with existing query parameters', () => {
            const url = 'https://gumroad.com/l/product?discount=SAVE20'
            const result = buildGumroadUrl(url)
            expect(result).toBe(
                'https://gumroad.com/l/product?discount=SAVE20&wanted=true&quantity=1'
            )
        })

        it('should return # when URL is undefined', () => {
            const result = buildGumroadUrl(undefined)
            expect(result).toBe('#')
        })

        it('should return # when URL is empty string', () => {
            const result = buildGumroadUrl('')
            expect(result).toBe('#')
        })

        it('should handle URLs with fragment identifiers', () => {
            const url = 'https://gumroad.com/l/product#details'
            const result = buildGumroadUrl(url)
            expect(result).toBe('https://gumroad.com/l/product?wanted=true&quantity=1#details')
        })

        it('should handle URLs with both query parameters and fragment identifiers', () => {
            const url = 'https://gumroad.com/l/product?variant=premium#details'
            const result = buildGumroadUrl(url)
            expect(result).toBe(
                'https://gumroad.com/l/product?variant=premium&wanted=true&quantity=1#details'
            )
        })
    })

    describe('Options parameter - variantId', () => {
        it('should add variant parameter when variantId provided', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { variantId: 'premium' })
            expect(result).toContain('variant=premium')
        })

        it('should not add variant parameter when variantId is undefined', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { variantId: undefined })
            expect(result).not.toContain('variant=')
        })

        it('should encode variant ID properly', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { variantId: 'pro version' })
            expect(result).toContain('variant=pro+version')
        })
    })

    describe('Options parameter - quantity', () => {
        it('should default quantity to 1 when not provided', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url)
            expect(result).toContain('quantity=1')
        })

        it('should use provided quantity value', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { quantity: 5 })
            expect(result).toContain('quantity=5')
        })

        it('should allow quantity to be set to 0', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { quantity: 0 })
            expect(result).toContain('quantity=0')
        })
    })

    describe('Options parameter - paymentFrequency', () => {
        it('should add monthly=true parameter for monthly frequency', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { paymentFrequency: 'monthly' })
            expect(result).toContain('monthly=true')
        })

        it('should add yearly=true parameter for yearly frequency', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { paymentFrequency: 'yearly' })
            expect(result).toContain('yearly=true')
        })

        it('should add every_two_years=true parameter for biennial frequency', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { paymentFrequency: 'biennial' })
            expect(result).toContain('every_two_years=true')
        })

        it('should not add frequency parameters for one-time frequency', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { paymentFrequency: 'one-time' })
            expect(result).not.toContain('monthly=')
            expect(result).not.toContain('yearly=')
            expect(result).not.toContain('every_two_years=')
        })

        it('should not add frequency parameters when undefined', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { paymentFrequency: undefined })
            expect(result).not.toContain('monthly=')
            expect(result).not.toContain('yearly=')
            expect(result).not.toContain('every_two_years=')
        })
    })

    describe('Options parameter - discountCode', () => {
        it('should add offer_code parameter when discount code provided', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { discountCode: 'SAVE20' })
            expect(result).toContain('offer_code=SAVE20')
        })

        it('should not add offer_code when undefined', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { discountCode: undefined })
            expect(result).not.toContain('offer_code=')
        })

        it('should encode discount code properly', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { discountCode: 'SAVE 20' })
            expect(result).toContain('offer_code=SAVE+20')
        })
    })

    describe('Options parameter - wanted', () => {
        it('should add wanted=true by default', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url)
            expect(result).toContain('wanted=true')
        })

        it('should add wanted=true when explicitly set to true', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { wanted: true })
            expect(result).toContain('wanted=true')
        })

        it('should not add wanted parameter when set to false', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { wanted: false })
            expect(result).not.toContain('wanted=')
        })
    })

    describe('Multiple options combined', () => {
        it('should add all parameters when all options provided', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, {
                variantId: 'premium',
                quantity: 2,
                paymentFrequency: 'yearly',
                discountCode: 'SAVE20',
                wanted: true
            })
            expect(result).toContain('wanted=true')
            expect(result).toContain('quantity=2')
            expect(result).toContain('variant=premium')
            expect(result).toContain('yearly=true')
            expect(result).toContain('offer_code=SAVE20')
        })

        it('should handle complex URL with all parameters and fragment', () => {
            const url = 'https://gumroad.com/l/product?ref=email#details'
            const result = buildGumroadUrl(url, {
                variantId: 'pro',
                paymentFrequency: 'monthly',
                discountCode: 'WELCOME'
            })
            expect(result).toContain('ref=email')
            expect(result).toContain('wanted=true')
            expect(result).toContain('quantity=1')
            expect(result).toContain('variant=pro')
            expect(result).toContain('monthly=true')
            expect(result).toContain('offer_code=WELCOME')
            expect(result).toEndWith('#details')
        })
    })

    describe('URL encoding edge cases', () => {
        it('should handle special characters in variant ID', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { variantId: 'pro & premium' })
            expect(result).toContain('variant=pro+%26+premium')
        })

        it('should handle special characters in discount code', () => {
            const url = 'https://gumroad.com/l/product'
            const result = buildGumroadUrl(url, { discountCode: 'SAVE&SHARE' })
            expect(result).toContain('offer_code=SAVE%26SHARE')
        })
    })
})

describe('buildGumroadUrlFromProduct', () => {
    const baseProduct: Product = {
        id: 'test-product',
        permalink: 'test',
        name: 'Test Product',
        tagline: 'Test',
        price: 99,
        priceDisplay: '€99',
        priceTier: 'standard',
        gumroadUrl: 'https://gumroad.com/l/test-product',
        mainCategory: 'guides',
        secondaryCategories: [],
        tags: ['ai'],
        problem: 'Test',
        problemPoints: ['Test'],
        agitate: 'Test',
        agitatePoints: ['Test'],
        solution: 'Test',
        solutionPoints: ['Test'],
        description: 'Test',
        features: ['Test'],
        benefits: {},
        included: ['Test'],
        targetAudience: [],
        perfectFor: [],
        notForYou: [],
        featured: false,
        bestseller: false,
        bestValue: false,
        priority: 50,
        trustBadges: [],
        guarantees: [],
        crossSellIds: []
    }

    describe('Product without variants', () => {
        it('should use product gumroadUrl', () => {
            const result = buildGumroadUrlFromProduct(baseProduct)
            expect(result).toContain('gumroad.com/l/test-product')
        })

        it('should add default parameters', () => {
            const result = buildGumroadUrlFromProduct(baseProduct)
            expect(result).toContain('wanted=true')
            expect(result).toContain('quantity=1')
        })
    })

    describe('Product with variants', () => {
        const variantProduct: Product = {
            ...baseProduct,
            variants: [
                {
                    name: 'Basic',
                    price: 49,
                    priceDisplay: '€49',
                    description: 'Basic version',
                    gumroadUrl: 'https://gumroad.com/l/test-product',
                    gumroadVariantId: 'basic'
                },
                {
                    name: 'Premium',
                    price: 99,
                    priceDisplay: '€99',
                    description: 'Premium version',
                    gumroadUrl: 'https://gumroad.com/l/test-product',
                    gumroadVariantId: 'premium'
                }
            ]
        }

        it('should use first variant when no variant selected', () => {
            const result = buildGumroadUrlFromProduct(variantProduct)
            expect(result).toContain('variant=basic')
        })

        it('should use selected variant', () => {
            const result = buildGumroadUrlFromProduct(variantProduct, variantProduct.variants![1])
            expect(result).toContain('variant=premium')
        })

        it('should use variant gumroadUrl when different from product', () => {
            const customVariantProduct: Product = {
                ...variantProduct,
                variants: [
                    {
                        name: 'Premium',
                        price: 99,
                        priceDisplay: '€99',
                        description: 'Premium',
                        gumroadUrl: 'https://gumroad.com/l/test-premium',
                        gumroadVariantId: 'premium'
                    }
                ]
            }
            const result = buildGumroadUrlFromProduct(customVariantProduct)
            expect(result).toContain('gumroad.com/l/test-premium')
        })
    })

    describe('Subscription products', () => {
        const subscriptionProduct: Product = {
            ...baseProduct,
            priceTier: 'subscription',
            isSubscription: true,
            paymentFrequencies: ['monthly', 'yearly'],
            defaultPaymentFrequency: 'monthly'
        }

        it('should use product defaultPaymentFrequency when no frequency selected', () => {
            const result = buildGumroadUrlFromProduct(subscriptionProduct)
            expect(result).toContain('monthly=true')
        })

        it('should use selected frequency', () => {
            const result = buildGumroadUrlFromProduct(subscriptionProduct, undefined, 'yearly')
            expect(result).toContain('yearly=true')
        })

        it('should use variant paymentFrequency when defined', () => {
            const variantSubscription: Product = {
                ...subscriptionProduct,
                variants: [
                    {
                        name: 'Monthly',
                        price: 9.99,
                        priceDisplay: '€9.99/mo',
                        description: 'Monthly plan',
                        gumroadUrl: 'https://gumroad.com/l/test-product',
                        gumroadVariantId: 'monthly-plan',
                        paymentFrequency: 'monthly'
                    }
                ]
            }
            const result = buildGumroadUrlFromProduct(variantSubscription)
            expect(result).toContain('monthly=true')
            expect(result).toContain('variant=monthly-plan')
        })

        it('should prioritize selectedFrequency over variant and product frequency', () => {
            const variantSubscription: Product = {
                ...subscriptionProduct,
                defaultPaymentFrequency: 'monthly',
                variants: [
                    {
                        name: 'Plan',
                        price: 9.99,
                        priceDisplay: '€9.99',
                        description: 'Plan',
                        gumroadUrl: 'https://gumroad.com/l/test',
                        paymentFrequency: 'monthly'
                    }
                ]
            }
            const result = buildGumroadUrlFromProduct(
                variantSubscription,
                variantSubscription.variants![0],
                'yearly'
            )
            expect(result).toContain('yearly=true')
        })
    })

    describe('Complex product scenarios', () => {
        it('should handle product with variants and subscription', () => {
            const complexProduct: Product = {
                ...baseProduct,
                priceTier: 'subscription',
                isSubscription: true,
                paymentFrequencies: ['monthly', 'yearly'],
                defaultPaymentFrequency: 'yearly',
                variants: [
                    {
                        name: 'Explorer',
                        price: 4.99,
                        priceDisplay: '€4.99/month',
                        description: 'Explorer tier',
                        gumroadUrl: 'https://gumroad.com/l/test',
                        gumroadVariantId: 'explorer',
                        paymentFrequency: 'monthly'
                    },
                    {
                        name: 'Pro',
                        price: 19.99,
                        priceDisplay: '€19.99/month',
                        description: 'Pro tier',
                        gumroadUrl: 'https://gumroad.com/l/test',
                        gumroadVariantId: 'pro',
                        paymentFrequency: 'monthly'
                    }
                ]
            }

            const result = buildGumroadUrlFromProduct(
                complexProduct,
                complexProduct.variants![1],
                'yearly'
            )

            expect(result).toContain('variant=pro')
            expect(result).toContain('yearly=true')
            expect(result).toContain('quantity=1')
            expect(result).toContain('wanted=true')
        })

        it('should handle product without gumroadVariantId', () => {
            const product: Product = {
                ...baseProduct,
                variants: [
                    {
                        name: 'Version',
                        price: 99,
                        priceDisplay: '€99',
                        description: 'Version',
                        gumroadUrl: 'https://gumroad.com/l/test'
                        // No gumroadVariantId
                    }
                ]
            }

            const result = buildGumroadUrlFromProduct(product)
            expect(result).not.toContain('variant=')
            expect(result).toContain('wanted=true')
            expect(result).toContain('quantity=1')
        })
    })
})
