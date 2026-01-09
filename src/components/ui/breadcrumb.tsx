import { Link } from 'react-router'
import { FaChevronRight } from 'react-icons/fa'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { cn } from '@/lib/utils'

interface BreadcrumbProps {
    className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ className }) => {
    const { items: breadcrumbItems } = useBreadcrumb()

    if (!breadcrumbItems || breadcrumbItems.length === 0) return null

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
