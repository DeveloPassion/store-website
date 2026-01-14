import { describe, expect, it } from 'bun:test'
import { isEmoji } from './is-emoji'

describe('isEmoji', () => {
    it('should return true for common emojis', () => {
        expect(isEmoji('🚀')).toBe(true)
        expect(isEmoji('⚙️')).toBe(true)
        expect(isEmoji('🧠')).toBe(true)
        expect(isEmoji('💼')).toBe(true)
        expect(isEmoji('🏆')).toBe(true)
        expect(isEmoji('📈')).toBe(true)
        expect(isEmoji('⚖️')).toBe(true)
        expect(isEmoji('✨')).toBe(true)
        expect(isEmoji('❤️')).toBe(true)
    })

    it('should return false for React icon names', () => {
        expect(isEmoji('FaRocket')).toBe(false)
        expect(isEmoji('FaCogs')).toBe(false)
        expect(isEmoji('FaBrain')).toBe(false)
        expect(isEmoji('SiObsidian')).toBe(false)
        expect(isEmoji('FaCheckCircle')).toBe(false)
    })

    it('should return false for empty or null-like values', () => {
        expect(isEmoji('')).toBe(false)
    })

    it('should return false for regular text', () => {
        expect(isEmoji('hello')).toBe(false)
        expect(isEmoji('123')).toBe(false)
        expect(isEmoji('icon')).toBe(false)
    })

    it('should return true for strings starting with emoji', () => {
        expect(isEmoji('🚀 Rocket')).toBe(true)
    })
})
