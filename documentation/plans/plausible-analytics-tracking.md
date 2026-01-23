# Plausible Analytics Event Tracking Implementation Plan

## Overview

Add comprehensive custom event tracking throughout the store website using Plausible Analytics. The goal is to understand user behavior, conversion funnels, feature engagement, and identify what makes users leave or stay.

**Current State**: Plausible script is already loaded (via Cloudflare Workers proxy at `blue-bar-dsebastien-19fd.developassion.workers.dev`) with automatic pageview tracking. No custom event tracking exists.

**Target State**: Full event tracking across all meaningful user interactions (~40 event types).

---

## Part 1: Core Analytics Module

### File: `src/lib/analytics.ts`

Create the core analytics utility with TypeScript types and tracking functions.

```typescript
/**
 * Plausible Analytics Event Tracking
 * Type-safe wrapper for custom events
 */

declare global {
    interface Window {
        plausible?: (
            eventName: string,
            options?: {
                props?: Record<string, string | number | boolean>
                revenue?: { currency: string; amount: number }
            }
        ) => void
    }
}

// =============================================================================
// Event Name Constants
// =============================================================================

export const EVENTS = {
    // Product Events
    PRODUCT_VIEWED: 'product_viewed',
    PRODUCT_CARD_CLICKED: 'product_card_clicked',
    VARIANT_SELECTED: 'variant_selected',
    FREQUENCY_SELECTED: 'frequency_selected',
    BUY_CLICKED: 'buy_clicked',

    // Quiz Events
    QUIZ_STARTED: 'quiz_started',
    QUIZ_QUESTION_ANSWERED: 'quiz_question_answered',
    QUIZ_COMPLETED: 'quiz_completed',
    QUIZ_RECOMMENDATION_CLICKED: 'quiz_recommendation_clicked',
    QUIZ_RESULTS_SHARED: 'quiz_results_shared',

    // Compare Events
    COMPARE_OPENED: 'compare_opened',
    COMPARE_PRODUCT_ADDED: 'compare_product_added',
    COMPARE_PRODUCT_REMOVED: 'compare_product_removed',
    COMPARE_SHARED: 'compare_shared',

    // Wishlist Events
    WISHLIST_TOGGLED: 'wishlist_toggled',
    WISHLIST_VIEWED: 'wishlist_viewed',
    WISHLIST_SHARED: 'wishlist_shared',
    SHARED_WISHLIST_VIEWED: 'shared_wishlist_viewed',

    // Engagement Events
    SCROLL_DEPTH: 'scroll_depth',
    TIME_ON_PAGE: 'time_on_page',
    FAQ_EXPANDED: 'faq_expanded',
    MEDIA_VIEWED: 'media_viewed',
    LIGHTBOX_OPENED: 'lightbox_opened',

    // Search & Discovery
    COMMAND_PALETTE_OPENED: 'command_palette_opened',
    COMMAND_PALETTE_SEARCH: 'command_palette_search',
    COMMAND_PALETTE_SELECTED: 'command_palette_selected',
    SEARCH_PERFORMED: 'search_performed',
    FILTER_APPLIED: 'filter_applied',
    FILTER_REMOVED: 'filter_removed',
    SORT_CHANGED: 'sort_changed',

    // Navigation
    NAVIGATION_CLICKED: 'navigation_clicked',
    EXTERNAL_LINK_CLICKED: 'external_link_clicked',
    MOBILE_MENU_TOGGLED: 'mobile_menu_toggled',
    CATEGORY_BROWSED: 'category_browsed',
    TAG_BROWSED: 'tag_browsed',

    // Newsletter
    NEWSLETTER_SUBSCRIBED: 'newsletter_subscribed',
    NEWSLETTER_DISMISSED: 'newsletter_dismissed',

    // Share
    SHARE_CLICKED: 'share_clicked'
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

// =============================================================================
// Traffic Source Types
// =============================================================================

export type TrafficSource =
    | 'home'
    | 'products'
    | 'category'
    | 'tag'
    | 'search'
    | 'compare'
    | 'wishlist'
    | 'shared_wishlist'
    | 'quiz'
    | 'featured'
    | 'best_sellers'
    | 'best_value'
    | 'command_palette'
    | 'related'
    | 'direct'

// =============================================================================
// Core Tracking Function
// =============================================================================

/**
 * Track a custom event with Plausible
 * @param eventName - Event name from EVENTS constant
 * @param props - Optional event properties (max 30, keep values short)
 * @param revenue - Optional revenue data for conversion tracking
 */
export function trackEvent(
    eventName: EventName,
    props?: Record<string, string | number | boolean>,
    revenue?: { currency: string; amount: number }
): void {
    // Debug logging in development
    if (import.meta.env.DEV) {
        console.log('[Analytics]', eventName, props, revenue)
    }

    if (typeof window !== 'undefined' && window.plausible) {
        window.plausible(eventName, { props, revenue })
    }
}

// =============================================================================
// Source Attribution
// =============================================================================

/**
 * Determine traffic source from referrer URL
 */
export function getSource(): TrafficSource {
    if (typeof window === 'undefined') return 'direct'

    const referrer = document.referrer
    if (!referrer || !referrer.includes(window.location.origin)) return 'direct'

    if (referrer.includes('/quiz')) return 'quiz'
    if (referrer.includes('/compare')) return 'compare'
    if (referrer.includes('/shared-wishlist')) return 'shared_wishlist'
    if (referrer.includes('/wishlist')) return 'wishlist'
    if (referrer.includes('/categories/')) return 'category'
    if (referrer.includes('/tags/')) return 'tag'
    if (referrer.includes('/products')) return 'products'
    if (referrer.includes('/featured')) return 'featured'
    if (referrer.includes('/best-sellers')) return 'best_sellers'
    if (referrer.includes('/best-value')) return 'best_value'
    if (referrer.includes('/product/')) return 'related'
    if (referrer.endsWith('/') || referrer === window.location.origin) return 'home'

    return 'direct'
}

// =============================================================================
// Convenience Functions - Product Events
// =============================================================================

export function trackProductViewed(params: {
    productId: string
    productName: string
    category: string
    price: number
    priceTier: string
    isFeatured: boolean
    isBestseller: boolean
    isBestValue: boolean
}): void {
    trackEvent(EVENTS.PRODUCT_VIEWED, {
        product_id: params.productId,
        product_name: params.productName,
        category: params.category,
        price: params.price,
        price_tier: params.priceTier,
        is_featured: params.isFeatured,
        is_bestseller: params.isBestseller,
        is_best_value: params.isBestValue,
        source: getSource()
    })
}

export function trackProductCardClicked(params: {
    productId: string
    productName: string
    price: number
    source: TrafficSource
}): void {
    trackEvent(EVENTS.PRODUCT_CARD_CLICKED, {
        product_id: params.productId,
        product_name: params.productName,
        price: params.price,
        source: params.source
    })
}

export function trackVariantSelected(params: {
    productId: string
    variantId: string
    variantName: string
    price: number
}): void {
    trackEvent(EVENTS.VARIANT_SELECTED, {
        product_id: params.productId,
        variant_id: params.variantId,
        variant_name: params.variantName,
        price: params.price
    })
}

export function trackFrequencySelected(params: {
    productId: string
    variantId: string | null
    frequency: string
    price: number
}): void {
    trackEvent(EVENTS.FREQUENCY_SELECTED, {
        product_id: params.productId,
        variant_id: params.variantId || 'default',
        frequency: params.frequency,
        price: params.price
    })
}

export function trackBuyClicked(params: {
    productId: string
    productName: string
    variantName: string | null
    price: number
    isSubscription: boolean
    frequency: string | null
    source: 'hero' | 'sticky' | 'card' | 'cta'
}): void {
    trackEvent(
        EVENTS.BUY_CLICKED,
        {
            product_id: params.productId,
            product_name: params.productName,
            variant_name: params.variantName || 'default',
            is_subscription: params.isSubscription,
            frequency: params.frequency || 'one_time',
            source: params.source
        },
        { currency: 'EUR', amount: params.price }
    )
}

// =============================================================================
// Convenience Functions - Quiz Events
// =============================================================================

export function trackQuizStarted(): void {
    trackEvent(EVENTS.QUIZ_STARTED)
}

export function trackQuizQuestionAnswered(params: {
    questionId: string
    questionNumber: number
    answerIndex: number
    answerLabel: string
}): void {
    trackEvent(EVENTS.QUIZ_QUESTION_ANSWERED, {
        question_id: params.questionId,
        question_number: params.questionNumber,
        answer_index: params.answerIndex,
        answer_label: params.answerLabel
    })
}

export function trackQuizCompleted(params: {
    totalQuestions: number
    productsRecommended: number
    topProductId: string
    topProductName: string
}): void {
    trackEvent(EVENTS.QUIZ_COMPLETED, {
        total_questions: params.totalQuestions,
        products_recommended: params.productsRecommended,
        top_product_id: params.topProductId,
        top_product_name: params.topProductName
    })
}

export function trackQuizRecommendationClicked(params: {
    productId: string
    productName: string
    rank: number
    isTopRecommendation: boolean
}): void {
    trackEvent(EVENTS.QUIZ_RECOMMENDATION_CLICKED, {
        product_id: params.productId,
        product_name: params.productName,
        rank: params.rank,
        is_top: params.isTopRecommendation
    })
}

export function trackQuizResultsShared(): void {
    trackEvent(EVENTS.QUIZ_RESULTS_SHARED)
}

// =============================================================================
// Convenience Functions - Compare Events
// =============================================================================

export function trackCompareOpened(params: { productCount: number; productIds: string[] }): void {
    trackEvent(EVENTS.COMPARE_OPENED, {
        product_count: params.productCount,
        product_ids: params.productIds.join(','),
        source: getSource()
    })
}

export function trackCompareProductAdded(params: {
    productId: string
    productName: string
    totalCount: number
}): void {
    trackEvent(EVENTS.COMPARE_PRODUCT_ADDED, {
        product_id: params.productId,
        product_name: params.productName,
        total_count: params.totalCount
    })
}

export function trackCompareProductRemoved(params: {
    productId: string
    remainingCount: number
}): void {
    trackEvent(EVENTS.COMPARE_PRODUCT_REMOVED, {
        product_id: params.productId,
        remaining_count: params.remainingCount
    })
}

export function trackCompareShared(params: { productCount: number; productIds: string[] }): void {
    trackEvent(EVENTS.COMPARE_SHARED, {
        product_count: params.productCount,
        product_ids: params.productIds.join(',')
    })
}

// =============================================================================
// Convenience Functions - Wishlist Events
// =============================================================================

export function trackWishlistToggled(params: {
    action: 'add' | 'remove'
    productId: string
    productName: string
    source: TrafficSource
    wishlistSize: number
}): void {
    trackEvent(EVENTS.WISHLIST_TOGGLED, {
        action: params.action,
        product_id: params.productId,
        product_name: params.productName,
        source: params.source,
        wishlist_size: params.wishlistSize
    })
}

export function trackWishlistViewed(wishlistSize: number): void {
    trackEvent(EVENTS.WISHLIST_VIEWED, { wishlist_size: wishlistSize })
}

export function trackWishlistShared(params: { wishlistSize: number; productIds: string[] }): void {
    trackEvent(EVENTS.WISHLIST_SHARED, {
        wishlist_size: params.wishlistSize,
        product_ids: params.productIds.join(',')
    })
}

export function trackSharedWishlistViewed(params: {
    productCount: number
    productIds: string[]
}): void {
    trackEvent(EVENTS.SHARED_WISHLIST_VIEWED, {
        product_count: params.productCount,
        product_ids: params.productIds.join(',')
    })
}

// =============================================================================
// Convenience Functions - Engagement Events
// =============================================================================

export function trackScrollDepth(depth: 25 | 50 | 75 | 100, pageType: string): void {
    trackEvent(EVENTS.SCROLL_DEPTH, { depth, page_type: pageType })
}

export function trackTimeOnPage(bracket: '30s' | '1min' | '2min' | '5min', pageType: string): void {
    trackEvent(EVENTS.TIME_ON_PAGE, { bracket, page_type: pageType })
}

export function trackFaqExpanded(params: {
    faqId: string
    questionText: string
    pageType: 'product' | 'global'
    productId?: string
}): void {
    trackEvent(EVENTS.FAQ_EXPANDED, {
        faq_id: params.faqId,
        question: params.questionText.slice(0, 100),
        page_type: params.pageType,
        product_id: params.productId || 'global'
    })
}

export function trackMediaViewed(params: {
    mediaType: 'image' | 'video'
    mediaIndex: number
    mediaGroup: 'cover' | 'main' | 'secondary' | 'bonus'
    productId: string
}): void {
    trackEvent(EVENTS.MEDIA_VIEWED, {
        media_type: params.mediaType,
        media_index: params.mediaIndex,
        media_group: params.mediaGroup,
        product_id: params.productId
    })
}

export function trackLightboxOpened(params: {
    mediaType: 'image' | 'video'
    productId: string
}): void {
    trackEvent(EVENTS.LIGHTBOX_OPENED, {
        media_type: params.mediaType,
        product_id: params.productId
    })
}

// =============================================================================
// Convenience Functions - Search & Discovery Events
// =============================================================================

export function trackCommandPaletteOpened(trigger: 'keyboard' | 'click'): void {
    trackEvent(EVENTS.COMMAND_PALETTE_OPENED, { trigger })
}

export function trackCommandPaletteSearch(queryLength: number, resultCount: number): void {
    trackEvent(EVENTS.COMMAND_PALETTE_SEARCH, {
        query_length: queryLength,
        result_count: resultCount
    })
}

export function trackCommandPaletteSelected(params: {
    type: 'product' | 'action' | 'category' | 'tag'
    itemId: string
    itemName: string
}): void {
    trackEvent(EVENTS.COMMAND_PALETTE_SELECTED, {
        type: params.type,
        item_id: params.itemId,
        item_name: params.itemName
    })
}

export function trackSearchPerformed(params: {
    queryLength: number
    resultCount: number
    pageType: string
}): void {
    trackEvent(EVENTS.SEARCH_PERFORMED, {
        query_length: params.queryLength,
        result_count: params.resultCount,
        page_type: params.pageType
    })
}

export function trackFilterApplied(filterType: string, filterValue: string): void {
    trackEvent(EVENTS.FILTER_APPLIED, {
        filter_type: filterType,
        filter_value: filterValue
    })
}

export function trackFilterRemoved(filterType: string, filterValue: string): void {
    trackEvent(EVENTS.FILTER_REMOVED, {
        filter_type: filterType,
        filter_value: filterValue
    })
}

export function trackSortChanged(sortOption: string): void {
    trackEvent(EVENTS.SORT_CHANGED, { sort_option: sortOption })
}

// =============================================================================
// Convenience Functions - Navigation Events
// =============================================================================

export function trackNavigationClicked(params: {
    navType: 'header' | 'footer' | 'breadcrumb' | 'mobile_menu' | 'quick_nav'
    destination: string
}): void {
    trackEvent(EVENTS.NAVIGATION_CLICKED, {
        nav_type: params.navType,
        destination: params.destination
    })
}

export function trackExternalLinkClicked(params: {
    url: string
    linkType: 'gumroad' | 'social' | 'github' | 'website' | 'affiliate' | 'other'
}): void {
    const domain = new URL(params.url).hostname
    trackEvent(EVENTS.EXTERNAL_LINK_CLICKED, {
        domain,
        link_type: params.linkType,
        url: params.url.slice(0, 200)
    })
}

export function trackMobileMenuToggled(action: 'open' | 'close'): void {
    trackEvent(EVENTS.MOBILE_MENU_TOGGLED, { action })
}

export function trackCategoryBrowsed(categoryId: string, categoryName: string): void {
    trackEvent(EVENTS.CATEGORY_BROWSED, {
        category_id: categoryId,
        category_name: categoryName
    })
}

export function trackTagBrowsed(tagId: string, tagName: string): void {
    trackEvent(EVENTS.TAG_BROWSED, {
        tag_id: tagId,
        tag_name: tagName
    })
}

// =============================================================================
// Convenience Functions - Newsletter Events
// =============================================================================

export function trackNewsletterSubscribed(location: 'footer' | 'compact'): void {
    trackEvent(EVENTS.NEWSLETTER_SUBSCRIBED, { location })
}

export function trackNewsletterDismissed(location: 'footer' | 'compact'): void {
    trackEvent(EVENTS.NEWSLETTER_DISMISSED, { location })
}

// =============================================================================
// Convenience Functions - Share Events
// =============================================================================

export function trackShareClicked(params: {
    shareType: 'product' | 'wishlist' | 'compare' | 'quiz_results'
    platform: 'copy' | 'twitter' | 'linkedin' | 'email' | 'facebook'
    itemId?: string
}): void {
    trackEvent(EVENTS.SHARE_CLICKED, {
        share_type: params.shareType,
        platform: params.platform,
        item_id: params.itemId || 'none'
    })
}
```

