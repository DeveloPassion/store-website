import { Link, useLocation, useParams } from 'react-router'
import { useMemo } from 'react'
import { FaChevronRight } from 'react-icons/fa'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import tagsData from '@/data/tags.json'
import type { Product } from '@/types/product'
import type { Category } from '@/types/category'
import type { Tag, TagId } from '@/types/tag'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbProps {
    className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ className }) => {
    const location = useLocation()
    const params = useParams()

    const breadcrumbItems = useMemo(() => {
        const pathname = location.pathname

        // Homepage - no breadcrumbs
        if (pathname === '/') return null

        const items: BreadcrumbItem[] = []
        const products = productsData as Product[]
        const categories = categoriesData as Category[]
        const tags = tagsData as Record<TagId, Tag>

        // Always start with Home
        items.push({ label: 'Home', href: '/' })

        // Route matching with data lookup
        if (pathname.startsWith('/l/')) {
            items.push({ label: 'Products', href: '/products' })
            const product = products.find((p) => p.id === params['productSlug'])
            items.push({ label: product?.name || 'Product' })
        } else if (pathname.startsWith('/categories/')) {
            items.push({ label: 'Categories', href: '/categories' })
            const category = categories.find((c) => c.id === params['categoryId'])
            items.push({ label: category?.name || 'Category' })
        } else if (pathname.startsWith('/tags/')) {
            items.push({ label: 'Tags', href: '/tags' })
            const tag = tags[params['tagId'] as TagId]
            items.push({ label: tag?.name || 'Tag' })
        } else if (pathname === '/products') {
            items.push({ label: 'Products' })
        } else if (pathname === '/most-value') {
            items.push({ label: 'Best Value' })
        } else if (pathname === '/categories') {
            items.push({ label: 'Categories' })
        } else if (pathname === '/tags') {
            items.push({ label: 'Tags' })
        } else if (pathname === '/help') {
            items.push({ label: 'Help' })
        }

        return items
    }, [location.pathname, params])

    if (!breadcrumbItems) return null

    return (
        <nav aria-label='Breadcrumb' className={cn('mb-6', className)}>
            <ol className='text-primary/70 flex flex-wrap items-center gap-2 text-xs sm:text-sm'>
                {breadcrumbItems.map((item, index) => {
                    const isLast = index === breadcrumbItems.length - 1

                    return (
                        <li key={index} className='flex items-center gap-2'>
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    className='hover:text-secondary focus:ring-secondary/50 -mx-1 -my-0.5 max-w-[150px] truncate rounded px-1 py-0.5 transition-colors focus:ring-2 focus:outline-none sm:max-w-[200px] md:max-w-none'
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className='text-primary max-w-[150px] truncate font-medium sm:max-w-[200px] md:max-w-none'
                                    aria-current='page'
                                >
                                    {item.label}
                                </span>
                            )}

                            {!isLast && (
                                <FaChevronRight
                                    className='text-primary/40 h-3 w-3'
                                    aria-hidden='true'
                                />
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
