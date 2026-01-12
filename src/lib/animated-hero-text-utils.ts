import type { AnimatedHeroText } from '@/types/animated-hero-text'

/**
 * Get a random animated hero text from an array
 */
export function getRandomAnimatedHeroText(texts: AnimatedHeroText[]): AnimatedHeroText {
    if (texts.length === 0) {
        throw new Error('No animated hero texts available')
    }

    const randomIndex = Math.floor(Math.random() * texts.length)
    const text = texts[randomIndex]
    if (!text) {
        throw new Error('Failed to select animated hero text')
    }

    return text
}

/**
 * Get all featured animated hero texts
 */
export function getFeaturedAnimatedHeroTexts(texts: AnimatedHeroText[]): AnimatedHeroText[] {
    return texts.filter((text) => text.featured)
}

/**
 * Get a random featured animated hero text
 */
export function getRandomFeaturedAnimatedHeroText(texts: AnimatedHeroText[]): AnimatedHeroText {
    const featured = getFeaturedAnimatedHeroTexts(texts)
    return getRandomAnimatedHeroText(featured)
}

/**
 * Get animated hero text by ID
 */
export function getAnimatedHeroTextById(
    texts: AnimatedHeroText[],
    id: string
): AnimatedHeroText | undefined {
    return texts.find((text) => text.id === id)
}

/**
 * Get a weighted random animated hero text where featured texts appear at least a certain percentage of the time
 * @param texts - Array of all animated hero texts
 * @param featuredMinWeight - Minimum probability of selecting a featured text (0-1). Default: 0.5 (50%)
 *
 * Logic:
 * - featuredMinWeight% of the time: guaranteed to show a featured text
 * - (1 - featuredMinWeight)% of the time: show any random text (could be featured or non-featured)
 *
 * This ensures featured texts appear AT LEAST featuredMinWeight% of the time,
 * but they may appear more frequently since they're also in the general pool.
 */
export function getWeightedRandomAnimatedHeroText(
    texts: AnimatedHeroText[],
    featuredMinWeight: number = 0.5
): AnimatedHeroText {
    if (texts.length === 0) {
        throw new Error('No animated hero texts available')
    }

    const featured = getFeaturedAnimatedHeroTexts(texts)

    // If no featured texts, just return random from all
    if (featured.length === 0) {
        return getRandomAnimatedHeroText(texts)
    }

    // Weighted random selection
    // featuredMinWeight% chance: definitely select a featured text
    // (1 - featuredMinWeight)% chance: select from all texts
    const random = Math.random()
    if (random < featuredMinWeight) {
        return getRandomAnimatedHeroText(featured)
    } else {
        return getRandomAnimatedHeroText(texts)
    }
}
