---
skill: manage-products
description: Manage and validate products with individual JSON files and schema validation
triggerKeywords: [product, products, add product, edit product, validate products, product schema, product file]
---

# Product Management Skill

This skill helps you manage products stored as individual JSON files in `src/data/products/` with automatic validation against the Zod schema.

## Product Data Location

- **Individual Product Files**: `src/data/products/{product-id}.json` (source of truth)
- **Aggregated File**: `src/data/products.json` (generated at build time, gitignored)
- **TypeScript Types**: `src/types/product.ts`
- **Zod Schema**: `src/schemas/product.schema.ts` (source of truth for validation)
- **Validation Script**: `scripts/validate-products.ts`
- **Aggregation Script**: `scripts/aggregate-products.ts`

## Schema Documentation

The product schema is defined in `src/schemas/product.schema.ts` using Zod. This is the **source of truth** for product data validation.

### Required Fields

Every product must include:

**Identity:**
- `id` (string) - Unique slug identifier
- `permalink` (string) - Gumroad permalink code
- `name` (string) - Product name
- `tagline` (string) - Main tagline

**Pricing:**
- `price` (number) - Base price in EUR
- `priceDisplay` (string) - Display format (e.g., "€49.99" or "€49.99-€118.99")
- `priceTier` (enum) - One of: free, budget, standard, premium, enterprise, subscription
- `gumroadUrl` (string, URL) - Valid Gumroad product URL

**Taxonomy:**
- `type` (enum) - One of: course, kit, community, guide, workshop, coaching, bundle, tool, resource, book, lead-magnet, service
- `categories` (array) - At least one of: ai-mastery, ai-tools, bundles, coaching, community, content-creation, courses, free, kits-and-templates, knowledge-management, knowledge-work, learning, obsidian, personal-development, personal-organization, productivity, dev-and-it, workshops
- `tags` (array) - At least one tag

**Marketing (PAS Framework):**
- `problem` (string) - Pain point description
- `problemPoints` (array) - List of specific problems
- `agitate` (string) - Agitation description
- `agitatePoints` (array) - List of agitation points
- `solution` (string) - Solution description
- `solutionPoints` (array) - List of solution points

**Content:**
- `description` (string) - Full product description
- `features` (array) - List of features
- `benefits` (object) - immediate, systematic, and longTerm arrays
- `included` (array) - What's included in the product
- `testimonialIds` (array) - IDs from testimonials.json
- `faqIds` (array) - IDs from faqs.json
- `targetAudience` (array) - Who this is for
- `perfectFor` (array) - Perfect for scenarios
- `notForYou` (array) - When not to buy

**Meta:**
- `featured` (boolean) - Feature flag (displayed prominently)
- `mostValue` (boolean) - Best value flag (highest ROI products)
- `bestseller` (boolean) - Bestseller flag (most popular products)
- `status` (enum) - One of: active, coming-soon, archived
- `priority` (number, 0-100) - Sort priority (higher = more important)
- `trustBadges` (array) - Trust indicators
- `guarantees` (array) - Money-back guarantees, etc.
- `crossSellIds` (array) - Related product IDs

### Optional Fields

- `secondaryTagline` (string)
- `variants` (array) - Multiple pricing tiers
- `statsProof` (object) - userCount, timeSaved, rating
- `coverImage` (string) - Cover image path
- `screenshots` (array) - Screenshot paths
- `videoUrl` (string, URL) - YouTube or video URL
- `demoUrl` (string, URL) - Demo link
- `landingPageUrl` (string, URL) - Dedicated landing page
- `dsebastienUrl` (string, URL) - Article on dsebastien.net
- `metaTitle` (string) - SEO title
- `metaDescription` (string) - SEO description
- `keywords` (array) - SEO keywords

## Workflow

### Editing Existing Products

1. **Locate the product file** in `src/data/products/{product-id}.json`
2. **Edit the product data** directly in the individual file
3. **Run validation** using `npm run validate:products` (automatically aggregates first)
4. **Fix any errors** reported by the validation script
5. **Repeat** until validation passes

### Adding New Products

1. **Create a new file** in `src/data/products/` named `{product-id}.json`
2. **Copy structure** from an existing product file as a template
3. **Fill in all required fields** according to the schema
4. **Run validation** using `npm run validate:products`
5. **Fix any errors** and repeat until validation passes
6. **Commit the new file** to git

## Commands

### Aggregate Products

```bash
npm run aggregate:products
```

This command combines all individual product files from `src/data/products/` into the aggregated `src/data/products.json` file.

### Validate Products

```bash
npm run validate:products
```

This command (automatically runs aggregation first):
- ✅ Validates all products against the Zod schema
- 📊 Shows a summary of products by status and type
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

1. Copy an existing product as a template
2. Update all fields with new product data
3. Ensure all required arrays have at least one item
4. Set appropriate priority based on guidelines
5. Run `npm run validate:products` to verify

### Editing an Existing Product

1. Locate the product by its `id` field
2. Make your changes
3. Run `npm run validate:products` to verify
4. Check that URLs are valid and complete

### Validating Before Commit

Always run validation before committing changes:

```bash
npm run validate:products
```

## Important Notes

- The Zod schema in `src/schemas/product.schema.ts` is the **source of truth**
- Keep the TypeScript types in `src/types/product.ts` in sync with the schema
- All URLs must be valid or empty strings (not null)
- Arrays cannot be empty if marked as required (minimum 1 item)
- Priority must be between 0 and 100
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

1. Update `src/schemas/product.schema.ts` (Zod schema)
2. Update `src/types/product.ts` (TypeScript types)
3. Update this skill documentation
4. Run validation on all products
5. Fix any newly invalid products
