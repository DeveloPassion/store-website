#!/usr/bin/env bun
/**
 * Image Optimization Utility
 *
 * Converts images to WebP format, resizes large images, and optimizes for web delivery.
 * Can be used as a CLI tool or imported as a module.
 *
 * CLI Usage:
 *   bun scripts/utils/optimize-images.ts <input> [options]
 *
 * Examples:
 *   # Optimize single image
 *   bun scripts/utils/optimize-images.ts image.png
 *
 *   # Optimize with custom output
 *   bun scripts/utils/optimize-images.ts image.png --output optimized.webp
 *
 *   # Optimize all images in a folder
 *   bun scripts/utils/optimize-images.ts ./images/ --output ./optimized/
 *
 *   # Optimize with custom settings
 *   bun scripts/utils/optimize-images.ts image.png --max-width 1600 --quality 90
 *
 *   # Keep original format (don't convert to WebP)
 *   bun scripts/utils/optimize-images.ts image.png --keep-format
 *
 *   # Replace original files in place
 *   bun scripts/utils/optimize-images.ts ./images/ --in-place
 */

import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, renameSync } from 'fs'
import { basename, dirname, extname, join, resolve } from 'path'
import { $ } from 'bun'

// Supported image extensions
const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff']

export interface OptimizeOptions {
    /** Maximum width in pixels (default: 1600) */
    maxWidth?: number
    /** Maximum height in pixels (default: 1200) */
    maxHeight?: number
    /** Quality 1-100 (default: 85) */
    quality?: number
    /** Output format: 'webp' | 'png' | 'jpeg' | 'keep' (default: 'webp') */
    format?: 'webp' | 'png' | 'jpeg' | 'keep'
    /** Strip metadata (default: true) */
    stripMetadata?: boolean
}

export interface OptimizeResult {
    inputPath: string
    outputPath: string
    originalSize: number
    optimizedSize: number
    width: number
    height: number
    format: string
    savings: number
    savingsPercent: number
}

/**
 * Check if ImageMagick is available
 */
export async function checkImageMagick(): Promise<boolean> {
    try {
        const result = await $`which magick`.quiet()
        return result.exitCode === 0
    } catch {
        return false
    }
}

/**
 * Get image dimensions using ImageMagick
 */
export async function getImageDimensions(
    imagePath: string
): Promise<{ width: number; height: number }> {
    const result = await $`magick identify -format "%wx%h" ${imagePath}`.text()
    const [width, height] = result.trim().split('x').map(Number)
    return { width, height }
}

/**
 * Get file size in bytes
 */
export function getFileSize(filePath: string): number {
    return statSync(filePath).size
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

/**
 * Optimize a single image
 */
export async function optimizeImage(
    inputPath: string,
    outputPath: string,
    options: OptimizeOptions = {}
): Promise<OptimizeResult> {
    const {
        maxWidth = 1600,
        maxHeight = 1200,
        quality = 85,
        format = 'webp',
        stripMetadata = true
    } = options

    // Check if ImageMagick is available
    const hasImageMagick = await checkImageMagick()
    if (!hasImageMagick) {
        throw new Error(
            'ImageMagick is not installed. Please install it: brew install imagemagick (macOS) or apt install imagemagick (Linux)'
        )
    }

    // Get original file info
    const originalSize = getFileSize(inputPath)
    const { width: origWidth, height: origHeight } = await getImageDimensions(inputPath)

    // Determine output format
    let outputFormat = format
    if (format === 'keep') {
        const ext = extname(inputPath).toLowerCase()
        if (ext === '.png') outputFormat = 'png'
        else if (ext === '.jpg' || ext === '.jpeg') outputFormat = 'jpeg'
        else outputFormat = 'webp'
    }

    // Update output path extension if needed
    if (format !== 'keep') {
        const outputExt = outputFormat === 'jpeg' ? '.jpg' : `.${outputFormat}`
        const outputDir = dirname(outputPath)
        const outputBase = basename(outputPath, extname(outputPath))
        outputPath = join(outputDir, `${outputBase}${outputExt}`)
    }

    // Ensure output directory exists
    const outputDir = dirname(outputPath)
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
    }

    // Build ImageMagick command
    const args: string[] = [inputPath]

    // Strip metadata
    if (stripMetadata) {
        args.push('-strip')
    }

    // Resize if needed (maintain aspect ratio, only shrink)
    if (origWidth > maxWidth || origHeight > maxHeight) {
        args.push('-resize', `${maxWidth}x${maxHeight}>`)
    }

    // Set quality
    args.push('-quality', quality.toString())

    // Output path
    args.push(outputPath)

    // Run ImageMagick
    await $`magick ${args}`.quiet()

    // Get optimized file info
    const optimizedSize = getFileSize(outputPath)
    const { width, height } = await getImageDimensions(outputPath)
    const savings = originalSize - optimizedSize
    const savingsPercent = Math.round((savings / originalSize) * 100)

    return {
        inputPath,
        outputPath,
        originalSize,
        optimizedSize,
        width,
        height,
        format: outputFormat,
        savings,
        savingsPercent
    }
}

