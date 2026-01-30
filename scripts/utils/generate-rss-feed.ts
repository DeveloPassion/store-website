#!/usr/bin/env bun
/**
 * Generates an RSS feed (feed.xml) for the store website.
 * Includes all products sorted alphabetically.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { AggregatedProduct } from '../../src/schemas/product.schema.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://store.dsebastien.net'
const FEED_TITLE = 'Knowledge Forge by dSebastien'
const FEED_DESCRIPTION =
    'Courses, Systems & Tools for Knowledge Workers and Creators. Build your personal knowledge system and boost your productivity.'
const FEED_LANGUAGE = 'en-us'
const FEED_AUTHOR = 'Sébastien Dubois'
const FEED_EMAIL = 'sebastien@dsebastien.net'

// Load products data (aggregated products.json with salesCopy nested object)
const productsJsonPath = join(__dirname, '../../src/data/products.json')
const products: AggregatedProduct[] = JSON.parse(readFileSync(productsJsonPath, 'utf-8'))

// Sort products alphabetically by name
const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name))

// Escape XML special characters
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

// Generate RSS feed XML
function generateRssFeed(): string {
    const now = new Date().toUTCString()

    const items = sortedProducts
        .map((product) => {
            const link = `${BASE_URL}/product/${product.id}`
            const description = product.salesCopy?.tagline || product.name
            const categoryName = product.mainCategory
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            const categories = [categoryName, ...product.tags]
                .filter(Boolean)
                .map((cat) => `    <category>${escapeXml(cat)}</category>`)
                .join('\n')

            return `  <item>
    <title>${escapeXml(product.name)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <pubDate>${now}</pubDate>
    <description>${escapeXml(description)} - ${escapeXml(product.priceDisplay)}</description>
${categories}
  </item>`
        })
        .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>${FEED_LANGUAGE}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <managingEditor>${FEED_EMAIL} (${FEED_AUTHOR})</managingEditor>
    <webMaster>${FEED_EMAIL} (${FEED_AUTHOR})</webMaster>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/assets/images/icon.svg</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${BASE_URL}</link>
    </image>
${items}
  </channel>
</rss>
`
}

// Write RSS feed to dist folder
function writeRssFeed(): void {
    const distDir = join(__dirname, '../../dist')

    // Create dist directory if it doesn't exist
    if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
    }

    const feedPath = join(distDir, 'feed.xml')
    const feed = generateRssFeed()

    writeFileSync(feedPath, feed)
    console.log(`✓ RSS feed generated: ${feedPath}`)
    console.log(`  - Total products: ${products.length}`)
}

writeRssFeed()
