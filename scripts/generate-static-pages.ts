#!/usr/bin/env tsx
/**
 * Generates static HTML pages for all routes.
 * This creates a directory structure with index.html files for each route,
 * enabling direct URL access on static hosting like GitHub Pages.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://store.dsebastien.net'

interface Product {
    id: string
    name: string
    permalink: string
    tagline: string
    secondaryTagline?: string
    description: string
    metaDescription: string
    price: number
    priceDisplay: string
    features: string[]
    tags: string[]
    status?: string
    featured?: boolean
    testimonialIds?: string[]
    videoUrl?: string
}

interface ProductsData extends Array<Product> {}

// Load products data
const productsJsonPath = join(__dirname, '../src/data/products.json')
const productsData: ProductsData = JSON.parse(readFileSync(productsJsonPath, 'utf-8'))

// Extract all unique tags
const allTags = Array.from(new Set(productsData.flatMap((product) => product.tags))).sort()

const distDir = join(__dirname, '../dist')

// Read the built index.html
const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8')

/**
 * Escape HTML special characters to prevent XSS and broken HTML
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

// Shared author schema for all pages
const authorSchema = {
    '@type': 'Person',
    '@id': `${BASE_URL}/#person`,
    'name': 'Sébastien Dubois',
    'givenName': 'Sébastien',
    'familyName': 'Dubois',
    'url': 'https://dsebastien.net',
    'image': 'https://www.dsebastien.net/content/images/size/w2000/2024/04/Seb-2022.jpg',
    'jobTitle': 'Knowledge Management & Productivity Mentor',
    'worksFor': {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        'name': 'DeveloPassion',
        'url': 'https://developassion.be'
    },
    'sameAs': [
        'https://www.linkedin.com/in/sebastiend/',
        'https://bsky.app/profile/dsebastien.net',
        'https://pkm.social/@dsebastien',
        'https://github.com/dsebastien',
        'https://dsebastien.medium.com/',
        'https://dev.to/dsebastien',
        'https://www.youtube.com/@dsebastien',
        'https://www.twitch.tv/dsebastien',
        'https://stackoverflow.com/users/226630/dsebastien',
        'https://dsebastien.hashnode.dev/',
        'https://www.reddit.com/user/lechtitseb/',
        'https://x.com/dSebastien'
    ]
}

const publisherSchema = {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    'name': 'DeveloPassion',
    'url': 'https://developassion.be',
    'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.dsebastien.net/content/images/size/w256h256/2022/11/logo_symbol.png',
        'width': 256,
        'height': 256
    }
}

/**
 * Generate Product JSON-LD schema for a product
 */
function generateProductSchema(product: Product): string {
    const productUrl = `${BASE_URL}/l/${product.id}`
    const today = new Date().toISOString().split('T')[0]

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                '@id': `${productUrl}#product`,
                'name': product.name,
                'description': product.description,
                'url': productUrl,
                'sku': product.id,
                'offers': {
                    '@type': 'Offer',
                    'price': product.price.toString(),
                    'priceCurrency': 'EUR',
                    'availability': 'https://schema.org/InStock',
                    'url': productUrl
                },
                'author': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'provider': {
                    '@type': 'Organization',
                    'name': 'DeveloPassion Store',
                    'url': BASE_URL
                },
                'datePublished': today,
                'dateModified': today,
                'inLanguage': 'en',
                'keywords': product.tags.join(', '),
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': 'DeveloPassion Store',
                    'url': BASE_URL
                }
            },
            authorSchema,
            publisherSchema,
            {
                '@type': 'BreadcrumbList',
                '@id': `${productUrl}#breadcrumb`,
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Home',
                        'item': BASE_URL
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': product.name,
                        'item': productUrl
                    }
                ]
            }
        ]
    }

    return JSON.stringify(schema, null, 12)
}

/**
 * Generate CollectionPage JSON-LD schema for a tag page
 */
function generateTagSchema(tag: string, encodedTag: string): string {
    const tagUrl = `${BASE_URL}/tag/${encodedTag}`

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${tagUrl}#collection`,
                'name': `${tag} - DeveloPassion Store`,
                'description': `Products tagged with "${tag}"`,
                'url': tagUrl,
                'creator': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': 'DeveloPassion Store',
                    'url': BASE_URL
                },
                'about': {
                    '@type': 'Thing',
                    'name': tag
                },
                'inLanguage': 'en'
            },
            authorSchema,
            publisherSchema,
            {
                '@type': 'BreadcrumbList',
                '@id': `${tagUrl}#breadcrumb`,
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Home',
                        'item': BASE_URL
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': tag,
                        'item': tagUrl
                    }
                ]
            }
        ]
    }

    return JSON.stringify(schema, null, 12)
}

/**
 * Generate noscript content for a tag page
 */
