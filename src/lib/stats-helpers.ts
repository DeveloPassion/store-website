import type { StatItem } from '@/schemas/stats.schema'

export interface ResolvedStatItem {
    value: string
    label: string
}

/**
 * Resolves a StatItem (string or object) to a value/label pair.
 *
 * @param stat - The stat item (string, object, null, or undefined)
 * @param defaultLabel - The default label to use if not specified
 * @returns Object with value and label, or null if stat is null/undefined
 *
 * @example
 * // Simple string → uses default label
 * resolveStatItem("350+", "Users") → { value: "350+", label: "Users" }
 *
 * // Object with custom label
 * resolveStatItem({ value: "350+", label: "Members" }, "Users") → { value: "350+", label: "Members" }
 *
 * // Object with null label → uses default
 * resolveStatItem({ value: "350+", label: null }, "Users") → { value: "350+", label: "Users" }
 *
 * // Null/undefined → returns null
 * resolveStatItem(null, "Users") → null
 */
export function resolveStatItem(
    stat: StatItem | null | undefined,
    defaultLabel: string
): ResolvedStatItem | null {
    if (!stat) return null

    if (typeof stat === 'string') {
        return { value: stat, label: defaultLabel }
    }

    return {
        value: stat.value,
        label: stat.label ?? defaultLabel
    }
}

/**
 * Extracts the raw value from a StatItem (string or object).
 * Useful for parsing numeric values from stat items.
 *
 * @param stat - The stat item (string, object, null, or undefined)
 * @returns The raw value string, or undefined if stat is null/undefined
 */
export function getStatValue(stat: StatItem | null | undefined): string | undefined {
    if (!stat) return undefined
    if (typeof stat === 'string') return stat
    return stat.value
}
