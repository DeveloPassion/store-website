export type CategoryId =
    | 'ai-mastery'
    | 'ai-tools'
    | 'bundles'
    | 'coaching'
    | 'community'
    | 'content-creation'
    | 'courses'
    | 'dev-and-it'
    | 'free'
    | 'guides'
    | 'journaling'
    | 'kits-and-templates'
    | 'knowledge-bases'
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
