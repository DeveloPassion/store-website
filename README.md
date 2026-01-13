# Store Website - Developer Guide

This repository contains the source code for Knowledge Forge - Digital products store by Sébastien Dubois, built with React 19, Bun, Tailwind CSS v4, and TypeScript.

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Run all tests
bun run test:run

# Run all validation checks
bun run validate:all
```

## 🛍️ Store Management CLI

The **Store CLI** is an interactive menu system that provides easy access to all store management tools.

### Launch the Store CLI

```bash
bun run store
```

This opens an interactive menu with the following options:

### 📦 Product Management

- **Manage Products** - Add, edit, list, or remove products with keyboard-navigable multi-select for categories and tags

### 🏷️ Taxonomy Management

- **Manage Categories** - Add, modify, list, or remove product categories
- **Manage Tags** - Add, modify, list, or remove product tags

### 🎉 Promotion Management

- **Update Promotion Banner** - Configure the promotion banner (behavior, dates, text, link, discount code)

### ✅ Validation & Quality

- **Validate All** - Run all validation checks (categories, tags, promotion, products, relationships)
- **Validate Products** - Validate product data against schema
- **Validate Categories** - Validate category data against schema
- **Validate Tags** - Validate tag data against schema
- **Validate Promotion** - Validate promotion banner configuration
- **Validate Relationships** - Validate cross-references between products, categories, and tags

## CLI Tools Reference

All CLI tools support both **interactive mode** (guided prompts) and **CLI arguments mode** (direct commands).

### Product Management

```bash
# Interactive mode
bun run update:products

# List products
bun run update:products -- --operation list [--featured] [--category guides] [--tag ai] [--format json|table|detailed]

# Add product (guided prompts with keyboard-navigable selection)
bun run update:products -- --operation add

# Add product (CLI arguments)
bun run update:products -- --operation add \
    --name "Product Name" \
    --tagline "One-line description" \
    --price 49.99 \
    --priceTier standard \
    --permalink abc123 \
    --gumroadUrl "https://developassion.gumroad.com/l/abc123" \
    --mainCategory guides \
    --tags "tag1,tag2,tag3" \
    --problem "Problem description" \
    --agitate "Agitation" \
    --solution "Solution"

# Edit product (interactive with keyboard-navigable category/tag selection)
bun run update:products -- --operation edit --id product-id

# Edit product (CLI arguments)
bun run update:products -- --operation edit \
    --id product-id \
    --name "New Name" \
    --price 39.99 \
    --priority 95

