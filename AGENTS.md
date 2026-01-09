# AGENTS.md - Store Website Maintenance Guide

This document provides instructions for AI agents and developers on how to maintain and extend this store website.

## Project Overview

This is a static website built with:

- **React 19+** with TypeScript
- **Vite** for building and development
- **Tailwind CSS v4** for styling
- **React Router** for client-side routing (HashRouter for GitHub Pages compatibility)
- **React Icons** for iconography

The website is the store of dSebastien:

- Showcasing products, tools, courses, etc with the sales copy
- Providing easy ways to explore those
- Category and tag filtering
- Command palette (press `/` or `Ctrl+K`)
- Fully responsive design
- ...

## Project Structure

TODO document

## Product Display

**IMPORTANT**: Always use the `ProductCardEcommerce` component (`/src/components/products/product-card-ecommerce.tsx`) when displaying products in grids or lists, unless explicitly instructed otherwise.

## Icons

Tools can have custom icons specified via the `icon` field. The icon can be:

1. **React-icon name** - A component name from `react-icons` library (e.g., `"FaCalendarAlt"`, `"SiObsidian"`)
2. **URL** - An absolute URL or path to an image (e.g., `"https://example.com/icon.svg"` or `"/assets/images/icon.png"`)

### Available React Icons

**Font Awesome (Fa\*):**

- `FaCalendarAlt` - Calendar
- `FaMicrophone` - Microphone
- `FaGhost` - Ghost
- `FaYoutube` - YouTube
- `FaTerminal` - Terminal/CLI
- `FaLightbulb` - Lightbulb/Ideas
- `FaTools` - Tools
- `FaRobot` - Robot/AI
- `FaCode` - Code
- `FaGlobe` - Globe/Web
- `FaWrench` - Wrench
- `FaVideo` - Video
- `FaGraduationCap` - Graduation Cap/Courses
- `FaBook` - Book
- `FaBookOpen` - Open Book/Library
- `FaDatabase` - Database
- `FaNewspaper` - Newspaper/Publications
- `FaUsers` - Users/Community
- `FaFileAlt` - File/Document
- `FaBrain` - Brain/Knowledge
- `FaPen` - Pen/Writing
- `FaChalkboardTeacher` - Teacher/Coaching
- `FaBoxOpen` - Box/Bundle
- `FaCheckSquare` - Checkbox/Checklist
- `FaReddit` - Reddit

**Simple Icons (Si\*):**

- `SiObsidian` - Obsidian logo
- `SiAngular` - Angular logo
- `SiNotion` - Notion logo
- `SiTrello` - Trello logo

To add more icons, import them in `/src/components/tools/tool-icon.tsx` and add them to the `iconMap` object.

### Fallback Behavior

If no `icon` is specified or the icon name is not found, the component falls back to category-based emojis.

## Meta Tags and Open Graph Images

### Open Graph Image Requirements

All pages must properly set their Open Graph (og:image) meta tags for social media sharing:

1. **Generic Pages** (categories, tags, help, etc.) - Use the default social card:
    - Set `og:image` to: `https://store.dsebastien.net/assets/images/social-card.png`
    - This applies to: `/categories`, `/tags`, `/help`, and individual category/tag pages

2. **Product Pages** - Use product-specific images when available:
    - If product has `coverImage`: Use `https://store.dsebastien.net{product.coverImage}`
    - Otherwise: Fall back to default `social-card.png`

3. **Home Page** - Uses the default social card set in `index.html`

### Implementation Pattern

When creating or updating page components, always include a `useEffect` hook that sets meta tags:

```typescript
useEffect(() => {
    // Set document title
    document.title = 'Page Title - Knowledge Forge'

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
        metaDescription.setAttribute('content', 'Page description')
    }

    // Set og:image (REQUIRED)
    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) {
        ogImage.setAttribute(
            'content',
            'https://store.dsebastien.net/assets/images/social-card.png'
        )
    }

    // Update other OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
        ogTitle.setAttribute('content', 'Page Title - Knowledge Forge')
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
        ogDescription.setAttribute('content', 'Page description')
    }

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
        ogUrl.setAttribute('content', 'https://store.dsebastien.net/page-path')
    }
}, [])
```

