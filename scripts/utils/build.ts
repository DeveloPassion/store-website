#!/usr/bin/env bun
/**
 * Build script using Bun's native bundler
 * This replaces Vite for building the application
 */

import { $ } from 'bun'
import * as fs from 'fs'
import * as path from 'path'

const SRC_DIR = path.join(process.cwd(), 'src')
const DIST_DIR = path.join(process.cwd(), 'dist')
const PUBLIC_DIR = path.join(process.cwd(), 'public')

console.log('🚀 Building application with Bun...\n')

// Clean dist directory
console.log('📁 Cleaning dist directory...')
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true })
}
fs.mkdirSync(DIST_DIR, { recursive: true })

// Step 1: Build CSS with Tailwind
console.log('🎨 Building CSS with Tailwind...')
try {
    // Use Tailwind CLI to process the CSS
    await $`bunx @tailwindcss/cli -i ${path.join(SRC_DIR, 'styles/index.css')} -o ${path.join(DIST_DIR, 'assets/index.css')} --minify`
    console.log('✅ CSS built successfully\n')
} catch (error) {
    console.error('❌ Failed to build CSS:', error)
    process.exit(1)
}

// Step 2: Bundle JavaScript with Bun
console.log('📦 Bundling JavaScript with Bun...')
try {
    const result = await Bun.build({
        entrypoints: [path.join(SRC_DIR, 'main.tsx')],
        outdir: path.join(DIST_DIR, 'assets'),
        target: 'browser',
        format: 'esm',
        splitting: true,
        minify: true,
        sourcemap: 'external',
        naming: {
            entry: '[dir]/[name]-[hash].[ext]',
            chunk: '[name]-[hash].[ext]',
            asset: '[name]-[hash].[ext]'
        },
        external: []
    })

    if (!result.success) {
        console.error('❌ Build failed:')
        for (const log of result.logs) {
            console.error(log)
        }
        process.exit(1)
    }

    // Get the main output file
    const mainOutput = result.outputs.find((o) => o.kind === 'entry-point')
    if (!mainOutput) {
        throw new Error('No entry point output found')
    }

    console.log(`✅ JavaScript bundled successfully`)
    console.log(`   Entry: ${path.relative(DIST_DIR, mainOutput.path)}\n`)

    // Store the hashed filename for HTML generation
    const jsFilename = path.basename(mainOutput.path)
    const cssFilename = 'index.css' // Tailwind outputs without hash

    // Step 3: Process HTML
    console.log('📄 Processing HTML...')
    const htmlTemplate = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf-8')

    // Replace module script reference with hashed version
    const processedHtml = htmlTemplate
        .replace(
            '<script type="module" src="/main.tsx"></script>',
            `<script type="module" src="/assets/${jsFilename}"></script>`
        )
        .replace(
            '</head>',
            `    <link rel="stylesheet" href="/assets/${cssFilename}" />\n    </head>`
        )

    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), processedHtml)
    console.log('✅ HTML processed\n')
} catch (error) {
    console.error('❌ Failed to bundle JavaScript:', error)
    process.exit(1)
}

// Step 4: Copy public directory
if (fs.existsSync(PUBLIC_DIR)) {
    console.log('📁 Copying public directory...')
    try {
        await $`cp -r ${PUBLIC_DIR}/* ${DIST_DIR}/`
        console.log('✅ Public files copied\n')
    } catch (error) {
        console.error('❌ Failed to copy public directory:', error)
        process.exit(1)
    }
}

console.log('✨ Build completed successfully!')
console.log(`📦 Output directory: ${DIST_DIR}`)
