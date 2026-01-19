#!/usr/bin/env bun

/**
 * Interactive CLI tool to manage products, media, FAQs, and testimonials
 *
 * This script provides an easy way to manage all product data with interactive prompts
 * featuring keyboard-navigable multi-select interfaces or via CLI arguments.
 *
 * Usage:
 *   Interactive mode:
 *     bun run update:products
 *
 *   Product operations:
 *     bun run update:products -- --operation list [--featured] [--status active] [--category guides] [--tag ai] [--format json|table|detailed]
 *     bun run update:products -- --operation add --name "Product Name" --tagline "..." --price 49.99 --priceTier standard --gumroadUrl "https://..." --mainCategory guides --tags "tag1,tag2"
 *     bun run update:products -- --operation edit --id product-id [--name "..."] [--price 49.99] [--priority 95]
 *     bun run update:products -- --operation remove --id product-id [--force]
 *
 *   Media operations:
 *     bun run update:products -- --operation media:list --id product-id [--media-group cover]
 *     bun run update:products -- --operation media:add --id product-id --media-type image|video --media-url "..." --media-title "..." --media-altText "..." --media-group cover|main|secondary|bonus [--media-description "..."] [--media-caption "..."] [--media-order 0]
 *     bun run update:products -- --operation media:edit --id product-id --media-id "media-123" [--media-title "..."] [--media-url "..."] [--media-altText "..."]
 *     bun run update:products -- --operation media:remove --id product-id --media-id "media-123"
 *     bun run update:products -- --operation media:reorder --id product-id --media-id "media-123" --media-order 5
 *
 *   FAQ operations:
 *     bun run update:products -- --operation faq:list --id product-id
 *     bun run update:products -- --operation faq:add --id product-id --faq-question "..." --faq-answer "..." [--faq-id "custom-id"]
 *     bun run update:products -- --operation faq:edit --id product-id --faq-id "faq-123" [--faq-question "..."] [--faq-answer "..."]
 *     bun run update:products -- --operation faq:remove --id product-id --faq-id "faq-123"
 *
 *   Testimonial operations:
 *     bun run update:products -- --operation testimonial:list --id product-id
 *     bun run update:products -- --operation testimonial:add --id product-id --testimonial-author "..." --testimonial-quote "..."  [--testimonial-featured true] [--testimonial-role "..."] [--testimonial-company "..."] [--testimonial-id "custom-id"]
 *     bun run update:products -- --operation testimonial:edit --id product-id --testimonial-id "test-123" [--testimonial-author "..."] [--testimonial-quote "..."] [] [--testimonial-featured false]
 *     bun run update:products -- --operation testimonial:remove --id product-id --testimonial-id "test-123"]
 *
 *   Sales Copy operations:
 *     bun run update:products -- --operation sales-copy:list --id product-id
 *     bun run update:products -- --operation sales-copy:add --id product-id --sales-copy-id "variant-name"
 *     bun run update:products -- --operation sales-copy:enable --id product-id --sales-copy-id "variant-name"
 *     bun run update:products -- --operation sales-copy:duplicate --id product-id --sales-copy-id "source-id" --new-sales-copy-id "target-id"
 *     bun run update:products -- --operation sales-copy:remove --id product-id --sales-copy-id "variant-name"
 *     bun run update:products -- --operation sales-copy:edit --id product-id --sales-copy-id "variant-name" [--sales-copy-tagline "..."] [--sales-copy-description "..."]
 *
 * Arguments:
 *   Product:
 *     --operation <list|add|edit|remove|media:*|faq:*|testimonial:*>
 *     --id <string>                       Product ID
 *     --name <string>                     Product name
 *     --tagline <string>                  Product tagline
 *     --price <number>                    Price in EUR
 *     --priceTier <string>                Price tier
 *     --gumroadUrl <string>               Gumroad URL
 *     --mainCategory <string>             Main category ID
 *     --tags <string>                     Comma-separated tag IDs
 *     --secondaryCategories <string>      Format: "id:distant,id:distant"
 *     --featured <true|false>             Featured status
 *     --priority <number>                 Priority
 *     --status <string>                   Status
 *     --force                             Force removal
 *     --format <json|table|detailed>      Output format
 *
 *   Media:
 *     --media-id <string>                 Media item ID
 *     --media-type <image|video>          Media type
 *     --media-url <string>                Media URL
 *     --media-title <string>              Media title
 *     --media-description <string>        Media description
 *     --media-altText <string>            Alt text for accessibility
 *     --media-caption <string>            Display caption
 *     --media-group <cover|main|secondary|bonus>  Media group
 *     --media-order <number>              Display order
 *
 *   FAQ:
 *     --faq-id <string>                   FAQ ID
 *     --faq-question <string>             Question text
 *     --faq-answer <string>               Answer text
 *
 *   Testimonial:
 *     --testimonial-id <string>           Testimonial ID
 *     --testimonial-author <string>       Author name
 *     --testimonial-quote <string>        Quote text
 *
 *     --testimonial-featured <true|false> Featured status
 *     --testimonial-role <string>         Author role
 *     --testimonial-company <string>      Author company
 *
 *   Sales Copy:
 *     --sales-copy-id <string>                  Sales copy variant ID
 *     --new-sales-copy-id <string>              New variant ID (for duplicate operation)
 *     --sales-copy-tagline <string>             Product tagline
 *     --sales-copy-secondary-tagline <string>   Secondary tagline
 *     --sales-copy-description <string>         Product description
 *     --sales-copy-problem <string>             Problem statement (PAS)
 *     --sales-copy-problem-points <string>      Problem points (JSON array or comma-separated)
 *     --sales-copy-agitate <string>             Agitate statement (PAS)
 *     --sales-copy-agitate-points <string>      Agitate points (JSON array or comma-separated)
 *     --sales-copy-solution <string>            Solution statement (PAS)
 *     --sales-copy-solution-points <string>     Solution points (JSON array or comma-separated)
 *     --sales-copy-features <string>            Features (JSON array or comma-separated)
 *     --sales-copy-benefits-immediate <string>  Immediate benefits (JSON array or comma-separated)
 *     --sales-copy-benefits-systematic <string> Systematic benefits (JSON array or comma-separated)
 *     --sales-copy-benefits-long-term <string>  Long-term benefits (JSON array or comma-separated)
 *     --sales-copy-target-audience <string>     Target audience (JSON array or comma-separated)
 *     --sales-copy-perfect-for <string>         Perfect for (JSON array or comma-separated)
 *     --sales-copy-not-for-you <string>         Not for you (JSON array or comma-separated)
 *     --sales-copy-trust-badges <string>        Trust badges (JSON array or comma-separated)
 *     --sales-copy-guarantees <string>          Guarantees (JSON array or comma-separated)
 *     --sales-copy-meta-title <string>          SEO meta title
 *     --sales-copy-meta-description <string>    SEO meta description
 *     --sales-copy-keywords <string>            SEO keywords (JSON array or comma-separated)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'
import inquirer from 'inquirer'
import { select } from '@inquirer/prompts'
import {
    IndividualProductSchema,
    PriceTierSchema,
    ProductCategorySchema
} from '../src/schemas/product.schema.js'
import { MediaItemSchema, MediaFileSchema } from '../src/schemas/media.schema.js'
import { TagsMapSchema } from '../src/schemas/tag.schema.js'
import { TagIdSchema } from '../src/schemas/tag.schema.js'
import { CategoriesArraySchema } from '../src/schemas/category.schema.js'
import { FAQFileSchema } from '../src/schemas/faq.schema.js'
import { TestimonialFileSchema } from '../src/schemas/testimonial.schema.js'
import {
    StatsFileSchema,
    type Stats,
    type Rating,
    type StatItem,
    type AdditionalStat
} from '../src/schemas/stats.schema.js'
import { SalesCopyFileSchema } from '../src/schemas/sales-copy.schema.js'
import { discoverSalesCopyFiles } from './utils/aggregate-products.js'
import type { Product, SecondaryCategory } from '../src/types/product'
import type { MediaGroup, MediaType, MediaItem } from '../src/schemas/media.schema.js'
import type { SalesCopyData, SalesCopyFile } from '../src/types/sales-copy.js'
import type { TagsMap, TagId } from '../src/types/tag'
import type { Category } from '../src/types/category'
import type { FAQ } from '../src/types/faq'
import type { Testimonial } from '../src/types/testimonial'

// ANSI color codes for better UX
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')
const TAGS_FILE = resolve(__dirname, '../src/data/tags.json')
const CATEGORIES_FILE = resolve(__dirname, '../src/data/categories.json')

interface CliArgs {
    // Core operations
    'operation'?: string // Supports: list, add, edit, remove, media:*, faq:*, testimonial:*
    'id'?: string

    // Product fields
    'name'?: string
    'tagline'?: string
    'secondaryTagline'?: string
    'price'?: string
    'priceDisplay'?: string
    'priceTier'?: string
    'gumroadUrl'?: string
    'mainCategory'?: string
    'tags'?: string // comma-separated
    'secondaryCategories'?: string // format: "id:distant,id:distant"
    'featured'?: string
    'priority'?: string
    'problem'?: string
    'agitate'?: string
    'solution'?: string
    'force'?: boolean

    // List filters
    'featured_filter'?: boolean
    'category_filter'?: string
    'tag_filter'?: string
    'format'?: 'json' | 'table' | 'detailed'

    // Media arguments
    'media-id'?: string
    'media-type'?: string
    'media-url'?: string
    'media-title'?: string
    'media-description'?: string
    'media-altText'?: string
    'media-caption'?: string
    'media-group'?: string
    'media-order'?: string

    // FAQ arguments
    'faq-id'?: string
    'faq-question'?: string
    'faq-answer'?: string

    // Testimonial arguments
    'testimonial-id'?: string
    'testimonial-author'?: string
    'testimonial-quote'?: string
    'testimonial-featured'?: string
    'testimonial-role'?: string
    'testimonial-company'?: string
    'testimonial-twitterHandle'?: string
    'testimonial-twitterUrl'?: string
    'testimonial-avatarUrl'?: string

    // Sales Copy arguments
    'sales-copy-id'?: string
    'new-sales-copy-id'?: string
    'sales-copy-tagline'?: string
    'sales-copy-secondary-tagline'?: string
    'sales-copy-description'?: string
    'sales-copy-problem'?: string
    'sales-copy-problem-points'?: string // JSON array or comma-separated
    'sales-copy-agitate'?: string
    'sales-copy-agitate-points'?: string // JSON array or comma-separated
    'sales-copy-solution'?: string
    'sales-copy-solution-points'?: string // JSON array or comma-separated
    'sales-copy-features'?: string // JSON array or comma-separated
    'sales-copy-benefits-immediate'?: string // JSON array or comma-separated
    'sales-copy-benefits-systematic'?: string // JSON array or comma-separated
    'sales-copy-benefits-long-term'?: string // JSON array or comma-separated
    'sales-copy-target-audience'?: string // JSON array or comma-separated
    'sales-copy-perfect-for'?: string // JSON array or comma-separated
    'sales-copy-not-for-you'?: string // JSON array or comma-separated
    'sales-copy-trust-badges'?: string // JSON array or comma-separated
    'sales-copy-guarantees'?: string // JSON array or comma-separated
    'sales-copy-meta-title'?: string
    'sales-copy-meta-description'?: string
    'sales-copy-keywords'?: string // JSON array or comma-separated
}

interface ProductReference {
    productId: string
    productName: string
    referenceType: 'crossSell'
}

// ============================================================================
// Media Management Utilities
// ============================================================================

// ============================================================================
// Media File I/O Utilities
// ============================================================================

/**
 * Get the path to a product's media file
 */
function getMediaPath(productsDir: string, productId: string): string {
    return join(productsDir, `${productId}-media.json`)
}

/**
 * Load media items from a product's media file
 */
export function loadMedia(productsDir: string, productId: string): MediaItem[] {
    const mediaPath = getMediaPath(productsDir, productId)
    if (!existsSync(mediaPath)) {
        return []
    }

    try {
        const content = readFileSync(mediaPath, 'utf-8')
        const fileData = JSON.parse(content)
        const result = MediaFileSchema.safeParse(fileData)

        if (!result.success) {
            throw new Error(`Invalid media data: ${result.error.message}`)
        }

        return result.data.data
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(
                `Failed to parse media file for ${productId} (invalid JSON): ${error.message}`
            )
        }
        throw new Error(
            `Failed to load media for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}

/**
 * Save media items to a product's media file
 */
export function saveMedia(productsDir: string, productId: string, media: MediaItem[]): void {
    const mediaPath = getMediaPath(productsDir, productId)

    // Sort by group priority, then by order
    const sorted = [...media].sort((a, b) => {
        const groupPriority: Record<MediaGroup, number> = {
            cover: 0,
            main: 1,
            secondary: 2,
            bonus: 3
        }
        const groupDiff = groupPriority[a.group] - groupPriority[b.group]
        if (groupDiff !== 0) return groupDiff
        return a.order - b.order
    })

    // Wrap in file format and validate
    const fileData = { data: sorted }
    const result = MediaFileSchema.safeParse(fileData)
    if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`)
    }

    const json = JSON.stringify(fileData, null, 4)
    writeFileSync(mediaPath, json + '\n', 'utf-8')
}

// ============================================================================
// Media Management Utilities
// ============================================================================

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) return match[1]
    }

    return null
}

/**
 * Generate a unique media ID
 */
function generateMediaId(group: MediaGroup, existingIds: string[]): string {
    const timestamp = Date.now()
    let counter = 0
    let id = `${group}-${timestamp}`

    while (existingIds.includes(id)) {
        counter++
        id = `${group}-${timestamp}-${counter}`
    }

    return id
}

/**
 * Get the next available order number for a media group
 */
function getNextOrder(media: MediaItem[], group: MediaGroup): number {
    const groupMedia = media.filter((item) => item.group === group)
    if (groupMedia.length === 0) return 0

    const maxOrder = Math.max(...groupMedia.map((item) => item.order))
    return maxOrder + 1
}

/**
 * Add a media item to a product
 */
function addMediaToProduct(
    productsDir: string,
    productId: string,
    mediaData: {
        type: MediaType
        url: string
        title: string
        description?: string
        altText: string
        caption?: string
        group: MediaGroup
        order?: number
        youtubeId?: string
        thumbnailUrl?: string
        width?: number
        height?: number
    }
): MediaItem {
    // Load existing media
    const media = loadMedia(productsDir, productId)
    const existingIds = media.map((item) => item.id)

    // Generate ID and determine order
    const id = generateMediaId(mediaData.group, existingIds)
    const order = mediaData.order ?? getNextOrder(media, mediaData.group)

    // For videos, extract YouTube ID if not provided
    let youtubeId = mediaData.youtubeId
    if (mediaData.type === 'video' && !youtubeId) {
        youtubeId = extractYouTubeId(mediaData.url) || undefined
    }

    const newMediaItem: MediaItem = {
        id,
        type: mediaData.type,
        url: mediaData.url,
        title: mediaData.title,
        description: mediaData.description,
        altText: mediaData.altText,
        caption: mediaData.caption,
        order,
        group: mediaData.group,
        youtubeId,
        thumbnailUrl: mediaData.thumbnailUrl,
        width: mediaData.width,
        height: mediaData.height
    }

    // Validate the media item
    const result = MediaItemSchema.safeParse(newMediaItem)
    if (!result.success) {
        throw new Error(`Invalid media item: ${result.error.message}`)
    }

    // Add and save
    media.push(result.data)
    saveMedia(productsDir, productId, media)

    return result.data
}

/**
 * Edit an existing media item in a product
 */
function editMediaInProduct(
    productsDir: string,
    productId: string,
    mediaId: string,
    updates: Partial<Omit<MediaItem, 'id'>>
): MediaItem {
    // Load existing media
    const media = loadMedia(productsDir, productId)
    const mediaIndex = media.findIndex((item) => item.id === mediaId)

    if (mediaIndex === -1) {
        throw new Error(`Media item with ID "${mediaId}" not found`)
    }

    const existingItem = media[mediaIndex]
    const updatedItem: MediaItem = {
        ...existingItem,
        ...updates,
        id: mediaId // Preserve ID
    }

    // For videos, extract YouTube ID if URL changed and youtubeId not provided
    if (
        updatedItem.type === 'video' &&
        updates.url &&
        !updates.youtubeId &&
        !updatedItem.youtubeId
    ) {
        updatedItem.youtubeId = extractYouTubeId(updatedItem.url) || undefined
    }

    // Validate the updated media item
    const result = MediaItemSchema.safeParse(updatedItem)
    if (!result.success) {
        throw new Error(`Invalid media item: ${result.error.message}`)
    }

    // Update and save
    media[mediaIndex] = result.data
    saveMedia(productsDir, productId, media)

    return result.data
}

/**
 * Remove a media item from a product
 */
function removeMediaFromProduct(productsDir: string, productId: string, mediaId: string): void {
    // Load existing media
    const media = loadMedia(productsDir, productId)
    const mediaIndex = media.findIndex((item) => item.id === mediaId)

    if (mediaIndex === -1) {
        throw new Error(`Media item with ID "${mediaId}" not found`)
    }

    // Remove and save
    const updatedMedia = media.filter((item) => item.id !== mediaId)
    saveMedia(productsDir, productId, updatedMedia)
}

/**
 * List media items in a product (optionally filtered by group)
 */
function listMediaInProduct(
    productsDir: string,
    productId: string,
    group?: MediaGroup
): MediaItem[] {
    // Load media
    const media = loadMedia(productsDir, productId)

    if (group) {
        return media.filter((item) => item.group === group).sort((a, b) => a.order - b.order)
    }

    return media.sort((a, b) => {
        const groupPriority: Record<MediaGroup, number> = {
            cover: 0,
            main: 1,
            secondary: 2,
            bonus: 3
        }
        return groupPriority[a.group] - groupPriority[b.group] || a.order - b.order
    })
}

/**
 * Reorder a media item within its group
 */
