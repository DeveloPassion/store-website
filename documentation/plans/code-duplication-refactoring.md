# Code Duplication Refactoring Plan

**Date:** 2026-01-12
**Estimated Impact:** ~620 lines of duplicate code eliminated
**Priority Areas:** Animation Patterns, Section Headers, Button Components, Collection Cards

---

## Executive Summary

This plan addresses 4 high-priority duplication areas in the store-website codebase, totaling ~620 lines of duplicate code. The refactoring will improve maintainability, consistency, and testability while maintaining 100% backwards compatibility.

**Estimated Impact:**

- ~620 lines of duplicate code eliminated
- 15+ files simplified
- 8 new reusable components/utilities created
- Test coverage: 90%+ for utilities, 80%+ for components

---

## Phase 1: Animation Patterns Refactoring (LOWEST RISK - START HERE)

**Priority:** HIGH | **Risk:** LOW | **Dependencies:** None

### 1.1 Create Animation Utilities

**New Files:**

- `/src/lib/animation-variants.ts`
- `/src/lib/animation-variants.spec.ts`
- `/src/hooks/use-animation-variants.ts`
- `/src/hooks/use-animation-variants.spec.tsx`

**Implementation:**

```typescript
// /src/lib/animation-variants.ts
import type { Variants } from 'framer-motion'

/**
 * Standard container variants for staggered child animations
 * Used across product detail sections (features, benefits, PAS, FAQ)
 */
export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

/**
 * Stagger variant with customizable delay
 */
export function createContainerVariants(staggerDelay = 0.1): Variants {
    return {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay
            }
        }
    }
}

/**
 * Standard item variants for fade-in-up animation
 * Used for individual items within staggered containers
 */
export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

/**
 * Header variants for section headers
 * Used in product features, benefits, PAS sections
 */
export const headerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

/**
 * Custom item variants with configurable y offset
 */
export function createItemVariants(yOffset = 20): Variants {
    return {
        hidden: { opacity: 0, y: yOffset },
        visible: { opacity: 1, y: 0 }
    }
}
```

```typescript
// /src/hooks/use-animation-variants.ts
import { useMemo } from 'react'
import type { Variants } from 'framer-motion'
import {
    containerVariants as defaultContainer,
    itemVariants as defaultItem,
    headerVariants as defaultHeader,
    createContainerVariants,
    createItemVariants
} from '@/lib/animation-variants'

interface AnimationVariantsOptions {
    staggerDelay?: number
    itemYOffset?: number
}

interface AnimationVariantsResult {
    containerVariants: Variants
    itemVariants: Variants
    headerVariants: Variants
}

/**
 * Hook to get animation variants with optional customization
 * Memoizes variants to prevent recreation on every render
 */
export function useAnimationVariants(options?: AnimationVariantsOptions): AnimationVariantsResult {
    return useMemo(() => {
        if (!options?.staggerDelay && !options?.itemYOffset) {
            return {
                containerVariants: defaultContainer,
                itemVariants: defaultItem,
                headerVariants: defaultHeader
            }
        }

        return {
            containerVariants: options.staggerDelay
                ? createContainerVariants(options.staggerDelay)
                : defaultContainer,
            itemVariants: options.itemYOffset
                ? createItemVariants(options.itemYOffset)
                : defaultItem,
            headerVariants: defaultHeader
        }
    }, [options?.staggerDelay, options?.itemYOffset])
}
```

### 1.2 Migration Strategy for Animation Patterns

**Files to Migrate (4 files):**

1. `/src/components/products/product-features.tsx`
2. `/src/components/products/product-benefits.tsx`
3. `/src/components/products/product-pas.tsx`
4. `/src/components/products/product-faq.tsx`

**Migration Example (product-features.tsx):**

```typescript
// BEFORE (lines 32-46):
const ProductFeatures: React.FC<ProductFeaturesProps> = ({ product }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        // ... JSX
    )
}

// AFTER:
import { useAnimationVariants } from '@/hooks/use-animation-variants'

const ProductFeatures: React.FC<ProductFeaturesProps> = ({ product }) => {
    const { containerVariants, itemVariants } = useAnimationVariants()

    return (
        // ... JSX (unchanged)
    )
}
```