/**
 * Optimize multiple images in a directory
 */
export async function optimizeDirectory(
    inputDir: string,
    outputDir: string,
    options: OptimizeOptions = {}
): Promise<OptimizeResult[]> {
    const results: OptimizeResult[] = []

    // Get all image files
    const files = readdirSync(inputDir).filter((file) => {
        const ext = extname(file).toLowerCase()
        return SUPPORTED_EXTENSIONS.includes(ext)
    })

    if (files.length === 0) {
        console.log(`No supported images found in ${inputDir}`)
        return results
    }

    console.log(`Found ${files.length} images to optimize...\n`)

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
    }

    // Process each file
    for (const file of files) {
        const inputPath = join(inputDir, file)
        const outputBase = basename(file, extname(file))
        const outputExt = options.format === 'keep' ? extname(file) : '.webp'
        const outputPath = join(outputDir, `${outputBase}${outputExt}`)

        try {
            const result = await optimizeImage(inputPath, outputPath, options)
            results.push(result)
            console.log(
                `✓ ${file} → ${basename(result.outputPath)} (${formatFileSize(result.originalSize)} → ${formatFileSize(result.optimizedSize)}, -${result.savingsPercent}%)`
            )
        } catch (error) {
            console.error(`✗ ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    return results
}

/**
 * Optimize images in place (replace originals with optimized versions)
 */
export async function optimizeInPlace(
    inputPath: string,
    options: OptimizeOptions = {}
): Promise<OptimizeResult[]> {
    const results: OptimizeResult[] = []
    const isDirectory = statSync(inputPath).isDirectory()

    if (isDirectory) {
        const files = readdirSync(inputPath).filter((file) => {
            const ext = extname(file).toLowerCase()
            return SUPPORTED_EXTENSIONS.includes(ext)
        })

        for (const file of files) {
            const filePath = join(inputPath, file)
            const tempPath = join(inputPath, `.temp-${file}`)

            try {
                // Optimize to temp file
                const result = await optimizeImage(filePath, tempPath, options)

                // Remove original
                unlinkSync(filePath)

                // Rename temp to final (with new extension if format changed)
                const finalPath = result.outputPath.replace('.temp-', '')
                renameSync(result.outputPath, finalPath)
                result.outputPath = finalPath

                results.push(result)
                console.log(
                    `✓ ${file} → ${basename(result.outputPath)} (${formatFileSize(result.originalSize)} → ${formatFileSize(result.optimizedSize)}, -${result.savingsPercent}%)`
                )
            } catch (error) {
                // Clean up temp file if it exists
                if (existsSync(tempPath)) {
                    unlinkSync(tempPath)
                }
                console.error(
                    `✗ ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`
                )
            }
        }
    } else {
        const dir = dirname(inputPath)
        const file = basename(inputPath)
        const tempPath = join(dir, `.temp-${file}`)

        try {
            const result = await optimizeImage(inputPath, tempPath, options)
            unlinkSync(inputPath)
            const finalPath = result.outputPath.replace('.temp-', '')
            renameSync(result.outputPath, finalPath)
            result.outputPath = finalPath
            results.push(result)
            console.log(
                `✓ ${file} → ${basename(result.outputPath)} (${formatFileSize(result.originalSize)} → ${formatFileSize(result.optimizedSize)}, -${result.savingsPercent}%)`
            )
        } catch (error) {
            if (existsSync(tempPath)) {
                unlinkSync(tempPath)
            }
            throw error
        }
    }

    return results
}

/**
 * Print summary of optimization results
 */
export function printSummary(results: OptimizeResult[]): void {
    if (results.length === 0) return

    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0)
    const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0)
    const totalSavings = totalOriginal - totalOptimized
    const savingsPercent = Math.round((totalSavings / totalOriginal) * 100)

    console.log('\n' + '='.repeat(60))
    console.log('SUMMARY')
    console.log('='.repeat(60))
    console.log(`Files processed: ${results.length}`)
    console.log(`Original size:   ${formatFileSize(totalOriginal)}`)
    console.log(`Optimized size:  ${formatFileSize(totalOptimized)}`)
    console.log(`Total savings:   ${formatFileSize(totalSavings)} (${savingsPercent}%)`)
    console.log('='.repeat(60))
}

// CLI entry point
async function main() {
    const args = process.argv.slice(2)

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
Image Optimization Utility

Usage:
  bun scripts/utils/optimize-images.ts <input> [options]

Arguments:
  <input>              Image file or directory to optimize

Options:
  --output, -o <path>  Output file or directory (default: same directory with .webp extension)
  --max-width <px>     Maximum width in pixels (default: 1600)
  --max-height <px>    Maximum height in pixels (default: 1200)
  --quality <1-100>    Compression quality (default: 85)
  --keep-format        Keep original format instead of converting to WebP
  --in-place           Replace original files with optimized versions
  --help, -h           Show this help message

Examples:
  # Optimize single image
  bun scripts/utils/optimize-images.ts image.png

  # Optimize with custom output
  bun scripts/utils/optimize-images.ts image.png -o optimized/image.webp

  # Optimize all images in a folder
  bun scripts/utils/optimize-images.ts ./images/ -o ./optimized/

  # Optimize with custom settings
  bun scripts/utils/optimize-images.ts image.png --max-width 800 --quality 90

  # Replace originals in place
  bun scripts/utils/optimize-images.ts ./images/ --in-place
`)
        process.exit(0)
    }

    // Parse arguments
    const input = args[0]
    let output: string | undefined
    let inPlace = false
    const options: OptimizeOptions = {}

    for (let i = 1; i < args.length; i++) {
        switch (args[i]) {
            case '--output':
            case '-o':
                output = args[++i]
                break
            case '--max-width':
                options.maxWidth = parseInt(args[++i], 10)
                break
            case '--max-height':
                options.maxHeight = parseInt(args[++i], 10)
                break
            case '--quality':
                options.quality = parseInt(args[++i], 10)
                break
            case '--keep-format':
                options.format = 'keep'
                break
            case '--in-place':
                inPlace = true
                break
        }
    }

    // Resolve input path
    const inputPath = resolve(input)
    if (!existsSync(inputPath)) {
        console.error(`Error: Input path does not exist: ${inputPath}`)
        process.exit(1)
    }

    const isDirectory = statSync(inputPath).isDirectory()

    // Check ImageMagick
    const hasImageMagick = await checkImageMagick()
    if (!hasImageMagick) {
        console.error('Error: ImageMagick is not installed.')
        console.error(
            'Install it with: brew install imagemagick (macOS) or apt install imagemagick (Linux)'
        )
        process.exit(1)
    }

    let results: OptimizeResult[]

    try {
        if (inPlace) {
            console.log(`Optimizing images in place...`)
            results = await optimizeInPlace(inputPath, options)
        } else if (isDirectory) {
            const outputDir = output || inputPath
            console.log(`Optimizing images from ${inputPath} to ${outputDir}...`)
            results = await optimizeDirectory(inputPath, outputDir, options)
        } else {
            // Single file
            const outputPath =
                output ||
                join(dirname(inputPath), `${basename(inputPath, extname(inputPath))}.webp`)
            console.log(`Optimizing ${inputPath}...`)
            const result = await optimizeImage(inputPath, outputPath, options)
            results = [result]
            console.log(
                `✓ ${basename(result.inputPath)} → ${basename(result.outputPath)} (${formatFileSize(result.originalSize)} → ${formatFileSize(result.optimizedSize)}, -${result.savingsPercent}%)`
            )
        }

        printSummary(results)
    } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        process.exit(1)
    }
}

// Run CLI if executed directly
if (import.meta.main) {
    main()
}
