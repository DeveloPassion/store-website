/**
 * Utility functions for updating HTML meta tags
 */

export interface MetaTagsConfig {
    title: string
    description: string
    url: string
    image?: string
}

/**
 * Update all meta tags (document title, meta description, OG tags, Twitter cards, canonical URL)
 * @param config - Configuration object with title, description, url, and optional image
 */
export function updateAllMetaTags(config: MetaTagsConfig): void {
    const { title, description, url, image } = config
    const defaultImage = 'https://store.dsebastien.net/assets/images/social-card.png'
    const imageUrl = image || defaultImage

    // Update document title
    document.title = title

    // Update meta description
    updateMetaTag('name', 'description', description)

    // Update canonical URL
    updateCanonicalUrl(url)

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', title)
    updateMetaTag('property', 'og:description', description)
    updateMetaTag('property', 'og:url', url)
    updateMetaTag('property', 'og:image', imageUrl)

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:title', title)
    updateMetaTag('name', 'twitter:description', description)
    updateMetaTag('name', 'twitter:url', url)
    updateMetaTag('name', 'twitter:image', imageUrl)
}

/**
 * Update a specific meta tag
 * @param attribute - The attribute to match on ('name' or 'property')
 * @param attributeValue - The value of the attribute to match
 * @param content - The new content value
 */
export function updateMetaTag(
    attribute: 'name' | 'property',
    attributeValue: string,
    content: string
): void {
    const selector = `meta[${attribute}="${attributeValue}"]`
    const metaTag = document.querySelector(selector)
    if (metaTag) {
        metaTag.setAttribute('content', content)
    }
}

/**
 * Update the canonical URL link tag
 * @param url - The canonical URL
 */
export function updateCanonicalUrl(url: string): void {
    const canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonicalLink) {
        canonicalLink.setAttribute('href', url)
    }
}
