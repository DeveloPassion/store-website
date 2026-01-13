import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test'
import { subscribeToNewsletter } from './ghost-api'

describe('subscribeToNewsletter', () => {
    const mockGhostSiteUrl = 'https://example.com'
    const mockEmail = 'test@example.com'
    const mockIntegrityToken = 'mock-integrity-token-12345'

    let fetchSpy: ReturnType<typeof spyOn>

    beforeEach(() => {
        // Spy on global fetch
        fetchSpy = spyOn(global, 'fetch')
    })

    afterEach(() => {
        fetchSpy.mockRestore()
    })

    it('should validate email format', async () => {
        const result = await subscribeToNewsletter(mockGhostSiteUrl, {
            email: 'invalid-email'
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Please enter a valid email address')
    })

    it('should fetch integrity token and make POST request with correct payload', async () => {
        // Mock integrity token response
        fetchSpy
            .mockResolvedValueOnce(
                new Response(mockIntegrityToken, {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain' }
                })
            )
            // Mock send-magic-link response
            .mockResolvedValueOnce(
                new Response('', {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' }
                })
            )

        await subscribeToNewsletter(mockGhostSiteUrl, {
            email: mockEmail,
            newsletters: ['newsletter-id-1']
        })

        // Should make 2 fetch calls: 1 for token, 1 for magic link
        expect(fetchSpy).toHaveBeenCalledTimes(2)

        // Check integrity token call
        expect(fetchSpy.mock.calls[0][0]).toBe(`${mockGhostSiteUrl}/members/api/integrity-token/`)
        expect(fetchSpy.mock.calls[0][1].method).toBe('GET')

        // Check magic link call
        expect(fetchSpy.mock.calls[1][0]).toBe(`${mockGhostSiteUrl}/members/api/send-magic-link`)
        const body = JSON.parse(fetchSpy.mock.calls[1][1].body as string)
        expect(body).toEqual({
            email: mockEmail,
            emailType: 'subscribe',
            integrityToken: mockIntegrityToken,
            newsletters: [{ id: 'newsletter-id-1' }]
        })
    })

    it('should return success for 201 response', async () => {
        fetchSpy
            .mockResolvedValueOnce(new Response(mockIntegrityToken, { status: 200 }))
            .mockResolvedValueOnce(new Response('', { status: 201 }))

        const result = await subscribeToNewsletter(mockGhostSiteUrl, {
            email: mockEmail
        })

        expect(result.success).toBe(true)
        expect(result.message).toBe(
            'Success! Please check your email to confirm your subscription.'
        )
    })

    it('should handle integrity token fetch failure', async () => {
        fetchSpy.mockResolvedValueOnce(
            new Response('', {
                status: 500
            })
        )

        const result = await subscribeToNewsletter(mockGhostSiteUrl, {
            email: mockEmail
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Network error. Please check your connection and try again.')
    })

    it('should handle Ghost API error responses', async () => {
        const errorMessage = 'Member already exists'
        fetchSpy
            .mockResolvedValueOnce(new Response(mockIntegrityToken, { status: 200 }))
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        errors: [{ message: errorMessage }]
                    }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                )
            )

        const result = await subscribeToNewsletter(mockGhostSiteUrl, {
            email: mockEmail
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe(errorMessage)
    })

    it('should handle generic error responses', async () => {
        fetchSpy
            .mockResolvedValueOnce(new Response(mockIntegrityToken, { status: 200 }))
            .mockResolvedValueOnce(
                new Response('', {
                    status: 500
                })
            )

        const result = await subscribeToNewsletter(mockGhostSiteUrl, {
            email: mockEmail
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Failed to subscribe. Please try again later.')
    })

    it('should handle network errors', async () => {
        fetchSpy.mockRejectedValue(new Error('Network error'))

        const result = await subscribeToNewsletter(mockGhostSiteUrl, {
            email: mockEmail
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Network error. Please check your connection and try again.')
    })

    it('should include name in payload when provided', async () => {
        fetchSpy
            .mockResolvedValueOnce(new Response(mockIntegrityToken, { status: 200 }))
            .mockResolvedValueOnce(new Response('', { status: 201 }))

        await subscribeToNewsletter(mockGhostSiteUrl, {
            email: mockEmail,
            name: 'Test User'
        })

        const body = JSON.parse(fetchSpy.mock.calls[1][1].body as string)
        expect(body.name).toBe('Test User')
    })

    it('should map newsletter IDs to objects', async () => {
        fetchSpy
            .mockResolvedValueOnce(new Response(mockIntegrityToken, { status: 200 }))
            .mockResolvedValueOnce(new Response('', { status: 201 }))

        await subscribeToNewsletter(mockGhostSiteUrl, {
            email: mockEmail,
            newsletters: ['newsletter-1', 'newsletter-2']
        })

        const body = JSON.parse(fetchSpy.mock.calls[1][1].body as string)
        expect(body.newsletters).toEqual([{ id: 'newsletter-1' }, { id: 'newsletter-2' }])
    })

    it('should not include newsletters in payload when empty array', async () => {
        fetchSpy
            .mockResolvedValueOnce(new Response(mockIntegrityToken, { status: 200 }))
            .mockResolvedValueOnce(new Response('', { status: 201 }))

        await subscribeToNewsletter(mockGhostSiteUrl, {
            email: mockEmail,
            newsletters: []
        })

        const body = JSON.parse(fetchSpy.mock.calls[1][1].body as string)
        expect(body.newsletters).toBeUndefined()
    })
})
