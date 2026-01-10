---
skill: manage-categories
description: Manage and validate categories with interactive CLI and schema validation
triggerKeywords: [category, categories, add category, edit category, remove category, validate categories, category schema, categories.json, update categories]
---

# Category Management Skill

## Overview

This skill helps you manage the categories used across all products in the store website. Categories are stored in a JSON file and validated against a Zod schema. The interactive CLI tool supports add, modify, remove, and list operations with both interactive and CLI argument modes.

## Category Data Location

- **Configuration File**: `src/data/categories.json` (23 categories, array structure)
- **TypeScript Types**: `src/types/category.ts`
- **Zod Schema**: `src/schemas/category.schema.ts` (**source of truth**)
- **Validation Script**: `scripts/validate-categories.ts`
- **Update CLI**: `scripts/update-categories.ts`

## Schema Documentation

### Category Structure

```typescript
{
    id: CategoryId         // enum - must match schema (23 valid values)
    name: string           // required, min 1 char
    description: string    // required, min 1 char
    icon: string           // optional - React icon name (e.g., "FaRobot", "FaTools")
    color: string          // optional - any CSS color (hex recommended)
    featured: boolean      // required
    priority: number       // required, min 1
}
```

### Required Fields

- **id**: Unique identifier (kebab-case, must be added to `CategoryIdSchema` enum)
- **name**: Display name for the category
- **description**: Short description of what the category represents
- **featured**: Whether the category should appear in featured lists
- **priority**: Determines display order (lower = higher priority)

### Optional Fields

- **icon**: React icon component name from `react-icons` library
- **color**: Color value for visual styling (hex format `#RRGGBB` recommended, but any CSS color allowed)

### Priority Guidelines

- **Featured categories**: 1-7 (lower number = higher priority)
  - 1-2: Most important categories (e.g., "bundles", "coaching")
  - 3-5: Core categories (e.g., "community", "courses", "knowledge-management")
  - 6-7: Less prominent featured categories (e.g., "obsidian", "tools")
- **Non-featured categories**: 8-23 (flexible ordering)
  - Current range uses 8-23
  - Can use sequential numbers for consistency

### Category Usage in Products

Categories are used in two ways in products:

**1. Main Category** (required, single):
```json
{
  "id": "product-id",
  "mainCategory": "kits-and-templates",
  ...
}
```

**2. Secondary Categories** (optional, array):
```json
{
  "id": "product-id",
  "mainCategory": "kits-and-templates",
  "secondaryCategories": [
    { "id": "obsidian", "distant": false },
    { "id": "knowledge-management", "distant": true }
  ],
  ...
}
```

**Distant Flag**:
- `false`: Direct/close relationship with the category
- `true`: Indirect/loose relationship with the category

## Removal Restrictions

**CRITICAL**: Categories have special removal rules based on usage:

- ❌ **CANNOT remove** if used as `mainCategory` in ANY product (blocking operation, even with `--force`)
- ⚠️  **CAN remove** if only used in `secondaryCategories` (with `--force` flag and warning)
- ✅ **CAN remove** if not used in any products (safe removal)

**Why this restriction?**
- Every product MUST have exactly one `mainCategory` (required field)
- Removing a `mainCategory` would leave products in an invalid state
- Secondary categories are optional, so removal (with force) is less critical

## Quick Update with Interactive CLI (Recommended)

### Interactive Mode

```bash
bun run update:categories
```

Follow the prompts to:
1. Select operation (list/add/modify/remove)
2. Enter category details
3. Confirm changes
4. Update schema enum manually

### CLI Arguments Mode

**List all categories:**
```bash
bun run update:categories -- --operation list
```

**List featured categories only:**
```bash
bun run update:categories -- --operation list --featured
```

**List as JSON:**
```bash
bun run update:categories -- --operation list --format json
```

**Add category (auto-generated ID):**
```bash
bun run update:categories -- --operation add \
    --name "New Category" \
    --description "Description of the new category" \
    --featured true \
    --priority 5 \
    --icon "FaLightbulb" \
    --color "#4ECDC4"
```

**Add category (custom ID):**
```bash
bun run update:categories -- --operation add \
    --id "custom-category-id" \
    --name "Custom Category" \
    --description "Custom description" \
    --featured false \
    --priority 15
```

**Modify category:**
```bash
bun run update:categories -- --operation modify \
    --id "productivity" \
    --description "Updated description for productivity" \
    --priority 10
```

**Remove category (will fail if used as mainCategory):**
```bash
bun run update:categories -- --operation remove --id "deprecated-category"
```

**Force remove category (only works if NOT used as mainCategory):**
```bash
bun run update:categories -- --operation remove --id "old-category" --force
```

## Complete Workflow Examples

### Adding a New Category

**Interactive:**
```bash
bun run update:categories
# Select "2" or "add"
# Enter category details when prompted
# ID is auto-suggested from name
# Confirm and save
```