function reorderMediaInProduct(
    productsDir: string,
    productId: string,
    mediaId: string,
    newOrder: number
): MediaItem {
    // Load existing media
    const media = loadMedia(productsDir, productId)
    const mediaItem = media.find((item) => item.id === mediaId)

    if (!mediaItem) {
        throw new Error(`Media item with ID "${mediaId}" not found`)
    }

    // Update the order
    const updatedMedia = media.map((item) => {
        if (item.id === mediaId) {
            return { ...item, order: newOrder }
        }
        return item
    })

    // Save and return the updated item
    saveMedia(productsDir, productId, updatedMedia)

    return { ...mediaItem, order: newOrder }
}

/**
 * Display media items in a formatted table
 */
function formatMediaList(mediaItems: MediaItem[]): string {
    if (mediaItems.length === 0) {
        return 'No media items found.'
    }

    const rows = mediaItems.map((item) => {
        const typeIcon = item.type === 'video' ? '🎥' : '🖼️'
        const groupBadge = {
            cover: '🖼️',
            main: '⭐',
            secondary: '📌',
            bonus: '🎁'
        }[item.group]

        return [
            item.id,
            `${typeIcon} ${item.type}`,
            `${groupBadge} ${item.group}`,
            item.order.toString(),
            item.title,
            item.url.length > 40 ? item.url.substring(0, 37) + '...' : item.url
        ]
    })

    const headers = ['ID', 'Type', 'Group', 'Order', 'Title', 'URL']
    const columnWidths = headers.map((header, i) =>
        Math.max(header.length, ...rows.map((row) => row[i]?.length || 0))
    )

    const separator = columnWidths.map((width) => '-'.repeat(width + 2)).join('+')
    const headerRow = headers.map((header, i) => header.padEnd(columnWidths[i])).join(' | ')

    const dataRows = rows
        .map((row) => row.map((cell, i) => cell.padEnd(columnWidths[i])).join(' | '))
        .join('\n')

    return `${headerRow}\n${separator}\n${dataRows}`
}

// ============================================================================
// Content Management Utilities (FAQs & Testimonials)
// ============================================================================

/**
 * Generate a random alphanumeric string
 */
function generateRandomString(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * Generate FAQ ID with product prefix
 */
function generateFaqId(productId: string): string {
    return `${productId}-faq-${generateRandomString(8)}`
}

/**
 * Generate testimonial ID with product prefix
 */
function generateTestimonialId(productId: string): string {
    return `${productId}-testimonial-${generateRandomString(8)}`
}

function getFaqPath(productsDir: string, productId: string): string {
    return join(productsDir, `${productId}-faq.json`)
}

export function loadFaqs(productsDir: string, productId: string): FAQ[] {
    const faqPath = getFaqPath(productsDir, productId)
    if (!existsSync(faqPath)) {
        return []
    }

    try {
        const content = readFileSync(faqPath, 'utf-8')
        const fileData = JSON.parse(content)
        const result = FAQFileSchema.safeParse(fileData)

        if (!result.success) {
            throw new Error(`Invalid FAQ data: ${result.error.message}`)
        }

        return result.data.data
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(
                `Failed to parse FAQ file for ${productId} (invalid JSON): ${error.message}`
            )
        }
        throw new Error(
            `Failed to load FAQs for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}

export function saveFaqs(productsDir: string, productId: string, faqs: FAQ[]): void {
    const faqPath = getFaqPath(productsDir, productId)

    // Wrap in file format and validate
    const fileData = { data: faqs }
    const result = FAQFileSchema.safeParse(fileData)
    if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`)
    }

    const json = JSON.stringify(fileData, null, 4)
    writeFileSync(faqPath, json + '\n', 'utf-8')
}

function addFaqToProduct(
    productsDir: string,
    productId: string,
    faqData: Omit<FAQ, 'id'> & { id?: string }
): FAQ {
    const faqs = loadFaqs(productsDir, productId)

    const id = faqData.id || generateFaqId(productId)

    // Check if ID already exists
    if (faqs.some((f) => f.id === id)) {
        throw new Error(`FAQ with ID "${id}" already exists`)
    }

    const newFaq: FAQ = {
        id,
        question: faqData.question,
        answer: faqData.answer
    }

    faqs.push(newFaq)
    saveFaqs(productsDir, productId, faqs)

    return newFaq
}

function editFaqInProduct(
    productsDir: string,
    productId: string,
    faqId: string,
    updates: Partial<Omit<FAQ, 'id'>>
): FAQ {
    const faqs = loadFaqs(productsDir, productId)
    const faqIndex = faqs.findIndex((f) => f.id === faqId)

    if (faqIndex === -1) {
        throw new Error(`FAQ with ID "${faqId}" not found`)
    }

    const updatedFaq: FAQ = {
        ...faqs[faqIndex],
        ...updates,
        id: faqId // Preserve ID
    }

    faqs[faqIndex] = updatedFaq
    saveFaqs(productsDir, productId, faqs)

    return updatedFaq
}

function removeFaqFromProduct(productsDir: string, productId: string, faqId: string): void {
    const faqs = loadFaqs(productsDir, productId)
    const filtered = faqs.filter((f) => f.id !== faqId)

    if (filtered.length === faqs.length) {
        throw new Error(`FAQ with ID "${faqId}" not found`)
    }

    saveFaqs(productsDir, productId, filtered)
}

function listFaqsInProduct(productsDir: string, productId: string): FAQ[] {
    return loadFaqs(productsDir, productId)
}

function getTestimonialPath(productsDir: string, productId: string): string {
    return join(productsDir, `${productId}-testimonials.json`)
}

export function loadTestimonials(productsDir: string, productId: string): Testimonial[] {
    const testimonialPath = getTestimonialPath(productsDir, productId)
    if (!existsSync(testimonialPath)) {
        return []
    }

    try {
        const content = readFileSync(testimonialPath, 'utf-8')
        const fileData = JSON.parse(content)
        const result = TestimonialFileSchema.safeParse(fileData)

        if (!result.success) {
            throw new Error(`Invalid testimonial data: ${result.error.message}`)
        }

        return result.data.data
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(
                `Failed to parse testimonial file for ${productId} (invalid JSON): ${error.message}`
            )
        }
        throw new Error(
            `Failed to load testimonials for ${productId}: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}

export function saveTestimonials(
    productsDir: string,
    productId: string,
    testimonials: Testimonial[]
): void {
    const testimonialPath = getTestimonialPath(productsDir, productId)

    // Sort by featured (featured first), then by author name
    const sorted = [...testimonials].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        return a.author.localeCompare(b.author)
    })

    // Wrap in file format and validate
    const fileData = { data: sorted }
    const result = TestimonialFileSchema.safeParse(fileData)
    if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`)
    }

    const json = JSON.stringify(fileData, null, 4)
    writeFileSync(testimonialPath, json + '\n', 'utf-8')
}

function addTestimonialToProduct(
    productsDir: string,
    productId: string,
    testimonialData: Omit<Testimonial, 'id'> & { id?: string }
): Testimonial {
    const testimonials = loadTestimonials(productsDir, productId)

    const id = testimonialData.id || generateTestimonialId(productId)

    // Check if ID already exists
    if (testimonials.some((t) => t.id === id)) {
        throw new Error(`Testimonial with ID "${id}" already exists`)
    }

    const newTestimonial: Testimonial = {
        id,
        author: testimonialData.author,
        quote: testimonialData.quote,
        featured: testimonialData.featured,
        role: testimonialData.role,
        company: testimonialData.company,
        avatarUrl: testimonialData.avatarUrl,
        twitterHandle: testimonialData.twitterHandle,
        twitterUrl: testimonialData.twitterUrl
    }

    testimonials.push(newTestimonial)
    saveTestimonials(productsDir, productId, testimonials)

    return newTestimonial
}

function editTestimonialInProduct(
    productsDir: string,
    productId: string,
    testimonialId: string,
    updates: Partial<Omit<Testimonial, 'id'>>
): Testimonial {
    const testimonials = loadTestimonials(productsDir, productId)
    const testimonialIndex = testimonials.findIndex((t) => t.id === testimonialId)

    if (testimonialIndex === -1) {
        throw new Error(`Testimonial with ID "${testimonialId}" not found`)
    }

    const updatedTestimonial: Testimonial = {
        ...testimonials[testimonialIndex],
        ...updates,
        id: testimonialId // Preserve ID
    }

    testimonials[testimonialIndex] = updatedTestimonial
    saveTestimonials(productsDir, productId, testimonials)

    return updatedTestimonial
}

function removeTestimonialFromProduct(
    productsDir: string,
    productId: string,
    testimonialId: string
): void {
    const testimonials = loadTestimonials(productsDir, productId)
    const filtered = testimonials.filter((t) => t.id !== testimonialId)

    if (filtered.length === testimonials.length) {
        throw new Error(`Testimonial with ID "${testimonialId}" not found`)
    }

    saveTestimonials(productsDir, productId, filtered)
}

function listTestimonialsInProduct(productsDir: string, productId: string): Testimonial[] {
    const testimonials = loadTestimonials(productsDir, productId)
    // Sort by featured (featured first), then by author name
    return testimonials.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        return a.author.localeCompare(b.author)
    })
}

// ============================================================================
// Stats Helper Functions
// ============================================================================

function getStatsPath(productsDir: string, productId: string): string {
    return join(productsDir, `${productId}-stats.json`)
}

export function loadStats(productsDir: string, productId: string): Stats | null {
    const statsPath = getStatsPath(productsDir, productId)
    if (!existsSync(statsPath)) {
        return null
    }

    try {
        const content = readFileSync(statsPath, 'utf-8')
        const fileData = JSON.parse(content)
        const result = StatsFileSchema.safeParse(fileData)

        if (!result.success) {
            throw new Error(`Invalid stats data: ${result.error.message}`)
        }

        return result.data.data
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(
                `Failed to parse stats file for ${productId} (invalid JSON): ${error.message}`
            )
        }
        throw error
    }
}

