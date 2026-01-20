import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test'
import {
    getProductShareUrl,
    getShareText,
    copyToClipboard,
    canUseWebShare,
    webShare,
    openSocialShare
} from './share'

describe('Share Utilities', () => {
    const originalLocation = window.location

    beforeEach(() => {
        // Mock window.location.origin
        Object.defineProperty(window, 'location', {
            value: {
                ...originalLocation,
                origin: 'https://example.com'
            },
            writable: true
        })
    })

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true
        })
    })

    describe('getProductShareUrl', () => {
        it('should return full URL for product', () => {
            const url = getProductShareUrl('my-product')
            expect(url).toBe('https://example.com/product/my-product')
        })

        it('should handle product IDs with special characters', () => {
            const url = getProductShareUrl('my-product-2024')
            expect(url).toBe('https://example.com/product/my-product-2024')
        })

        it('should handle empty product ID', () => {
            const url = getProductShareUrl('')
            expect(url).toBe('https://example.com/product/')
        })
    })

    describe('getShareText', () => {
        it('should return product name when no tagline', () => {
            const text = getShareText('My Product')
            expect(text).toBe('My Product')
        })

        it('should return product name and tagline when provided', () => {
            const text = getShareText('My Product', 'This is a great product')
            expect(text).toBe('My Product - This is a great product')
        })

        it('should handle null tagline', () => {
            const text = getShareText('My Product', null)
            expect(text).toBe('My Product')
        })

        it('should handle empty tagline', () => {
            const text = getShareText('My Product', '')
            expect(text).toBe('My Product')
        })
    })

    describe('copyToClipboard', () => {
        it('should copy text to clipboard successfully', async () => {
            const writeTextSpy = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(
                undefined
            )

            const result = await copyToClipboard('test text')
            expect(result).toBe(true)
            expect(writeTextSpy).toHaveBeenCalledWith('test text')

            writeTextSpy.mockRestore()
        })

        it('should return false when clipboard API fails', async () => {
            const consoleSpy = spyOn(console, 'error').mockImplementation(() => {})
            const writeTextSpy = spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
                new Error('Clipboard error')
            )

            const result = await copyToClipboard('test text')
            expect(result).toBe(false)
            expect(consoleSpy).toHaveBeenCalled()

            consoleSpy.mockRestore()
            writeTextSpy.mockRestore()
        })
    })

    describe('canUseWebShare', () => {
        it('should return a boolean', () => {
            // This tests the logic of the function
            const result = canUseWebShare()
            expect(typeof result).toBe('boolean')
        })
    })

    describe('webShare', () => {
        it('should return false when Web Share API is not available', async () => {
            // In test environment without share API
            const originalShare = navigator.share
            // @ts-expect-error - deliberately setting to undefined for test
            delete navigator.share

            const result = await webShare({
                url: 'https://example.com',
                title: 'Test'
            })

            expect(result).toBe(false)

            // Restore
            if (originalShare) {
                navigator.share = originalShare
            }
        })
    })

    describe('openSocialShare', () => {
        let windowOpenSpy: ReturnType<typeof spyOn>

        beforeEach(() => {
            windowOpenSpy = spyOn(window, 'open').mockImplementation(() => null)
        })

        afterEach(() => {
            windowOpenSpy.mockRestore()
        })

        it('should open Twitter share URL with correct parameters', () => {
            openSocialShare('twitter', 'https://example.com/product/test', 'Check this out')

            expect(windowOpenSpy).toHaveBeenCalledWith(
                'https://twitter.com/intent/tweet?url=https%3A%2F%2Fexample.com%2Fproduct%2Ftest&text=Check%20this%20out',
                '_blank',
                'width=600,height=400,noopener,noreferrer'
            )
        })

        it('should open LinkedIn share URL with correct parameters', () => {
            openSocialShare('linkedin', 'https://example.com/product/test', 'Check this out')

            expect(windowOpenSpy).toHaveBeenCalledWith(
                'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fexample.com%2Fproduct%2Ftest',
                '_blank',
                'width=600,height=400,noopener,noreferrer'
            )
        })

        it('should encode special characters in URL and text', () => {
            openSocialShare(
                'twitter',
                'https://example.com/product/test?foo=bar&baz=qux',
                'Check this out! #awesome'
            )

            expect(windowOpenSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    'url=https%3A%2F%2Fexample.com%2Fproduct%2Ftest%3Ffoo%3Dbar%26baz%3Dqux'
                ),
                '_blank',
                'width=600,height=400,noopener,noreferrer'
            )
        })

        it('should handle empty text', () => {
            openSocialShare('twitter', 'https://example.com', '')

            expect(windowOpenSpy).toHaveBeenCalledWith(
                'https://twitter.com/intent/tweet?url=https%3A%2F%2Fexample.com&text=',
                '_blank',
                'width=600,height=400,noopener,noreferrer'
            )
        })
    })
})