**CLI:**
```bash
bun run update:categories -- --operation add \
    --name "AI Automation" \
    --description "Automated AI workflows and intelligent systems" \
    --featured false \
    --priority 12 \
    --icon "FaRobot" \
    --color "#FF6B6B"
```

**Then:**
1. Edit `src/schemas/category.schema.ts`
2. Add `'ai-automation'` to the `CategoryIdSchema` enum array (keep alphabetical order)
3. Run `bun run validate:categories` to verify

### Modifying an Existing Category

**Interactive:**
```bash
bun run update:categories
# Select "3" or "modify"
# Enter category ID
# Update fields (press Enter to keep current value)
# Confirm and save
```

**CLI (update single field):**
```bash
bun run update:categories -- --operation modify \
    --id "coaching" \
    --description "One-on-one coaching and personalized mentorship services"
```

**CLI (update multiple fields):**
```bash
bun run update:categories -- --operation modify \
    --id "tools" \
    --featured true \
    --priority 8 \
    --color "#FF9F43"
```

**Note**: Cannot modify the `id` field. To change an ID, you must remove and recreate the category.

### Removing a Category

**Interactive:**
```bash
bun run update:categories
# Select "4" or "remove"
# Enter category ID
# Review usage warning (if used)
# Confirm removal
```

**CLI (safe removal - not used in products):**
```bash
bun run update:categories -- --operation remove --id "unused-category"
```

**CLI (remove category used only in secondaryCategories):**
```bash
# Will fail without --force
bun run update:categories -- --operation remove --id "old-category" --force
```

**Attempting to remove mainCategory (will ALWAYS fail):**
```bash
# This will fail even with --force if category is used as mainCategory
bun run update:categories -- --operation remove --id "coaching" --force

# Output:
# ❌ Cannot remove category used as mainCategory in products.
#    You must update those products to use a different mainCategory first.
```

**Then (after successful removal):**
1. Edit `src/schemas/category.schema.ts`
2. Remove `'old-category'` from the `CategoryIdSchema` enum array
3. Run `bun run validate:categories` to verify
4. If forced removal from secondaryCategories: update products to fix broken references

### Listing Categories

**Interactive:**
```bash
bun run update:categories
# Select "1" or "list"
# View table of all categories
```

**CLI (all categories, table format):**
```bash
bun run update:categories -- --operation list
```

**CLI (featured only):**
```bash
bun run update:categories -- --operation list --featured
```

**CLI (JSON format for scripting):**
```bash
bun run update:categories -- --operation list --format json
bun run update:categories -- --operation list --featured --format json > featured-categories.json
```

## Commands

### Update Categories
```bash
bun run update:categories
```

Interactive CLI tool for managing categories. Supports:
- `list`: View all categories with filtering
- `add`: Create new categories with validation
- `modify`: Update existing categories (except ID)
- `remove`: Delete categories with strict usage checking

### Validate Categories
```bash
bun run validate:categories
```

Validates:
- All categories in `categories.json` against Zod schema
- Structure and data types
- Displays summary of all categories
- Exit code 0 on success, 1 on failure

### Validate All
```bash
bun run validate:all
```

Validates categories along with tags, promotion, products, and all relationships.

## Important Notes

- The Zod schema in `src/schemas/category.schema.ts` is the **source of truth**
- **CategoryIdSchema enum MUST be manually updated** after add/remove operations
- ID changes are not supported (must delete + recreate to change ID)
- **CANNOT remove** categories used as `mainCategory` (blocking restriction)
- **CAN remove** (with `--force`) categories used only in `secondaryCategories`
- Priority determines display order (featured first, then by priority)
- Color format: `#RRGGBB` recommended but any CSS color allowed (no strict validation)
- Icon names must be from `react-icons` library

## Schema Sync Process

**CRITICAL**: When adding or removing categories, the schema enum must be manually updated!

### After Adding a Category

1. Use CLI to add category to `categories.json` (creates the data entry)
2. Edit `src/schemas/category.schema.ts`
3. Add the category ID to the `CategoryIdSchema` enum array:

```typescript
export const CategoryIdSchema = z.enum([
    'ai-mastery',
    'ai-tools',
    'bundles',
    'new-category-id',  // <-- Add your new category ID here
    'coaching',
    'community',
    // ... rest of categories (keep alphabetical order)
])
```

4. Run `bun run validate:categories` to verify the schema matches the data
5. TypeScript types will be automatically synced via type inference

### After Removing a Category

1. Use CLI to remove category from `categories.json`
2. Edit `src/schemas/category.schema.ts`
3. Remove the category ID from the `CategoryIdSchema` enum array
4. Run `bun run validate:categories` to verify
5. If you used `--force`: update products to remove the category from `secondaryCategories`

### Why Manual Sync is Required

The schema enum defines **valid category IDs** at the type level. This provides:
- Type safety in TypeScript
- Validation of product references
- Auto-completion in IDEs
- Compile-time checking

The data file (`categories.json`) and the schema must stay synchronized for validation to work correctly.

## Error Messages

Common validation errors and solutions:

