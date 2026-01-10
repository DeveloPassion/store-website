/**
 * Wishlist utility functions for managing product wishlists in local storage
 */

const WISHLIST_STORAGE_KEY = 'dsebastien-store-wishlist'

/**
 * Get all product IDs from the wishlist
 * @returns Array of product IDs in the wishlist
 */
export function getWishlist(): string[] {
    try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
        if (!stored) {
            return []
        }
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        console.error('Error reading wishlist from localStorage:', error)
        return []
    }
}

/**
 * Save the wishlist to local storage and dispatch update event
 * @param wishlist - Array of product IDs to save
 */
function saveWishlist(wishlist: string[]): void {
    try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
        // Dispatch custom event to notify components of wishlist changes
        window.dispatchEvent(new Event('wishlistUpdate'))
    } catch (error) {
        console.error('Error saving wishlist to localStorage:', error)
    }
}

/**
 * Add a product to the wishlist
 * @param productId - The product ID to add
 * @returns true if added successfully, false if already in wishlist
 */
export function addToWishlist(productId: string): boolean {
    const wishlist = getWishlist()
    if (wishlist.includes(productId)) {
        return false
    }
    wishlist.push(productId)
    saveWishlist(wishlist)
    return true
}

/**
 * Remove a product from the wishlist
 * @param productId - The product ID to remove
 * @returns true if removed successfully, false if not in wishlist
 */
export function removeFromWishlist(productId: string): boolean {
    const wishlist = getWishlist()
    const index = wishlist.indexOf(productId)
    if (index === -1) {
        return false
    }
    wishlist.splice(index, 1)
    saveWishlist(wishlist)
    return true
}

/**
 * Check if a product is in the wishlist
 * @param productId - The product ID to check
 * @returns true if the product is in the wishlist
 */
export function isInWishlist(productId: string): boolean {
    const wishlist = getWishlist()
    return wishlist.includes(productId)
}

/**
 * Toggle a product in/out of the wishlist
 * @param productId - The product ID to toggle
 * @returns true if added, false if removed
 */
export function toggleWishlist(productId: string): boolean {
    if (isInWishlist(productId)) {
        removeFromWishlist(productId)
        return false
    } else {
        addToWishlist(productId)
        return true
    }
}

/**
 * Clear all items from the wishlist
 */
export function clearWishlist(): void {
    try {
        localStorage.removeItem(WISHLIST_STORAGE_KEY)
        // Dispatch custom event to notify components of wishlist changes
        window.dispatchEvent(new Event('wishlistUpdate'))
    } catch (error) {
        console.error('Error clearing wishlist from localStorage:', error)
    }
}

/**
 * Get the number of items in the wishlist
 * @returns The count of wishlist items
 */
export function getWishlistCount(): number {
    return getWishlist().length
}
