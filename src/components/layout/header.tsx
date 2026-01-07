import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FaShoppingCart, FaHeart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa'

const Header: React.FC = () => {
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const categories = [
        { name: 'All Products', path: '/' },
        { name: 'Courses', path: '/?category=Courses' },
        { name: 'Kits & Templates', path: '/?category=Kits' },
        { name: 'Workshops', path: '/?category=Workshops' },
        { name: 'Bundles', path: '/?category=Bundles' },
        { name: 'Free Resources', path: '/?category=Free Resources' }
    ]

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
        }
    }

    return (
        <header className='border-primary/10 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b shadow-lg shadow-black/5 backdrop-blur-md'>
            {/* Top announcement banner */}
            <div className='bg-secondary/10 border-secondary/20 border-b px-4 py-2 text-center text-sm'>
                <p className='text-primary/80'>
                    🎉 <span className='font-semibold'>New Year Sale!</span> Get 20% off all courses
                    and bundles{' '}
                    <Link to='/' className='text-secondary hover:text-secondary-text underline'>
                        Shop Now →
                    </Link>
                </p>
            </div>

            {/* Main header */}
            <div className='mx-auto max-w-7xl'>
                <div className='flex h-16 items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 md:gap-6 md:px-8 lg:px-12 xl:px-20'>
                    {/* Logo */}
                    <Link
                        to='/'
                        className='flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90 sm:gap-3'
                    >
                        <img
                            src='https://www.dsebastien.net/assets/images/developassion-logo.png?v=227ae60558'
                            alt='dSebastien Knowledge Forge'
                            className='h-8 w-8 rounded-full object-contain sm:h-10 sm:w-10'
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

                    {/* Desktop Navigation */}
                    <nav className='hidden items-center gap-1 lg:flex'>
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                to={category.path}
                                className='hover:bg-primary/10 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className='hidden max-w-md flex-1 md:block'>
                        <div className='relative'>
                            <input
                                type='text'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder='Search products...'
                                className='bg-primary/5 border-primary/10 text-primary placeholder:text-primary/40 focus:border-secondary/50 focus:bg-primary/10 h-10 w-full rounded-lg border px-4 pr-10 text-sm transition-colors outline-none'
                            />
                            <button
                                type='submit'
                                className='text-primary/60 hover:text-secondary absolute top-1/2 right-3 -translate-y-1/2 transition-colors'
                            >
                                <FaSearch className='h-4 w-4' />
                            </button>
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className='flex items-center gap-2 sm:gap-3'>
                        {/* Search icon for mobile */}
                        <button className='hover:bg-primary/10 rounded-lg p-2 transition-colors md:hidden'>
                            <FaSearch className='h-5 w-5' />
                        </button>

                        {/* Wishlist */}
                        <button className='hover:bg-primary/10 hidden rounded-lg p-2 transition-colors sm:block'>
                            <FaHeart className='h-5 w-5' />
                        </button>

                        {/* Account */}
                        <a
                            href='https://www.dsebastien.net'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:bg-primary/10 hidden rounded-lg p-2 transition-colors sm:block'
                            title='Visit dSebastien.net'
                        >
                            <FaUser className='h-5 w-5' />
                        </a>

                        {/* Cart */}
                        <button className='bg-secondary/10 hover:bg-secondary/20 relative rounded-lg p-2 transition-colors'>
                            <FaShoppingCart className='text-secondary h-5 w-5' />
                            <span className='bg-secondary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white'>
                                0
                            </span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className='hover:bg-primary/10 rounded-lg p-2 transition-colors lg:hidden'
                        >
                            {mobileMenuOpen ? (
                                <FaTimes className='h-5 w-5' />
                            ) : (
                                <FaBars className='h-5 w-5' />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className='border-primary/10 border-t px-4 py-4 lg:hidden'>
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className='mb-4 md:hidden'>
                            <div className='relative'>
                                <input
                                    type='text'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder='Search products...'
                                    className='bg-primary/5 border-primary/10 text-primary placeholder:text-primary/40 focus:border-secondary/50 h-10 w-full rounded-lg border px-4 pr-10 text-sm transition-colors outline-none'
                                />
                                <button
                                    type='submit'
                                    className='text-primary/60 hover:text-secondary absolute top-1/2 right-3 -translate-y-1/2'
                                >
                                    <FaSearch className='h-4 w-4' />
                                </button>
                            </div>
                        </form>

                        {/* Mobile Categories */}
                        <nav className='flex flex-col gap-1'>
                            {categories.map((category) => (
                                <Link
                                    key={category.name}
                                    to={category.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className='hover:bg-primary/10 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile Account Links */}
                        <div className='border-primary/10 mt-4 flex gap-2 border-t pt-4'>
                            <a
                                href='https://www.dsebastien.net'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='bg-primary/5 hover:bg-primary/10 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors'
                            >
                                <FaUser className='h-4 w-4' />
                                Account
                            </a>
                            <button className='bg-primary/5 hover:bg-primary/10 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors'>
                                <FaHeart className='h-4 w-4' />
                                Wishlist
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header
