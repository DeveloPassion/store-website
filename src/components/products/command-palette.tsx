import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
    FaSearch,
    FaTimes,
    FaShoppingCart,
    FaHeart,
    FaHome,
    FaTag,
    FaFilter,
    FaShoppingBag,
    FaStar,
    FaTrophy
} from 'react-icons/fa'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import type { Category } from '@/types/category'
import categoriesData from '@/data/categories.json'

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    products: Product[]
}

type CommandType = 'product' | 'action' | 'category' | 'tag'

interface Command {
    id: string
    type: CommandType
    title: string
    subtitle?: string
    icon: React.ReactNode
    action: () => void
    product?: Product
    category?: Category
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, products }) => {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    // Get unique tags
    const uniqueTags = useMemo(() => {
        const tags = new Set<string>()
        products.forEach((product) => {
            product.tags.forEach((tag) => tags.add(tag))
        })
        return Array.from(tags).sort()
    }, [products])

    // Build commands list
    const commands = useMemo<Command[]>(() => {
        const cmds: Command[] = []

        // Add products
        products.forEach((product) => {
            const isFree = product.priceTier === 'free' || product.price === 0
            cmds.push({
                id: `product-${product.id}`,
                type: 'product',
                title: product.name,
                subtitle: `${product.priceDisplay} · ${product.tagline}`,
                icon: product.featured ? (
                    <FaStar className='text-secondary h-5 w-5' />
                ) : isFree ? (
                    <FaShoppingBag className='h-5 w-5 text-green-500' />
                ) : (
                    <FaShoppingBag className='text-secondary h-5 w-5' />
                ),
                action: () => {
                    navigate(`/l/${product.id}`)
                    onClose()
                },
                product
            })
        })

        // Add navigation actions
        cmds.push({
            id: 'action-home',
            type: 'action',
            title: 'Go to Home',
            subtitle: 'Return to the homepage',
            icon: <FaHome className='text-secondary h-5 w-5' />,
            action: () => {
                navigate('/')
                onClose()
            }
        })

        cmds.push({
            id: 'action-cart',
            type: 'action',
            title: 'View Shopping Cart',
            subtitle: 'See items in your cart (opens in new tab)',
            icon: <FaShoppingCart className='text-secondary h-5 w-5' />,
            action: () => {
                window.open('https://gumroad.com/checkout', '_blank', 'noopener,noreferrer')
                onClose()
            }
        })

        cmds.push({
            id: 'action-wishlist',
            type: 'action',
            title: 'View Wishlist',
            subtitle: 'See your saved items',
            icon: <FaHeart className='text-secondary h-5 w-5' />,
            action: () => {
                navigate('/wishlist')
                onClose()
            }
        })

        // Add category filters
        // Sort categories by priority (lower priority number = higher in list)
        const sortedCategories = (categoriesData as Category[])
            .slice()
            .sort((a, b) => a.priority - b.priority)

        // Add "All Products" category first
        cmds.push({
            id: 'category-all',
            type: 'category',
            title: 'All Products',
            subtitle: 'Browse all products',
            icon: <FaFilter className='text-secondary h-5 w-5' />,
            action: () => {
                navigate('/')
                onClose()
            }
        })

        // Add all categories
        sortedCategories.forEach((category) => {
            cmds.push({
                id: `category-${category.id}`,
                type: 'category',
                title: category.name,
                subtitle: `Browse ${category.name.toLowerCase()}`,
                icon: <FaFilter className='text-secondary h-5 w-5' />,
                action: () => {
                    navigate(`/categories/${encodeURIComponent(category.id)}`)
                    onClose()
                },
                category
            })
        })

        // Add tag filters
        uniqueTags.forEach((tag) => {
            cmds.push({
                id: `tag-${tag}`,
                type: 'tag',
                title: tag,
                subtitle: `View products tagged with "${tag}"`,
                icon: <FaTag className='text-secondary h-5 w-5' />,
                action: () => {
                    navigate(`/tags/${encodeURIComponent(tag)}`)
                    onClose()
                }
            })
        })

        return cmds
    }, [products, uniqueTags, navigate, onClose])

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!query.trim()) {
            // Show products, main actions, and only featured categories when no query
            return commands.filter((c) => {
                if (c.type === 'product' || c.type === 'action') {
                    return true
                }
                if (c.type === 'category') {
                    // Show "All Products" or featured categories
                    return c.id === 'category-all' || (c.category?.featured ?? false)
                }
                return false
            })
        }

        const lowerQuery = query.toLowerCase()
        return commands.filter((cmd) => {
            const titleMatch = cmd.title.toLowerCase().includes(lowerQuery)
            const subtitleMatch = cmd.subtitle?.toLowerCase().includes(lowerQuery)
            const productTags = cmd.product?.tags.some((t) => t.toLowerCase().includes(lowerQuery))
            const productCategories = cmd.product
                ? [
                      cmd.product.mainCategory,
                      ...cmd.product.secondaryCategories.map((sc) => sc.id)
                  ].some((c) => c.toLowerCase().includes(lowerQuery))
                : false
            return titleMatch || subtitleMatch || productTags || productCategories
        })
    }, [commands, query])

    // Get displayed commands for keyboard navigation
    const displayedCommandsForNav = useMemo(() => {
        const productCommands = filteredCommands.filter((c) => c.type === 'product')
        const bestValueProducts = productCommands.filter((c) => c.product?.bestValue)
        const regularProducts = productCommands.filter((c) => !c.product?.bestValue)
        const actionCommands = filteredCommands.filter((c) => c.type === 'action')
        const categoryCommands = filteredCommands.filter((c) => c.type === 'category')
        const tagCommands = filteredCommands.filter((c) => c.type === 'tag')

        return [
            ...bestValueProducts,
            ...regularProducts,
            ...actionCommands,
            ...categoryCommands,
            ...tagCommands
        ]
    }, [filteredCommands])

    // Reset selection when displayed results change
    useEffect(() => {
        setSelectedIndex(0)
    }, [displayedCommandsForNav])

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => {
                inputRef.current?.focus()
            }, 50)
        }
    }, [isOpen])

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex((prev) =>
                        prev < displayedCommandsForNav.length - 1 ? prev + 1 : prev
                    )
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
                    break
                case 'Enter':
                    e.preventDefault()
                    if (displayedCommandsForNav[selectedIndex]) {
                        displayedCommandsForNav[selectedIndex].action()
                    } else {
                        // No command selected or index out of bounds
                        console.warn('No command selected or index out of bounds')
                    }
                    break
                case 'Escape':
                    e.preventDefault()
                    onClose()
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, displayedCommandsForNav, selectedIndex, onClose])

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            // Get all command items (elements with role="option")
            const items = listRef.current.querySelectorAll('[role="option"]')
            const selectedElement = items[selectedIndex] as HTMLElement
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
        }
    }, [selectedIndex])

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) return null

    // Group commands by type for display
    const productCommands = filteredCommands.filter((c) => c.type === 'product')
    const bestValueProducts = productCommands.filter((c) => c.product?.bestValue)
    const regularProducts = productCommands.filter((c) => !c.product?.bestValue)
    const actionCommands = filteredCommands.filter((c) => c.type === 'action')
    const categoryCommands = filteredCommands.filter((c) => c.type === 'category')
    const tagCommands = filteredCommands.filter((c) => c.type === 'tag')

    // Track current index for navigation
    let currentIndex = 0

    return (
        <div
            className='fixed inset-0 z-[100] flex items-start justify-center bg-black/70 pt-[15vh] backdrop-blur-sm'
            onClick={handleBackdropClick}
            role='dialog'
            aria-modal='true'
            aria-label='Command palette'
        >
            <div className='bg-background border-primary/10 w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl'>
                {/* Search Input */}
                <div className='border-primary/10 flex items-center gap-3 border-b px-4 py-3'>
                    <FaSearch className='text-primary/40 h-5 w-5' />
                    <input
                        ref={inputRef}
                        type='text'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products, categories, tags... or press 'Esc' to close"
                        className='placeholder:text-primary/40 flex-1 bg-transparent text-lg outline-none'
                        aria-label='Search products, categories, and tags'
                        aria-autocomplete='list'
                        aria-controls='command-palette-results'
                        aria-activedescendant={
                            selectedIndex >= 0 ? `command-option-${selectedIndex}` : undefined
                        }
                        role='combobox'
                        aria-expanded='true'
                    />
                    <button
                        onClick={onClose}
                        className='text-primary/40 hover:text-primary rounded p-1 transition-colors'
                        aria-label='Close command palette'
                    >
                        <FaTimes className='h-4 w-4' />
                    </button>
                </div>

                {/* Results */}
                <div
                    ref={listRef}
                    className='max-h-[60vh] overflow-auto p-2'
                    role='listbox'
                    id='command-palette-results'
                    aria-label='Search results'
                >
                    {filteredCommands.length === 0 ? (
                        <div className='text-primary/40 py-8 text-center'>
                            No results found for "{query}"
                        </div>
                    ) : (
                        <>
                            {/* Best Value Products */}
                            {bestValueProducts.length > 0 && (
                                <div className='mb-2'>
                                    <div className='text-primary/40 px-3 py-1.5 text-xs font-medium tracking-wider uppercase'>
                                        Best Value Products ({bestValueProducts.length})
                                    </div>
                                    {bestValueProducts.map((cmd) => {
                                        const idx = currentIndex++
                                        return (
                                            <CommandItem
                                                key={cmd.id}
                                                command={cmd}
                                                isSelected={selectedIndex === idx}
                                                onSelect={() => setSelectedIndex(idx)}
                                                onClick={() => cmd.action()}
                                                itemIndex={idx}
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Regular Products */}
                            {regularProducts.length > 0 && (
                                <div className='mb-2'>
                                    <div className='text-primary/40 px-3 py-1.5 text-xs font-medium tracking-wider uppercase'>
                                        Products ({regularProducts.length})
                                    </div>
                                    {regularProducts.map((cmd) => {
                                        const idx = currentIndex++
                                        return (
                                            <CommandItem
                                                key={cmd.id}
                                                command={cmd}
                                                isSelected={selectedIndex === idx}
                                                onSelect={() => setSelectedIndex(idx)}
                                                onClick={() => cmd.action()}
                                                itemIndex={idx}
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Actions */}
                            {actionCommands.length > 0 && (
                                <div className='mb-2'>
                                    <div className='text-primary/40 px-3 py-1.5 text-xs font-medium tracking-wider uppercase'>
                                        Actions
                                    </div>
                                    {actionCommands.map((cmd) => {
                                        const idx = currentIndex++
                                        return (
                                            <CommandItem
                                                key={cmd.id}
                                                command={cmd}
                                                isSelected={selectedIndex === idx}
                                                onSelect={() => setSelectedIndex(idx)}
                                                onClick={() => cmd.action()}
                                                itemIndex={idx}
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Categories */}
                            {categoryCommands.length > 0 && (
                                <div className='mb-2'>
                                    <div className='text-primary/40 px-3 py-1.5 text-xs font-medium tracking-wider uppercase'>
                                        Categories
                                    </div>
                                    {categoryCommands.map((cmd) => {
                                        const idx = currentIndex++
                                        return (
                                            <CommandItem
                                                key={cmd.id}
                                                command={cmd}
                                                isSelected={selectedIndex === idx}
                                                onSelect={() => setSelectedIndex(idx)}
                                                onClick={() => cmd.action()}
                                                itemIndex={idx}
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Tags */}
                            {tagCommands.length > 0 && (
                                <div className='mb-2'>
                                    <div className='text-primary/40 px-3 py-1.5 text-xs font-medium tracking-wider uppercase'>
                                        Tags ({tagCommands.length})
                                    </div>
                                    {tagCommands.map((cmd) => {
                                        const idx = currentIndex++
                                        return (
                                            <CommandItem
                                                key={cmd.id}
                                                command={cmd}
                                                isSelected={selectedIndex === idx}
                                                onSelect={() => setSelectedIndex(idx)}
                                                onClick={() => cmd.action()}
                                                itemIndex={idx}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className='border-primary/10 text-primary/40 flex items-center gap-4 border-t px-4 py-2 text-xs'>
                    <span className='flex items-center gap-1'>
                        <kbd className='border-primary/20 bg-primary/5 rounded border px-1.5 py-0.5'>
                            ↑↓
                        </kbd>
                        Navigate
                    </span>
                    <span className='flex items-center gap-1'>
                        <kbd className='border-primary/20 bg-primary/5 rounded border px-1.5 py-0.5'>
                            Enter
                        </kbd>
                        Select
                    </span>
                    <span className='flex items-center gap-1'>
                        <kbd className='border-primary/20 bg-primary/5 rounded border px-1.5 py-0.5'>
                            Esc
                        </kbd>
                        Close
                    </span>
                    <span className='ml-auto flex items-center gap-1'>
                        <kbd className='border-primary/20 bg-primary/5 rounded border px-1.5 py-0.5'>
                            /
                        </kbd>
                        to open
                    </span>
                </div>
            </div>
        </div>
    )
}

interface CommandItemProps {
    command: Command
    isSelected: boolean
    onSelect: () => void
    onClick: () => void
    itemIndex: number
}

const CommandItem: React.FC<CommandItemProps> = ({
    command,
    isSelected,
    onSelect,
    onClick,
    itemIndex
}) => {
    return (
        <div
            className={cn(
                'group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                isSelected ? 'bg-secondary/20' : 'hover:bg-primary/5'
            )}
            onMouseEnter={onSelect}
            onClick={onClick}
            role='option'
            id={`command-option-${itemIndex}`}
            aria-selected={isSelected}
        >
            <div className='bg-primary/5 group-hover:bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors'>
                {command.icon}
            </div>
            <div className='min-w-0 flex-1'>
                <div className='truncate font-medium'>{command.title}</div>
                {command.subtitle && (
                    <div className='text-primary/50 truncate text-sm'>{command.subtitle}</div>
                )}
            </div>
            {command.product?.bestValue && (
                <div className='flex shrink-0 items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500'>
                    <FaTrophy className='h-2.5 w-2.5' />
                    Best Value
                </div>
            )}
            {command.product?.featured && !command.product?.bestValue && (
                <div className='bg-secondary/10 text-secondary flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium'>
                    <FaStar className='h-2.5 w-2.5' />
                    Featured
                </div>
            )}
        </div>
    )
}

export default CommandPalette
