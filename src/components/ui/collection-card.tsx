import { Link } from 'react-router'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { FaStar } from 'react-icons/fa'

interface CollectionItem {
    id: string
    name: string
    description: string
    icon?: string | null
    color?: string | null
    featured?: boolean
}

interface CollectionCardProps<T extends CollectionItem> {
    /** The collection item to display (category, tag, etc.) */
    item: T

    /** Base path for the link (e.g., '/categories' or '/tags') */
    basePath: string

    /** Optional count of items in this collection */
    count?: number

    /** Show featured badge */
    showFeaturedBadge?: boolean

    /** Card variant */
    variant?: 'simple' | 'detailed'

    /** Optional custom label for count (defaults to 'product') */
    countLabel?: string
}

/**
 * Generic collection card component for displaying categories, tags, or similar collection items.
 * Supports two variants: simple (compact, icon-focused) and detailed (with description and metadata).
 *
 * @example
 * ```tsx
 * // Category card
 * <CollectionCard
 *   item={category}
 *   basePath="/categories"
 *   count={5}
 *   variant="detailed"
 * />
 *
 * // Tag card
 * <CollectionCard
 *   item={tag}
 *   basePath="/tags"
 *   showFeaturedBadge
 *   variant="simple"
 * />
 * ```
 */
export const CollectionCard = <T extends CollectionItem>({
    item,
    basePath,
    count,
    showFeaturedBadge = false,
    variant = 'detailed',
    countLabel = 'product'
}: CollectionCardProps<T>) => {
    if (variant === 'simple') {
        // Simple variant for homepage/compact displays
        return (
            <Link
                to={`${basePath}/${item.id}`}
                className='group border-primary/10 hover:border-secondary/30 hover:shadow-secondary/10 flex flex-col items-center justify-center rounded-xl border bg-gradient-to-br p-8 transition-all hover:scale-105 hover:shadow-xl'
                style={{
                    background: item.color
                        ? `linear-gradient(135deg, ${item.color}20, ${item.color}05)`
                        : undefined
                }}
            >
                {item.icon && (
                    <div
                        className='mb-3 flex h-16 w-16 items-center justify-center rounded-lg'
                        style={{
                            backgroundColor: item.color ? `${item.color}20` : undefined
                        }}
                    >
                        <DynamicIcon
                            iconName={item.icon}
                            className='h-8 w-8'
                            style={{ color: item.color ?? undefined }}
                        />
                    </div>
                )}
                <div className='group-hover:text-secondary text-lg font-bold'>{item.name}</div>
            </Link>
        )
    }

    // Detailed variant for collection pages
    return (
        <Link
            to={`${basePath}/${item.id}`}
            className='group border-primary/10 hover:border-secondary/30 relative flex cursor-pointer flex-col gap-4 rounded-xl border p-6 text-left transition-all hover:scale-102 hover:shadow-lg'
            style={{
                background: item.color
                    ? `linear-gradient(135deg, ${item.color}15, ${item.color}05)`
                    : undefined
            }}
        >
            {/* Featured badge */}
            {showFeaturedBadge && item.featured && (
                <div className='bg-secondary/10 border-secondary/30 absolute top-3 right-3 flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold'>
                    <FaStar className='text-secondary h-3 w-3' />
                    Featured
                </div>
            )}

            {/* Icon and Title */}
            <div className='flex items-center gap-4'>
                {item.icon && (
                    <div
                        className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg'
                        style={{
                            backgroundColor: item.color
                                ? `${item.color}20`
                                : 'rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <DynamicIcon
                            iconName={item.icon}
                            className='h-6 w-6'
                            style={{ color: item.color ?? undefined }}
                        />
                    </div>
                )}
                <h3 className='group-hover:text-secondary text-xl font-bold transition-colors'>
                    {item.name}
                </h3>
            </div>

            {/* Description */}
            <p className='text-primary/70 text-sm'>{item.description}</p>

            {/* Stats (only if count provided) */}
            {count !== undefined && (
                <div className='text-primary/50 mt-auto text-xs'>
                    <span>
                        {count} {count === 1 ? countLabel : `${countLabel}s`}
                    </span>
                </div>
            )}
        </Link>
    )
}