---

## Part 2: React Hooks

### File: `src/hooks/use-scroll-tracking.ts`

```typescript
import { useEffect, useRef } from 'react'
import { trackScrollDepth } from '@/lib/analytics'

interface UseScrollTrackingOptions {
    pageType: string
    thresholds?: (25 | 50 | 75 | 100)[]
    skip?: boolean
}

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%)
 * Fires once per milestone per page load
 */
export function useScrollTracking({
    pageType,
    thresholds = [25, 50, 75, 100],
    skip = false
}: UseScrollTrackingOptions): void {
    const trackedRef = useRef<Set<number>>(new Set())

    useEffect(() => {
        if (skip) return

        // Reset tracked milestones on mount (new page)
        trackedRef.current = new Set()

        let ticking = false

        const handleScroll = () => {
            if (ticking) return
            ticking = true

            requestAnimationFrame(() => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
                if (scrollHeight <= 0) {
                    ticking = false
                    return
                }

                const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100)

                thresholds.forEach((threshold) => {
                    if (scrollPercent >= threshold && !trackedRef.current.has(threshold)) {
                        trackedRef.current.add(threshold)
                        trackScrollDepth(threshold, pageType)
                    }
                })

                ticking = false
            })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })

        // Initial check in case page is already scrolled
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [pageType, thresholds, skip])
}
```

