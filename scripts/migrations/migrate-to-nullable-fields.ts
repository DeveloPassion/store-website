#!/usr/bin/env bun
/**
 * Migration script to update JSON files with nullable fields
 *
 * This script updates all data JSON files to use explicit null values
 * instead of optional/undefined fields as part of the schema refactor.
 *
 * Changes:
 * - Product variants: add gumroadVariantId, paymentFrequency, prices (with all 4 price fields)
 * - Testimonials: add role, company, avatarUrl, twitterHandle, twitterUrl
 * - Media: add description, caption, youtubeId, thumbnailUrl, width, height
 * - Sales copy: add secondaryTagline, storytelling, timeline, courseContent
 * - Stats: add userCount, timeSaved, ratings
 * - Categories: add icon, color
 * - Tags: add icon, color
 * - Redirects: add description
 *
 * Run with: bun scripts/migrations/migrate-to-nullable-fields.ts
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DATA_DIR = 'src/data'
const PRODUCTS_DIR = join(DATA_DIR, 'products')

interface MigrationResult {
    file: string
    changed: boolean
    changes: string[]
}

const results: MigrationResult[] = []

/**
 * Helper to read and parse JSON file
 */
async function readJsonFile(path: string): Promise<unknown> {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content)
}

/**
 * Helper to write JSON file with consistent formatting
 */
async function writeJsonFile(path: string, data: unknown): Promise<void> {
    await writeFile(path, JSON.stringify(data, null, 4) + '\n', 'utf-8')
}

/**
 * Migrate product JSON files - update variants with nullable fields
 */
async function migrateProductFiles(): Promise<void> {
    const files = await readdir(PRODUCTS_DIR)
    const productFiles = files.filter(
        (f) =>
            f.endsWith('.json') &&
            !f.includes('-sales-copy-') &&
            !f.includes('-testimonials') &&
            !f.includes('-media') &&
            !f.includes('-stats') &&
            !f.includes('-faq')
    )

    for (const file of productFiles) {
        const path = join(PRODUCTS_DIR, file)
        const data = (await readJsonFile(path)) as Record<string, unknown>
        const changes: string[] = []

        // Update variants with nullable fields
        if (data.variants && Array.isArray(data.variants)) {
            for (const variant of data.variants as Record<string, unknown>[]) {
                // Add gumroadVariantId if missing
                if (!('gumroadVariantId' in variant)) {
                    variant.gumroadVariantId = null
                    changes.push(`variant "${variant.name}": added gumroadVariantId: null`)
                }

                // Add paymentFrequency if missing
                if (!('paymentFrequency' in variant)) {
                    variant.paymentFrequency = null
                    changes.push(`variant "${variant.name}": added paymentFrequency: null`)
                }

                // Add prices if missing
                if (!('prices' in variant)) {
                    variant.prices = null
                    changes.push(`variant "${variant.name}": added prices: null`)
                } else if (variant.prices !== null) {
                    // If prices exists, ensure all 4 fields are present
                    const prices = variant.prices as Record<string, unknown>
                    if (!('monthly' in prices)) {
                        prices.monthly = null
                        changes.push(`variant "${variant.name}": added prices.monthly: null`)
                    }
                    if (!('yearly' in prices)) {
                        prices.yearly = null
                        changes.push(`variant "${variant.name}": added prices.yearly: null`)
                    }
                    if (!('biennial' in prices)) {
                        prices.biennial = null
                        changes.push(`variant "${variant.name}": added prices.biennial: null`)
                    }
                    if (!('oneTime' in prices)) {
                        prices.oneTime = null
                        changes.push(`variant "${variant.name}": added prices.oneTime: null`)
                    }
                }
            }
        }

        if (changes.length > 0) {
            await writeJsonFile(path, data)
            results.push({ file: path, changed: true, changes })
        }
    }
}

/**
 * Migrate testimonials JSON files
 */
