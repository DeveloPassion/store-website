import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './styles/index.css'

import AppLayout from './components/layout/app-layout'
import HomePage from './pages/home'
import ProductsPage from './pages/products'
import ProductPage from './pages/product'
import HelpPage from './pages/help'

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
                    <Route path='/products' element={<ProductsPage />} />
                    <Route path='/l/:productSlug' element={<ProductPage />} />
                    <Route path='/help' element={<HelpPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)
