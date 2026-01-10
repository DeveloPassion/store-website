import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './styles/index.css'

import { BreadcrumbProvider } from './contexts/breadcrumb-context'
import ErrorBoundary from './components/error/error-boundary'
import AppLayout from './components/layout/app-layout'
import HomePage from './pages/home'
import ProductsPage from './pages/products'
import BestValuePage from './pages/best-value'
import BestSellersPage from './pages/best-sellers'
import FeaturedPage from './pages/featured'
import ProductPage from './pages/product'
import HelpPage from './pages/help'
import WishlistPage from './pages/wishlist'
import SharedWishlistPage from './pages/shared-wishlist'
import TagsPage from './pages/tags'
import TagPage from './pages/tag'
import CategoriesPage from './pages/categories'
import CategoryPage from './pages/category'
import NotFoundPage from './pages/not-found'
import ErrorPage from './pages/error'

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <BreadcrumbProvider>
                    <Routes>
                        <Route element={<AppLayout />} errorElement={<ErrorPage />}>
                            <Route path='/' element={<HomePage />} />
                            <Route path='/tags' element={<TagsPage />} />
                            <Route path='/tags/:tagId' element={<TagPage />} />
                            <Route path='/categories' element={<CategoriesPage />} />
                            <Route path='/categories/:categoryId' element={<CategoryPage />} />
                            <Route path='/products' element={<ProductsPage />} />
                            <Route path='/best-value' element={<BestValuePage />} />
                            <Route path='/best-sellers' element={<BestSellersPage />} />
                            <Route path='/featured' element={<FeaturedPage />} />
                            <Route path='/l/:productSlug' element={<ProductPage />} />
                            <Route path='/help' element={<HelpPage />} />
                            <Route path='/wishlist' element={<WishlistPage />} />
                            <Route path='/shared-wishlist' element={<SharedWishlistPage />} />
                            {/* 404 catch-all route */}
                            <Route path='*' element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </BreadcrumbProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
)
