import { describe, it, expect } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { useMediaLightbox } from './use-media-lightbox'

describe('useMediaLightbox', () => {
    it('should initialize with closed state and index 0', () => {
        const { result } = renderHook(() => useMediaLightbox())

        expect(result.current.isOpen).toBe(false)
        expect(result.current.selectedIndex).toBe(0)
    })

    it('should open lightbox and set selected index', () => {
        const { result } = renderHook(() => useMediaLightbox())

        act(() => {
            result.current.open({ id: 'test' }, 3)
        })

        expect(result.current.isOpen).toBe(true)
        expect(result.current.selectedIndex).toBe(3)
    })

    it('should close lightbox', () => {
        const { result } = renderHook(() => useMediaLightbox())

        // Open first
        act(() => {
            result.current.open({ id: 'test' }, 2)
        })
        expect(result.current.isOpen).toBe(true)

        // Then close
        act(() => {
            result.current.close()
        })
        expect(result.current.isOpen).toBe(false)
        // Index should remain unchanged after close
        expect(result.current.selectedIndex).toBe(2)
    })

    it('should update index when opening at different positions', () => {
        const { result } = renderHook(() => useMediaLightbox())

        act(() => {
            result.current.open({ id: 'first' }, 1)
        })
        expect(result.current.selectedIndex).toBe(1)

        act(() => {
            result.current.close()
        })

        act(() => {
            result.current.open({ id: 'second' }, 5)
        })
        expect(result.current.selectedIndex).toBe(5)
    })

    it('should have stable function references', () => {
        const { result, rerender } = renderHook(() => useMediaLightbox())

        const initialOpen = result.current.open
        const initialClose = result.current.close

        rerender()

        expect(result.current.open).toBe(initialOpen)
        expect(result.current.close).toBe(initialClose)
    })
})