### Why This Matters

- Ensures consistent branding across social media shares
- Prevents broken or missing images when pages are shared
- Improves click-through rates from social media
- Product pages get custom images to showcase their specific content

## Styling

The website uses Tailwind CSS v4 with custom theme variables defined in `/src/styles/index.css`:

```css
@theme {
    --color-primary: #ffffff; /* Main text color */
    --color-secondary: #e5007d; /* Accent color (pink) */
    --color-secondary-text: #ff1493; /* Hover text color */
    --color-background: #37404c; /* Background color */
}
```

## Responsive Design

**CRITICAL RULE**: Always ensure responsive UI works seamlessly across all device sizes - mobile, tablets, desktops, and large/ultra-wide desktops.

### Breakpoint Strategy

The website defines custom breakpoints in `/src/styles/index.css`:

```css
--breakpoint-sm: 600px;
--breakpoint-md: 960px;
--breakpoint-lg: 1280px;
--breakpoint-xg: 1600px;
--breakpoint-xl: 1920px;
--breakpoint-2xl: 2440px;
```

### Layout Guidelines

1. **Container Widths**
    - Use the `Section` component (`/src/components/ui/section.tsx`) for consistent page sections
    - Default max-width: `max-w-[1800px]` with `2xl:max-w-[2200px]` for ultra-wide screens
    - For full-width sections, use `fullWidth={true}` prop

2. **Grid Layouts**
    - **Product Grids**: Use progressive columns to maximize screen space
        ```tsx
        // Standard pattern for product grids
        className = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
        ```
    - **Category Grids**: Can support even more columns
        ```tsx
        // Pattern for category/tag grids
        className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
        ```
    - **Menu/Navigation**: Hamburger menu overlay should adapt
        ```tsx
        // Pattern for navigation menus
        className =
            'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
        ```

3. **Avoid Restrictive Constraints**
    - Don't use small `max-w-*` values (like `max-w-4xl` or `max-w-7xl`) on grid containers
    - Let grids expand to use available Section width: use `w-full` instead
    - Reserve smaller max-widths (`max-w-[1400px]`, `max-w-[1600px]`) for hero sections and centered text content

4. **Testing Requirements**
    - Test at mobile (320px-600px)
    - Test at tablet (600px-960px)
    - Test at desktop (960px-1920px)
    - Test at ultra-wide (1920px-2440px+)
    - Ensure grids don't have excessive whitespace on large screens
    - Ensure content remains readable and doesn't overflow on small screens

### Component-Specific Guidelines

- **Header**: Should span up to `max-w-[1800px] 2xl:max-w-[2200px]` to match Section widths
- **Product Cards**: Should maintain consistent aspect ratios and padding across all breakpoints
- **Forms and Filters**: Should collapse into single column on mobile, expand on desktop

## Managing Products

Products are managed as individual JSON files in `/src/data/products/` directory. At build time, these files are automatically aggregated into `products.json` for optimal performance.

### Product File Structure

```
src/data/
├── products/                          # Source of truth
│   ├── obsidian-starter-kit.json    # Individual product files
│   ├── knowledge-worker-kit.json
│   └── ... (18 total products)
└── products.json                      # Generated (gitignored)
```

### Product Management Workflow

1. **Edit individual product file** - Modify `src/data/products/{product-id}.json`
2. **Aggregate products** - Run `npm run aggregate:products` (automatically runs before dev/build/validate)
3. **Validate changes** - Run `npm run validate:products`
4. **Fix errors** - Address any validation issues reported
5. **Repeat** until validation passes

### Adding a New Product

1. Create a new file in `src/data/products/` named `{product-id}.json`
2. Copy structure from an existing product file
3. Fill in all required fields
4. Run `npm run validate:products` to ensure correctness
5. Commit the new product file

### Claude Code Skill

A dedicated Claude Code skill is available at `.claude/skills/manage-products.md` that provides:

- Complete schema documentation for all product fields
- Validation workflow guidance
- Priority guidelines for product ordering
- Examples and common tasks

