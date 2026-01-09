# Implementation Plan: Interactive Product Management CLI

## Overview

Create an interactive CLI tool to manage products (add/edit/remove) with keyboard-navigable multi-select interfaces for tags and categories. The CLI will support both interactive prompts and CLI arguments, following the patterns established by `update-tags.ts` and `update-categories.ts`.

## Key Requirements

1. **Operations**: list, add, edit, remove
2. **Dual-mode**: Interactive prompts + CLI arguments
3. **Keyboard-navigable multi-select** for tags and categories
4. **Visual feedback**: Show all available options with selected items highlighted
5. **Adapt manage-products.md skill** to reference the new CLI

## Critical Design Decision: Interactive Multi-Select Library

### Problem

Products have complex tag/category selection:

- **Tags**: Select multiple from 82 available tags
- **Main Category**: Select one from 23 categories
- **Secondary Categories**: Select multiple from 23 categories, each with optional "distant" flag

Basic readline prompts (used in update-tags.ts/update-categories.ts) are insufficient for:

- Showing all available options simultaneously
- Keyboard navigation (arrow keys)
- Multi-select with visual feedback
- Managing complex selections

### Recommended Solution: Add `inquirer` Dependency

**Library**: [`inquirer`](https://www.npmjs.com/package/inquirer) - Industry-standard CLI interaction library

**Why inquirer**:

- Battle-tested (50M+ downloads/week)
- Built-in multi-select with keyboard navigation
- Checkbox lists with space to toggle, enter to confirm
- Arrow key navigation
- Search/filter capabilities
- TypeScript support
- Zero additional dependencies for our use case

**Alternative**: Custom implementation with readline + ANSI codes

- **Pros**: No new dependency
- **Cons**: Complex (~500+ lines), error-prone, terminal compatibility issues, maintenance burden

**Recommendation**: Use inquirer for robustness and maintainability

## Product Schema Overview

**Total Fields**: ~50 fields organized into:

- Identity (5): id, permalink, name, tagline, secondaryTagline
- Pricing (6): price, priceDisplay, priceTier, gumroadUrl, variants
- Taxonomy (3): mainCategory, secondaryCategories, tags
- Marketing Copy (9): problem, problemPoints, agitate, agitatePoints, solution, solutionPoints
- Content (8): description, features, benefits, included, testimonialIds, faqIds, targetAudience, perfectFor, notForYou
- Media (5): coverImage, screenshots, videoUrl, demoUrl
- Meta/Status (8): featured, mostValue, bestseller, status, priority, trustBadges, guarantees, crossSellIds
- Links (2): landingPageUrl, dsebastienUrl
- SEO (3): metaTitle, metaDescription, keywords

**Complexity**: Products are complex; interactive editing should focus on frequently changed fields

## Operations Design

### 1. List Operation

**Purpose**: View all products with filtering and formatting

**Interactive Mode**:

```
📦 Product Management Tool - List Operation

Filter by:
  1. All products (18)
  2. Featured products only
  3. By status (active/coming-soon/archived)
  4. By category
  5. By tag

Sort by:
  1. Priority (default)
  2. Name (alphabetical)
  3. Price
  4. Status

Output format:
  1. Table (default)
  2. JSON
  3. Detailed view
```

**CLI Mode**:

```bash
npm run update:products -- --operation list [--featured] [--status active] [--category guides] [--tag ai] [--format json|table|detailed]
```

**Output** (table format):

```
ID                          Name                           Category             Status    Priority  Featured
---------------------------------------------------------------------------------------------------------
everything-knowledge-bundle Everything Knowledge Bundle    bundles              active    100       ✓
knowledge-worker-kit        Knowledge Worker Kit           kits-and-templates   active    90        ✓
obsidian-starter-kit        Obsidian Starter Kit          kits-and-templates   active    85        ✓
...
```

### 2. Add Operation

**Purpose**: Create a new product with guided prompts

**Interactive Mode** (Progressive Disclosure):

**Step 1: Basic Information**

```
📦 Product Management Tool - Add Operation

=== STEP 1/5: Basic Information ===

Product Name (required): My New Product
Suggested ID: my-new-product
Product ID [my-new-product]:

Tagline (required): One-line description
Secondary Tagline (optional):

Permalink (Gumroad code, required): abc123
```

**Step 2: Pricing**

```
=== STEP 2/5: Pricing ===

Price in EUR (required): 49.99
Price Display (required) [€49.99]:

Price Tier (required):
❯ 1. free
  2. budget
  3. standard
  4. premium
  5. enterprise
  6. subscription

Gumroad URL (required): https://store.dsebastien.net/l/abc123
```

**Step 3: Taxonomy** (KEY FEATURE - Keyboard Navigation)

```
=== STEP 3/5: Taxonomy ===

Main Category (required) - Select one:
❯ ◯ ai-mastery
  ◯ ai-tools
  ◯ bundles
  ◯ coaching
  ...
[Use arrow keys, Enter to select]

Secondary Categories (optional) - Select multiple:
  ◯ ai-mastery
  ◯ ai-tools
❯ ◉ bundles        [selected]
  ◉ coaching       [selected]
  ◯ community
[Use arrow keys, Space to toggle, Enter to confirm]

Mark selected as "distant" (loosely related)?
❯ ◉ bundles
  ◯ coaching
[Space to toggle, Enter to confirm]

Tags (required, select at least 1) - Multi-select with search:
[Type to filter, then arrow keys + space to select]

Filtered tags (showing 82):
  ◯ ai
  ◯ ai-assistants
  ◯ automation
❯ ◉ obsidian       [selected]
  ◉ pkm            [selected]
  ◉ productivity   [selected]
  ◯ templates
[Selected: 3 tags]
```

**Step 4: Marketing Copy** (Simplified for CLI)

```
=== STEP 4/5: Marketing Copy ===

Problem Description (required):
> Enter problem statement (press Ctrl+D when done):
[Multi-line input]

Problem Points (required, enter at least 1):
1. First problem point:
2. Second problem point (or Enter to skip):

Agitation Description (required):
> [Multi-line input]

Agitation Points (required):
[Same pattern]

Solution Description (required):
> [Multi-line input]

Solution Points (required):
[Same pattern]
```

**Step 5: Review & Confirm**

```
=== STEP 5/5: Review ===

📊 New Product Summary:
   ID: my-new-product
   Name: My New Product
   Tagline: One-line description
   Price: €49.99 (standard)
   Main Category: guides
   Secondary Categories: 2 (coaching, bundles [distant])
   Tags: 3 (obsidian, pkm, productivity)

   Status: active
   Priority: 50
   Featured: false

Confirm and save? [yes/no]: yes

✅ Product created at: src/data/products/my-new-product.json

Next steps:
  1. Run: npm run validate:products
  2. Add marketing copy details by editing the file directly
  3. Add media (coverImage, screenshots, videoUrl)
  4. Test locally: npm run dev
```

**CLI Mode** (Essential fields only):

```bash
npm run update:products -- --operation add \
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

### 3. Edit Operation

**Purpose**: Modify existing product

**Interactive Mode**:

```
📦 Product Management Tool - Edit Operation

Select product to edit:
❯ 1. everything-knowledge-bundle (Everything Knowledge Bundle)
  2. knowledge-worker-kit (Knowledge Worker Kit)
  3. obsidian-starter-kit (Obsidian Starter Kit)
[Type to search, arrow keys to navigate]

Or enter product ID: obsidian-starter-kit

Current Product: obsidian-starter-kit

What would you like to edit?
❯ 1. Basic info (name, tagline, description)
  2. Pricing (price, tier, variants)
  3. Taxonomy (categories, tags)
  4. Marketing copy (problem/agitate/solution)
  5. Media (images, videos)
  6. Meta/Status (featured, priority, status)
  7. All fields (expert mode)
  8. Review current values
  9. Save and exit

[Select 3. Taxonomy]

=== Edit Taxonomy ===

Current:
  Main Category: kits-and-templates
  Secondary: 4 categories (obsidian, knowledge-management [distant], productivity [distant], journaling)
  Tags: 6 tags (obsidian, pkm, templates, productivity, zettelkasten, para)

1. Edit Main Category
2. Edit Secondary Categories
3. Edit Tags
4. Back

[Select 3. Edit Tags]

Tags (current: 6 selected) - Multi-select:
❯ ◉ obsidian       [currently selected]
  ◉ pkm            [currently selected]
  ◉ productivity   [currently selected]
  ◉ templates      [currently selected]
  ◯ journaling
  ◯ note-taking
[Space to toggle, Enter to confirm, showing 82 total]

Confirm changes? [yes/no]: yes
✅ Tags updated!

Run validation? [yes/no]: yes
[Runs: npm run validate:products]
```

**CLI Mode**:

```bash
# Edit specific fields
npm run update:products -- --operation edit \
    --id obsidian-starter-kit \
    --name "New Name" \
    --price 39.99 \
    --priority 95

# Edit tags (comma-separated, replaces all)
npm run update:products -- --operation edit \
    --id obsidian-starter-kit \
    --tags "obsidian,pkm,templates,productivity"

# Edit secondary categories
npm run update:products -- --operation edit \
    --id obsidian-starter-kit \
    --secondaryCategories "obsidian:false,knowledge-management:true"
    # Format: category-id:distant-flag
```

### 4. Remove Operation

**Purpose**: Delete product file

**Interactive Mode**:

```
📦 Product Management Tool - Remove Operation

Select product to remove:
❯ 1. old-product (Old Product Name)
[Type to search, arrow keys to navigate]

Or enter product ID: old-product

Product to remove:
  ID: old-product
  Name: Old Product Name
  Status: archived
  File: src/data/products/old-product.json

⚠️  Checking cross-references...

Found references:
  Cross-sell references (2 products reference this):
    • knowledge-worker-kit (Knowledge Worker Kit)
    • pkm-coaching (PKM Coaching)

❌ Cannot remove product that is referenced in crossSellIds of other products.
   Update those products first, or use --force flag.

Confirm removal? [yes/no]:

[If yes, removes file and displays:]
✅ Product removed: src/data/products/old-product.json
⚠️  IMPORTANT: Run validation to check for broken references:
   npm run validate:products
```

**CLI Mode**:

```bash
# Remove product
npm run update:products -- --operation remove --id old-product

# Force remove (even if referenced)
npm run update:products -- --operation remove --id old-product --force
```

## Technical Implementation

### File Structure

**Create**: `scripts/update-products.ts`

**Dependencies**:

```json
{
    "devDependencies": {
        "inquirer": "^9.2.0" // or latest v9.x
    }
}
```

### Core Architecture

```typescript
#!/usr/bin/env tsx

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { resolve, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import inquirer from 'inquirer'
import { ProductSchema } from '../src/schemas/product.schema.js'
import type { Product, ProductCategory, TagId } from '../src/types/product'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_DIR = resolve(__dirname, '../src/data/products')
const TAGS_FILE = resolve(__dirname, '../src/data/tags.json')
const CATEGORIES_FILE = resolve(__dirname, '../src/data/categories.json')

interface CliArgs {
    operation?: 'list' | 'add' | 'edit' | 'remove'
    id?: string
    name?: string
    tagline?: string
    price?: string
    priceTier?: string
    mainCategory?: string
    tags?: string  // comma-separated
    secondaryCategories?: string  // format: "id:distant,id:distant"
    featured?: string
    priority?: string
    status?: string
    force?: boolean
    format?: 'json' | 'table' | 'detailed'
}

// Key Functions:
- parseArgs(): CliArgs
- loadAllProducts(): Product[]
- loadProduct(id: string): Product
- saveProduct(product: Product): void
- removeProduct(id: string): void
- loadTags(): Map<string, Tag>
- loadCategories(): Category[]
- validateProduct(product: Product): { success: boolean; errors: string[] }
- checkCrossReferences(productId: string): ProductReference[]

// Interactive Selection Functions (using inquirer):
- selectMainCategory(current?: string): Promise<string>
- selectSecondaryCategories(current?: SecondaryCategory[]): Promise<SecondaryCategory[]>
- selectTags(current?: string[]): Promise<string[]>
- selectProduct(prompt: string): Promise<string>
- confirmAction(message: string): Promise<boolean>

// Operation Functions:
- operationList(args: CliArgs): Promise<void>
- operationAdd(args: CliArgs): Promise<void>
- operationEdit(args: CliArgs): Promise<void>
- operationRemove(args: CliArgs): Promise<void>

// Mode Functions:
- interactiveMode(): Promise<void>
- cliMode(args: CliArgs): Promise<void>
```

### Inquirer Integration Examples

**Main Category Selection** (single choice):

```typescript
async function selectMainCategory(current?: string): Promise<string> {
    const categories = loadCategories()

    const choices = categories.map((cat) => ({
        name: `${cat.name} (${cat.id})${cat.featured ? ' ★' : ''}`,
        value: cat.id,
        checked: cat.id === current
    }))

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'category',
            message: 'Select main category:',
            choices,
            default: current,
            pageSize: 15
        }
    ])

    return answer.category
}
```

**Tag Selection** (multi-select with search):

```typescript
async function selectTags(current: string[] = []): Promise<string[]> {
    const tags = loadTags()
    const tagArray = Object.values(tags).sort((a, b) => a.priority - b.priority)

    const choices = tagArray.map((tag) => ({
        name: `${tag.name} (${tag.id})${tag.featured ? ' ★' : ''}`,
        value: tag.id,
        checked: current.includes(tag.id)
    }))

    const answer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'tags',
            message: 'Select tags (space to toggle, enter to confirm):',
            choices,
            pageSize: 20,
            validate: (input) => {
                if (input.length === 0) {
                    return 'Please select at least one tag'
                }
                return true
            }
        }
    ])

    return answer.tags
}
```

**Secondary Categories with Distant Flag**:

```typescript
async function selectSecondaryCategories(
    current: SecondaryCategory[] = []
): Promise<SecondaryCategory[]> {
    const categories = loadCategories()
    const currentIds = current.map((c) => c.id)

    // Step 1: Select which categories
    const choices = categories.map((cat) => ({
        name: `${cat.name} (${cat.id})`,
        value: cat.id,
        checked: currentIds.includes(cat.id)
    }))

    const selectedAnswer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'categories',
            message: 'Select secondary categories:',
            choices,
            pageSize: 15
        }
    ])

    if (selectedAnswer.categories.length === 0) {
        return []
    }

    // Step 2: Mark which ones are "distant"
    const distantChoices = selectedAnswer.categories.map((id) => {
        const existingItem = current.find((c) => c.id === id)
        return {
            name: categories.find((c) => c.id === id)?.name || id,
            value: id,
            checked: existingItem?.distant === true
        }
    })

    const distantAnswer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'distant',
            message: 'Mark which categories are "distant" (loosely related):',
            choices: distantChoices
        }
    ])

    return selectedAnswer.categories.map((id) => ({
        id,
        distant: distantAnswer.distant.includes(id)
    }))
}
```

## Workflow Simplifications

Given product complexity (~50 fields), the CLI should:

### Add Operation

**Required fields for minimal product**:

- Identity: id, name, tagline, permalink
- Pricing: price, priceDisplay, priceTier, gumroadUrl
- Taxonomy: mainCategory, tags (min 1)
- Marketing: problem, agitate, solution

**Optional/Advanced fields** (edit file manually after creation):

- Detailed marketing points (problemPoints, agitatePoints, solutionPoints)
- Content (description, features, benefits, included, etc.)
- Media (coverImage, screenshots, videoUrl, demoUrl)
- Cross-references (testimonialIds, faqIds, crossSellIds)
- SEO (metaTitle, metaDescription, keywords)

**CLI Strategy**:

1. Create minimal viable product via CLI
2. Display message to edit file for advanced fields
3. Provide file path and validation command

### Edit Operation

**Grouped editing by category**:

- Basic info
- Pricing
- Taxonomy (categories/tags)
- Marketing copy
- Media
- Meta/Status
- All fields (expert mode)

**CLI Strategy**:

- Allow editing any field via arguments
- Interactive mode focuses on common edits (taxonomy, pricing, status)

## File Modifications

### 1. Create `scripts/update-products.ts`

Estimated size: ~1200-1500 lines (comprehensive with all operations)

### 2. Update `package.json`

```json
{
    "scripts": {
        "update:products": "tsx scripts/update-products.ts"
    },
    "devDependencies": {
        "inquirer": "^9.2.0"
    }
}
```

### 3. Update `.claude/skills/manage-products.md`

**Changes needed**:

- Add "Quick Update with Interactive CLI" section at the top
- Show CLI command examples for all operations
- Keep detailed schema documentation as reference
- Add "When to use CLI vs. Direct Editing" section
- Update commands section to include new CLI
- Preserve validation workflow

**New Structure**:

```markdown
---
skill: manage-products
description: Manage and validate products with interactive CLI and schema validation
triggerKeywords: [product, products, add product, edit product, validate products, products.json]
---