### File: `src/hooks/use-time-on-page.ts`

```typescript
import { useEffect, useRef } from 'react'
import { trackTimeOnPage } from '@/lib/analytics'

type TimeBracket = '30s' | '1min' | '2min' | '5min'

interface UseTimeOnPageOptions {
    pageType: string
    brackets?: TimeBracket[]
    skip?: boolean
}

const BRACKET_MS: Record<TimeBracket, number> = {
    '30s': 30_000,
    '1min': 60_000,
    '2min': 120_000,
    '5min': 300_000
}

/**
 * Track time on page at specific brackets
 * Fires once per bracket per page load
 */
export function useTimeOnPage({
    pageType,
    brackets = ['30s', '1min', '2min', '5min'],
    skip = false
}: UseTimeOnPageOptions): void {
    const trackedRef = useRef<Set<TimeBracket>>(new Set())
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

    useEffect(() => {
        if (skip) return

        // Reset on mount
        trackedRef.current = new Set()
        timersRef.current = []

        // Set up timers for each bracket
        brackets.forEach((bracket) => {
            const timer = setTimeout(() => {
                if (!trackedRef.current.has(bracket)) {
                    trackedRef.current.add(bracket)
                    trackTimeOnPage(bracket, pageType)
                }
            }, BRACKET_MS[bracket])

            timersRef.current.push(timer)
        })

        // Cleanup on unmount
        return () => {
            timersRef.current.forEach((timer) => clearTimeout(timer))
        }
    }, [pageType, brackets, skip])
}
```