export function saveStats(productsDir: string, productId: string, stats: Stats): void {
    const statsPath = getStatsPath(productsDir, productId)

    // Wrap in file format and validate
    const fileData = { data: stats }
    const result = StatsFileSchema.safeParse(fileData)
    if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`)
    }

    const json = JSON.stringify(fileData, null, 2)
    writeFileSync(statsPath, json + '\n', 'utf-8')
}

function generateRatingId(source: string): string {
    return `${source}-${Date.now()}`
}

function countTotalRatings(stats: Stats | null): number {
    if (!stats?.ratings) return 0
    return Object.values(stats.ratings).reduce((total, ratings) => total + ratings.length, 0)
}

function formatStatItemDisplay(stat: StatItem | null | undefined, defaultLabel: string): string {
    if (!stat) return ''
    if (typeof stat === 'string') {
        return `${stat} ${colors.dim}(default: "${defaultLabel}")${colors.reset}`
    }
    const label = stat.label ?? defaultLabel
    return `${stat.value} ${colors.dim}(label: "${label}")${colors.reset}`
}

function formatStatsDisplay(stats: Stats | null): string {
    if (!stats) {
        return `${colors.dim}No stats configured${colors.reset}`
    }

    const lines: string[] = []

    if (stats.userCount) {
        const display = formatStatItemDisplay(stats.userCount, 'Users')
        lines.push(`   User Count: ${colors.cyan}${display}`)
    }

    if (stats.timeSaved) {
        const display = formatStatItemDisplay(stats.timeSaved, 'Time Saved')
        lines.push(`   Time Saved: ${colors.cyan}${display}`)
    }

    if (stats.ratings && Object.keys(stats.ratings).length > 0) {
        const totalRatings = countTotalRatings(stats)
        lines.push(`   Ratings: ${colors.cyan}${totalRatings} total${colors.reset}`)

        for (const [source, ratings] of Object.entries(stats.ratings)) {
            if (ratings.length > 0) {
                const avgRating =
                    ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
                lines.push(
                    `     • ${source}: ${ratings.length} ratings (avg: ${avgRating.toFixed(1)})`
                )
            }
        }
    }

    if (stats.additionalStats && stats.additionalStats.length > 0) {
        lines.push(
            `   Additional Stats: ${colors.cyan}${stats.additionalStats.length} items${colors.reset}`
        )
        for (const stat of stats.additionalStats) {
            const linkInfo = stat.link ? ` [${stat.link}]` : ''
            lines.push(`     • ${stat.value} - ${stat.label}${linkInfo}`)
        }
    }

    return lines.length > 0 ? lines.join('\n') : `${colors.dim}No stats data${colors.reset}`
}

function formatRatingsList(stats: Stats | null): string {
    if (!stats?.ratings || Object.keys(stats.ratings).length === 0) {
        return 'No ratings found.'
    }

    const lines: string[] = []

    for (const [source, ratings] of Object.entries(stats.ratings)) {
        lines.push(`\n${colors.bright}${source}${colors.reset} (${ratings.length} ratings):`)

        for (const rating of ratings) {
            const ratingValue = rating.rating !== null ? `${rating.rating}/5` : 'N/A'
            const dateStr = rating.date || 'No date'
            lines.push(`  • ${rating.id}: ${colors.cyan}${ratingValue}${colors.reset} (${dateStr})`)
        }
    }

    return lines.join('\n')
}

function formatFaqList(faqs: FAQ[]): string {
    if (faqs.length === 0) {
        return 'No FAQs found.'
    }

    const rows = faqs.map((faq, index) => {
        const truncatedAnswer =
            faq.answer.length > 60 ? faq.answer.substring(0, 57) + '...' : faq.answer

        return [(index + 1).toString(), faq.id, faq.question, truncatedAnswer]
    })

    const headers = ['#', 'ID', 'Question', 'Answer']
    const columnWidths = headers.map((header, i) =>
        Math.max(header.length, ...rows.map((row) => row[i]?.length || 0))
    )

    const separator = columnWidths.map((width) => '─'.repeat(width + 2)).join('┼')
    const headerRow = headers.map((header, i) => header.padEnd(columnWidths[i])).join(' │ ')

    const dataRows = rows
        .map((row) => row.map((cell, i) => cell.padEnd(columnWidths[i])).join(' │ '))
        .join('\n')

    return `${headerRow}\n${separator}\n${dataRows}`
}

function formatTestimonialList(testimonials: Testimonial[]): string {
    if (testimonials.length === 0) {
        return 'No testimonials found.'
    }

    const rows = testimonials.map((testimonial) => {
        const featuredMark = testimonial.featured ? '⭐' : '  '
        const truncatedQuote =
            testimonial.quote.length > 50
                ? testimonial.quote.substring(0, 47) + '...'
                : testimonial.quote
        const authorInfo =
            testimonial.role || testimonial.company
                ? `${testimonial.role || ''}${testimonial.role && testimonial.company ? ' at ' : ''}${testimonial.company || ''}`
                : ''

        return [featuredMark, testimonial.id, testimonial.author, truncatedQuote, authorInfo]
    })

    const headers = ['★', 'ID', 'Author', 'Quote', 'Info']
    const columnWidths = headers.map((header, i) =>
        Math.max(header.length, ...rows.map((row) => row[i]?.length || 0))
    )

    const separator = columnWidths.map((width) => '─'.repeat(width + 2)).join('┼')
    const headerRow = headers.map((header, i) => header.padEnd(columnWidths[i])).join(' │ ')

    const dataRows = rows
        .map((row) => row.map((cell, i) => cell.padEnd(columnWidths[i])).join(' │ '))
        .join('\n')

    return `${headerRow}\n${separator}\n${dataRows}`
}

// ============================================================================
// Display Functions
// ============================================================================

/**
 * Display welcome banner
 */
function showBanner(): void {
    console.clear()
    console.log(`
${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              📦  PRODUCT MANAGEMENT CLI  📦               ║
║                                                           ║
║         Add, edit, list, and remove products              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
`)
}

/**
 * Show operation header
 */
function showOperationHeader(operation: string, subtitle?: string): void {
    console.log(
        `\n${colors.bright}${colors.blue}▶ ${operation.toUpperCase()}${colors.reset}${subtitle ? ` ${colors.dim}${subtitle}${colors.reset}` : ''}\n`
    )
}

/**
 * Show success message
 */
function showSuccess(message: string): void {
    console.log(`\n${colors.bright}${colors.green}✅ ${message}${colors.reset}`)
}

/**
 * Show error message
 */
function showError(message: string): void {
    console.error(`\n${colors.bright}${colors.red}❌ ${message}${colors.reset}`)
}

/**
 * Show warning message
 */
function showWarning(message: string): void {
    console.log(`\n${colors.bright}${colors.yellow}⚠️  ${message}${colors.reset}`)
}

/**
 * Show info message
 */
function showInfo(message: string): void {
    console.log(`${colors.cyan}ℹ ${message}${colors.reset}`)
}

/**
 * Show section header
 */
function showSectionHeader(section: string): void {
    console.log(`\n${colors.bright}${colors.magenta}═══ ${section} ═══${colors.reset}\n`)
}

/**
 * Show product details summary
 */
function showProductDetails(product: Product): void {
    console.log(`\n${colors.bright}${colors.cyan}📦 Product Details${colors.reset}`)
    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
    console.log(`${colors.bright}ID:${colors.reset} ${colors.cyan}${product.id}${colors.reset}`)
    console.log(`${colors.bright}Name:${colors.reset} ${product.name}`)
    console.log(`${colors.bright}Tagline:${colors.reset} ${product.tagline}`)
    if (product.secondaryTagline) {
        console.log(`${colors.bright}Secondary Tagline:${colors.reset} ${product.secondaryTagline}`)
    }
    console.log(
        `${colors.bright}Price:${colors.reset} ${product.priceDisplay} ${colors.dim}(${product.priceTier})${colors.reset}`
    )
    console.log(
        `${colors.bright}Main Category:${colors.reset} ${product.mainCategory} ${colors.dim}(${loadCategories().find((c) => c.id === product.mainCategory)?.name})${colors.reset}`
    )
    if (product.secondaryCategories.length > 0) {
        console.log(
            `${colors.bright}Secondary Categories:${colors.reset} ${product.secondaryCategories
                .map((c) => `${c.id}${c.distant ? ' (distant)' : ''}`)
                .join(', ')}`
        )
    }
    console.log(
        `${colors.bright}Tags:${colors.reset} ${colors.dim}(${product.tags.length})${colors.reset} ${product.tags.join(', ')}`
    )
    console.log(`${colors.bright}Priority:${colors.reset} ${product.priority || 0}`)
    console.log(
        `${colors.bright}Featured:${colors.reset} ${product.featured ? `${colors.yellow}Yes ★${colors.reset}` : 'No'}`
    )
    console.log(`${colors.bright}Best Value:${colors.reset} ${product.bestValue ? 'Yes' : 'No'}`)
    console.log(`${colors.bright}Bestseller:${colors.reset} ${product.bestseller ? 'Yes' : 'No'}`)
    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
}

/**
 * Track changes to a product
 */
interface ProductChange {
    field: string
    oldValue: unknown
    newValue: unknown
}

const changes: ProductChange[] = []

function trackChange(field: string, oldValue: unknown, newValue: unknown): void {
    // Remove existing change for this field if any
    const existingIndex = changes.findIndex((c) => c.field === field)
    if (existingIndex >= 0) {
        changes.splice(existingIndex, 1)
    }
    // Add new change
    changes.push({ field, oldValue, newValue })
}

function showChanges(): void {
    if (changes.length === 0) {
        showInfo('No changes made yet')
        return
    }

    console.log(
        `\n${colors.bright}${colors.yellow}📝 Changes Summary (${changes.length})${colors.reset}`
    )
    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)

    for (const change of changes) {
        const oldStr =
            typeof change.oldValue === 'object'
                ? JSON.stringify(change.oldValue)
                : String(change.oldValue)
        const newStr =
            typeof change.newValue === 'object'
                ? JSON.stringify(change.newValue)
                : String(change.newValue)

        console.log(`${colors.bright}${change.field}:${colors.reset}`)
        console.log(`  ${colors.red}− ${oldStr}${colors.reset}`)
        console.log(`  ${colors.green}+ ${newStr}${colors.reset}`)
    }
    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
}

function clearChanges(): void {
    changes.length = 0
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse CLI arguments
 */
function parseArgs(): CliArgs {
    const args: CliArgs = {}
    const processArgs = process.argv.slice(2)

    for (let i = 0; i < processArgs.length; i++) {
        const arg = processArgs[i]
        const nextArg = processArgs[i + 1]

        if (arg === '--force') {
            args.force = true
            continue
        }

        if (arg === '--featured' && (!nextArg || nextArg.startsWith('--'))) {
            args.featured_filter = true
            continue
        }

        if (arg.startsWith('--') && nextArg && !nextArg.startsWith('--')) {
            const key = arg.slice(2) as keyof CliArgs
            args[key] = nextArg as never
            i++
        }
    }

    return args
}

/**
 * Load all products from individual files
 */
function loadAllProducts(): Product[] {
    const products: Product[] = []
    const files = readdirSync(PRODUCTS_DIR).filter(
        (f) =>
            f.endsWith('.json') &&
            !f.endsWith('-faq.json') &&
            !f.endsWith('-testimonials.json') &&
            !f.endsWith('-media.json') &&
            !f.endsWith('-stats.json') &&
            !f.includes('-sales-copy-')
    )

    for (const file of files) {
        const filePath = resolve(PRODUCTS_DIR, file)
        const content = readFileSync(filePath, 'utf-8')
        const product = JSON.parse(content) as Product
        products.push(product)
    }

    return products.sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

/**
 * Load a single product by ID
 */
function loadProduct(id: string): Product | null {
    const filePath = resolve(PRODUCTS_DIR, `${id}.json`)
    if (!existsSync(filePath)) {
        return null
    }
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as Product
}

/**
 * Save a product to its individual file
 */
function saveProduct(product: Product): void {
    const filePath = resolve(PRODUCTS_DIR, `${product.id}.json`)
    writeFileSync(filePath, JSON.stringify(product, null, 4) + '\n', 'utf-8')
}

/**
 * Remove a product file
 */
function removeProduct(id: string): void {
    const filePath = resolve(PRODUCTS_DIR, `${id}.json`)
    if (existsSync(filePath)) {
        unlinkSync(filePath)
    }
}

/**
 * Load tags
 */
function loadTags(): TagsMap {
    const content = readFileSync(TAGS_FILE, 'utf-8')
    const tags = JSON.parse(content)
    const result = TagsMapSchema.safeParse(tags)
    if (!result.success) {
        console.error('❌ Tags validation failed:', result.error.format())
        process.exit(1)
    }
    return result.data
}

/**
 * Load categories
 */
function loadCategories(): Category[] {
    const content = readFileSync(CATEGORIES_FILE, 'utf-8')
    const categories = JSON.parse(content)
    const result = CategoriesArraySchema.safeParse(categories)
    if (!result.success) {
        console.error('❌ Categories validation failed:', result.error.format())
        process.exit(1)
    }
    return result.data.sort((a, b) => a.priority - b.priority)
}

/**
 * Validate a product against the schema
 */
function validateProduct(product: Product): { success: boolean; errors: string[] } {
    const result = IndividualProductSchema.safeParse(product)
    if (result.success) {
        return { success: true, errors: [] }
    }

    const errors = result.error.issues.map((issue) => {
        const path = issue.path.join('.')
        return `  • ${path}: ${issue.message}`
    })

    return { success: false, errors }
}

/**
 * Check if a product is referenced by other products
 */
function checkCrossReferences(productId: string): ProductReference[] {
    const references: ProductReference[] = []
    const products = loadAllProducts()

    for (const product of products) {
        if (product.id === productId) continue

        if (product.crossSellIds?.includes(productId)) {
            references.push({
                productId: product.id,
                productName: product.name,
                referenceType: 'crossSell'
            })
        }
    }

    return references
}

/**
 * Convert string to kebab-case for ID generation
 */
function toKebabCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

/**
 * Prompt for input using readline
 */
function prompt(question: string): Promise<string> {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close()
            resolve(answer.trim())
        })
    })
}

/**
 * Prompt for confirmation
 */
async function confirm(message: string): Promise<boolean> {
    const answer = await prompt(`${message} [yes/no]: `)
    return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y'
}

// ============================================================================
// Inquirer Selection Functions
// ============================================================================

/**
 * Select main category using inquirer (single choice)
 */
async function selectMainCategory(current?: string): Promise<string> {
    const categories = loadCategories()

    const choices = categories.map((cat) => ({
        name: `${cat.name} (${cat.id})${cat.featured ? ' ★' : ''}`,
        value: cat.id
    }))

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'category',
            message: 'Select main category:',
            choices,
            default: current,
            pageSize: 15
        }
    ])

    return answer.category
}

/**
 * Select tags using inquirer (multi-select with validation)
 */
async function selectTags(current: string[] = []): Promise<string[]> {
    const tags = loadTags()
    const tagArray = Object.values(tags).sort((a, b) => a.priority - b.priority)

    const choices = tagArray.map((tag) => ({
        name: `${tag.name} (${tag.id})${tag.featured ? ' ★' : ''}`,
        value: tag.id,
        checked: current.includes(tag.id)
    }))

    const answer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'tags',
            message: 'Select tags (space to toggle, enter to confirm):',
            choices,
            pageSize: 20,
            validate: (input: string[]) => {
                if (input.length === 0) {
                    return 'Please select at least one tag'
                }
                return true
            }
        }
    ])

    return answer.tags
}

/**
 * Select secondary categories with distant flag (two-step process)
 */
async function selectSecondaryCategories(
    current: SecondaryCategory[] = []
): Promise<SecondaryCategory[]> {
    const categories = loadCategories()
    const currentIds = current.map((c) => c.id)

    // Step 1: Select which categories
    const choices = categories.map((cat) => ({
        name: `${cat.name} (${cat.id})${cat.featured ? ' ★' : ''}`,
        value: cat.id,
        checked: currentIds.includes(cat.id)
    }))

    const selectedAnswer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'categories',
            message: 'Select secondary categories (optional):',
            choices,
            pageSize: 15
        }
    ])

    if (selectedAnswer.categories.length === 0) {
        return []
    }

    // Step 2: Mark which ones are "distant"
    const distantChoices = selectedAnswer.categories.map((id: string) => {
        const existingItem = current.find((c) => c.id === id)
        const category = categories.find((c) => c.id === id)
        return {
            name: category?.name || id,
            value: id,
            checked: existingItem?.distant === true
        }
    })

    const distantAnswer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'distant',
            message: 'Mark which categories are "distant" (loosely related):',
            choices: distantChoices
        }
    ])

    return selectedAnswer.categories.map((id: string) => ({
        id,
        distant: distantAnswer.distant.includes(id)
    }))
}

/**
 * Select a product from list with enhanced display
 */
async function selectProduct(message: string): Promise<string> {
    const products = loadAllProducts()

    const choices = products.map((p) => {
        const featuredMark = p.featured ? ' ★' : ''
        const price = p.priceDisplay || `€${p.price}`
        return {
            name: `${p.name}${featuredMark} ${colors.dim}(${p.id} • ${price})${colors.reset}`,
            value: p.id,
            description: `${p.tagline} • ${p.mainCategory}`
        }
    })

    const answer = await select({
        message,
        choices,
        pageSize: 15
    })

    return answer
}

/**
 * Select price tier
 */
async function selectPriceTier(current?: string): Promise<string> {
    const choices = [
        { name: 'Free', value: 'free' },
        { name: 'Budget', value: 'budget' },
        { name: 'Standard', value: 'standard' },
        { name: 'Premium', value: 'premium' },
        { name: 'Enterprise', value: 'enterprise' },
        { name: 'Subscription', value: 'subscription' }
    ]

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'tier',
            message: 'Select price tier:',
            choices,
            default: current
        }
    ])

    return answer.tier
}
// ============================================================================
// Operation: List
// ============================================================================

async function operationList(args: CliArgs): Promise<void> {
    showOperationHeader('List Products')

    let products = loadAllProducts()

    // Apply filters (check both _filter and direct versions for compatibility)
    if (args.featured_filter) {
        products = products.filter((p) => p.featured === true)
        showInfo('Filter: Featured products only')
    }
    const categoryFilter = args.category_filter || (args as Record<string, unknown>).category
    if (typeof categoryFilter === 'string') {
        products = products.filter((p) => p.mainCategory === categoryFilter)
        showInfo(`Filter: Category = ${categoryFilter}`)
    }
    const tagFilter = args.tag_filter || (args as Record<string, unknown>).tag
    if (typeof tagFilter === 'string') {
        products = products.filter((p) => p.tags.includes(tagFilter as TagId))
        showInfo(`Filter: Tag = ${tagFilter}`)
    }

    const format = args.format || 'table'

    if (format === 'json') {
        console.log(JSON.stringify(products, null, 2))
        return
    }

    if (format === 'detailed') {
        console.log(`\n${colors.bright}📦 Products (${products.length} total)${colors.reset}\n`)
        for (const product of products) {
            console.log(
                `${colors.bright}ID:${colors.reset} ${colors.cyan}${product.id}${colors.reset}`
            )
            console.log(`${colors.bright}Name:${colors.reset} ${product.name}`)
            console.log(`${colors.bright}Tagline:${colors.reset} ${product.tagline}`)
            console.log(
                `${colors.bright}Price:${colors.reset} ${product.priceDisplay} ${colors.dim}(${product.priceTier})${colors.reset}`
            )
            console.log(`${colors.bright}Main Category:${colors.reset} ${product.mainCategory}`)
            console.log(`${colors.bright}Tags:${colors.reset} ${product.tags.join(', ')}`)
            console.log(`${colors.bright}Priority:${colors.reset} ${product.priority || 0}`)
            console.log(`${colors.bright}Featured:${colors.reset} ${product.featured ? '✓' : '✗'}`)
            console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`)
        }
        return
    }

    // Table format (default)
    console.log(`\n${colors.bright}📦 Products (${products.length} total)${colors.reset}\n`)
    console.log(
        `${colors.bright}${'ID'.padEnd(28)}${'Name'.padEnd(32)}${'Category'.padEnd(22)}${'Priority'.padEnd(10)}${'Featured'}${colors.reset}`
    )
    console.log(`${colors.dim}${'─'.repeat(100)}${colors.reset}`)

    for (const product of products) {
        const id = product.id.padEnd(28)
        const name = (
            product.name.length > 30 ? product.name.slice(0, 27) + '...' : product.name
        ).padEnd(32)
        const category = product.mainCategory.padEnd(22)
        const priority = String(product.priority || 0).padEnd(10)
        const featured = product.featured ? `${colors.yellow}★${colors.reset}` : ' '

        console.log(`${colors.cyan}${id}${colors.reset}${name}${category}${priority}${featured}`)
    }
}

// ============================================================================
// Operation: Add
// ============================================================================

async function operationAdd(args: CliArgs): Promise<void> {
    showOperationHeader('Add Product', 'Create a new product')

    // Basic Information
    showSectionHeader('STEP 1/5: Basic Information')

    const name =
        args.name || (await prompt(`${colors.bright}Product Name${colors.reset} (required): `))
    if (!name) {
        showError('Product name is required')
        throw new Error('Product name is required')
    }

    const suggestedId = toKebabCase(name)
    const id =
        args.id ||
        (await prompt(
            `${colors.bright}Product ID${colors.reset} [${colors.cyan}${suggestedId}${colors.reset}]: `
        )) ||
        suggestedId

    // Check if ID already exists
    if (loadProduct(id)) {
        showError(`Product with ID "${id}" already exists`)
        throw new Error(`Product with ID "${id}" already exists`)
    }

    const tagline =
        args.tagline || (await prompt(`${colors.bright}Tagline${colors.reset} (required): `))
    if (!tagline) {
        showError('Tagline is required')
        throw new Error('Tagline is required')
    }

    const secondaryTagline =
        args.secondaryTagline ||
        (await prompt(`${colors.bright}Secondary Tagline${colors.reset} (optional): `)) ||
        undefined

    // Pricing
    showSectionHeader('STEP 2/5: Pricing')

    const priceStr =
        args.price || (await prompt(`${colors.bright}Price in EUR${colors.reset} (required): `))
    const price = parseFloat(priceStr)
    if (isNaN(price)) {
        showError('Invalid price')
        throw new Error('Invalid price')
    }

    const priceDisplay =
        args.priceDisplay ||
        (await prompt(
            `${colors.bright}Price Display${colors.reset} [${colors.cyan}€${price.toFixed(2)}${colors.reset}]: `
        )) ||
        `€${price.toFixed(2)}`

    const priceTier = args.priceTier || (await selectPriceTier())

    const gumroadUrl =
        args.gumroadUrl || (await prompt(`${colors.bright}Gumroad URL${colors.reset} (required): `))

    // Taxonomy
    showSectionHeader('STEP 3/5: Taxonomy')

    const mainCategory = args.mainCategory || (await selectMainCategory())

    const tags = args.tags ? args.tags.split(',').map((t) => t.trim()) : await selectTags()

    const secondaryCategories = args.secondaryCategories
        ? parseSecondaryCategories(args.secondaryCategories)
        : await selectSecondaryCategories()

    // Marketing Copy
    showSectionHeader('STEP 4/5: Marketing Copy')

    const problem =
        args.problem ||
        (await prompt(`${colors.bright}Problem Description${colors.reset} (required): `))
    if (!problem) {
        showError('Problem description is required')
        throw new Error('Problem description is required')
    }

    const agitate =
        args.agitate ||
        (await prompt(`${colors.bright}Agitation Description${colors.reset} (required): `))
    if (!agitate) {
        showError('Agitation description is required')
        throw new Error('Agitation description is required')
    }

    const solution =
        args.solution ||
        (await prompt(`${colors.bright}Solution Description${colors.reset} (required): `))
    if (!solution) {
        showError('Solution description is required')
        throw new Error('Solution description is required')
    }

    // Priority
    const priorityStr =
        args.priority ||
        (await prompt(`${colors.bright}Priority${colors.reset} (0-100, default 50): `)) ||
        '50'
    const priority = parseInt(priorityStr)

    const featuredStr =
        args.featured ||
        (await prompt(`${colors.bright}Featured?${colors.reset} [yes/no, default no]: `)) ||
        'no'
    const featured = featuredStr.toLowerCase() === 'yes' || featuredStr.toLowerCase() === 'true'

    // Review & Confirm
    showSectionHeader('STEP 5/5: Review')
    console.log(`${colors.bright}${colors.blue}📊 New Product Summary:${colors.reset}`)
    console.log(`   ${colors.bright}ID:${colors.reset} ${colors.cyan}${id}${colors.reset}`)
    console.log(`   ${colors.bright}Name:${colors.reset} ${name}`)
    console.log(`   ${colors.bright}Tagline:${colors.reset} ${tagline}`)
    console.log(
        `   ${colors.bright}Price:${colors.reset} ${priceDisplay} ${colors.dim}(${priceTier})${colors.reset}`
    )
    console.log(`   ${colors.bright}Main Category:${colors.reset} ${mainCategory}`)
    console.log(
        `   ${colors.bright}Secondary Categories:${colors.reset} ${secondaryCategories.length}`
    )
    console.log(
        `   ${colors.bright}Tags:${colors.reset} ${tags.length} ${colors.dim}(${tags.join(', ')})${colors.reset}`
    )
    console.log(`   ${colors.bright}Priority:${colors.reset} ${priority}`)
    console.log(`   ${colors.bright}Featured:${colors.reset} ${featured}`)
    console.log()

    const confirmed = await confirm(`${colors.yellow}Confirm and save?${colors.reset}`)
    if (!confirmed) {
        showWarning('Operation cancelled')
        throw new Error('Operation cancelled by user')
    }

    // Validate enum types
    const validatedPriceTier = PriceTierSchema.parse(priceTier)
    const validatedMainCategory = ProductCategorySchema.parse(mainCategory)
    const validatedTags = tags.map((tag) => TagIdSchema.parse(tag))
    const validatedSecondaryCategories: SecondaryCategory[] = secondaryCategories.map((cat) => ({
        id: ProductCategorySchema.parse(cat.id),
        distant: cat.distant
    }))

    // Create minimal product
    const product: Product = {
        id,
        name,
        tagline,
        secondaryTagline,
        price,
        priceDisplay,
        priceTier: validatedPriceTier,
        gumroadUrl,
        mainCategory: validatedMainCategory,
        secondaryCategories: validatedSecondaryCategories,
        tags: validatedTags,
        problem,
        problemPoints: ['Placeholder - edit this product file to add real problem points'],
        agitate,
        agitatePoints: ['Placeholder - edit this product file to add real agitate points'],
        solution,
        solutionPoints: ['Placeholder - edit this product file to add real solution points'],
        description: '',
        features: ['Placeholder - edit this product file to add real features'],
        benefits: {
            immediate: ['Placeholder - edit this product file'],
            systematic: [],
            longTerm: []
        },
        included: ['Placeholder - edit this product file to add real included items'],
        targetAudience: [],
        perfectFor: [],
        notForYou: [],
        faqIds: [],
        testimonialIds: [],
        crossSellIds: [],
        featured,
        bestValue: false,
        bestseller: false,
        priority,
        trustBadges: [],
        guarantees: []
    }

    // Validate
    const validation = validateProduct(product)
    if (!validation.success) {
        showError('Product validation failed:')
        validation.errors.forEach((err) => console.error(`  ${err}`))
        throw new Error('Product validation failed')
    }

    // Save
    saveProduct(product)
    showSuccess(`Product created at: src/data/products/${id}.json`)
    console.log(
        `\n${colors.bright}${colors.yellow}⚠️  Important:${colors.reset} ${colors.yellow}This product contains placeholder values that must be edited!${colors.reset}`
    )
    console.log(`\n${colors.bright}${colors.cyan}📋 Next steps:${colors.reset}`)
    console.log(
        `  ${colors.dim}1.${colors.reset} ${colors.yellow}Edit the product file${colors.reset} to replace all placeholder text in:`
    )
    console.log(`     - problemPoints, agitatePoints, solutionPoints`)
    console.log(`     - features, benefits, included`)
    console.log(
        `  ${colors.dim}2.${colors.reset} Run: ${colors.green}npm run validate:products${colors.reset}`
    )
    console.log(
        `  ${colors.dim}3.${colors.reset} Add marketing copy details by editing the file directly`
    )
    console.log(`  ${colors.dim}4.${colors.reset} Add media (cover images, screenshots, ...)`)
    console.log(
        `  ${colors.dim}5.${colors.reset} Test locally: ${colors.green}npm run dev${colors.reset}`
    )
}

