#!/usr/bin/env bun
/**
 * Generates static HTML pages for all routes.
 * This creates a directory structure with index.html files for each route,
 * enabling direct URL access on static hosting like GitHub Pages.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { Product } from '../../src/schemas/product.schema.js'
import type { Category } from '../../src/schemas/category.schema.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://store.dsebastien.net'

// Load products data
const productsJsonPath = join(__dirname, '../../src/data/products.json')
const productsData: Product[] = JSON.parse(readFileSync(productsJsonPath, 'utf-8'))

// Load categories data
const categoriesJsonPath = join(__dirname, '../../src/data/categories.json')
const categoriesData: Category[] = JSON.parse(readFileSync(categoriesJsonPath, 'utf-8'))

// Extract all unique tags
const allTags = Array.from(new Set(productsData.flatMap((product) => product.tags))).sort()

const distDir = join(__dirname, '../../dist')

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

/**
 * Get the optimal Open Graph image URL for a product
 * Uses cover image if available, otherwise falls back to default social card
 */
function getProductOgImageUrl(product: Product): string {
    const defaultImage = `${BASE_URL}/assets/images/social-card.png`

    if (!product.media || product.media.length === 0) {
        return defaultImage
    }

    // Find cover images and use the primary one (lowest order = highest priority)
    const coverImage = product.media
        .filter((item) => item.type === 'image' && item.group === 'cover')
        .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))[0]

    if (!coverImage) {
        return defaultImage
    }

    // Convert relative URLs to absolute
    const imageUrl = coverImage.url.startsWith('http')
        ? coverImage.url
        : `${BASE_URL}${coverImage.url}`

    return imageUrl
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
    const productUrl = `${BASE_URL}/product/${product.id}`
    const today = new Date().toISOString().split('T')[0]

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                '@id': `${productUrl}#product`,
                'name': product.name,
                'description': product.salesCopy.description,
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
                    'name': 'Knowledge Forge',
                    'url': BASE_URL
                },
                'datePublished': today,
                'dateModified': today,
                'inLanguage': 'en',
                'keywords': product.tags.join(', '),
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': 'Knowledge Forge',
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
    const tagUrl = `${BASE_URL}/tags/${encodedTag}`

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${tagUrl}#collection`,
                'name': `${tag} - Knowledge Forge`,
                'description': `Products tagged with "${tag}"`,
                'url': tagUrl,
                'creator': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': 'Knowledge Forge',
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
            `                <li><a href="/product/${p.id}">${escapeHtml(p.name)}</a> (${escapeHtml(p.priceDisplay)}) - ${escapeHtml(p.salesCopy.tagline)}</li>`
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
    const tagUrl = `${BASE_URL}/tags/${encodedTag}`
    const title = `${tag} - Knowledge Forge`
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
 * Generate CollectionPage JSON-LD schema for the tags index page
 */
function generateTagsIndexSchema(): string {
    const tagsUrl = `${BASE_URL}/tags`

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${tagsUrl}#collection`,
                'name': 'Tags - Knowledge Forge',
                'description': 'Browse products by tag',
                'url': tagsUrl,
                'creator': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': 'Knowledge Forge',
                    'url': BASE_URL
                },
                'inLanguage': 'en'
            },
            authorSchema,
            publisherSchema,
            {
                '@type': 'BreadcrumbList',
                '@id': `${tagsUrl}#breadcrumb`,
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
                        'name': 'Tags',
                        'item': tagsUrl
                    }
                ]
            }
        ]
    }

    return JSON.stringify(schema, null, 12)
}

/**
 * Generate noscript content for the tags index page
 */
function generateTagsIndexNoscript(): string {
    return `
    <noscript>
        <article class="noscript-content" style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;">
            <h1>Tags</h1>
            <p>Browse products by tag</p>
            <p><strong>Total tags:</strong> ${allTags.length}</p>
            <h2>All Tags</h2>
            <ul>
${allTags
    .map(
        (tag) =>
            `                <li><a href="/tags/${encodeURIComponent(tag)}">${escapeHtml(tag)}</a></li>`
    )
    .join('\n')}
            </ul>
            <p><a href="/">← Back to store</a></p>
        </article>
    </noscript>`
}

/**
 * Generate customized HTML for the tags index page with appropriate meta tags
 */