---

## Part 3: Component Modifications

### 3.1 Product Page (`src/pages/product.tsx`)

Add at the top:

```typescript
import { trackProductViewed, getSource } from '@/lib/analytics'
import { useScrollTracking } from '@/hooks/use-scroll-tracking'
import { useTimeOnPage } from '@/hooks/use-time-on-page'
```

Inside the component, after product data is loaded:

```typescript
// Track page view
useEffect(() => {
    if (product) {
        trackProductViewed({
            productId: product.id,
            productName: product.name,
            category: product.mainCategory,
            price: product.price,
            priceTier: product.priceTier,
            isFeatured: product.featured,
            isBestseller: product.bestseller,
            isBestValue: product.bestValue
        })
    }
}, [product?.id]) // Only track once per product

// Track scroll depth
useScrollTracking({ pageType: 'product', skip: !product })

// Track time on page
useTimeOnPage({ pageType: 'product', skip: !product })
```

### 3.2 Product Card (`src/components/products/product-card-ecommerce.tsx`)

Add props for source tracking:

```typescript
interface ProductCardEcommerceProps {
    product: Product
    source?: TrafficSource // Add this
    // ... existing props
}
```

Add imports and tracking:

```typescript
import {
    trackProductCardClicked,
    trackBuyClicked,
    trackWishlistToggled,
    type TrafficSource
} from '@/lib/analytics'
import { getWishlist } from '@/lib/wishlist'
```

On card click (wrap the Link):

```typescript
<Link
  to={`/product/${product.id}`}
  onClick={() =>
    trackProductCardClicked({
      productId: product.id,
      productName: product.name,
      price: product.price,
      source: source || 'direct',
    })
  }
>
```

On wishlist toggle:

```typescript
const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newState = toggleWishlist(product.id)
    setIsWishlisted(newState)
    trackWishlistToggled({
        action: newState ? 'add' : 'remove',
        productId: product.id,
        productName: product.name,
        source: source || 'direct',
        wishlistSize: getWishlist().length
    })
}
```

On buy button click:

```typescript
const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    trackBuyClicked({
        productId: product.id,
        productName: product.name,
        variantName: null,
        price: product.price,
        isSubscription: product.isSubscription,
        frequency: null,
        source: 'card'
    })
}
```

### 3.3 Product Hero (`src/components/products/product-hero.tsx`)

Add imports:

```typescript
import {
    trackVariantSelected,
    trackFrequencySelected,
    trackBuyClicked,
    trackWishlistToggled,
    getSource
} from '@/lib/analytics'
import { getWishlist } from '@/lib/wishlist'
```

On variant selection:

```typescript
const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    trackVariantSelected({
        productId: product.id,
        variantId: variant.gumroadVariantId || variant.name,
        variantName: variant.name,
        price: getVariantPrice(variant)
    })
}
```

On frequency selection:

```typescript
const handleFrequencyChange = (frequency: PaymentFrequency) => {
    setSelectedFrequency(frequency)
    trackFrequencySelected({
        productId: product.id,
        variantId: selectedVariant?.gumroadVariantId || null,
        frequency,
        price: getCurrentPrice()
    })
}
```

On buy button click:

```typescript
const handleBuyClick = () => {
    trackBuyClicked({
        productId: product.id,
        productName: product.name,
        variantName: selectedVariant?.name || null,
        price: getCurrentPrice(),
        isSubscription: product.isSubscription,
        frequency: selectedFrequency,
        source: 'hero'
    })
    // ... existing Gumroad redirect logic
}
```

On wishlist toggle:

```typescript
const handleWishlistClick = () => {
    const newState = toggleWishlist(product.id)
    setIsWishlisted(newState)
    trackWishlistToggled({
        action: newState ? 'add' : 'remove',
        productId: product.id,
        productName: product.name,
        source: getSource(),
        wishlistSize: getWishlist().length
    })
}
```

