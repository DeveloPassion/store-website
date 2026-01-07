#!/usr/bin/env tsx

/**
 * Merge extracted products (8-19) into products.json
 * Products 8-19 have been extracted by AI agents from markdown files
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const PRODUCTS_FILE = resolve(__dirname, '../src/data/products.json')
const DOC_DIR = resolve(__dirname, '../documentation')

// Product IDs for products 8-19 (excluding duplicate it-concepts-wall)
const productFiles = [
    'product-sales-copy-journaling-deep-dive.md', // 8
    'product-sales-copy-personal-organization-101.md', // 9
    'product-sales-copy-clarity-101.md', // 10
    'product-sales-copy-ai-master-prompt.md', // 11
    'product-sales-copy-model-context-protocol.md', // 12
    'product-sales-copy-knowii-community.md', // 13
    'product-sales-copy-it-concepts-wall.md', // 14
    'product-sales-copy-pkm-coaching.md', // 15
    'product-sales-copy-knowledge-system-checklist.md', // 16
    'product-sales-copy-beginners-guide-obsidian.md', // 17
    'product-sales-copy-everything-knowledge-bundle.md' // 18
]

// Read current products
const currentProducts = JSON.parse(readFileSync(PRODUCTS_FILE, 'utf-8'))

console.log(`Current products count: ${currentProducts.length}`)
console.log('Expected final count: 18 (7 existing + 11 new)')
console.log('\nNote: it-concepts-wall appears as both product 14 and 19 - using only product 14')

// For now, just verify the file structure
console.log('\nProducts file is valid JSON with', currentProducts.length, 'products')
console.log('Products:', currentProducts.map((p: any) => p.id).join(', '))
