export interface Tag {
    id: string
    name: string
    description: string
    icon?: string
    color?: string
    featured: boolean
    priority: number
}

export interface TagWithCount extends Tag {
    count: number
}