async function migrateTestimonialsFiles(): Promise<void> {
    const files = await readdir(PRODUCTS_DIR)
    const testimonialFiles = files.filter((f) => f.endsWith('-testimonials.json'))

    for (const file of testimonialFiles) {
        const path = join(PRODUCTS_DIR, file)
        const data = (await readJsonFile(path)) as { data: Record<string, unknown>[] }
        const changes: string[] = []

        for (const testimonial of data.data) {
            // Add nullable fields
            if (!('role' in testimonial)) {
                testimonial.role = null
                changes.push(`testimonial "${testimonial.id}": added role: null`)
            }
            if (!('company' in testimonial)) {
                testimonial.company = null
                changes.push(`testimonial "${testimonial.id}": added company: null`)
            }
            if (!('avatarUrl' in testimonial)) {
                testimonial.avatarUrl = null
                changes.push(`testimonial "${testimonial.id}": added avatarUrl: null`)
            }
            if (!('twitterHandle' in testimonial)) {
                testimonial.twitterHandle = null
                changes.push(`testimonial "${testimonial.id}": added twitterHandle: null`)
            }
            if (!('twitterUrl' in testimonial)) {
                testimonial.twitterUrl = null
                changes.push(`testimonial "${testimonial.id}": added twitterUrl: null`)
            }
        }

        if (changes.length > 0) {
            await writeJsonFile(path, data)
            results.push({ file: path, changed: true, changes })
        }
    }
}

/**
 * Migrate media JSON files
 */
async function migrateMediaFiles(): Promise<void> {
    const files = await readdir(PRODUCTS_DIR)
    const mediaFiles = files.filter((f) => f.endsWith('-media.json'))

    for (const file of mediaFiles) {
        const path = join(PRODUCTS_DIR, file)
        const data = (await readJsonFile(path)) as { data: Record<string, unknown>[] }
        const changes: string[] = []

        for (const media of data.data) {
            // Add nullable fields
            if (!('description' in media)) {
                media.description = null
                changes.push(`media "${media.id}": added description: null`)
            }
            if (!('caption' in media)) {
                media.caption = null
                changes.push(`media "${media.id}": added caption: null`)
            }
            if (!('youtubeId' in media)) {
                media.youtubeId = null
                changes.push(`media "${media.id}": added youtubeId: null`)
            }
            if (!('thumbnailUrl' in media)) {
                media.thumbnailUrl = null
                changes.push(`media "${media.id}": added thumbnailUrl: null`)
            }
            if (!('width' in media)) {
                media.width = null
                changes.push(`media "${media.id}": added width: null`)
            }
            if (!('height' in media)) {
                media.height = null
                changes.push(`media "${media.id}": added height: null`)
            }
        }

        if (changes.length > 0) {
            await writeJsonFile(path, data)
            results.push({ file: path, changed: true, changes })
        }
    }
}

/**
 * Migrate sales copy JSON files
 */
