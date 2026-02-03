import { Link } from 'react-router'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { FaStar } from 'react-icons/fa'
import { getColorClasses, defaultColorClasses } from '@/lib/color-classes'
import type { ColorKey } from '@/schemas/color-key.schema'

interface CollectionItem {
    id: string
    name: string
    description: string
    icon?: string | null
    color?: ColorKey | null
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
    // Get color classes from the color key
    const colorClasses = getColorClasses(item.color) ?? defaultColorClasses

    if (variant === 'simple') {
        // Simple variant for homepage/compact displays
        return (
            <Link
                to={`${basePath}/${item.id}`}
                className='group border-primary/10 hover:border-secondary/30 hover:shadow-secondary/10 flex flex-col items-center justify-center rounded-xl border bg-gradient-to-br p-8 transition-all hover:scale-105 hover:shadow-xl'
            >
                {item.icon && (
                    <div
                        className={`mb-3 flex h-16 w-16 items-center justify-center rounded-lg ${item.color ? colorClasses.bgTint : ''}`}
                    >
                        <DynamicIcon
                            iconName={item.icon}
                            className={`h-8 w-8 ${item.color ? colorClasses.text : ''}`}
                        />
                    </div>
                )}
                <div className='group-hover:text-secondary text-center text-lg font-bold'>
                    {item.name}
                </div>
            </Link>
        )
    }

    // Detailed variant for collection pages
    return (
        <Link
            to={`${basePath}/${item.id}`}
            className='group border-primary/10 hover:border-secondary/30 relative flex cursor-pointer flex-col gap-4 rounded-xl border p-6 text-left transition-all hover:scale-102 hover:shadow-lg'
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
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${item.color ? colorClasses.bgTint : 'bg-card-subtle-hover'}`}
                    >
                        <DynamicIcon
                            iconName={item.icon}
                            className={`h-6 w-6 ${item.color ? colorClasses.text : ''}`}
                        />
                    </div>
                )}
                <h3 className='group-hover:text-secondary text-xl font-bold transition-colors'>
                    {item.name}
                </h3>
            </div>

            {/* Description */}
            <MarkdownContent
                content={item.description}
                inline
                className='text-primary/70 text-sm'
            />

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
