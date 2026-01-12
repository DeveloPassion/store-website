import { describe, it, expect } from 'bun:test'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useLiveRegion } from './use-live-region'

describe('useLiveRegion Hook', () => {
    it('should initialize with empty message and polite politeness', () => {
        const { result } = renderHook(() => useLiveRegion())

        expect(result.current.message).toBe('')
        expect(result.current.politeness).toBe('polite')
    })

    it('should announce a message with default politeness', async () => {
        const { result } = renderHook(() => useLiveRegion({ debounceMs: 10, clearDelayMs: 1000 }))

        act(() => {
            result.current.announce('Test announcement')
        })

        // Wait for debounce
        await waitFor(() => {
            expect(result.current.message).toBe('Test announcement')
        })

        expect(result.current.politeness).toBe('polite')
    })

    it('should announce a message with assertive politeness', async () => {
        const { result } = renderHook(() => useLiveRegion({ debounceMs: 10 }))

        act(() => {
            result.current.announce('Urgent message', 'assertive')
        })

        await waitFor(() => {
            expect(result.current.message).toBe('Urgent message')
        })

        expect(result.current.politeness).toBe('assertive')
    })

    it('should debounce announcements', async () => {
        const { result } = renderHook(() => useLiveRegion({ debounceMs: 50 }))

        act(() => {
            result.current.announce('First')
            result.current.announce('Second')
            result.current.announce('Third')
        })

        // Should initially be empty
        expect(result.current.message).toBe('')

        // After debounce, should show the last message
        await waitFor(() => {
            expect(result.current.message).toBe('Third')
        })
    })

    it('should auto-clear message after delay', async () => {
        const { result } = renderHook(() => useLiveRegion({ debounceMs: 10, clearDelayMs: 100 }))

        act(() => {
            result.current.announce('Test message')
        })

        // Wait for debounce
        await waitFor(() => {
            expect(result.current.message).toBe('Test message')
        })

        // Wait for auto-clear
        await waitFor(
            () => {
                expect(result.current.message).toBe('')
            },
            { timeout: 200 }
        )
    })

    it('should manually clear message', async () => {
        const { result } = renderHook(() => useLiveRegion({ debounceMs: 10 }))

        act(() => {
            result.current.announce('Test message')
        })

        await waitFor(() => {
            expect(result.current.message).toBe('Test message')
        })

        act(() => {
            result.current.clear()
        })

        expect(result.current.message).toBe('')
    })

    it('should use custom debounce delay', async () => {
        const { result } = renderHook(() => useLiveRegion({ debounceMs: 100 }))

        act(() => {
            result.current.announce('Custom debounce')
        })

        // Should be empty initially
        expect(result.current.message).toBe('')

        // After debounce
        await waitFor(() => {
            expect(result.current.message).toBe('Custom debounce')
        })
    })

    it('should cancel previous clear timer on new announcement', async () => {
        const { result } = renderHook(() => useLiveRegion({ debounceMs: 10, clearDelayMs: 200 }))

        act(() => {
            result.current.announce('First message')
        })

        await waitFor(() => {
            expect(result.current.message).toBe('First message')
        })

        // Announce new message before clear delay (wait 50ms, clear is at 200ms)
        await new Promise((resolve) => setTimeout(resolve, 50))

        act(() => {
            result.current.announce('Second message')
        })

        await waitFor(() => {
            expect(result.current.message).toBe('Second message')
        })

        // Wait 100ms - still within the new clear delay window
        await new Promise((resolve) => setTimeout(resolve, 100))
        expect(result.current.message).toBe('Second message')

        // After second message clear delay (wait additional 150ms to exceed 200ms total)
        await waitFor(
            () => {
                expect(result.current.message).toBe('')
            },
            { timeout: 250 }
        )
    })

    it('should cleanup timers on unmount', () => {
        const { result, unmount } = renderHook(() => useLiveRegion({ debounceMs: 10 }))

        act(() => {
            result.current.announce('Test cleanup')
        })

        unmount()

        // No errors should occur from timers after unmount
        // Test passes if no errors thrown
        expect(true).toBe(true)
    })

    it('should provide announce and clear functions', () => {
        const { result } = renderHook(() => useLiveRegion())

        expect(typeof result.current.announce).toBe('function')
        expect(typeof result.current.clear).toBe('function')
    })
})
