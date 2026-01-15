/**
 * Ghost Content API Client
 * Handles API requests to Ghost Content API with key-based authentication
 */

import type {
    GhostContentApiConfig,
    GhostPost,
    GhostPostsResponse,
    GhostTag,
    GhostTagsResponse
} from './types.js'
import { GhostApiError } from './admin-api-client.js'

const THROTTLE_MS = 200 // Delay between requests
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000

/**
 * Ghost Content API Client
 *
 * Features:
 * - Simple key-based authentication
 * - Request throttling (200ms between requests)
 * - Exponential backoff on rate limit (429)
 * - Automatic pagination handling
 */
export class GhostContentApiClient {
    private readonly siteUrl: string
    private readonly contentApiKey: string
    private lastRequestTime = 0

    constructor(config: GhostContentApiConfig) {
        this.siteUrl = config.siteUrl.replace(/\/$/, '') // Remove trailing slash
        this.contentApiKey = config.contentApiKey
    }

    /**
     * Throttle requests to avoid rate limiting
     */
    private async throttle(): Promise<void> {
        const now = Date.now()
        const timeSinceLastRequest = now - this.lastRequestTime

        if (timeSinceLastRequest < THROTTLE_MS) {
            await new Promise((resolve) => setTimeout(resolve, THROTTLE_MS - timeSinceLastRequest))
        }

        this.lastRequestTime = Date.now()
    }

    /**
     * Make an authenticated request to the Ghost Content API
     */
    private async request<T>(
        endpoint: string,
        params: Record<string, string> = {},
        retryCount = 0
    ): Promise<T> {
        await this.throttle()

        const queryParams = new URLSearchParams({
            key: this.contentApiKey,
            ...params
        })

        const url = `${this.siteUrl}/ghost/api/content${endpoint}?${queryParams.toString()}`

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept-Version': 'v5.0'
                }
            })

            // Handle rate limiting with exponential backoff
            if (response.status === 429) {
                if (retryCount < MAX_RETRIES) {
                    const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount)
                    await new Promise((resolve) => setTimeout(resolve, backoffMs))
                    return this.request<T>(endpoint, params, retryCount + 1)
                }
                throw new GhostApiError('Rate limit exceeded after retries', 429)
            }

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}))
                const message = errorBody?.errors?.[0]?.message ?? `HTTP ${response.status}`
                throw new GhostApiError(message, response.status)
            }

            return response.json() as Promise<T>
        } catch (error) {
            if (error instanceof GhostApiError) {
                throw error
            }

            // Network errors - retry with backoff
            if (retryCount < MAX_RETRIES) {
                const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount)
                await new Promise((resolve) => setTimeout(resolve, backoffMs))
                return this.request<T>(endpoint, params, retryCount + 1)
            }

            throw new GhostApiError(error instanceof Error ? error.message : 'Network error', 0)
        }
    }

    /**
     * Get post count for a specific tag
     * @param tagSlug The tag slug (e.g., 'blog', 'newsletter')
     */
    async getPostCountByTag(tagSlug: string): Promise<number> {
        // First, try to get the tag with post count
        try {
            const response = await this.request<GhostTagsResponse>(`/tags/slug/${tagSlug}/`, {
                include: 'count.posts'
            })

            if (response.tags.length > 0 && response.tags[0].count) {
                return response.tags[0].count.posts
            }
        } catch {
            // Tag might not exist, return 0
        }

        // Fallback: count posts directly
        let totalPosts = 0
        let page = 1
        let hasMore = true

        while (hasMore) {
            const response = await this.request<GhostPostsResponse>('/posts/', {
                filter: `tag:${tagSlug}`,
                limit: '100',
                page: String(page),
                fields: 'id' // Only fetch id to minimize data
            })

            totalPosts += response.posts.length

            if (response.meta.pagination.next) {
                page++
            } else {
                hasMore = false
            }
        }

        return totalPosts
    }

    /**
     * Get all tags with their post counts
     */
    async getTagsWithCounts(): Promise<GhostTag[]> {
        const allTags: GhostTag[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
            const response = await this.request<GhostTagsResponse>('/tags/', {
                include: 'count.posts',
                limit: '100',
                page: String(page)
            })

            allTags.push(...response.tags)

            if (response.meta.pagination.next) {
                page++
            } else {
                hasMore = false
            }
        }

        return allTags
    }

    /**
     * Get total post count
     */
    async getTotalPostCount(): Promise<number> {
        const response = await this.request<GhostPostsResponse>('/posts/', {
            limit: '1',
            fields: 'id'
        })

        return response.meta.pagination.total
    }

    /**
     * Get posts by tag (for more detailed analysis)
     * @param tagSlug The tag slug
     * @param limit Maximum number of posts to return
     */
    async getPostsByTag(tagSlug: string, limit = 100): Promise<GhostPost[]> {
        const allPosts: GhostPost[] = []
        let page = 1
        let hasMore = true

        while (hasMore && allPosts.length < limit) {
            const response = await this.request<GhostPostsResponse>('/posts/', {
                filter: `tag:${tagSlug}`,
                include: 'tags,authors',
                limit: String(Math.min(100, limit - allPosts.length)),
                page: String(page)
            })

            allPosts.push(...response.posts)

            if (response.meta.pagination.next && allPosts.length < limit) {
                page++
            } else {
                hasMore = false
            }
        }

        return allPosts.slice(0, limit)
    }
}