### Category Validation Errors

**❌ Category with ID 'duplicate-id' already exists**
- **Solution**: Choose a different ID or modify the existing category

**⚠️  Color 'blue' is not in standard hex format (#RRGGBB)**
- **Note**: This is a warning, not an error. The value is accepted but not recommended.
- **Solution**: Use hex format `#4169E1` for consistency

**❌ Category: "bad-priority"**
- **Error**: `priority: Number must be greater than or equal to 1`
- **Solution**: Use priority 1-7 for featured, 8-23 for non-featured

**❌ Category: "empty-name"**
- **Error**: `name: Category name is required`
- **Solution**: Provide a non-empty name

**❌ Category: "empty-description"**
- **Error**: `description: Category description is required`
- **Solution**: Provide a non-empty description

### Removal Errors

**❌ Category with ID 'some-category' not found**
- **Solution**: Check the category ID spelling, use `--operation list` to see all categories

**❌ Cannot remove category used as mainCategory in products.**
- **Found usage as Main Category (2 products):**
  - `obsidian-starter-kit (Obsidian Starter Kit)`
  - `knowledge-worker-kit (Knowledge Worker Kit)`
- **Solution**: Update products to use a different `mainCategory` first. This restriction applies even with `--force`.

**❌ Cannot remove category used in secondaryCategories**
- **Found usage as Secondary Category (3 products):**
  - `clarity-101 (Clarity 101)`
- **Solution**: Remove category from products' `secondaryCategories`, or use `--force` flag

### Schema Sync Errors

After adding a category, if validation fails:

**❌ Error: Category ID 'new-category' is not in the schema enum**
- **Solution**: Add `'new-category'` to `CategoryIdSchema` in `src/schemas/category.schema.ts`

## Advanced Usage

### Batch Viewing

Save all categories to a file:
```bash
bun run update:categories -- --operation list --format json > all-categories.json
```

Save featured categories only:
```bash
bun run update:categories -- --operation list --featured --format json > featured-categories.json
```

### Safe Removal Check

Check if a category is in use without removing it:
```bash
bun run update:categories -- --operation remove --id "category-to-check"
# Review the usage list (mainCategory vs secondaryCategories)
# Press Ctrl+C or answer "no" when asked to confirm
```

The CLI will show:
- Which products use it as `mainCategory` (blocking)
- Which products use it in `secondaryCategories` (can force remove)

### Priority Management

Featured categories should use priorities strategically:
- **1**: Most valuable offering ("bundles")
- **2**: High-value services ("coaching")
- **3**: Community engagement ("community")
- **4**: Educational content ("courses")
- **5**: Core methodology ("knowledge-management")
- **6-7**: Supporting categories ("journaling", "obsidian")

Non-featured categories use 8-23:
- **8-12**: Common product types ("ai-mastery", "ai-tools", "content-creation")
- **13-20**: Specialized areas ("learning", "personal-development", "guides")
- **21-23**: Service types ("services", "workshops")

### Scripting Examples

**Add multiple categories from a script:**
```bash
#!/bin/bash
categories=(
    "automation-tools:Tools for automating workflows and tasks"
    "data-science:Data science and analytics resources"
)

for cat_info in "${categories[@]}"; do
    IFS=':' read -r name desc <<< "$cat_info"
    bun run update:categories -- --operation add \
        --name "$name" \
        --description "$desc" \
        --featured false \
        --priority 15
done
```

**Export featured categories for documentation:**
```bash
bun run update:categories -- --operation list --featured --format json | \
    jq '.[] | {id, name, description, priority}' > featured-categories-export.json
```

## Integration with Product Management

After creating or modifying categories, you can use them in products:

1. **Set mainCategory for a product**:
   ```bash
   # Edit product JSON file
   nano src/data/products/product-name.json

   # Set mainCategory
   "mainCategory": "new-category-id"

   # Validate
   bun run validate:products
   ```

2. **Add to secondaryCategories**:
   ```json
   "secondaryCategories": [
       { "id": "new-category-id", "distant": false },
       { "id": "existing-category", "distant": true }
   ]
   ```

3. **Validate relationships**:
   ```bash
   bun run validate:all
   ```

This ensures all category references are valid and products use only existing categories.

## Category vs Tag Differences

| Aspect | Categories | Tags |
|--------|-----------|------|
| **Structure** | Array (`[...]`) | Object/Map (`{...}`) |
| **Usage in Products** | mainCategory (required, 1) + secondaryCategories (optional, 0-N) | tags (required, 1-N) |
| **Removal Restriction** | ❌ Cannot remove if used as mainCategory | ⚠️  Can force remove even if used |
| **Color Validation** | Lenient (any CSS color) | Strict (must be hex #RRGGBB) |
| **Priority Range** | Featured: 1-7, Non-featured: 8-23 | Featured: 1-8, Non-featured: 21+ |
| **Count** | 23 categories | 96 tags |

Use categories for broad product organization and tags for detailed metadata and filtering.
