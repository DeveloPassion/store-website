export type CategoryId =
    | 'ai-mastery'
    | 'ai-tools'
    | 'bundles'
    | 'coaching'
    | 'community'
    | 'content-creation'
    | 'courses'
    | 'free'
    | 'kits-and-templates'
    | 'knowledge-management'
    | 'knowledge-work'
    | 'learning'
    | 'obsidian'
    | 'personal-development'
    | 'personal-organization'
    | 'productivity'
    | 'dev-and-it'
    | 'workshops'

export interface Category {
    id: CategoryId
    name: string
    description: string
    icon?: string
    color?: string
}
