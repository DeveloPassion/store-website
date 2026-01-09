import { FaTag, FaRobot, FaBrain, FaRocket, FaFileAlt, FaPen, FaBookOpen } from 'react-icons/fa'
import { SiObsidian } from 'react-icons/si'

export const tagIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FaTag,
    FaRobot,
    FaBrain,
    FaRocket,
    FaFileAlt,
    FaPen,
    FaBookOpen,
    SiObsidian
}

/**
 * Get icon component for a tag
 * Falls back to FaTag if icon not found
 */
export function getTagIcon(iconName?: string): React.ComponentType<{ className?: string }> {
    if (!iconName) return FaTag
    return tagIconMap[iconName] || FaTag
}
