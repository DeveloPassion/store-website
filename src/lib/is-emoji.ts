/**
 * Check if a string is an emoji (or starts with an emoji).
 * Uses a regex pattern that matches common emoji ranges.
 */
export function isEmoji(str: string): boolean {
    if (!str || str.length === 0) return false

    // Emoji regex pattern covering most common emoji ranges
    // This includes emoticons, symbols, pictographs, transport symbols, etc.
    const emojiPattern = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base})/u

    return emojiPattern.test(str)
}
