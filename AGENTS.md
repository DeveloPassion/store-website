# AGENTS.md - Store Website Maintenance Guide

This document provides instructions for AI agents and developers on how to maintain and extend this store website.

## Project Overview

Static website built with React 19+, TypeScript, Bun, Tailwind CSS v4, React Router (HashRouter), and React Icons. Features include product showcase, category/tag filtering, command palette (`/` or `Ctrl+K`), and fully responsive design.

## Product Display

**IMPORTANT**: Always use `ProductCardEcommerce` component (`/src/components/products/product-card-ecommerce.tsx`) when displaying products.

## Icons

Icons can be React-icon names (e.g., `"FaCalendarAlt"`, `"SiObsidian"`) or URLs. Available icons include FontAwesome (Fa*) and Simple Icons (Si*). Icon registry is in `/src/lib/icon-registry.ts`. Brand colors and size presets are configured in `/src/components/ui/dynamic-icon.tsx`.

## Meta Tags and Open Graph Images

All pages must set `og:image` meta tags.

- **Generic pages**: `https://store.dsebastien.net/assets/images/social-card.png`
- **Product pages**: coverImage of the product if any available or fall back to the default otherwise
- **Home page**: Set in `index.html`

Include `useEffect` hook to update meta tags (title, description, og:image, og:title, og:description, og:url).

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

**Common Workflow:**

1. Use CLI tool (`bun run update:<entity>`) or edit JSON directly
2. Validate (`bun run validate:<entity>`)
3. Fix errors if any
4. Commit changes

## Managing Products

Products are ~50 field JSON files in `/src/data/products/{product-id}.json`. Auto-aggregated into `products.json` (gitignored) at build time.

**Quick Commands:**

```bash
bun run update:products               # Interactive CLI
bun run update:products -- --operation list [--featured|--category X|--tag Y]
bun run update:products -- --operation add|edit|remove [options]
bun run validate:products             # Validate after changes
```

**Product Structure** (53+ fields):

- Identity (5): id, permalink, name, tagline, secondaryTagline
- Pricing (6): price, priceDisplay, priceTier, gumroadUrl, variants
- Subscription (3): isSubscription, paymentFrequencies, defaultPaymentFrequency
- Taxonomy (3): mainCategory, secondaryCategories, tags
- Marketing (9): problem, problemPoints, agitate, agitatePoints, solution, solutionPoints
- Content (8): description, features, benefits, included, testimonialIds, faqIds, targetAudience, perfectFor, notForYou
- Media (1): media (array of MediaItem objects with rich metadata)
- Meta/Status (8): featured, bestValue, bestseller, status, priority, trustBadges, guarantees, crossSellIds
- Links (2): landingPageUrl, dsebastienUrl
- SEO (3): metaTitle, metaDescription, keywords

**Variant Structure** (8 fields):

- name, price, priceDisplay, description, gumroadUrl
- gumroadVariantId (optional): Gumroad's variant ID for pre-selection
- paymentFrequency (optional): 'monthly', 'yearly', 'biennial', or 'one-time'
- prices (optional): Per-frequency pricing object with `monthly`, `yearly`, `biennial`, `oneTime` properties for accurate savings calculation

**CLI vs Direct Editing:**

- **CLI**: Adding products, taxonomy changes, pricing/status/priority, quick updates
- **Direct editing**: Complex arrays (problemPoints, features, benefits), media, cross-references, SEO, advanced fields

**Priority Guidelines:**

- 100: Flagship products
- 90-95: Featured products/bundles
- 80-85: Premium kits/courses
- 70-79: Standard kits/courses/guides
- 60-69: Workshops/tools
- 50-59: Coaching/standard
- 40-49: Free resources
- 30-39: Community
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

**Example Working URLs:**

```
# Monthly Explorer tier
https://developassion.gumroad.com/l/knowii?wanted=true&quantity=1&variant=explorer&monthly=true

# Yearly Knowledge Builder tier
https://developassion.gumroad.com/l/knowii?wanted=true&quantity=1&variant=knowledge-builder&yearly=true

# 2-Year Knowledge Master tier
https://developassion.gumroad.com/l/knowii?wanted=true&quantity=1&variant=knowledge-master&every_two_years=true
```

**Note:** Gumroad also supports `option={encoded_id}` for variant selection (seen in product URLs), but we use the simpler `variant={id}` parameter which is confirmed working.

**Implementation:** See `/src/lib/gumroad-url.ts` for URL building logic. All parameters are automatically added by `buildGumroadUrlFromProduct()`.