To use the skill in Claude Code, simply mention keywords like "product", "products.json", "add product", or "validate products" in your conversation.

### Product Schema

- **Schema Definition**: `src/schemas/product.schema.ts` (Zod schema - source of truth)
- **TypeScript Types**: `src/types/product.ts` (keep in sync with schema)
- **Validation Script**: `scripts/validate-products.ts`

The Zod schema validates:

- Required fields (id, name, pricing, marketing copy, features, etc.)
- Enum values (type, priceTier, categories, status)
- URL formats (gumroadUrl, videoUrl, etc.)
- Array constraints (minimum items, valid content)
- Data types and structure

### Adding a New Product

See the Claude Code skill documentation in `.claude/skills/manage-products.md` for detailed instructions, or simply invoke the skill when working with products.

## Managing Promotion Banner

The promotion banner at the top of the website is configured through a single JSON configuration file with automatic validation.

### Configuration File

**Location**: `src/data/promotion.json` (not gitignored)

### Banner Behavior Modes

The banner supports three behavior modes controlled by the `bannerBehavior` field:

1. **ALWAYS** - Banner is always visible regardless of dates
2. **NEVER** - Banner is never shown (useful for disabling)
3. **PROMOTIONS** - Banner shows only during the configured promotion period

### Configuration Structure

```json
{
  "bannerBehavior": "ALWAYS" | "NEVER" | "PROMOTIONS",
  "promotionStart": "ISO 8601 timestamp (optional)",
  "promotionEnd": "ISO 8601 timestamp (optional)",
  "promoText": "Main promotional text (required)",
  "promoLinkText": "Link text (optional)",
  "promoLink": "URL (required)",
  "discountCode": "Discount code (optional)"
}
```

### Example Configuration

```json
{
    "bannerBehavior": "PROMOTIONS",
    "promotionStart": "2026-01-01T00:00:00Z",
    "promotionEnd": "2026-01-31T23:59:59Z",
    "promoText": "🎉 New Year Sale! Get 20% off all courses and bundles",
    "promoLinkText": "Shop Now →",
    "promoLink": "https://store.dsebastien.net/",
    "discountCode": "NY2026"
}
```

### Promotion Management Workflow

**Quick Update (Recommended):**

Use the interactive CLI tool for easy configuration:

```bash
# Interactive mode (prompts for all fields)
npm run update:promotion

# CLI arguments mode (non-interactive)
npm run update:promotion -- --behavior PROMOTIONS --text "🎉 Sale!" --link "https://store.dsebastien.net/" --start "2026-02-01" --duration 30
```

The update script:

- Shows current configuration
- Prompts for each field (interactive mode)
- Automatically calculates end date from start + duration (days)
- Uses date-fns for date calculations
- Validates configuration before saving
- Formats dates as ISO 8601 with UTC timezone

**Manual Workflow:**

1. **Edit promotion config** - Modify `src/data/promotion.json`
2. **Validate changes** - Run `npm run validate:promotion`
3. **Fix errors** - Address any validation issues reported
4. **Test locally** - Run `npm run dev` to see the banner
5. **Commit changes** - When validation passes

### Promotion Schema

- **Schema Definition**: `src/schemas/promotion.schema.ts` (Zod schema - source of truth)
- **TypeScript Types**: `src/types/promotion.ts` (keep in sync with schema)
- **Update Script**: `scripts/update-promotion.ts` (interactive CLI tool)
- **Validation Script**: `scripts/validate-promotion.ts`
- **Banner Component**: `src/components/layout/promotion-banner.tsx`

The Zod schema validates:

- Valid banner behavior enum (ALWAYS, NEVER, PROMOTIONS)
- Required dates when behavior is PROMOTIONS
- ISO 8601 timestamp format for dates
- Valid URL for promoLink
- End date must be after start date
- Non-empty promoText

### Claude Code Skill

A dedicated Claude Code skill is available at `.claude/skills/manage-promotion.md` that provides:

- Complete schema documentation for all promotion fields
- Validation workflow guidance
- Banner behavior logic explanation
- Configuration examples for each mode
- Common tasks and error handling