async function migrateSalesCopyFiles(): Promise<void> {
    const files = await readdir(PRODUCTS_DIR)
    const salesCopyFiles = files.filter((f) => f.includes('-sales-copy-') && f.endsWith('.json'))

    for (const file of salesCopyFiles) {
        const path = join(PRODUCTS_DIR, file)
        const data = (await readJsonFile(path)) as {
            id: string
            salesCopy: Record<string, unknown>
        }
        const changes: string[] = []

        const salesCopy = data.salesCopy

        // Add nullable fields at salesCopy level
        if (!('secondaryTagline' in salesCopy)) {
            salesCopy.secondaryTagline = null
            changes.push('added secondaryTagline: null')
        }
        if (!('storytelling' in salesCopy)) {
            salesCopy.storytelling = null
            changes.push('added storytelling: null')
        }
        if (!('timeline' in salesCopy)) {
            salesCopy.timeline = null
            changes.push('added timeline: null')
        }
        if (!('courseContent' in salesCopy)) {
            salesCopy.courseContent = null
            changes.push('added courseContent: null')
        }

        // If storytelling exists and is not null, update its structure
        if (salesCopy.storytelling && typeof salesCopy.storytelling === 'object') {
            const storytelling = salesCopy.storytelling as Record<string, unknown>

            // Ensure all 6 top-level sections exist
            const sections = [
                'originStory',
                'creatorJourney',
                'transformationArc',
                'successStories',
                'methodology',
                'vision'
            ]
            for (const section of sections) {
                if (!(section in storytelling)) {
                    storytelling[section] = null
                    changes.push(`storytelling: added ${section}: null`)
                }
            }

            // Migrate nullable fields within each section
            await migrateStorytellingSection(storytelling, changes)
        }

        // If timeline exists and is not null, update its structure
        if (salesCopy.timeline && typeof salesCopy.timeline === 'object') {
            const timeline = salesCopy.timeline as Record<string, unknown>
            if (!('title' in timeline)) {
                timeline.title = null
                changes.push('timeline: added title: null')
            }
            if (!('subtitle' in timeline)) {
                timeline.subtitle = null
                changes.push('timeline: added subtitle: null')
            }

            // Migrate milestones
            if (timeline.milestones && Array.isArray(timeline.milestones)) {
                for (const milestone of timeline.milestones as Record<string, unknown>[]) {
                    if (!('highlights' in milestone)) {
                        milestone.highlights = null
                        changes.push(`timeline milestone "${milestone.id}": added highlights: null`)
                    }
                    if (!('icon' in milestone)) {
                        milestone.icon = null
                        changes.push(`timeline milestone "${milestone.id}": added icon: null`)
                    }
                }
            }
        }

        // If courseContent exists and is not null, update its structure
        if (salesCopy.courseContent && typeof salesCopy.courseContent === 'object') {
            const courseContent = salesCopy.courseContent as Record<string, unknown>
            const courseFields = [
                'sectionTitle',
                'sectionDescription',
                'sectionIcon',
                'totalDuration',
                'prerequisites',
                'difficulty'
            ]
            for (const field of courseFields) {
                if (!(field in courseContent)) {
                    courseContent[field] = null
                    changes.push(`courseContent: added ${field}: null`)
                }
            }

            // Migrate modules
            if (courseContent.modules && Array.isArray(courseContent.modules)) {
                for (const module of courseContent.modules as Record<string, unknown>[]) {
                    if (!('description' in module)) {
                        module.description = null
                        changes.push(
                            `courseContent module "${module.name}": added description: null`
                        )
                    }
                    if (!('icon' in module)) {
                        module.icon = null
                        changes.push(`courseContent module "${module.name}": added icon: null`)
                    }
                    if (!('duration' in module)) {
                        module.duration = null
                        changes.push(`courseContent module "${module.name}": added duration: null`)
                    }

                    // Migrate sections
                    if (module.sections && Array.isArray(module.sections)) {
                        for (const section of module.sections as Record<string, unknown>[]) {
                            if (!('description' in section)) {
                                section.description = null
                            }
                            if (!('duration' in section)) {
                                section.duration = null
                            }
                            if (!('icon' in section)) {
                                section.icon = null
                            }
                            if (!('url' in section)) {
                                section.url = null
                            }
                        }
                    }
                }
            }
        }

        if (changes.length > 0) {
            await writeJsonFile(path, data)
            results.push({ file: path, changed: true, changes })
        }
    }
}

/**
 * Migrate storytelling section fields to nullable
 */