**Risk Assessment:**

- **Risk:** VERY LOW - Pure refactoring, no behavior changes
- **Testing:** Visual regression testing on product detail pages
- **Rollback:** Simple - revert import and restore local variants

---

## Phase 2: Section Header Component (LOW RISK)

**Priority:** HIGH | **Risk:** LOW | **Dependencies:** Phase 1 (animation variants)

### 2.1 Create SectionHeader Component

**New Files:**

- `/src/components/ui/section-header.tsx`
- `/src/components/ui/section-header.spec.tsx`

**Component Interface:**

```typescript
// /src/components/ui/section-header.tsx
import { motion } from 'framer-motion'
import { headerVariants } from '@/lib/animation-variants'
import { cn } from '@/lib/utils'
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
        <Container
            {...animationProps}
            className={cn('mb-12', alignClasses[align], className)}
        >
            {icon && (
                <div className={cn('mb-4 flex', align === 'center' && 'justify-center')}>
                    {icon}
                </div>
            )}
            <h2
                className={cn(
                    'mb-4 font-bold',
                    sizeConfig.title,
                    titleClassName
                )}
            >
                {title}
            </h2>
            {subtitle && (
                <p
                    className={cn(
                        'text-primary/70 mx-auto max-w-2xl',
                        sizeConfig.subtitle,
                        subtitleClassName
                    )}
                >
                    {subtitle}
                </p>
            )}
        </Container>
    )
}
```

### 2.2 Migration Strategy for Section Headers

**Files to Migrate (4 files):**

1. `/src/components/products/product-features.tsx` (lines 52-64)
2. `/src/components/products/product-benefits.tsx` (lines 45-57)
3. `/src/components/products/product-pas.tsx` (lines 37-47 × 3 sections)
4. `/src/components/products/product-faq.tsx` (lines 39-51)

**Migration Example:**

```typescript
// BEFORE:
<motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className='mb-12 text-center'
>
    <h2 className='mb-4 text-3xl font-bold sm:text-4xl md:text-5xl'>
        What's Included
    </h2>
    <p className='text-primary/70 mx-auto max-w-2xl text-lg sm:text-xl'>
        {product.description}
    </p>
</motion.div>

// AFTER:
<SectionHeader
    title="What's Included"
    subtitle={product.description}
/>
```

---

## Phase 3: Button Component Library (MEDIUM RISK)

**Priority:** MEDIUM | **Risk:** MEDIUM | **Dependencies:** None

### 3.1 Create Button Components

**New Directory Structure:**

```
/src/components/ui/buttons/
├── button.tsx (base button with variants)
├── button.spec.tsx
├── cta-button.tsx (specialized CTA button)
├── cta-button.spec.tsx
├── icon-button.tsx (icon-only button)
├── icon-button.spec.tsx
└── index.ts (barrel export)
```

**Base Button Component:**

```typescript
// /src/components/ui/buttons/button.tsx
import { cn } from '@/lib/utils'
import type React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost' | 'danger'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
    /** Visual variant */
    variant?: ButtonVariant

    /** Size variant */
    size?: ButtonSize

    /** Full width button */
    fullWidth?: boolean

    /** Loading state */
    isLoading?: boolean

    /** Icon to display before text */
    leftIcon?: React.ReactNode

    /** Icon to display after text */
    rightIcon?: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl disabled:bg-secondary/50',
    secondary: 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/30',
    outlined: 'border border-primary/10 hover:border-secondary/30 hover:bg-secondary/5 text-primary',
    ghost: 'hover:bg-primary/10 text-primary',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl disabled:bg-red-500/50'
}

const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-2 py-1 text-xs rounded',
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
    xl: 'px-8 py-4 text-xl rounded-lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            className,
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || isLoading

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={cn(
                    'inline-flex items-center justify-center gap-2 font-semibold transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    variantClasses[variant],
                    sizeClasses[size],
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {!isLoading && leftIcon}
                {children}
                {!isLoading && rightIcon}
            </button>
        )
    }
)

Button.displayName = 'Button'
```

**CTA Button Component:**

