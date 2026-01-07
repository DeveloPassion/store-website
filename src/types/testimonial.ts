export interface Testimonial {
    id: string
    productId: string // Which product this testimonial is for
    author: string
    role?: string
    company?: string
    avatarUrl?: string
    twitterHandle?: string
    twitterUrl?: string
    rating: number // 1-5
    quote: string
    featured: boolean // Hero testimonials
}
