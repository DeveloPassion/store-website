export type CategoryId =
    | 'ai-mastery'
    | 'ai-tools'
    | 'bundles'
    | 'coaching'
    | 'community'
    | 'content-creation'
    | 'courses'
    | 'databases'
    | 'dev-and-it'
    | 'free'
    | 'guides'
    | 'kits-and-templates'
    | 'knowledge-management'
    | 'knowledge-work'
    | 'learning'
    | 'obsidian'
    | 'personal-development'
    | 'personal-organization'
    | 'productivity'
    | 'services'
    | 'tools'
    | 'workshops'

export interface Category {
    id: CategoryId
    name: string
    description: string
    icon?: string
    color?: string
    featured: boolean
    priority: number
}
