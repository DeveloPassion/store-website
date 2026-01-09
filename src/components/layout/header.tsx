import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router'
import {
    FaSearch,
    FaBars,
    FaTimes,
    FaFolder,
    FaTag,
    FaStore,
    FaQuestionCircle
} from 'react-icons/fa'
import type { NavLink } from '@/types/nav-link.intf'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/types/category'
import { getFeaturedCategoriesSorted } from '@/lib/category-utils'
import { getCategoryIcon } from '@/lib/category-icons'
import PromotionBanner from './promotion-banner'

interface HeaderProps {
    onOpenCommandPalette: () => void
}

const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    // Get featured categories
    const featuredCategories = useMemo(() => {
        return getFeaturedCategoriesSorted(categoriesData as Category[])
    }, [])

    // Generate menu links dynamically
    const menuLinks: NavLink[] = useMemo(() => {
        // Static link: All Products
        const allProductsLink: NavLink = {
            to: '/products',
            label: 'All Products',
            icon: <FaStore className='h-5 w-5' />,
            color: 'bg-primary/10 hover:bg-primary/20'
        }

        // Generate featured category links
        const categoryLinks: NavLink[] = featuredCategories.map((cat) => {
            const IconComponent = getCategoryIcon(cat.icon)
            return {
                to: `/categories/${cat.id}`,
                label: cat.name,
                icon: IconComponent ? (
                    <IconComponent className='h-5 w-5' />
                ) : (
                    <FaFolder className='h-5 w-5' />
                ),
                color: 'bg-primary/10 hover:bg-primary/20'
            }
        })

        // Static links: Categories, Tags, Help
        const staticLinks: NavLink[] = [
            {
                to: '/categories',
                label: 'Categories',
                icon: <FaFolder className='h-5 w-5' />,
                color: 'text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20'
            },
            {
                to: '/tags',
                label: 'Tags',
                icon: <FaTag className='h-5 w-5' />,
                color: 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
            },
            {
                to: '/help',
                label: 'Help',
                icon: <FaQuestionCircle className='h-5 w-5' />,
                color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20'
            }
        ]

        return [allProductsLink, ...categoryLinks, ...staticLinks]
    }, [featuredCategories])

    // Close menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [location.pathname])

    // Prevent body scroll when menu is open and handle ESC key
    useEffect(() => {
        if (!mobileMenuOpen) {
            document.body.style.overflow = ''
            return
        }

        document.body.style.overflow = 'hidden'

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMobileMenuOpen(false)
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleEsc)
        }
    }, [mobileMenuOpen])

    return (
        <>
            <header className='border-primary/10 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b shadow-lg shadow-black/5 backdrop-blur-md'>
                <PromotionBanner />

                {/* Main header */}
                <nav className='mx-auto max-w-7xl'>
                    <div className='flex h-16 items-center justify-between px-4 sm:h-20 sm:px-6 md:px-8 lg:px-12 xl:px-16'>
                        {/* Logo */}
                        <div className='flex items-center'>
                            <Link
                                to='/'
                                className='flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 sm:gap-4'
                            >
                                <img
                                    src='https://www.dsebastien.net/assets/images/developassion-logo.png?v=227ae60558'
                                    alt='dSebastien Knowledge Forge'
                                    className='h-8 w-8 rounded-full object-contain sm:h-10 sm:w-10 md:h-12 md:w-12'
                                />
                                <div className='flex flex-col'>
                                    <span className='text-base leading-tight font-bold sm:text-lg md:text-xl'>
                                        dSebastien
                                    </span>
                                    <span className='text-primary/60 text-xs leading-tight'>
                                        Knowledge Forge
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className='flex items-center gap-1 sm:gap-2'>
                            {/* Search Bar - Desktop */}
                            <button
                                onClick={onOpenCommandPalette}
                                className='hidden max-w-md flex-1 md:block'
                                title='Search products'
                            >
                                <div className='relative'>
                                    <div className='bg-primary/5 border-primary/10 placeholder:text-primary/40 hover:border-secondary/50 hover:bg-primary/10 flex h-10 w-full cursor-pointer items-center rounded-lg border px-4 pr-10 text-left text-sm transition-colors'>
                                        <span className='text-primary/40'>Search products...</span>
                                        <div className='border-primary/20 bg-primary/5 absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 rounded border px-1.5 py-0.5 text-xs'>
                                            <kbd className='text-primary/60'>/</kbd>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Search icon for mobile */}
                            <button
                                onClick={onOpenCommandPalette}
                                className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg p-2 transition-colors md:hidden'
                                title='Search products'
                            >
                                <FaSearch className='h-5 w-5' />
                            </button>

                            {/* Website Link - always visible */}
                            <a
                                href='https://www.dsebastien.net'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='bg-primary/10 hover:bg-primary/20 flex items-center gap-2 rounded-lg p-2 transition-colors sm:px-3 sm:py-2 xl:px-4'
                                title='DeveloPassion Website'
                            >
                                <img
                                    src='https://www.dsebastien.net/assets/images/developassion-logo.png?v=227ae60558'
                                    alt='DeveloPassion'
                                    className='h-5 w-5 rounded-full object-contain'
                                />
                                <span className='hidden xl:inline'>Website</span>
                            </a>

                            {/* Hamburger Menu Button - always visible */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className='bg-primary/10 hover:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg transition-colors'
                                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? (
                                    <FaTimes className='h-5 w-5' />
                                ) : (
                                    <FaBars className='h-5 w-5' />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Fullscreen Overlay Menu */}
            <div
                className={`bg-background/98 fixed inset-0 z-[60] flex flex-col backdrop-blur-md transition-all duration-300 ${
                    mobileMenuOpen
                        ? 'visible opacity-100'
                        : 'pointer-events-none invisible opacity-0'
                }`}
                onClick={() => setMobileMenuOpen(false)}
            >
                {/* Close button */}
                <div className='flex justify-end p-4 sm:p-6' onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className='bg-primary/10 hover:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg transition-colors'
                        aria-label='Close menu'
                    >
                        <FaTimes className='h-5 w-5' />
                    </button>
                </div>

                <div
                    className='flex-1 overflow-y-auto px-6 pb-6'
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Grid on desktop, compact list on mobile */}
                    <div className='mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6'>
                        {menuLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-center transition-all hover:scale-105 sm:gap-2 sm:p-5 md:p-6 ${link.color}`}
                            >
                                <span className='text-xl sm:text-2xl md:text-3xl'>{link.icon}</span>
                                <span className='text-xs font-medium sm:text-sm md:text-base'>
                                    {link.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Close hint */}
                <div className='text-primary/40 shrink-0 py-4 text-center text-sm'>
                    Tap anywhere or press ESC to close
                </div>
            </div>
        </>
    )
}

export default Header
