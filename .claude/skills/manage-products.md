---
skill: manage-products
description: Manage and validate products with interactive CLI and schema validation
triggerKeywords: [product, products, add product, edit product, validate products, product schema, product file, update products]
---

# Product Management Skill

This skill helps you manage products stored as individual JSON files in `src/data/products/` with an interactive CLI tool featuring keyboard-navigable multi-select interfaces for tags and categories, plus automatic validation against the Zod schema.

## Product Data Location

- **Individual Product Files**: `src/data/products/{product-id}.json` (source of truth)
- **Aggregated File**: `src/data/products.json` (generated at build time, gitignored)
- **TypeScript Types**: `src/types/product.ts`
- **Zod Schema**: `src/schemas/product.schema.ts` (source of truth for validation)
- **Update CLI**: `scripts/update-products.ts` (interactive management tool)
- **Validation Script**: `scripts/validate-products.ts`
- **Aggregation Script**: `scripts/utils/aggregate-products.ts`

## Quick Update with Interactive CLI (Recommended)

Use the interactive CLI tool for easy product management with keyboard-navigable interfaces:

### Interactive Mode

```bash
# Launch interactive mode (prompts for operation)
bun run update:products
```

The interactive mode provides:
- Keyboard-navigable category and tag selection
- Multi-select interfaces with visual feedback
- Step-by-step guided prompts
- Automatic validation before saving
- Progressive disclosure for complex fields

### CLI Arguments Mode

**List products:**
```bash
# List all products (table format)
bun run update:products -- --operation list

# Filter by featured products
bun run update:products -- --operation list --featured

# Filter by category or tag
bun run update:products -- --operation list --category guides
bun run update:products -- --operation list --tag ai

# JSON output
bun run update:products -- --operation list --format json

# Detailed output
bun run update:products -- --operation list --format detailed
```

**Add product (minimal required fields):**
```bash
bun run update:products -- --operation add \
    --name "Product Name" \
    --tagline "One-line description" \
    --price 49.99 \
    --priceTier standard \
    --permalink abc123 \
    --gumroadUrl "https://store.dsebastien.net/l/abc123" \
    --mainCategory guides \
    --tags "obsidian,pkm,productivity" \
    --problem "Problem description" \
    --agitate "Agitation" \
    --solution "Solution"
```

**Edit product:**
```bash
# Edit specific fields
bun run update:products -- --operation edit \
    --id product-id \
    --name "New Name" \
    --price 39.99 \
    --priority 95

# Edit tags (replaces all)
bun run update:products -- --operation edit \
    --id product-id \
    --tags "tag1,tag2,tag3"

# Edit secondary categories (format: id:distant)
bun run update:products -- --operation edit \
    --id product-id \
    --secondaryCategories "obsidian:false,knowledge-management:true"
```

**Remove product:**
```bash
# Remove product (checks cross-references)
bun run update:products -- --operation remove --id product-id

# Force remove even if referenced
bun run update:products -- --operation remove --id product-id --force
```

## When to Use CLI vs. Direct Editing

### Use CLI for:
- ✅ Adding new products (creates structure with validation)
- ✅ Editing taxonomy (categories/tags with keyboard-navigable multi-select)
- ✅ Changing pricing, priority, or meta flags (featured, bestValue, bestseller)
- ✅ Quick updates to common fields
- ✅ Listing and filtering products

### Use Direct Editing for:
- ✅ Complex marketing copy (problemPoints, agitatePoints, solutionPoints)
- ✅ Adding detailed content (features, benefits, included)
- ✅ Media management (coverImage, screenshots, videoUrl)
- ✅ Cross-references (crossSellIds)
- ✅ SEO metadata (metaTitle, metaDescription, keywords)
- ✅ Advanced fields (variants, statsProof, guarantees)

**For FAQs and Testimonials:**
Use the dedicated CLI tool: `bun run manage:product-content`

## Schema Documentation

**Source of Truth**: `src/schemas/product.schema.ts`

The product schema is defined using Zod and contains 50+ fields organized into these groups:

- **Identity**: id, permalink, name, tagline, secondaryTagline
- **Pricing**: price, priceDisplay, priceTier, gumroadUrl, variants
- **Subscription**: isSubscription, paymentFrequencies, defaultPaymentFrequency
- **Taxonomy**: mainCategory, secondaryCategories, tags
- **Marketing (PAS Framework)**: problem, problemPoints, agitate, agitatePoints, solution, solutionPoints
- **Content**: description, features, benefits, included, targetAudience, perfectFor, notForYou
- **Social Proof**: testimonials (auto-loaded), statsProof
- **Media**: coverImage, screenshots, videoUrl, demoUrl
- **Links**: landingPageUrl, dsebastienUrl
- **Meta**: featured, bestValue, bestseller, priority (0-100)
- **Trust**: trustBadges, guarantees
- **Cross-sell**: crossSellIds
- **SEO**: metaTitle, metaDescription, keywords

**Important Notes:**
- FAQs and testimonials are stored in separate files (`{product-id}-faq.json` and `{product-id}-testimonials.json`) and auto-loaded during aggregation
- Refer to the schema file for complete field details, types, and validation rules
- All URLs must be valid or empty strings (not null)
- Priority must be between 0-100
- Product IDs must be unique

## Workflow

### Adding New Products (Recommended: Use CLI)

**Using Interactive CLI:**
1. **Run** `bun run update:products`
2. **Select** "Add new product"
3. **Follow prompts** for basic information (name, tagline, pricing)
4. **Use keyboard navigation** to select categories and tags
5. **Enter marketing copy** (problem, agitate, solution)
6. **Review and confirm** the product summary
7. **Edit the file** directly for advanced fields (media, detailed content)
8. **Validate** with `bun run validate:products`

