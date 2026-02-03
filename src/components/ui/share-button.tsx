import { useState, useRef, useEffect } from 'react'
import { FaShare, FaCheck, FaLink, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { cn } from '@/lib/utils'
import { copyToClipboard, canUseWebShare, webShare, openSocialShare } from '@/lib/share'
import { trackShareClicked } from '@/lib/analytics'

type ShareButtonVariant = 'icon' | 'text' | 'dropdown'
type ShareButtonSize = 'sm' | 'md' | 'lg'
type ShareType = 'product' | 'wishlist' | 'compare' | 'quiz_results'

interface ShareButtonProps {
    /** URL to share (can be a path like /product/my-product or full URL) */
    url: string
    /** Title for the share (product name) */
    title: string
    /** Optional description for social shares */
    description?: string | null
    /** Button variant: icon (compact), text (link-style), dropdown (full menu) */
    variant?: ShareButtonVariant
    /** Button size */
    size?: ShareButtonSize
    /** Additional CSS classes */
    className?: string
    /** Type of content being shared (for analytics) */
    shareType?: ShareType
    /** Optional item ID (for analytics) */
    itemId?: string
}

const sizeClasses: Record<ShareButtonSize, { button: string; icon: string; text: string }> = {
    sm: {
        button: 'h-7 w-7',
        icon: 'h-3.5 w-3.5',
        text: 'text-sm'
    },
    md: {
        button: 'h-10 w-10 sm:h-12 sm:w-12',
        icon: 'h-5 w-5 sm:h-6 sm:w-6',
        text: 'text-base'
    },
    lg: {
        button: 'h-12 w-12 sm:h-14 sm:w-14',
        icon: 'h-6 w-6 sm:h-7 sm:w-7',
        text: 'text-lg'
    }
}

/**
 * ShareButton component for sharing products and pages
 *
 * Supports three variants:
 * - icon: Compact button that copies link on click (for product cards)
 * - text: Text link style (for CTAs)
 * - dropdown: Full dropdown menu with multiple share options (for hero sections)
 *
 * On mobile devices with Web Share API support, automatically uses native share sheet.
 */
export const ShareButton: React.FC<ShareButtonProps> = ({
    url,
    title,
    description,
    variant = 'dropdown',
    size = 'md',
    className,
    shareType = 'product',
    itemId
}) => {
    const [copied, setCopied] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    // Get the full URL
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`

    // Reset copied state after 3 seconds
    useEffect(() => {
        if (!copied) return
        const timer = setTimeout(() => setCopied(false), 3000)
        return () => clearTimeout(timer)
    }, [copied])

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                buttonRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // Close dropdown on escape key
    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
                buttonRef.current?.focus()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen])

    const handleCopyLink = async (e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()

        const success = await copyToClipboard(fullUrl)
        if (success) {
            trackShareClicked({
                shareType,
                platform: 'copy',
                itemId
            })
            setCopied(true)
            setIsOpen(false)
        }
    }

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // For icon variant, just copy the link
        if (variant === 'icon') {
            await handleCopyLink()
            return
        }

        // Try native share on mobile
        if (canUseWebShare()) {
            const shared = await webShare({
                url: fullUrl,
                title,
                text: description || undefined
            })
            if (shared) return
        }

        // For text variant, just copy the link
        if (variant === 'text') {
            await handleCopyLink()
            return
        }

        // For dropdown variant, toggle the dropdown
        setIsOpen(!isOpen)
    }

    const handleSocialShare = (platform: 'twitter' | 'linkedin') => (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        trackShareClicked({
            shareType,
            platform,
            itemId
        })

        const shareText = description ? `${title} - ${description}` : title
        openSocialShare(platform, fullUrl, shareText)
        setIsOpen(false)
    }

    const sizeConfig = sizeClasses[size]

    // Icon variant - compact button for cards
    if (variant === 'icon') {
        return (
            <button
                onClick={handleShare}
                className={cn(
                    'flex cursor-pointer items-center justify-center rounded-full bg-white/90 transition-all hover:bg-white',
                    copied ? 'text-success-muted' : 'hover:text-secondary text-gray-600',
                    sizeConfig.button,
                    className
                )}
                aria-label={copied ? 'Link copied' : 'Share product'}
                title={copied ? 'Link copied!' : 'Copy link'}
            >
                {copied ? (
                    <FaCheck className={sizeConfig.icon} />
                ) : (
                    <FaShare className={sizeConfig.icon} />
                )}
            </button>
        )
    }

    // Text variant - link-style for CTAs
    if (variant === 'text') {
        return (
            <button
                onClick={handleShare}
                className={cn(
                    'flex cursor-pointer items-center gap-2 transition-colors',
                    copied ? 'text-success-muted' : 'text-primary/60 hover:text-secondary',
                    sizeConfig.text,
                    className
                )}
                aria-label={copied ? 'Link copied' : 'Share product'}
            >
                {copied ? (
                    <>
                        <FaCheck className='h-4 w-4' />
                        <span>Link copied!</span>
                    </>
                ) : (
                    <>
                        <FaShare className='h-4 w-4' />
                        <span>Share this product</span>
                    </>
                )}
            </button>
        )
    }

    // Dropdown variant - full menu with options
    return (
        <div className='relative'>
            <button
                ref={buttonRef}
                onClick={handleShare}
                className={cn(
                    'flex cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110',
                    copied
                        ? 'bg-success-subtle text-success-muted'
                        : 'bg-primary/10 text-primary/60 hover:bg-primary/20 hover:text-secondary',
                    sizeConfig.button,
                    className
                )}
                aria-label={copied ? 'Link copied' : 'Share product'}
                aria-haspopup='true'
                aria-expanded={isOpen}
                title={copied ? 'Link copied!' : 'Share'}
            >
                {copied ? (
                    <FaCheck className={sizeConfig.icon} />
                ) : (
                    <FaShare className={sizeConfig.icon} />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className='border-primary/10 bg-background absolute right-0 z-50 mt-2 w-48 rounded-lg border py-2 shadow-xl'
                    role='menu'
                    aria-orientation='vertical'
                >
                    {/* Copy Link */}
                    <button
                        onClick={handleCopyLink}
                        className='text-primary/80 hover:bg-primary/5 hover:text-secondary flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors'
                        role='menuitem'
                    >
                        <FaLink className='h-4 w-4' />
                        <span>Copy link</span>
                    </button>

                    {/* Twitter/X */}
                    <button
                        onClick={handleSocialShare('twitter')}
                        className='text-primary/80 hover:bg-primary/5 hover:text-secondary flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors'
                        role='menuitem'
                    >
                        <FaXTwitter className='h-4 w-4' />
                        <span>Share on X</span>
                    </button>

                    {/* LinkedIn */}
                    <button
                        onClick={handleSocialShare('linkedin')}
                        className='text-primary/80 hover:bg-primary/5 hover:text-secondary flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm transition-colors'
                        role='menuitem'
                    >
                        <FaLinkedin className='h-4 w-4' />
                        <span>Share on LinkedIn</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default ShareButton