# Product Management Skill

## Product Data Location

[Existing content]

## Quick Update with Interactive CLI (Recommended)

### Interactive Mode

npm run update:products

### CLI Arguments Mode

[Add comprehensive examples for list/add/edit/remove]

## When to Use CLI vs. Direct Editing

**Use CLI for**:

- Adding new products (creates structure)
- Editing taxonomy (categories/tags with visual selection)
- Changing pricing/status/priority
- Quick updates to common fields

**Use Direct Editing for**:

- Complex marketing copy (problem/agitate/solution points)
- Adding detailed content (features, benefits, included)
- Media management (images, videos)
- Cross-references (testimonials, FAQs, cross-sells)
- SEO metadata

## Schema Documentation

[Preserve existing detailed schema docs]

## Validation Workflow

[Preserve existing workflow]

## Common Tasks

[Update to reference CLI first, then direct editing]
```

### 4. Update `AGENTS.md`

Add section after "Managing Categories":

````markdown
## Managing Products

Products are managed as individual JSON files with comprehensive metadata. An interactive CLI tool simplifies adding and editing products, especially for taxonomy management.

### Product Data Location

[Content similar to skill]

### Product Management Workflow

**Quick Update (Recommended):**

Use the interactive CLI tool:

```bash
# Interactive mode
npm run update:products