# Remove product (checks cross-references)
bun run update:products -- --operation remove --id product-id [--force]
```

**Script:** `scripts/update-products.ts`
**Data Files:** `src/data/products/*.json` (individual files)
**Aggregated:** `src/data/products.json` (generated, gitignored)
**Schema:** `src/schemas/product.schema.ts`

### Category Management

```bash
# Interactive mode
bun run update:categories

# List categories
bun run update:categories -- --operation list [--featured] [--format json|table]

# Add category (auto-generated ID from name)
bun run update:categories -- --operation add \
    --name "New Category" \
    --description "Category description" \
    --featured true \
    --priority 5

# Modify category
bun run update:categories -- --operation modify \
    --id "category-id" \
    --description "Updated description" \
    --priority 2

# Remove category (strict checks for mainCategory usage)
bun run update:categories -- --operation remove --id "category-id" [--force]

# Remove all unused categories
bun run update:categories -- --operation remove-unused [--force]
```

**Script:** `scripts/update-categories.ts`
**Data File:** `src/data/categories.json`
**Schema:** `src/schemas/category.schema.ts`

**Important:** Cannot remove categories used as `mainCategory` (even with `--force`)

### Tag Management

```bash
# Interactive mode
bun run update:tags

# List tags
bun run update:tags -- --operation list [--featured] [--format json|table]

# Add tag (auto-generated ID from name)
bun run update:tags -- --operation add \
    --name "Machine Learning" \
    --description "ML and AI training" \
    --featured true \
    --priority 6

# Modify tag
bun run update:tags -- --operation modify \
    --id "tag-id" \
    --description "Updated description" \
    --priority 3

# Remove tag (checks product usage)
bun run update:tags -- --operation remove --id "tag-id" [--force]

# Remove all unused tags
bun run update:tags -- --operation remove-unused [--force]
```

**Script:** `scripts/update-tags.ts`
**Data File:** `src/data/tags.json`
**Schema:** `src/schemas/tag.schema.ts`

### Promotion Banner Management

```bash
# Interactive mode (prompts for all fields)
bun run update:promotion

# CLI arguments mode (non-interactive)
bun run update:promotion -- \
    --behavior PROMOTIONS \
    --text "🎉 Sale!" \
    --link "https://store.dsebastien.net/" \
    --start "2026-02-01" \
    --duration 30 \
    --linkText "Shop Now →" \
    --discountCode "SAVE20"
```

**Banner Behavior Modes:**

- `ALWAYS` - Banner is always visible
- `NEVER` - Banner is never shown
- `PROMOTIONS` - Banner shows only during configured promotion period

**Script:** `scripts/update-promotion.ts`
**Data File:** `src/data/promotion.json`
**Schema:** `src/schemas/promotion.schema.ts`

### Validation Tools

```bash
# Validate all configurations
bun run validate:all

# Validate individual components
bun run validate:products       # Validates product data and schema
bun run validate:categories     # Validates category data and schema
bun run validate:tags          # Validates tag data and schema
bun run validate:promotion     # Validates promotion banner configuration
bun run validate:relationships # Validates cross-references between data
```

**Validation Scripts:**

- `scripts/validate-products.ts`
- `scripts/validate-categories.ts`
- `scripts/validate-tags.ts`
- `scripts/validate-promotion.ts`
- `scripts/validate-relationships.ts`

## Development Workflow

### Common Development Tasks

```bash
# Run linter
bun run lint

# Format code
bun run format

# Type check
bun run tsc

# Watch mode type checking
bun run tsc:watch   # or bun run tscw

# Run tests (watch mode)
bun test

# Run tests once
bun run test:run

# Run tests with UI
bun run test:ui

# Generate coverage report
bun run test:coverage

# Preview production build
bun run preview
```

### Product Data Workflow

1. **Edit individual product file** - `src/data/products/{product-id}.json`
2. **Aggregate products** - `bun run aggregate:products` (auto-runs before dev/build)
3. **Validate changes** - `bun run validate:products`
4. **Fix errors** - Address validation issues
5. **Commit** - When validation passes

### Pre-Commit Checks

Run all checks before committing:

```bash
bun run ci:local
```

This runs:

- Linting (`bun run lint`)
- Type checking (`bun run tsc`)
- Tests (`bun run test:run`)
- All validations (`bun run validate:all`)
- Production build (`bun run build`)

## Testing

**CRITICAL**: This project enforces comprehensive testing for all code.

### Test Structure

- All test files must be co-located with source files
- Naming: `filename.spec.ts` or `filename.spec.tsx`
- Framework: Bun test (built-in test runner) + React Testing Library + Jest DOM + Happy DOM

### Running Tests

```bash
# Watch mode (for development)
bun test

# Run all tests once
bun run test:run

# Run with UI
bun run test:ui

# Generate coverage report
bun run test:coverage

# Run specific test file
bun test -- src/lib/utils.spec.ts
```

### Coverage Requirements

- **Utility functions**: 90%+ coverage
- **Components**: 80%+ coverage for critical paths
- **Schemas**: 100% validation coverage

## Release & Deployment

### Creating a Release

```bash
bun run release
```

This script:

1. Prompts for a tag name (e.g., `v1.0.0`)
2. Generates changelog from conventional commits
3. Creates and pushes a git tag
4. Triggers automatic deployment to GitHub Pages

### Deployment

- **Automatic**: Triggered when a new tag is pushed
- **Platform**: GitHub Pages
- **Workflow**: `.github/workflows/deploy.yml`

### Changelog

The `CHANGELOG.md` file is **automatically generated** from conventional commits. Do not edit it manually.

## Project Structure

```
store-website/
├── src/
│   ├── components/        # React components
│   ├── data/             # Configuration data
│   │   ├── products/     # Individual product files (source of truth)
│   │   ├── products.json # Aggregated products (generated)
│   │   ├── categories.json
│   │   ├── tags.json
│   │   └── promotion.json
│   ├── schemas/          # Zod validation schemas
│   ├── types/            # TypeScript type definitions
│   ├── lib/              # Utility functions
│   └── styles/           # Tailwind CSS styles
├── scripts/              # CLI tools and build scripts
│   ├── store-cli.ts      # 🛍️ Main interactive CLI menu
│   ├── update-products.ts
│   ├── update-categories.ts
│   ├── update-tags.ts
│   ├── update-promotion.ts
│   ├── validate-*.ts     # Validation scripts
│   └── ...
├── .claude/              # Claude Code skills
│   └── skills/
│       ├── manage-products.md
│       ├── manage-categories.md
│       ├── manage-tags.md
│       └── manage-promotion.md
├── AGENTS.md            # AI agent instructions
└── README.md            # This file
```

## Data Management

### Products (~50 fields)

- **Format**: Individual JSON files per product
- **Location**: `src/data/products/{product-id}.json`
- **Aggregation**: Auto-generated `products.json` (gitignored)
- **CLI**: `bun run update:products`
- **Validation**: `bun run validate:products`

### Categories (23 categories)

- **Format**: Array in single JSON file
- **Location**: `src/data/categories.json`
- **CLI**: `bun run update:categories`
- **Validation**: `bun run validate:categories`

### Tags (96 tags)

- **Format**: Object/map in single JSON file
- **Location**: `src/data/tags.json`
- **CLI**: `bun run update:tags`
- **Validation**: `bun run validate:tags`

### Promotion Banner

- **Format**: Single configuration object
- **Location**: `src/data/promotion.json`
- **CLI**: `bun run update:promotion`
- **Validation**: `bun run validate:promotion`

### Sales Copy Variant Management

Multiple variants can exist for A/B testing or campaigns:

- `{product-id}-sales-copy-default.json` - Standard sales copy
- `{product-id}-sales-copy-holiday-2026.json` - Holiday campaign
- `{product-id}-sales-copy-black-friday.json` - Black Friday sale

Switch active variant by updating `activeSalesCopyId` in product JSON.

**How It Works:**

1. Product JSON stores `activeSalesCopyId: "default"`
2. During aggregation, `loadActiveSalesCopy()` loads the variant file
3. Sales copy fields are merged into the product object
4. Aggregated product contains all fields for runtime use
5. Storytelling sections conditionally render on product pages if present

**Best Practices:**

- Keep `default` variant as the evergreen sales copy
- Create new variants for campaigns (holiday, seasonal, etc.)
- Update product JSON `activeSalesCopyId` to switch variants
- Run `bun run aggregate:products` after changes
- Validate with `bun run validate:all`

## Image Requirements

Product images are organized into five groups, each with specific size and format requirements.

### Image Groups & Specifications

#### Cover Images (Product Card Thumbnails)

- **Aspect Ratio**: 16:9 (recommended for consistent card display)
- **Recommended Size**: 800x450 pixels
- **Maximum Size**: 1200x675 pixels
- **Format**: WebP (preferred) or PNG/JPG
- **Compression**: Optimize for web (target ~100-200KB per image)
- **Usage**: Displayed on product cards, used for og:image social sharing
- **Best Practice**: Use 1-2 high-quality cover images per product

#### Banner Images (Hero Section)

- **Aspect Ratio**: 16:9 or wider (e.g., 21:9 for cinematic effect)
- **Recommended Size**: 1920x1080 pixels
- **Maximum Size**: 2560x1440 pixels
- **Format**: WebP (preferred) or PNG/JPG
- **Compression**: High quality acceptable (target ~200-400KB per image)
- **Usage**: Top of product page hero section for high visual impact
- **Best Practice**: Use 1-2 stunning hero images that capture product essence

#### Main Images (Primary Product Showcase)

- **Aspect Ratio**: Flexible (16:9 recommended, but can vary)
- **Recommended Size**: 1600x900 pixels (for 16:9) or appropriate for aspect ratio
- **Maximum Size**: 1920x1080 pixels
- **Format**: WebP (preferred) or PNG/JPG
- **Compression**: Balanced quality (target ~150-300KB per image)
- **Usage**: Above "What's Included" section for primary product demonstrations
- **Best Practice**: Screenshots, feature highlights, key visuals

#### Secondary Images (Deep Dive Content)

- **Aspect Ratio**: Flexible (match your content needs)
- **Recommended Size**: 1200x675 pixels (for 16:9) or appropriate for aspect ratio
- **Maximum Size**: 1600x900 pixels
- **Format**: WebP (preferred) or PNG/JPG
- **Compression**: Balanced quality (target ~100-250KB per image)
- **Usage**: Below "Benefits You'll Experience" section for detailed features
- **Best Practice**: Detailed screenshots, workflow diagrams, use cases

#### Bonus Images (Additional Resources)

- **Aspect Ratio**: Flexible (match your content needs)
- **Recommended Size**: 1200x675 pixels (for 16:9) or appropriate for aspect ratio
- **Maximum Size**: 1600x900 pixels
- **Format**: WebP (preferred) or PNG/JPG
- **Compression**: Balanced quality (target ~100-250KB per image)
- **Usage**: Below "Ready to Get Started" for testimonials, social proof, extras
- **Best Practice**: Additional screenshots, community content, bonus materials

### Video Requirements (YouTube)

- **Type**: YouTube videos only (embedded, click-to-play)
- **Formats Supported**:
    - `youtube.com/watch?v=VIDEO_ID`
    - `youtu.be/VIDEO_ID`
    - `youtube.com/embed/VIDEO_ID`
- **Thumbnail**: Auto-generated high-quality thumbnail from YouTube
- **Privacy**: Uses `youtube-nocookie.com` domain
- **Playback**: User click required (no autoplay)

### General Best Practices

1. **File Format Priority**: WebP > PNG > JPG
2. **Compression**: Always compress images before upload to reduce page load time
3. **Aspect Ratios**: Maintain consistent aspect ratios within each group
4. **Accessibility**: Always provide descriptive `title` and `altText` for every image
5. **Organization**: Keep images organized by group (cover, banner, main, secondary, bonus)
6. **Naming**: Use descriptive filenames (e.g., `knowii-dashboard-overview.webp`)
7. **Testing**: Test images at different screen sizes to ensure responsiveness

### Image Management CLI

```bash
# Interactive mode (recommended)
bun run update:products
# Select "Edit existing product" → Choose product → Select "🖼️ Manage Media"

# CLI mode
bun run update:products -- --operation media:list --id product-id
bun run update:products -- --operation media:add --id product-id \
    --media-type image \
    --media-url "/assets/images/product/cover.webp" \
    --media-title "Product Cover" \
    --media-altText "Product interface showing main dashboard" \
    --media-group cover
```

### Compression Tools Recommendations

- **WebP Conversion**: `cwebp` (Google's WebP encoder)
- **Batch Optimization**: ImageOptim (Mac), Squoosh (Web), Sharp (Node.js)
- **Online Tools**: TinyPNG, Squoosh.app, Cloudinary

## Tech Stack

- **Runtime & Package Manager**: Bun
- **Framework**: React 19
- **Build Tool**: Bun (native bundler)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Routing**: React Router 7 (HashRouter for GitHub Pages)
- **Icons**: React Icons
- **Validation**: Zod
- **Testing**: Bun test + React Testing Library + Happy DOM
- **CLI**: Inquirer (interactive prompts)
- **Deployment**: GitHub Pages

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `bun run ci:local` to verify
4. Commit using conventional commits
5. Create a pull request

## Conventional Commits

Use the following commit format:

```
type(scope): description

Examples:
feat(products): add new product management CLI
fix(validation): correct category schema validation
docs(readme): update CLI documentation
test(utils): add tests for product sorting
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

## License

This project is proprietary and confidential.

## Author

**Sébastien Dubois**
Website: [https://dsebastien.net](https://dsebastien.net)
Store: [https://store.dsebastien.net](https://store.dsebastien.net)
