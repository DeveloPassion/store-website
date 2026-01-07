import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { FaTimes, FaChevronLeft, FaChevronRight, FaTag } from 'react-icons/fa'
import type { Product } from '@/types/product'

export interface TagData {
    name: string
    count: number
    percentage: number
    products: Product[]
}

interface TagDetailModalProps {
    tag: TagData | null
    allTags: TagData[]
    onClose: () => void
    onNavigate: (direction: 'prev' | 'next') => void
}

const TagDetailModal: React.FC<TagDetailModalProps> = ({ tag, allTags, onClose, onNavigate }) => {
    const navigate = useNavigate()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'ArrowLeft' && allTags.length > 1) {
                onNavigate('prev')
            } else if (e.key === 'ArrowRight' && allTags.length > 1) {
                onNavigate('next')
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose, onNavigate, allTags.length])

    if (!tag) return null

    const sortedProducts = [...tag.products].sort((a, b) => {
        // Sort by priority (highest first), then by name
        const priorityA = a.priority ?? 0
        const priorityB = b.priority ?? 0
        if (priorityB !== priorityA) return priorityB - priorityA
        return a.name.localeCompare(b.name)
    })

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
            onClick={onClose}
            role='dialog'
            aria-modal='true'
            aria-labelledby='tag-modal-title'
        >
            <div
                className='bg-background border-primary/10 relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border shadow-2xl'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className='border-primary/10 border-b p-6'>
                    <div className='mb-4 flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='bg-secondary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg'>
                                <FaTag className='text-secondary h-6 w-6' />
                            </div>
                            <div>
                                <h2 id='tag-modal-title' className='text-2xl font-bold'>
                                    {tag.name}
                                </h2>
                                <p className='text-primary/60 text-sm'>
                                    {tag.count} {tag.count === 1 ? 'product' : 'products'} •{' '}
                                    {tag.percentage.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className='text-primary/40 hover:text-primary rounded-lg p-2 transition-colors'
                            aria-label='Close modal'
                        >
                            <FaTimes className='h-5 w-5' />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className='max-h-[60vh] overflow-y-auto p-6'>
                    <div className='space-y-4'>
                        {sortedProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => {
                                    navigate(`/l/${product.id}`)
                                    onClose()
                                }}
                                className='border-primary/10 hover:border-secondary/30 hover:bg-primary/5 group flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-all'
                            >
                                <div className='flex-1'>
                                    <div className='mb-2 flex items-start justify-between gap-4'>
                                        <h3 className='group-hover:text-secondary text-lg font-semibold transition-colors'>
                                            {product.name}
                                        </h3>
                                        {product.featured && (
                                            <span className='bg-secondary/10 text-secondary shrink-0 rounded-full px-2 py-1 text-xs font-medium'>
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    <p className='text-primary/70 mb-3 text-sm'>
                                        {product.tagline}
                                    </p>
                                    <div className='flex items-center gap-3'>
                                        <span className='text-secondary text-sm font-semibold'>
                                            {product.priceDisplay}
                                        </span>
                                        <span className='bg-primary/10 rounded-full px-2 py-1 text-xs font-medium capitalize'>
                                            {product.type}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer - Navigation */}
                {allTags.length > 1 && (
                    <div className='border-primary/10 flex items-center justify-between border-t p-4'>
                        <button
                            onClick={() => onNavigate('prev')}
                            className='hover:bg-primary/10 flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-40 disabled:hover:bg-transparent'
                            aria-label='Previous tag'
                        >
                            <FaChevronLeft className='h-4 w-4' />
                            Previous
                        </button>
                        <span className='text-primary/60 text-sm'>
                            {allTags.findIndex((t) => t.name === tag.name) + 1} of {allTags.length}
                        </span>
                        <button
                            onClick={() => onNavigate('next')}
                            className='hover:bg-primary/10 flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-40 disabled:hover:bg-transparent'
                            aria-label='Next tag'
                        >
                            Next
                            <FaChevronRight className='h-4 w-4' />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TagDetailModal
