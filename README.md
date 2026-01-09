# Store Website - Developer Guide

This repository contains the source code for the dSebastien product store website, built with React 19, Vite, Tailwind CSS v4, and TypeScript.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run all tests
npm run test:run

# Run all validation checks
npm run validate:all
```

## 🛍️ Store Management CLI

The **Store CLI** is an interactive menu system that provides easy access to all store management tools.

### Launch the Store CLI

```bash
npm run store
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
npm run update:products

# List products
npm run update:products -- --operation list [--featured] [--category guides] [--tag ai] [--format json|table|detailed]

# Add product (guided prompts with keyboard-navigable selection)
npm run update:products -- --operation add

# Add product (CLI arguments)
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
npm run update:products -- --operation remove --id product-id [--force]
```

**Script:** `scripts/update-products.ts`
**Data Files:** `src/data/products/*.json` (individual files)
**Aggregated:** `src/data/products.json` (generated, gitignored)
**Schema:** `src/schemas/product.schema.ts`

### Category Management

```bash
# Interactive mode
npm run update:categories

# List categories
npm run update:categories -- --operation list [--featured] [--format json|table]

# Add category (auto-generated ID from name)
npm run update:categories -- --operation add \
    --name "New Category" \
    --description "Category description" \
    --featured true \
    --priority 5

# Modify category
npm run update:categories -- --operation modify \
    --id "category-id" \
    --description "Updated description" \
    --priority 2

# Remove category (strict checks for mainCategory usage)
npm run update:categories -- --operation remove --id "category-id" [--force]

# Remove all unused categories
npm run update:categories -- --operation remove-unused [--force]
```

**Script:** `scripts/update-categories.ts`
**Data File:** `src/data/categories.json`
**Schema:** `src/schemas/category.schema.ts`

**Important:** Cannot remove categories used as `mainCategory` (even with `--force`)

### Tag Management

```bash
# Interactive mode
npm run update:tags

# List tags
npm run update:tags -- --operation list [--featured] [--format json|table]

# Add tag (auto-generated ID from name)
npm run update:tags -- --operation add \
    --name "Machine Learning" \
    --description "ML and AI training" \
    --featured true \
    --priority 6

# Modify tag
npm run update:tags -- --operation modify \
    --id "tag-id" \
    --description "Updated description" \
    --priority 3

# Remove tag (checks product usage)
npm run update:tags -- --operation remove --id "tag-id" [--force]

# Remove all unused tags
npm run update:tags -- --operation remove-unused [--force]
```

**Script:** `scripts/update-tags.ts`
**Data File:** `src/data/tags.json`
**Schema:** `src/schemas/tag.schema.ts`

### Promotion Banner Management

```bash
# Interactive mode (prompts for all fields)
npm run update:promotion

# CLI arguments mode (non-interactive)
npm run update:promotion -- \
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
npm run validate:all

# Validate individual components
npm run validate:products       # Validates product data and schema
npm run validate:categories     # Validates category data and schema
npm run validate:tags          # Validates tag data and schema
npm run validate:promotion     # Validates promotion banner configuration
npm run validate:relationships # Validates cross-references between data
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
npm run lint

# Format code
npm run format

# Type check
npm run tsc

# Watch mode type checking
npm run tsc:watch   # or npm run tscw

# Run tests (watch mode)
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Preview production build
npm run preview
```

### Product Data Workflow

1. **Edit individual product file** - `src/data/products/{product-id}.json`
2. **Aggregate products** - `npm run aggregate:products` (auto-runs before dev/build)
3. **Validate changes** - `npm run validate:products`
4. **Fix errors** - Address validation issues
5. **Commit** - When validation passes

### Pre-Commit Checks

Run all checks before committing:

```bash
npm run ci:local
```

This runs:

- Linting (`npm run lint`)
- Type checking (`npm run tsc`)
- Tests (`npm run test:run`)
- All validations (`npm run validate:all`)
- Production build (`npm run build`)

## Testing

**CRITICAL**: This project enforces comprehensive testing for all code.

### Test Structure

- All test files must be co-located with source files
- Naming: `filename.spec.ts` or `filename.spec.tsx`
- Framework: Vitest + React Testing Library + Jest DOM

### Running Tests

```bash
# Watch mode (for development)
npm test

# Run all tests once
npm run test:run

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- src/lib/utils.spec.ts
```

### Coverage Requirements

- **Utility functions**: 90%+ coverage
- **Components**: 80%+ coverage for critical paths
- **Schemas**: 100% validation coverage

## Release & Deployment

### Creating a Release

```bash
npm run release
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
- **CLI**: `npm run update:products`
- **Validation**: `npm run validate:products`

### Categories (23 categories)

- **Format**: Array in single JSON file
- **Location**: `src/data/categories.json`
- **CLI**: `npm run update:categories`
- **Validation**: `npm run validate:categories`

### Tags (96 tags)

- **Format**: Object/map in single JSON file
- **Location**: `src/data/tags.json`
- **CLI**: `npm run update:tags`
- **Validation**: `npm run validate:tags`

### Promotion Banner

- **Format**: Single configuration object
- **Location**: `src/data/promotion.json`
- **CLI**: `npm run update:promotion`
- **Validation**: `npm run validate:promotion`

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Routing**: React Router 7 (HashRouter for GitHub Pages)
- **Icons**: React Icons
- **Validation**: Zod
- **Testing**: Vitest + React Testing Library
- **CLI**: Inquirer (interactive prompts)
- **Deployment**: GitHub Pages

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `npm run ci:local` to verify
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