# List products
npm run update:products -- --operation list

# Add product (guided prompts)
npm run update:products -- --operation add

# Edit product
npm run update:products -- --operation edit --id product-id
```
````

**Manual Workflow:**
[Keep existing workflow]

```

## Testing Strategy

### Critical Test Cases

**List Operation**:
- ✓ List all products
- ✓ Filter by featured
- ✓ Filter by status
- ✓ Filter by category
- ✓ Filter by tag
- ✓ JSON output
- ✓ Table output

**Add Operation**:
- ✓ Minimal product (required fields only)
- ✓ With optional fields
- ✓ ID auto-generation
- ✓ ID uniqueness check
- ✗ Duplicate ID (should fail)
- ✗ Invalid category/tag (should fail)
- ✓ Multi-select tags with keyboard nav
- ✓ Secondary categories with distant flag

**Edit Operation**:
- ✓ Single field update
- ✓ Multiple fields update
- ✓ Edit tags (add/remove with multi-select)
- ✓ Edit categories with keyboard nav
- ✗ Non-existent product (should fail)
- ✓ Keep existing values option

**Remove Operation**:
- ✓ Remove unused product
- ✗ Remove referenced product without --force (should fail)
- ⚠️  Remove referenced product with --force (should warn)
- ✓ File deletion confirmation

