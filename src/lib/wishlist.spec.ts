import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    getWishlistCount
} from './wishlist'

const WISHLIST_STORAGE_KEY = 'dsebastien-store-wishlist'

describe('Wishlist Utilities', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear()
    })

    afterEach(() => {
        // Clean up after each test
        localStorage.clear()
    })

    describe('getWishlist', () => {
        it('should return empty array when no wishlist exists', () => {
            expect(getWishlist()).toEqual([])
        })

        it('should return array of product IDs from localStorage', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(['product1', 'product2']))
            expect(getWishlist()).toEqual(['product1', 'product2'])
        })

        it('should return empty array for corrupted data', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, 'invalid-json')
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            expect(getWishlist()).toEqual([])
            expect(consoleSpy).toHaveBeenCalled()
            consoleSpy.mockRestore()
        })

        it('should return empty array for non-array data', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
            expect(getWishlist()).toEqual([])
        })

        it('should handle localStorage errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('localStorage error')
            })

            expect(getWishlist()).toEqual([])
            expect(consoleSpy).toHaveBeenCalled()

            consoleSpy.mockRestore()
            vi.restoreAllMocks()
        })
    })

    describe('addToWishlist', () => {
        it('should add product to empty wishlist', () => {
            const result = addToWishlist('product1')
            expect(result).toBe(true)
            expect(getWishlist()).toEqual(['product1'])
        })

        it('should add product to existing wishlist', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(['product1']))
            const result = addToWishlist('product2')
            expect(result).toBe(true)
            expect(getWishlist()).toEqual(['product1', 'product2'])
        })

        it('should not add duplicate product', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(['product1']))
            const result = addToWishlist('product1')
            expect(result).toBe(false)
            expect(getWishlist()).toEqual(['product1'])
        })

        it('should handle multiple additions', () => {
            addToWishlist('product1')
            addToWishlist('product2')
            addToWishlist('product3')
            expect(getWishlist()).toEqual(['product1', 'product2', 'product3'])
        })
    })

    describe('removeFromWishlist', () => {
        it('should remove product from wishlist', () => {
            localStorage.setItem(
                WISHLIST_STORAGE_KEY,
                JSON.stringify(['product1', 'product2', 'product3'])
            )
            const result = removeFromWishlist('product2')
            expect(result).toBe(true)
            expect(getWishlist()).toEqual(['product1', 'product3'])
        })

        it('should return false when product not in wishlist', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(['product1']))
            const result = removeFromWishlist('product2')
            expect(result).toBe(false)
            expect(getWishlist()).toEqual(['product1'])
        })

        it('should handle removing from empty wishlist', () => {
            const result = removeFromWishlist('product1')
            expect(result).toBe(false)
            expect(getWishlist()).toEqual([])
        })

        it('should handle removing last item', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(['product1']))
            const result = removeFromWishlist('product1')
            expect(result).toBe(true)
            expect(getWishlist()).toEqual([])
        })
    })

    describe('isInWishlist', () => {
        it('should return true for product in wishlist', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(['product1', 'product2']))
            expect(isInWishlist('product1')).toBe(true)
            expect(isInWishlist('product2')).toBe(true)
        })

        it('should return false for product not in wishlist', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(['product1']))
            expect(isInWishlist('product2')).toBe(false)
        })

        it('should return false for empty wishlist', () => {
            expect(isInWishlist('product1')).toBe(false)
        })
    })

    describe('toggleWishlist', () => {
        it('should add product when not in wishlist', () => {
            const result = toggleWishlist('product1')
            expect(result).toBe(true) // true means added
            expect(isInWishlist('product1')).toBe(true)
        })

        it('should remove product when in wishlist', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(['product1']))
            const result = toggleWishlist('product1')
            expect(result).toBe(false) // false means removed
            expect(isInWishlist('product1')).toBe(false)
        })

        it('should toggle product multiple times', () => {
            // Add
            let result = toggleWishlist('product1')
            expect(result).toBe(true)
            expect(isInWishlist('product1')).toBe(true)

            // Remove
            result = toggleWishlist('product1')
            expect(result).toBe(false)
            expect(isInWishlist('product1')).toBe(false)

            // Add again
            result = toggleWishlist('product1')
            expect(result).toBe(true)
            expect(isInWishlist('product1')).toBe(true)
        })
    })

    describe('clearWishlist', () => {
        it('should clear all items from wishlist', () => {
            localStorage.setItem(
                WISHLIST_STORAGE_KEY,
                JSON.stringify(['product1', 'product2', 'product3'])
            )
            clearWishlist()
            expect(getWishlist()).toEqual([])
            expect(localStorage.getItem(WISHLIST_STORAGE_KEY)).toBeNull()
        })

        it('should handle clearing empty wishlist', () => {
            clearWishlist()
            expect(getWishlist()).toEqual([])
        })

        it('should handle localStorage errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new Error('localStorage error')
            })

            clearWishlist()
            expect(consoleSpy).toHaveBeenCalled()

            consoleSpy.mockRestore()
            vi.restoreAllMocks()
        })
    })

    describe('getWishlistCount', () => {
        it('should return 0 for empty wishlist', () => {
            expect(getWishlistCount()).toBe(0)
        })

        it('should return correct count for wishlist with items', () => {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(['product1', 'product2']))
            expect(getWishlistCount()).toBe(2)
        })

        it('should return correct count after adding items', () => {
            addToWishlist('product1')
            expect(getWishlistCount()).toBe(1)
            addToWishlist('product2')
            expect(getWishlistCount()).toBe(2)
            addToWishlist('product3')
            expect(getWishlistCount()).toBe(3)
        })

        it('should return correct count after removing items', () => {
            localStorage.setItem(
                WISHLIST_STORAGE_KEY,
                JSON.stringify(['product1', 'product2', 'product3'])
            )
            expect(getWishlistCount()).toBe(3)
            removeFromWishlist('product2')
            expect(getWishlistCount()).toBe(2)
            removeFromWishlist('product1')
            expect(getWishlistCount()).toBe(1)
        })
    })

    describe('Edge cases and error handling', () => {
        it('should handle empty string product IDs', () => {
            addToWishlist('')
            expect(getWishlist()).toEqual([''])
        })

        it('should handle special characters in product IDs', () => {
            const specialId = 'product-with-special-chars!@#$%^&*()'
            addToWishlist(specialId)
            expect(isInWishlist(specialId)).toBe(true)
        })

        it('should handle very long product IDs', () => {
            const longId = 'a'.repeat(1000)
            addToWishlist(longId)
            expect(isInWishlist(longId)).toBe(true)
        })

        it('should maintain order of additions', () => {
            addToWishlist('product1')
            addToWishlist('product2')
            addToWishlist('product3')
            expect(getWishlist()).toEqual(['product1', 'product2', 'product3'])
        })

        it('should handle localStorage quota exceeded', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                const error = new Error('QuotaExceededError')
                error.name = 'QuotaExceededError'
                throw error
            })

            addToWishlist('product1')
            expect(consoleSpy).toHaveBeenCalled()

            consoleSpy.mockRestore()
            vi.restoreAllMocks()
        })
    })

    describe('Integration scenarios', () => {
        it('should handle complete user workflow', () => {
            // User adds products
            expect(addToWishlist('product1')).toBe(true)
            expect(addToWishlist('product2')).toBe(true)
            expect(addToWishlist('product3')).toBe(true)
            expect(getWishlistCount()).toBe(3)

            // User checks wishlist
            expect(isInWishlist('product1')).toBe(true)
            expect(isInWishlist('product2')).toBe(true)
            expect(isInWishlist('product3')).toBe(true)

            // User removes one product
            expect(removeFromWishlist('product2')).toBe(true)
            expect(getWishlistCount()).toBe(2)
            expect(isInWishlist('product2')).toBe(false)

            // User toggles products
            expect(toggleWishlist('product1')).toBe(false) // remove
            expect(toggleWishlist('product2')).toBe(true) // add
            expect(getWishlistCount()).toBe(2)

            // User clears wishlist
            clearWishlist()
            expect(getWishlistCount()).toBe(0)
            expect(getWishlist()).toEqual([])
        })
    })
})
