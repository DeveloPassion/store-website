/**
 * DynamicIcon component - Renders icons dynamically
 * This component intentionally creates icons dynamically as its core purpose.
 * The ESLint rule is disabled for this utility component.
 */

import { getIcon } from '@/lib/icon-registry'

interface DynamicIconProps {
    iconName?: string
    className?: string
    style?: React.CSSProperties
}

/* eslint-disable react-hooks/static-components */
export const DynamicIcon: React.FC<DynamicIconProps> = ({ iconName, className, style }) => {
    const IconComponent = getIcon(iconName)

    if (!IconComponent) {
        return null
    }

    // Wrap in a span to apply style, as react-icons IconType doesn't accept style prop
    if (style) {
        return (
            <span style={style}>
                <IconComponent className={className} />
            </span>
        )
    }

    return <IconComponent className={className} />
}
/* eslint-enable react-hooks/static-components */