async function migrateStorytellingSection(
    storytelling: Record<string, unknown>,
    changes: string[]
): Promise<void> {
    // originStory nullable fields
    if (storytelling.originStory && typeof storytelling.originStory === 'object') {
        const originStory = storytelling.originStory as Record<string, unknown>
        const nullableFields = ['subtitle', 'inspirationPoint', 'genesisDate', 'icon']
        for (const field of nullableFields) {
            if (!(field in originStory)) {
                originStory[field] = null
                changes.push(`storytelling.originStory: added ${field}: null`)
            }
        }
    }

    // creatorJourney nullable fields
    if (storytelling.creatorJourney && typeof storytelling.creatorJourney === 'object') {
        const creatorJourney = storytelling.creatorJourney as Record<string, unknown>
        const nullableFields = ['subtitle', 'struggles', 'achievements', 'credentials', 'icon']
        for (const field of nullableFields) {
            if (!(field in creatorJourney)) {
                creatorJourney[field] = null
                changes.push(`storytelling.creatorJourney: added ${field}: null`)
            }
        }
    }

    // transformationArc nullable fields
    if (storytelling.transformationArc && typeof storytelling.transformationArc === 'object') {
        const transformationArc = storytelling.transformationArc as Record<string, unknown>
        const nullableFields = ['subtitle', 'timeline']
        for (const field of nullableFields) {
            if (!(field in transformationArc)) {
                transformationArc[field] = null
                changes.push(`storytelling.transformationArc: added ${field}: null`)
            }
        }

        // Migrate phase nullable fields
        for (const phase of ['before', 'during', 'after']) {
            if (transformationArc[phase] && typeof transformationArc[phase] === 'object') {
                const phaseObj = transformationArc[phase] as Record<string, unknown>
                if (!('points' in phaseObj)) {
                    phaseObj.points = null
                    changes.push(`storytelling.transformationArc.${phase}: added points: null`)
                }
                if (!('icon' in phaseObj)) {
                    phaseObj.icon = null
                    changes.push(`storytelling.transformationArc.${phase}: added icon: null`)
                }
            }
        }
    }

    // successStories nullable fields
    if (storytelling.successStories && typeof storytelling.successStories === 'object') {
        const successStories = storytelling.successStories as Record<string, unknown>
        if (!('subtitle' in successStories)) {
            successStories.subtitle = null
            changes.push('storytelling.successStories: added subtitle: null')
        }

        // Migrate individual stories
        if (successStories.stories && Array.isArray(successStories.stories)) {
            for (const story of successStories.stories as Record<string, unknown>[]) {
                const storyFields = ['role', 'company', 'metrics', 'quote', 'image', 'avatarUrl']
                for (const field of storyFields) {
                    if (!(field in story)) {
                        story[field] = null
                    }
                }

                // Migrate metrics icons
                if (story.metrics && Array.isArray(story.metrics)) {
                    for (const metric of story.metrics as Record<string, unknown>[]) {
                        if (!('icon' in metric)) {
                            metric.icon = null
                        }
                    }
                }
            }
        }
    }

    // methodology nullable fields
    if (storytelling.methodology && typeof storytelling.methodology === 'object') {
        const methodology = storytelling.methodology as Record<string, unknown>
        const nullableFields = ['subtitle', 'philosophy', 'differentiation']
        for (const field of nullableFields) {
            if (!(field in methodology)) {
                methodology[field] = null
                changes.push(`storytelling.methodology: added ${field}: null`)
            }
        }

        // Migrate steps
        if (methodology.steps && Array.isArray(methodology.steps)) {
            for (const step of methodology.steps as Record<string, unknown>[]) {
                if (!('icon' in step)) {
                    step.icon = null
                }
            }
        }
    }

    // vision nullable fields
    if (storytelling.vision && typeof storytelling.vision === 'object') {
        const vision = storytelling.vision as Record<string, unknown>
        const nullableFields = ['subtitle', 'values', 'futureGoals', 'biggerPicture', 'icon']
        for (const field of nullableFields) {
            if (!(field in vision)) {
                vision[field] = null
                changes.push(`storytelling.vision: added ${field}: null`)
            }
        }

        // Migrate values icons
        if (vision.values && Array.isArray(vision.values)) {
            for (const value of vision.values as Record<string, unknown>[]) {
                if (!('icon' in value)) {
                    value.icon = null
                }
            }
        }
    }
}

/**
 * Migrate stats JSON files
 */
