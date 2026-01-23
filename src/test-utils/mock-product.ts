import type { Product, ProductVariant } from '@/schemas/product.schema'
import type { MediaItem } from '@/schemas/media.schema'
import type { Testimonial } from '@/schemas/testimonial.schema'

/**
 * Creates a mock Product for testing
 * All required fields have sensible defaults that pass schema validation
 * Use overrides to customize specific fields for your test case
 */
export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
    // Identity
    id: 'test-product',
    name: 'Test Product',

    // Gumroad integration
    gumroadId: null,
    isGumroadProduct: false,
    gumroadProductSlugs: null,

    // Pricing
    price: 99.99,
    priceDisplay: '€99.99',
    priceTier: 'standard',
    gumroadUrl: 'https://gumroad.com/test',
    variants: null,

    // Subscription
    isSubscription: false,
    paymentFrequencies: null,
    defaultPaymentFrequency: null,

    // Taxonomy
    mainCategory: 'guides',
    secondaryCategories: [],
    tags: ['ai'],

    // Content
    contents: ['Item 1'],

    // Links
    landingPageUrl: null,
    dsebastienUrl: null,

    // Meta
    featured: false,
    bestValue: false,
    bestseller: false,
    priority: 50,

    // Cross-sell
    crossSellIds: [],

    // Quiz targeting
    targetExperienceLevel: 'all-levels',
    deliveryStyle: 'hybrid',

    // Included products
    includedProducts: [],
    activeSalesCopyId: 'default',

    // Auto-loaded content (aggregated)
    faqs: [],
    testimonials: [],
    media: [],
    stats: null,

    // Computed values
    ratingsCount: null,
    averageRating: null,
    testimonialsCount: 0,
    includedIn: [],

    // Sales copy
    salesCopy: {
        tagline: 'Test tagline',
        secondaryTagline: null,
        problem: 'Test problem',
        problemPoints: ['Problem point 1'],
        agitate: 'Test agitate',
        agitatePoints: ['Agitate point 1'],
        solution: 'Test solution',
        solutionPoints: ['Solution point 1'],
        description: 'Test description',
        highlights: ['Feature 1'],
        benefits: { immediate: ['Benefit 1'], systematic: [], longTerm: [] },
        targetAudience: [],
        perfectFor: [],
        notForYou: [],
        trustBadges: [],
        guarantees: [],
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        storytelling: null,
        timeline: null,
        courseContent: null,
        howItWorks: null,
        mediaSections: null
    },
    ...overrides
})

/**
 * Creates a mock MediaItem for testing
 * Use overrides to customize specific fields for your test case
 */
export const createMockMediaItem = (overrides: Partial<MediaItem> = {}): MediaItem => ({
    id: 'image-1',
    type: 'image',
    url: '/test-image.png',
    title: 'Test Image',
    description: null,
    altText: 'Test image alt text',
    caption: null,
    order: 0,
    group: 'main',
    youtubeId: null,
    thumbnailUrl: null,
    width: 800,
    height: 600,
    ...overrides
})

/**
 * Creates a mock ProductVariant for testing
 * Use overrides to customize specific fields for your test case
 */
export const createMockVariant = (overrides: Partial<ProductVariant> = {}): ProductVariant => ({
    name: 'Basic',
    price: 49,
    priceDisplay: '€49',
    description: 'Basic package',
    gumroadUrl: 'https://gumroad.com/test-basic',
    gumroadVariantId: 'basic',
    paymentFrequency: null,
    prices: null,
    includedProducts: [],
    ...overrides
})

/**
 * Creates a mock Testimonial for testing
 * Use overrides to customize specific fields for your test case
 */
export const createMockTestimonial = (overrides: Partial<Testimonial> = {}): Testimonial => ({
    id: 'testimonial-1',
    author: 'Test Author',
    role: null,
    company: null,
    avatarUrl: null,
    twitterHandle: null,
    twitterUrl: null,
    quote: 'This is a great product!',
    featured: false,
    ...overrides
})
