import { useState, useCallback } from 'react'

/**
 * Custom hook for managing media lightbox state.
 * Provides open/close functionality and tracks the selected media index.
 */
export function useMediaLightbox() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const open = useCallback((_item: unknown, index: number) => {
        setSelectedIndex(index)
        setIsOpen(true)
    }, [])

    const close = useCallback(() => setIsOpen(false), [])

    return { isOpen, selectedIndex, open, close }
}
