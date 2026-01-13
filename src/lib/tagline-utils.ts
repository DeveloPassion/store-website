import type { Tagline, TaglineCategory } from '@/schemas/tagline.schema'

/**
 * Get a random tagline from an array of taglines
 * This function is deterministic based on a seed for build-time consistency
 */
export function getRandomTagline(taglines: Tagline[], seed?: number): Tagline {
    if (taglines.length === 0) {
        throw new Error('No taglines available')
    }

    // Use seed if provided, otherwise use Math.random()
    const randomIndex =
        seed !== undefined ? seed % taglines.length : Math.floor(Math.random() * taglines.length)

    const tagline = taglines[randomIndex]
    if (!tagline) {
        throw new Error('Failed to select tagline')
    }

    return tagline
}

/**
 * Get all featured taglines
 */
export function getFeaturedTaglines(taglines: Tagline[]): Tagline[] {
    return taglines.filter((tagline) => tagline.featured)
}

/**
 * Get taglines filtered by category
 */
export function getTaglinesByCategory(taglines: Tagline[], category: TaglineCategory): Tagline[] {
    return taglines.filter((tagline) => tagline.category === category)
}

/**
 * Get a random featured tagline
 */
export function getRandomFeaturedTagline(taglines: Tagline[], seed?: number): Tagline {
    const featured = getFeaturedTaglines(taglines)
    return getRandomTagline(featured, seed)
}

/**
 * Get tagline by ID
 */
export function getTaglineById(taglines: Tagline[], id: string): Tagline | undefined {
    return taglines.find((tagline) => tagline.id === id)
}

/**
 * Get all tagline categories
 */
export function getAllTaglineCategories(taglines: Tagline[]): TaglineCategory[] {
    const categories = new Set<TaglineCategory>()
    taglines.forEach((tagline) => categories.add(tagline.category))
    return Array.from(categories).sort()
}

/**
 * Generate a deterministic seed from the current date (YYYY-MM-DD)
 * This ensures the tagline changes daily but remains consistent during the build
 */
export function getDailySeed(date: Date = new Date()): number {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    // Create a simple hash from the date
    return year * 10000 + month * 100 + day
}

/**
 * Get a weighted random tagline where featured taglines appear at least a certain percentage of the time
 * @param taglines - Array of all taglines
 * @param featuredMinWeight - Minimum probability of selecting a featured tagline (0-1). Default: 0.25 (25%)
 *
 * Logic:
 * - featuredMinWeight% of the time: guaranteed to show a featured tagline
 * - (1 - featuredMinWeight)% of the time: show any random tagline (could be featured or non-featured)
 *
 * This ensures featured taglines appear AT LEAST featuredMinWeight% of the time,
 * but they may appear more frequently since they're also in the general pool.
 */
export function getWeightedRandomTagline(
    taglines: Tagline[],
    featuredMinWeight: number = 0.25
): Tagline {
    if (taglines.length === 0) {
        throw new Error('No taglines available')
    }

    const featured = getFeaturedTaglines(taglines)

    // If no featured taglines, just return random from all
    if (featured.length === 0) {
        return getRandomTagline(taglines)
    }

    // Weighted random selection
    // featuredMinWeight% chance: definitely select a featured tagline
    // (1 - featuredMinWeight)% chance: select from all taglines
    const random = Math.random()
    if (random < featuredMinWeight) {
        return getRandomTagline(featured)
    } else {
        return getRandomTagline(taglines)
    }
}