/**
 * Parse secondary categories from CLI format "id:distant,id:distant"
 */
function parseSecondaryCategories(input: string): SecondaryCategory[] {
    return input
        .split(',')
        .map((pair) => {
            const [id, distantStr] = pair.split(':')
            return {
                id: id.trim(),
                distant: distantStr?.trim() === 'true'
            }
        })
        .filter((cat) => cat.id)
}

// ============================================================================
// Operation: Edit
// ============================================================================

async function operationEdit(args: CliArgs): Promise<void> {
    showOperationHeader('Edit Product', 'Modify an existing product')

    const productId = args.id || (await selectProduct('Select product to edit:'))
    const originalProduct = loadProduct(productId)

    if (!originalProduct) {
        showError(`Product not found: ${productId}`)
        throw new Error(`Product not found: ${productId}`)
    }

    // Create a working copy
    const product = JSON.parse(JSON.stringify(originalProduct)) as Product
    clearChanges()

    console.log(
        `\n${colors.bright}${colors.blue}Editing:${colors.reset} ${product.name} ${colors.dim}(${product.id})${colors.reset}`
    )

    // Apply CLI argument updates
    if (args.name) {
        trackChange('name', product.name, args.name)
        product.name = args.name
    }
    if (args.tagline) {
        trackChange('tagline', product.tagline, args.tagline)
        product.tagline = args.tagline
    }
    if (args.secondaryTagline !== undefined) {
        trackChange('secondaryTagline', product.secondaryTagline, args.secondaryTagline)
        product.secondaryTagline = args.secondaryTagline || undefined
    }
    if (args.price) {
        const newPrice = parseFloat(args.price)
        trackChange('price', product.price, newPrice)
        product.price = newPrice
    }
    if (args.priceDisplay) {
        trackChange('priceDisplay', product.priceDisplay, args.priceDisplay)
        product.priceDisplay = args.priceDisplay
    }
    if (args.priceTier) {
        const newTier = PriceTierSchema.parse(args.priceTier)
        trackChange('priceTier', product.priceTier, newTier)
        product.priceTier = newTier
    }
    if (args.gumroadUrl) {
        trackChange('gumroadUrl', product.gumroadUrl, args.gumroadUrl)
        product.gumroadUrl = args.gumroadUrl
    }
    if (args.mainCategory) {
        const newCategory = ProductCategorySchema.parse(args.mainCategory)
        trackChange('mainCategory', product.mainCategory, newCategory)
        product.mainCategory = newCategory
    }
    if (args.tags) {
        const tagArray = args.tags.split(',').map((t) => t.trim())
        const newTags = tagArray.map((tag) => TagIdSchema.parse(tag))
        trackChange('tags', product.tags, newTags)
        product.tags = newTags
    }
    if (args.secondaryCategories) {
        const parsedCategories = parseSecondaryCategories(args.secondaryCategories)
        const newSecondaryCategories = parsedCategories.map((cat) => ({
            id: ProductCategorySchema.parse(cat.id),
            distant: cat.distant
        }))
        trackChange('secondaryCategories', product.secondaryCategories, newSecondaryCategories)
        product.secondaryCategories = newSecondaryCategories
    }
    if (args.featured !== undefined) {
        const newFeatured = args.featured === 'true'
        trackChange('featured', product.featured, newFeatured)
        product.featured = newFeatured
    }
    if (args.priority) {
        const newPriority = parseInt(args.priority)
        trackChange('priority', product.priority, newPriority)
        product.priority = newPriority
    }
    if (args.problem) {
        trackChange('problem', product.problem, args.problem)
        product.problem = args.problem
    }
    if (args.agitate) {
        trackChange('agitate', product.agitate, args.agitate)
        product.agitate = args.agitate
    }
    if (args.solution) {
        trackChange('solution', product.solution, args.solution)
        product.solution = args.solution
    }

    // If no CLI args, use interactive mode with enhanced menu
    if (!hasAnyEditArgs(args)) {
        let editing = true

        while (editing) {
            console.clear()
            showOperationHeader('Edit Product', 'Multi-field editor')
            showProductDetails(product)

            if (changes.length > 0) {
                showChanges()
            }

            const action = await select({
                message: 'What would you like to do?',
                choices: [
                    { name: '📝 Edit Basic Info', value: 'basic' },
                    { name: '💰 Edit Pricing', value: 'pricing' },
                    { name: '🏷️ Edit Taxonomy', value: 'taxonomy' },
                    { name: '⚙️ Edit Meta/Status', value: 'meta' },
                    { name: '🖼️ Manage Media', value: 'media' },
                    { name: '📝 Manage Content (FAQs & Testimonials)', value: 'content' },
                    { name: '💬 Manage Sales Copy', value: 'sales-copy' },
                    { name: '🔍 View Current Details', value: 'view' },
                    { name: '📊 View Changes Summary', value: 'changes' },
                    { name: '💾 Save and Exit', value: 'save' },
                    { name: '❌ Cancel (Discard Changes)', value: 'cancel' }
                ],
                pageSize: 14
            })

            switch (action) {
                case 'basic':
                    await editBasicInfo(product)
                    break
                case 'pricing':
                    await editPricing(product)
                    break
                case 'taxonomy':
                    await editTaxonomy(product)
                    break
                case 'meta':
                    await editMeta(product)
                    break
                case 'media':
                    await manageProductMedia(product)
                    break
                case 'content':
                    await manageProductContent(product)
                    break
                case 'sales-copy':
                    await manageProductSalesCopy(product)
                    break
                case 'view':
                    showProductDetails(product)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                case 'changes':
                    showChanges()
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                case 'save':
                    editing = false
                    break
                case 'cancel': {
                    const confirmCancel = await confirm(
                        `${colors.red}Discard all changes?${colors.reset}`
                    )
                    if (confirmCancel) {
                        showWarning('Changes discarded')
                        throw new Error('Edit cancelled by user')
                    }
                    break
                }
            }
        }
    }

    // Show final summary of changes
    if (changes.length > 0) {
        console.clear()
        showOperationHeader('Save Changes', 'Review and confirm')
        showChanges()

        const confirmSave = await confirm(`${colors.yellow}Save these changes?${colors.reset}`)
        if (!confirmSave) {
            showWarning('Changes discarded')
            throw new Error('Save cancelled by user')
        }
    } else if (!hasAnyEditArgs(args)) {
        showInfo('No changes made')
        return
    }

    // Validate
    const validation = validateProduct(product)
    if (!validation.success) {
        showError('Product validation failed:')
        validation.errors.forEach((err) => console.error(`  ${err}`))
        throw new Error('Product validation failed')
    }

    // Save
    saveProduct(product)
    clearChanges()
    showSuccess(`Product updated: src/data/products/${product.id}.json`)

    const runValidation = await confirm(`${colors.cyan}Run validation?${colors.reset}`)
    if (runValidation) {
        console.log(`\n${colors.bright}${colors.blue}→ Running validation...${colors.reset}\n`)
        const { spawnSync } = await import('child_process')
        const result = spawnSync('npm', ['run', 'validate:products'], { stdio: 'inherit' })
        if (result.status !== 0) {
            throw new Error('Validation failed')
        }
    }
}

/**
 * Edit basic information
 */
