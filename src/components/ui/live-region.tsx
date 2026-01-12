import type { LiveRegionPoliteness } from '@/hooks/use-live-region'

interface LiveRegionProps {
    /**
     * Message to announce to screen readers
     */
    message: string
    /**
     * Politeness level for announcements
     * @default 'polite'
     */
    politeness?: LiveRegionPoliteness
    /**
     * Optional className for styling
     */
    className?: string
}

/**
 * ARIA Live Region Component
 *
 * Announces dynamic content changes to screen reader users.
 * The component is visually hidden but announced by assistive technologies.
 *
 * @example
 * ```tsx
 * const { message, politeness, announce } = useLiveRegion()
 *
 * // In your component
 * <LiveRegion message={message} politeness={politeness} />
 * ```
 *
 * WCAG 2.1 AA - Success Criterion 4.1.3 (Status Messages)
 */
const LiveRegion: React.FC<LiveRegionProps> = ({
    message,
    politeness = 'polite',
    className = ''
}) => {
    // Don't render if politeness is 'off' or no message
    if (politeness === 'off' || !message) {
        return null
    }

    // Use role="alert" for assertive, role="status" for polite
    const role = politeness === 'assertive' ? 'alert' : 'status'

    return (
        <div
            role={role}
            aria-live={politeness}
            aria-atomic='true'
            className={`sr-only ${className}`}
        >
            {message}
        </div>
    )
}

export default LiveRegion