### 3.4 Sticky Buy Button (`src/components/products/sticky-buy-button.tsx`)

Add tracking on click:

```typescript
import { trackBuyClicked } from '@/lib/analytics'

const handleBuyClick = () => {
    trackBuyClicked({
        productId: product.id,
        productName: product.name,
        variantName: selectedVariant?.name || null,
        price: getCurrentPrice(),
        isSubscription: product.isSubscription,
        frequency: selectedFrequency,
        source: 'sticky'
    })
    // ... existing logic
}
```

### 3.5 Payment Frequency Selector (`src/components/products/payment-frequency-selector.tsx`)

Add tracking when frequency changes:

```typescript
import { trackFrequencySelected } from '@/lib/analytics'

// Pass productId and variantId as props, then track:
const handleFrequencyChange = (frequency: PaymentFrequency) => {
    trackFrequencySelected({
        productId,
        variantId,
        frequency,
        price: prices[frequency]
    })
    onChange(frequency)
}
```

### 3.6 Quiz Page (`src/pages/quiz.tsx`)

Add imports:

```typescript
import {
    trackQuizStarted,
    trackQuizQuestionAnswered,
    trackQuizCompleted,
    trackQuizRecommendationClicked,
    trackQuizResultsShared
} from '@/lib/analytics'
```

Track quiz start (on first answer, not from URL restore):

```typescript
const handleAnswer = (optionIndex: number) => {
    // Track start only on first answer and if not restored from URL
    if (Object.keys(answers).length === 0 && !initializedFromUrl) {
        trackQuizStarted()
    }

    // Track the answer
    trackQuizQuestionAnswered({
        questionId: currentQuestion.id,
        questionNumber: currentStep + 1,
        answerIndex: optionIndex,
        answerLabel: currentQuestion.options[optionIndex].label
    })

    // ... existing answer handling logic
}
```

Track quiz completion:

```typescript
useEffect(() => {
    if (showResults && recommendations.length > 0) {
        trackQuizCompleted({
            totalQuestions: quizQuestions.length,
            productsRecommended: recommendations.length,
            topProductId: recommendations[0].product.id,
            topProductName: recommendations[0].product.name
        })
    }
}, [showResults, recommendations])
```

Track recommendation clicks:

```typescript
<Link
  to={`/product/${recommendation.product.id}`}
  onClick={() =>
    trackQuizRecommendationClicked({
      productId: recommendation.product.id,
      productName: recommendation.product.name,
      rank: index + 1,
      isTopRecommendation: index === 0,
    })
  }
>
```

Track share results:

```typescript
const handleShareResults = async () => {
    trackQuizResultsShared()
    // ... existing share logic
}
```

### 3.7 Compare Page (`src/pages/compare.tsx`)

Add imports:

```typescript
import {
    trackCompareOpened,
    trackCompareProductAdded,
    trackCompareProductRemoved,
    trackCompareShared
} from '@/lib/analytics'
```

Track page open:

```typescript
useEffect(() => {
    if (selectedProducts.length > 0) {
        trackCompareOpened({
            productCount: selectedProducts.length,
            productIds: selectedProducts.map((p) => p.id)
        })
    }
}, []) // Only on mount
```

Track product add:

```typescript
const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product || selectedIds.length >= MAX_COMPARE) return

    const newIds = [...selectedIds, productId]
    updateSelectedIds(newIds)

    trackCompareProductAdded({
        productId,
        productName: product.name,
        totalCount: newIds.length
    })
}
```

Track product remove:

```typescript
const removeProduct = (productId: string) => {
    const newIds = selectedIds.filter((id) => id !== productId)
    updateSelectedIds(newIds)

    trackCompareProductRemoved({
        productId,
        remainingCount: newIds.length
    })
}
```

Track share:

```typescript
const handleShareComparison = async () => {
    trackCompareShared({
        productCount: selectedIds.length,
        productIds: selectedIds
    })
    // ... existing share logic
}
```

### 3.8 Wishlist Page (`src/pages/wishlist.tsx`)

Add imports:

```typescript
import { trackWishlistViewed, trackWishlistShared } from '@/lib/analytics'
```

Track page view:

```typescript
useEffect(() => {
    trackWishlistViewed(wishlistProducts.length)
}, []) // Only on mount
```

Track share:

```typescript
const handleShareWishlist = async () => {
    trackWishlistShared({
        wishlistSize: wishlistProducts.length,
        productIds: wishlistProducts.map((p) => p.id)
    })
    // ... existing share logic
}
```

### 3.9 Shared Wishlist Page (`src/pages/shared-wishlist.tsx`)

Add tracking:

```typescript
import { trackSharedWishlistViewed } from '@/lib/analytics'

useEffect(() => {
    if (sharedProducts.length > 0) {
        trackSharedWishlistViewed({
            productCount: sharedProducts.length,
            productIds: sharedProducts.map((p) => p.id)
        })
    }
}, [sharedProducts])
```

### 3.10 Command Palette (`src/components/products/command-palette.tsx`)

Add imports:

```typescript
import {
    trackCommandPaletteOpened,
    trackCommandPaletteSearch,
    trackCommandPaletteSelected
} from '@/lib/analytics'
```

Track open:

```typescript
// Add a ref to track how it was opened
const openTriggerRef = useRef<'keyboard' | 'click'>('keyboard')

// In keyboard handler (useEffect listening for / or Ctrl+K):
openTriggerRef.current = 'keyboard'
setIsOpen(true)

// In click handler (search icon button):
openTriggerRef.current = 'click'
setIsOpen(true)

// Track when opened:
useEffect(() => {
    if (isOpen) {
        trackCommandPaletteOpened(openTriggerRef.current)
    }
}, [isOpen])
```

Track search (debounced):

```typescript
useEffect(() => {
    if (!query.trim()) return

    const timer = setTimeout(() => {
        trackCommandPaletteSearch(query.length, filteredCommands.length)
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
}, [query, filteredCommands.length])
```

Track selection:

```typescript
// Modify the action handlers for each command type:

// For products:
action: () => {
    trackCommandPaletteSelected({
        type: 'product',
        itemId: product.id,
        itemName: product.name
    })
    navigate(`/product/${product.id}`)
    onClose()
}

// For categories:
action: () => {
    trackCommandPaletteSelected({
        type: 'category',
        itemId: category.id,
        itemName: category.name
    })
    navigate(`/categories/${category.id}`)
    onClose()
}

// For tags:
action: () => {
    trackCommandPaletteSelected({
        type: 'tag',
        itemId: tag.id,
        itemName: tag.name
    })
    navigate(`/tags/${tag.id}`)
    onClose()
}

// For navigation actions:
action: () => {
    trackCommandPaletteSelected({
        type: 'action',
        itemId: action.id,
        itemName: action.name
    })
    // ... existing action logic
}
```

### 3.11 Products Page (`src/pages/products.tsx`)

Add imports:

```typescript
import {
    trackSearchPerformed,
    trackFilterApplied,
    trackFilterRemoved,
    trackSortChanged
} from '@/lib/analytics'
import { useScrollTracking } from '@/hooks/use-scroll-tracking'
import { useTimeOnPage } from '@/hooks/use-time-on-page'
```

Add hooks:

```typescript
useScrollTracking({ pageType: 'products' })
useTimeOnPage({ pageType: 'products' })
```

Track search (debounced):

```typescript
useEffect(() => {
    if (!searchQuery.trim()) return

    const timer = setTimeout(() => {
        trackSearchPerformed({
            queryLength: searchQuery.length,
            resultCount: filteredProducts.length,
            pageType: 'products'
        })
    }, 1000) // Debounce 1s

    return () => clearTimeout(timer)
}, [searchQuery, filteredProducts.length])
```

Track filter changes:

```typescript
const handleCategoriesChange = (newCategories: CategoryId[]) => {
    // Find added categories
    const added = newCategories.filter((c) => !selectedCategories.includes(c))
    added.forEach((c) => trackFilterApplied('category', c))

    // Find removed categories
    const removed = selectedCategories.filter((c) => !newCategories.includes(c))
    removed.forEach((c) => trackFilterRemoved('category', c))

    setSelectedCategories(newCategories)
}

// Similar for tags, price range, checkboxes
```

Track sort changes:

```typescript
const handleSortChange = (newSort: SortOption) => {
    trackSortChanged(newSort)
    setSortOption(newSort)
}
```

### 3.12 Filter Sidebar (`src/components/products/filters/filter-sidebar.tsx`)

If filter changes are handled here instead of products.tsx, add tracking:

```typescript
import { trackFilterApplied, trackFilterRemoved } from '@/lib/analytics'

// In each filter onChange handler, compare old vs new values and track
```

### 3.13 Sort Dropdown (`src/components/products/filters/sort-dropdown.tsx`)

```typescript
import { trackSortChanged } from '@/lib/analytics'

const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as SortOption
    trackSortChanged(newValue)
    onChange(newValue)
}
```

### 3.14 Product FAQ (`src/components/products/product-faq.tsx`)

```typescript
import { trackFaqExpanded } from '@/lib/analytics'

// In the Disclosure.Button onClick:
<Disclosure.Button
  onClick={() => {
    if (!open) {
      trackFaqExpanded({
        faqId: faq.id,
        questionText: faq.question,
        pageType: 'product',
        productId: product.id,
      })
    }
  }}
>
```

### 3.15 Global FAQ Page (`src/pages/faq.tsx`)

Same pattern as product FAQ but with `pageType: 'global'`:

```typescript
trackFaqExpanded({
    faqId: faq.id,
    questionText: faq.question,
    pageType: 'global'
})
```

### 3.16 Media Carousel (`src/components/products/media-carousel.tsx`)

```typescript
import { trackMediaViewed } from '@/lib/analytics'

// Track when index changes:
useEffect(() => {
    if (media[currentIndex]) {
        trackMediaViewed({
            mediaType: media[currentIndex].type,
            mediaIndex: currentIndex,
            mediaGroup: media[currentIndex].group,
            productId // Pass as prop
        })
    }
}, [currentIndex])
```

### 3.17 Media Lightbox (`src/components/products/media-lightbox.tsx`)

```typescript
import { trackLightboxOpened } from '@/lib/analytics'

// Track when lightbox opens:
useEffect(() => {
    if (isOpen && mediaItems[currentIndex]) {
        trackLightboxOpened({
            mediaType: mediaItems[currentIndex].type,
            productId // Pass as prop
        })
    }
}, [isOpen])
```

### 3.18 Share Button (`src/components/ui/share-button.tsx`)

```typescript
import { trackShareClicked } from '@/lib/analytics'

// Pass shareType as prop (product/wishlist/compare/quiz_results)

const handleCopyLink = async () => {
    trackShareClicked({
        shareType,
        platform: 'copy',
        itemId
    })
    // ... existing copy logic
}

const handleTwitterShare = () => {
    trackShareClicked({
        shareType,
        platform: 'twitter',
        itemId
    })
    // ... existing share logic
}

// Similar for linkedin, email, facebook
```

### 3.19 Header (`src/components/layout/header.tsx`)

```typescript
import {
  trackNavigationClicked,
  trackExternalLinkClicked,
  trackMobileMenuToggled,
} from '@/lib/analytics'

// Mobile menu toggle:
const handleMenuToggle = () => {
  const newState = !mobileMenuOpen
  trackMobileMenuToggled(newState ? 'open' : 'close')
  setMobileMenuOpen(newState)
}

// Navigation links:
<Link
  to="/products"
  onClick={() => trackNavigationClicked({ navType: 'header', destination: '/products' })}
>

// External links (Gumroad cart):
<a
  href="https://gumroad.com/checkout"
  onClick={() =>
    trackExternalLinkClicked({
      url: 'https://gumroad.com/checkout',
      linkType: 'gumroad',
    })
  }
>
```

### 3.20 Footer (`src/components/layout/footer.tsx`)

