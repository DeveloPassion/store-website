# AGENTS.md - Store Website Maintenance Guide

This document provides instructions for AI agents and developers on how to maintain and extend this store website.

## Project Overview

Static website built with React 19+, TypeScript, Bun, Tailwind CSS v4, React Router, and React Icons. Features include product showcase, category/tag filtering, command palette (`/` or `Ctrl+K`), and fully responsive design.

## Schema Architecture

The product system uses two distinct schemas to maintain clean separation between individual product files and aggregated runtime data:

**IndividualProductSchema** (`/src/schemas/product.schema.ts`):

- Used for individual `{product-id}.json` files in `/src/data/products/`
- Contains core product data: identity, pricing, subscription, taxonomy, variants, links, status, meta
- Does NOT include: `faqs`, `media`, or inline sales copy fields (tagline, description, etc.)
- References external data via `activeSalesCopyId` (required, non-nullable)
- All boolean flags required: `featured`, `bestValue`, `bestseller`, `isSubscription`
- All taxonomy fields required: `mainCategory`, `secondaryCategories`, `tags`

**AggregatedProductSchema** (`/src/schemas/product.schema.ts`):

- Used for aggregated `products.json` at build time
- Merges individual product with external data files during aggregation
- Includes `salesCopy` object (nested): `product.salesCopy.tagline`, `product.salesCopy.description`, etc.
- Includes `faqs` array (loaded from `{product-id}-faq.json`)
- Includes `media` array (loaded from `{product-id}-media.json`)
- Used at runtime throughout the application

**Key Differences:**

| Field               | IndividualProduct       | AggregatedProduct                   |
| ------------------- | ----------------------- | ----------------------------------- |
| `activeSalesCopyId` | Required (non-nullable) | Required (non-nullable)             |
| `salesCopy`         | Not present             | Required object with all PAS fields |
| `faqs`              | Not present             | Required array (can be empty)       |
| `testimonials`      | Not present             | Required array (can be empty)       |
| `media`             | Not present             | Required array (can be empty)       |
| Inline sales fields | Not present             | Not present (use `salesCopy.*`)     |

**Type Usage in Code:**

```typescript
import { IndividualProduct, AggregatedProduct } from '@/types/product'

// For individual product files (before aggregation)
const product: IndividualProduct = {
    /* ... */
}

// For runtime use (after aggregation)
const product: AggregatedProduct = {
    /* ... */
}
// Access: product.salesCopy.tagline, product.salesCopy.description, etc.

// Convenience alias
const product: Product = {
    /* ... */
} // Same as AggregatedProduct
```

**Benefits Schema Requirements:**

Both `IndividualBenefitsSchema` (in sales copy) and `AggregatedBenefitsSchema` (in aggregated product) require all three categories:

- `immediate`: Array of immediate benefits
- `systematic`: Array of systematic benefits
- `longTerm`: Array of long-term benefits

All three arrays must be present (can be empty arrays if no benefits for that category).

## Product Display

**IMPORTANT**: Always use `ProductCardEcommerce` component (`/src/components/products/product-card-ecommerce.tsx`) when displaying products.

## Icons

Icons can be React-icon names (e.g., `"FaCalendarAlt"`, `"SiObsidian"`) or URLs. Available icons include FontAwesome (Fa*) and Simple Icons (Si*). Icon registry is in `/src/lib/icon-registry.ts`. Brand colors and size presets are configured in `/src/components/ui/dynamic-icon.tsx`.

## Meta Tags and Open Graph Images

**CRITICAL**: All pages must properly handle meta tags for SEO and social sharing. This includes both static generation (build time) and runtime updates (client-side navigation).

### Required Meta Tags

Every page must update these meta tags:

1. **Document title**: `document.title`
2. **Meta description**: `<meta name="description">`
3. **Open Graph tags**: `og:title`, `og:description`, `og:url`, `og:image`
4. **Twitter Card tags**: `twitter:title`, `twitter:description`, `twitter:url`, `twitter:image`
5. **Canonical URL**: `<link rel="canonical">`

### OG Image Rules

