/**
 * DynamicIcon component - Renders icons dynamically based on string name.
 *
 * This component intentionally looks up and renders icon components at runtime.
 * The react-hooks/static-components rule is disabled because dynamic component
 * lookup is the core purpose of this utility - it receives icon names as strings
 * and renders the corresponding React icon component from a registry.
 *
 * Supports:
 * - Emojis (e.g., "🚀", "💡") - rendered as span
 * - React icon names (e.g., "FaRobot", "SiObsidian")
 * - Image URLs (http/https)
 * - Local image paths (starting with /)
 * - Brand color mapping for specific icons
 * - Size presets (sm, md, lg, xl)
 */

import { getIcon } from '@/lib/icon-registry'
import { isEmoji } from '@/lib/is-emoji'

// Icon-specific colors (brand colors where applicable)
const iconColors: Record<string, string> = {
    FaYoutube: 'text-red-500',
    FaGhost: 'text-gray-300',
    SiObsidian: 'text-purple-400',
    SiAngular: 'text-red-500',
    SiNotion: 'text-gray-200',
    SiTrello: 'text-blue-400',
    FaReddit: 'text-orange-500',
    FaCalendarAlt: 'text-blue-400',
    FaTerminal: 'text-success',
    FaLightbulb: 'text-yellow-400',
    FaRobot: 'text-cyan-400',
    FaCode: 'text-emerald-400',
    FaGlobe: 'text-blue-400',
    FaGraduationCap: 'text-indigo-400',
    FaBook: 'text-amber-500',
    FaBookOpen: 'text-teal-400',
    FaNewspaper: 'text-gray-300',
    FaBrain: 'text-pink-400',
    FaPen: 'text-violet-400',
    FaChalkboardTeacher: 'text-orange-400',
    FaBoxOpen: 'text-amber-400',
    FaCheckSquare: 'text-success',
    FaUser: 'text-blue-400',
    FaEnvelope: 'text-amber-400',
    FaStickyNote: 'text-yellow-400',
    FaStore: 'text-emerald-400',
    FaHandshake: 'text-teal-400',
    FaGithub: 'text-gray-300',
    FaTiktok: 'text-gray-200',
    FaMedium: 'text-gray-200',
    FaLinkedin: 'text-blue-500',
    FaHackerNews: 'text-orange-500',
    FaPodcast: 'text-purple-400',
    FaGift: 'text-pink-400',
    FaRocket: 'text-orange-500',
    FaStar: 'text-yellow-400',
    FaDatabase: 'text-cyan-400',
    SiSubstack: 'text-orange-400',
    SiBluesky: 'text-sky-400',
    FaXTwitter: 'text-gray-200',
    FaThreads: 'text-gray-200',
    SiBuymeacoffee: 'text-yellow-400'
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
}

interface DynamicIconProps {
    iconName?: string | null
    className?: string
    /** Size preset (sm, md, lg, xl). Only applies to SVG icons, not images. */
    size?: 'sm' | 'md' | 'lg' | 'xl'
    /** Whether to apply brand colors. Default: true */
    useBrandColors?: boolean
}

// Emoji size classes (slightly larger than icon sizes for visual balance)
const emojiSizeClasses = {
    sm: 'text-base', // 16px
    md: 'text-xl', // 20px
    lg: 'text-2xl', // 24px
    xl: 'text-3xl' // 30px
}

/* eslint-disable react-hooks/static-components -- Dynamic component lookup is intentional */
export const DynamicIcon: React.FC<DynamicIconProps> = ({
    iconName,
    className = '',
    size = 'md',
    useBrandColors = true
}) => {
    // If iconName is an emoji, render it as a span
    if (iconName && isEmoji(iconName)) {
        return (
            <span
                className={`${emojiSizeClasses[size]} leading-none ${className}`}
                role='img'
                aria-hidden='true'
            >
                {iconName}
            </span>
        )
    }

    // If iconName is a URL or path, render an image
    if (iconName && (iconName.startsWith('http') || iconName.startsWith('/'))) {
        return (
            <img
                src={iconName}
                alt=''
                className={`${sizeClasses[size]} object-contain ${className}`}
            />
        )
    }

    // If iconName is a known react-icon name, render it
    const IconComponent = getIcon(iconName)

    if (!IconComponent) {
        return null
    }

    // Apply brand color if enabled and available
    const colorClass = useBrandColors && iconName ? iconColors[iconName] || '' : ''
    const combinedClassName = `${sizeClasses[size]} ${colorClass} ${className}`.trim()

    return <IconComponent className={combinedClassName} />
}
/* eslint-enable react-hooks/static-components */
