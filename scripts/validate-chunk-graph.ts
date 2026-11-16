#!/usr/bin/env bun
/**
 * Checks the JavaScript files of a finished build (dist/assets):
 *
 * 1. every relative import in a chunk points to a file that exists in the build
 * 2. no chunk refers to an entry bundle other than the one index.html loads
 * 3. every JavaScript file name carries the same build id (see scripts/utils/build.ts)
 *
 * Why: the assets are cached as immutable. A chunk that keeps its name while its
 * content changes can be served stale by a CDN node, and then it loads the entry
 * bundle of the release before.
 */
import * as fs from 'fs'
import * as path from 'path'

const DIST_DIR = path.join(process.cwd(), 'dist')
const ASSETS_DIR = path.join(DIST_DIR, 'assets')

if (!fs.existsSync(ASSETS_DIR)) {
    console.error('❌ dist/assets not found. Run the build first.')
    process.exit(1)
}

const html = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8')
const entryMatch = html.match(/\/assets\/(main-[A-Za-z0-9-]+\.js)/)
if (!entryMatch) {
    console.error('❌ No entry bundle found in dist/index.html')
    process.exit(1)
}
const entry = entryMatch[1]

const jsFiles = fs.readdirSync(ASSETS_DIR).filter((name) => name.endsWith('.js'))
const known = new Set(jsFiles)
const problems: string[] = []

// 3. one build id for all files: the last dash-separated part of the name
const buildIds = new Set(jsFiles.map((name) => name.replace(/\.js$/, '').split('-').pop()))
if (buildIds.size !== 1) {
    problems.push(
        `JavaScript files carry ${buildIds.size} different build ids: ${[...buildIds].join(', ')}`
    )
}

let importsChecked = 0
for (const name of jsFiles) {
    const content = fs.readFileSync(path.join(ASSETS_DIR, name), 'utf-8')

    // 1. relative imports must exist
    const relativeImports = new Set(content.match(/\.\/[A-Za-z0-9._-]+\.js/g) ?? [])
    for (const reference of relativeImports) {
        importsChecked++
        const target = reference.slice(2)
        if (!known.has(target)) {
            problems.push(`${name} imports ${target}, which is not in the build`)
        }
    }

    // 2. no other entry bundle
    const entryReferences = new Set(content.match(/main-[A-Za-z0-9]+-[A-Za-z0-9]+\.js/g) ?? [])
    for (const reference of entryReferences) {
        if (!known.has(reference)) {
            problems.push(`${name} refers to ${reference}, which is not a file of this build`)
        }
    }
}

if (problems.length > 0) {
    console.error(`❌ Chunk graph check failed (${problems.length} problem(s)):`)
    for (const problem of problems) {
        console.error(`   - ${problem}`)
    }
    process.exit(1)
}

console.log(
    `✅ Chunk graph is consistent: entry ${entry}, ${jsFiles.length} JavaScript files, ${importsChecked} imports checked, build id ${[...buildIds][0]}`
)