- **Generic pages**: `https://store.dsebastien.net/assets/images/social-card.png`
- **Product pages**: Use primary cover image (`media.group === 'cover'`, sorted by `order`, lowest first) if available, otherwise fall back to default social card
- **Home page**: Set in `index.html`

### Implementation

**Use the utility function** `updateAllMetaTags()` from `/src/lib/update-meta-tags.ts`:

```typescript
import { updateAllMetaTags } from '@/lib/update-meta-tags'

useEffect(() => {
    updateAllMetaTags({
        title: 'Page Title - Knowledge Forge',
        description: 'Page description for SEO and social sharing',
        url: 'https://store.dsebastien.net/page-path',
        image: 'https://store.dsebastien.net/image.png' // Optional, defaults to social-card.png
    })
}, [dependencies])
```

### Static Generation

Product pages, category pages, and tag pages have their meta tags pre-rendered at build time via `scripts/utils/generate-static-pages.ts`. This ensures search engines and social media crawlers see correct metadata without JavaScript execution.

**When adding new page types**, update `generate-static-pages.ts` to pre-render their meta tags.

### Why Both?

- **Static HTML**: For SEO crawlers and social media link unfurling (they don't execute JavaScript)
- **Runtime updates**: For correct meta tags during client-side navigation with React Router

## Styling

Tailwind CSS v4 with custom theme in `/src/styles/index.css`:

- `--color-primary: #ffffff` (main text)
- `--color-secondary: #e5007d` (pink accent)
- `--color-secondary-text: #ff1493` (hover)
- `--color-background: #37404c`

## Responsive Design

**CRITICAL**: Ensure responsive UI works across all device sizes (mobile to ultra-wide).

**Breakpoints**: sm(600px), md(960px), lg(1280px), xg(1600px), xl(1920px), 2xl(2440px)

**Guidelines:**

- Use `Section` component for consistent containers (`max-w-[1800px] 2xl:max-w-[2200px]`)
- Product grids: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`
- Category grids: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`
- Avoid small `max-w-*` on grid containers; use `w-full` instead
- Test at: mobile (320-600px), tablet (600-960px), desktop (960-1920px), ultra-wide (1920-2440px+)

## Data Management Overview

All data entities (Products, Categories, Tags, Promotion, FAQs, Testimonials) follow this pattern:

- **Files**: Individual JSON files in `/src/data/`
- **Schema**: Zod schemas in `/src/schemas/*.schema.ts` (source of truth)
- **Types**: TypeScript types in `/src/types/*.ts`
- **CLI Tools**: Interactive scripts in `/scripts/update-*.ts`
- **Validation**: Scripts in `/scripts/validate-*.ts`
- **Skills**: Claude Code skills in `.claude/skills/manage-*.md`

**Schema Organization:**

Each schema file contains ONE primary schema with optional tightly-coupled helper schemas. Independent schemas must be in separate files (e.g., `ProductBenefitsSchema` in `product-benefits.schema.ts`, `ProductStatsSchema` in `product-stats.schema.ts`).

**Product Data Architecture:**

Individual product files (`{product-id}.json`) contain ONLY core product data. External data is stored separately and merged during aggregation:

- **Individual product file**: Core data (pricing, taxonomy, variants, links, status, `activeSalesCopyId`)
- **Sales copy files**: `{product-id}-sales-copy-{variant}.json` (marketing copy, PAS framework, storytelling)
- **FAQ files**: `{product-id}-faq.json` (product-specific questions/answers)
- **Media files**: `{product-id}-media.json` (images, videos, screenshots)
- **Testimonials files**: `{product-id}-testimonials.json` (customer reviews, all assumed 5-star)
- **Stats files**: `{product-id}-stats.json` (optional: userCount, timeSaved, ratings by source)

During build-time aggregation:

1. Individual product files are validated against `IndividualProductSchema`
2. External files (sales copy, FAQs, media, testimonials, stats) are loaded
3. Active sales copy variant is merged into product as `salesCopy` object
4. Computed fields `ratingsCount` and `averageRating` are calculated from stats + testimonials (testimonials count as 5-star)
5. Result is validated against `AggregatedProductSchema`
6. Aggregated products are written to `products.json` (gitignored, runtime use)

**Common Workflow:**

1. Use CLI tool (`bun run update:<entity>`) or edit JSON directly
2. Validate (`bun run validate:<entity>`)
3. Fix errors if any
4. Commit changes

## Managing Products

Products are JSON files in `/src/data/products/{product-id}.json`. Auto-aggregated into `products.json` (gitignored) at build time.

**CLI**: Use `bun run update:products` for interactive management or `bun run validate:products` to validate after changes.

**Schema**: See `/src/schemas/product.schema.ts` for complete field definitions.

**Individual Product Schema (`IndividualProductSchema`):**

- Identity: `id`, `slug`, `name`, `activeSalesCopyId` (required, non-nullable)
- Pricing: `price`, `priceDisplay`, `priceTier`, `currency`, `discount`
- Subscription: `isSubscription` (required), `paymentFrequencies`, `defaultPaymentFrequency`
- Taxonomy: `mainCategory` (required), `secondaryCategories` (required), `tags` (required)
- Variants: Defined within product schema with pricing, Gumroad URLs, variant IDs
- Links: `gumroadUrl`, `websiteUrl`, `demoUrl`, `documentationUrl`, `githubUrl`
- Status: `status`, `featured` (required), `bestValue` (required), `bestseller` (required)
- Meta: `priority`, `createdAt`, `updatedAt`

**Fields NOT in Individual Product Files:**

- NO `faqs` (loaded from `{product-id}-faq.json` during aggregation)
- NO `testimonials` (loaded from `{product-id}-testimonials.json` during aggregation)
- NO `media` (loaded from `{product-id}-media.json` during aggregation)
- NO inline sales copy fields (tagline, description, etc. - use sales copy files instead)

**Aggregated Product Schema (`AggregatedProductSchema`):**

- Everything from `IndividualProductSchema`
- PLUS `salesCopy` object with all PAS framework fields (merged from active sales copy variant)
- PLUS `faqs` array (required but can be empty, from FAQ file)
- PLUS `testimonials` array (required but can be empty, from testimonials file)
- PLUS `media` array (required but can be empty, from media file)

**CLI vs Direct Editing:**

- **CLI**: Adding products, taxonomy changes, pricing/status/priority, managing sales copy variants, media, FAQs
- **Direct editing**: Variants configuration, links, subscription settings, advanced meta fields

**Priority Guidelines:**

- 100: Flagship products
- 90-95: Featured products/bundles
- 80-85: Premium kits/courses
- 70-79: Standard kits/courses/guides
- 60-69: Workshops/tools
- 50-59: Coaching/standard
- 40-49: Free resources
- 20-29: Archived

**Subscription Products:**

For products with `priceTier: 'subscription'`, add these fields:

- `isSubscription: true` - Enables subscription-specific UI/UX
- `paymentFrequencies`: Array of `['monthly', 'yearly', 'biennial', 'one-time']`
- `defaultPaymentFrequency`: Default selection ('monthly', 'yearly', or 'biennial')

Each variant can have:

- `gumroadVariantId`: Maps to Gumroad's variant system for pre-selection
- `paymentFrequency`: Variant-specific frequency

**Gumroad URL Parameters:**

All purchase URLs automatically include these working parameters:

**Required Parameters:**

- `wanted=true` - Enables Gumroad overlay checkout (direct to checkout page)
- `quantity=1` - Sets item quantity to 1

**Variant Selection:**

- `variant={gumroadVariantId}` - Pre-selects product variant/tier when gumroadVariantId is set
    - Example: `variant=explorer`, `variant=knowledge-builder`, `variant=knowledge-master`

**Payment Frequency (Subscriptions):**
Use boolean parameters to pre-select billing cycle:

- `monthly=true` - Pre-selects monthly billing
- `yearly=true` - Pre-selects yearly billing
- `every_two_years=true` - Pre-selects 2-year billing

**Note:** Gumroad also supports `option={encoded_id}` for variant selection (seen in product URLs), but we use the simpler `variant={id}` parameter which is confirmed working.

**Implementation:** See `/src/lib/gumroad-url.ts` for URL building logic. All parameters are automatically added by `buildGumroadUrlFromProduct()`.

Example subscription product structure:

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
            "priceDisplay": "€4.99/month",
            "gumroadUrl": "https://gumroad.com/l/product",
            "gumroadVariantId": "explorer",
            "paymentFrequency": "monthly",
            "prices": {
                "monthly": 4.99,
                "yearly": 49.99,
                "biennial": 89.99
            }
        }
    ]
}
```

**Per-Frequency Pricing:** The `prices` object enables accurate savings calculation and dynamic price display in the PaymentFrequencySelector. When a user selects yearly or biennial frequency, the UI automatically calculates and displays the percentage savings compared to monthly pricing.

## Managing Product Media

Products support rich media (images and videos) organized into four groups: **cover**, **main**, **secondary**, and **bonus**. Each group serves a specific purpose in the product display.

**CLI**: Use `bun run update:products` (select "Edit existing product" → "🖼️ Manage Media") for interactive media management with list, add, edit, remove, and reorder operations.

**Schema**: See `/src/schemas/media.schema.ts` for complete field definitions.

**Media Types:**

- `image`: Static images (PNG, JPG, WebP, etc.)
- `video`: YouTube videos (click-to-play, no autoplay)

**Media Groups & Placement:**

- `cover`: Product card thumbnails - optimized for card display (16:9 aspect ratio recommended)
- `main`: Above "What's Included" section - primary product showcase
- `secondary`: Below "Benefits You'll Experience" - deeper dive content
- `bonus`: Below "Ready to Get Started" - additional resources/social proof

**Media Display:**

Each group displays in a mixed-media carousel with:

- Auto-rotation (7 seconds, pauses on hover)
- Keyboard navigation (Arrow keys)
- Navigation arrows + dot indicators
- Lightbox for images (full-screen viewing)
- YouTube embeds for videos (click-to-play)
- Captions (optional)

**YouTube Video Support:**

- Automatically extracts video ID from YouTube URLs
- Supports formats: `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/embed/ID`
- Uses `youtube-nocookie.com` domain for privacy
- Generates high-quality thumbnails automatically
- Videos require user click to play (no autoplay)

**Example Media Object:**

```json
{
    "id": "main-1234567890",
    "type": "image",
    "url": "/assets/images/knowii/screenshot-dashboard.png",
    "title": "Dashboard Overview",
    "description": "Main dashboard showing knowledge graph visualization",
    "altText": "Knowii dashboard with interactive knowledge graph",
    "caption": "Visualize your knowledge connections",
    "order": 0,
    "group": "main",
    "width": 1920,
    "height": 1080
}
```

**Best Practices:**

- Use descriptive titles and alt text for accessibility
- Keep order sequential within groups (0, 1, 2...)
- **Cover images**: Use 16:9 aspect ratio, compress to WebP (max 800x450)
- **Banner images**: High-quality hero images, WebP preferred (max 1920x1080)
- **Main/secondary/bonus**: Screenshots, demos, tutorials
- Compress images before upload (WebP preferred)
- Use high-quality YouTube thumbnails (auto-generated)
- Add 1-2 cover images for best UX

**Product Card Display:**

Product cards automatically display the first image from the media array with priority: cover → main → secondary → bonus. Cover images are recommended for consistent card thumbnails.

**Open Graph Images:**

The first image from the media array (prioritized by group: cover → main → secondary → bonus) is automatically used for og:image meta tags for social sharing. Cover images are recommended for social cards.

**Storage:**

Media is stored separately from product JSON files for better organization and cleaner git diffs:

- FAQs: `src/data/products/{product-id}-faq.json`
- Testimonials: `src/data/products/{product-id}-testimonials.json`
- Media: `src/data/products/{product-id}-media.json`

These files are automatically loaded during aggregation and attached to products.

**File Format:**

All FAQ, Testimonial, and Media files use a consistent JSON structure with a `data` property containing the array of items:

```json
{
    "data": [
        { "id": "item-1", ... },
        { "id": "item-2", ... }
    ]
}
```

**Media File Format:**

Media items are sorted by group priority (cover → main → secondary → bonus), then by order within each group.

Example `knowii-voice-ai-media.json`:

```json
{
    "data": [
        {
            "id": "cover-1234567890",
            "type": "image",
            "url": "/assets/images/knowii/cover.png",
            "title": "Knowii Cover",
            "altText": "Knowii app cover image",
            "order": 0,
            "group": "cover",
            "width": 1200,
            "height": 630
        },
        {
            "id": "main-1234567891",
            "type": "video",
            "url": "https://youtube.com/watch?v=abc123",
            "title": "Demo Video",
            "altText": "Product demonstration video",
            "order": 0,
            "group": "main",
            "youtubeId": "abc123"
        }
    ]
}
```

## Managing Sales Copy

Sales copy is extracted from product JSON files into versioned `-sales-copy-{variant}.json` files. This enables A/B testing, seasonal campaigns, and cleaner product data management.

**Architecture:**

- **Product JSON**: Core product data (pricing, taxonomy, links, meta) + `activeSalesCopyId` reference
- **Sales Copy Files**: `{product-id}-sales-copy-{variant}.json` (marketing copy, features, benefits, storytelling)
- **Active Variant**: Product JSON references active variant via `activeSalesCopyId` field (required, non-nullable)
- **Aggregation**: Sales copy auto-loaded and merged into product as `salesCopy` object during build
- **Runtime Access**: Use `product.salesCopy.tagline`, `product.salesCopy.description`, etc. in code

**CLI**: Use `bun run update:products` for managing sales copy variants with operations: list, add, edit, enable, duplicate, and remove.

**Schema**: See `/src/schemas/sales-copy.schema.ts`, `/src/schemas/storytelling.schema.ts`, and `/src/schemas/timeline.schema.ts` for complete field definitions.

**Required Fields in `SalesCopyDataSchema`:**

- **PAS Framework**: `problem` (required), `problemPoints` (required), `agitate` (required), `agitatePoints` (required), `solution` (required), `solutionPoints` (required)
- **Content**: `tagline` (required), `secondaryTagline` (required but nullable), `description` (required), `features` (required), `benefits` (required with all three categories)
- **Audience**: `targetAudience` (required), `perfectFor` (required), `notForYou` (required)
- **Trust**: `trustBadges` (required), `guarantees` (required)
- **SEO**: `metaTitle` (required), `metaDescription` (required), `keywords` (required)
- **Storytelling**: `storytelling` (required but nullable - can be null or contain storytelling sections)
- **Timeline**: `timeline` (required but nullable - can be null or contain transformation journey milestones)

**Benefits Object Requirements:**
All three categories are strictly required (can be empty arrays):

- `immediate`: Array of immediate benefits
- `systematic`: Array of systematic benefits
- `longTerm`: Array of long-term benefits

**Storytelling Sections** (storytelling object can be null or contain any of these optional sections):

1. **Origin Story** - Why product exists, genesis moment, inspiration
2. **Creator Journey** - Personal story, struggles, credibility, achievements
3. **Transformation Arc** - Before/during/after customer journey with timeline
4. **Success Stories** - Detailed case studies with metrics, customer results
5. **Methodology** - Step-by-step process, philosophy, differentiation
6. **Vision** - Mission statement, bigger picture, values, future goals

**Timeline Structure** (transformation journey with time-based milestones):

The timeline shows the progression of benefits over time, distinct from the transformation arc (before/during/after). Use it for granular, time-based milestones.

- `title` (optional): Header title, defaults to "Your Transformation Journey"
- `subtitle` (optional): Header subtitle, defaults to "See what you'll achieve over time"
- `milestones` (required): Array of milestone objects (at least 1 required):
    - `id` (required): Unique identifier
    - `timeframe` (required): Display text like "Week 1", "Month 1", "Day 1"
    - `title` (required): Milestone title
    - `description` (required): Detailed description (min 10 chars)
    - `highlights` (optional): Array of bullet points
    - `icon` (optional): Emoji (e.g., "🚀") or React icon name (e.g., "FaRocket")

**ProductTimeline Component:**

Displays the timeline on product pages after ProductBenefits. Features:

- Vertical timeline with connecting line
- Milestone cards with timeframe badges
- Optional icon or numbered indicators
- Alternating layout on desktop (left/right)
- Staggered scroll animations

## Accessing Product Data in Code

Understanding when to use `IndividualProduct` vs `AggregatedProduct` types is critical for type safety:

**Use `AggregatedProduct` (or `Product` alias):**

- In all React components (runtime, after aggregation)
- When loading from `products.json`
- When accessing sales copy data via `product.salesCopy.*`
- When accessing FAQs via `product.faqs`
- When accessing testimonials via `product.testimonials`
- When accessing media via `product.media`

**Use `IndividualProduct`:**

- In build scripts working with individual product files
- During validation before aggregation
- In CLI tools that read/write individual product files
- When you need to distinguish between pre-aggregation and post-aggregation data

**Example Usage:**

```typescript
// React component (runtime - use AggregatedProduct)
import { AggregatedProduct } from '@/types/product'