**Keyboard Navigation**:
- ✓ Arrow keys navigate lists
- ✓ Space toggles selection in multi-select
- ✓ Enter confirms selection
- ✓ Type-to-search in inquirer
- ✓ Visual feedback for selected items

## Implementation Sequence

### Phase 1: Setup (Priority 1)
1. Add inquirer dependency
2. Create script skeleton
3. Implement argument parsing
4. Implement product load/save functions
5. Test basic file operations

### Phase 2: List Operation (Priority 2)
1. Implement list with filters
2. Table formatting
3. JSON output
4. Test filtering and display

### Phase 3: Selection Helpers (Priority 3)
1. Implement main category selector (inquirer list)
2. Implement tag multi-selector (inquirer checkbox)
3. Implement secondary categories selector (two-step: select + mark distant)
4. Test keyboard navigation

### Phase 4: Add Operation (Priority 4)
1. Interactive mode with progressive disclosure
2. CLI mode with required fields
3. Validation before save
4. Test minimal product creation

### Phase 5: Edit Operation (Priority 5)
1. Product selection interface
2. Field group editing
3. Taxonomy editing with visual selection
4. CLI mode for specific fields
5. Test editing workflows

### Phase 6: Remove Operation (Priority 6)
1. Product selection
2. Cross-reference checking
3. Confirmation prompt
4. File deletion
5. Test removal with/without references

