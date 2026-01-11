#!/usr/bin/env bun
/**
 * Generates static HTML redirect pages for configured redirects.
 * Creates instant client-side redirects that work on GitHub Pages.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { RedirectsConfig } from '../../src/types/redirect'
import { RedirectsConfigSchema } from '../../src/schemas/redirect.schema'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Generates HTML for a redirect page
 */
function generateRedirectHTML(destination: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="0; url=${destination}">
    <meta name="robots" content="noindex, nofollow">
    <link rel="canonical" href="${destination}">
    <title>Redirecting...</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #37404c;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        .spinner {
            width: 50px;
            height: 50px;
            margin: 0 auto 1.5rem;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        p {
            font-size: 1.125rem;
            opacity: 0.9;
            line-height: 1.6;
        }
        a {
            color: white;
            text-decoration: underline;
            transition: opacity 0.2s;
        }
        a:hover {
            opacity: 0.8;
        }
    </style>
    <script>
        // Instant redirect when JavaScript is enabled
        window.location.replace('${destination}');
    </script>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <p>If you are not redirected automatically, <a href="${destination}">click here</a>.</p>
    </div>
</body>
</html>`
}

/**
 * Creates a redirect page at the specified path
 */
function createRedirectPage(sourcePath: string, destination: string, distDir: string): void {
    // Remove leading slash and create directory path
    const pathWithoutLeadingSlash = sourcePath.substring(1)
    const redirectDir = join(distDir, pathWithoutLeadingSlash)

    // Create directory if it doesn't exist
    if (!existsSync(redirectDir)) {
        mkdirSync(redirectDir, { recursive: true })
    }

    // Write index.html
    const htmlPath = join(redirectDir, 'index.html')
    const html = generateRedirectHTML(destination)
    writeFileSync(htmlPath, html)
}

/**
 * Main function to generate all redirect pages
 */
function generateRedirectPages(): void {
    const redirectsJsonPath = join(__dirname, '../../src/data/redirects.json')
    const distDir = join(__dirname, '../../dist')

    // Check if redirects.json exists (it's optional)
    if (!existsSync(redirectsJsonPath)) {
        console.log('ℹ No redirects.json found. Skipping redirect page generation.')
        return
    }

    // Create dist directory if it doesn't exist
    if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
    }

    // Load and validate redirects
    let redirects: RedirectsConfig
    try {
        const redirectsRaw = readFileSync(redirectsJsonPath, 'utf-8')
        const redirectsJson = JSON.parse(redirectsRaw)
        const validationResult = RedirectsConfigSchema.safeParse(redirectsJson)

        if (!validationResult.success) {
            console.error('❌ Invalid redirects.json:')
            console.error(validationResult.error.format())
            process.exit(1)
        }

        redirects = validationResult.data
    } catch (error) {
        console.error('❌ Error reading redirects.json:', error)
        process.exit(1)
    }

    // Generate redirect pages
    if (redirects.length === 0) {
        console.log('ℹ No redirects configured. Skipping redirect page generation.')
        return
    }

    console.log('🔄 Generating redirect pages...')

    for (const redirect of redirects) {
        createRedirectPage(redirect.from, redirect.to, distDir)
        const typeLabel = redirect.type === 'PERMANENT' ? '301' : '302'
        console.log(`  ✓ ${redirect.from} → ${redirect.to} (${typeLabel})`)
    }

    console.log(`✅ Generated ${redirects.length} redirect page(s)`)
}

// Run the script
generateRedirectPages()
