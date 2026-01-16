/**
 * Category icon utilities
 * Uses centralized icon registry from icon-registry.ts
 */

import { getIcon } from './icon-registry'

export function getCategoryIcon(
    iconName?: string | null
): React.ComponentType<{ className?: string }> | undefined {
    return getIcon(iconName)
}
