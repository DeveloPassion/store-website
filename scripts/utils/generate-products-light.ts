#!/usr/bin/env bun
/**
 * Generates dist/products-light.json — a slim, public-consumable product
 * catalog for downstream sites (ai-wiki-template, wiki content repos, etc.)
 * to build CTAs against without parsing the full src/data/products.json.
 *
 * Source: src/data/products.json (aggregated)
 * Output: dist/products-light.json
 *
 * The "light" payload intentionally omits prices in numeric form. Consumers
 * (e.g. the wiki sites) follow the policy "no prices in CTAs" and only need
 * tier + category + url to render a useful card. If a consumer wants the
 * current price they should fetch the full payload separately or link to
 * the store product page.
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
    const candidates = [p.dsebastienUrl, p.landingPageUrl, p.gumroadUrl].filter(hasRealPath)
    if (candidates.length) return candidates[0] as string
    return `${STORE_URL}/product/${p.id}`
}

const pickShortDescription = (p: AggregatedProduct): string | null => {
    if (p.shortDescription) return p.shortDescription as unknown as string
    const sc = (p as unknown as { salesCopy?: { tagline?: string; secondaryTagline?: string } })
        .salesCopy
    return sc?.tagline ?? sc?.secondaryTagline ?? null
}

const pickBadge = (p: AggregatedProduct): LightProduct['badge'] => {
    if (p.bestValue) return 'flagship'
    if (p.bestseller) return 'bestseller'
    if (p.featured) return 'featured'
    return null
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
        priority: typeof p.priority === 'number' ? p.priority : 0
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
