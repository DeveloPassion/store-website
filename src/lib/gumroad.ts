/**
 * Gumroad integration utilities
 */

export interface GumroadOptions {
    url: string
    variant?: string
    wanted?: boolean
}

/**
 * Load the Gumroad overlay script
 */
export const loadGumroadScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (document.querySelector('script[src*="gumroad.com/js/gumroad.js"]')) {
            resolve()
            return
        }

        const script = document.createElement('script')
        script.src = 'https://gumroad.com/js/gumroad.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Gumroad script'))
        document.body.appendChild(script)
    })
}

/**
 * Open Gumroad overlay for product purchase
 */
export const openGumroadOverlay = async (options: GumroadOptions): Promise<void> => {
    try {
        // Ensure script is loaded
        await loadGumroadScript()

        // Build URL with parameters
        let url = options.url

        // Add wanted parameter for variant selection
        if (options.wanted !== false) {
            url += url.includes('?') ? '&wanted=true' : '?wanted=true'
        }

        // Open overlay using Gumroad's global function
        if (window.GumroadOverlay) {
            window.GumroadOverlay.open({ url })
        } else {
            // Fallback: open in new tab if overlay isn't available
            window.open(url, '_blank')
        }
    } catch (error) {
        console.error('Failed to open Gumroad overlay:', error)
        // Fallback: open in new tab
        window.open(options.url, '_blank')
    }
}

// Extend Window interface for Gumroad global
declare global {
    interface Window {
        GumroadOverlay?: {
            open: (options: { url: string }) => void
        }
    }
}
