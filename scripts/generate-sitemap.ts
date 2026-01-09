#!/usr/bin/env tsx
/**
 * Generates a sitemap.xml for the store website.
 * Includes the homepage, all product detail pages, and all tag pages.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://store.dsebastien.net'

interface Product {
    id: string
    name: string
    permalink: string
    tagline: string
    description: string
    price: number
    priceDisplay: string
    features: string[]
    tags: string[]
    status?: string
    featured?: boolean
}

interface SitemapUrl {
    loc: string
    lastmod: string
    changefreq: string
    priority: string
}

// Read products data
const productsJsonPath = join(__dirname, '../src/data/products.json')
const productsData: Product[] = JSON.parse(readFileSync(productsJsonPath, 'utf-8'))

// Read categories data
const categoriesJsonPath = join(__dirname, '../src/data/categories.json')
interface Category {
    id: string
    name: string
}
const categoriesData: Category[] = JSON.parse(readFileSync(categoriesJsonPath, 'utf-8'))

// Extract all unique tags
const allTags = Array.from(new Set(productsData.flatMap((product) => product.tags))).sort()

// Get current date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0]

// Generate sitemap XML
function generateSitemap(): string {
    const urls: SitemapUrl[] = []

    // Add homepage
    urls.push({
        loc: BASE_URL,
        lastmod: today,
        changefreq: 'weekly',
        priority: '1.0'
    })

    // Add products page
    urls.push({
        loc: `${BASE_URL}/products`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.9'
    })

    // Add help page
    urls.push({
        loc: `${BASE_URL}/help`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.9'
    })

    // Add featured page
    urls.push({
        loc: `${BASE_URL}/featured`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.9'
    })

    // Add most value page
    urls.push({
        loc: `${BASE_URL}/most-value`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.9'
    })

    // Add best sellers page
    urls.push({
        loc: `${BASE_URL}/best-sellers`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.9'
    })

    // Add tags page
    urls.push({
        loc: `${BASE_URL}/tags`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7'
    })

    // Add categories page
    urls.push({
        loc: `${BASE_URL}/categories`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7'
    })

    // Add each product page
    for (const product of productsData) {
        urls.push({
            loc: `${BASE_URL}/l/${product.id}`,
            lastmod: today,
            changefreq: 'monthly',
            priority: '0.8'
        })
    }

    // Add each tag page
    for (const tag of allTags) {
        urls.push({
            loc: `${BASE_URL}/tags/${encodeURIComponent(tag)}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.6'
        })
    }

    // Add each category page
    for (const category of categoriesData) {
        urls.push({
            loc: `${BASE_URL}/categories/${category.id}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.6'
        })
    }

    // Build XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('\n')}
</urlset>
`

    return xml
}

// Write sitemap to dist folder
function writeSitemap(): void {
    const distDir = join(__dirname, '../dist')

    // Create dist directory if it doesn't exist
    if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
    }

    const sitemapPath = join(distDir, 'sitemap.xml')
    const sitemap = generateSitemap()

    writeFileSync(sitemapPath, sitemap)
    console.log(`✓ Sitemap generated: ${sitemapPath}`)
    console.log(`  - Homepage: 1 URL`)
    console.log(`  - Products page: 1 URL`)
    console.log(`  - Help page: 1 URL`)
    console.log(`  - Featured page: 1 URL`)
    console.log(`  - Most value page: 1 URL`)
    console.log(`  - Best sellers page: 1 URL`)
    console.log(`  - Tags page: 1 URL`)
    console.log(`  - Categories page: 1 URL`)
    console.log(`  - Products: ${productsData.length} URLs`)
    console.log(`  - Individual tag pages: ${allTags.length} URLs`)
    console.log(`  - Individual category pages: ${categoriesData.length} URLs`)
    console.log(
        `  - Total: ${productsData.length + allTags.length + categoriesData.length + 8} URLs`
    )
}

writeSitemap()
