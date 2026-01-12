import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseButtonProps {
    /** Button visual variant */
    variant?: ButtonVariant

    /** Button size */
    size?: ButtonSize

    /** Make button full width */
    fullWidth?: boolean

    /** Icon to display on the left side */
    leftIcon?: React.ReactNode

    /** Icon to display on the right side */
    rightIcon?: React.ReactNode

    /** Show loading state */
    isLoading?: boolean

    /** Disable button */
    disabled?: boolean

    /** Additional CSS classes */
    className?: string

    /** Button content */
    children: React.ReactNode
}

type ButtonAsButton = BaseButtonProps &
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof BaseButtonProps> & {
        /** Render as button element */
        as?: 'button'
        href?: never
    }

type ButtonAsAnchor = BaseButtonProps &
    Omit<React.ComponentPropsWithoutRef<'a'>, keyof BaseButtonProps> & {
        /** Render as anchor element */
        as: 'a'
        /** Href for anchor element */
        href: string
    }

export type ButtonProps = ButtonAsButton | ButtonAsAnchor

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105',
    secondary:
        'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-colors',
    outline:
        'border-2 border-primary/20 hover:border-primary/40 bg-transparent hover:bg-primary/5 transition-colors',
    ghost: 'bg-transparent hover:bg-primary/10 transition-colors'
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
}

/**
 * Versatile button component with multiple variants and sizes.
 * Supports rendering as either a button or anchor element.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">Click me</Button>
 * <Button variant="outline" leftIcon={<FaCheck />}>Save</Button>
 * <Button as="a" href="/products" variant="secondary">View Products</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
    (props, ref) => {
        const {
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            leftIcon,
            rightIcon,
            isLoading = false,
            disabled = false,
            className,
            children,
            as = 'button',
            ...restProps
        } = props

        const baseClasses = cn(
            'inline-flex items-center justify-center gap-2 rounded-lg font-semibold cursor-pointer transition-all',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
            variantClasses[variant],
            sizeClasses[size],
            fullWidth && 'w-full',
            className
        )

        const content = (
            <>
                {isLoading ? (
                    <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                ) : (
                    leftIcon && <span className='inline-flex shrink-0'>{leftIcon}</span>
                )}
                <span>{children}</span>
                {rightIcon && !isLoading && (
                    <span className='inline-flex shrink-0'>{rightIcon}</span>
                )}
            </>
        )

        if (as === 'a') {
            const { href, ...anchorProps } = restProps as ButtonAsAnchor
            return (
                <a
                    ref={ref as React.Ref<HTMLAnchorElement>}
                    href={href}
                    className={baseClasses}
                    aria-disabled={disabled || isLoading}
                    {...anchorProps}
                >
                    {content}
                </a>
            )
        }

        const buttonProps = restProps as ButtonAsButton
        return (
            <button
                ref={ref as React.Ref<HTMLButtonElement>}
                type='button'
                disabled={disabled || isLoading}
                className={baseClasses}
                {...buttonProps}
            >
                {content}
            </button>
        )
    }
)

Button.displayName = 'Button'
