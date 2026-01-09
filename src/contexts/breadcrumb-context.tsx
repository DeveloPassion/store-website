import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbContextValue {
    items: BreadcrumbItem[]
    setBreadcrumbs: (items: BreadcrumbItem[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined)

interface BreadcrumbProviderProps {
    children: ReactNode
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({ children }) => {
    const [items, setItems] = useState<BreadcrumbItem[]>([])

    const setBreadcrumbs = useCallback((newItems: BreadcrumbItem[]) => {
        setItems(newItems)
    }, [])

    return (
        <BreadcrumbContext.Provider value={{ items, setBreadcrumbs }}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

export const useBreadcrumb = () => {
    const context = useContext(BreadcrumbContext)
    if (!context) {
        throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
    }
    return context
}
