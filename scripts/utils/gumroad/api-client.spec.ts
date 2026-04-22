import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test'
import { GumroadApiClient, GumroadApiError } from './api-client.js'
import type { GumroadProductsResponse, GumroadSalesResponse } from './types.js'

describe('GumroadApiClient', () => {
    const originalFetch = globalThis.fetch
    let mockFetch: ReturnType<typeof mock>

    beforeEach(() => {
        mockFetch = mock(() => Promise.resolve(new Response()))
        globalThis.fetch = mockFetch
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
    })

    describe('constructor', () => {
        it('should create client with access token', () => {
            const client = new GumroadApiClient({ accessToken: 'test-token' })
            expect(client).toBeInstanceOf(GumroadApiClient)
        })

        it('should accept custom base URL', () => {
            const client = new GumroadApiClient({
                accessToken: 'test-token',
                baseUrl: 'https://custom.api.com'
            })
            expect(client).toBeInstanceOf(GumroadApiClient)
        })
    })

    describe('getProducts', () => {
        it('should fetch products successfully', async () => {
            const mockResponse: GumroadProductsResponse = {
                success: true,
                products: [
                    {
                        id: 'abc123',
                        name: 'Test Product',
                        permalink: 'test-product',
                        preview_url: null,
                        description: 'A test product',
                        custom_permalink: null,
                        custom_receipt: null,
                        custom_summary: null,
                        price: 1999,
                        currency: 'usd',
                        short_url: 'https://gum.co/test',
                        formatted_price: '$19.99',
                        published: true,
                        shown_on_profile: true,
                        sales_count: 100,
                        sales_usd_cents: 199900,
                        variants: null,
                        tags: ['test']
                    }
                ]
            }

            mockFetch.mockImplementation(() =>
                Promise.resolve(
                    new Response(JSON.stringify(mockResponse), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    })
                )
            )

            const client = new GumroadApiClient({ accessToken: 'test-token' })
            const products = await client.getProducts()

            expect(products).toHaveLength(1)
            expect(products[0].name).toBe('Test Product')
            expect(products[0].sales_count).toBe(100)
        })

        it('should include authorization header', async () => {
            const mockResponse: GumroadProductsResponse = {
                success: true,
                products: []
            }

            mockFetch.mockImplementation(() =>
                Promise.resolve(
                    new Response(JSON.stringify(mockResponse), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    })
                )
            )

            const client = new GumroadApiClient({ accessToken: 'my-secret-token' })
            await client.getProducts()

            expect(mockFetch).toHaveBeenCalled()
            const callArgs = mockFetch.mock.calls[0]
            expect(callArgs[1].headers.Authorization).toBe('Bearer my-secret-token')
        })

        it('should throw error on failed response', async () => {
            const mockResponse = {
                success: false,
                message: 'Invalid token'
            }

            mockFetch.mockImplementation(() =>
                Promise.resolve(
                    new Response(JSON.stringify(mockResponse), {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' }
                    })
                )
            )

            const client = new GumroadApiClient({ accessToken: 'bad-token' })

            await expect(client.getProducts()).rejects.toThrow(GumroadApiError)
        })

        it('should follow page_key pagination across multiple pages', async () => {
            const baseProduct = {
                preview_url: null,
                description: '',
                custom_permalink: null,
                custom_receipt: null,
                custom_summary: null,
                price: 0,
                currency: 'usd',
                short_url: '',
                formatted_price: 'Free',
                published: true,
                shown_on_profile: true,
                sales_count: 0,
                sales_usd_cents: 0,
                variants: null,
                tags: []
            }

            mockFetch.mockImplementation((url: string) => {
                let response: GumroadProductsResponse
                if (!url.includes('page_key=')) {
                    response = {
                        success: true,
                        products: [
                            { ...baseProduct, id: 'p1', name: 'Page 1 Product', permalink: 'p1' }
                        ],
                        next_page_url: '/v2/products?page_key=KEY-2'
                    }
                } else if (url.includes('page_key=KEY-2')) {
                    response = {
                        success: true,
                        products: [
                            { ...baseProduct, id: 'p2', name: 'Page 2 Product', permalink: 'p2' }
                        ],
                        next_page_url: '/v2/products?page_key=KEY-3'
                    }
                } else {
                    response = {
                        success: true,
                        products: [
                            { ...baseProduct, id: 'p3', name: 'Page 3 Product', permalink: 'p3' }
                        ],
                        next_page_url: null
                    }
                }

                return Promise.resolve(
                    new Response(JSON.stringify(response), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    })
                )
            })

            const client = new GumroadApiClient({ accessToken: 'test-token' })
            const products = await client.getProducts()

            expect(products).toHaveLength(3)
            expect(products.map((p) => p.id)).toEqual(['p1', 'p2', 'p3'])
            expect(mockFetch).toHaveBeenCalledTimes(3)

            const firstUrl = mockFetch.mock.calls[0][0] as string
            const secondUrl = mockFetch.mock.calls[1][0] as string
            const thirdUrl = mockFetch.mock.calls[2][0] as string
            expect(firstUrl).not.toContain('page_key')
            expect(secondUrl).toContain('page_key=KEY-2')
            expect(thirdUrl).toContain('page_key=KEY-3')
        })

        it('should stop paginating if the API repeats the same page_key', async () => {
            const baseProduct = {
                preview_url: null,
                description: '',
                custom_permalink: null,
                custom_receipt: null,
                custom_summary: null,
                price: 0,
                currency: 'usd',
                short_url: '',
                formatted_price: 'Free',
                published: true,
                shown_on_profile: true,
                sales_count: 0,
                sales_usd_cents: 0,
                variants: null,
                tags: []
            }

            mockFetch.mockImplementation(() =>
                Promise.resolve(
                    new Response(
                        JSON.stringify({
                            success: true,
                            products: [
                                {
                                    ...baseProduct,
                                    id: 'loop',
                                    name: 'Looping Product',
                                    permalink: 'loop'
                                }
                            ],
                            next_page_url: '/v2/products?page_key=SAME'
                        } satisfies GumroadProductsResponse),
                        {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        }
                    )
                )
            )

            const client = new GumroadApiClient({ accessToken: 'test-token' })
            const products = await client.getProducts()

            // Two requests: initial (no key) + one with SAME key, then stop
            expect(mockFetch).toHaveBeenCalledTimes(2)
            expect(products).toHaveLength(2)
        })
    })

    describe('getProductSales', () => {
        it('should fetch sales for a product', async () => {
            const mockResponse: GumroadSalesResponse = {
                success: true,
                sales: [
                    {
                        id: 'sale1',
                        email: 'buyer@example.com',
                        seller_id: 'seller123',
                        timestamp: '2026-01-13T10:00:00Z',
                        daystamp: '2026-01-13',
                        created_at: '2026-01-13T10:00:00Z',
                        product_name: 'Test Product',
                        product_id: 'prod123',
                        product_permalink: 'test-product',
                        price: 1999,
                        price_formatted: '$19.99',
                        gumroad_fee: 200,
                        currency: 'usd',
                        quantity: 1,
                        discover_fee_charged: false,
                        can_contact: true,
                        referrer: '',
                        card: { visual: null, type: null },
                        order_number: 1,
                        sale_id: 'sale1',
                        sale_timestamp: '2026-01-13T10:00:00Z',
                        is_preorder_authorization: false,
                        subscription_id: null,
                        rating: 5
                    }
                ]
            }

            mockFetch.mockImplementation(() =>
                Promise.resolve(
                    new Response(JSON.stringify(mockResponse), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    })
                )
            )

            const client = new GumroadApiClient({ accessToken: 'test-token' })
            const sales = await client.getProductSales('prod123')

            expect(sales).toHaveLength(1)
            expect(sales[0].rating).toBe(5)
            expect(sales[0].product_id).toBe('prod123')
        })

        it('should handle pagination', async () => {
            let callCount = 0

            mockFetch.mockImplementation(() => {
                callCount++
                const response: GumroadSalesResponse =
                    callCount === 1
                        ? {
                              success: true,
                              sales: [
                                  {
                                      id: 'sale1',
                                      email: 'buyer1@example.com',
                                      seller_id: 'seller123',
                                      timestamp: '2026-01-13T10:00:00Z',
                                      daystamp: '2026-01-13',
                                      created_at: '2026-01-13T10:00:00Z',
                                      product_name: 'Test',
                                      product_id: 'prod123',
                                      product_permalink: 'test',
                                      price: 1999,
                                      price_formatted: '$19.99',
                                      gumroad_fee: 200,
                                      currency: 'usd',
                                      quantity: 1,
                                      discover_fee_charged: false,
                                      can_contact: true,
                                      referrer: '',
                                      card: { visual: null, type: null },
                                      order_number: 1,
                                      sale_id: 'sale1',
                                      sale_timestamp: '2026-01-13T10:00:00Z',
                                      is_preorder_authorization: false,
                                      subscription_id: null,
                                      rating: 5
                                  }
                              ],
                              next_page_url: 'https://api.gumroad.com/v2/sales?page=2'
                          }
                        : {
                              success: true,
                              sales: [
                                  {
                                      id: 'sale2',
                                      email: 'buyer2@example.com',
                                      seller_id: 'seller123',
                                      timestamp: '2026-01-12T10:00:00Z',
                                      daystamp: '2026-01-12',
                                      created_at: '2026-01-12T10:00:00Z',
                                      product_name: 'Test',
                                      product_id: 'prod123',
                                      product_permalink: 'test',
                                      price: 1999,
                                      price_formatted: '$19.99',
                                      gumroad_fee: 200,
                                      currency: 'usd',
                                      quantity: 1,
                                      discover_fee_charged: false,
                                      can_contact: true,
                                      referrer: '',
                                      card: { visual: null, type: null },
                                      order_number: 2,
                                      sale_id: 'sale2',
                                      sale_timestamp: '2026-01-12T10:00:00Z',
                                      is_preorder_authorization: false,
                                      subscription_id: null,
                                      rating: 4
                                  }
                              ]
                          }

                return Promise.resolve(
                    new Response(JSON.stringify(response), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    })
                )
            })

            const client = new GumroadApiClient({ accessToken: 'test-token' })
            const sales = await client.getProductSales('prod123')

            expect(sales).toHaveLength(2)
            expect(sales[0].id).toBe('sale1')
            expect(sales[1].id).toBe('sale2')
        })

        it('should filter by date when after parameter is provided', async () => {
            const mockResponse: GumroadSalesResponse = {
                success: true,
                sales: []
            }

            mockFetch.mockImplementation(() =>
                Promise.resolve(
                    new Response(JSON.stringify(mockResponse), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    })
                )
            )

            const client = new GumroadApiClient({ accessToken: 'test-token' })
            await client.getProductSales('prod123', '2026-01-01')

            const callUrl = mockFetch.mock.calls[0][0] as string
            expect(callUrl).toContain('after=2026-01-01')
        })
    })

    describe('error handling', () => {
        it('should throw GumroadApiError with status code', async () => {
            mockFetch.mockImplementation(() =>
                Promise.resolve(
                    new Response(JSON.stringify({ success: false, message: 'Not found' }), {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
                    })
                )
            )

            const client = new GumroadApiClient({ accessToken: 'test-token' })

            try {
                await client.getProducts()
                expect(true).toBe(false) // Should not reach here
            } catch (error) {
                expect(error).toBeInstanceOf(GumroadApiError)
                expect((error as GumroadApiError).statusCode).toBe(404)
            }
        })
    })
})
