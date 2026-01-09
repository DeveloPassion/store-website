import fs from 'fs'
import path from 'path'

interface ProductWithPriority {
    id: string
    priority: number
    status: string
    featured: boolean
    priceTier: string
    type: string
}

const productsPath = path.join(process.cwd(), 'src/data/products.json')
const products: ProductWithPriority[] = JSON.parse(fs.readFileSync(productsPath, 'utf-8'))

// Priority assignment strategy:
// 100: Featured flagship products
// 90: Featured products
// 80: Premium kits and courses
// 70: Standard kits and courses
// 60: Workshops and guides
// 50: Free resources
// 40: Tools and community
// 30: Coming soon
// 20: Archived

const priorityMap: Record<string, number> = {
    'obsidian-starter-kit': 100, // Flagship product, featured
    'everything-knowledge-bundle': 95, // Featured bundle
    'knowledge-management-for-beginners': 90, // Featured course
    'knowledge-worker-kit': 85, // Premium kit
    'obsidian-starter-course': 80, // Course
    'ai-ghostwriter-guide': 75, // Guide
    'pkm-library': 70, // Standard product
    'journaling-workshop': 65, // Workshop
    'personal-organization-workshop': 65, // Workshop
    'clarity-workshop': 65, // Workshop
    'ai-master-prompt-workshop': 65, // Workshop
    'mcp-workshop': 65, // Workshop
    'knowii-voice-ai': 60, // Tool
    'pkm-coaching': 55, // Coaching
    'it-concepts-wall': 50, // Tool
    'dev-concepts': 45, // Book series
    'knowledge-system-checklist': 40, // Free resource
    'beginners-guide-obsidian': 40, // Free resource
    'knowii-community': 35, // Community (free tier available)
    'week-planner': 30 // Tool
}

products.forEach((product: ProductWithPriority) => {
    // Assign priority based on map, or default based on type and status
    if (priorityMap[product.id]) {
        product.priority = priorityMap[product.id]
    } else {
        // Default priority based on type and status
        if (product.status === 'archived') {
            product.priority = 20
        } else if (product.status === 'coming-soon') {
            product.priority = 30
        } else if (product.featured) {
            product.priority = 90
        } else if (product.priceTier === 'free') {
            product.priority = 40
        } else if (product.type === 'bundle') {
            product.priority = 85
        } else if (product.type === 'kit' || product.type === 'course') {
            product.priority = 75
        } else if (product.type === 'workshop') {
            product.priority = 65
        } else if (product.type === 'guide') {
            product.priority = 70
        } else {
            product.priority = 50
        }
    }
})

// Write back to file
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf-8')

console.log('✓ Added priority field to all products')
console.log('\nPriority distribution:')
const priorityCounts: Record<number, number> = {}
products.forEach((p: ProductWithPriority) => {
    priorityCounts[p.priority] = (priorityCounts[p.priority] || 0) + 1
})
Object.entries(priorityCounts)
    .sort(([a], [b]) => Number(b) - Number(a))
    .forEach(([priority, count]) => {
        console.log(`  Priority ${priority}: ${count} product(s)`)
    })
