/**
 * Skip Links Component
 *
 * Provides keyboard-accessible navigation links that allow users to bypass repetitive content
 * and jump directly to main sections of the page. Links are visually hidden until focused.
 *
 * WCAG 2.1 AA - Success Criterion 2.4.1 (Bypass Blocks)
 */
const SkipLinks: React.FC = () => {
    const handleCommandPaletteClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        // Trigger the command palette keyboard shortcut
        const event = new KeyboardEvent('keydown', {
            key: '/',
            bubbles: true,
            cancelable: true
        })
        document.dispatchEvent(event)
    }

    return (
        <div className='sr-only-focusable'>
            <a
                href='#main-content'
                className='bg-secondary text-primary focus-visible:ring-secondary focus-visible:ring-offset-background fixed top-4 left-4 z-[9999] rounded-lg px-4 py-2 font-semibold transition-transform focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            >
                Skip to main content
            </a>
            <a
                href='#navigation'
                className='bg-secondary text-primary focus-visible:ring-secondary focus-visible:ring-offset-background fixed top-4 left-4 z-[9999] rounded-lg px-4 py-2 font-semibold transition-transform focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            >
                Skip to navigation
            </a>
            <a
                href='#footer'
                className='bg-secondary text-primary focus-visible:ring-secondary focus-visible:ring-offset-background fixed top-4 left-4 z-[9999] rounded-lg px-4 py-2 font-semibold transition-transform focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            >
                Skip to footer
            </a>
            <a
                href='#'
                onClick={handleCommandPaletteClick}
                className='bg-secondary text-primary focus-visible:ring-secondary focus-visible:ring-offset-background fixed top-4 left-4 z-[9999] rounded-lg px-4 py-2 font-semibold transition-transform focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            >
                Open command palette
            </a>
        </div>
    )
}

export default SkipLinks
