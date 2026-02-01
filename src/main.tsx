import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './styles/index.css'

import { ThemeProvider } from './contexts/theme-context'
import { BreadcrumbProvider } from './contexts/breadcrumb-context'
import ErrorBoundary from './components/error/error-boundary'
import AppLayout from './components/layout/app-layout'
import HomePage from './pages/home'

// Lazy load all pages except HomePage for better initial load performance
const ProductsPage = lazy(() => import('./pages/products'))
const BestValuePage = lazy(() => import('./pages/best-value'))
const BestSellersPage = lazy(() => import('./pages/best-sellers'))
const FeaturedPage = lazy(() => import('./pages/featured'))
const ProductPage = lazy(() => import('./pages/product'))
const HelpPage = lazy(() => import('./pages/help'))
const FAQPage = lazy(() => import('./pages/faq'))
const WishlistPage = lazy(() => import('./pages/wishlist'))
const SharedWishlistPage = lazy(() => import('./pages/shared-wishlist'))
const TagsPage = lazy(() => import('./pages/tags'))
const TagPage = lazy(() => import('./pages/tag'))
const CategoriesPage = lazy(() => import('./pages/categories'))
const CategoryPage = lazy(() => import('./pages/category'))
const AllTestimonialsPage = lazy(() => import('./pages/all-testimonials'))
const ComparePage = lazy(() => import('./pages/compare'))
const SuccessStoriesPage = lazy(() => import('./pages/success-stories'))
const QuizPage = lazy(() => import('./pages/quiz'))
const NotFoundPage = lazy(() => import('./pages/not-found'))
const ErrorPage = lazy(() => import('./pages/error'))

// Loading fallback component for route transitions
const RouteLoadingFallback = () => (
    <div className='flex min-h-screen items-center justify-center'>
        <div className='text-primary animate-pulse text-xl'>●</div>
    </div>
)

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <ErrorBoundary>
                    <BreadcrumbProvider>
                    <Routes>
                        <Route element={<AppLayout />} errorElement={<ErrorPage />}>
                            <Route path='/' element={<HomePage />} />
                            <Route
                                path='/tags'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <TagsPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/tags/:tagId'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <TagPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/categories'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <CategoriesPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/categories/:categoryId'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <CategoryPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/products'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <ProductsPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/best-value'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <BestValuePage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/best-sellers'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <BestSellersPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/featured'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <FeaturedPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/product/:productSlug'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <ProductPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/help'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <HelpPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/faq'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <FAQPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/wishlist'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <WishlistPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/shared-wishlist'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <SharedWishlistPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/testimonials'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <AllTestimonialsPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/compare'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <ComparePage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/success-stories'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <SuccessStoriesPage />
                                    </Suspense>
                                }
                            />
                            <Route
                                path='/quiz'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <QuizPage />
                                    </Suspense>
                                }
                            />
                            {/* 404 catch-all route */}
                            <Route
                                path='*'
                                element={
                                    <Suspense fallback={<RouteLoadingFallback />}>
                                        <NotFoundPage />
                                    </Suspense>
                                }
                            />
                        </Route>
                    </Routes>
                    </BreadcrumbProvider>
                </ErrorBoundary>
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>
)
