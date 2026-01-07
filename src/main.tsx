import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './styles/index.css'

import AppLayout from './components/layout/app-layout'
import HomePage from './pages/home'
import ProductsPage from './pages/products'
import ProductPage from './pages/product'
import HelpPage from './pages/help'
import TagsPage from './pages/tags'

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/tag/:tagName' element={<HomePage />} />
                    <Route path='/tags' element={<TagsPage />} />
                    <Route path='/tags/:tagId' element={<TagsPage />} />
                    <Route path='/products' element={<ProductsPage />} />
                    <Route path='/l/:productSlug' element={<ProductPage />} />
                    <Route path='/help' element={<HelpPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)