```typescript
// /src/components/ui/buttons/cta-button.tsx
import { cn } from '@/lib/utils'
import type React from 'react'

interface CTAButtonProps extends React.ComponentPropsWithoutRef<'a'> {
    /** Primary CTA or secondary */
    variant?: 'primary' | 'secondary'

    /** Size variant */
    size?: 'md' | 'lg' | 'xl'

    /** Icon to display */
    icon?: React.ReactNode

    /** Enable hover scale animation */
    enableHoverScale?: boolean

    /** Enable gumroad overlay */
    enableGumroadOverlay?: boolean
}

const variantClasses = {
    primary: 'bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20'
}

const sizeClasses = {
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-3 text-lg',
    xl: 'px-8 py-4 text-xl sm:px-12'
}

export const CTAButton = React.forwardRef<HTMLAnchorElement, CTAButtonProps>(
    (
        {
            children,
            className,
            variant = 'primary',
            size = 'lg',
            icon,
            enableHoverScale = true,
            enableGumroadOverlay = false,
            ...props
        },
        ref
    ) => {
        return (
            <a
                ref={ref}
                className={cn(
                    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-all',
                    variantClasses[variant],
                    sizeClasses[size],
                    enableHoverScale && 'hover:scale-105',
                    className
                )}
                data-gumroad-overlay-checkout={enableGumroadOverlay ? 'true' : undefined}
                {...props}
            >
                {icon}
                {children}
            </a>
        )
    }
)

CTAButton.displayName = 'CTAButton'
```

### 3.2 Migration Strategy for Buttons

**High-Impact Files (10+ occurrences):**

1. `/src/components/products/product-card-ecommerce.tsx`
2. `/src/components/products/product-cta.tsx`
3. `/src/components/products/sticky-buy-button.tsx`
4. `/src/components/products/product-hero.tsx`
5. `/src/components/products/product-faq.tsx`

**Migration Example:**

```typescript
// BEFORE:
<a
    href={buildGumroadUrlFromProduct(product)}
    data-gumroad-overlay-checkout='true'
    className='bg-secondary hover:bg-secondary/90 mb-8 inline-block cursor-pointer rounded-lg px-8 py-4 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl sm:px-12 sm:text-xl'
>
    {isFree ? 'Get Now' : 'Buy Now'}
</a>

// AFTER:
import { CTAButton } from '@/components/ui/buttons'

<CTAButton
    href={buildGumroadUrlFromProduct(product)}
    enableGumroadOverlay
    size="xl"
>
    {isFree ? 'Get Now' : 'Buy Now'}
</CTAButton>
```

**Risk Assessment:**

- **Risk:** MEDIUM - Visual changes require careful testing
- **Testing:** Visual regression testing on all pages with buttons
- **Migration Strategy:** Gradual - migrate one component at a time
- **Rollback:** Keep old classes documented for quick revert

---

## Phase 4: Collection Card Component (HIGHEST RISK - DO LAST)

**Priority:** MEDIUM | **Risk:** HIGH | **Dependencies:** None

### 4.1 Create Generic CollectionCard Component

**New Files:**

- `/src/components/ui/collection-card.tsx`
- `/src/components/ui/collection-card.spec.tsx`

**Component Interface:**

