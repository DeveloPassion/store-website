import {
    FaRobot,
    FaTools,
    FaBoxOpen,
    FaChalkboardTeacher,
    FaUsers,
    FaPen,
    FaGraduationCap,
    FaGift,
    FaBrain,
    FaLightbulb,
    FaBook,
    FaRocket,
    FaCode,
    FaCheckSquare,
    FaStar
} from 'react-icons/fa'
import { SiObsidian } from 'react-icons/si'

export const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FaRobot,
    FaTools,
    FaBoxOpen,
    FaChalkboardTeacher,
    FaUsers,
    FaPen,
    FaGraduationCap,
    FaGift,
    FaBrain,
    FaLightbulb,
    FaBook,
    FaRocket,
    FaCode,
    FaCheckSquare,
    FaStar,
    SiObsidian
}

export function getCategoryIcon(
    iconName?: string
): React.ComponentType<{ className?: string }> | undefined {
    if (!iconName) return undefined
    return categoryIconMap[iconName]
}