function generateTagsIndexPageHtml(): string {
    const tagsUrl = `${BASE_URL}/tags`
    const title = 'Tags - Knowledge Forge'
    const description = 'Browse all product tags to find what you need'

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    // Update canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${tagsUrl}" />`
    )

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
    )

    // Update Open Graph tags
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${tagsUrl}" />`
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
        `<meta name="twitter:url" content="${tagsUrl}" />`
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
    const tagsIndexSchema = generateTagsIndexSchema()
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${tagsIndexSchema}\n        </script>`
    )

    // Add noscript content before </body>
    const noscriptContent = generateTagsIndexNoscript()
    html = html.replace('</body>', `${noscriptContent}\n    </body>`)

    return html
}

/**
 * Generate CollectionPage JSON-LD schema for a category page
 */
function generateCategorySchema(category: Category): string {
    const categoryUrl = `${BASE_URL}/categories/${category.id}`

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${categoryUrl}#collection`,
                'name': `${category.name} - Knowledge Forge`,
                'description': category.description,
                'url': categoryUrl,
                'creator': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': 'Knowledge Forge',
                    'url': BASE_URL
                },
                'about': {
                    '@type': 'Thing',
                    'name': category.name
                },
                'inLanguage': 'en'
            },
            authorSchema,
            publisherSchema,
            {
                '@type': 'BreadcrumbList',
                '@id': `${categoryUrl}#breadcrumb`,
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
                        'name': category.name,
                        'item': categoryUrl
                    }
                ]
            }
        ]
    }

    return JSON.stringify(schema, null, 12)
}

/**
 * Generate noscript content for a category page
 */
function generateCategoryNoscript(category: Category): string {
    const categoryProducts = productsData.filter((p) => {
        const allCategories = [p.mainCategory, ...p.secondaryCategories.map((sc) => sc.id)]
        return allCategories.includes(category.id)
    })

    return `
    <noscript>
        <article class="noscript-content" style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;">
            <h1>${escapeHtml(category.name)} - Products</h1>
            <p>${escapeHtml(category.description)}</p>
            <p><strong>Total products:</strong> ${categoryProducts.length}</p>
            <h2>Products</h2>
            <ul>
${categoryProducts
    .map(
        (p) =>
            `                <li><a href="/product/${p.id}">${escapeHtml(p.name)}</a> (${escapeHtml(p.priceDisplay)}) - ${escapeHtml(p.salesCopy.tagline)}</li>`
    )
    .join('\n')}
            </ul>
            <p><a href="/">← Back to store</a></p>
        </article>
    </noscript>`
}

/**
 * Generate customized HTML for a category page with appropriate meta tags
 */
function generateCategoryPageHtml(category: Category): string {
    const categoryUrl = `${BASE_URL}/categories/${category.id}`
    const title = `${category.name} - Knowledge Forge`
    const description = category.description

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    // Update canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${categoryUrl}" />`
    )

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
    )

    // Update OG tags
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${escapeHtml(description)}" />`
    )
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${categoryUrl}" />`
    )

    // Update Twitter tags
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    )

    // Add JSON-LD schema
    const categorySchema = generateCategorySchema(category)
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${categorySchema}\n        </script>`
    )

    // Add noscript content before </body>
    const noscriptContent = generateCategoryNoscript(category)
    html = html.replace('</body>', `${noscriptContent}\n    </body>`)

    return html
}

/**
 * Generate CollectionPage JSON-LD schema for the categories index page
 */
function generateCategoriesIndexSchema(): string {
    const categoriesUrl = `${BASE_URL}/categories`

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${categoriesUrl}#collection`,
                'name': 'Categories - Knowledge Forge',
                'description': 'Browse products by category',
                'url': categoriesUrl,
                'creator': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': 'Knowledge Forge',
                    'url': BASE_URL
                },
                'inLanguage': 'en'
            },
            authorSchema,
            publisherSchema,
            {
                '@type': 'BreadcrumbList',
                '@id': `${categoriesUrl}#breadcrumb`,
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
                        'name': 'Categories',
                        'item': categoriesUrl
                    }
                ]
            }
        ]
    }

    return JSON.stringify(schema, null, 12)
}

/**
 * Generate noscript content for the categories index page
 */
function generateCategoriesIndexNoscript(): string {
    return `
    <noscript>
        <article class="noscript-content" style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;">
            <h1>Categories</h1>
            <p>Browse products by category</p>
            <p><strong>Total categories:</strong> ${categoriesData.length}</p>
            <h2>All Categories</h2>
            <ul>
${categoriesData
    .map(
        (cat) =>
            `                <li><a href="/categories/${cat.id}">${escapeHtml(cat.name)}</a> - ${escapeHtml(cat.description)}</li>`
    )
    .join('\n')}
            </ul>
            <p><a href="/">← Back to store</a></p>
        </article>
    </noscript>`
}