```typescript
// /src/components/ui/collection-card.tsx
import { Link } from 'react-router'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { FaStar } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import type React from 'react'

interface CollectionCardProps {
    /** Item identifier (category-id, tag-id) */
    id: string

    /** Display name */
    name: string

    /** Description text */
    description: string

    /** Icon name (React Icon) */
    icon?: string

    /** Color hex code */
    color?: string

    /** Item count (e.g., "5 products") */
    count?: number

    /** Count label singular (e.g., "product") */
    countLabel?: string

    /** Show featured badge */
    showFeaturedBadge?: boolean

    /** Card variant */
    variant?: 'simple' | 'detailed'

    /** Link path prefix (e.g., "categories", "tags") */
    pathPrefix: string

    /** Additional CSS classes */
    className?: string
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
    id,
    name,
    description,
    icon,
    color,
    count,
    countLabel = 'product',
    showFeaturedBadge = false,
    variant = 'detailed',
    pathPrefix,
    className
}) => {
    const gradientStyle = color
        ? {
              background: variant === 'simple'
                  ? `linear-gradient(135deg, ${color}20, ${color}05)`
                  : `linear-gradient(135deg, ${color}15, ${color}05)`
          }
        : undefined

    const iconBgStyle = color
        ? { backgroundColor: `${color}20` }
        : { backgroundColor: 'rgba(255, 255, 255, 0.1)' }

    if (variant === 'simple') {
        return (
            <Link
                to={`/${pathPrefix}/${id}`}
                className={cn(
                    'group border-primary/10 hover:border-secondary/30 hover:shadow-secondary/10 flex flex-col items-center justify-center rounded-xl border bg-gradient-to-br p-8 transition-all hover:scale-105 hover:shadow-xl',
                    className
                )}
                style={gradientStyle}
            >
                {icon && (
                    <div
                        className='mb-3 flex h-16 w-16 items-center justify-center rounded-lg'
                        style={iconBgStyle}
                    >
                        <DynamicIcon
                            iconName={icon}
                            className='h-8 w-8'
                            style={{ color }}
                        />
                    </div>
                )}
                <div className='group-hover:text-secondary text-lg font-bold'>{name}</div>
            </Link>
        )
    }

    // Detailed variant
    return (
        <Link
            to={`/${pathPrefix}/${id}`}
            className={cn(
                'group border-primary/10 hover:border-secondary/30 relative flex cursor-pointer flex-col gap-4 rounded-xl border p-6 text-left transition-all hover:scale-102 hover:shadow-lg',
                className
            )}
            style={gradientStyle}
        >
            {/* Featured badge */}
            {showFeaturedBadge && (
                <div className='bg-secondary/10 border-secondary/30 absolute top-3 right-3 flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold'>
                    <FaStar className='text-secondary h-3 w-3' />
                    Featured
                </div>
            )}

            {/* Icon and Title */}
            <div className='flex items-center gap-4'>
                {icon && (
                    <div
                        className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg'
                        style={iconBgStyle}
                    >
                        <DynamicIcon
                            iconName={icon}
                            className='h-6 w-6'
                            style={{ color }}
                        />
                    </div>
                )}
                <h3 className='group-hover:text-secondary text-xl font-bold transition-colors'>
                    {name}
                </h3>
            </div>

            {/* Description */}
            <p className='text-primary/70 text-sm'>{description}</p>

            {/* Stats */}
            {count !== undefined && (
                <div className='text-primary/50 mt-auto text-xs'>
                    <span>
                        {count} {count === 1 ? countLabel : `${countLabel}s`}
                    </span>
                </div>
            )}
        </Link>
    )
}
```

### 4.2 Migration Strategy - Wrapper Pattern (RECOMMENDED)

Keep existing CategoryCard and TagCard as thin wrappers around CollectionCard:

```typescript
// /src/components/categories/category-card.tsx (AFTER)
import { CollectionCard } from '@/components/ui/collection-card'
import type { Category } from '@/types/category'

interface CategoryCardProps {
    category: Category
    count?: number
    showFeaturedBadge?: boolean
    variant?: 'simple' | 'detailed'
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    count,
    showFeaturedBadge = false,
    variant = 'detailed'
}) => {
    return (
        <CollectionCard
            id={category.id}
            name={category.name}
            description={category.description}
            icon={category.icon}
            color={category.color}
            count={count}
            countLabel="product"
            showFeaturedBadge={showFeaturedBadge && category.featured}
            variant={variant}
            pathPrefix="categories"
        />
    )
}
```

**Why Wrapper Pattern:**

1. Maintains backwards compatibility
2. Preserves existing API (less migration work)
3. Allows gradual adoption
4. Easier rollback if issues arise
5. Type-safe (Category/Tag types enforced)

---

## Implementation Sequence & Build Strategy

### Phase 1: Foundation (Week 1)

