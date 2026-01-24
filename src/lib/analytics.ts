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
    if (import.meta.env['DEV']) {
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