/**
 * Generate customized HTML for the categories index page with appropriate meta tags
 */
function generateCategoriesIndexPageHtml(): string {
    const categoriesUrl = `${BASE_URL}/categories`
    const title = 'Categories - Knowledge Forge'
    const description =
        'Browse products by category. Find courses, kits, templates, and tools organized by topic.'

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    // Update canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${categoriesUrl}" />`
    )

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
    )

    // Update OG tags
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${escapeHtml(description)}" />`
    )
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${categoriesUrl}" />`
    )

    // Update Twitter tags
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    )

    // Add JSON-LD schema
    const categoriesIndexSchema = generateCategoriesIndexSchema()
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${categoriesIndexSchema}\n        </script>`
    )

    // Add noscript content before </body>
    const noscriptContent = generateCategoriesIndexNoscript()
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
            <p><em>${escapeHtml(product.salesCopy.tagline)}</em></p>
            <p>${escapeHtml(product.salesCopy.description)}</p>
            <p><strong>Price:</strong> ${escapeHtml(product.priceDisplay)}</p>
            ${product.tags.length > 0 ? `<p><strong>Tags:</strong> ${product.tags.map(escapeHtml).join(', ')}</p>` : ''}
            ${product.contents.length > 0 ? `<h2>What's Included</h2><ul>${product.contents.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>` : ''}
            <p><a href="/">← Back to store</a></p>
        </article>
    </noscript>`
}

/**
 * Generate customized HTML for a product page with appropriate meta tags
 */
function generateProductPageHtml(product: Product): string {
    const productUrl = `${BASE_URL}/product/${product.id}`
    const title = product.salesCopy.metaTitle || `${product.name} - Knowledge Forge`
    const description = product.salesCopy.metaDescription

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

    // Update og:image with cover image if available, otherwise default social card
    const ogImageUrl = getProductOgImageUrl(product)
    html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:image" content="${ogImageUrl}" />`
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

/**
 * Generate WebPage JSON-LD schema for a simple page
 */
function generateWebPageSchema(path: string, title: string, description: string): string {
    const pageUrl = `${BASE_URL}${path}`

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebPage',
                '@id': `${pageUrl}#webpage`,
                'name': title,
                'description': description,
                'url': pageUrl,
                'creator': { '@id': `${BASE_URL}/#person` },
                'publisher': { '@id': `${BASE_URL}/#organization` },
                'isPartOf': {
                    '@type': 'WebSite',
                    '@id': `${BASE_URL}/#website`,
                    'name': 'Knowledge Forge',
                    'url': BASE_URL
                },
                'inLanguage': 'en'
            },
            authorSchema,
            publisherSchema,
            {
                '@type': 'BreadcrumbList',
                '@id': `${pageUrl}#breadcrumb`,
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
                        'name': title.replace(' - Knowledge Forge', ''),
                        'item': pageUrl
                    }
                ]
            }
        ]
    }

    return JSON.stringify(schema, null, 12)
}

/**
 * Generate customized HTML for a simple page with appropriate meta tags
 */
function generateSimplePageHtml(path: string, title: string, description: string): string {
    const pageUrl = `${BASE_URL}${path}`

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)

    // Update canonical URL
    html = html.replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
        `<link rel="canonical" href="${pageUrl}" />`
    )

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
    )

    // Update Open Graph tags
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${pageUrl}" />`
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
        `<meta name="twitter:url" content="${pageUrl}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    )

    // Replace JSON-LD schema with WebPage schema
    const webPageSchema = generateWebPageSchema(path, title, description)
    html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${webPageSchema}\n        </script>`
    )

    return html
}