```
Day 1-2: Animation Utilities
├── Create animation-variants.ts + tests
├── Create use-animation-variants hook + tests
├── Run tests: bun test src/lib/animation-variants.spec.ts
├── Run tests: bun test src/hooks/use-animation-variants.spec.tsx
└── Verify: bun run ci:local

Day 3-4: Migrate Animation Patterns
├── Update product-features.tsx
├── Update product-benefits.tsx
├── Update product-pas.tsx
├── Update product-faq.tsx
├── Visual regression testing on /products/* pages
└── Verify: bun run ci:local
```

### Phase 2: Section Headers (Week 1)

```
Day 5: Create SectionHeader Component
├── Create section-header.tsx + tests
├── Run tests: bun test src/components/ui/section-header.spec.tsx
└── Verify: bun run ci:local

Day 6-7: Migrate Section Headers
├── Update 4 product detail components
├── Visual regression testing
└── Verify: bun run ci:local
```

### Phase 3: Button Library (Week 2)

```
Day 1-2: Create Button Components
├── Create button.tsx + tests
├── Create cta-button.tsx + tests
├── Create icon-button.tsx + tests
├── Run tests: bun test src/components/ui/buttons/
└── Verify: bun run ci:local

Day 3-5: Migrate Buttons (GRADUAL)
├── Migrate product-cta.tsx
├── Migrate product-hero.tsx
├── Migrate sticky-buy-button.tsx
├── Visual regression testing after each file
├── Migrate remaining files (1-2 per day)
└── Verify: bun run ci:local after each migration
```

### Phase 4: Collection Cards (Week 3)

```
Day 1-2: Create CollectionCard Component
├── Create collection-card.tsx + tests
├── Run tests: bun test src/components/ui/collection-card.spec.tsx
└── Verify: bun run ci:local

Day 3: Create Wrapper Components
├── Update category-card.tsx (wrapper)
├── Update tag-card.tsx (wrapper)
├── Run tests: bun test src/components/categories/
├── Run tests: bun test src/components/tags/
└── Verify: bun run ci:local

Day 4-5: Visual Regression Testing
├── Test home page
├── Test categories page
├── Test tags page
├── Test detail pages
└── Final verification: bun run ci:local
```

---

## Testing Strategy

### Unit Tests (Required Coverage)

**Animation Utilities:**

- `animation-variants.spec.ts`: 100% coverage
    - Test all variants return correct structure
    - Test factory functions with different parameters
    - Test immutability

**Hooks:**

- `use-animation-variants.spec.tsx`: 90% coverage
    - Test default variants
    - Test custom variants
    - Test memoization

**Components:**

- `section-header.spec.tsx`: 85% coverage
    - Test all prop combinations
    - Test responsive classes
    - Test animation on/off
    - Test accessibility (ARIA labels)

- `button.spec.tsx`: 85% coverage
    - Test all variants
    - Test all sizes
    - Test disabled states
    - Test loading states
    - Test icon positioning
    - Test accessibility (focus, keyboard navigation)

- `collection-card.spec.tsx`: 85% coverage
    - Test simple vs detailed variants
    - Test with/without icons, colors, counts
    - Test featured badges
    - Test link generation
    - Test accessibility

### Visual Regression Testing

**Critical Paths:**

1. Home page
    - Featured categories (simple cards)
    - Featured tags (simple cards)
2. Categories page (detailed cards)
3. Tags page (detailed cards)
4. Product detail page
    - All sections with SectionHeader
    - All CTA buttons
    - Sticky buy button
5. Product card grid (all button states)

**Tools:**

- Manual testing at all breakpoints (320px, 768px, 1024px, 1920px, 2440px)
- Screenshot comparison before/after
- Browser testing (Chrome, Firefox, Safari)

### Accessibility Testing

**Checklist:**

- Keyboard navigation works on all new components
- Focus states visible
- ARIA labels present
- Screen reader compatible
- Color contrast ratios meet WCAG AA
- Touch targets >= 44×44px on mobile

---

## Edge Cases & Risk Mitigation

### Edge Case 1: Animation Performance

**Issue:** Many animated components on same page could cause jank

**Mitigation:**

- Use `viewport={{ once: true }}` to animate only once
- Implement `useReducedMotion` hook for accessibility
- Test on low-end devices

### Edge Case 2: Button State Combinations

**Issue:** Loading + disabled + icon combinations

