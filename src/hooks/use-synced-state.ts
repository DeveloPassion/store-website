import { useState, useEffect, useRef } from 'react'

/**
 * A hook that creates state which resets when a key changes.
 *
 * This is useful for components that receive props which may change during the component's
 * lifetime, and need to reset internal state when those props change.
 *
 * React's recommended pattern is to use a `key` prop on the component to force remounting,
 * but this isn't always practical for widely-used components. This hook provides a clean
 * alternative that encapsulates the pattern.
 *
 * @param key - A value that, when changed, causes the state to reset
 * @param initialValueFn - A function that returns the initial (and reset) value
 * @returns A tuple of [state, setState] similar to useState
 *
 * @example
 * // Reset wishlist state when product.id changes
 * const [isWishlisted, setIsWishlisted] = useSyncedState(
 *   product.id,
 *   () => isInWishlist(product.id)
 * )
 */
export function useSyncedState<T>(
    key: string | number,
    initialValueFn: () => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(initialValueFn)
    const prevKeyRef = useRef(key)

    // Reset state when key changes (skip initial render)
    useEffect(() => {
        if (prevKeyRef.current !== key) {
            prevKeyRef.current = key
            // This setState in effect is intentional - we're synchronizing state
            // with a changing identifier, which is a valid use case per React docs.
            // The ref check ensures we don't run on initial render.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState(initialValueFn())
        }
    }, [key, initialValueFn])

    return [state, setState]
}