To use the skill in Claude Code, simply mention keywords like "promotion", "banner", "promo", or "validate promotion" in your conversation.

### Important Notes

- Dates must be in ISO 8601 format with UTC timezone (use "Z" suffix)
- Banner automatically hides when promotion period ends
- File is NOT gitignored (unlike aggregated products.json)
- Promotion history is tracked via git commits

## Managing Tags

Tags are used across all products for detailed metadata and filtering. They are stored in `src/data/tags.json` as an object/map structure with 96 tags.

### Tag Data Location

- **Configuration File**: `src/data/tags.json` (96 tags, object/map structure)
- **Zod Schema**: `src/schemas/tag.schema.ts` (source of truth)
- **TypeScript Types**: `src/types/tag.ts`
- **Update CLI**: `scripts/update-tags.ts` (interactive management tool)
- **Validation Script**: `scripts/validate-tags.ts`

### Tag Management Workflow

**Quick Update (Recommended):**

Use the interactive CLI tool for easy tag management:

```bash
# Interactive mode (prompts for operation and details)
npm run update:tags

# CLI arguments mode - list all tags
npm run update:tags -- --operation list

# Add tag (auto-generated ID from name)
npm run update:tags -- --operation add --name "Machine Learning" --description "ML and AI training" --featured true --priority 6

# Modify tag
npm run update:tags -- --operation modify --id "ai" --description "Updated description" --priority 3

# Remove tag (will check product usage)
npm run update:tags -- --operation remove --id "deprecated-tag"

# Remove all unused tags (tags not referenced by any product)
npm run update:tags -- --operation remove-unused [--force]
```

The update script:

- Supports five operations: list, add, modify, remove, remove-unused
- Auto-generates kebab-case IDs from tag names
- Validates against Zod schema before saving
- Checks product usage before removal
- Provides both interactive and CLI argument modes

**Manual Workflow:**

1. **Edit tags.json** - Modify `src/data/tags.json`
2. **Update schema enum** - Add/remove tag ID in `src/schemas/tag.schema.ts` `TagIdSchema` enum
3. **Validate changes** - Run `npm run validate:tags`
4. **Fix errors** - Address any validation issues reported

### Tag Structure

```json
{
    "tag-id": {
        "id": "tag-id",
        "name": "Tag Name",
        "description": "Tag description",
        "icon": "FaRobot",
        "color": "#FF6B6B",
        "featured": true,
        "priority": 5
    }
}
```

### Priority Guidelines

- **Featured tags**: 1-8 (lower = higher priority)
- **Non-featured tags**: 21+ (flexible ordering)

### Tag Usage in Products

Tags are referenced in products via:

```json
{
    "tags": ["obsidian", "pkm", "templates", "productivity"]
}
```

- Each product must have at least 1 tag
- All tag IDs must exist in `tags.json` and the `TagIdSchema` enum

### Claude Code Skill

A dedicated Claude Code skill is available at `.claude/skills/manage-tags.md` that provides:

- Complete schema documentation
- Workflow guidance for all operations
- CLI command examples
- Error handling and validation tips

To use the skill, mention keywords like "tag", "tags", "add tag", "validate tags", or "tags.json" in your conversation.

### Important Notes

- **Schema sync is critical**: After add/remove operations, manually update `TagIdSchema` enum in `src/schemas/tag.schema.ts`
- ID cannot be modified (must delete and recreate to change ID)
- Tags used in products require `--force` flag to remove
- Color must be in hex format `#RRGGBB`

## Managing Categories

Categories are used for broad product organization. They are stored in `src/data/categories.json` as an array with 23 categories.

### Category Data Location

- **Configuration File**: `src/data/categories.json` (23 categories, array structure)
- **Zod Schema**: `src/schemas/category.schema.ts` (source of truth)
- **TypeScript Types**: `src/types/category.ts`
- **Update CLI**: `scripts/update-categories.ts` (interactive management tool)
- **Validation Script**: `scripts/validate-categories.ts`

### Category Management Workflow

**Quick Update (Recommended):**

Use the interactive CLI tool for easy category management:

```bash
# Interactive mode (prompts for operation and details)
npm run update:categories

# CLI arguments mode - list all categories
npm run update:categories -- --operation list

# Add category (auto-generated ID from name)
npm run update:categories -- --operation add --name "New Category" --description "Category description" --featured true --priority 5

# Modify category
npm run update:categories -- --operation modify --id "coaching" --description "Updated description" --priority 2

# Remove category (strict checks for mainCategory usage)
npm run update:categories -- --operation remove --id "old-category"

# Remove all unused categories (categories not referenced by any product)
npm run update:categories -- --operation remove-unused [--force]
```

The update script:

- Supports five operations: list, add, modify, remove, remove-unused
- Auto-generates kebab-case IDs from category names
- Validates against Zod schema before saving
- Checks product usage (mainCategory vs secondaryCategories)
- **Cannot remove categories used as mainCategory** (even with `--force`)
- Can remove (with `--force`) categories used only in secondaryCategories

**Manual Workflow:**

1. **Edit categories.json** - Modify `src/data/categories.json`
2. **Update schema enum** - Add/remove category ID in `src/schemas/category.schema.ts` `CategoryIdSchema` enum
3. **Validate changes** - Run `npm run validate:categories`
4. **Fix errors** - Address any validation issues reported

### Category Structure

```json
{
    "id": "category-id",
    "name": "Category Name",
    "description": "Category description",
    "icon": "FaTools",
    "color": "#4ECDC4",
    "featured": true,
    "priority": 5
}
```

### Priority Guidelines

- **Featured categories**: 1-7 (lower = higher priority)
- **Non-featured categories**: 8-23 (flexible ordering)

### Category Usage in Products

Categories are used in two ways:

**Main Category** (required, single):

```json
{
    "mainCategory": "kits-and-templates"
}
```

**Secondary Categories** (optional, array):

```json
{
    "secondaryCategories": [
        { "id": "obsidian", "distant": false },
        { "id": "knowledge-management", "distant": true }
    ]
}
```

- Every product MUST have exactly one `mainCategory`
- Products can have 0-N `secondaryCategories`
- The `distant` flag indicates relationship strength (false = direct, true = indirect)

### Removal Restrictions

- ❌ **CANNOT remove** if used as `mainCategory` (blocking, even with `--force`)
- ⚠️ **CAN remove** if only used in `secondaryCategories` (with `--force` flag)
- ✅ **CAN remove** if not used in any products (safe)

### Claude Code Skill

A dedicated Claude Code skill is available at `.claude/skills/manage-categories.md` that provides:

- Complete schema documentation
- Workflow guidance for all operations
- Removal restriction explanations
- CLI command examples
- Error handling and validation tips

To use the skill, mention keywords like "category", "categories", "add category", "validate categories", or "categories.json" in your conversation.

### Important Notes

- **Schema sync is critical**: After add/remove operations, manually update `CategoryIdSchema` enum in `src/schemas/category.schema.ts`
- ID cannot be modified (must delete and recreate to change ID)
- **Cannot remove categories used as mainCategory** (data integrity protection)
- Color can be any CSS color but hex format `#RRGGBB` is recommended

## Managing Products

Products are managed as individual JSON files with comprehensive metadata (~50 fields). An interactive CLI tool simplifies adding and editing products, especially for taxonomy management (categories and tags) with keyboard-navigable multi-select interfaces.

### Product Data Location

- **Individual Product Files**: `src/data/products/{product-id}.json` (source of truth, 18+ products)
- **Aggregated File**: `src/data/products.json` (generated at build time, gitignored)
- **Zod Schema**: `src/schemas/product.schema.ts` (source of truth)
- **TypeScript Types**: `src/types/product.ts`
- **Update CLI**: `scripts/update-products.ts` (interactive management tool)
- **Validation Script**: `scripts/validate-products.ts`
- **Aggregation Script**: `scripts/aggregate-products.ts`

### Product Management Workflow

**Quick Update (Recommended):**

Use the interactive CLI tool for easy product management:

```bash
# Interactive mode (prompts for operation)
npm run update:products

# List products with filters
npm run update:products -- --operation list
npm run update:products -- --operation list --featured
npm run update:products -- --operation list --category guides
npm run update:products -- --operation list --tag ai

# Add product (guided prompts with keyboard-navigable selection)
npm run update:products -- --operation add

# Add product (CLI arguments, minimal required fields)
npm run update:products -- --operation add \
    --name "Product Name" \
    --tagline "One-line description" \
    --price 49.99 \
    --priceTier standard \
    --permalink abc123 \
    --gumroadUrl "https://store.dsebastien.net/l/abc123" \
    --mainCategory guides \
    --tags "tag1,tag2,tag3" \
    --problem "Problem description" \
    --agitate "Agitation" \
    --solution "Solution"

# Edit product (interactive with keyboard-navigable category/tag selection)
npm run update:products -- --operation edit --id product-id

# Edit product (CLI arguments)
npm run update:products -- --operation edit \
    --id product-id \
    --name "New Name" \
    --price 39.99 \
    --priority 95

# Remove product (checks cross-references)
npm run update:products -- --operation remove --id product-id
```

The update script:

- Provides keyboard-navigable multi-select for categories and tags
- Supports four operations: list, add, edit, remove
- Uses inquirer for professional CLI interfaces
- Validates against Zod schema before saving
- Checks product cross-references before removal
- Provides both interactive and CLI argument modes

**Manual Workflow:**

1. **Edit/Create product file** - Modify or create `src/data/products/{product-id}.json`
2. **Validate changes** - Run `npm run validate:products` (automatically aggregates first)
3. **Fix errors** - Address any validation issues reported
4. **Repeat** until validation passes

### Product Schema

- **Schema Definition**: `src/schemas/product.schema.ts` (Zod schema - source of truth, ~50 fields)
- **TypeScript Types**: `src/types/product.ts` (keep in sync with schema)
- **Update Script**: `scripts/update-products.ts` (interactive CLI tool with inquirer)
- **Validation Script**: `scripts/validate-products.ts`
- **Aggregation Script**: `scripts/aggregate-products.ts`

The Zod schema validates:

- Required fields (id, name, pricing, taxonomy, marketing copy)
- Enum values (type, priceTier, mainCategory, status)
- URL formats (gumroadUrl, videoUrl, etc.)
- Array constraints (minimum items, valid content)
- Data types and structure

### Product Structure

Products contain approximately 50 fields organized into:

- **Identity** (5): id, permalink, name, tagline, secondaryTagline
- **Pricing** (6): price, priceDisplay, priceTier, gumroadUrl, variants
- **Taxonomy** (3): mainCategory, secondaryCategories, tags
- **Marketing Copy** (9): problem, problemPoints, agitate, agitatePoints, solution, solutionPoints
- **Content** (8): description, features, benefits, included, testimonialIds, faqIds, targetAudience, perfectFor, notForYou
- **Media** (5): coverImage, screenshots, videoUrl, demoUrl
- **Meta/Status** (8): featured, mostValue, bestseller, status, priority, trustBadges, guarantees, crossSellIds
- **Links** (2): landingPageUrl, dsebastienUrl
- **SEO** (3): metaTitle, metaDescription, keywords

### When to Use CLI vs. Direct Editing

**Use CLI for:**

- Adding new products (creates structure with validation)
- Editing taxonomy (categories/tags with keyboard-navigable multi-select)
- Changing pricing, status, or priority
- Quick updates to common fields
- Listing and filtering products

**Use Direct Editing for:**

- Complex marketing copy (problemPoints, agitatePoints, solutionPoints arrays)
- Adding detailed content (features, benefits, included)
- Media management (coverImage, screenshots, videoUrl)
- Cross-references (testimonialIds, faqIds, crossSellIds)
- SEO metadata (metaTitle, metaDescription, keywords)
- Advanced fields (variants, statsProof, guarantees)

### Priority Guidelines

- **100**: Featured flagship products
- **90-95**: Featured products and bundles
- **80-85**: Premium kits and courses
- **70-79**: Standard kits, courses, and guides
- **60-69**: Workshops and tools
- **50-59**: Coaching and standard products
- **40-49**: Free resources and tools
- **30-39**: Community (free tier)
- **20-29**: Archived products

