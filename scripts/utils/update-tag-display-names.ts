#!/usr/bin/env bun
/**
 * Update tag display names in tags.json without changing other metadata
 * This preserves featured status, priorities, icons, and colors
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TAGS_FILE = resolve(__dirname, '../../src/data/tags.json')

function generateDisplayName(tagId: string): string {
    // Special cases - full tag replacements
    const specialCases: Record<string, string> = {
        'chatgpt': 'ChatGPT',
        'gtd': 'GTD',
        'llms': 'LLMs',
        'mcp': 'MCP',
        'para': 'PARA',
        'para-method': 'PARA Method',
        'smart-goals': 'SMART Goals',
        'it-fundamentals': 'IT Fundamentals',
        'johnny-decimal': 'Johnny.Decimal'
    }

    if (specialCases[tagId]) {
        return specialCases[tagId]
    }

    // Acronyms that should be uppercase when standalone
    const acronyms = new Set(['pkm', 'ai', 'seo', 'api', 'ui', 'ux', 'it', 'hr', 'llm'])

    // Full uppercase for standalone acronyms
    if (acronyms.has(tagId)) {
        return tagId.toUpperCase()
    }

    // Convert kebab-case to Title Case, handling AI prefix specially
    return tagId
        .split('-')
        .map((word, index) => {
            // Handle AI as a special prefix
            if (word === 'ai' && index === 0) {
                return 'AI'
            }
            // Handle other acronyms
            if (acronyms.has(word)) {
                return word.toUpperCase()
            }
            // Normal title case
            return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
}

function main() {
    console.log('🔄 Updating tag display names in tags.json...\n')

    const tagsData = JSON.parse(readFileSync(TAGS_FILE, 'utf-8'))

    let updatedCount = 0

    // Update display names while preserving all other metadata
    Object.keys(tagsData).forEach((tagId) => {
        const currentName = tagsData[tagId].name
        const newName = generateDisplayName(tagId)

        if (currentName !== newName) {
            console.log(`  ${tagId}: "${currentName}" → "${newName}"`)
            tagsData[tagId].name = newName
            updatedCount++
        }
    })

    // Write updated tags.json
    writeFileSync(TAGS_FILE, JSON.stringify(tagsData, null, 4) + '\n', 'utf-8')

    console.log(`\n✅ Updated ${updatedCount} tag display names`)
    console.log(`   Preserved all other metadata (featured, priority, icons, colors)`)
    console.log('\n📝 Next steps:')
    console.log('   1. Review the changes')
    console.log('   2. Run: npm run validate:tags')
    console.log('   3. Test the tags page')
}

main()
