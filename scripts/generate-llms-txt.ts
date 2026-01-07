#!/usr/bin/env tsx
/**
 * Generates llms.txt - a machine-readable summary for AI crawlers.
 * This file helps LLMs understand the site structure and content.
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Product {
    id: string
    name: string
    tagline: string
    description: string
    tags: string[]
    type: string
    categories: string[]
    price: number
    priceDisplay: string
}

interface ProductsData extends Array<Product> {}

// Load products data
const productsJsonPath = join(__dirname, '../src/data/products.json')
const productsData: ProductsData = JSON.parse(readFileSync(productsJsonPath, 'utf-8'))

// Load categories data
const categoriesJsonPath = join(__dirname, '../src/data/categories.json')
interface Category {
    id: string
    name: string
}
const categoriesData: Category[] = JSON.parse(readFileSync(categoriesJsonPath, 'utf-8'))

// Get unique product types
const types = Array.from(new Set(productsData.map((p) => p.type))).sort()

// Count tags
const tagCounts = new Map<string, number>()
productsData.forEach((product) => {
    product.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
})

// Sort tags by count
const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

// Group products by type
const productsByType = new Map<string, Product[]>()
types.forEach((type) => {
    productsByType.set(
        type,
        productsData.filter((p) => p.type === type)
    )
})

// Generate llms.txt content
const content = `# DeveloPassion Store

> A collection of ${productsData.length} professional products for knowledge workers and content creators.

## About
Author: Sébastien Dubois
Website: https://dsebastien.net
Store: https://store.dsebastien.net

## Content Structure
- / - Homepage with products
- /l/{id} - Individual product pages
- /tags - Browse all tags
- /tags/{name} - Tag pages showing related products
- /categories - Browse all categories
- /categories/{id} - Category pages showing related products
- /help - Help and support page

## Product Types
${types
    .map((type) => {
        const count = productsByType.get(type)?.length || 0
        return `- ${type} (${count} products)`
    })
    .join('\n')}

## Key Tags
${topTags.map(([tag, count]) => `- ${tag} (${count} products)`).join('\n')}

## Categories
${categoriesData.map((cat) => `- ${cat.name} (${cat.id})`).join('\n')}

## Products Overview

${types
    .map((type) => {
        const typeProducts = productsByType.get(type) || []
        return `### ${type.charAt(0).toUpperCase() + type.slice(1)}
${typeProducts
    .map(
        (product) => `- **${product.name}**: ${product.tagline}
  Price: ${product.priceDisplay}
  URL: https://store.dsebastien.net/l/${product.id}`
    )
    .join('\n')}`
    })
    .join('\n\n')}

## Data Access
- Products JSON: /src/data/products.json

## Contact
- Author: Sébastien Dubois (https://dsebastien.net)
- GitHub: https://github.com/dsebastien
- LinkedIn: https://www.linkedin.com/in/sebastiend/
`

// Write to dist folder
const distDir = join(__dirname, '../dist')
writeFileSync(join(distDir, 'llms.txt'), content)
console.log(`✓ llms.txt generated with ${productsData.length} products`)