```typescript
import {
  trackNavigationClicked,
  trackExternalLinkClicked,
  trackNewsletterSubscribed,
  trackNewsletterDismissed,
} from '@/lib/analytics'

// Internal navigation:
<Link
  to="/products"
  onClick={() => trackNavigationClicked({ navType: 'footer', destination: '/products' })}
>

// External links:
<a
  href="https://github.com/dsebastien"
  onClick={() =>
    trackExternalLinkClicked({
      url: 'https://github.com/dsebastien',
      linkType: 'github',
    })
  }
>

// Social links:
<a
  href={social.url}
  onClick={() =>
    trackExternalLinkClicked({
      url: social.url,
      linkType: 'social',
    })
  }
>

// Newsletter subscribe success:
if (result.success) {
  trackNewsletterSubscribed('footer')
}

// Newsletter dismiss:
const handleDismiss = () => {
  trackNewsletterDismissed('footer')
  // ... existing dismiss logic
}
```

### 3.21 Category Page (`src/pages/category.tsx`)

```typescript
import { trackCategoryBrowsed } from '@/lib/analytics'
import { useScrollTracking } from '@/hooks/use-scroll-tracking'
import { useTimeOnPage } from '@/hooks/use-time-on-page'

useEffect(() => {
    if (category) {
        trackCategoryBrowsed(category.id, category.name)
    }
}, [category?.id])

useScrollTracking({ pageType: 'category' })
useTimeOnPage({ pageType: 'category' })
```

### 3.22 Tag Page (`src/pages/tag.tsx`)

```typescript
import { trackTagBrowsed } from '@/lib/analytics'
import { useScrollTracking } from '@/hooks/use-scroll-tracking'
import { useTimeOnPage } from '@/hooks/use-time-on-page'

useEffect(() => {
    if (tag) {
        trackTagBrowsed(tag.id, tag.name)
    }
}, [tag?.id])

useScrollTracking({ pageType: 'tag' })
useTimeOnPage({ pageType: 'tag' })
```

### 3.23 Home Page (`src/pages/home.tsx`)

```typescript
import { useScrollTracking } from '@/hooks/use-scroll-tracking'
import { useTimeOnPage } from '@/hooks/use-time-on-page'

useScrollTracking({ pageType: 'home' })
useTimeOnPage({ pageType: 'home' })
```

---

## Part 4: Source Prop Propagation

Update parent components to pass `source` prop to `ProductCardEcommerce`:

### Home Page

```typescript
<ProductCardEcommerce product={product} source="home" />
```

### Products Page

```typescript
<ProductCardEcommerce product={product} source="products" />
```

### Category Page

```typescript
<ProductCardEcommerce product={product} source="category" />
```

### Tag Page

```typescript
<ProductCardEcommerce product={product} source="tag" />
```

### Featured Page

```typescript
<ProductCardEcommerce product={product} source="featured" />
```

### Best Sellers Page

```typescript
<ProductCardEcommerce product={product} source="best_sellers" />
```

### Best Value Page

```typescript
<ProductCardEcommerce product={product} source="best_value" />
```

### Wishlist Page

```typescript
<ProductCardEcommerce product={product} source="wishlist" />
```

### Shared Wishlist Page

```typescript
<ProductCardEcommerce product={product} source="shared_wishlist" />
```

### Compare Page

```typescript
<ProductCardEcommerce product={product} source="compare" />
```

### Quiz Results

```typescript
<ProductCardEcommerce product={product} source="quiz" />
```

---

## Part 5: Event Summary

### Product Events (5)

| Event                  | Revenue | Key Properties                                        |
| ---------------------- | ------- | ----------------------------------------------------- |
| `product_viewed`       | No      | product_id, product_name, category, price, source     |
| `product_card_clicked` | No      | product_id, product_name, price, source               |
| `variant_selected`     | No      | product_id, variant_id, variant_name, price           |
| `frequency_selected`   | No      | product_id, variant_id, frequency, price              |
| `buy_clicked`          | **EUR** | product_id, product_name, variant_name, price, source |

### Quiz Events (5)

| Event                         | Key Properties                                        |
| ----------------------------- | ----------------------------------------------------- |
| `quiz_started`                | -                                                     |
| `quiz_question_answered`      | question_id, question_number, answer_index            |
| `quiz_completed`              | total_questions, products_recommended, top_product_id |
| `quiz_recommendation_clicked` | product_id, rank, is_top                              |
| `quiz_results_shared`         | -                                                     |

### Compare Events (4)

| Event                     | Key Properties                        |
| ------------------------- | ------------------------------------- |
| `compare_opened`          | product_count, product_ids, source    |
| `compare_product_added`   | product_id, product_name, total_count |
| `compare_product_removed` | product_id, remaining_count           |
| `compare_shared`          | product_count, product_ids            |

### Wishlist Events (4)

| Event                    | Key Properties                            |
| ------------------------ | ----------------------------------------- |
| `wishlist_toggled`       | action, product_id, source, wishlist_size |
| `wishlist_viewed`        | wishlist_size                             |
| `wishlist_shared`        | wishlist_size, product_ids                |
| `shared_wishlist_viewed` | product_count, product_ids                |

### Engagement Events (5)

| Event             | Key Properties                          |
| ----------------- | --------------------------------------- |
| `scroll_depth`    | depth (25/50/75/100), page_type         |
| `time_on_page`    | bracket (30s/1min/2min/5min), page_type |
| `faq_expanded`    | faq_id, question, page_type             |
| `media_viewed`    | media_type, media_index, product_id     |
| `lightbox_opened` | media_type, product_id                  |

### Search & Discovery Events (7)

| Event                      | Key Properties                        |
| -------------------------- | ------------------------------------- |
| `command_palette_opened`   | trigger (keyboard/click)              |
| `command_palette_search`   | query_length, result_count            |
| `command_palette_selected` | type, item_id, item_name              |
| `search_performed`         | query_length, result_count, page_type |
| `filter_applied`           | filter_type, filter_value             |
| `filter_removed`           | filter_type, filter_value             |
| `sort_changed`             | sort_option                           |