### Phase 7: Documentation (Priority 7)
1. Update manage-products.md skill
2. Update AGENTS.md
3. Add usage examples
4. Test skill trigger keywords

### Phase 8: Testing (Priority 8)
1. End-to-end workflows
2. Edge cases
3. Keyboard navigation
4. Error handling

## Verification Steps

After implementation:
1. ✅ `npm run update:products` launches interactive mode
2. ✅ List operation with all filters works
3. ✅ Add operation creates valid products
4. ✅ Edit operation with keyboard-navigable tag/category selection works
5. ✅ Remove operation checks cross-references
6. ✅ CLI arguments mode works for all operations
7. ✅ Keyboard navigation (arrows, space, enter) works smoothly
8. ✅ Visual feedback for selections is clear
9. ✅ Validation prevents invalid products
10. ✅ Skill documentation updated and accurate

## Key Implementation Notes

### Inquirer Best Practices
- Use `type: 'list'` for single select (main category)
- Use `type: 'checkbox'` for multi-select (tags, secondary categories)
- Set `pageSize` for long lists (15-20 items)
- Provide clear messages and hints
- Use `validate` functions for required selections

### Product File Management
- Individual files are source of truth
- products.json is auto-generated (don't edit directly)
- Always validate after changes
- Use kebab-case for product IDs

### Complex Field Handling
- Marketing copy: Show simplified input in CLI, suggest manual editing for detailed points
- Arrays (features, benefits): Collect incrementally or suggest manual editing
- Cross-references: List available IDs, allow comma-separated input

### Error Handling
- Schema validation before save
- Category/tag ID validation against enums
- Duplicate ID checking
- Cross-reference validation
- File operation error handling

## Dependencies

**New**:
- `inquirer` ^9.2.0 - Interactive CLI prompts with keyboard navigation

**Existing**:
- `fs`, `path` - File operations
- `zod` - Schema validation
- `tsx` - TypeScript execution

## Notes for User

- Inquirer provides professional keyboard-navigable interfaces
- Alternative: Custom implementation (~500 lines) but less robust
- CLI handles common operations, direct editing still needed for complex fields
- Existing validation scripts remain unchanged
```
