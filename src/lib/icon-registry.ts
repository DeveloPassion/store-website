/**
 * Centralized icon registry for react-icons
 * Single source of truth for all icon imports and mappings
 */

import { IconType } from 'react-icons'
import {
    FaCalendarAlt,
    FaMicrophone,
    FaGhost,
    FaYoutube,
    FaTerminal,
    FaLightbulb,
    FaTools,
    FaRobot,
    FaCode,
    FaGlobe,
    FaWrench,
    FaVideo,
    FaGraduationCap,
    FaBook,
    FaBookOpen,
    FaDatabase,
    FaNewspaper,
    FaUsers,
    FaFileAlt,
    FaBrain,
    FaPen,
    FaChalkboardTeacher,
    FaBoxOpen,
    FaCheckSquare,
    FaReddit,
    FaUser,
    FaEnvelope,
    FaStickyNote,
    FaStore,
    FaHandshake,
    FaGithub,
    FaTiktok,
    FaMedium,
    FaLinkedin,
    FaHackerNews,
    FaPodcast,
    FaGift,
    FaRocket,
    FaStar,
    FaTag
} from 'react-icons/fa'
import { SiObsidian, SiAngular, SiNotion, SiTrello, SiSubstack, SiBluesky } from 'react-icons/si'
import { FaXTwitter, FaThreads } from 'react-icons/fa6'

/**
 * Complete icon registry mapping icon names to components
 */
export const iconRegistry: Record<string, IconType> = {
    // Font Awesome icons
    FaCalendarAlt,
    FaMicrophone,
    FaGhost,
    FaYoutube,
    FaTerminal,
    FaLightbulb,
    FaTools,
    FaRobot,
    FaCode,
    FaGlobe,
    FaWrench,
    FaVideo,
    FaGraduationCap,
    FaBook,
    FaBookOpen,
    FaDatabase,
    FaNewspaper,
    FaUsers,
    FaFileAlt,
    FaBrain,
    FaPen,
    FaChalkboardTeacher,
    FaBoxOpen,
    FaCheckSquare,
    FaReddit,
    FaUser,
    FaEnvelope,
    FaStickyNote,
    FaStore,
    FaHandshake,
    FaGithub,
    FaTiktok,
    FaMedium,
    FaLinkedin,
    FaHackerNews,
    FaPodcast,
    FaGift,
    FaRocket,
    FaStar,
    FaTag,
    // Simple Icons
    SiObsidian,
    SiAngular,
    SiNotion,
    SiTrello,
    SiSubstack,
    SiBluesky,
    // Font Awesome 6
    FaXTwitter,
    FaThreads
}

/**
 * Get icon component by name
 */
export function getIcon(
    iconName?: string
): React.ComponentType<{ className?: string }> | undefined {
    if (!iconName) return undefined
    return iconRegistry[iconName]
}

/**
 * Get icon component with a fallback
 */
export function getIconWithFallback(
    iconName: string | undefined,
    fallback: React.ComponentType<{ className?: string }>
): React.ComponentType<{ className?: string }> {
    return getIcon(iconName) || fallback
}