**Using Direct File Creation:**
1. **Create a new file** in `src/data/products/` named `{product-id}.json`
2. **Copy structure** from an existing product file as a template
3. **Fill in all required fields** according to the schema
4. **Run validation** using `bun run validate:products`
5. **Fix any errors** and repeat until validation passes
6. **Commit the new file** to git

### Editing Existing Products

**Using Interactive CLI (for common fields):**
1. **Run** `bun run update:products`
2. **Select** "Edit existing product"
3. **Choose the product** from the list
4. **Select the section** to edit (basic info, pricing, taxonomy, meta)
5. **Use keyboard navigation** for categories/tags
6. **Save and validate**

**Using Direct File Editing (for advanced fields):**
1. **Locate the product file** in `src/data/products/{product-id}.json`
2. **Edit the product data** directly in the individual file
3. **Run validation** using `bun run validate:products` (automatically aggregates first)
4. **Fix any errors** reported by the validation script
5. **Repeat** until validation passes

## Commands

### Update Products (Interactive CLI)

```bash
bun run update:products
```

Interactive CLI tool for managing products:
- 📋 List products with filtering
- ➕ Add new products with guided prompts
- ✏️ Edit existing products
- 🗑️ Remove products with cross-reference checking
- ⌨️ Keyboard-navigable multi-select for categories and tags
- ✅ Automatic validation before saving

### Aggregate Products

```bash
bun run aggregate:products
```

This command combines all individual product files from `src/data/products/` into the aggregated `src/data/products.json` file.

### Validate Products

```bash
bun run validate:products
```

This command (automatically runs aggregation first):
- ✅ Validates all products against the Zod schema
- 📊 Shows a summary of products by category and pricing tier
- ❌ Reports specific errors for invalid products
- 🚫 Exits with code 1 if validation fails

## Priority Guidelines

Priority determines product ordering in listings (0-100):

- **100**: Featured flagship products
- **90-95**: Featured products and bundles
- **80-85**: Premium kits and courses
- **70-79**: Standard kits, courses, and guides
- **60-69**: Workshops and tools
- **50-59**: Coaching and standard products
- **40-49**: Free resources and tools
- **30-39**: Community (free tier)
- **20-29**: Archived products

## Common Tasks

### Adding a New Product

**Using CLI (Recommended):**
```bash
bun run update:products
# Select "Add new product"
# Follow interactive prompts
```

**Manual Method:**
1. Copy an existing product as a template
2. Update all fields with new product data
3. Ensure all required arrays have at least one item
4. Set appropriate priority based on guidelines
5. Run `bun run validate:products` to verify

### Editing an Existing Product

**Using CLI for common fields:**
```bash
bun run update:products
# Select "Edit existing product"
# Choose product and fields to edit
```

**Manual editing for advanced fields:**
1. Locate the product by its `id` field
2. Make your changes directly in the file
3. Run `bun run validate:products` to verify
4. Check that URLs are valid and complete

### Listing and Filtering Products

```bash
# List all products
bun run update:products -- --operation list

# Filter by category
bun run update:products -- --operation list --category guides

# Show only featured products
bun run update:products -- --operation list --featured
```

### Validating Before Commit

Always run validation before committing changes:

```bash
bun run validate:products
```

## Important Notes

- **Source of Truth**: `src/schemas/product.schema.ts` defines all fields and validation rules
- TypeScript types in `src/types/product.ts` are auto-exported from the schema
- Always validate products after editing: `bun run validate:products`
- Product IDs must be unique across all products

## Error Messages

The validation script provides detailed error messages:

```
❌ Product #5: "example-product"
  • price: Expected number, received string
  • gumroadUrl: Invalid url
  • features: Array must contain at least 1 element(s)
```

Each error shows:
- The product number and ID
- The field path with the error
- The specific validation error message

## Schema Updates

When updating the product schema:

1. Update `src/schemas/product.schema.ts` (source of truth)
2. Update this skill's field groupings list if structure changes
3. Run `bun run validate:products` on all products
4. Fix any newly invalid products

Note: TypeScript types are auto-exported from the schema, no manual sync needed.

## Managing FAQs and Testimonials

FAQs and testimonials are managed separately using a dedicated CLI tool:

```bash
# Via Store CLI (easiest)
bun run store
# Then select "📝 Manage Product Content"

# Direct access
bun run manage:product-content

# CLI mode - specify product and type
bun run manage:product-content -- --product=product-id --type=faqs
bun run manage:product-content -- --product=product-id --type=testimonials
```

### Features

The CLI provides full CRUD operations:
- 📋 **List** - View all FAQs/testimonials for a product
- ➕ **Add** - Create new FAQ/testimonial with guided prompts
- ✏️  **Edit** - Update existing FAQ/testimonial
- 🗑️  **Delete** - Remove FAQ/testimonial with confirmation

### Storage

- FAQs: `src/data/products/{product-id}-faq.json`
- Testimonials: `src/data/products/{product-id}-testimonials.json`

These files are automatically loaded during aggregation and attached to products as `faqs` and `testimonials` arrays.

### Validation

The CLI validates all changes against Zod schemas before saving:
- `src/schemas/faq.schema.ts` - FAQ validation
- `src/schemas/testimonial.schema.ts` - Testimonial validation

### Auto-Sorting

Content is automatically sorted when saved:
- **FAQs**: By `order` field (ascending)
- **Testimonials**: By `featured` (featured first), then by `rating` (highest first)
