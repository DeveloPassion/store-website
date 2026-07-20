#!/usr/bin/env bun
/**
 * Generates dist/products-light.json — a slim, public-consumable product
 * catalog for downstream sites (ai-wiki-template, wiki content repos, etc.)
 * to build CTAs against without parsing the full src/data/products.json.
 *
 * Source: src/data/products.json (aggregated)
 * Output: dist/products-light.json
 *
 * The "light" payload includes a compact `pricing` block per product so
 * downstream sites (the Ghost theme, wiki sites) can render always-fresh
 * prices without parsing the full catalog: base price + ready-to-render
 * `priceDisplay`, and per-variant prices (with the frequency matrix for
 * subscriptions). Consumers that follow the "no prices in CTAs" policy can
 * simply ignore the block.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { AggregatedProduct } from '../../src/schemas/product.schema.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SRC = join(__dirname, '../../src/data/products.json')
const OUT_DIR = join(__dirname, '../../dist')
const OUT = join(OUT_DIR, 'products-light.json')

const STORE_URL = 'https://store.dsebastien.net'

if (!existsSync(SRC)) {
    console.error(
        `missing ${SRC} — run \`bun run aggregate:products\` first (the build script does this for you)`
    )
    process.exit(1)
}

const products: AggregatedProduct[] = JSON.parse(readFileSync(SRC, 'utf-8'))

type LightVariantPrices = {
    monthly?: number
    quarterly?: number
    yearly?: number
    biennial?: number
    oneTime?: number
}

type LightVariant = {
    name: string
    price: number | null
    priceDisplay: string | null
    prices: LightVariantPrices | null
    // Benefit copy + inclusions so downstream sites (Ghost theme subscription
    // panel, wiki CTAs) can render tier cards without duplicating this data.
    // includedProducts are ids that resolve against this same catalog.
    description: string | null
    includedProducts: string[] | null
    // Ready-to-use store deep link for this variant (no hardcoded query strings
    // in consumers).
    url: string | null
}

type LightPricing = {
    currency: 'EUR'
    price: number | null
    priceDisplay: string | null
    isSubscription: boolean
    defaultPaymentFrequency: string | null
    variants: LightVariant[] | null
}

type LightProduct = {
    id: string
    name: string
    shortDescription: string | null
    tags: string[]
    mainCategory: string | null
    priceTier: string | null
    targetExperienceLevel: string | null
    href: string
    badge: 'flagship' | 'bestseller' | 'featured' | null
    featured: boolean
    bestseller: boolean
    bestValue: boolean
    priority: number
    image: string | null
    imageAlt: string | null
    pricing: LightPricing
}

const hasRealPath = (u: string | null | undefined): u is string => {
    if (!u) return false
    try {
        const url = new URL(u)
        return url.pathname.replace(/\/$/, '').length > 0
    } catch {
        return false
    }
}

const pickHref = (p: AggregatedProduct): string => {
    // Priority: dedicated branded domain → store hub page → blog article → Gumroad.
    // The store hub page exists for every product, so Gumroad is reached only
    // when the store hub URL itself somehow fails validation (which it won't
    // under normal conditions). Gumroad is intentionally last — it's a
    // third-party checkout, not our branded surface.
    const storeUrl = `${STORE_URL}/product/${p.id}`
    const candidates = [p.landingPageUrl, storeUrl, p.dsebastienUrl, p.gumroadUrl].filter(
        hasRealPath
    )
    return candidates[0] as string
}

const pickShortDescription = (p: AggregatedProduct): string | null => {
    if (p.shortDescription) return p.shortDescription as unknown as string
    const sc = (p as unknown as { salesCopy?: { tagline?: string; secondaryTagline?: string } })
        .salesCopy
    return sc?.tagline ?? sc?.secondaryTagline ?? null
}

const pickCover = (p: AggregatedProduct): { image: string | null; imageAlt: string | null } => {
    const covers = (p.media ?? [])
        .filter((m) => m.type === 'image' && m.group === 'cover' && m.url.trim().length > 0)
        .sort((a, b) => a.order - b.order)
    const cover = covers[0]
    if (!cover) return { image: null, imageAlt: null }
    const image = cover.url.startsWith('http')
        ? cover.url
        : `${STORE_URL}${cover.url.startsWith('/') ? '' : '/'}${cover.url}`
    return { image, imageAlt: cover.altText ?? cover.title ?? null }
}

const pickBadge = (p: AggregatedProduct): LightProduct['badge'] => {
    if (p.bestValue) return 'flagship'
    if (p.bestseller) return 'bestseller'
    if (p.featured) return 'featured'
    return null
}

const compactPrices = (
    prices: Record<string, number | null> | null | undefined
): LightVariantPrices | null => {
    if (!prices) return null
    const entries = Object.entries(prices).filter(([, v]) => typeof v === 'number')
    return entries.length ? (Object.fromEntries(entries) as LightVariantPrices) : null
}

const pickPricing = (p: AggregatedProduct): LightPricing => {
    const raw = p as unknown as {
        price?: number | null
        priceDisplay?: string | null
        isSubscription?: boolean
        defaultPaymentFrequency?: string | null
        variants?: Array<{
            name?: string | null
            price?: number | null
            priceDisplay?: string | null
            prices?: Record<string, number | null> | null
            description?: string | null
            includedProducts?: string[] | null
            paymentFrequency?: string | null
        }> | null
    }
    const variantSlug = (name: string): string =>
        name
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-')
    const variants = (raw.variants ?? [])
        .filter((v) => v.name)
        .map((v) => {
            const freq = v.paymentFrequency ?? raw.defaultPaymentFrequency ?? 'quarterly'
            return {
                name: v.name as string,
                price: typeof v.price === 'number' ? v.price : null,
                priceDisplay: v.priceDisplay ?? null,
                prices: compactPrices(v.prices),
                description: v.description ?? null,
                includedProducts:
                    Array.isArray(v.includedProducts) && v.includedProducts.length
                        ? v.includedProducts
                        : null,
                url: `${STORE_URL}/product/${p.id}?variant=${variantSlug(v.name as string)}&frequency=${freq}`
            }
        })
    return {
        currency: 'EUR',
        price: typeof raw.price === 'number' ? raw.price : null,
        priceDisplay: raw.priceDisplay ?? null,
        isSubscription: Boolean(raw.isSubscription),
        defaultPaymentFrequency: raw.defaultPaymentFrequency ?? null,
        variants: variants.length ? variants : null
    }
}

const light: LightProduct[] = products
    .filter((p) => p.id && p.name && Array.isArray(p.tags))
    .map((p) => ({
        id: p.id,
        name: p.name,
        shortDescription: pickShortDescription(p),
        tags: p.tags,
        mainCategory: (p.mainCategory as string | null) ?? null,
        priceTier: (p.priceTier as string | null) ?? null,
        targetExperienceLevel: (p.targetExperienceLevel as string | null) ?? null,
        href: pickHref(p),
        badge: pickBadge(p),
        featured: Boolean(p.featured),
        bestseller: Boolean(p.bestseller),
        bestValue: Boolean(p.bestValue),
        priority: typeof p.priority === 'number' ? p.priority : 0,
        ...pickCover(p),
        pricing: pickPricing(p)
    }))
    .sort((a, b) => {
        const rank = (x: LightProduct) =>
            (x.bestValue ? 500 : 0) + (x.bestseller ? 250 : 0) + (x.featured ? 100 : 0) + x.priority
        return rank(b) - rank(a)
    })

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const payload = {
    $schema: 'https://store.dsebastien.net/products-light.schema.json',
    generatedAt: new Date().toISOString(),
    count: light.length,
    products: light
}

writeFileSync(OUT, JSON.stringify(payload, null, 2))

console.log(`✓ generated ${OUT} (${light.length} products)`)