### Claude Code Skill

A dedicated Claude Code skill is available at `.claude/skills/manage-products.md` that provides:

- Complete schema documentation for all ~50 product fields
- Workflow guidance for all operations
- CLI command examples for interactive and argument modes
- When to use CLI vs. direct editing guidelines
- Validation workflow and error handling

To use the skill, mention keywords like "product", "products", "add product", "edit product", "validate products", or "update products" in your conversation.

### Important Notes

- Individual product files are source of truth
- products.json is auto-generated (don't edit directly)
- Always validate after changes
- Use kebab-case for product IDs
- CLI handles common operations, direct editing needed for complex fields (~50 total fields)
- Existing validation scripts remain unchanged
- File is NOT gitignored (unlike aggregated products.json which is generated)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (automatically aggregates products)
npm run dev

# Build for production (automatically aggregates products)
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run tsc

# Aggregate individual product files into products.json
npm run aggregate:products

# Validate products (automatically aggregates first)
npm run validate:products

# Update products (interactive with keyboard-navigable multi-select)
npm run update:products

# Update products (CLI arguments)
npm run update:products -- --operation <list|add|edit|remove> [options]

# Update promotion banner configuration (interactive)
npm run update:promotion

# Update promotion banner configuration (CLI arguments)
npm run update:promotion -- --behavior <ALWAYS|NEVER|PROMOTIONS> --text "..." --link "..." [options]

# Validate promotion banner configuration
npm run validate:promotion

# Update tags (interactive)
npm run update:tags

# Update tags (CLI arguments)
npm run update:tags -- --operation <list|add|modify|remove> [options]

# Validate tags
npm run validate:tags

# Update categories (interactive)
npm run update:categories

# Update categories (CLI arguments)
npm run update:categories -- --operation <list|add|modify|remove> [options]

# Validate categories
npm run validate:categories

# Validate all configurations
npm run validate:all
```

## Deployment

The website is automatically deployed to GitHub Pages when a new tag is pushed:

```bash
# Create and push a new release tag
npm run release
# Follow the prompts to enter a tag name (e.g., v1.0.0)
```

The deployment workflow is defined in `.github/workflows/deploy.yml`.

### Automated Changelog

The `CHANGELOG.md` file is **automatically generated** by the release script and does not need to be manually maintained. The changelog is generated from conventional commits using `npm run release:changelog`, which is called during the release process.

## Key Components

### ToolCard (`/src/components/tools/tool-card.tsx`)

Displays individual tool cards in both grid and list view modes.

### ToolsFilter (`/src/components/tools/tools-filter.tsx`)

Contains the search box, category tabs, and advanced filter options.

### CommandPalette (`/src/components/tools/command-palette.tsx`)

Global search/command palette accessible via `/` or `Ctrl+K`.

### ToolDetailModal (`/src/components/tools/tool-detail-modal.tsx`)

Modal showing detailed tool information when a card is clicked.

## Accessibility Features

- Full keyboard navigation support
- ARIA labels on interactive elements
- Focus management in modals
- Command palette with keyboard shortcuts
- Semantic HTML structure

## Best Practices for Contributions

1. **Keep descriptions concise** - 1-2 sentences max
2. **Use consistent labels** - Check existing labels before creating new ones
3. **Add meaningful technologies** - Only list primary/notable technologies
4. **Update status promptly** - Keep tool statuses accurate
5. **Validate products** - Always run `npm run validate:products` after editing products.json
6. **Test locally** - Run `npm run build` before committing
7. **Follow commit conventions** - Use conventional commits (feat, fix, docs, etc.)
8. **Don't edit CHANGELOG.md** - It's automatically generated during releases

## Troubleshooting

### Build fails with type errors

Run `npm run tsc` to see detailed TypeScript errors.

### Styles not updating

Tailwind CSS v4 uses JIT compilation. Try restarting the dev server.

### New tool not appearing

Verify the JSON is valid and the tool has all required fields. Check browser console for errors.

### Command palette not opening

Ensure you're not focused on an input field when pressing `/`.
