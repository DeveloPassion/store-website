import type { CategoryId } from './category'
import type { TagId } from './tag'

export type PriceTier = 'free' | 'budget' | 'standard' | 'premium' | 'enterprise' | 'subscription'

// Categories are now defined in category.ts (single source of truth)
export type ProductCategory = CategoryId

export interface SecondaryCategory {
    id: CategoryId
    distant?: boolean
}

export type ProductStatus = 'active' | 'coming-soon' | 'archived'

export interface ProductVariant {
    name: string
    price: number
    priceDisplay: string
    description: string
    gumroadUrl: string
}

export interface Product {
    // Identity
    id: string // Slug (e.g., 'obsidian-starter-kit')
    permalink: string // Gumroad /l/{code} - MUST be exact
    name: string
    tagline: string
    secondaryTagline?: string

    // Pricing
    price: number // Base price in EUR
    priceDisplay: string // e.g., '€49.99' or 'FREE-€39.99/mo'
    priceTier: PriceTier
    gumroadUrl: string
    variants?: ProductVariant[] // For products with multiple tiers

    // Taxonomy (multi-dimensional filtering)
    mainCategory: ProductCategory
    secondaryCategories: SecondaryCategory[]
    tags: TagId[]

    // Marketing Copy (PAS Framework)
    problem: string // Pain point user faces
    problemPoints: string[] // Bullet points of specific pain points
    agitate: string // Make problem worse
    agitatePoints: string[] // Specific frustrations
    solution: string // How product solves it
    solutionPoints: string[] // Transformation points

    // Features & Benefits
    description: string
    features: string[]
    benefits: {
        immediate?: string[]
        systematic?: string[]
        longTerm?: string[]
    }
    included: string[] // What you get

    // Social Proof
    testimonialIds: string[] // IDs from testimonials.json
    statsProof?: {
        userCount?: string // '10,000+ users'
        timeSaved?: string
        rating?: string
    }

    // Media
    coverImage?: string
    screenshots?: string[]
    videoUrl?: string // YouTube embed
    demoUrl?: string

    // Content
    faqIds: string[] // IDs from faqs.json
    targetAudience: string[]
    perfectFor: string[]
    notForYou: string[]

    // Links
    landingPageUrl?: string // e.g., obsidianstarterkit.com
    dsebastienUrl?: string // Article on dsebastien.net

    // Meta
    featured: boolean
    status: ProductStatus
    priority: number // Higher number = higher priority in listings (0-100)

    // Trust & Guarantees
    trustBadges: string[]
    guarantees: string[]

    // Cross-sell
    crossSellIds: string[] // Product IDs to recommend

    // SEO
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
}
