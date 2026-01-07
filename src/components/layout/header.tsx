import { useState } from 'react'
import { Link } from 'react-router'
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa'

interface HeaderProps {
    onOpenCommandPalette: () => void
}

const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const categories = [
        { name: 'All Products', path: '/' },
        { name: 'Courses', path: '/?category=Courses' },
        { name: 'Kits & Templates', path: '/?category=Kits' },
        { name: 'Workshops', path: '/?category=Workshops' },
        { name: 'Bundles', path: '/?category=Bundles' },
        { name: 'Free Resources', path: '/?category=Free Resources' }
    ]

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
                        <Link
                            to='/tags'
                            className='hover:bg-primary/10 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                        >
                            Tags
                        </Link>
                    </nav>

                    {/* Search Bar - Click to open command palette */}
                    <button
                        onClick={onOpenCommandPalette}
                        className='hidden max-w-md flex-1 md:block'
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

                    {/* Right Actions */}
                    <div className='flex items-center gap-2 sm:gap-3'>
                        {/* Search icon for mobile */}
                        <button
                            onClick={onOpenCommandPalette}
                            className='hover:bg-primary/10 rounded-lg p-2 transition-colors md:hidden'
                        >
                            <FaSearch className='h-5 w-5' />
                        </button>

                        {/* Website Link */}
                        <a
                            href='https://www.dsebastien.net'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-primary/10 hover:bg-primary/20 hidden items-center gap-2 rounded-lg px-4 py-2 transition-colors sm:flex'
                        >
                            <img
                                src='https://www.dsebastien.net/assets/images/developassion-logo.png?v=227ae60558'
                                alt='DeveloPassion'
                                className='h-5 w-5 rounded-full object-contain'
                            />
                            <span className='hidden sm:inline'>Website</span>
                        </a>

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
                        {/* Mobile Search Button */}
                        <button
                            onClick={() => {
                                onOpenCommandPalette()
                                setMobileMenuOpen(false)
                            }}
                            className='mb-4 w-full md:hidden'
                        >
                            <div className='bg-primary/5 border-primary/10 hover:border-secondary/50 hover:bg-primary/10 flex h-10 w-full items-center rounded-lg border px-4 text-left transition-colors'>
                                <FaSearch className='text-primary/40 mr-3 h-4 w-4' />
                                <span className='text-primary/40 text-sm'>Search products...</span>
                                <div className='border-primary/20 bg-primary/5 ml-auto flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs'>
                                    <kbd className='text-primary/60'>/</kbd>
                                </div>
                            </div>
                        </button>

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
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header