async function editBasicInfo(product: Product): Promise<void> {
    const field = await select({
        message: 'Which field do you want to edit?',
        choices: [
            {
                name: `Name: ${colors.cyan}${product.name}${colors.reset}`,
                value: 'name'
            },
            {
                name: `Tagline: ${colors.cyan}${product.tagline}${colors.reset}`,
                value: 'tagline'
            },
            {
                name: `Secondary Tagline: ${colors.cyan}${product.secondaryTagline || '(none)'}${colors.reset}`,
                value: 'secondaryTagline'
            },
            { name: '← Back', value: 'back' }
        ]
    })

    if (field === 'back') return

    switch (field) {
        case 'name': {
            const oldValue = product.name
            const newValue = await prompt(
                `${colors.bright}Name${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (newValue && newValue !== oldValue) {
                trackChange('name', oldValue, newValue)
                product.name = newValue
                showSuccess('Name updated')
            }
            break
        }
        case 'tagline': {
            const oldValue = product.tagline
            const newValue = await prompt(
                `${colors.bright}Tagline${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (newValue && newValue !== oldValue) {
                trackChange('tagline', oldValue, newValue)
                product.tagline = newValue
                showSuccess('Tagline updated')
            }
            break
        }
        case 'secondaryTagline': {
            const oldValue = product.secondaryTagline
            const newValue = await prompt(
                `${colors.bright}Secondary Tagline${colors.reset} [${colors.cyan}${oldValue || '(none)'}${colors.reset}]: `
            )
            if (newValue !== oldValue) {
                trackChange('secondaryTagline', oldValue, newValue || undefined)
                product.secondaryTagline = newValue || undefined
                showSuccess('Secondary tagline updated')
            }
            break
        }
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Edit pricing information
 */
async function editPricing(product: Product): Promise<void> {
    const field = await select({
        message: 'Which field do you want to edit?',
        choices: [
            {
                name: `Price: ${colors.cyan}€${product.price}${colors.reset}`,
                value: 'price'
            },
            {
                name: `Price Display: ${colors.cyan}${product.priceDisplay}${colors.reset}`,
                value: 'priceDisplay'
            },
            {
                name: `Price Tier: ${colors.cyan}${product.priceTier}${colors.reset}`,
                value: 'priceTier'
            },
            {
                name: `Gumroad URL: ${colors.cyan}${product.gumroadUrl}${colors.reset}`,
                value: 'gumroadUrl'
            },
            { name: '← Back', value: 'back' }
        ]
    })

    if (field === 'back') return

    switch (field) {
        case 'price': {
            const oldValue = product.price
            const input = await prompt(
                `${colors.bright}Price (EUR)${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (input) {
                const newValue = parseFloat(input)
                if (!isNaN(newValue) && newValue !== oldValue) {
                    trackChange('price', oldValue, newValue)
                    product.price = newValue
                    showSuccess('Price updated')
                }
            }
            break
        }
        case 'priceDisplay': {
            const oldValue = product.priceDisplay
            const newValue = await prompt(
                `${colors.bright}Price Display${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (newValue && newValue !== oldValue) {
                trackChange('priceDisplay', oldValue, newValue)
                product.priceDisplay = newValue
                showSuccess('Price display updated')
            }
            break
        }
        case 'priceTier': {
            const oldValue = product.priceTier
            const newValue = await selectPriceTier(oldValue)
            if (newValue !== oldValue) {
                trackChange('priceTier', oldValue, newValue)
                product.priceTier = PriceTierSchema.parse(newValue)
                showSuccess('Price tier updated')
            }
            break
        }
        case 'gumroadUrl': {
            const oldValue = product.gumroadUrl
            const newValue = await prompt(
                `${colors.bright}Gumroad URL${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (newValue && newValue !== oldValue) {
                trackChange('gumroadUrl', oldValue, newValue)
                product.gumroadUrl = newValue
                showSuccess('Gumroad URL updated')
            }
            break
        }
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Edit taxonomy (categories and tags)
 */
async function editTaxonomy(product: Product): Promise<void> {
    const field = await select({
        message: 'Which field do you want to edit?',
        choices: [
            {
                name: `Main Category: ${colors.cyan}${product.mainCategory}${colors.reset}`,
                value: 'mainCategory'
            },
            {
                name: `Tags: ${colors.cyan}${product.tags.length} tags${colors.reset} ${colors.dim}(${product.tags.join(', ')})${colors.reset}`,
                value: 'tags'
            },
            {
                name: `Secondary Categories: ${colors.cyan}${product.secondaryCategories.length} categories${colors.reset}`,
                value: 'secondaryCategories'
            },
            { name: '← Back', value: 'back' }
        ]
    })

    if (field === 'back') return

    switch (field) {
        case 'mainCategory': {
            const oldValue = product.mainCategory
            const newValue = await selectMainCategory(oldValue)
            if (newValue !== oldValue) {
                trackChange('mainCategory', oldValue, newValue)
                product.mainCategory = ProductCategorySchema.parse(newValue)
                showSuccess('Main category updated')
            }
            break
        }
        case 'tags': {
            const oldValue = product.tags
            const newValue = await selectTags(oldValue)
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                trackChange('tags', oldValue, newValue)
                product.tags = newValue.map((tag) => TagIdSchema.parse(tag))
                showSuccess('Tags updated')
            }
            break
        }
        case 'secondaryCategories': {
            const oldValue = product.secondaryCategories
            const newValue = await selectSecondaryCategories(oldValue)
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                trackChange('secondaryCategories', oldValue, newValue)
                product.secondaryCategories = newValue.map((cat) => ({
                    id: ProductCategorySchema.parse(cat.id),
                    distant: cat.distant
                }))
                showSuccess('Secondary categories updated')
            }
            break
        }
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Edit meta information
 */
async function editMeta(product: Product): Promise<void> {
    const field = await select({
        message: 'Which field do you want to edit?',
        choices: [
            {
                name: `Priority: ${colors.cyan}${product.priority || 0}${colors.reset}`,
                value: 'priority'
            },
            {
                name: `Featured: ${product.featured ? `${colors.yellow}Yes ★${colors.reset}` : `${colors.dim}No${colors.reset}`}`,
                value: 'featured'
            },
            {
                name: `Best Value: ${product.bestValue ? `${colors.green}Yes${colors.reset}` : `${colors.dim}No${colors.reset}`}`,
                value: 'bestValue'
            },
            {
                name: `Bestseller: ${product.bestseller ? `${colors.green}Yes${colors.reset}` : `${colors.dim}No${colors.reset}`}`,
                value: 'bestseller'
            },
            { name: '← Back', value: 'back' }
        ]
    })

    if (field === 'back') return

    switch (field) {
        case 'priority': {
            const oldValue = product.priority || 0
            const input = await prompt(
                `${colors.bright}Priority (0-100)${colors.reset} [${colors.cyan}${oldValue}${colors.reset}]: `
            )
            if (input) {
                const newValue = parseInt(input)
                if (!isNaN(newValue) && newValue !== oldValue) {
                    trackChange('priority', oldValue, newValue)
                    product.priority = newValue
                    showSuccess('Priority updated')
                }
            }
            break
        }
        case 'featured': {
            const oldValue = product.featured
            const newValue = await confirm(
                `${colors.bright}Featured?${colors.reset} [current: ${oldValue ? 'yes' : 'no'}]`
            )
            if (newValue !== oldValue) {
                trackChange('featured', oldValue, newValue)
                product.featured = newValue
                showSuccess('Featured status updated')
            }
            break
        }
        case 'bestValue': {
            const oldValue = product.bestValue
            const newValue = await confirm(
                `${colors.bright}Best Value?${colors.reset} [current: ${oldValue ? 'yes' : 'no'}]`
            )
            if (newValue !== oldValue) {
                trackChange('bestValue', oldValue, newValue)
                product.bestValue = newValue
                showSuccess('Best Value status updated')
            }
            break
        }
        case 'bestseller': {
            const oldValue = product.bestseller
            const newValue = await confirm(
                `${colors.bright}Bestseller?${colors.reset} [current: ${oldValue ? 'yes' : 'no'}]`
            )
            if (newValue !== oldValue) {
                trackChange('bestseller', oldValue, newValue)
                product.bestseller = newValue
                showSuccess('Bestseller status updated')
            }
            break
        }
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Manage product media (interactive submenu)
 */
async function manageProductMedia(product: Product): Promise<void> {
    let managing = true

    while (managing) {
        const mediaCount = listMediaInProduct(PRODUCTS_DIR, product.id).length

        const action = await select({
            message: `Media Management (${mediaCount} total):`,
            choices: [
                { name: `📋 List all media (${mediaCount} items)`, value: 'list' },
                { name: '➕ Add new media', value: 'add' },
                { name: '✏️ Edit media item', value: 'edit' },
                { name: '🗑️ Remove media item', value: 'remove' },
                { name: '🔄 Reorder media item', value: 'reorder' },
                { name: '← Back to edit menu', value: 'back' }
            ],
            pageSize: 10
        })

        if (action === 'back') {
            managing = false
            continue
        }

        try {
            switch (action) {
                case 'list': {
                    const mediaItems = listMediaInProduct(PRODUCTS_DIR, product.id)
                    console.log(
                        `\n📦 Media for product: ${product.name} ${colors.dim}(${product.id})${colors.reset}`
                    )
                    console.log(`   Total: ${mediaItems.length} item(s)\n`)

                    if (mediaItems.length > 0) {
                        console.log(formatMediaList(mediaItems))
                    } else {
                        console.log(colors.dim + '   No media items found' + colors.reset)
                    }
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'add': {
                    const type = (await select({
                        message: 'Media type:',
                        choices: [
                            { name: '🖼️  Image', value: 'image' },
                            { name: '🎥 Video (YouTube)', value: 'video' }
                        ]
                    })) as MediaType

                    const group = (await select({
                        message: 'Media group:',
                        choices: [
                            { name: '🖼️  Cover (product card thumbnails)', value: 'cover' },
                            { name: "⭐ Main (above What's Included)", value: 'main' },
                            { name: '📌 Secondary (below Benefits)', value: 'secondary' },
                            { name: '🎁 Bonus (below Ready to Get Started)', value: 'bonus' }
                        ]
                    })) as MediaGroup

                    const url = await inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'url',
                                message: 'Media URL:',
                                validate: (input) => input.trim().length > 0 || 'URL is required'
                            }
                        ])
                        .then((answers) => answers.url)

                    const title = await inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'title',
                                message: 'Title:',
                                validate: (input) => input.trim().length > 0 || 'Title is required'
                            }
                        ])
                        .then((answers) => answers.title)

                    const altText = await inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'altText',
                                message: 'Alt text (accessibility):',
                                validate: (input) =>
                                    input.trim().length > 0 || 'Alt text is required'
                            }
                        ])
                        .then((answers) => answers.altText)

                    const description = await inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'description',
                                message: 'Description (optional):'
                            }
                        ])
                        .then((answers) => answers.description || undefined)

                    const caption = await inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'caption',
                                message: 'Caption (optional):'
                            }
                        ])
                        .then((answers) => answers.caption || undefined)

                    const newMedia = addMediaToProduct(PRODUCTS_DIR, product.id, {
                        type,
                        group,
                        url,
                        title,
                        altText,
                        description,
                        caption
                    })

                    trackChange('media', 'added', `${type} to ${group} group`)
                    showSuccess(`Media added to ${group} group (ID: ${newMedia.id})`)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'edit': {
                    const mediaItems = listMediaInProduct(PRODUCTS_DIR, product.id)
                    if (mediaItems.length === 0) {
                        showError('No media items found for this product')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    const mediaId = await select({
                        message: 'Select media item to edit:',
                        choices: mediaItems.map((item) => ({
                            name: `${item.type === 'video' ? '🎥' : '🖼️'} ${item.title} (${item.group})`,
                            value: item.id
                        }))
                    })

                    const currentMedia = mediaItems.find((m) => m.id === mediaId)!

                    const title = await inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'title',
                                message: 'Title:',
                                default: currentMedia.title
                            }
                        ])
                        .then((answers) => answers.title)

                    const altText = await inquirer
                        .prompt([
                            {
                                type: 'input',
                                name: 'altText',
                                message: 'Alt text:',
                                default: currentMedia.altText
                            }
                        ])
                        .then((answers) => answers.altText)

                    editMediaInProduct(PRODUCTS_DIR, product.id, mediaId, { title, altText })
                    trackChange('media', 'edited', mediaId)
                    showSuccess(`Media item ${mediaId} updated`)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'remove': {
                    const mediaItems = listMediaInProduct(PRODUCTS_DIR, product.id)
                    if (mediaItems.length === 0) {
                        showError('No media items found for this product')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    const mediaId = await select({
                        message: 'Select media item to remove:',
                        choices: mediaItems.map((item) => ({
                            name: `${item.type === 'video' ? '🎥' : '🖼️'} ${item.title} (${item.group})`,
                            value: item.id
                        }))
                    })

                    const confirmed = await confirm(
                        `${colors.red}Confirm removal of media item?${colors.reset}`
                    )
                    if (confirmed) {
                        removeMediaFromProduct(PRODUCTS_DIR, product.id, mediaId)
                        trackChange('media', 'removed', mediaId)
                        showSuccess(`Media item ${mediaId} removed`)
                    }
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'reorder': {
                    const mediaItems = listMediaInProduct(PRODUCTS_DIR, product.id)
                    if (mediaItems.length === 0) {
                        showError('No media items found for this product')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    const mediaId = await select({
                        message: 'Select media item to reorder:',
                        choices: mediaItems.map((item) => ({
                            name: `${item.type === 'video' ? '🎥' : '🖼️'} ${item.title} (order: ${item.order}, group: ${item.group})`,
                            value: item.id
                        }))
                    })

                    const newOrder = await inquirer
                        .prompt([
                            {
                                type: 'number',
                                name: 'order',
                                message: 'New order (0-based):',
                                default: 0,
                                validate: (input) => input >= 0 || 'Order must be non-negative'
                            }
                        ])
                        .then((answers) => answers.order)

                    reorderMediaInProduct(PRODUCTS_DIR, product.id, mediaId, newOrder)
                    trackChange('media', 'reordered', `${mediaId} to position ${newOrder}`)
                    showSuccess(`Media item ${mediaId} reordered to position ${newOrder}`)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        }
    }
}

/**
 * Manage product content (FAQs, testimonials, and stats) - interactive submenu
 */
async function manageProductContent(product: Product): Promise<void> {
    let managing = true

    while (managing) {
        const faqCount = listFaqsInProduct(PRODUCTS_DIR, product.id).length
        const testimonialCount = listTestimonialsInProduct(PRODUCTS_DIR, product.id).length
        const stats = loadStats(PRODUCTS_DIR, product.id)
        const ratingsCount = countTotalRatings(stats)

        const contentType = await select({
            message: `Content Management (${faqCount} FAQs, ${testimonialCount} Testimonials, ${ratingsCount} Ratings):`,
            choices: [
                { name: `📝 Manage FAQs (${faqCount} items)`, value: 'faqs' },
                {
                    name: `💬 Manage Testimonials (${testimonialCount} items)`,
                    value: 'testimonials'
                },
                {
                    name: `📊 Manage Stats (${ratingsCount} ratings)`,
                    value: 'stats'
                },
                { name: '← Back to edit menu', value: 'back' }
            ],
            pageSize: 10
        })

        if (contentType === 'back') {
            managing = false
            continue
        }

        try {
            if (contentType === 'faqs') {
                await manageFaqs(product)
            } else if (contentType === 'testimonials') {
                await manageTestimonials(product)
            } else if (contentType === 'stats') {
                await manageStats(product)
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        }
    }
}

/**
 * Manage FAQs for a product
 */
async function manageFaqs(product: Product): Promise<void> {
    let managing = true

    while (managing) {
        const faqs = listFaqsInProduct(PRODUCTS_DIR, product.id)

        const action = await select({
            message: `FAQ Management (${faqs.length} total):`,
            choices: [
                { name: `📋 List all FAQs (${faqs.length} items)`, value: 'list' },
                { name: '➕ Add new FAQ', value: 'add' },
                { name: '✏️ Edit FAQ', value: 'edit' },
                { name: '🗑️ Remove FAQ', value: 'remove' },
                { name: '← Back', value: 'back' }
            ],
            pageSize: 10
        })

        if (action === 'back') {
            managing = false
            continue
        }

        try {
            switch (action) {
                case 'list': {
                    console.log(
                        `\n📝 FAQs for product: ${product.name} ${colors.dim}(${product.id})${colors.reset}`
                    )
                    console.log(`   Total: ${faqs.length} item(s)\n`)

                    if (faqs.length > 0) {
                        console.log(formatFaqList(faqs))
                    } else {
                        console.log(colors.dim + '   No FAQs found' + colors.reset)
                    }
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'add': {
                    const answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'id',
                            message: 'FAQ ID:',
                            default: generateFaqId(product.id),
                            validate: (input) => {
                                if (!input) return 'ID is required'
                                if (faqs.some((f) => f.id === input)) return 'ID already exists'
                                return true
                            }
                        },
                        {
                            type: 'input',
                            name: 'question',
                            message: 'Question:',
                            validate: (input) => (input ? true : 'Question is required')
                        },
                        {
                            type: 'input',
                            name: 'answer',
                            message: 'Answer:',
                            validate: (input) => (input ? true : 'Answer is required')
                        }
                    ])

                    const newFaq = addFaqToProduct(PRODUCTS_DIR, product.id, {
                        id: answers.id,
                        question: answers.question,
                        answer: answers.answer
                    })

                    showSuccess(`FAQ added: ${newFaq.id}`)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'edit': {
                    if (faqs.length === 0) {
                        showError('No FAQs found for this product')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    const faqId = await select({
                        message: 'Select FAQ to edit:',
                        choices: faqs.map((faq, index) => ({
                            name: `[${index + 1}] ${faq.question}`,
                            value: faq.id
                        }))
                    })

                    const currentFaq = faqs.find((f) => f.id === faqId)!

                    const answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'question',
                            message: 'Question:',
                            default: currentFaq.question
                        },
                        {
                            type: 'input',
                            name: 'answer',
                            message: 'Answer:',
                            default: currentFaq.answer
                        }
                    ])

                    editFaqInProduct(PRODUCTS_DIR, product.id, faqId, answers)
                    showSuccess(`FAQ updated: ${faqId}`)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'remove': {
                    if (faqs.length === 0) {
                        showError('No FAQs found for this product')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    const faqId = await select({
                        message: 'Select FAQ to remove:',
                        choices: faqs.map((faq, index) => ({
                            name: `[${index + 1}] ${faq.question}`,
                            value: faq.id
                        }))
                    })

                    const confirmed = await confirm(
                        `${colors.red}Confirm removal of FAQ?${colors.reset}`
                    )
                    if (confirmed) {
                        removeFaqFromProduct(PRODUCTS_DIR, product.id, faqId)
                        showSuccess(`FAQ removed: ${faqId}`)
                    }
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        }
    }
}

/**
 * Manage testimonials for a product
 */
async function manageTestimonials(product: Product): Promise<void> {
    let managing = true

    while (managing) {
        const testimonials = listTestimonialsInProduct(PRODUCTS_DIR, product.id)

        const action = await select({
            message: `Testimonial Management (${testimonials.length} total):`,
            choices: [
                { name: `📋 List all testimonials (${testimonials.length} items)`, value: 'list' },
                { name: '➕ Add new testimonial', value: 'add' },
                { name: '✏️ Edit testimonial', value: 'edit' },
                { name: '🗑️ Remove testimonial', value: 'remove' },
                { name: '← Back', value: 'back' }
            ],
            pageSize: 10
        })

        if (action === 'back') {
            managing = false
            continue
        }

        try {
            switch (action) {
                case 'list': {
                    console.log(
                        `\n💬 Testimonials for product: ${product.name} ${colors.dim}(${product.id})${colors.reset}`
                    )
                    console.log(`   Total: ${testimonials.length} item(s)\n`)

                    if (testimonials.length > 0) {
                        console.log(formatTestimonialList(testimonials))
                    } else {
                        console.log(colors.dim + '   No testimonials found' + colors.reset)
                    }
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'add': {
                    const answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'id',
                            message: 'Testimonial ID:',
                            default: generateTestimonialId(product.id),
                            validate: (input) => {
                                if (!input) return 'ID is required'
                                if (testimonials.some((t) => t.id === input))
                                    return 'ID already exists'
                                return true
                            }
                        },
                        {
                            type: 'input',
                            name: 'author',
                            message: 'Author name:',
                            validate: (input) => (input ? true : 'Author is required')
                        },
                        {
                            type: 'input',
                            name: 'role',
                            message: 'Role (optional):'
                        },
                        {
                            type: 'input',
                            name: 'company',
                            message: 'Company (optional):'
                        },
                        {
                            type: 'input',
                            name: 'twitterHandle',
                            message: 'Twitter handle (optional, without @):'
                        },
                        {
                            type: 'input',
                            name: 'twitterUrl',
                            message: 'Twitter URL (optional):'
                        },
                        {
                            type: 'input',
                            name: 'quote',
                            message: 'Quote:',
                            validate: (input) => (input ? true : 'Quote is required')
                        },
                        {
                            type: 'confirm',
                            name: 'featured',
                            message: 'Featured?',
                            default: false
                        }
                    ])

                    const newTestimonial = addTestimonialToProduct(PRODUCTS_DIR, product.id, {
                        id: answers.id,
                        author: answers.author,
                        quote: answers.quote,
                        featured: answers.featured,
                        role: answers.role || undefined,
                        company: answers.company || undefined,
                        twitterHandle: answers.twitterHandle || undefined,
                        twitterUrl: answers.twitterUrl || undefined
                    })

                    showSuccess(`Testimonial added: ${newTestimonial.id}`)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'edit': {
                    if (testimonials.length === 0) {
                        showError('No testimonials found for this product')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    const testimonialId = await select({
                        message: 'Select testimonial to edit:',
                        choices: testimonials.map((t) => ({
                            name: `${t.author} - "${t.quote.substring(0, 50)}..."`,
                            value: t.id
                        }))
                    })

                    const currentTestimonial = testimonials.find((t) => t.id === testimonialId)!

                    const answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'author',
                            message: 'Author name:',
                            default: currentTestimonial.author
                        },
                        {
                            type: 'input',
                            name: 'role',
                            message: 'Role (optional):',
                            default: currentTestimonial.role || ''
                        },
                        {
                            type: 'input',
                            name: 'company',
                            message: 'Company (optional):',
                            default: currentTestimonial.company || ''
                        },
                        {
                            type: 'input',
                            name: 'twitterHandle',
                            message: 'Twitter handle (optional):',
                            default: currentTestimonial.twitterHandle || ''
                        },
                        {
                            type: 'input',
                            name: 'twitterUrl',
                            message: 'Twitter URL (optional):',
                            default: currentTestimonial.twitterUrl || ''
                        },
                        {
                            type: 'input',
                            name: 'quote',
                            message: 'Quote:',
                            default: currentTestimonial.quote
                        },
                        {
                            type: 'confirm',
                            name: 'featured',
                            message: 'Featured?',
                            default: currentTestimonial.featured
                        }
                    ])

                    editTestimonialInProduct(PRODUCTS_DIR, product.id, testimonialId, {
                        author: answers.author,
                        quote: answers.quote,
                        featured: answers.featured,
                        role: answers.role || undefined,
                        company: answers.company || undefined,
                        twitterHandle: answers.twitterHandle || undefined,
                        twitterUrl: answers.twitterUrl || undefined
                    })
                    showSuccess(`Testimonial updated: ${testimonialId}`)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'remove': {
                    if (testimonials.length === 0) {
                        showError('No testimonials found for this product')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    const testimonialId = await select({
                        message: 'Select testimonial to remove:',
                        choices: testimonials.map((t) => ({
                            name: `${t.author} - "${t.quote.substring(0, 50)}..."`,
                            value: t.id
                        }))
                    })

                    const confirmed = await confirm(
                        `${colors.red}Confirm removal of testimonial?${colors.reset}`
                    )
                    if (confirmed) {
                        removeTestimonialFromProduct(PRODUCTS_DIR, product.id, testimonialId)
                        showSuccess(`Testimonial removed: ${testimonialId}`)
                    }
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        }
    }
}

// ============================================================================
// Stats Management
// ============================================================================

/**
 * Manage stats for a product (userCount, timeSaved, ratings)
 */
async function manageStats(product: Product): Promise<void> {
    let managing = true

    while (managing) {
        const stats = loadStats(PRODUCTS_DIR, product.id)
        const totalRatings = countTotalRatings(stats)

        const additionalCount = stats?.additionalStats?.length ?? 0
        const action = await select({
            message: `Stats Management (${totalRatings} ratings, ${additionalCount} additional):`,
            choices: [
                { name: '📊 View current stats', value: 'view' },
                { name: '👥 Edit user count', value: 'userCount' },
                { name: '⏱️ Edit time saved', value: 'timeSaved' },
                { name: '⭐ Manage ratings', value: 'ratings' },
                {
                    name: `📈 Manage additional stats (${additionalCount})`,
                    value: 'additionalStats'
                },
                { name: '← Back', value: 'back' }
            ],
            pageSize: 10
        })

        if (action === 'back') {
            managing = false
            continue
        }

        try {
            switch (action) {
                case 'view': {
                    console.log(
                        `\n📊 Stats for product: ${product.name} ${colors.dim}(${product.id})${colors.reset}\n`
                    )
                    console.log(formatStatsDisplay(stats))
                    if (stats?.ratings) {
                        console.log(formatRatingsList(stats))
                    }
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'userCount': {
                    // Extract current value and label
                    const currentValue =
                        typeof stats?.userCount === 'string'
                            ? stats.userCount
                            : stats?.userCount?.value || ''
                    const currentLabel =
                        typeof stats?.userCount === 'object' ? stats.userCount?.label : null

                    const answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'value',
                            message: 'User count value (e.g., "2,000+", leave empty to clear):',
                            default: currentValue
                        },
                        {
                            type: 'input',
                            name: 'label',
                            message:
                                'Custom label (e.g., "Members", "Students", leave empty for default "Users"):',
                            default: currentLabel || '',
                            when: (ans: { value: string }) => !!ans.value
                        }
                    ])

                    let userCount: StatItem | null = null
                    if (answers.value) {
                        if (answers.label) {
                            // Use object format with custom label
                            userCount = { value: answers.value, label: answers.label }
                        } else {
                            // Use simple string format (backward compatible)
                            userCount = answers.value
                        }
                    }

                    const updatedStats: Stats = {
                        ...stats,
                        userCount
                    }
                    saveStats(PRODUCTS_DIR, product.id, updatedStats)
                    showSuccess('User count updated')
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'timeSaved': {
                    // Extract current value and label
                    const currentValue =
                        typeof stats?.timeSaved === 'string'
                            ? stats.timeSaved
                            : stats?.timeSaved?.value || ''
                    const currentLabel =
                        typeof stats?.timeSaved === 'object' ? stats.timeSaved?.label : null

                    const answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'value',
                            message:
                                'Time saved value (e.g., "10+ hours/week", leave empty to clear):',
                            default: currentValue
                        },
                        {
                            type: 'input',
                            name: 'label',
                            message: 'Custom label (leave empty for default "Time Saved"):',
                            default: currentLabel || '',
                            when: (ans: { value: string }) => !!ans.value
                        }
                    ])

                    let timeSaved: StatItem | null = null
                    if (answers.value) {
                        if (answers.label) {
                            // Use object format with custom label
                            timeSaved = { value: answers.value, label: answers.label }
                        } else {
                            // Use simple string format (backward compatible)
                            timeSaved = answers.value
                        }
                    }

                    const updatedStats: Stats = {
                        ...stats,
                        timeSaved
                    }
                    saveStats(PRODUCTS_DIR, product.id, updatedStats)
                    showSuccess('Time saved updated')
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'ratings': {
                    await manageRatings(product, stats)
                    break
                }
                case 'additionalStats': {
                    await manageAdditionalStats(product, stats)
                    break
                }
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        }
    }
}

/**
 * Manage ratings for a product (add, remove ratings grouped by source)
 */
async function manageRatings(product: Product, initialStats: Stats | null): Promise<void> {
    let managing = true
    let stats = initialStats

    while (managing) {
        const totalRatings = countTotalRatings(stats)

        const action = await select({
            message: `Ratings Management (${totalRatings} total):`,
            choices: [
                { name: `📋 List all ratings (${totalRatings} items)`, value: 'list' },
                { name: '➕ Add new rating', value: 'add' },
                { name: '🗑️ Remove rating', value: 'remove' },
                { name: '← Back', value: 'back' }
            ],
            pageSize: 10
        })

        if (action === 'back') {
            managing = false
            continue
        }

        try {
            switch (action) {
                case 'list': {
                    console.log(
                        `\n⭐ Ratings for product: ${product.name} ${colors.dim}(${product.id})${colors.reset}\n`
                    )
                    console.log(formatRatingsList(stats))
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'add': {
                    const answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'source',
                            message: 'Rating source (e.g., "gumroad", "twitter", "email"):',
                            default: 'gumroad',
                            validate: (input) => (input ? true : 'Source is required')
                        },
                        {
                            type: 'number',
                            name: 'rating',
                            message: 'Rating (1-5, or leave empty for no rating):',
                            default: 5,
                            validate: (input) => {
                                if (input === '' || input === null) return true
                                const num = Number(input)
                                if (isNaN(num) || num < 1 || num > 5)
                                    return 'Rating must be between 1 and 5'
                                return true
                            }
                        },
                        {
                            type: 'input',
                            name: 'date',
                            message: 'Date (YYYY-MM-DD, or leave empty):',
                            default: new Date().toISOString().split('T')[0]
                        }
                    ])

                    const newRating: Rating = {
                        id: generateRatingId(answers.source),
                        rating: answers.rating !== '' ? Number(answers.rating) : null,
                        date: answers.date || null
                    }

                    const updatedStats: Stats = {
                        ...stats,
                        ratings: {
                            ...(stats?.ratings || {}),
                            [answers.source]: [
                                ...(stats?.ratings?.[answers.source] || []),
                                newRating
                            ]
                        }
                    }

                    saveStats(PRODUCTS_DIR, product.id, updatedStats)
                    stats = updatedStats
                    showSuccess(`Rating added: ${newRating.id}`)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'remove': {
                    if (totalRatings === 0) {
                        showError('No ratings found for this product')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    // Build choices from all ratings
                    const choices: { name: string; value: { source: string; id: string } }[] = []
                    if (stats?.ratings) {
                        for (const [source, ratings] of Object.entries(stats.ratings)) {
                            for (const rating of ratings) {
                                const ratingValue =
                                    rating.rating !== null ? `${rating.rating}/5` : 'N/A'
                                choices.push({
                                    name: `[${source}] ${rating.id}: ${ratingValue}`,
                                    value: { source, id: rating.id }
                                })
                            }
                        }
                    }

                    const selected = await select({
                        message: 'Select rating to remove:',
                        choices
                    })

                    const confirmed = await confirm(
                        `${colors.red}Confirm removal of rating ${selected.id}?${colors.reset}`
                    )

                    if (confirmed) {
                        const updatedRatings = { ...(stats?.ratings || {}) }
                        updatedRatings[selected.source] = updatedRatings[selected.source].filter(
                            (r) => r.id !== selected.id
                        )

                        // Remove empty source arrays
                        if (updatedRatings[selected.source].length === 0) {
                            delete updatedRatings[selected.source]
                        }

                        const updatedStats: Stats = {
                            ...stats,
                            ratings:
                                Object.keys(updatedRatings).length > 0 ? updatedRatings : undefined
                        }

                        saveStats(PRODUCTS_DIR, product.id, updatedStats)
                        stats = updatedStats
                        showSuccess(`Rating removed: ${selected.id}`)
                    }
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        }
    }
}

/**
 * Manage additional stats for a product (add, edit, remove, reorder)
 */
async function manageAdditionalStats(product: Product, initialStats: Stats | null): Promise<void> {
    let managing = true
    let stats = initialStats

    while (managing) {
        const additionalStats = stats?.additionalStats ?? []
        const count = additionalStats.length

        const action = await select({
            message: `Additional Stats Management (${count} items):`,
            choices: [
                { name: `📋 List all (${count} items)`, value: 'list' },
                { name: '➕ Add new stat', value: 'add' },
                { name: '✏️ Edit stat', value: 'edit' },
                { name: '🗑️ Remove stat', value: 'remove' },
                { name: '↕️ Reorder stats', value: 'reorder' },
                { name: '← Back', value: 'back' }
            ],
            pageSize: 10
        })

        if (action === 'back') {
            managing = false
            continue
        }

        try {
            switch (action) {
                case 'list': {
                    console.log(
                        `\n📈 Additional Stats for: ${product.name} ${colors.dim}(${product.id})${colors.reset}\n`
                    )
                    if (additionalStats.length === 0) {
                        console.log(`${colors.dim}No additional stats configured${colors.reset}`)
                    } else {
                        for (let i = 0; i < additionalStats.length; i++) {
                            const stat = additionalStats[i]
                            const linkInfo = stat.link
                                ? ` ${colors.dim}→ ${stat.link}${colors.reset}`
                                : ''
                            console.log(
                                `   ${i + 1}. ${colors.cyan}${stat.value}${colors.reset} - ${stat.label}${linkInfo}`
                            )
                        }
                    }
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'add': {
                    const answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'value',
                            message: 'Stat value (e.g., "50+", "1M+"):',
                            validate: (input) => (input.trim() ? true : 'Value is required')
                        },
                        {
                            type: 'input',
                            name: 'label',
                            message: 'Stat label (e.g., "Countries", "Messages"):',
                            validate: (input) => (input.trim() ? true : 'Label is required')
                        },
                        {
                            type: 'input',
                            name: 'link',
                            message: 'Link URL (optional, leave empty for none):'
                        }
                    ])

                    const newStat: AdditionalStat = {
                        value: answers.value.trim(),
                        label: answers.label.trim(),
                        link: answers.link.trim() || null
                    }

                    const updatedStats: Stats = {
                        ...stats,
                        additionalStats: [...additionalStats, newStat]
                    }

                    saveStats(PRODUCTS_DIR, product.id, updatedStats)
                    stats = updatedStats
                    showSuccess(`Additional stat added: ${newStat.value} - ${newStat.label}`)
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'edit': {
                    if (additionalStats.length === 0) {
                        showError('No additional stats to edit')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    const choices = additionalStats.map((stat, index) => ({
                        name: `${index + 1}. ${stat.value} - ${stat.label}`,
                        value: index
                    }))

                    const selectedIndex = await select({
                        message: 'Select stat to edit:',
                        choices
                    })

                    const currentStat = additionalStats[selectedIndex]

                    const answers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'value',
                            message: 'Stat value:',
                            default: currentStat.value,
                            validate: (input) => (input.trim() ? true : 'Value is required')
                        },
                        {
                            type: 'input',
                            name: 'label',
                            message: 'Stat label:',
                            default: currentStat.label,
                            validate: (input) => (input.trim() ? true : 'Label is required')
                        },
                        {
                            type: 'input',
                            name: 'link',
                            message: 'Link URL (leave empty to clear):',
                            default: currentStat.link || ''
                        }
                    ])

                    const updatedAdditionalStats = [...additionalStats]
                    updatedAdditionalStats[selectedIndex] = {
                        value: answers.value.trim(),
                        label: answers.label.trim(),
                        link: answers.link.trim() || null
                    }

                    const updatedStats: Stats = {
                        ...stats,
                        additionalStats: updatedAdditionalStats
                    }

                    saveStats(PRODUCTS_DIR, product.id, updatedStats)
                    stats = updatedStats
                    showSuccess('Additional stat updated')
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'remove': {
                    if (additionalStats.length === 0) {
                        showError('No additional stats to remove')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    const choices = additionalStats.map((stat, index) => ({
                        name: `${index + 1}. ${stat.value} - ${stat.label}`,
                        value: index
                    }))

                    const selectedIndex = await select({
                        message: 'Select stat to remove:',
                        choices
                    })

                    const selectedStat = additionalStats[selectedIndex]
                    const confirmed = await confirm(
                        `${colors.red}Confirm removal of "${selectedStat.value} - ${selectedStat.label}"?${colors.reset}`
                    )

                    if (confirmed) {
                        const updatedAdditionalStats = additionalStats.filter(
                            (_, i) => i !== selectedIndex
                        )

                        const updatedStats: Stats = {
                            ...stats,
                            additionalStats: updatedAdditionalStats
                        }

                        saveStats(PRODUCTS_DIR, product.id, updatedStats)
                        stats = updatedStats
                        showSuccess('Additional stat removed')
                    }
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
                case 'reorder': {
                    if (additionalStats.length < 2) {
                        showError('Need at least 2 stats to reorder')
                        await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                        break
                    }

                    const choices = additionalStats.map((stat, index) => ({
                        name: `${index + 1}. ${stat.value} - ${stat.label}`,
                        value: index
                    }))

                    const selectedIndex = await select({
                        message: 'Select stat to move:',
                        choices
                    })

                    const positionChoices = []
                    for (let i = 0; i < additionalStats.length; i++) {
                        if (i !== selectedIndex) {
                            positionChoices.push({
                                name: `Position ${i + 1}${i === 0 ? ' (first)' : i === additionalStats.length - 1 ? ' (last)' : ''}`,
                                value: i
                            })
                        }
                    }

                    const newPosition = await select({
                        message: 'Move to position:',
                        choices: positionChoices
                    })

                    const reorderedStats = [...additionalStats]
                    const [movedItem] = reorderedStats.splice(selectedIndex, 1)
                    reorderedStats.splice(newPosition, 0, movedItem)

                    const updatedStats: Stats = {
                        ...stats,
                        additionalStats: reorderedStats
                    }

                    saveStats(PRODUCTS_DIR, product.id, updatedStats)
                    stats = updatedStats
                    showSuccess('Stats reordered')
                    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
                    break
                }
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        }
    }
}

// ============================================================================
// Sales Copy Management
// ============================================================================

/**
 * Get sales copy file path
 */
function getSalesCopyPath(productId: string, variantId: string): string {
    return join(PRODUCTS_DIR, `${productId}-sales-copy-${variantId}.json`)
}

/**
 * Load sales copy file
 */
function loadSalesCopyFile(productId: string, variantId: string): SalesCopyFile | null {
    const path = getSalesCopyPath(productId, variantId)
    if (!existsSync(path)) return null

    const content = readFileSync(path, 'utf-8')
    const data = JSON.parse(content)
    const result = SalesCopyFileSchema.safeParse(data)

    if (!result.success) {
        throw new Error(`Invalid sales copy file: ${result.error.message}`)
    }

    return result.data
}

/**
 * Save sales copy file
 */
function saveSalesCopyFile(productId: string, variantId: string, salesCopy: SalesCopyData): void {
    const path = getSalesCopyPath(productId, variantId)
    const file: SalesCopyFile = {
        id: variantId,
        salesCopy
    }

    const result = SalesCopyFileSchema.safeParse(file)
    if (!result.success) {
        throw new Error(`Invalid sales copy data: ${result.error.message}`)
    }

    writeFileSync(path, JSON.stringify(file, null, 2) + '\n', 'utf-8')
}

/**
 * List all sales copy variants for a product
 */
function listSalesCopyVariants(productId: string): string[] {
    return discoverSalesCopyFiles(productId)
}

/**
 * Delete sales copy file
 */
function deleteSalesCopyFile(productId: string, variantId: string): void {
    const path = getSalesCopyPath(productId, variantId)
    if (existsSync(path)) {
        unlinkSync(path)
    }
}

/**
 * Manage product sales copy (interactive submenu)
 */
async function manageProductSalesCopy(product: Product): Promise<void> {
    let managing = true

    while (managing) {
        const variants = listSalesCopyVariants(product.id)
        const activeVariant = product.activeSalesCopyId || 'default'

        const action = await select({
            message: `Sales Copy Management (${variants.length} variants, active: ${activeVariant}):`,
            choices: [
                { name: '📋 List All Variants', value: 'list' },
                { name: '➕ Add New Variant', value: 'add' },
                { name: '✏️ Edit Variant', value: 'edit' },
                { name: '✅ Enable Variant (Set as Active)', value: 'enable' },
                { name: '📋 Duplicate Variant', value: 'duplicate' },
                { name: '🗑️ Remove Variant', value: 'remove' },
                { name: '👁️ View Variant Details', value: 'view' },
                { name: '🔙 Back to Product Menu', value: 'back' }
            ]
        })

        if (action === 'back') {
            managing = false
            continue
        }

        try {
            switch (action) {
                case 'list':
                    await showSalesCopyVariantsList(product.id, variants, activeVariant)
                    break
                case 'add':
                    await addSalesCopyVariant(product)
                    variants.push(
                        ...listSalesCopyVariants(product.id).filter((v) => !variants.includes(v))
                    )
                    break
                case 'edit':
                    await editSalesCopyVariant(product.id, variants)
                    break
                case 'enable':
                    await enableSalesCopyVariant(product, variants)
                    break
                case 'duplicate':
                    await duplicateSalesCopyVariant(product.id, variants)
                    variants.push(
                        ...listSalesCopyVariants(product.id).filter((v) => !variants.includes(v))
                    )
                    break
                case 'remove':
                    await removeSalesCopyVariant(product.id, variants, activeVariant)
                    break
                case 'view':
                    await viewSalesCopyVariant(product.id, variants)
                    break
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
        }
    }
}

/**
 * Show list of sales copy variants
 */
async function showSalesCopyVariantsList(
    productId: string,
    variants: string[],
    activeVariant: string
): Promise<void> {
    console.log(`\n${colors.bright}Sales Copy Variants for ${productId}:${colors.reset}\n`)

    if (variants.length === 0) {
        console.log(`${colors.yellow}No sales copy variants found${colors.reset}`)
    } else {
        variants.forEach((variantId) => {
            const isActive = variantId === activeVariant
            const marker = isActive ? '✅' : '  '
            const status = isActive ? `${colors.green}(active)${colors.reset}` : ''
            console.log(`${marker} ${variantId} ${status}`)
        })
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Add new sales copy variant
 */
async function addSalesCopyVariant(product: Product): Promise<void> {
    const variantId = await prompt('Enter new variant ID (e.g., holiday-2026, black-friday): ')

    if (!variantId || variantId.trim().length === 0) {
        showError('Variant ID cannot be empty')
        return
    }

    const path = getSalesCopyPath(product.id, variantId)
    if (existsSync(path)) {
        showError(`Variant "${variantId}" already exists`)
        return
    }

    // Ask if they want to copy from existing variant or start fresh
    const sourceOption = await select({
        message: 'Create variant from:',
        choices: [
            { name: '📋 Copy from active variant', value: 'copy-active' },
            { name: '📋 Copy from another variant', value: 'copy-other' },
            { name: '📝 Start with template', value: 'template' }
        ]
    })

    let salesCopyData: SalesCopyData

    if (sourceOption === 'copy-active') {
        const activeVariant = product.activeSalesCopyId || 'default'
        const sourceFile = loadSalesCopyFile(product.id, activeVariant)
        if (!sourceFile) {
            showError(`Active variant "${activeVariant}" not found`)
            return
        }
        salesCopyData = sourceFile.salesCopy
    } else if (sourceOption === 'copy-other') {
        const variants = listSalesCopyVariants(product.id)
        if (variants.length === 0) {
            showError('No variants available to copy from')
            return
        }
        const sourceVariant = await select({
            message: 'Select source variant:',
            choices: variants.map((v) => ({ name: v, value: v }))
        })
        const sourceFile = loadSalesCopyFile(product.id, sourceVariant)
        if (!sourceFile) {
            showError(`Variant "${sourceVariant}" not found`)
            return
        }
        salesCopyData = sourceFile.salesCopy
    } else {
        // Create minimal template
        salesCopyData = {
            tagline: product.name || 'Product Tagline',
            problem: 'Problem statement',
            problemPoints: ['Problem point 1'],
            agitate: 'Agitation statement',
            agitatePoints: ['Pain point 1'],
            solution: 'Solution statement',
            solutionPoints: ['Benefit 1'],
            description: 'Product description',
            features: ['Feature 1'],
            benefits: {
                immediate: [],
                systematic: [],
                longTerm: []
            },
            targetAudience: [],
            perfectFor: [],
            notForYou: [],
            trustBadges: [],
            guarantees: []
        }
    }

    saveSalesCopyFile(product.id, variantId, salesCopyData)
    showSuccess(`Sales copy variant "${variantId}" created`)
    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Edit sales copy variant (comprehensive editor with submenus)
 */
async function editSalesCopyVariant(productId: string, variants: string[]): Promise<void> {
    if (variants.length === 0) {
        showError('No variants found')
        return
    }

    const variantId = await select({
        message: 'Select variant to edit:',
        choices: variants.map((v) => ({ name: v, value: v }))
    })

    const file = loadSalesCopyFile(productId, variantId)
    if (!file) {
        showError(`Variant "${variantId}" not found`)
        return
    }

    let editing = true
    while (editing) {
        const section = await select({
            message: `Edit Sales Copy: ${variantId}`,
            choices: [
                { name: '📝 Basic Info (Tagline, Description)', value: 'basic' },
                { name: '⚡ PAS Framework (Problem, Agitate, Solution)', value: 'pas' },
                { name: '✨ Features & Benefits', value: 'features' },
                { name: '🎯 Target Audience', value: 'audience' },
                { name: '🛡️ Trust & Guarantees', value: 'trust' },
                { name: '🔍 SEO Metadata', value: 'seo' },
                { name: '⏱️ Edit Timeline', value: 'timeline' },
                { name: '💾 Save & Exit', value: 'save' },
                { name: '🔙 Cancel', value: 'cancel' }
            ]
        })

        switch (section) {
            case 'basic':
                await editBasicInfo(file.salesCopy)
                break
            case 'pas':
                await editPASFramework(file.salesCopy)
                break
            case 'features':
                await editFeaturesAndBenefits(file.salesCopy)
                break
            case 'audience':
                await editTargetAudience(file.salesCopy)
                break
            case 'trust':
                await editTrustAndGuarantees(file.salesCopy)
                break
            case 'seo':
                await editSEOMetadata(file.salesCopy)
                break
            case 'timeline':
                await editTimeline(file.salesCopy)
                break
            case 'save':
                saveSalesCopyFile(productId, variantId, file.salesCopy)
                showSuccess(`Variant "${variantId}" saved`)
                editing = false
                break
            case 'cancel':
                editing = false
                break
        }
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

async function editBasicInfo(salesCopy: SalesCopyData): Promise<void> {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'tagline',
            message: 'Tagline:',
            default: salesCopy.tagline
        },
        {
            type: 'input',
            name: 'secondaryTagline',
            message: 'Secondary Tagline (optional):',
            default: salesCopy.secondaryTagline || ''
        },
        {
            type: 'input',
            name: 'description',
            message: 'Description:',
            default: salesCopy.description
        }
    ])

    salesCopy.tagline = answers.tagline
    salesCopy.secondaryTagline = answers.secondaryTagline || undefined
    salesCopy.description = answers.description
    showSuccess('Basic info updated')
}

async function editPASFramework(salesCopy: SalesCopyData): Promise<void> {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'problem',
            message: 'Problem Statement:',
            default: salesCopy.problem
        },
        {
            type: 'input',
            name: 'problemPoints',
            message: 'Problem Points (comma-separated):',
            default: salesCopy.problemPoints.join(', ')
        },
        {
            type: 'input',
            name: 'agitate',
            message: 'Agitate Statement:',
            default: salesCopy.agitate
        },
        {
            type: 'input',
            name: 'agitatePoints',
            message: 'Agitate Points (comma-separated):',
            default: salesCopy.agitatePoints.join(', ')
        },
        {
            type: 'input',
            name: 'solution',
            message: 'Solution Statement:',
            default: salesCopy.solution
        },
        {
            type: 'input',
            name: 'solutionPoints',
            message: 'Solution Points (comma-separated):',
            default: salesCopy.solutionPoints.join(', ')
        }
    ])

    salesCopy.problem = answers.problem
    salesCopy.problemPoints = answers.problemPoints.split(',').map((s: string) => s.trim())
    salesCopy.agitate = answers.agitate
    salesCopy.agitatePoints = answers.agitatePoints.split(',').map((s: string) => s.trim())
    salesCopy.solution = answers.solution
    salesCopy.solutionPoints = answers.solutionPoints.split(',').map((s: string) => s.trim())
    showSuccess('PAS framework updated')
}

async function editFeaturesAndBenefits(salesCopy: SalesCopyData): Promise<void> {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'features',
            message: 'Features (comma-separated):',
            default: salesCopy.features.join(', ')
        },
        {
            type: 'input',
            name: 'benefitsImmediate',
            message: 'Immediate Benefits (comma-separated):',
            default: salesCopy.benefits.immediate.join(', ')
        },
        {
            type: 'input',
            name: 'benefitsSystematic',
            message: 'Systematic Benefits (comma-separated):',
            default: salesCopy.benefits.systematic.join(', ')
        },
        {
            type: 'input',
            name: 'benefitsLongTerm',
            message: 'Long-term Benefits (comma-separated):',
            default: salesCopy.benefits.longTerm.join(', ')
        }
    ])

    salesCopy.features = answers.features
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s)
    salesCopy.benefits = {
        immediate: answers.benefitsImmediate
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s),
        systematic: answers.benefitsSystematic
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s),
        longTerm: answers.benefitsLongTerm
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s)
    }
    showSuccess('Features and benefits updated')
}

async function editTargetAudience(salesCopy: SalesCopyData): Promise<void> {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'targetAudience',
            message: 'Target Audience (comma-separated):',
            default: salesCopy.targetAudience.join(', ')
        },
        {
            type: 'input',
            name: 'perfectFor',
            message: 'Perfect For (comma-separated):',
            default: salesCopy.perfectFor.join(', ')
        },
        {
            type: 'input',
            name: 'notForYou',
            message: 'Not For You (comma-separated):',
            default: salesCopy.notForYou.join(', ')
        }
    ])

    salesCopy.targetAudience = answers.targetAudience
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s)
    salesCopy.perfectFor = answers.perfectFor
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s)
    salesCopy.notForYou = answers.notForYou
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s)
    showSuccess('Target audience updated')
}

async function editTrustAndGuarantees(salesCopy: SalesCopyData): Promise<void> {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'trustBadges',
            message: 'Trust Badges (comma-separated):',
            default: salesCopy.trustBadges.join(', ')
        },
        {
            type: 'input',
            name: 'guarantees',
            message: 'Guarantees (comma-separated):',
            default: salesCopy.guarantees.join(', ')
        }
    ])

    salesCopy.trustBadges = answers.trustBadges
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s)
    salesCopy.guarantees = answers.guarantees
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s)
    showSuccess('Trust and guarantees updated')
}

async function editSEOMetadata(salesCopy: SalesCopyData): Promise<void> {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'metaTitle',
            message: 'Meta Title (optional):',
            default: salesCopy.metaTitle || ''
        },
        {
            type: 'input',
            name: 'metaDescription',
            message: 'Meta Description (optional):',
            default: salesCopy.metaDescription || ''
        },
        {
            type: 'input',
            name: 'keywords',
            message: 'Keywords (comma-separated, optional):',
            default: salesCopy.keywords ? salesCopy.keywords.join(', ') : ''
        }
    ])

    salesCopy.metaTitle = answers.metaTitle || undefined
    salesCopy.metaDescription = answers.metaDescription || undefined
    salesCopy.keywords = answers.keywords
        ? answers.keywords
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s)
        : undefined
    showSuccess('SEO metadata updated')
}

/**
 * Edit timeline (transformation journey milestones)
 */
async function editTimeline(salesCopy: SalesCopyData): Promise<void> {
    let editing = true
    while (editing) {
        const milestoneCount = salesCopy.timeline?.milestones?.length || 0
        const action = await select({
            message: `Edit Timeline (${milestoneCount} milestones)`,
            choices: [
                { name: '📋 List Milestones', value: 'list' },
                { name: '➕ Add Milestone', value: 'add' },
                { name: '✏️ Edit Milestone', value: 'edit' },
                { name: '🗑️ Remove Milestone', value: 'remove' },
                { name: '🔄 Reorder Milestones', value: 'reorder' },
                { name: '📝 Edit Title & Subtitle', value: 'header' },
                { name: '🔙 Back', value: 'back' }
            ]
        })

        switch (action) {
            case 'list':
                listTimelineMilestones(salesCopy)
                break
            case 'add':
                await addTimelineMilestone(salesCopy)
                break
            case 'edit':
                await editTimelineMilestone(salesCopy)
                break
            case 'remove':
                await removeTimelineMilestone(salesCopy)
                break
            case 'reorder':
                await reorderTimelineMilestones(salesCopy)
                break
            case 'header':
                await editTimelineHeader(salesCopy)
                break
            case 'back':
                editing = false
                break
        }
    }
}

function listTimelineMilestones(salesCopy: SalesCopyData): void {
    if (!salesCopy.timeline?.milestones?.length) {
        console.log(`\n${colors.dim}No milestones defined${colors.reset}\n`)
        return
    }

    console.log(
        `\n${colors.cyan}=== Timeline: ${salesCopy.timeline.title || 'Your Transformation Journey'} ===${colors.reset}`
    )
    if (salesCopy.timeline.subtitle) {
        console.log(`${colors.dim}${salesCopy.timeline.subtitle}${colors.reset}\n`)
    }

    salesCopy.timeline.milestones.forEach((milestone, idx) => {
        console.log(
            `${colors.cyan}${idx + 1}.${colors.reset} [${milestone.timeframe}] ${colors.bold}${milestone.title}${colors.reset}`
        )
        console.log(`   ${colors.dim}${milestone.description}${colors.reset}`)
        if (milestone.highlights?.length) {
            milestone.highlights.forEach((h) =>
                console.log(`   ${colors.green}• ${h}${colors.reset}`)
            )
        }
        if (milestone.icon) {
            console.log(`   ${colors.dim}Icon: ${milestone.icon}${colors.reset}`)
        }
        console.log()
    })
}

async function addTimelineMilestone(salesCopy: SalesCopyData): Promise<void> {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'timeframe',
            message: 'Timeframe (e.g., "Week 1", "Month 1", "Day 1"):',
            validate: (input: string) => input.trim().length > 0 || 'Timeframe is required'
        },
        {
            type: 'input',
            name: 'title',
            message: 'Title:',
            validate: (input: string) => input.trim().length > 0 || 'Title is required'
        },
        {
            type: 'input',
            name: 'description',
            message: 'Description:',
            validate: (input: string) =>
                input.trim().length >= 10 || 'Description must be at least 10 characters'
        },
        {
            type: 'input',
            name: 'highlights',
            message: 'Highlights (comma-separated, optional):'
        },
        {
            type: 'input',
            name: 'icon',
            message: 'Icon name (optional, e.g., "FaRocket"):'
        }
    ])

    // Generate milestone ID from timeframe
    const id =
        answers.timeframe
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '') +
        '-' +
        Date.now()

    const milestone = {
        id,
        timeframe: answers.timeframe.trim(),
        title: answers.title.trim(),
        description: answers.description.trim(),
        highlights: answers.highlights
            ? answers.highlights
                  .split(',')
                  .map((s: string) => s.trim())
                  .filter((s: string) => s)
            : undefined,
        icon: answers.icon.trim() || undefined
    }

    // Initialize timeline if needed
    if (!salesCopy.timeline) {
        salesCopy.timeline = {
            milestones: []
        }
    }
    if (!salesCopy.timeline.milestones) {
        salesCopy.timeline.milestones = []
    }

    salesCopy.timeline.milestones.push(milestone)
    showSuccess(`Milestone "${milestone.title}" added`)
}

async function editTimelineMilestone(salesCopy: SalesCopyData): Promise<void> {
    if (!salesCopy.timeline?.milestones?.length) {
        showError('No milestones to edit')
        return
    }

    const milestoneId = await select({
        message: 'Select milestone to edit:',
        choices: salesCopy.timeline.milestones.map((m, idx) => ({
            name: `${idx + 1}. [${m.timeframe}] ${m.title}`,
            value: m.id
        }))
    })

    const milestone = salesCopy.timeline.milestones.find((m) => m.id === milestoneId)
    if (!milestone) {
        showError('Milestone not found')
        return
    }

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'timeframe',
            message: 'Timeframe:',
            default: milestone.timeframe
        },
        {
            type: 'input',
            name: 'title',
            message: 'Title:',
            default: milestone.title
        },
        {
            type: 'input',
            name: 'description',
            message: 'Description:',
            default: milestone.description
        },
        {
            type: 'input',
            name: 'highlights',
            message: 'Highlights (comma-separated):',
            default: milestone.highlights?.join(', ') || ''
        },
        {
            type: 'input',
            name: 'icon',
            message: 'Icon name:',
            default: milestone.icon || ''
        }
    ])

    milestone.timeframe = answers.timeframe.trim()
    milestone.title = answers.title.trim()
    milestone.description = answers.description.trim()
    milestone.highlights = answers.highlights
        ? answers.highlights
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s)
        : undefined
    milestone.icon = answers.icon.trim() || undefined

    showSuccess(`Milestone "${milestone.title}" updated`)
}

async function removeTimelineMilestone(salesCopy: SalesCopyData): Promise<void> {
    if (!salesCopy.timeline?.milestones?.length) {
        showError('No milestones to remove')
        return
    }

    const milestoneId = await select({
        message: 'Select milestone to remove:',
        choices: salesCopy.timeline.milestones.map((m, idx) => ({
            name: `${idx + 1}. [${m.timeframe}] ${m.title}`,
            value: m.id
        }))
    })

    const idx = salesCopy.timeline.milestones.findIndex((m) => m.id === milestoneId)
    if (idx === -1) {
        showError('Milestone not found')
        return
    }

    const milestone = salesCopy.timeline.milestones[idx]
    const confirm = await select({
        message: `Remove milestone "${milestone.title}"?`,
        choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false }
        ]
    })

    if (confirm) {
        salesCopy.timeline.milestones.splice(idx, 1)
        showSuccess(`Milestone "${milestone.title}" removed`)

        // Clean up timeline if no milestones left
        if (salesCopy.timeline.milestones.length === 0) {
            salesCopy.timeline = undefined
        }
    }
}

async function reorderTimelineMilestones(salesCopy: SalesCopyData): Promise<void> {
    if (!salesCopy.timeline?.milestones || salesCopy.timeline.milestones.length < 2) {
        showError('Need at least 2 milestones to reorder')
        return
    }

    console.log(`\n${colors.cyan}Current order:${colors.reset}`)
    salesCopy.timeline.milestones.forEach((m, idx) => {
        console.log(`  ${idx + 1}. [${m.timeframe}] ${m.title}`)
    })

    const newOrder = await prompt('\nEnter new order as comma-separated numbers (e.g., "2,1,3"): ')
    const indices = newOrder.split(',').map((s) => parseInt(s.trim()) - 1)

    // Validate indices
    if (indices.length !== salesCopy.timeline.milestones.length) {
        showError(`Please provide exactly ${salesCopy.timeline.milestones.length} numbers`)
        return
    }

    const seen = new Set<number>()
    for (const idx of indices) {
        if (isNaN(idx) || idx < 0 || idx >= salesCopy.timeline.milestones.length || seen.has(idx)) {
            showError('Invalid order - each milestone number must appear exactly once')
            return
        }
        seen.add(idx)
    }

    // Reorder milestones
    const reordered = indices.map((idx) => salesCopy.timeline!.milestones[idx])
    salesCopy.timeline.milestones = reordered
    showSuccess('Milestones reordered')
}

async function editTimelineHeader(salesCopy: SalesCopyData): Promise<void> {
    // Initialize timeline if needed
    if (!salesCopy.timeline) {
        salesCopy.timeline = {
            milestones: []
        }
    }

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Timeline Title (leave empty for default "Your Transformation Journey"):',
            default: salesCopy.timeline.title || ''
        },
        {
            type: 'input',
            name: 'subtitle',
            message: 'Timeline Subtitle (leave empty for default):',
            default: salesCopy.timeline.subtitle || ''
        }
    ])

    salesCopy.timeline.title = answers.title.trim() || undefined
    salesCopy.timeline.subtitle = answers.subtitle.trim() || undefined
    showSuccess('Timeline header updated')
}

/**
 * Enable (activate) sales copy variant
 */
async function enableSalesCopyVariant(product: Product, variants: string[]): Promise<void> {
    if (variants.length === 0) {
        showError('No variants found')
        return
    }

    const variantId = await select({
        message: 'Select variant to activate:',
        choices: variants.map((v) => ({ name: v, value: v }))
    })

    product.activeSalesCopyId = variantId
    showSuccess(`Variant "${variantId}" is now active. Remember to save your changes!`)
    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Duplicate sales copy variant
 */
async function duplicateSalesCopyVariant(productId: string, variants: string[]): Promise<void> {
    if (variants.length === 0) {
        showError('No variants found')
        return
    }

    const sourceVariant = await select({
        message: 'Select variant to duplicate:',
        choices: variants.map((v) => ({ name: v, value: v }))
    })

    const newVariantId = await prompt('Enter new variant ID: ')

    if (!newVariantId || newVariantId.trim().length === 0) {
        showError('Variant ID cannot be empty')
        return
    }

    const targetPath = getSalesCopyPath(productId, newVariantId)
    if (existsSync(targetPath)) {
        showError(`Variant "${newVariantId}" already exists`)
        return
    }

    const sourceFile = loadSalesCopyFile(productId, sourceVariant)
    if (!sourceFile) {
        showError(`Source variant "${sourceVariant}" not found`)
        return
    }

    saveSalesCopyFile(productId, newVariantId, sourceFile.salesCopy)
    showSuccess(`Variant "${sourceVariant}" duplicated to "${newVariantId}"`)
    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Remove sales copy variant
 */
async function removeSalesCopyVariant(
    productId: string,
    variants: string[],
    activeVariant: string
): Promise<void> {
    if (variants.length === 0) {
        showError('No variants found')
        return
    }

    const variantId = await select({
        message: 'Select variant to remove:',
        choices: variants.map((v) => ({ name: v, value: v }))
    })

    if (variantId === activeVariant) {
        showError('Cannot remove active variant. Switch to another variant first.')
        return
    }

    const confirmed = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to remove variant "${variantId}"?`,
            default: false
        }
    ])

    if (!confirmed.confirm) {
        showInfo('Removal cancelled')
        return
    }

    deleteSalesCopyFile(productId, variantId)
    showSuccess(`Variant "${variantId}" removed`)
    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * View sales copy variant details
 */
async function viewSalesCopyVariant(productId: string, variants: string[]): Promise<void> {
    if (variants.length === 0) {
        showError('No variants found')
        return
    }

    const variantId = await select({
        message: 'Select variant to view:',
        choices: variants.map((v) => ({ name: v, value: v }))
    })

    const file = loadSalesCopyFile(productId, variantId)
    if (!file) {
        showError(`Variant "${variantId}" not found`)
        return
    }

    console.log(`\n${colors.bright}${colors.cyan}Sales Copy Variant: ${variantId}${colors.reset}\n`)
    console.log(`${colors.bright}Tagline:${colors.reset} ${file.salesCopy.tagline}`)
    console.log(`${colors.bright}Description:${colors.reset} ${file.salesCopy.description}`)
    console.log(`${colors.bright}Problem:${colors.reset} ${file.salesCopy.problem}`)
    console.log(`${colors.bright}Solution:${colors.reset} ${file.salesCopy.solution}`)
    console.log(`${colors.bright}Features:${colors.reset} ${file.salesCopy.features.length} items`)
    console.log(
        `${colors.bright}Problem Points:${colors.reset} ${file.salesCopy.problemPoints.length} items`
    )
    console.log(
        `${colors.bright}Solution Points:${colors.reset} ${file.salesCopy.solutionPoints.length} items`
    )

    if (file.salesCopy.storytelling) {
        console.log(`\n${colors.bright}Storytelling Sections:${colors.reset}`)
        if (file.salesCopy.storytelling.originStory) console.log('  ✓ Origin Story')
        if (file.salesCopy.storytelling.creatorJourney) console.log('  ✓ Creator Journey')
        if (file.salesCopy.storytelling.transformationArc) console.log('  ✓ Transformation Arc')
        if (file.salesCopy.storytelling.successStories) console.log('  ✓ Success Stories')
        if (file.salesCopy.storytelling.methodology) console.log('  ✓ Methodology')
        if (file.salesCopy.storytelling.vision) console.log('  ✓ Vision')
    }

    await prompt(`\n${colors.dim}Press Enter to continue...${colors.reset}`)
}

/**
 * Check if any edit arguments are provided
 */
function hasAnyEditArgs(args: CliArgs): boolean {
    return !!(
        args.name ||
        args.tagline ||
        args.price ||
        args.priceDisplay ||
        args.priceTier ||
        args.mainCategory ||
        args.tags ||
        args.secondaryCategories ||
        args.featured ||
        args.priority ||
        args.status ||
        args.problem ||
        args.agitate ||
        args.solution
    )
}

// ============================================================================
// Operation: Remove
// ============================================================================

async function operationRemove(args: CliArgs): Promise<void> {
    showOperationHeader('Remove Product', 'Delete a product')

    const productId = args.id || (await selectProduct('Select product to remove:'))
    const product = loadProduct(productId)

    if (!product) {
        showError(`Product not found: ${productId}`)
        throw new Error(`Product not found: ${productId}`)
    }

    console.log(`\n${colors.bright}${colors.red}Product to remove:${colors.reset}`)
    console.log(`  ${colors.bright}ID:${colors.reset} ${colors.cyan}${product.id}${colors.reset}`)
    console.log(`  ${colors.bright}Name:${colors.reset} ${product.name}`)
    console.log(
        `  ${colors.bright}File:${colors.reset} ${colors.dim}src/data/products/${product.id}.json${colors.reset}`
    )

    // Check cross-references
    showWarning('Checking cross-references...')
    const references = checkCrossReferences(product.id)

    if (references.length > 0) {
        console.log(`\n${colors.bright}Found references:${colors.reset}`)
        console.log(
            `  ${colors.yellow}Cross-sell references (${references.length} products reference this):${colors.reset}`
        )
        references.forEach((ref) => {
            console.log(
                `    ${colors.dim}•${colors.reset} ${ref.productId} ${colors.dim}(${ref.productName})${colors.reset}`
            )
        })

        if (!args.force) {
            showError('Cannot remove product that is referenced in crossSellIds of other products.')
            console.log(
                `   ${colors.dim}Update those products first, or use --force flag.${colors.reset}`
            )
            throw new Error('Product is referenced by other products')
        } else {
            showWarning('Forcing removal despite references...')
        }
    }

    const confirmed = await confirm(`${colors.red}Confirm removal?${colors.reset}`)
    if (!confirmed) {
        showWarning('Operation cancelled')
        throw new Error('Operation cancelled by user')
    }

    removeProduct(product.id)
    showSuccess(`Product removed: src/data/products/${product.id}.json`)
    showWarning('IMPORTANT: Run validation to check for broken references:')
    console.log(`   ${colors.green}npm run validate:products${colors.reset}`)
}

// ============================================================================
// Sales Copy CLI Operations
// ============================================================================

/**
 * Parse array input from CLI (supports JSON array or comma-separated values)
 */
function parseArrayInput(input: string | undefined): string[] | undefined {
    if (!input) return undefined

    // Try parsing as JSON first
    if (input.startsWith('[')) {
        try {
            const parsed = JSON.parse(input)
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item))
            }
        } catch {
            // Fall through to comma-separated parsing
        }
    }

    // Parse as comma-separated values
    return input
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
}

/**
 * Handle sales-copy:* CLI operations
 */
async function handleSalesCopyOperation(args: CliArgs): Promise<void> {
    if (!args.id) {
        showError('--id is required for sales-copy operations')
        process.exit(1)
    }

    const product = loadProduct(args.id)
    if (!product) {
        showError(`Product not found: ${args.id}`)
        process.exit(1)
    }

    const subOp = args.operation!.split(':')[1]

    switch (subOp) {
        case 'list':
            await operationSalesCopyList(args, product)
            break
        case 'add':
            await operationSalesCopyAdd(args, product)
            break
        case 'edit':
            await operationSalesCopyEdit(args, product)
            break
        case 'enable':
            await operationSalesCopyEnable(args, product)
            break
        case 'duplicate':
            await operationSalesCopyDuplicate(args, product)
            break
        case 'remove':
            await operationSalesCopyRemove(args, product)
            break
        default:
            showError(`Invalid sales-copy operation: ${subOp}`)
            process.exit(1)
    }
}

async function operationSalesCopyList(args: CliArgs, product: Product): Promise<void> {
    const variants = listSalesCopyVariants(product.id)
    const activeVariant = product.activeSalesCopyId || 'default'

    console.log(`\nSales Copy Variants for ${product.id}:`)
    console.log(`Active: ${activeVariant}\n`)

    if (variants.length === 0) {
        console.log('No variants found')
    } else {
        variants.forEach((v) => {
            const marker = v === activeVariant ? '✅' : '  '
            console.log(`${marker} ${v}`)
        })
    }
}

async function operationSalesCopyAdd(args: CliArgs, product: Product): Promise<void> {
    const salesCopyId = args['sales-copy-id']
    if (!salesCopyId) {
        showError('--sales-copy-id is required')
        process.exit(1)
    }

    const path = getSalesCopyPath(product.id, salesCopyId)
    if (existsSync(path)) {
        showError(`Variant "${salesCopyId}" already exists`)
        process.exit(1)
    }

    // Create minimal template with CLI args if provided
    const salesCopyData: SalesCopyData = {
        tagline: args['sales-copy-tagline'] || product.name || 'Product Tagline',
        problem: args['sales-copy-problem'] || 'Problem statement',
        problemPoints: ['Problem point 1'],
        agitate: 'Agitation statement',
        agitatePoints: ['Pain point 1'],
        solution: args['sales-copy-solution'] || 'Solution statement',
        solutionPoints: ['Benefit 1'],
        description: args['sales-copy-description'] || 'Product description',
        features: ['Feature 1'],
        benefits: { immediate: [], systematic: [], longTerm: [] },
        targetAudience: [],
        perfectFor: [],
        notForYou: [],
        trustBadges: [],
        guarantees: []
    }

    saveSalesCopyFile(product.id, salesCopyId, salesCopyData)
    showSuccess(`Sales copy variant "${salesCopyId}" created`)
}

async function operationSalesCopyEdit(args: CliArgs, product: Product): Promise<void> {
    const salesCopyId = args['sales-copy-id']
    if (!salesCopyId) {
        showError('--sales-copy-id is required')
        process.exit(1)
    }

    const file = loadSalesCopyFile(product.id, salesCopyId)
    if (!file) {
        showError(`Variant "${salesCopyId}" not found`)
        process.exit(1)
    }

    // Update fields if provided - Basic strings
    if (args['sales-copy-tagline']) file.salesCopy.tagline = args['sales-copy-tagline']
    if (args['sales-copy-secondary-tagline'])
        file.salesCopy.secondaryTagline = args['sales-copy-secondary-tagline']
    if (args['sales-copy-description']) file.salesCopy.description = args['sales-copy-description']

    // PAS Framework
    if (args['sales-copy-problem']) file.salesCopy.problem = args['sales-copy-problem']
    if (args['sales-copy-agitate']) file.salesCopy.agitate = args['sales-copy-agitate']
    if (args['sales-copy-solution']) file.salesCopy.solution = args['sales-copy-solution']

    // PAS Arrays
    const problemPoints = parseArrayInput(args['sales-copy-problem-points'])
    if (problemPoints) file.salesCopy.problemPoints = problemPoints

    const agitatePoints = parseArrayInput(args['sales-copy-agitate-points'])
    if (agitatePoints) file.salesCopy.agitatePoints = agitatePoints

    const solutionPoints = parseArrayInput(args['sales-copy-solution-points'])
    if (solutionPoints) file.salesCopy.solutionPoints = solutionPoints

    // Content Arrays
    const features = parseArrayInput(args['sales-copy-features'])
    if (features) file.salesCopy.features = features

    const targetAudience = parseArrayInput(args['sales-copy-target-audience'])
    if (targetAudience) file.salesCopy.targetAudience = targetAudience

    const perfectFor = parseArrayInput(args['sales-copy-perfect-for'])
    if (perfectFor) file.salesCopy.perfectFor = perfectFor

    const notForYou = parseArrayInput(args['sales-copy-not-for-you'])
    if (notForYou) file.salesCopy.notForYou = notForYou

    // Trust Arrays
    const trustBadges = parseArrayInput(args['sales-copy-trust-badges'])
    if (trustBadges) file.salesCopy.trustBadges = trustBadges

    const guarantees = parseArrayInput(args['sales-copy-guarantees'])
    if (guarantees) file.salesCopy.guarantees = guarantees

    // Benefits Object
    const benefitsImmediate = parseArrayInput(args['sales-copy-benefits-immediate'])
    const benefitsSystematic = parseArrayInput(args['sales-copy-benefits-systematic'])
    const benefitsLongTerm = parseArrayInput(args['sales-copy-benefits-long-term'])

    if (benefitsImmediate || benefitsSystematic || benefitsLongTerm) {
        file.salesCopy.benefits = {
            immediate: benefitsImmediate || file.salesCopy.benefits.immediate,
            systematic: benefitsSystematic || file.salesCopy.benefits.systematic,
            longTerm: benefitsLongTerm || file.salesCopy.benefits.longTerm
        }
    }

    // SEO Fields
    if (args['sales-copy-meta-title']) file.salesCopy.metaTitle = args['sales-copy-meta-title']
    if (args['sales-copy-meta-description'])
        file.salesCopy.metaDescription = args['sales-copy-meta-description']

    const keywords = parseArrayInput(args['sales-copy-keywords'])
    if (keywords) file.salesCopy.keywords = keywords

    saveSalesCopyFile(product.id, salesCopyId, file.salesCopy)
    showSuccess(`Variant "${salesCopyId}" updated`)
}

async function operationSalesCopyEnable(args: CliArgs, product: Product): Promise<void> {
    const salesCopyId = args['sales-copy-id']
    if (!salesCopyId) {
        showError('--sales-copy-id is required')
        process.exit(1)
    }

    const variants = listSalesCopyVariants(product.id)
    if (!variants.includes(salesCopyId)) {
        showError(`Variant "${salesCopyId}" not found`)
        process.exit(1)
    }

    product.activeSalesCopyId = salesCopyId
    saveProduct(product)
    showSuccess(`Variant "${salesCopyId}" is now active`)
}

async function operationSalesCopyDuplicate(args: CliArgs, product: Product): Promise<void> {
    const salesCopyId = args['sales-copy-id']
    const newSalesCopyId = args['new-sales-copy-id']

    if (!salesCopyId || !newSalesCopyId) {
        showError('--sales-copy-id and --new-sales-copy-id are required')
        process.exit(1)
    }

    const sourceFile = loadSalesCopyFile(product.id, salesCopyId)
    if (!sourceFile) {
        showError(`Source variant "${salesCopyId}" not found`)
        process.exit(1)
    }

    const targetPath = getSalesCopyPath(product.id, newSalesCopyId)
    if (existsSync(targetPath)) {
        showError(`Target variant "${newSalesCopyId}" already exists`)
        process.exit(1)
    }

    saveSalesCopyFile(product.id, newSalesCopyId, sourceFile.salesCopy)
    showSuccess(`Variant "${salesCopyId}" duplicated to "${newSalesCopyId}"`)
}

async function operationSalesCopyRemove(args: CliArgs, product: Product): Promise<void> {
    const salesCopyId = args['sales-copy-id']
    if (!salesCopyId) {
        showError('--sales-copy-id is required')
        process.exit(1)
    }

    const activeVariant = product.activeSalesCopyId || 'default'
    if (salesCopyId === activeVariant) {
        showError('Cannot remove active variant')
        process.exit(1)
    }

    const path = getSalesCopyPath(product.id, salesCopyId)
    if (!existsSync(path)) {
        showError(`Variant "${salesCopyId}" not found`)
        process.exit(1)
    }

    deleteSalesCopyFile(product.id, salesCopyId)
    showSuccess(`Variant "${salesCopyId}" removed`)
}

// ============================================================================
// Main
// ============================================================================

/**
 * Main menu loop
 */
async function mainMenu(): Promise<void> {
    while (true) {
        showBanner()

        const operation = await select({
            message: 'What would you like to do?',
            choices: [
                { name: '📋 List products', value: 'list' },
                { name: '➕ Add new product', value: 'add' },
                { name: '✏️ Edit existing product', value: 'edit' },
                { name: '🗑️ Remove product', value: 'remove' },
                { name: '👋 Exit', value: 'exit' }
            ],
            pageSize: 10
        })

        if (operation === 'exit') {
            console.log(
                `\n${colors.bright}${colors.cyan}Thanks for using Product Management CLI! 👋${colors.reset}\n`
            )
            process.exit(0)
        }

        // Execute the selected operation
        try {
            const args: CliArgs = { operation: operation as 'list' | 'add' | 'edit' | 'remove' }

            switch (operation) {
                case 'list':
                    await operationList(args)
                    break
                case 'add':
                    await operationAdd(args)
                    break
                case 'edit':
                    await operationEdit(args)
                    break
                case 'remove':
                    await operationRemove(args)
                    break
            }

            // After operation completes, ask what to do next
            const nextAction = await select({
                message: 'What would you like to do next?',
                choices: [
                    { name: '🔄 Return to main menu', value: 'menu' },
                    { name: '👋 Exit', value: 'exit' }
                ]
            })

            if (nextAction === 'exit') {
                console.log(
                    `\n${colors.bright}${colors.cyan}Thanks for using Product Management CLI! 👋${colors.reset}\n`
                )
                process.exit(0)
            }
        } catch (error) {
            // Handle errors gracefully
            if (error instanceof Error && error.message.includes('cancelled')) {
                showInfo('Operation cancelled')
            } else {
                showError(error instanceof Error ? error.message : String(error))
            }

            const continueAfterError = await select({
                message: 'An error occurred. What would you like to do?',
                choices: [
                    { name: '🔄 Return to main menu', value: true },
                    { name: '👋 Exit', value: false }
                ]
            })

            if (!continueAfterError) {
                process.exit(1)
            }
        }
    }
}

/**
 * Main entry point
 */
async function main() {
    const args = parseArgs()

    // If CLI arguments provided, run in CLI mode (no menu loop)
    if (args.operation) {
        try {
            // Handle sub-operations (media:*, faq:*, testimonial:*, sales-copy:*)
            if (args.operation.startsWith('sales-copy:')) {
                await handleSalesCopyOperation(args)
            } else {
                switch (args.operation) {
                    case 'list':
                        await operationList(args)
                        break
                    case 'add':
                        await operationAdd(args)
                        break
                    case 'edit':
                        await operationEdit(args)
                        break
                    case 'remove':
                        await operationRemove(args)
                        break
                    default:
                        showError(
                            'Invalid operation. Use: list, add, edit, remove, or sales-copy:*'
                        )
                        process.exit(1)
                }
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    } else {
        // No CLI arguments - start interactive menu
        try {
            await mainMenu()
        } catch (error) {
            // Handle Ctrl+C gracefully
            if (error && typeof error === 'object' && 'name' in error) {
                if (error.name === 'ExitPromptError') {
                    console.log(
                        `\n${colors.bright}${colors.cyan}Thanks for using Product Management CLI! 👋${colors.reset}\n`
                    )
                    process.exit(0)
                }
            }
            showError(error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    }
}

if (import.meta.main) {
    main()
}