// Define simple pages to generate
const simplePages = [
    { path: '/products', title: 'Products - Knowledge Forge', description: 'Browse all products' },
    {
        path: '/best-value',
        title: 'Best Value - Knowledge Forge',
        description: 'Best value products and deals'
    },
    {
        path: '/best-sellers',
        title: 'Best Sellers - Knowledge Forge',
        description: 'Most popular products'
    },
    { path: '/featured', title: 'Featured - Knowledge Forge', description: 'Featured products' },
    { path: '/help', title: 'Help - Knowledge Forge', description: 'Get help and support' },
    { path: '/faq', title: 'FAQ - Knowledge Forge', description: 'Frequently asked questions' },
    {
        path: '/testimonials',
        title: 'Testimonials - Knowledge Forge',
        description: 'Customer testimonials and reviews'
    },
    {
        path: '/compare',
        title: 'Compare - Knowledge Forge',
        description: 'Compare products side by side'
    },
    {
        path: '/success-stories',
        title: 'Success Stories - Knowledge Forge',
        description: 'Customer success stories'
    },
    { path: '/wishlist', title: 'Wishlist - Knowledge Forge', description: 'Your saved products' },
    {
        path: '/shared-wishlist',
        title: 'Shared Wishlist - Knowledge Forge',
        description: 'View a shared wishlist'
    }
]

// Generate simple pages
console.log('Generating static pages for app routes...')
let simplePageCount = 0
for (const page of simplePages) {
    const pageDir = join(distDir, page.path.slice(1)) // Remove leading slash
    mkdirSync(pageDir, { recursive: true })
    const pageHtml = generateSimplePageHtml(page.path, page.title, page.description)
    writeFileSync(join(pageDir, 'index.html'), pageHtml)
    simplePageCount++
}
console.log(`  ✓ Created ${simplePageCount} app route pages`)

// Create directory and generate customized HTML for the tags index page
console.log('Generating static page for tags index...')
const tagsDir = join(distDir, 'tags')
mkdirSync(tagsDir, { recursive: true })
const tagsIndexHtml = generateTagsIndexPageHtml()
writeFileSync(join(tagsDir, 'index.html'), tagsIndexHtml)
console.log('  ✓ Created tags index page')

// Create directories and generate customized HTML for each tag
console.log('Generating static pages for individual tags...')
let tagCount = 0
for (const tag of allTags) {
    // URL-encode the tag for the directory name
    const encodedTag = encodeURIComponent(tag)
    const tagDir = join(distDir, 'tags', encodedTag)
    mkdirSync(tagDir, { recursive: true })

    // Generate customized HTML with tag-specific meta tags
    const tagHtml = generateTagPageHtml(tag, encodedTag)
    writeFileSync(join(tagDir, 'index.html'), tagHtml)
    tagCount++
}
console.log(`  ✓ Created ${tagCount} individual tag pages`)

// Create directory and generate customized HTML for the categories index page
console.log('Generating static page for categories index...')
const categoriesDir = join(distDir, 'categories')
mkdirSync(categoriesDir, { recursive: true })
const categoriesIndexHtml = generateCategoriesIndexPageHtml()
writeFileSync(join(categoriesDir, 'index.html'), categoriesIndexHtml)
console.log('  ✓ Created categories index page')

// Create directories and generate customized HTML for each category
console.log('Generating static pages for individual categories...')
let categoryCount = 0
for (const category of categoriesData) {
    const categoryDir = join(distDir, 'categories', category.id)
    mkdirSync(categoryDir, { recursive: true })

    // Generate customized HTML with category-specific meta tags
    const categoryHtml = generateCategoryPageHtml(category)
    writeFileSync(join(categoryDir, 'index.html'), categoryHtml)
    categoryCount++
}
console.log(`  ✓ Created ${categoryCount} individual category pages`)

// Create directories and generate customized HTML for each product
console.log('Generating static pages for products...')
let productCount = 0
for (const product of productsData) {
    const productDir = join(distDir, 'product', product.id)
    mkdirSync(productDir, { recursive: true })
    const productHtml = generateProductPageHtml(product)
    writeFileSync(join(productDir, 'index.html'), productHtml)
    productCount++
}
console.log(`  ✓ Created ${productCount} product pages`)

// Note: 404.html is intentionally NOT generated to enable Cloudflare Pages' automatic SPA fallback
// Unknown routes are handled by React Router's catch-all route which shows NotFoundPage

console.log(
    `\n✓ Static pages generated: ${simplePageCount + tagCount + categoryCount + productCount + 3} total`
)
console.log(`  - Homepage: 1`)
console.log(`  - App route pages: ${simplePageCount}`)
console.log(`  - Tags index: 1`)
console.log(`  - Individual tag pages: ${tagCount}`)
console.log(`  - Categories index: 1`)
console.log(`  - Individual category pages: ${categoryCount}`)
console.log(`  - Products: ${productCount}`)