**Tested & Confirmed:** All parameters verified working on https://developassion.gumroad.com/l/knowii

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

Products support rich media (images and videos) organized into five groups: **cover**, **banner**, **main**, **secondary**, and **bonus**. Each group serves a specific purpose in the product display.

**Quick Commands:**

```bash
# Interactive mode (recommended)
bun run update:products
# Select "Edit existing product" → Choose product → Select "🖼️ Manage Media"

# CLI mode (for automation/scripts)
bun run update:products -- --operation media:list --id product-id [--media-group cover]
bun run update:products -- --operation media:add --id product-id --media-type image --media-url "/path/image.png" --media-title "Screenshot" --media-altText "App screenshot" --media-group cover
bun run update:products -- --operation media:edit --id product-id --media-id "media-123" --media-title "Updated title"
bun run update:products -- --operation media:remove --id product-id --media-id "media-123"
bun run update:products -- --operation media:reorder --id product-id --media-id "media-123" --media-order 5
```

**Media Item Structure** (13 fields):

- **Required**: id, type, url, title, altText, order, group
- **Optional**: description, caption, youtubeId, thumbnailUrl, width, height

**Media Types:**

- `image`: Static images (PNG, JPG, WebP, etc.)
- `video`: YouTube videos (click-to-play, no autoplay)

**Media Groups & Placement:**

- `cover`: Product card thumbnails - optimized for card display (16:9 aspect ratio recommended)
- `banner`: Hero section images/videos - top of product page, high visual impact
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
- Add 1-2 cover images, 1-2 banner images for best UX

**Product Card Display:**

Product cards automatically display the first image from the media array with priority: cover → main → secondary → bonus. Cover images are recommended for consistent card thumbnails.

**Open Graph Images:**

The first image from the media array (prioritized by group: cover → banner → main → secondary → bonus) is automatically used for og:image meta tags for social sharing. Cover images are recommended for social cards.

**Storage:**

Media is stored separately from product JSON files for better organization and cleaner git diffs:

- FAQs: `src/data/products/{product-id}-faq.json`
- Testimonials: `src/data/products/{product-id}-testimonials.json`
- Media: `src/data/products/{product-id}-media.json`

These files are automatically loaded during aggregation and attached to products.

**Media File Format:**

Media is stored as a JSON array sorted by group priority (cover → banner → main → secondary → bonus), then by order within each group.

Example `knowii-voice-ai-media.json`:

```json
[
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
```

## Managing Promotion Banner

Configuration in `src/data/promotion.json` (not gitignored).

**Behavior Modes:**

- ALWAYS: Always visible
- NEVER: Never shown
- PROMOTIONS: Shows during configured period

**Quick Commands:**

```bash
bun run update:promotion              # Interactive
bun run update:promotion -- --behavior PROMOTIONS --text "..." --link "..." --start "2026-01-01" --duration 30
bun run validate:promotion
```

**Fields**: bannerBehavior, promotionStart/End (ISO 8601 UTC), promoText, promoLinkText, promoLink, discountCode

## Managing Redirects

Configuration in `src/data/redirects.json` (not gitignored). Enables automated client-side redirects for GitHub Pages.

**Quick Commands:**

```bash
bun run update:redirects              # Interactive CLI
bun run update:redirects -- --operation list|add|remove
bun run validate:redirects            # Validate after changes
```

**Structure** (5 fields):

- `from`: Source path (must start with `/`)
- `to`: Destination URL or path (internal or external)
- `type`: `PERMANENT` (301) or `TEMPORARY` (302, default)
- `description`: Optional documentation string
- `includeInSitemap`: Boolean (default: false)

**Redirect Types:**

- **PERMANENT (301)**: For moved content, search engines transfer ranking
- **TEMPORARY (302)**: More flexible, no aggressive caching (default)

**Build-Time Integration:**

Redirects generate static HTML pages at build time via `generate-redirect-pages.ts`:

- Triple-layer strategy: static HTML + meta refresh + JavaScript
- Works without JavaScript (meta refresh fallback)
- SEO-friendly (`noindex`, canonical links)
- GitHub Pages compatible (client-side only)

**React Router Integration:**

Redirects also integrate with React Router for client-side navigation via `RedirectPage` component.

**Validation:**

- Prevents duplicate source paths
- Detects redirect loops (A → B → A)
- Validates path format (must start with `/`)
- Runs automatically in `validate:all` and CI

**GitHub Pages Compatibility:**

