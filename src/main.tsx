import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './styles/index.css'

import { BreadcrumbProvider } from './contexts/breadcrumb-context'
import AppLayout from './components/layout/app-layout'
import HomePage from './pages/home'
import ProductsPage from './pages/products'
import MostValuePage from './pages/most-value'
import ProductPage from './pages/product'
import HelpPage from './pages/help'
import TagsPage from './pages/tags'
import TagPage from './pages/tag'
import CategoriesPage from './pages/categories'
import CategoryPage from './pages/category'

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <BreadcrumbProvider>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path='/' element={<HomePage />} />
                        <Route path='/tags' element={<TagsPage />} />
                        <Route path='/tags/:tagId' element={<TagPage />} />
                        <Route path='/categories' element={<CategoriesPage />} />
                        <Route path='/categories/:categoryId' element={<CategoryPage />} />
                        <Route path='/products' element={<ProductsPage />} />
                        <Route path='/most-value' element={<MostValuePage />} />
                        <Route path='/l/:productSlug' element={<ProductPage />} />
                        <Route path='/help' element={<HelpPage />} />
                    </Route>
                </Routes>
            </BreadcrumbProvider>
        </BrowserRouter>
    </React.StrictMode>
)
