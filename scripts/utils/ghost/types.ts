/**
 * Ghost API Types
 * Type definitions for Ghost Admin and Content API responses
 */

// ============================================================================
// Configuration
// ============================================================================

export interface GhostAdminApiConfig {
    siteUrl: string
    adminApiKey: string // Format: "id:secret"
}

export interface GhostContentApiConfig {
    siteUrl: string
    contentApiKey: string
}

// ============================================================================
// Admin API - Members
// ============================================================================

export interface GhostMemberLabel {
    id: string
    name: string
    slug: string
    created_at: string
    updated_at: string
}

export interface GhostMemberNewsletter {
    id: string
    name: string
    description: string | null
    status: 'active' | 'archived'
}

export interface GhostSubscriptionPrice {
    id: string
    price_id: string
    nickname: string
    amount: number // in smallest currency unit (cents)
    interval: 'month' | 'year'
    type: 'recurring'
    currency: string
}

export interface GhostSubscriptionCustomer {
    id: string
    name: string | null
    email: string
}

export interface GhostSubscription {
    id: string
    customer: GhostSubscriptionCustomer
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
    start_date: string
    default_payment_card_last4: string | null
    cancel_at_period_end: boolean
    cancellation_reason: string | null
    current_period_end: string
    price: GhostSubscriptionPrice
    tier: Record<string, unknown>
    offer: Record<string, unknown> | null
}

export interface GhostMember {
    id: string
    uuid: string
    email: string
    name: string | null
    note: string | null
    geolocation: string | null
    created_at: string
    updated_at: string
    labels: GhostMemberLabel[]
    subscriptions: GhostSubscription[]
    avatar_image: string
    email_count: number
    email_opened_count: number
    email_open_rate: number | null
    status: 'free' | 'paid' | 'comped'
    last_seen_at: string | null
    newsletters: GhostMemberNewsletter[]
}

export interface GhostPagination {
    page: number
    limit: number
    pages: number
    total: number
    next: number | null
    prev: number | null
}

export interface GhostMembersResponse {
    members: GhostMember[]
    meta: {
        pagination: GhostPagination
    }
}

// ============================================================================
// Content API - Posts
// ============================================================================

export interface GhostTag {
    id: string
    name: string
    slug: string
    description: string | null
    feature_image: string | null
    visibility: 'public' | 'internal'
    url: string
    count?: {
        posts: number
    }
}

export interface GhostAuthor {
    id: string
    name: string
    slug: string
    profile_image: string | null
    bio: string | null
    website: string | null
}

export interface GhostPost {
    id: string
    uuid: string
    title: string
    slug: string
    html: string | null
    excerpt: string | null
    feature_image: string | null
    featured: boolean
    visibility: 'public' | 'members' | 'paid' | 'tiers'
    created_at: string
    updated_at: string
    published_at: string
    url: string
    authors?: GhostAuthor[]
    tags?: GhostTag[]
}

export interface GhostPostsResponse {
    posts: GhostPost[]
    meta: {
        pagination: GhostPagination
    }
}

export interface GhostTagsResponse {
    tags: GhostTag[]
    meta: {
        pagination: GhostPagination
    }
}

// ============================================================================
// Aggregated Stats Types
// ============================================================================

export interface MemberCounts {
    total: number
    free: number
    paid: number
    comped: number
}

export interface MemberGrowthStats {
    newThisPeriod: number
    growthRate: number
}

export interface CalculatedMrr {
    amount: number
    currency: string
}
