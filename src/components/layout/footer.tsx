import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import {
    FaHeart,
    FaShieldAlt,
    FaCreditCard,
    FaUser,
    FaEnvelope,
    FaStickyNote,
    FaUsers,
    FaHandshake,
    FaGithub,
    FaWrench,
    FaSpinner
} from 'react-icons/fa'
import { SiBuymeacoffee } from 'react-icons/si'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import socialsData from '@/data/socials.json'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/schemas/category.schema'
import { getFeaturedSorted } from '@/lib/collection-utils'
import { subscribeToNewsletter } from '@/lib/ghost-api'

// Ghost site configuration
const GHOST_SITE_URL = 'https://www.dsebastien.net'
const NEWSLETTER_SESSION_KEY = 'newsletter_subscribed'
const NEWSLETTER_NEVER_SHOW_KEY = 'newsletter_never_show'

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()
    const [email, setEmail] = useState('')
    const [subscribeStatus, setSubscribeStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle')
    const [errorMessage, setErrorMessage] = useState<string>('')
    // Initialize hasSubscribed from sessionStorage using lazy initializer
    const [hasSubscribed, setHasSubscribed] = useState<boolean>(() => {
        const subscribed = sessionStorage.getItem(NEWSLETTER_SESSION_KEY)
        if (subscribed === 'true') {
            console.log('[Newsletter] User has already subscribed (from sessionStorage)')
            return true
        }
        return false
    })
    // Initialize hasDismissed from localStorage
    const [hasDismissed, setHasDismissed] = useState<boolean>(() => {
        return localStorage.getItem(NEWSLETTER_NEVER_SHOW_KEY) === 'true'
    })

    // Get featured categories
    const featuredCategories = useMemo(() => {
        return getFeaturedSorted(categoriesData as Category[])
    }, [])

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setSubscribeStatus('loading')
        setErrorMessage('')

        console.log('[Newsletter] Submitting subscription for:', email)

        const result = await subscribeToNewsletter(GHOST_SITE_URL, {
            email: email.trim(),
            newsletters: [] // Subscribe to all newsletters (empty = default)
        })

        console.log('[Newsletter] Subscription result:', result)

        if (result.success) {
            setSubscribeStatus('success')
            setEmail('')
            // Store subscription in sessionStorage after a delay to show success message
            console.log('[Newsletter] Subscription successful, showing success message')
            setTimeout(() => {
                sessionStorage.setItem(NEWSLETTER_SESSION_KEY, 'true')
                setHasSubscribed(true)
                console.log('[Newsletter] Subscription stored in sessionStorage')
            }, 5000) // Hide after 5 seconds
        } else {
            setSubscribeStatus('error')
            setErrorMessage(result.error || 'Subscription failed. Please try again.')
        }
    }

    const handleDismiss = () => {
        localStorage.setItem(NEWSLETTER_NEVER_SHOW_KEY, 'true')
        setHasDismissed(true)
        console.log('[Newsletter] Permanently dismissed')
    }

    return (
        <footer id='footer' role='contentinfo' className='border-primary/10 bg-background border-t'>
            {/* Newsletter Section - Hidden if user already subscribed or dismissed */}
            {!hasSubscribed && !hasDismissed && (
                <div className='bg-secondary/5 border-primary/10 border-b py-12 sm:py-16'>
                    <div className='mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-20'>
                        <div className='mx-auto max-w-2xl text-center'>
                            <h3 className='mb-2 text-2xl font-bold sm:text-3xl'>
                                Stay Updated with Knowledge Tips
                            </h3>
                            <p className='text-primary/70 mb-6 text-sm sm:text-base'>
                                Join 2,300+ knowledge workers getting weekly insights on PKM,
                                productivity, and lifelong learning.
                            </p>
                            {subscribeStatus === 'success' ? (
                                <div className='bg-secondary/10 border-secondary/30 rounded-lg border px-6 py-4'>
                                    <p className='text-secondary font-semibold'>
                                        ✓ Success! Please check your email to confirm your
                                        subscription.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <form
                                        onSubmit={handleNewsletterSubmit}
                                        className='mx-auto flex max-w-md flex-col gap-3 sm:flex-row'
                                    >
                                        <label htmlFor='newsletter-email' className='sr-only'>
                                            Email address for newsletter subscription
                                        </label>
                                        <input
                                            id='newsletter-email'
                                            type='email'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder='Enter your email'
                                            required
                                            disabled={subscribeStatus === 'loading'}
                                            className='bg-primary/5 border-primary/10 text-primary placeholder:text-primary/40 focus:border-secondary/50 flex-1 rounded-lg border px-4 py-3 text-sm transition-colors outline-none disabled:opacity-50'
                                            aria-describedby='newsletter-description'
                                        />
                                        <span id='newsletter-description' className='sr-only'>
                                            Subscribe to receive updates about new products and
                                            resources
                                        </span>
                                        <button
                                            type='submit'
                                            disabled={subscribeStatus === 'loading'}
                                            className='bg-secondary hover:bg-secondary/90 flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold whitespace-nowrap text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                                        >
                                            {subscribeStatus === 'loading' ? (
                                                <>
                                                    <FaSpinner className='h-4 w-4 animate-spin' />
                                                    Subscribing...
                                                </>
                                            ) : (
                                                'Subscribe'
                                            )}
                                        </button>
                                    </form>
                                    {subscribeStatus === 'error' && errorMessage && (
                                        <div className='mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3'>
                                            <p className='text-sm font-semibold text-red-500'>
                                                ⚠️ {errorMessage}
                                            </p>
                                        </div>
                                    )}
                                    <div className='mt-3'>
                                        <button
                                            type='button'
                                            onClick={handleDismiss}
                                            className='text-primary/50 hover:text-primary/70 text-xs transition-colors hover:underline'
                                        >
                                            Don't show this again
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Footer Content */}
            <div className='py-12 sm:py-16'>
                <div className='mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-20'>
                    <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12'>
                        {/* Shop */}
                        <div>
                            <h4 className='mb-4 font-bold'>Shop</h4>
                            <ul className='space-y-2 text-sm'>
                                <li>
                                    <Link
                                        to='/'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        🏠 Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/products'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        🛍️ All Products
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/wishlist'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        💖 Wishlist
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/featured'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        ⭐ Featured
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/best-value'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        💎 Best Value
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/best-sellers'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        🔥 Best Sellers
                                    </Link>
                                </li>
                                {featuredCategories.map((cat) => (
                                    <li key={cat.id}>
                                        <Link
                                            to={`/categories/${cat.id}`}
                                            className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                        >
                                            <DynamicIcon
                                                iconName={cat.icon || 'FaFolder'}
                                                size='sm'
                                            />
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link
                                        to='/categories'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        📂 Categories
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/tags'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        🏷️ Tags
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/success-stories'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        🏆 Success Stories
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/compare'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        ⚖️ Compare Products
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className='mb-4 font-bold'>Support</h4>
                            <ul className='space-y-2 text-sm'>
                                <li>
                                    <Link
                                        to='/help'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        ❓ Help
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/faq'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        💡 FAQ
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href='mailto:sebastien@developassion.be'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        📧 Contact
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='mailto:sebastien@developassion.be?subject=Store%20Feedback'
                                        className='text-primary/70 hover:text-secondary transition-colors'
                                    >
                                        💬 Send Feedback
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://www.buymeacoffee.com/dsebastien'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <SiBuymeacoffee className='h-4 w-4' />
                                        Buy Me a Coffee
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className='mb-4 font-bold'>Resources</h4>
                            <ul className='space-y-2 text-sm'>
                                <li>
                                    <a
                                        href='https://www.dsebastien.net/about/'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <FaUser className='h-4 w-4' />
                                        About Me
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://www.dsebastien.net/newsletter/'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <FaEnvelope className='h-4 w-4' />
                                        Newsletter
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://notes.dsebastien.net/'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <FaStickyNote className='h-4 w-4' />
                                        Public Notes
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://www.dsebastien.net/join-the-knowii-community-and-fix-your-information-overload-problem/'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <FaUsers className='h-4 w-4' />
                                        Knowii Community
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://tools.dsebastien.net'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <FaWrench className='h-4 w-4' />
                                        Tools
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://www.dsebastien.net/knowii-affiliate-program/'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <FaHandshake className='h-4 w-4' />
                                        Affiliate Program
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://github.com/dsebastien'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <FaGithub className='h-4 w-4' />
                                        GitHub Profile
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Connect */}
                        <div>
                            <h4 className='mb-4 font-bold'>Connect</h4>
                            <div className='flex flex-wrap gap-3'>
                                {socialsData.socials.map((social) => (
                                    <a
                                        key={social.url}
                                        href={social.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='transition-transform hover:scale-110'
                                        aria-label={social.name}
                                        title={social.name}
                                    >
                                        <DynamicIcon iconName={social.icon} size='md' />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className='border-primary/10 mt-12 flex flex-wrap items-center justify-center gap-6 border-t pt-8 sm:mt-16 sm:pt-12'>
                        <div className='text-primary/60 flex items-center gap-2 text-sm'>
                            <FaShieldAlt className='h-5 w-5' />
                            <span>Secure Checkout</span>
                        </div>
                        <div className='text-primary/60 flex items-center gap-2 text-sm'>
                            <FaCreditCard className='h-5 w-5' />
                            <span>Gumroad Payment</span>
                        </div>
                        <div className='text-primary/60 flex items-center gap-2 text-sm'>
                            <FaHeart className='text-secondary h-5 w-5' />
                            <span>30-Day Guarantee</span>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className='border-primary/10 text-primary/70 mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center text-sm sm:flex-row sm:text-left'>
                        <p>
                            © {currentYear}{' '}
                            <a
                                href='https://www.dsebastien.net'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='hover:text-secondary transition-colors'
                            >
                                Knowledge Forge
                            </a>
                            . All rights reserved.
                        </p>
                        <p className='flex items-center gap-1'>
                            Made with <FaHeart className='text-secondary h-4 w-4' /> by{' '}
                            <a
                                href='https://www.dsebastien.net'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='hover:text-secondary transition-colors'
                            >
                                Sébastien Dubois
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