async function migrateStatsFiles(): Promise<void> {
    const files = await readdir(PRODUCTS_DIR)
    const statsFiles = files.filter((f) => f.endsWith('-stats.json'))

    for (const file of statsFiles) {
        const path = join(PRODUCTS_DIR, file)
        const data = (await readJsonFile(path)) as { data: Record<string, unknown> }
        const changes: string[] = []

        const stats = data.data

        // Add nullable fields
        if (!('userCount' in stats)) {
            stats.userCount = null
            changes.push('added userCount: null')
        }
        if (!('timeSaved' in stats)) {
            stats.timeSaved = null
            changes.push('added timeSaved: null')
        }
        if (!('ratings' in stats)) {
            stats.ratings = null
            changes.push('added ratings: null')
        }

        if (changes.length > 0) {
            await writeJsonFile(path, data)
            results.push({ file: path, changed: true, changes })
        }
    }
}

/**
 * Migrate categories.json
 */
async function migrateCategoriesFile(): Promise<void> {
    const path = join(DATA_DIR, 'categories.json')
    const data = (await readJsonFile(path)) as Record<string, unknown>[]
    const changes: string[] = []

    for (const category of data) {
        if (!('icon' in category)) {
            category.icon = null
            changes.push(`category "${category.id}": added icon: null`)
        }
        if (!('color' in category)) {
            category.color = null
            changes.push(`category "${category.id}": added color: null`)
        }
    }

    if (changes.length > 0) {
        await writeJsonFile(path, data)
        results.push({ file: path, changed: true, changes })
    }
}

/**
 * Migrate tags.json
 */
async function migrateTagsFile(): Promise<void> {
    const path = join(DATA_DIR, 'tags.json')
    const data = (await readJsonFile(path)) as Record<string, Record<string, unknown>>
    const changes: string[] = []

    for (const [tagId, tag] of Object.entries(data)) {
        if (!('icon' in tag)) {
            tag.icon = null
            changes.push(`tag "${tagId}": added icon: null`)
        }
        if (!('color' in tag)) {
            tag.color = null
            changes.push(`tag "${tagId}": added color: null`)
        }
    }

    if (changes.length > 0) {
        await writeJsonFile(path, data)
        results.push({ file: path, changed: true, changes })
    }
}

/**
 * Migrate redirects.json (if it exists)
 */
async function migrateRedirectsFile(): Promise<void> {
    const path = join(DATA_DIR, 'redirects.json')
    try {
        const data = (await readJsonFile(path)) as Record<string, unknown>[]
        const changes: string[] = []

        for (const redirect of data) {
            if (!('description' in redirect)) {
                redirect.description = null
                changes.push(`redirect "${redirect.from}": added description: null`)
            }
        }

        if (changes.length > 0) {
            await writeJsonFile(path, data)
            results.push({ file: path, changed: true, changes })
        }
    } catch {
        // File doesn't exist, skip
        console.log('redirects.json not found, skipping')
    }
}

/**
 * Main migration function
 */
async function main(): Promise<void> {
    console.log('Starting migration to nullable fields...\n')

    await migrateProductFiles()
    await migrateTestimonialsFiles()
    await migrateMediaFiles()
    await migrateSalesCopyFiles()
    await migrateStatsFiles()
    await migrateCategoriesFile()
    await migrateTagsFile()
    await migrateRedirectsFile()

    // Print summary
    console.log('\n=== Migration Summary ===\n')

    const changedFiles = results.filter((r) => r.changed)
    if (changedFiles.length === 0) {
        console.log('No files needed migration.')
    } else {
        console.log(`Modified ${changedFiles.length} files:\n`)
        for (const result of changedFiles) {
            console.log(`📝 ${result.file}`)
            for (const change of result.changes.slice(0, 5)) {
                console.log(`   - ${change}`)
            }
            if (result.changes.length > 5) {
                console.log(`   ... and ${result.changes.length - 5} more changes`)
            }
            console.log()
        }
    }

    console.log('\nMigration complete!')
    console.log('Run `bun run validate:all` to verify the changes.')
}

main().catch(console.error)
