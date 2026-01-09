import { useEffect } from 'react'
import { useBreadcrumb, type BreadcrumbItem } from '@/contexts/breadcrumb-context'

/**
 * Hook to set breadcrumbs for the current page.
 * Automatically cleans up when the component unmounts.
 *
 * @param items - Array of breadcrumb items to display
 *
 * @example
 * useSetBreadcrumbs([
 *   { label: 'Home', href: '/' },
 *   { label: 'Products', href: '/products' },
 *   { label: 'Product Name' }
 * ])
 */
export const useSetBreadcrumbs = (items: BreadcrumbItem[]) => {
    const { setBreadcrumbs } = useBreadcrumb()

    useEffect(() => {
        setBreadcrumbs(items)

        // Clear breadcrumbs on unmount
        return () => setBreadcrumbs([])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(items), setBreadcrumbs])
}
