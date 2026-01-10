#!/usr/bin/env bun
/**
 * Development server using Bun
 * This replaces Vite's dev server
 */

import { $ } from 'bun'
import * as path from 'path'
import * as fs from 'fs'

const SRC_DIR = path.join(import.meta.dir, '../src')
const PUBLIC_DIR = path.join(import.meta.dir, '../public')
const PORT = 5173

console.log('🚀 Starting development server...\n')

// Build CSS initially
console.log('🎨 Building CSS...')
await $`bunx @tailwindcss/cli -i ${path.join(SRC_DIR, 'styles/index.css')} -o ${path.join(SRC_DIR, '.dev/index.css')}`

// Create .dev directory if it doesn't exist
const devDir = path.join(SRC_DIR, '.dev')
if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir, { recursive: true })
}

console.log(`\n✨ Development server running at http://localhost:${PORT}\n`)

// Start Bun's dev server
Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url)
        let filePath = url.pathname

        // Default to index.html for root and routes
        if (filePath === '/' || !filePath.includes('.')) {
            filePath = '/index.html'
        }

        // Try to serve from public directory first
        if (fs.existsSync(path.join(PUBLIC_DIR, filePath))) {
            const file = Bun.file(path.join(PUBLIC_DIR, filePath))
            return new Response(file)
        }

        // Serve built CSS
        if (filePath === '/.dev/index.css') {
            const file = Bun.file(path.join(SRC_DIR, '.dev/index.css'))
            return new Response(file, {
                headers: { 'Content-Type': 'text/css' }
            })
        }

        // Handle main.tsx - build on demand
        if (filePath === '/main.tsx') {
            const result = await Bun.build({
                entrypoints: [path.join(SRC_DIR, 'main.tsx')],
                target: 'browser',
                format: 'esm',
                sourcemap: 'inline',
                minify: false,
                define: {
                    'process.env.NODE_ENV': '"development"'
                }
            })

            if (!result.success) {
                return new Response('Build failed', { status: 500 })
            }

            const output = result.outputs[0]
            return new Response(await output.text(), {
                headers: { 'Content-Type': 'application/javascript' }
            })
        }

        // Serve index.html with injected CSS
        if (filePath === '/index.html') {
            const htmlContent = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf-8')
            const modifiedHtml = htmlContent.replace(
                '</head>',
                '    <link rel="stylesheet" href="/.dev/index.css" />\n    </head>'
            )
            return new Response(modifiedHtml, {
                headers: { 'Content-Type': 'text/html' }
            })
        }

        // Try to serve from src directory
        if (fs.existsSync(path.join(SRC_DIR, filePath))) {
            const file = Bun.file(path.join(SRC_DIR, filePath))
            return new Response(file)
        }

        return new Response('Not found', { status: 404 })
    },
    error(error) {
        return new Response(`Error: ${error.message}`, { status: 500 })
    }
})

// Watch for CSS changes
const cssWatcher = fs.watch(
    path.join(SRC_DIR, 'styles'),
    { recursive: true },
    async (event, filename) => {
        if (filename && filename.endsWith('.css')) {
            console.log(`🎨 CSS changed, rebuilding...`)
            await $`bunx @tailwindcss/cli -i ${path.join(SRC_DIR, 'styles/index.css')} -o ${path.join(SRC_DIR, '.dev/index.css')}`
            console.log('✅ CSS rebuilt')
        }
    }
)

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down dev server...')
    cssWatcher.close()
    process.exit(0)
})