All redirects are client-side (no server config needed). Static HTML pages are generated in `dist/[path]/index.html` during build.

## Managing Tags

96 tags in `src/data/tags.json` (object/map structure). Used for detailed product metadata.

**Quick Commands:**

```bash
bun run update:tags                   # Interactive
bun run update:tags -- --operation list|add|modify|remove|remove-unused [options]
bun run validate:tags
```

**Structure**: id, name, description, icon, color (#RRGGBB), featured, priority
**Priority**: Featured 1-8, Non-featured 21+
**Critical**: Sync `TagIdSchema` enum in schema after add/remove operations

## Managing Categories

23 categories in `src/data/categories.json` (array structure). Used for broad product organization.

**Quick Commands:**

```bash
bun run update:categories             # Interactive
bun run update:categories -- --operation list|add|modify|remove|remove-unused [options]
bun run validate:categories
```

**Structure**: id, name, description, icon, color, featured, priority
**Priority**: Featured 1-7, Non-featured 8-23
**Usage**: Every product has one `mainCategory` (required) and 0-N `secondaryCategories` (optional, with `distant` flag)
**Removal**: CANNOT remove if used as mainCategory; CAN remove (with --force) if only in secondaryCategories
**Critical**: Sync `CategoryIdSchema` enum in schema after add/remove operations

## Managing FAQs and Testimonials

Product-specific files: `{product-id}-faq.json` and `{product-id}-testimonials.json`. Auto-loaded during product aggregation.

**Quick Commands:**

```bash
# Interactive mode (recommended)
bun run update:products
# Select "Edit existing product" → Choose product → Select "📝💬 Manage Content"

# CLI mode - FAQs
bun run update:products -- --operation faq:list --id product-id
bun run update:products -- --operation faq:add --id product-id --faq-question "How does it work?" --faq-answer "It works great!" [--faq-order 0]
bun run update:products -- --operation faq:edit --id product-id --faq-id "faq-123" --faq-question "Updated question"
bun run update:products -- --operation faq:remove --id product-id --faq-id "faq-123"

# CLI mode - Testimonials
bun run update:products -- --operation testimonial:list --id product-id
bun run update:products -- --operation testimonial:add --id product-id --testimonial-author "John Doe" --testimonial-quote "Amazing product!" --testimonial-rating 5 [--testimonial-featured true]
bun run update:products -- --operation testimonial:edit --id product-id --testimonial-id "test-123" --testimonial-quote "Updated quote"
bun run update:products -- --operation testimonial:remove --id product-id --testimonial-id "test-123"
```

**FAQ Fields**: id, question, answer, order
**Testimonial Fields**: id, author, rating (1-5), quote, featured, role, company, avatarUrl, twitterHandle, twitterUrl

CLI provides: list, add, edit, remove, auto-sorting, schema validation.

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
bun run release                       # Deploy to GitHub Pages
```

## Deployment

Auto-deploy to GitHub Pages on tag push. Run `bun run release` and follow prompts. CHANGELOG.md is auto-generated from conventional commits.

## Accessibility

Keyboard navigation, ARIA labels, focus management, command palette shortcuts, semantic HTML.

## Best Practices

1. Write tests first (mandatory)
2. Run `bun run ci:local` before committing
3. Keep descriptions concise (1-2 sentences)
4. Validate data after edits (`bun run validate:all`)
5. Use conventional commits
6. Don't edit CHANGELOG.md (auto-generated)
7. **Backwards Compatibility**: When there is a question of backwards compatibility (e.g., renaming routes, changing URLs, renaming fields), ALWAYS ASK the user whether they want to maintain backwards compatibility or if breaking changes are acceptable. Do not assume either way.
8. **TypeScript Types**: NEVER use `any` type unless absolutely unavoidable. Always use proper TypeScript types such as `React.ComponentPropsWithoutRef<'element'>`, `React.ReactNode`, specific interface types, or generic constraints. The `any` type bypasses type safety and should be avoided.
9. **No Re-exports for Backwards Compatibility**: NEVER re-export types, interfaces, schemas, or functions from one module just for backwards compatibility. Always import from the original source where they are defined. Update all import statements throughout the codebase to point to the correct source. This keeps the codebase clean and makes dependencies explicit.

**Pre-Commit Checklist:**

```bash
bun run ci:local  # Runs: tests, lint, tsc, validate:all, build, format
```

## Claude Code Skills

Dedicated skills available in `.claude/skills/` for products, promotion, tags, categories. Mention keywords to invoke (e.g., "product", "tags", "validate categories").