**Mitigation:**

- Comprehensive test matrix for all combinations
- Visual testing for each state
- Document invalid combinations

### Edge Case 3: Collection Card Without Icon

**Issue:** Layout shift when icon missing

**Mitigation:**

- Test cards without icons
- Ensure gap-4 handles missing icon gracefully
- Add conditional rendering tests

### Edge Case 4: Very Long Names/Descriptions

**Issue:** Text overflow in cards

**Mitigation:**

- Use `line-clamp-*` utilities
- Test with long strings
- Ensure truncation works at all breakpoints

### Edge Case 5: Color Accessibility

**Issue:** Custom colors may not meet contrast ratios

**Mitigation:**

- Document minimum contrast requirements
- Add validation in CLI tools
- Test with various color combinations

---

## Rollback Strategy

### Quick Rollback (Per Phase)

**Phase 1 (Animation Variants):**

```bash
# Revert hook usage, restore local variants
git revert <commit-hash>
```

**Phase 2 (Section Headers):**

```bash
# Revert SectionHeader usage
git revert <commit-hash>
```

**Phase 3 (Buttons):**

```bash
# High risk - gradual migration allows partial rollback
# Can rollback individual files
git checkout HEAD~1 -- src/components/products/product-cta.tsx
```

**Phase 4 (Collection Cards):**

```bash
# Wrapper pattern allows easy rollback
git checkout HEAD~1 -- src/components/categories/category-card.tsx
git checkout HEAD~1 -- src/components/tags/tag-card.tsx
```

---

## Success Metrics

### Quantitative Metrics

- [ ] ~620 lines of duplicate code eliminated
- [ ] 8 new reusable components/utilities created
- [ ] 90%+ test coverage for utilities
- [ ] 80%+ test coverage for components
- [ ] 0 regressions in visual tests
- [ ] Build time unchanged or improved
- [ ] Bundle size unchanged or smaller

### Qualitative Metrics

- [ ] Code review approval
- [ ] All CI checks passing
- [ ] No accessibility regressions
- [ ] Documentation updated
- [ ] Examples added for new components

---

## Critical Files Reference

**Phase 1 (Animation Variants):**

- `/src/lib/animation-variants.ts` - Core animation utilities
- `/src/hooks/use-animation-variants.ts` - React hook wrapper
- `/src/components/products/product-features.tsx` - First migration target

**Phase 2 (Section Headers):**

- `/src/components/ui/section-header.tsx` - Generic section header
- `/src/components/products/product-faq.tsx` - Migration pattern reference

**Phase 3 (Buttons):**

- `/src/components/ui/buttons/button.tsx` - Base button component
- `/src/components/ui/buttons/cta-button.tsx` - Specialized CTA button
- `/src/components/products/product-cta.tsx` - High-impact migration target

**Phase 4 (Collection Cards):**

- `/src/components/ui/collection-card.tsx` - Generic card component
- `/src/components/categories/category-card.tsx` - Wrapper implementation
- `/src/components/tags/tag-card.tsx` - Second wrapper example

---

## Notes & Best Practices

### TypeScript Best Practices

- Use `React.ComponentPropsWithoutRef<'element'>` for native element props
- Use `React.ReactNode` for children
- Use `React.FC<Props>` with explicit interface
- NO `any` types - use `unknown` if type truly unknown

### Backwards Compatibility

- Use wrapper pattern for high-risk components (CategoryCard, TagCard)
- Keep old implementations for 2 releases before deletion
- Document migration path in CHANGELOG
- Add deprecation warnings to old patterns

### Performance Considerations

- Memoize animation variants (useAnimationVariants hook)
- Use `React.forwardRef` for button components (ref forwarding)
- Test bundle size before/after refactoring
- Ensure no unnecessary re-renders

### Documentation Requirements

- Update AGENTS.md with new component locations
- Add Storybook stories for new components (if applicable)
- Document props in JSDoc format
- Add usage examples in component files

---

This plan provides a complete, low-risk path to eliminate ~620 lines of duplication while maintaining 100% backwards compatibility and comprehensive test coverage. The phased approach allows for validation at each step and easy rollback if issues arise.
