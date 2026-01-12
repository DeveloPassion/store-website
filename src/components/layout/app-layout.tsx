import { useState, useEffect, lazy, Suspense } from 'react'
import { Outlet } from 'react-router'
import Header from './header'
import Footer from './footer'
import SkipLinks from './skip-links'
import ScrollToTop from '@/components/ui/scroll-to-top'
import ScrollToTopButton from '@/components/ui/scroll-to-top-button'
import productsData from '@/data/products.json'
import type { Product } from '@/types/product'

// Lazy load CommandPalette for better initial load performance
const CommandPalette = lazy(() => import('@/components/products/command-palette'))

const AppLayout: React.FC = () => {
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open command palette with "/" or Ctrl+K / Cmd+K
            if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) {
                // Don't trigger if user is typing in an input field
                const target = e.target as HTMLElement
                if (
                    target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable
                ) {
                    return
                }

                e.preventDefault()
                setIsCommandPaletteOpen(true)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <>
            <SkipLinks />
            <ScrollToTop />
            <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
            <main id='main-content' className='flex w-full flex-1 flex-col items-center'>
                <Outlet />
            </main>
            <Footer />
            <ScrollToTopButton />
            {isCommandPaletteOpen && (
                <Suspense fallback={null}>
                    <CommandPalette
                        isOpen={isCommandPaletteOpen}
                        onClose={() => setIsCommandPaletteOpen(false)}
                        products={productsData as Product[]}
                    />
                </Suspense>
            )}
        </>
    )
}

export default AppLayout
