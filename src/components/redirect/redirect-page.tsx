/**
 * RedirectPage component
 * Handles client-side redirects when navigating within the React app
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { findRedirect } from '@/lib/redirects'

export default function RedirectPage() {
    const location = useLocation()

    useEffect(() => {
        const redirect = findRedirect(location.pathname)

        if (redirect) {
            // Use replace to avoid adding to history
            window.location.replace(redirect.to)
        }
    }, [location.pathname])

    // Show loading UI while redirecting
    return (
        <div className='flex min-h-screen items-center justify-center bg-[#37404c]'>
            <div className='text-center text-white'>
                <div className='mx-auto mb-6 size-12 animate-spin rounded-full border-4 border-white/30 border-t-white'></div>
                <p className='text-lg opacity-90'>Please wait while we redirect you.</p>
            </div>
        </div>
    )
}