### Navigation Events (5)

| Event                   | Key Properties             |
| ----------------------- | -------------------------- |
| `navigation_clicked`    | nav_type, destination      |
| `external_link_clicked` | domain, link_type, url     |
| `mobile_menu_toggled`   | action (open/close)        |
| `category_browsed`      | category_id, category_name |
| `tag_browsed`           | tag_id, tag_name           |

### Newsletter Events (2)

| Event                   | Key Properties |
| ----------------------- | -------------- |
| `newsletter_subscribed` | location       |
| `newsletter_dismissed`  | location       |

### Share Events (1)

| Event           | Key Properties                |
| --------------- | ----------------------------- |
| `share_clicked` | share_type, platform, item_id |

**Total: 38 event types**

---

## Part 6: Conversion Funnels

### Direct Purchase Funnel

```
product_card_clicked → product_viewed → variant_selected → buy_clicked
```

### Quiz Funnel

```
quiz_started → quiz_question_answered (×N) → quiz_completed → quiz_recommendation_clicked → product_viewed → buy_clicked
```

### Compare Funnel

```
compare_opened → compare_product_added → product_viewed → buy_clicked
```

### Wishlist Funnel

```
wishlist_toggled (add) → wishlist_viewed → product_viewed → buy_clicked
```

### Search/Discovery Funnel

```
command_palette_opened → command_palette_search → command_palette_selected → product_viewed → buy_clicked
```

---

## Part 7: Files Summary

### New Files (3)

| File                               | Purpose                                                 |
| ---------------------------------- | ------------------------------------------------------- |
| `src/lib/analytics.ts`             | Core analytics module with types and tracking functions |
| `src/hooks/use-scroll-tracking.ts` | Hook for scroll depth tracking                          |
| `src/hooks/use-time-on-page.ts`    | Hook for time on page tracking                          |

### Modified Files (23)

| File                                                     | Events Added                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/pages/product.tsx`                                  | product_viewed, scroll, time                                                                           |
| `src/pages/products.tsx`                                 | search, filter, sort, scroll, time                                                                     |
| `src/pages/quiz.tsx`                                     | quiz_started, quiz_question_answered, quiz_completed, quiz_recommendation_clicked, quiz_results_shared |
| `src/pages/compare.tsx`                                  | compare_opened, compare_product_added, compare_product_removed, compare_shared                         |
| `src/pages/wishlist.tsx`                                 | wishlist_viewed, wishlist_shared                                                                       |
| `src/pages/shared-wishlist.tsx`                          | shared_wishlist_viewed                                                                                 |
| `src/pages/category.tsx`                                 | category_browsed, scroll, time                                                                         |
| `src/pages/tag.tsx`                                      | tag_browsed, scroll, time                                                                              |
| `src/pages/home.tsx`                                     | scroll, time                                                                                           |
| `src/pages/faq.tsx`                                      | faq_expanded                                                                                           |
| `src/components/products/product-card-ecommerce.tsx`     | product_card_clicked, wishlist_toggled, buy_clicked                                                    |
| `src/components/products/product-hero.tsx`               | variant_selected, frequency_selected, buy_clicked, wishlist_toggled                                    |
| `src/components/products/sticky-buy-button.tsx`          | buy_clicked                                                                                            |
| `src/components/products/payment-frequency-selector.tsx` | frequency_selected                                                                                     |
| `src/components/products/command-palette.tsx`            | command_palette_opened, command_palette_search, command_palette_selected                               |
| `src/components/products/product-faq.tsx`                | faq_expanded                                                                                           |
| `src/components/products/media-carousel.tsx`             | media_viewed                                                                                           |
| `src/components/products/media-lightbox.tsx`             | lightbox_opened                                                                                        |
| `src/components/products/filters/filter-sidebar.tsx`     | filter_applied, filter_removed                                                                         |
| `src/components/products/filters/sort-dropdown.tsx`      | sort_changed                                                                                           |
| `src/components/layout/header.tsx`                       | navigation_clicked, external_link_clicked, mobile_menu_toggled                                         |
| `src/components/layout/footer.tsx`                       | navigation_clicked, external_link_clicked, newsletter_subscribed, newsletter_dismissed                 |
| `src/components/ui/share-button.tsx`                     | share_clicked                                                                                          |

---

## Part 8: Verification

### Development Testing

1. Open browser DevTools console
2. Navigate through the site
3. Verify `[Analytics]` logs appear for each interaction
4. Check event names and properties are correct

### Plausible Dashboard

1. Open Plausible real-time view
2. Trigger events on the site
3. Verify events appear in the dashboard
4. Check custom properties are captured

### Funnel Testing

Test each conversion funnel end-to-end:

1. Direct purchase: Card → Product → Variant → Buy
2. Quiz: Start → Answer all → View results → Click recommendation → Buy
3. Compare: Open → Add products → View → Click product → Buy
4. Wishlist: Add → View wishlist → Click product → Buy

### Revenue Testing

1. Click buy button on product with known price
2. Verify `buy_clicked` event has `revenue: { currency: 'EUR', amount: X }`
3. Check Plausible revenue goal shows the amount

---

## Part 9: Plausible Dashboard Configuration

After implementation, create these in Plausible dashboard:

### Goals

1. **Revenue Goal**: `buy_clicked` with EUR revenue tracking enabled
2. **Conversion Goals**: All 38 event types listed above

### Custom Properties (for breakdown reports)

- `product_id` - Filter by specific products
- `product_name` - Human-readable product filter
- `source` - Traffic source attribution
- `category` - Product category
- `variant_name` - Variant selection analysis
- `page_type` - Page-level engagement
- `filter_type` - Filter usage patterns
- `platform` - Share platform preference

### Funnels (if Plausible plan supports)

1. Direct Purchase Funnel
2. Quiz-to-Purchase Funnel
3. Compare-to-Purchase Funnel
4. Wishlist-to-Purchase Funnel
