# AGENTS.md - Store Website Maintenance Guide

## Project Overview

React 19+, TypeScript, Bun, Tailwind CSS v4, React Router, React Icons. Features: product showcase, category/tag filtering, command palette (`/` or `Ctrl+K`), responsive design.

## Schema Architecture

Two schemas: `IndividualProductSchema` (individual JSON files) and `AggregatedProductSchema` (runtime after build).

| Field                           | IndividualProduct | AggregatedProduct              |
| ------------------------------- | ----------------- | ------------------------------ |
| `activeSalesCopyId`             | Required          | Required                       |
| `salesCopy`                     | Not present       | Required object                |
| `faqs`, `testimonials`, `media` | Not present       | Required arrays (can be empty) |

```typescript
// Build scripts: IndividualProduct | React components: AggregatedProduct (or Product alias)
import { IndividualProduct, AggregatedProduct } from '@/types/product'
```

**Benefits**: All three required (can be empty): `immediate`, `systematic`, `longTerm`

## Product Display

Always use `ProductCardEcommerce` (`/src/components/products/product-card-ecommerce.tsx`).

## Icons

All `icon` fields: emojis (`"🚀"`), React-icon names (`"FaRobot"`, `"SiObsidian"`), or URLs. Use `DynamicIcon`. Registry: `/src/lib/icon-registry.ts`.

## Meta Tags

**Required**: document.title, meta description, og:_, twitter:_, canonical. Use `updateAllMetaTags()` from `/src/lib/update-meta-tags.ts`. Static gen: `scripts/utils/generate-static-pages.ts`.

**OG Images**: Generic=social-card.png, Product=first cover image.

## Styling

