# AGENTS.md - Store Website Maintenance Guide

This document provides instructions for AI agents and developers on how to maintain and extend this store website.

## Project Overview

Static website built with React 19+, TypeScript, Vite, Tailwind CSS v4, React Router (HashRouter), and React Icons. Features include product showcase, category/tag filtering, command palette (`/` or `Ctrl+K`), and fully responsive design.

## Product Display

**IMPORTANT**: Always use `ProductCardEcommerce` component (`/src/components/products/product-card-ecommerce.tsx`) when displaying products.

## Icons

Icons can be React-icon names (e.g., `"FaCalendarAlt"`, `"SiObsidian"`) or URLs. Available icons include FontAwesome (Fa*) and Simple Icons (Si*). Add more in `/src/components/tools/tool-icon.tsx`. Falls back to category-based emojis if not found.

## Meta Tags and Open Graph Images

All pages must set `og:image` meta tags:

- **Generic pages**: `https://store.dsebastien.net/assets/images/social-card.png`
- **Product pages**: Use `product.coverImage` if available, else fall back to default
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

1. Use CLI tool (`npm run update:<entity>`) or edit JSON directly
2. Validate (`npm run validate:<entity>`)
3. Fix errors if any
4. Commit changes

## Managing Products

Products are ~50 field JSON files in `/src/data/products/{product-id}.json`. Auto-aggregated into `products.json` (gitignored) at build time.

**Quick Commands:**

```bash
npm run update:products               # Interactive CLI
npm run update:products -- --operation list [--featured|--category X|--tag Y]
npm run update:products -- --operation add|edit|remove [options]
npm run validate:products             # Validate after changes
```

**Product Structure** (50 fields):

- Identity (5): id, permalink, name, tagline, secondaryTagline
- Pricing (6): price, priceDisplay, priceTier, gumroadUrl, variants
- Taxonomy (3): mainCategory, secondaryCategories, tags
- Marketing (9): problem, problemPoints, agitate, agitatePoints, solution, solutionPoints
- Content (8): description, features, benefits, included, testimonialIds, faqIds, targetAudience, perfectFor, notForYou
- Media (5): coverImage, screenshots, videoUrl, demoUrl
- Meta/Status (8): featured, bestValue, bestseller, status, priority, trustBadges, guarantees, crossSellIds
- Links (2): landingPageUrl, dsebastienUrl
- SEO (3): metaTitle, metaDescription, keywords

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

## Managing Promotion Banner

Configuration in `src/data/promotion.json` (not gitignored).

**Behavior Modes:**

- ALWAYS: Always visible
- NEVER: Never shown
- PROMOTIONS: Shows during configured period

**Quick Commands:**

```bash
npm run update:promotion              # Interactive
npm run update:promotion -- --behavior PROMOTIONS --text "..." --link "..." --start "2026-01-01" --duration 30
npm run validate:promotion
```

**Fields**: bannerBehavior, promotionStart/End (ISO 8601 UTC), promoText, promoLinkText, promoLink, discountCode

## Managing Tags

96 tags in `src/data/tags.json` (object/map structure). Used for detailed product metadata.

**Quick Commands:**

```bash
npm run update:tags                   # Interactive
npm run update:tags -- --operation list|add|modify|remove|remove-unused [options]
npm run validate:tags
```

**Structure**: id, name, description, icon, color (#RRGGBB), featured, priority
**Priority**: Featured 1-8, Non-featured 21+
**Critical**: Sync `TagIdSchema` enum in schema after add/remove operations

## Managing Categories

23 categories in `src/data/categories.json` (array structure). Used for broad product organization.

**Quick Commands:**

```bash
npm run update:categories             # Interactive
npm run update:categories -- --operation list|add|modify|remove|remove-unused [options]
npm run validate:categories
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
npm run manage:product-content        # Interactive (via Store CLI)
npm run manage:product-content -- --product=<id> --type=faqs|testimonials
```

**FAQ Fields**: id, question, answer, order
**Testimonial Fields**: id, author, rating (1-5), quote, featured, role, company, avatarUrl, twitterHandle, twitterUrl

CLI provides: list, add, edit, delete, auto-sorting, schema validation.

## Testing Requirements

**CRITICAL**: Comprehensive testing mandatory for all code. Tests must be co-located with source files.

**Framework**: Vitest, React Testing Library, Jest DOM

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
npm test                              # Watch mode
npm run test:run                      # Run once
npm run test:ui                       # UI mode
npm run test:coverage                 # Coverage report
```

**CI/CD**: All tests must pass before merge/deploy/release.

**Skip tests only for**: Type definitions (`.d.ts`), config files (`*.config.ts`), simple re-exports.

## Development Commands

```bash
npm run store                         # Store CLI (all management tools)
npm run dev                           # Dev server (auto-aggregates)
npm run build                         # Production build
npm run lint / format / tsc           # Code quality
npm test / test:run / test:coverage   # Testing
npm run validate:all                  # Validate all data
npm run ci:local                      # Full CI checks locally
npm run release                       # Deploy to GitHub Pages
```

## Deployment

Auto-deploy to GitHub Pages on tag push. Run `npm run release` and follow prompts. CHANGELOG.md is auto-generated from conventional commits.

## Key Components

- `ToolCard`: Individual tool cards (grid/list views)
- `ToolsFilter`: Search, category tabs, filters
- `CommandPalette`: Global search (`/` or `Ctrl+K`)
- `ToolDetailModal`: Detailed tool information

## Accessibility

Keyboard navigation, ARIA labels, focus management, command palette shortcuts, semantic HTML.

## Best Practices

1. Write tests first (mandatory)
2. Run `npm run ci:local` before committing
3. Keep descriptions concise (1-2 sentences)
4. Validate data after edits (`npm run validate:all`)
5. Use conventional commits
6. Don't edit CHANGELOG.md (auto-generated)
7. **Backwards Compatibility**: When there is a question of backwards compatibility (e.g., renaming routes, changing URLs, renaming fields), ALWAYS ASK the user whether they want to maintain backwards compatibility or if breaking changes are acceptable. Do not assume either way.
8. **TypeScript Types**: NEVER use `any` type unless absolutely unavoidable. Always use proper TypeScript types such as `React.ComponentPropsWithoutRef<'element'>`, `React.ReactNode`, specific interface types, or generic constraints. The `any` type bypasses type safety and should be avoided.

**Pre-Commit Checklist:**

```bash
npm run ci:local  # Runs: tests, lint, tsc, validate:all, build, format
```

## Claude Code Skills

Dedicated skills available in `.claude/skills/` for products, promotion, tags, categories. Mention keywords to invoke (e.g., "product", "tags", "validate categories").
