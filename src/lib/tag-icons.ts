/**
 * Tag icon utilities
 * Uses centralized icon registry from icon-registry.ts
 */

import { FaTag } from 'react-icons/fa'
import { getIconWithFallback } from './icon-registry'

// Re-export for backwards compatibility
export { iconRegistry as tagIconMap } from './icon-registry'

/**
 * Get icon component for a tag
 * Falls back to FaTag if icon not found
 */
export function getTagIcon(iconName?: string): React.ComponentType<{ className?: string }> {
    return getIconWithFallback(iconName, FaTag)
}
