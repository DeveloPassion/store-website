import { Link } from 'react-router'
import { getTagIcon } from '@/lib/tag-icons'
import { FaStar } from 'react-icons/fa'
import type { Tag } from '@/types/tag'

interface TagCardProps {
    tag: Tag
    count?: number
    showFeaturedBadge?: boolean
    variant?: 'simple' | 'detailed'
}

export const TagCard: React.FC<TagCardProps> = ({
    tag,
    count,
    showFeaturedBadge = false,
    variant = 'detailed'
}) => {
    const IconComponent = getTagIcon(tag.icon)

    if (variant === 'simple') {
        // Simple variant for homepage
        return (
            <Link
                to={`/tags/${tag.id}`}
                className='group border-primary/10 hover:border-secondary/30 hover:shadow-secondary/10 flex flex-col items-center justify-center rounded-xl border bg-gradient-to-br p-8 transition-all hover:scale-105 hover:shadow-xl'
                style={{
                    background: tag.color
                        ? `linear-gradient(135deg, ${tag.color}20, ${tag.color}05)`
                        : undefined
                }}
            >
                {IconComponent && (
                    <div
                        className='mb-3 flex h-16 w-16 items-center justify-center rounded-lg'
                        style={{
                            backgroundColor: tag.color ? `${tag.color}20` : undefined
                        }}
                    >
                        <div style={{ color: tag.color }}>
                            <IconComponent className='h-8 w-8' />
                        </div>
                    </div>
                )}
                <div className='group-hover:text-secondary text-lg font-bold'>{tag.name}</div>
            </Link>
        )
    }

    // Detailed variant for tags page
    return (
        <Link
            to={`/tags/${tag.id}`}
            className='group border-primary/10 hover:border-secondary/30 relative flex cursor-pointer flex-col gap-4 rounded-xl border p-6 text-left transition-all hover:scale-102 hover:shadow-lg'
            style={{
                background: tag.color
                    ? `linear-gradient(135deg, ${tag.color}15, ${tag.color}05)`
                    : undefined
            }}
        >
            {/* Featured badge */}
            {showFeaturedBadge && (
                <div className='bg-secondary/10 border-secondary/30 absolute top-3 right-3 flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold'>
                    <FaStar className='text-secondary h-3 w-3' />
                    Featured
                </div>
            )}

            {/* Icon and Title */}
            <div className='flex items-center gap-4'>
                {IconComponent && (
                    <div
                        className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg'
                        style={{
                            backgroundColor: tag.color
                                ? `${tag.color}20`
                                : 'rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <div style={{ color: tag.color }}>
                            <IconComponent className='h-6 w-6' />
                        </div>
                    </div>
                )}
                <h3 className='group-hover:text-secondary text-xl font-bold transition-colors'>
                    {tag.name}
                </h3>
            </div>

            {/* Description */}
            <p className='text-primary/70 text-sm'>{tag.description}</p>

            {/* Stats (only if count provided) */}
            {count !== undefined && (
                <div className='text-primary/50 mt-auto text-xs'>
                    <span>
                        {count} {count === 1 ? 'product' : 'products'}
                    </span>
                </div>
            )}
        </Link>
    )
}