Tailwind v4, theme in `/src/styles/index.css`: primary (#ffffff), secondary (#e5007d), background (#37404c).

## Responsive Design

**Breakpoints**: sm(600), md(960), lg(1280), xg(1600), xl(1920), 2xl(2440)

- Product grids: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`
- Use `Section` component for containers

## Data Management

All entities: JSON in `/src/data/`, Zod schemas in `/src/schemas/`, types in `/src/types/`, CLI in `/scripts/update-*.ts`, validation in `/scripts/validate-*.ts`.

**Product files** (in `/src/data/products/`):

- `{id}.json` - core data
- `{id}-sales-copy-{variant}.json` - marketing
- `{id}-faq.json`, `{id}-testimonials.json`, `{id}-media.json`, `{id}-stats.json`

**Aggregation**: Individual files → validate → merge external → compute ratings → `products.json` (gitignored)

## Managing Products

**CLI**: `bun run update:products` | **Validate**: `bun run validate:products`

**Individual fields**: id, name, gumroadId, isGumroadProduct, gumroadProductSlugs, activeSalesCopyId, price, priceDisplay, priceTier, currency, discount, isSubscription, paymentFrequencies, defaultPaymentFrequency, mainCategory, secondaryCategories, tags, variants, gumroadUrl, websiteUrl, demoUrl, documentationUrl, githubUrl, status, featured, bestValue, bestseller, priority, createdAt, updatedAt

### Gumroad Integration Fields

- `gumroadId`: Internal Gumroad product ID (e.g., "ND-WoQbTx1d9m1phJKOT9Q=="), nullable
- `isGumroadProduct`: Boolean, true if sold on Gumroad
- `gumroadProductSlugs`: Array of Gumroad slugs for redirects (e.g., ["obsidian-starter-kit", "mghmmj"]), nullable

**NOT in individual files**: faqs, testimonials, media, inline sales copy

**Priority**: 100 (flagship), 90-95 (featured), 80-85 (premium), 70-79 (standard), 60-69 (workshops), 50-59 (coaching), 40-49 (free), 20-29 (archived)

### Subscription Products

```json
{
    "priceTier": "subscription",
    "isSubscription": true,
    "paymentFrequencies": ["monthly", "yearly", "biennial"],
    "defaultPaymentFrequency": "monthly",
    "variants": [
        {
            "name": "Explorer",
            "price": 4.99,
            "gumroadVariantId": "explorer",
            "prices": { "monthly": 4.99, "yearly": 49.99, "biennial": 89.99 }
        }
    ]
}
```

### Gumroad URLs

Auto-added params: `wanted=true`, `quantity=1`, `variant={id}`, `monthly/yearly/every_two_years=true`. See `/src/lib/gumroad-url.ts`.

### howItWorks (in sales copy)

`howItWorks: { title: string|null, description: string|null, mediaIds: string[] } | null`

- null = hidden, title/description null = defaults

### mediaSections (in sales copy)

`mediaSections: { main/secondary/bonus: { show: boolean, title: string|null, description: string|null, mediaIds: string[]|null } | null } | null`

- null = auto, show:false = hidden, mediaIds:null = auto

## Product Links

**CRITICAL**: Run `bun run validate:product-links` before committing.

**Format**: `/product/{product-id}` (singular, NOT `/products/`)

**Errors**: `invalid-id` (doesn't exist), `wrong-path` (using `/products/`)

```typescript
<Link to={`/product/${product.id}`}>View</Link>  // React
[Knowii](/product/knowii-community)              // Markdown
```

## Managing Product Media

**CLI**: `bun run update:products` → Edit → Manage Media

**Groups**: cover (card thumbnails 16:9), main (above What's Included), secondary (below Benefits), bonus (below Ready to Get Started)

**Types**: `image` (PNG/JPG/WebP), `video` (YouTube)

**Priority for cards/OG**: cover → main → secondary → bonus

**File format**: `{ "data": [{ id, type, url, title, altText, order, group, width?, height?, youtubeId? }] }`

## Managing Sales Copy

**CLI**: `bun run update:products` (list/add/edit/enable/duplicate/remove)

**Required**: problem, problemPoints, agitate, agitatePoints, solution, solutionPoints, tagline, secondaryTagline (nullable), description, features, benefits, targetAudience, perfectFor, notForYou, trustBadges, guarantees, metaTitle, metaDescription, keywords, storytelling (nullable), timeline (nullable), courseContent (nullable), howItWorks (nullable), mediaSections (nullable)

### Storytelling (all optional)

originStory, creatorJourney, transformationArc, successStories, methodology, vision

### Timeline

```json
{
    "title": "...",
    "milestones": [
        { "id": "...", "timeframe": "Week 1", "title": "...", "description": "...", "icon": "🚀" }
    ]
}
```

## Managing Course Content

In sales copy as `courseContent` (nullable).

```json
{
    "sectionTitle": "...",
    "totalDuration": "12 hours",
    "difficulty": "beginner",
    "modules": [
        {
            "name": "...",
            "icon": "🚀",
            "duration": "25 min",
            "sections": [{ "name": "...", "duration": "5 min" }]
        }
    ]
}
```

## Accessing Product Data

- **AggregatedProduct/Product**: React components, runtime
- **IndividualProduct**: Build scripts, validation, CLI

Access: `product.salesCopy.tagline`, `product.faqs`, `product.media`

## Managing Promotion Banner

**CLI**: `bun run update:promotion` | **Validate**: `bun run validate:promotion`

**Modes**: ALWAYS, NEVER, PROMOTIONS (date-based)

## Managing Tags

**CLI**: `bun run update:tags` | **Validate**: `bun run validate:tags`

96 tags in `src/data/tags.json`. Priority: Featured 1-8, Non-featured 21+. Sync `TagIdSchema` after changes.

## Managing Categories

**CLI**: `bun run update:categories` | **Validate**: `bun run validate:categories`

23 categories in `src/data/categories.json`. Priority: Featured 1-7, Non-featured 8-23. Sync `CategoryIdSchema` after changes. Cannot remove if used as mainCategory.

## Managing FAQs and Testimonials

**CLI**: `bun run update:products` → Edit → Manage Content

Files: `{id}-faq.json`, `{id}-testimonials.json`. Testimonials assumed 5-star.

## Managing Global FAQ

**Validate**: `bun run validate:global-faq`

File: `src/data/faq-global.json`. Fields: id, question, answer, icon, order, style (default/highlight), features, steps, bullets, links, additionalText.

## Managing Product Stats

**CLI**: `bun run update:products` → Edit → Manage Content → Manage Stats

File: `{id}-stats.json`. Fields: userCount, timeSaved, ratings. Computed: ratingsCount, averageRating.

## Managing Redirects

**Generate**: `bun run generate:redirects`

The `public/_redirects` file is auto-generated from:

1. Product JSON files - `gumroadProductSlugs` → `/product/{id}` redirects
2. `src/data/redirects.json` - additional redirects (affiliates, SPA fallback)

**Redirects schema**: `{ source, destination, httpStatusCode }` (all required, not nullable)

**Example redirects.json**:

```json
{
    "redirects": [
        {
            "source": "/affiliates",
            "destination": "https://developassion.gumroad.com/affiliates",
            "httpStatusCode": 301
        },
        { "source": "/*", "destination": "/index.html", "httpStatusCode": 200 }
    ]
}
```

**Note**: SPA fallback (`/*`) is always placed last. Do not manually edit `_redirects`.

## Testing

**Framework**: Bun test, React Testing Library, Jest DOM, Happy DOM

**Naming**: `*.spec.ts`, `*.spec.tsx`, `*.integration.spec.ts`

**Coverage**: Utilities 90%+, Components 80%+, Schemas 100%

```bash
bun test              # Watch
bun run test:run      # Once
bun run test:coverage # Report
```

## Development Commands

```bash
bun run store              # Store CLI
bun dev                    # Dev server
bun run build              # Production
bun run lint               # Lint
bun run tsc                # Type check
bun run validate:all       # Validate data
bun run generate:redirects # Rebuild _redirects
bun run ci:local           # Full CI
```

## Best Practices

1. Write tests first
2. Run `bun run ci:local` before committing
3. Keep descriptions concise
4. Validate after edits (`bun run validate:all`)
5. Use conventional commits
6. Don't edit CHANGELOG.md (auto-generated)
7. CLI docs: succinct here, details in skills
8. Ask about backwards compatibility before breaking changes
9. Never use `any` type
10. No re-exports for backwards compatibility
11. Branding changes: update `index.html`, `generate-static-pages.ts`, `generate-llms-txt.ts`
12. Zod: prefer `.nullable()` over `.optional()`
13. New pages: add navigation action to command palette (`src/components/products/command-palette.tsx`)

## Claude Code Skills

Skills in `.claude/skills/`:

**Data**: manage-products, manage-categories, manage-tags, manage-promotion, manage-global-faq, add-product-media

**Content**: manage-taglines, add-icons-to-taxonomy

**Marketing**: optimize-product-images
