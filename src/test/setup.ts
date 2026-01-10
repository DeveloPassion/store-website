import { afterEach } from 'bun:test'
import { Window } from 'happy-dom'

// CRITICAL: Set up Happy DOM BEFORE any other imports
// This ensures document.body is available when @testing-library/react's screen is imported
const happyWindow = new Window({
    url: 'http://localhost:3000',
    width: 1024,
    height: 768
})

// Set up globals IMMEDIATELY
// Happy DOM types need to be cast to global types for test environment
// We use 'as unknown as' to bridge incompatible type systems (Happy DOM vs standard DOM)
;(global as unknown as { window: Window }).window = happyWindow as unknown as Window
;(global as unknown as { document: Document }).document =
    happyWindow.document as unknown as Document
;(global as unknown as { navigator: Navigator }).navigator =
    happyWindow.navigator as unknown as Navigator
global.localStorage = happyWindow.localStorage
global.sessionStorage = happyWindow.sessionStorage
;(global as unknown as { HTMLElement: typeof HTMLElement }).HTMLElement =
    happyWindow.HTMLElement as unknown as typeof HTMLElement
;(global as unknown as { HTMLAnchorElement: typeof HTMLAnchorElement }).HTMLAnchorElement =
    happyWindow.HTMLAnchorElement as unknown as typeof HTMLAnchorElement
;(global as unknown as { HTMLButtonElement: typeof HTMLButtonElement }).HTMLButtonElement =
    happyWindow.HTMLButtonElement as unknown as typeof HTMLButtonElement
;(global as unknown as { HTMLInputElement: typeof HTMLInputElement }).HTMLInputElement =
    happyWindow.HTMLInputElement as unknown as typeof HTMLInputElement
;(global as unknown as { HTMLFormElement: typeof HTMLFormElement }).HTMLFormElement =
    happyWindow.HTMLFormElement as unknown as typeof HTMLFormElement
;(global as unknown as { HTMLDivElement: typeof HTMLDivElement }).HTMLDivElement =
    happyWindow.HTMLDivElement as unknown as typeof HTMLDivElement
;(global as unknown as { HTMLSpanElement: typeof HTMLSpanElement }).HTMLSpanElement =
    happyWindow.HTMLSpanElement as unknown as typeof HTMLSpanElement
;(global as unknown as { Element: typeof Element }).Element =
    happyWindow.Element as unknown as typeof Element
;(global as unknown as { Node: typeof Node }).Node = happyWindow.Node as unknown as typeof Node
;(global as unknown as { MouseEvent: typeof MouseEvent }).MouseEvent =
    happyWindow.MouseEvent as unknown as typeof MouseEvent
;(global as unknown as { KeyboardEvent: typeof KeyboardEvent }).KeyboardEvent =
    happyWindow.KeyboardEvent as unknown as typeof KeyboardEvent
;(global as unknown as { Event: typeof Event }).Event = happyWindow.Event as unknown as typeof Event

// Set up document body with a root element BEFORE loading testing library
happyWindow.document.body.innerHTML = '<div id="root"></div>'

// Make window.scrollY and scrollX writable for tests
Object.defineProperty(happyWindow, 'scrollY', {
    writable: true,
    configurable: true,
    value: 0
})

Object.defineProperty(happyWindow, 'scrollX', {
    writable: true,
    configurable: true,
    value: 0
})

// NOW we can import testing library - document.body is available
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock window.matchMedia
Object.defineProperty(happyWindow, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
    })
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
        return []
    }
    unobserve() {}
} as unknown as typeof IntersectionObserver

// Mock MutationObserver with functional attribute observation
global.MutationObserver = class MutationObserver {
    private callback: MutationCallback
    private timeoutId: ReturnType<typeof setTimeout> | null = null

    constructor(callback: MutationCallback) {
        this.callback = callback
    }

    observe(target: Node, config?: MutationObserverInit) {
        // For attribute observations on HTMLElement, intercept style.overflow changes
        if (config?.attributes && target instanceof HTMLElement) {
            const element = target as HTMLElement
            const callback = this.callback

            // Watch for style.overflow changes by intercepting the setter
            const style = element.style
            let overflowValue = style.overflow

            Object.defineProperty(style, 'overflow', {
                get: () => overflowValue,
                set: (value: string) => {
                    overflowValue = value
                    // Clear any existing timeout
                    if (this.timeoutId !== null) {
                        clearTimeout(this.timeoutId)
                    }
                    // Trigger callback asynchronously to mimic real MutationObserver behavior
                    this.timeoutId = setTimeout(() => {
                        callback([], {} as unknown as MutationObserver)
                        this.timeoutId = null
                    }, 0)
                },
                configurable: true
            })
        }
    }

    disconnect() {
        // Clear any pending timeouts
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId)
            this.timeoutId = null
        }
    }

    takeRecords(): MutationRecord[] {
        return []
    }
} as unknown as typeof MutationObserver

// Mock scrollTo
happyWindow.scrollTo = () => {}

// Cleanup after each test
afterEach(() => {
    cleanup()
    // Reset document body
    happyWindow.document.body.innerHTML = '<div id="root"></div>'
    // Reset scroll position (use writable property we defined earlier)
    ;(happyWindow as { scrollY: number }).scrollY = 0
    ;(happyWindow as { scrollX: number }).scrollX = 0
    // Clear storage
    localStorage.clear()
    sessionStorage.clear()
})
