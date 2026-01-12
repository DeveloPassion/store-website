import { CollectionCard } from '@/components/ui/collection-card'
import type { Category } from '@/types/category'

interface CategoryCardProps {
    category: Category
    count?: number
    showFeaturedBadge?: boolean
    variant?: 'simple' | 'detailed'
}

/**
 * Category card component - a specialized wrapper around CollectionCard for displaying categories.
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    count,
    showFeaturedBadge = false,
    variant = 'detailed'
}) => {
    return (
        <CollectionCard
            item={category}
            basePath='/categories'
            count={count}
            showFeaturedBadge={showFeaturedBadge}
            variant={variant}
        />
    )
}
