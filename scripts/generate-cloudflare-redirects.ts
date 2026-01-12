#!/usr/bin/env bun
/**
 * Generate Cloudflare _redirects file content from products.json
 *
 * This script reads the products.json file and generates redirect rules for:
 * 1. Primary IDs: /l/{id} → /product/{id}
 * 2. Gumroad Permalinks: /l/{permalink} → /product/{id}
 *
 * Output can be used to populate public/_redirects file
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Product } from '../src/types/product'

const __dirname = dirname(fileURLToPath(import.meta.url))
const productsJsonPath = join(__dirname, '../src/data/products.json')

try {
    const productsData: Product[] = JSON.parse(readFileSync(productsJsonPath, 'utf-8'))

    console.log('# Product page redirects - /l/:id → /product/:id (Primary IDs)')
    for (const product of productsData) {
        console.log(`/l/${product.id} /product/${product.id} 301`)
    }

    console.log('')
    console.log('# Product page redirects - /l/:permalink → /product/:id (Gumroad Permalinks)')
    for (const product of productsData) {
        if (product.permalink && product.permalink !== product.id) {
            console.log(`/l/${product.permalink} /product/${product.id} 301`)
        }
    }

    console.log('')
    console.log('# Other redirects')
    console.log('/affiliates https://developassion.gumroad.com/affiliates 301')

    console.log('')
    console.log('# SPA fallback - catch all non-file requests and serve index.html')
    console.log('/*  /index.html  200')
} catch (error) {
    console.error('Error reading products.json:', error)
    process.exit(1)
}
