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
let cssFilename = 'index.css'
try {
    // Use Tailwind CLI to process the CSS
    const tempCssPath = path.join(DIST_DIR, 'assets/index.css')
    await $`bunx @tailwindcss/cli -i ${path.join(SRC_DIR, 'styles/index.css')} -o ${tempCssPath} --minify`

    // Generate content hash for cache-busting
    const cssContent = fs.readFileSync(tempCssPath)
    const hasher = new Bun.CryptoHasher('md5')
    hasher.update(cssContent)
    const hash = hasher.digest('hex').slice(0, 8)
    cssFilename = `index-${hash}.css`

    // Rename CSS file with hash
    const hashedCssPath = path.join(DIST_DIR, 'assets', cssFilename)
    fs.renameSync(tempCssPath, hashedCssPath)

    console.log(`✅ CSS built successfully: ${cssFilename}\n`)
} catch (error) {
    console.error('❌ Failed to build CSS:', error)
    process.exit(1)
}

// Step 2: Bundle JavaScript with Bun
console.log('📦 Bundling JavaScript with Bun...')

/**
 * Bun puts a hash in each chunk name, but that hash does not cover the names of
 * the files the chunk imports. When only the entry bundle changes, a chunk keeps
 * its name while its content changes (the import path of the entry bundle).
 * The assets are cached as immutable, so a CDN node can then keep the old
 * content of a chunk under a name that the new release still uses, and that old
 * chunk loads the old entry bundle.
 *
 * To avoid this, every JavaScript file name carries a build id: a hash of all
 * the output files of a first pass. When any file changes, the id changes and
 * every name changes with it. When nothing changes, the names stay the same.
 */
async function bundle(buildId: string | null) {
    const suffix = buildId ? `-${buildId}` : ''
    return Bun.build({
        entrypoints: [path.join(SRC_DIR, 'main.tsx')],
        outdir: path.join(DIST_DIR, 'assets'),
        target: 'browser',
        format: 'esm',
        splitting: true,
        minify: true,
        sourcemap: 'external',
        naming: {
            entry: `[dir]/[name]-[hash]${suffix}.[ext]`,
            chunk: `[name]-[hash]${suffix}.[ext]`,
            asset: '[name]-[hash].[ext]'
        },
        external: [],
        define: {
            'process.env.NODE_ENV': '"production"'
        }
    })
}

function reportBuildFailure(logs: unknown[]): never {
    console.error('❌ Build failed:')
    for (const log of logs) {
        console.error(log)
    }
    process.exit(1)
}

try {
    // First pass: only to compute the build id from what the bundle contains
    const firstPass = await bundle(null)
    if (!firstPass.success) {
        reportBuildFailure(firstPass.logs)
    }

    const idHasher = new Bun.CryptoHasher('md5')
    const firstPassFiles = firstPass.outputs
        .filter((output) => output.path.endsWith('.js'))
        .map((output) => output.path)
        .sort()
    for (const file of firstPassFiles) {
        idHasher.update(path.basename(file))
        idHasher.update(fs.readFileSync(file))
    }
    const buildId = idHasher.digest('hex').slice(0, 8)

    // Remove the files of the first pass (the CSS of step 1 stays)
    for (const output of firstPass.outputs) {
        if (fs.existsSync(output.path)) {
            fs.rmSync(output.path)
        }
    }

    // Second pass: the real build, with the build id in every JavaScript file name
    const result = await bundle(buildId)
    console.log(`   Build id: ${buildId}`)

    if (!result.success) {
        reportBuildFailure(result.logs)
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
    // cssFilename is already set with hash from Step 1

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
        // fs.cpSync works the same on Linux, macOS and Windows (the shell `cp -r` does not on Windows)
        fs.cpSync(PUBLIC_DIR, DIST_DIR, { recursive: true })
        console.log('✅ Public files copied\n')
    } catch (error) {
        console.error('❌ Failed to copy public directory:', error)
        process.exit(1)
    }
}

console.log('✨ Build completed successfully!')
console.log(`📦 Output directory: ${DIST_DIR}`)
