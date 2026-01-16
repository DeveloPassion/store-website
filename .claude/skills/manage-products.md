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
    --gumroadUrl "https://store.dsebastien.net/product/abc123" \
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
- ✅ Quick updates to common fields (name, price, included items)
- ✅ Listing and filtering products
- ✅ Managing sales copy variants (see Sales Copy Management section)
- ✅ Managing media, FAQs, and testimonials (see sections below)

### Use Direct Editing for:
- ✅ Cross-references (crossSellIds)
- ✅ Advanced fields (variants, stats)
- ✅ Complex included items (multi-line editing)

**IMPORTANT**: Sales copy fields (tagline, description, features, benefits, PAS framework, audience, trust, SEO) are NOT in individual product files. They are in separate `{product-id}-sales-copy-{variant}.json` files. Use the CLI's Sales Copy Management operations or edit the sales copy files directly.

**For Media, FAQs, and Testimonials:**
Use the CLI's integrated management features (see sections below)

## Schema Documentation

**Source of Truth**: `src/schemas/product.schema.ts`

The product schema is defined using Zod with two distinct schemas:

### IndividualProductSchema (for individual product files)

Individual product files (`{product-id}.json`) contain core product data WITHOUT sales copy, FAQs, or media:

- **Identity**: id, name
- **Pricing**: price, priceDisplay, priceTier, gumroadUrl, variants
- **Subscription**: isSubscription, paymentFrequencies, defaultPaymentFrequency
- **Taxonomy**: mainCategory, secondaryCategories, tags
- **Content**: included
- **Social Proof**: testimonials (nullable), stats (nullable), ratingsCount/averageRating (computed at build time)
- **Links**: landingPageUrl, dsebastienUrl
- **Meta**: featured, bestValue, bestseller, priority (0-100) - all strictly required
- **Cross-sell**: crossSellIds
- **Sales Copy Reference**: activeSalesCopyId (strictly required, non-nullable)

### AggregatedProductSchema (for runtime/aggregated products.json)

Aggregated products include auto-loaded content:

- **All IndividualProductSchema fields** PLUS:
- **FAQs**: Auto-loaded from `{product-id}-faq.json` (empty array if file doesn't exist)
- **Media**: Auto-loaded from `{product-id}-media.json` (empty array if file doesn't exist)
- **Sales Copy**: Auto-loaded from `{product-id}-sales-copy-{variant}.json` (strictly required)
  - Access via `product.salesCopy.tagline`, `product.salesCopy.features`, etc.
  - All PAS Framework fields: problem, problemPoints, agitate, agitatePoints, solution, solutionPoints
  - All content: description, features, benefits (immediate, systematic, longTerm)
  - All audience: targetAudience, perfectFor, notForYou
  - All trust: trustBadges, guarantees
  - All SEO: metaTitle, metaDescription, keywords
  - Optional storytelling sections
  - Optional timeline (transformation journey with time-based milestones)

**Important Notes:**
- Individual product files do NOT contain tagline, description, features, benefits, PAS framework, or other sales copy
- Sales copy is in separate `{product-id}-sales-copy-{variant}.json` files
- activeSalesCopyId is strictly required (non-nullable) and must reference a valid sales copy file
- FAQs, media, and testimonials are stored in separate files and auto-loaded during aggregation
- All boolean flags (featured, bestValue, bestseller, isSubscription) are strictly required
- Benefits schema requires all three categories: immediate, systematic, longTerm
- Priority must be between 0-100
- Product IDs must be unique

### Accessing Product Fields in Code

**In individual product files** (`{product-id}.json`):
```json
{
  "id": "product-id",
  "name": "Product Name",
  "price": 49.99,
  "activeSalesCopyId": "default",
  "included": ["Item 1", "Item 2"]
}
```

**In runtime/aggregated products** (after aggregation):
```typescript
// Core product fields (from individual file)
product.id
product.name
product.price
product.activeSalesCopyId

// Sales copy fields (loaded from sales copy file)
product.salesCopy.tagline
product.salesCopy.description
product.salesCopy.features
product.salesCopy.benefits.immediate
product.salesCopy.benefits.systematic
product.salesCopy.benefits.longTerm
product.salesCopy.problem
product.salesCopy.problemPoints
product.salesCopy.targetAudience

// Auto-loaded content (from separate files)
product.faqs
product.media
product.testimonials
```

**Schema Usage**:
- Use `IndividualProductSchema` when validating individual product files
- Use `AggregatedProductSchema` when working with runtime/aggregated products
- Sales copy files use `SalesCopyFileSchema` (wraps `SalesCopyDataSchema` in `{ data }` object)

**Deprecated/Removed Fields**:
- Inline sales copy fields: Moved to separate sales copy files

**Nullable vs. Required Fields**:

Schema uses `.nullable()` (always present in JSON, with `null` when empty).

- **Required**: `id`, `name`, `activeSalesCopyId`, `price`, `priceDisplay`, `priceTier`, `gumroadUrl`, `mainCategory`, `tags`, `included`, `priority`, boolean flags (`isSubscription`, `featured`, `bestValue`, `bestseller`)
- **Nullable**: `variants`, `paymentFrequencies`, `defaultPaymentFrequency`, `stats`, `ratingsCount`, `averageRating`, `landingPageUrl`, `dsebastienUrl`
- **Empty arrays allowed**: `secondaryCategories`, `crossSellIds`, `targetAudience`, `perfectFor`, `notForYou`, `trustBadges`, `guarantees`

**Subscription Products**:
For products with `priceTier: 'subscription'`:
- `isSubscription`: Must be `true` (strictly required)
- `paymentFrequencies`: Array of frequencies (nullable, but recommended for subscriptions)
- `defaultPaymentFrequency`: Default selection (nullable, but recommended for subscriptions)
- Variants can have `paymentFrequency` and `prices` object for per-frequency pricing

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

## Managing Media, FAQs, and Testimonials

Media, FAQs, and testimonials are now integrated into the main products CLI.

### Media Management

Products support rich media organized into four groups: cover, main, secondary, and bonus.

**Interactive Mode:**
```bash
bun run update:products
# Select "Edit existing product" → Choose product → Select "🖼️ Manage Media"
```

**CLI Mode:**
```bash
# List media
bun run update:products -- --operation media:list --id product-id

# Add media
bun run update:products -- --operation media:add --id product-id \
    --media-type image \
    --media-url "/path/image.png" \
    --media-title "Screenshot" \
    --media-altText "App screenshot" \
    --media-group cover

# Edit media
bun run update:products -- --operation media:edit --id product-id \
    --media-id "media-123" \
    --media-title "Updated title"

# Remove media
bun run update:products -- --operation media:remove --id product-id --media-id "media-123"

# Reorder media
bun run update:products -- --operation media:reorder --id product-id \
    --media-id "media-123" \
    --media-order 5
```

### FAQ Management

**Interactive Mode:**
```bash
bun run update:products
# Select "Edit existing product" → Choose product → Select "📝💬 Manage Content" → "FAQs"
```

**CLI Mode:**
```bash
# List FAQs
bun run update:products -- --operation faq:list --id product-id

# Add FAQ
bun run update:products -- --operation faq:add --id product-id \
    --faq-question "How does it work?" \
    --faq-answer "It works great!"

# Edit FAQ
bun run update:products -- --operation faq:edit --id product-id \
    --faq-id "faq-123" \
    --faq-question "Updated question"

# Remove FAQ
bun run update:products -- --operation faq:remove --id product-id --faq-id "faq-123"
```

### Testimonial Management

**Interactive Mode:**
```bash
bun run update:products
# Select "Edit existing product" → Choose product → Select "📝💬 Manage Content" → "Testimonials"
```

**CLI Mode:**
```bash
# List testimonials
bun run update:products -- --operation testimonial:list --id product-id

# Add testimonial (all testimonials are assumed 5-star)
bun run update:products -- --operation testimonial:add --id product-id \
    --testimonial-author "John Doe" \
    --testimonial-quote "Amazing product!" \
    --testimonial-featured true

# Edit testimonial
bun run update:products -- --operation testimonial:edit --id product-id \
    --testimonial-id "test-123" \
    --testimonial-quote "Updated quote"

# Remove testimonial
bun run update:products -- --operation testimonial:remove --id product-id \
    --testimonial-id "test-123"
```

### Sales Copy Management

Products support versioned sales copy variants for A/B testing and seasonal campaigns.

**Interactive Mode:**
```bash
bun run update:products
# Select "Edit existing product" → Choose product → Select "💬 Manage Sales Copy"
```

**CLI Mode:**
```bash
# List all sales copy variants
bun run update:products -- --operation sales-copy:list --id product-id

# Add new variant
bun run update:products -- --operation sales-copy:add --id product-id \
    --sales-copy-id holiday-2026 \
    --sales-copy-tagline "Holiday Special" \
    --sales-copy-description "Limited time offer"

# Edit variant - supports ALL fields (strings, arrays, nested objects)
# Basic fields
bun run update:products -- --operation sales-copy:edit --id product-id \
    --sales-copy-id default \
    --sales-copy-tagline "Updated tagline" \
    --sales-copy-description "Updated description" \
    --sales-copy-secondary-tagline "Optional secondary tagline"

# Edit PAS Framework with arrays
bun run update:products -- --operation sales-copy:edit --id product-id \
    --sales-copy-id default \
    --sales-copy-problem "Core problem" \
    --sales-copy-problem-points "Pain 1,Pain 2,Pain 3" \
    --sales-copy-agitate "Why it hurts" \
    --sales-copy-agitate-points '["Cost 1","Cost 2"]' \
    --sales-copy-solution "Our solution" \
    --sales-copy-solution-points "Benefit 1,Benefit 2"

# Edit all features and benefits at once
bun run update:products -- --operation sales-copy:edit --id product-id \
    --sales-copy-id default \
    --sales-copy-features "Voice capture,AI organization,Smart search" \
    --sales-copy-benefits-immediate "Start today,See results fast" \
    --sales-copy-benefits-systematic "Build sustainable habits" \
    --sales-copy-benefits-long-term "Compound knowledge over years"

# Edit target audience
bun run update:products -- --operation sales-copy:edit --id product-id \
    --sales-copy-id default \
    --sales-copy-target-audience "Knowledge workers,Researchers" \
    --sales-copy-perfect-for "Content creators,Consultants" \
    --sales-copy-not-for-you "If you prefer paper notes"

# Edit trust signals and SEO
bun run update:products -- --operation sales-copy:edit --id product-id \
    --sales-copy-id default \
    --sales-copy-trust-badges "30-day guarantee,Secure checkout" \
    --sales-copy-guarantees "Money-back guarantee,Lifetime updates" \
    --sales-copy-meta-title "SEO Title" \
    --sales-copy-keywords "pkm,knowledge,productivity"
```

**Array Input Formats:**
- Comma-separated: `"item1,item2,item3"`
- JSON array: `'["item1","item2","item3"]'`

**Comprehensive Edit Example:**
```bash
# Edit multiple fields at once
bun run update:products -- --operation sales-copy:edit --id knowii-voice-ai --sales-copy-id default \
    --sales-copy-tagline "Transform Your Voice Into Knowledge" \
    --sales-copy-features "Voice capture,AI transcription,Smart categorization" \
    --sales-copy-benefits-immediate "Start capturing today,Works offline" \
    --sales-copy-benefits-systematic "Build knowledge base,Organize automatically" \
    --sales-copy-benefits-long-term "Compound your expertise,Build institutional knowledge" \
    --sales-copy-problem-points "Scattered notes,Lost ideas,Information overload" \
    --sales-copy-solution-points "Unified system,AI organization,Quick retrieval"
```

**Array Input Formats:**
- Comma-separated: `"item1,item2,item3"`
- JSON array: `'["item1","item2","item3"]'`

**Supported Edit Fields (ALL sales copy fields):**
- Basic: `--sales-copy-tagline`, `--sales-copy-secondary-tagline`, `--sales-copy-description`
- PAS Framework: `--sales-copy-problem`, `--sales-copy-problem-points`, `--sales-copy-agitate`, `--sales-copy-agitate-points`, `--sales-copy-solution`, `--sales-copy-solution-points`
- Content: `--sales-copy-features`, `--sales-copy-benefits-immediate`, `--sales-copy-benefits-systematic`, `--sales-copy-benefits-long-term`
- Audience: `--sales-copy-target-audience`, `--sales-copy-perfect-for`, `--sales-copy-not-for-you`
- Trust: `--sales-copy-trust-badges`, `--sales-copy-guarantees`
- SEO: `--sales-copy-meta-title`, `--sales-copy-meta-description`, `--sales-copy-keywords`

**Array Input Formats:**
- Comma-separated: `"item1,item2,item3"`
- JSON array: `'["item1","item2","item3"]'`

**Comprehensive Edit Example:**
```bash
bun run update:products -- --operation sales-copy:edit --id knowii-voice-ai --sales-copy-id default \
    --sales-copy-tagline "Transform Your Knowledge Workflow" \
    --sales-copy-features "Voice capture,AI organization,Smart categorization" \
    --sales-copy-benefits-immediate "Start capturing today,Quick setup" \
    --sales-copy-problem-points "Information overload,Lost ideas,Scattered notes" \
    --sales-copy-guarantees "30-day money-back,Lifetime updates"
```

**Interactive Features:**
- Create variants from active, another variant, or template
- Comprehensive editor with 6 submenus:
  - **Basic Info**: Tagline, secondary tagline, description
  - **PAS Framework**: Problem, agitate, solution (statements + points)
  - **Features & Benefits**: Features list + immediate/systematic/long-term benefits
  - **Target Audience**: Target audience, perfect for, not for you
  - **Trust & Guarantees**: Trust badges, guarantees
  - **SEO Metadata**: Meta title, description, keywords
  - **Timeline**: Transformation journey milestones (timeframe, title, description, highlights)
- View detailed variant information including storytelling sections
- Cannot remove active variant (safety check)

**CLI Array Input Formats:**
- Comma-separated: `"item1,item2,item3"`
- JSON array: `'["item1","item2","item3"]'`

**Comprehensive Edit Example:**
```bash
# Edit multiple fields at once
bun run update:products -- --operation sales-copy:edit --id knowii-voice-ai --sales-copy-id default \
    --sales-copy-tagline "Transform your knowledge workflow" \
    --sales-copy-features "Voice capture,AI organization,Smart categorization" \
    --sales-copy-benefits-immediate "Start capturing knowledge today,Quick setup" \
    --sales-copy-benefits-systematic "Build habits,Develop systems" \
    --sales-copy-benefits-long-term "Compound knowledge,Lasting value" \
    --sales-copy-target-audience "Knowledge workers,Researchers,Content creators" \
    --sales-copy-perfect-for "Writers,Consultants,Researchers" \
    --sales-copy-guarantees "30-day money-back guarantee,Lifetime updates"
```
bun run update:products -- --operation sales-copy:enable --id product-id \
    --sales-copy-id holiday-2026

# Duplicate variant
bun run update:products -- --operation sales-copy:duplicate --id product-id \
    --sales-copy-id default \
    --new-sales-copy-id test-variant

# Remove variant
bun run update:products -- --operation sales-copy:remove --id product-id \
    --sales-copy-id old-variant
```

**Interactive Features:**
- Create variants from active, another variant, or template
- Edit tagline, description, problem, and solution statements
- View detailed variant information including storytelling sections
- Cannot remove active variant (safety check)

### Storage

- FAQs: `src/data/products/{product-id}-faq.json`
- Testimonials: `src/data/products/{product-id}-testimonials.json`
- Media: `src/data/products/{product-id}-media.json`
- **Sales Copy: `src/data/products/{product-id}-sales-copy-{variant}.json`**

These files are automatically loaded during aggregation and attached to products.

### Validation

All changes are validated against Zod schemas before saving:
- `src/schemas/faq.schema.ts` - FAQ validation
- `src/schemas/testimonial.schema.ts` - Testimonial validation
- `src/schemas/media.schema.ts` - Media validation (MediaItemSchema, MediaArraySchema)
- **`src/schemas/sales-copy.schema.ts` - Sales copy validation (SalesCopyFileSchema, SalesCopyDataSchema)**
- **`src/schemas/timeline.schema.ts` - Timeline validation (TimelineMilestoneSchema, TimelineSchema)**

### Auto-Sorting

Content is automatically sorted when saved:
- **FAQs**: Preserved in array order (no automatic sorting)
- **Testimonials**: By `featured` (featured first), then by `author` name alphabetically
- **Media**: By `group` priority, then by `order` within group

### Ratings Calculation

Product ratings are computed at build time during aggregation:
- **ratingsCount**: Total count of ratings from stats file + testimonials
- **averageRating**: Weighted average (stats ratings + testimonials as 5-star)
- All testimonials are assumed to be 5-star ratings
- Ratings from stats files support individual ratings with nullable values and dates