function ProductCard({ product }: { product: AggregatedProduct }) {
    return (
        <div>
            <h2>{product.salesCopy.tagline}</h2>
            <p>{product.salesCopy.description}</p>
            <p>Price: {product.priceDisplay}</p>
            {product.media && <img src={product.media[0].url} />}
        </div>
    )
}

// Build script (pre-aggregation - use IndividualProduct)
import { IndividualProduct } from '@/types/product'

function validateProduct(product: IndividualProduct) {
    console.log('Product:', product.name)
    console.log('Active sales copy:', product.activeSalesCopyId)
    // No access to product.salesCopy here - it doesn't exist yet
}
```

**Important Notes:**

- The `Product` type is a convenience alias for `AggregatedProduct`
- Sales copy fields are accessed via `product.salesCopy.*` in aggregated products
- Individual products reference sales copy via `activeSalesCopyId` only
- FAQs and media are ONLY available in aggregated products

**File Structure:**

Example `knowii-voice-ai-sales-copy-default.json`:

```json
{
    "id": "default",
    "salesCopy": {
        "tagline": "Transform your knowledge workflow",
        "secondaryTagline": "AI-powered knowledge management",
        "problem": "Knowledge workers struggle with information overload",
        "problemPoints": [
            "Scattered information across multiple tools",
            "No centralized knowledge base"
        ],
        "agitate": "This costs you time, money, and opportunities",
        "agitatePoints": [
            "Wasted hours searching for information",
            "Missed deadlines due to disorganization"
        ],
        "solution": "Knowii brings everything together",
        "solutionPoints": ["Unified knowledge workspace", "AI-powered organization"],
        "description": "A comprehensive knowledge management solution",
        "features": ["Voice-to-text capture", "AI categorization"],
        "benefits": {
            "immediate": ["Start capturing knowledge today"],
            "systematic": ["Build a lasting knowledge base"],
            "longTerm": ["Compound your expertise over time"]
        },
        "targetAudience": ["Knowledge workers", "Researchers"],
        "perfectFor": ["Content creators", "Consultants"],
        "notForYou": ["If you prefer paper notes"],
        "trustBadges": ["30-day money-back guarantee"],
        "guarantees": ["Full refund if not satisfied"],
        "metaTitle": "Knowii - Knowledge Management Made Easy",
        "metaDescription": "Transform your workflow with AI",
        "keywords": ["pkm", "knowledge management"],
        "storytelling": {
            "originStory": {
                "title": "How Knowii Was Born",
                "story": "One day I realized there had to be a better way..."
            }
        }
    }
}
```

## Managing Promotion Banner

Configuration in `src/data/promotion.json` (not gitignored).

**CLI**: Use `bun run update:promotion` for interactive configuration or `bun run validate:promotion` to validate.

**Schema**: See `/src/schemas/promotion.schema.ts` for complete field definitions.

**Behavior Modes:** ALWAYS (always visible), NEVER (never shown), PROMOTIONS (shows during configured period)

## Managing Tags

96 tags in `src/data/tags.json` (object/map structure). Used for detailed product metadata.

**CLI**: Use `bun run update:tags` for interactive management or `bun run validate:tags` to validate after changes.

**Schema**: See `/src/schemas/tag.schema.ts` for complete field definitions.

**Priority Guidelines**: Featured 1-8, Non-featured 21+

**Critical**: Sync `TagIdSchema` enum in schema after add/remove operations

## Managing Categories

23 categories in `src/data/categories.json` (array structure). Used for broad product organization.

**CLI**: Use `bun run update:categories` for interactive management or `bun run validate:categories` to validate after changes.

**Schema**: See `/src/schemas/category.schema.ts` for complete field definitions.

**Priority Guidelines**: Featured 1-7, Non-featured 8-23

**Usage**: Every product has one `mainCategory` (required) and 0-N `secondaryCategories` (optional, with `distant` flag)

**Removal**: CANNOT remove if used as mainCategory; CAN remove (with --force) if only in secondaryCategories

**Critical**: Sync `CategoryIdSchema` enum in schema after add/remove operations

## Managing FAQs and Testimonials

Product-specific files: `{product-id}-faq.json` and `{product-id}-testimonials.json`. Auto-loaded during product aggregation.

**CLI**: Use `bun run update:products` (select "Edit existing product" → "📝💬 Manage Content") for interactive FAQ and testimonial management with list, add, edit, and remove operations.

**Schemas**: See `/src/schemas/faq.schema.ts` and `/src/schemas/testimonial.schema.ts` for complete field definitions.

**Note**: Testimonials no longer have a `rating` field. All testimonials are assumed to be 5-star and contribute to the computed `averageRating` during aggregation.

## Managing Product Stats

Optional stats files: `{product-id}-stats.json`. Contains social proof metrics and ratings by source. Auto-loaded during product aggregation into `AggregatedProductSchema.stats`.

**CLI**: Use `bun run update:products` (select "Edit existing product" → "📝 Manage Content" → "📊 Manage Stats") for interactive stats management:

- Edit userCount and timeSaved display strings
- Add, view, and remove ratings grouped by source

**Schema**: See `/src/schemas/stats.schema.ts` for complete field definitions (`StatsSchema`, `RatingSchema`, `RatingsSchema`).

**Fields**:

- `userCount`: Display string (e.g., "2,000+ users")
- `timeSaved`: Display string (e.g., "10+ hours/week")
- `ratings`: Record of source → array of `{ id, rating (0-5, nullable), date (nullable) }`

**Computed Fields**: During aggregation, `ratingsCount` and `averageRating` are computed from stats ratings combined with testimonials (each testimonial counts as a 5-star rating).

**Note**: Stats are stored in separate files, NOT in individual product JSON files. The stats property only exists in `AggregatedProductSchema` (loaded during aggregation), not in `IndividualProductSchema`.

## Testing Requirements

**CRITICAL**: Comprehensive testing mandatory for all code. Tests must be co-located with source files.

**Framework**: Bun test (built-in test runner), React Testing Library, Jest DOM, Happy DOM

**Naming**: `filename.spec.ts` (unit), `filename.spec.tsx` (components), `filename.integration.spec.ts` (integration)

**Coverage Requirements:**

- Utility functions: 90%+
- Components: 80%+ for critical paths
- Schemas: 100%

**What to Test:**

- All functions in `src/lib/` (all paths, edge cases, immutability)
- All components (props, interactions, conditional rendering, a11y)
- All Zod schemas (required fields, validation rules, edge cases)
- Scripts core logic (extract into testable functions)

**Commands:**

```bash
bun test                              # Watch mode
bun run test:run                      # Run once
bun run test:ui                       # UI mode
bun run test:coverage                 # Coverage report
```

**CI/CD**: All tests must pass before merge/deploy/release.

**Skip tests only for**: Type definitions (`.d.ts`), config files (`*.config.ts`), simple re-exports.

## Development Commands

```bash
bun run store                         # Store CLI (all management tools)
bun dev                           # Dev server (auto-aggregates)
bun run build                         # Production build
bun run lint / format / tsc           # Code quality
bun test / test:run / test:coverage   # Testing
bun run validate:all                  # Validate all data
bun run ci:local                      # Full CI checks locally
bun run release                       # Deploy to Cloudflare Pages
```

## Deployment

Ignore!

## Accessibility

Keyboard navigation, ARIA labels, focus management, command palette shortcuts, semantic HTML.

## Best Practices

1. Write tests first (mandatory)
2. Run `bun run ci:local` before committing
3. Keep descriptions concise (1-2 sentences)
4. Validate data after edits (`bun run validate:all`)
5. Use conventional commits
6. Don't edit CHANGELOG.md (auto-generated)
7. **CLI Documentation**: When documenting CLIs in AGENTS.md, keep explanations succinct - one sentence about what the CLI can be used for and the basic command invocation. Detailed CLI arguments and examples belong in skill files (`.claude/skills/`) only.
8. **Backwards Compatibility**: When there is a question of backwards compatibility (e.g., renaming routes, changing URLs, renaming fields), ALWAYS ASK the user whether they want to maintain backwards compatibility or if breaking changes are acceptable. Do not assume either way.
9. **TypeScript Types**: NEVER use `any` type unless absolutely unavoidable. Always use proper TypeScript types such as `React.ComponentPropsWithoutRef<'element'>`, `React.ReactNode`, specific interface types, or generic constraints. The `any` type bypasses type safety and should be avoided.
10. **No Re-exports for Backwards Compatibility**: NEVER re-export types, interfaces, schemas, or functions from one module just for backwards compatibility. Always import from the original source where they are defined. Update all import statements throughout the codebase to point to the correct source. This keeps the codebase clean and makes dependencies explicit.
11. **Branding Consistency**: When making branding changes (site name, taglines, descriptions), update ALL of these locations:
    - `src/index.html` - Base HTML template with meta tags
    - `scripts/utils/generate-static-pages.ts` - Static page generation (JSON-LD schemas, page titles, meta tags)
    - `scripts/utils/generate-llms-txt.ts` - LLMs.txt file generation (site title)
    - React page components (if they have hardcoded branding in `useEffect` hooks or titles)

    **Search strategy**: Use `grep -r "old-brand-name"` across the codebase to find all instances that need updating. The build scripts must match the branding in `index.html` to ensure consistency between static generation and runtime.

**Pre-Commit Checklist:**

```bash
bun run ci:local  # Runs: tests, lint, tsc, validate:all, build, format
```

## Claude Code Skills

Dedicated skills available in `.claude/skills/` for comprehensive store management and optimization:

### Data Management Skills

- **manage-products** - Add, edit, list, remove products with full CRUD operations
    - Keywords: product, products, add product, edit product, list products
- **manage-categories** - Add, modify, list, remove product categories
    - Keywords: category, categories, taxonomy
- **manage-tags** - Add, modify, list, remove product tags
    - Keywords: tag, tags, taxonomy
- **manage-promotion** - Configure promotion banner (behavior, dates, text, links)
    - Keywords: promotion, banner, promo, discount
- **add-product-media** - Add product images/videos with optimization and conversion-focused metadata
    - Keywords: media, screenshot, video, image, cover, visual, add

### Content Enhancement Skills

- **manage-taglines** - Generate and optimize product taglines and value propositions
    - Keywords: tagline, taglines, headline, value proposition
- **add-icons-to-taxonomy** - Add icons and colors to categories and tags
    - Keywords: icon, icons, color, colors, taxonomy

### Marketing & Optimization Skills

- **optimize-product-images** - Generate AI image prompts, cover text overlays, and screenshot strategies for maximum conversion
    - Keywords: optimize images, image prompt, marketing visuals, conversion, screenshot strategy, cover image, headline, cta

**Invocation**: Skills are automatically triggered when you mention their keywords in conversation. Example: "optimize images for knowii" will invoke the optimize-product-images skill.
