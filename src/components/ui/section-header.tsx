import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MarkdownContent } from '@/components/ui/markdown-content'
import type React from 'react'

interface SectionHeaderProps {
    /** Main heading text */
    title: string

    /** Optional subtitle/description */
    subtitle?: string

    /** Optional icon component to display above title */
    icon?: React.ReactNode

    /** Additional CSS classes for the container */
    className?: string

    /** Additional CSS classes for the title */
    titleClassName?: string

    /** Additional CSS classes for the subtitle */
    subtitleClassName?: string

    /** Disable animation */
    disableAnimation?: boolean

    /** Text alignment */
    align?: 'left' | 'center' | 'right'

    /** Size variant */
    size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
    sm: {
        title: 'text-2xl sm:text-3xl',
        subtitle: 'text-base sm:text-lg'
    },
    md: {
        title: 'text-3xl sm:text-4xl',
        subtitle: 'text-lg sm:text-xl'
    },
    lg: {
        title: 'text-3xl sm:text-4xl md:text-5xl',
        subtitle: 'text-lg sm:text-xl'
    }
}

const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    icon,
    className,
    titleClassName,
    subtitleClassName,
    disableAnimation = false,
    align = 'center',
    size = 'lg'
}) => {
    const Container = disableAnimation ? 'div' : motion.div
    const animationProps = disableAnimation
        ? {}
        : {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true }
          }

    const sizeConfig = sizeClasses[size]

    return (
        <Container {...animationProps} className={cn('mb-12', alignClasses[align], className)}>
            {icon && (
                <div className={cn('mb-4 flex', align === 'center' && 'justify-center')}>
                    {icon}
                </div>
            )}
            <h2 className={cn('mb-4 font-bold', sizeConfig.title, titleClassName)}>{title}</h2>
            {subtitle && (
                <MarkdownContent
                    content={subtitle}
                    autoDetect
                    className={cn(
                        'text-primary/70 mx-auto max-w-2xl',
                        sizeConfig.subtitle,
                        subtitleClassName
                    )}
                />
            )}
        </Container>
    )
}
