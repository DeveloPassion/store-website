import { CollectionCard } from '@/components/ui/collection-card'
import type { Tag } from '@/types/tag'

interface TagCardProps {
    tag: Tag
    count?: number
    showFeaturedBadge?: boolean
    variant?: 'simple' | 'detailed'
}

/**
 * Tag card component - a specialized wrapper around CollectionCard for displaying tags.
 */
export const TagCard: React.FC<TagCardProps> = ({
    tag,
    count,
    showFeaturedBadge = false,
    variant = 'detailed'
}) => {
    return (
        <CollectionCard
            item={tag}
            basePath='/tags'
            count={count}
            showFeaturedBadge={showFeaturedBadge}
            variant={variant}
        />
    )
}