function generateTagNoscript(tag: string): string {
    const taggedProducts = productsData.filter((p) => p.tags.includes(tag))

    return `
    <noscript>
        <article class="noscript-content" style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;">
            <h1>${escapeHtml(tag)} - Products</h1>
            <p>Products tagged with "${escapeHtml(tag)}"</p>
            <p><strong>Total products:</strong> ${taggedProducts.length}</p>
            <h2>Products</h2>
            <ul>
${taggedProducts
    .map(
        (p) =>
            `                <li><a href="/l/${p.id}">${escapeHtml(p.name)}</a> (${escapeHtml(p.priceDisplay)}) - ${escapeHtml(p.tagline)}</li>`
    )
    .join('\n')}
            </ul>
            <p><a href="/">← Back to store</a></p>
        </article>
    </noscript>`
}

/**
 * Generate customized HTML for a tag page with appropriate meta tags
 */
function generateTagPageHtml(tag: string, encodedTag: string): string {
    const tagUrl = `${BASE_URL}/tag/${encodedTag}`
    const title = `${tag} - dSebastien's Toolbox`
    const description = `Products tagged with "${tag}"`

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    // Update canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${tagUrl}" />`
    )

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
    )

    // Update Open Graph tags
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${tagUrl}" />`
    )
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${escapeHtml(description)}" />`
    )

    // Update Twitter tags
    html = html.replace(
        /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:url" content="${tagUrl}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    )

    // Replace JSON-LD schema with CollectionPage schema
    const tagSchema = generateTagSchema(tag, encodedTag)
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${tagSchema}\n        </script>`
    )

    // Add noscript content before </body>
    const noscriptContent = generateTagNoscript(tag)
    html = html.replace('</body>', `${noscriptContent}\n    </body>`)

    return html
}

/**
 * Generate noscript content for a product page
 */
function generateProductNoscript(product: Product): string {
    return `
    <noscript>
        <article class="noscript-content" style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;">
            <h1>${escapeHtml(product.name)}</h1>
            <p><em>${escapeHtml(product.tagline)}</em></p>
            <p>${escapeHtml(product.description)}</p>
            <p><strong>Price:</strong> ${escapeHtml(product.priceDisplay)}</p>
            ${product.tags.length > 0 ? `<p><strong>Tags:</strong> ${product.tags.map(escapeHtml).join(', ')}</p>` : ''}
            ${product.features.length > 0 ? `<h2>Features</h2><ul>${product.features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
            <p><a href="/">← Back to store</a></p>
        </article>
    </noscript>`
}

/**
 * Generate customized HTML for a product page with appropriate meta tags
 */
function generateProductPageHtml(product: Product): string {
    const productUrl = `${BASE_URL}/l/${product.id}`
    const title = product.metaTitle || `${product.name} - DeveloPassion Store`
    const description = product.metaDescription

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    // Update canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${productUrl}" />`
    )

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
    )

    // Update Open Graph tags
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${productUrl}" />`
    )
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${escapeHtml(description)}" />`
    )

    // Update Twitter tags
    html = html.replace(
        /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:url" content="${productUrl}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    )

    // Replace JSON-LD schema with Product schema
    const productSchema = generateProductSchema(product)
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${productSchema}\n        </script>`
    )

    // Add noscript content before </body>
    const noscriptContent = generateProductNoscript(product)
    html = html.replace('</body>', `${noscriptContent}\n    </body>`)

    return html
}

// Create directories and generate customized HTML for each tag
console.log('Generating static pages for tags...')
let tagCount = 0
for (const tag of allTags) {
    // URL-encode the tag for the directory name
    const encodedTag = encodeURIComponent(tag)
    const tagDir = join(distDir, 'tag', encodedTag)
    mkdirSync(tagDir, { recursive: true })

    // Generate customized HTML with tag-specific meta tags
    const tagHtml = generateTagPageHtml(tag, encodedTag)
    writeFileSync(join(tagDir, 'index.html'), tagHtml)
    tagCount++
}
console.log(`  ✓ Created ${tagCount} tag pages`)

// Create directories and generate customized HTML for each product
console.log('Generating static pages for products...')
let productCount = 0
for (const product of productsData) {
    const productDir = join(distDir, 'l', product.id)
    mkdirSync(productDir, { recursive: true })
    const productHtml = generateProductPageHtml(product)
    writeFileSync(join(productDir, 'index.html'), productHtml)
    productCount++
}
console.log(`  ✓ Created ${productCount} product pages`)

// Create 404.html for GitHub Pages fallback (copy of index.html)
writeFileSync(join(distDir, '404.html'), indexHtml)
console.log('  ✓ Created 404.html fallback')

console.log(`\n✓ Static pages generated: ${tagCount + productCount + 2} total`)
console.log(`  - Homepage: 1`)
console.log(`  - Tags: ${tagCount}`)
console.log(`  - Products: ${productCount}`)
console.log(`  - 404 fallback: 1`)
