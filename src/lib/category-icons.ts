/**
 * Category icon utilities
 * Uses centralized icon registry from icon-registry.ts
 */

import { getIcon } from './icon-registry'

// Re-export for backwards compatibility
export { iconRegistry as categoryIconMap } from './icon-registry'

export function getCategoryIcon(
    iconName?: string
): React.ComponentType<{ className?: string }> | undefined {
    return getIcon(iconName)
}
