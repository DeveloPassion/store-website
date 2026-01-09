/**
 * Shared CLI display utilities for consistent UX across all management CLIs
 */

// ANSI color codes for better UX
export const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
}

/**
 * Clear screen
 */
export function clearScreen(): void {
    console.clear()
}

/**
 * Display banner with title
 */
export function showBanner(title: string, subtitle: string, emoji = '🛠️'): void {
    clearScreen()
    const titleLine = `${emoji}  ${title.toUpperCase()}  ${emoji}`
    const padding = ' '.repeat(Math.max(0, (63 - titleLine.length) / 2))

    console.log(`
${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║${padding}${titleLine}${padding}║
║                                                           ║
║${' '.repeat(Math.max(0, (61 - subtitle.length) / 2))}${subtitle}${' '.repeat(Math.max(0, (61 - subtitle.length) / 2))}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
`)
}

/**
 * Show operation header
 */
export function showOperationHeader(operation: string, subtitle?: string): void {
    console.log(
        `\n${colors.bright}${colors.blue}▶ ${operation.toUpperCase()}${colors.reset}${subtitle ? ` ${colors.dim}${subtitle}${colors.reset}` : ''}\n`
    )
}

/**
 * Show success message
 */
export function showSuccess(message: string): void {
    console.log(`\n${colors.bright}${colors.green}✅ ${message}${colors.reset}`)
}

/**
 * Show error message
 */
export function showError(message: string): void {
    console.error(`\n${colors.bright}${colors.red}❌ ${message}${colors.reset}`)
}

/**
 * Show warning message
 */
export function showWarning(message: string): void {
    console.log(`\n${colors.bright}${colors.yellow}⚠️  ${message}${colors.reset}`)
}

/**
 * Show info message
 */
export function showInfo(message: string): void {
    console.log(`${colors.cyan}ℹ ${message}${colors.reset}`)
}

/**
 * Show section header
 */
export function showSectionHeader(section: string): void {
    console.log(`\n${colors.bright}${colors.magenta}═══ ${section} ═══${colors.reset}\n`)
}

/**
 * Show separator line
 */
export function showSeparator(length = 80): void {
    console.log(`${colors.dim}${'─'.repeat(length)}${colors.reset}`)
}

/**
 * Show field with label and value
 */
export function showField(label: string, value: string | number | boolean, dim = false): void {
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
    const valueColor = dim ? colors.dim : colors.cyan
    console.log(
        `${colors.bright}${label}:${colors.reset} ${valueColor}${displayValue}${colors.reset}`
    )
}

/**
 * Show goodbye message
 */
export function showGoodbye(scriptName: string): void {
    console.log(
        `\n${colors.bright}${colors.cyan}Thanks for using ${scriptName}! 👋${colors.reset}\n`
    )
}
