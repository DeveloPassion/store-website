/**
 * Share utility functions for sharing products and pages
 */

/**
 * Get the full URL for a product page
 * @param productId - The product ID
 * @returns The full shareable URL
 */
export function getProductShareUrl(productId: string): string {
    const baseUrl = window.location.origin
    return `${baseUrl}/product/${productId}`
}

/**
 * Get the share text for a product
 * @param productName - The product name
 * @param tagline - Optional tagline to include
 * @returns The share text
 */
export function getShareText(productName: string, tagline?: string | null): string {
    if (tagline) {
        return `${productName} - ${tagline}`
    }
    return productName
}

/**
 * Copy text to clipboard
 * @param text - The text to copy
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        return false
    }
}

/**
 * Check if the Web Share API is available
 * @returns true if Web Share API can be used
 */
export function canUseWebShare(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

/**
 * Share data using the Web Share API
 * @param data - The share data (url, title, text)
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function webShare(data: ShareData): Promise<boolean> {
    if (!canUseWebShare()) {
        return false
    }
    try {
        await navigator.share(data)
        return true
    } catch (error) {
        // User cancelled or share failed
        if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Web Share failed:', error)
        }
        return false
    }
}

/**
 * Open a social share URL in a new window
 * @param platform - The platform to share on
 * @param url - The URL to share
 * @param text - The text to share
 */
export function openSocialShare(platform: 'twitter' | 'linkedin', url: string, text: string): void {
    let shareUrl: string

    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
            break
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
            break
        default:
            return
    }

    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer')
}
