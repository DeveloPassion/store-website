import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router'
import {
    FaSearch,
    FaBars,
    FaTimes,
    FaFolder,
    FaTag,
    FaStore,
    FaTrophy,
    FaFire,
    FaStar,
    FaHeart,
    FaShoppingCart,
    FaGlobe,
    FaQuestionCircle,
    FaComments,
    FaBalanceScale,
    FaLightbulb
} from 'react-icons/fa'
import type { NavLink } from '@/types/nav-link.intf'
import ThemeToggle from '@/components/ui/theme-toggle'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/schemas/category.schema'
import { getFeaturedSorted } from '@/lib/collection-utils'
import { getCategoryIcon } from '@/lib/category-icons'
import { getWishlistCount } from '@/lib/wishlist'
import PromotionBanner from './promotion-banner'

interface HeaderProps {
    onOpenCommandPalette: () => void
}

const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [wishlistCount, setWishlistCount] = useState(0)
    const location = useLocation()

    // Update wishlist count on mount and when storage changes
    useEffect(() => {
        const updateCount = () => {
            setWishlistCount(getWishlistCount())
        }

        // Initial count
        updateCount()

        // Listen for storage events (changes in other tabs/windows)
        window.addEventListener('storage', updateCount)

        // Listen for custom wishlist update events (same tab)
        window.addEventListener('wishlistUpdate', updateCount)

        return () => {
            window.removeEventListener('storage', updateCount)
            window.removeEventListener('wishlistUpdate', updateCount)
        }
    }, [])

    // Get featured categories
    const featuredCategories = useMemo(() => {
        return getFeaturedSorted(categoriesData as Category[])
    }, [])

    // Generate menu links dynamically
    const menuLinks: NavLink[] = useMemo(() => {
        // Color palette for category cards - rotating vibrant colors with gradients
        const categoryColorPalette = [
            'text-rose-300 bg-gradient-to-br from-rose-500/20 to-rose-600/10 border border-rose-500/20 hover:from-rose-500/30 hover:to-rose-600/20 hover:border-rose-400/30',
            'text-amber-300 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 hover:from-amber-500/30 hover:to-amber-600/20 hover:border-amber-400/30',
            'text-lime-300 bg-gradient-to-br from-lime-500/20 to-lime-600/10 border border-lime-500/20 hover:from-lime-500/30 hover:to-lime-600/20 hover:border-lime-400/30',
            'text-sky-300 bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/20 hover:from-sky-500/30 hover:to-sky-600/20 hover:border-sky-400/30',
            'text-violet-300 bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 hover:from-violet-500/30 hover:to-violet-600/20 hover:border-violet-400/30',
            'text-fuchsia-300 bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-600/10 border border-fuchsia-500/20 hover:from-fuchsia-500/30 hover:to-fuchsia-600/20 hover:border-fuchsia-400/30',
            'text-emerald-300 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 hover:from-emerald-500/30 hover:to-emerald-600/20 hover:border-emerald-400/30'
        ]

        // Static link: All Products
        const allProductsLink: NavLink = {
            to: '/products',
            label: 'All Products',
            icon: <FaStore className='h-5 w-5' />,
            color: 'text-white bg-gradient-to-br from-slate-500/25 to-slate-600/15 border border-slate-400/20 hover:from-slate-500/35 hover:to-slate-600/25 hover:border-slate-300/30'
        }

        // Static link: Featured
        const featuredLink: NavLink = {
            to: '/featured',
            label: 'Featured',
            icon: <FaStar className='h-5 w-5' />,
            color: 'text-yellow-300 bg-gradient-to-br from-yellow-500/25 to-amber-600/15 border border-yellow-500/25 hover:from-yellow-500/35 hover:to-amber-600/25 hover:border-yellow-400/35'
        }

        // Static link: Best Value
        const bestValueLink: NavLink = {
            to: '/best-value',
            label: 'Best Value',
            icon: <FaTrophy className='h-5 w-5' />,
            color: 'text-blue-300 bg-gradient-to-br from-blue-500/25 to-indigo-600/15 border border-blue-500/25 hover:from-blue-500/35 hover:to-indigo-600/25 hover:border-blue-400/35'
        }

        // Static link: Best Sellers
        const bestSellersLink: NavLink = {
            to: '/best-sellers',
            label: 'Best Sellers',
            icon: <FaFire className='h-5 w-5' />,
            color: 'text-orange-300 bg-gradient-to-br from-orange-500/25 to-red-600/15 border border-orange-500/25 hover:from-orange-500/35 hover:to-red-600/25 hover:border-orange-400/35'
        }

        // Static link: Success Stories
        const successStoriesLink: NavLink = {
            to: '/success-stories',
            label: 'Success Stories',
            icon: <FaComments className='h-5 w-5' />,
            color: 'text-teal-300 bg-gradient-to-br from-teal-500/25 to-cyan-600/15 border border-teal-500/25 hover:from-teal-500/35 hover:to-cyan-600/25 hover:border-teal-400/35'
        }

        // Static link: Compare
        const compareLink: NavLink = {
            to: '/compare',
            label: 'Compare',
            icon: <FaBalanceScale className='h-5 w-5' />,
            color: 'text-amber-300 bg-gradient-to-br from-amber-500/25 to-orange-600/15 border border-amber-500/25 hover:from-amber-500/35 hover:to-orange-600/25 hover:border-amber-400/35'
        }

        // Static link: Product Quiz
        const quizLink: NavLink = {
            to: '/quiz',
            label: 'Product Quiz',
            icon: <FaLightbulb className='h-5 w-5' />,
            color: 'text-pink-300 bg-gradient-to-br from-pink-500/25 to-fuchsia-600/15 border border-pink-500/25 hover:from-pink-500/35 hover:to-fuchsia-600/25 hover:border-pink-400/35'
        }

        // Static link: Wishlist
        const wishlistLink: NavLink = {
            to: '/wishlist',
            label: wishlistCount > 0 ? `Wishlist (${wishlistCount})` : 'Wishlist',
            icon: <FaHeart className='h-5 w-5' />,
            color: 'text-pink-300 bg-gradient-to-br from-pink-500/25 to-rose-600/15 border border-pink-500/25 hover:from-pink-500/35 hover:to-rose-600/25 hover:border-pink-400/35'
        }

        // Default color for categories (fallback)
        const defaultCategoryColor =
            'text-rose-300 bg-gradient-to-br from-rose-500/20 to-rose-600/10 border border-rose-500/20 hover:from-rose-500/30 hover:to-rose-600/20 hover:border-rose-400/30'

        // Generate featured category links with rotating colors
        const categoryLinks: NavLink[] = featuredCategories.map((cat, index) => {
            const IconComponent = getCategoryIcon(cat.icon)
            const colorClass =
                categoryColorPalette[index % categoryColorPalette.length] ?? defaultCategoryColor
            return {
                to: `/categories/${cat.id}`,
                label: cat.name,
                icon: IconComponent ? (
                    <IconComponent className='h-5 w-5' />
                ) : (
                    <FaFolder className='h-5 w-5' />
                ),
                color: colorClass
            }
        })

        // Static links: Categories, Tags
        const staticLinks: NavLink[] = [
            {
                to: '/categories',
                label: 'Categories',
                icon: <FaFolder className='h-5 w-5' />,
                color: 'text-cyan-300 bg-gradient-to-br from-cyan-500/25 to-sky-600/15 border border-cyan-500/25 hover:from-cyan-500/35 hover:to-sky-600/25 hover:border-cyan-400/35'
            },
            {
                to: '/tags',
                label: 'Tags',
                icon: <FaTag className='h-5 w-5' />,
                color: 'text-green-300 bg-gradient-to-br from-green-500/25 to-emerald-600/15 border border-green-500/25 hover:from-green-500/35 hover:to-emerald-600/25 hover:border-green-400/35'
            }
        ]

        // Static link: FAQ
        const faqLink: NavLink = {
            to: '/faq',
            label: 'FAQ',
            icon: <FaQuestionCircle className='h-5 w-5' />,
            color: 'text-indigo-300 bg-gradient-to-br from-indigo-500/25 to-purple-600/15 border border-indigo-500/25 hover:from-indigo-500/35 hover:to-purple-600/25 hover:border-indigo-400/35'
        }

        // External link: DeveloPassion Website
        const websiteLink: NavLink = {
            to: 'https://www.dsebastien.net',
            label: 'Official Website',
            icon: <FaGlobe className='h-5 w-5' />,
            color: 'text-purple-300 bg-gradient-to-br from-purple-500/25 to-fuchsia-600/15 border border-purple-500/25 hover:from-purple-500/35 hover:to-fuchsia-600/25 hover:border-purple-400/35',
            external: true,
            hideOnDesktop: true
        }

        return [
            featuredLink,
            bestValueLink,
            bestSellersLink,
            allProductsLink,
            successStoriesLink,
            compareLink,
            quizLink,
            ...categoryLinks,
            ...staticLinks,
            wishlistLink,
            faqLink,
            websiteLink
        ]
    }, [featuredCategories, wishlistCount])

    // Close menu on route change
    // Note: setState in effect is necessary here to sync with React Router navigation
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
            <header
                id='navigation'
                role='banner'
                className='border-primary/10 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b shadow-lg shadow-black/5 backdrop-blur-md'
            >
                <PromotionBanner />

                {/* Main header */}
                <nav
                    role='navigation'
                    aria-label='Main navigation'
                    className='mx-auto max-w-[1800px] 2xl:max-w-[2200px]'
                >
                    <div className='flex h-16 items-center justify-between px-4 sm:h-20 sm:px-6 md:px-8 lg:px-12 xl:px-16'>
                        {/* Logo */}
                        <div className='flex items-center'>
                            <Link
                                to='/'
                                className='flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 sm:gap-4'
                            >
                                <img
                                    src='https://www.dsebastien.net/assets/images/developassion-logo.png?v=227ae60558'
                                    alt='Knowledge Forge by Sébastien Dubois'
                                    className='h-8 w-8 rounded-full object-contain sm:h-10 sm:w-10 md:h-12 md:w-12'
                                />
                                <div className='flex flex-col'>
                                    <span className='text-base leading-tight font-bold sm:text-lg md:text-xl'>
                                        Knowledge Forge
                                    </span>
                                    <span className='text-primary/60 hidden text-xs leading-tight min-[400px]:block'>
                                        by Sébastien Dubois
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className='flex items-center gap-1 sm:gap-2'>
                            {/* Search Bar - Desktop */}
                            <button
                                onClick={onOpenCommandPalette}
                                className='hidden max-w-lg flex-1 cursor-pointer md:block lg:max-w-xl xl:max-w-2xl'
                                title='Search products'
                                aria-label='Open command palette to search products'
                                aria-haspopup='dialog'
                                aria-keyshortcuts='/ Control+K'
                            >
                                <div className='relative'>
                                    <div className='bg-primary/5 border-primary/10 placeholder:text-primary/40 hover:border-secondary/50 hover:bg-primary/10 flex h-10 w-full cursor-pointer items-center rounded-lg border px-4 pr-10 text-left text-sm transition-colors lg:h-11 lg:text-base xl:h-12'>
                                        <span className='text-primary/40'>Search products...</span>
                                        <div className='border-primary/20 bg-primary/5 absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 rounded border px-1.5 py-0.5 text-xs lg:px-2 lg:py-1'>
                                            <kbd className='text-primary/60'>/</kbd>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Search icon for mobile */}
                            <button
                                onClick={onOpenCommandPalette}
                                className='bg-primary/10 hover:bg-primary/20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors md:hidden lg:h-11 lg:w-11 xl:h-12 xl:w-12'
                                title='Search products'
                            >
                                <FaSearch className='h-5 w-5' />
                            </button>

                            {/* Wishlist Link - Hidden on mobile */}
                            <Link
                                to='/wishlist'
                                className='bg-primary/10 hover:bg-primary/20 relative hidden h-10 w-10 items-center justify-center rounded-lg transition-colors md:flex lg:h-11 lg:w-11 xl:h-12 xl:w-12'
                                title='Wishlist'
                            >
                                <FaHeart className='h-5 w-5' />
                                {wishlistCount > 0 && (
                                    <span className='bg-secondary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white'>
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart Link - always visible */}
                            <a
                                href='https://gumroad.com/checkout'
                                target='_blank'
                                rel='noopener'
                                className='bg-primary/10 hover:bg-primary/20 focus-visible:ring-secondary relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none lg:h-11 lg:w-11 xl:h-12 xl:w-12'
                                title='View Shopping Cart (opens in new tab)'
                                aria-label='View Shopping Cart (opens in new tab)'
                            >
                                <FaShoppingCart className='h-5 w-5' aria-hidden='true' />
                                <span className='sr-only'>Opens in new tab</span>
                            </a>

                            {/* Website Link - hidden on mobile, shown in hamburger menu instead */}
                            <a
                                href='https://www.dsebastien.net'
                                target='_blank'
                                rel='noopener'
                                className='bg-primary/10 hover:bg-primary/20 hidden h-10 items-center gap-2 rounded-lg px-3 transition-colors md:flex lg:h-11 xl:h-12 xl:px-4'
                                title='DeveloPassion Website'
                            >
                                <img
                                    src='https://www.dsebastien.net/assets/images/developassion-logo.png?v=227ae60558'
                                    alt='DeveloPassion'
                                    className='h-5 w-5 rounded-full object-contain'
                                />
                                <span className='hidden xl:inline'>Website</span>
                            </a>

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Hamburger Menu Button - always visible */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className='bg-primary/10 hover:bg-primary/20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors lg:h-11 lg:w-11 xl:h-12 xl:w-12'
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
                        className='bg-primary/10 hover:bg-primary/20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors'
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
                    <div className='mx-auto mt-4 grid max-w-[1400px] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:max-w-[1600px] lg:grid-cols-5 lg:gap-8 xl:max-w-[1800px] xl:grid-cols-6 2xl:max-w-[2000px] 2xl:grid-cols-7'>
                        {menuLinks.map((link) =>
                            link.external ? (
                                <a
                                    key={link.to}
                                    href={link.to}
                                    target='_blank'
                                    rel='noopener'
                                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-2.5 text-center transition-all hover:scale-105 sm:gap-2 sm:p-4 md:p-6 ${link.color} ${link.hideOnDesktop ? 'md:hidden' : ''}`}
                                >
                                    <span className='text-lg sm:text-xl md:text-3xl'>
                                        {link.icon}
                                    </span>
                                    <span className='text-xs font-medium sm:text-sm md:text-base'>
                                        {link.label}
                                    </span>
                                </a>
                            ) : (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-2.5 text-center transition-all hover:scale-105 sm:gap-2 sm:p-4 md:p-6 ${link.color} ${link.hideOnDesktop ? 'md:hidden' : ''}`}
                                >
                                    <span className='text-lg sm:text-xl md:text-3xl'>
                                        {link.icon}
                                    </span>
                                    <span className='text-xs font-medium sm:text-sm md:text-base'>
                                        {link.label}
                                    </span>
                                </Link>
                            )
                        )}
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
