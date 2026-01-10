---
skill: manage-tags
description: Manage and validate tags with interactive CLI and schema validation
triggerKeywords: [tag, tags, add tag, edit tag, remove tag, validate tags, tag schema, tags.json, update tags]
---

# Tag Management Skill

## Overview

This skill helps you manage the tags used across all products in the store website. Tags are stored in a JSON file and validated against a Zod schema. The interactive CLI tool supports add, modify, remove, and list operations with both interactive and CLI argument modes.

## Tag Data Location

- **Configuration File**: `src/data/tags.json` (96 tags, object/map structure)
- **TypeScript Types**: `src/types/tag.ts`
- **Zod Schema**: `src/schemas/tag.schema.ts` (**source of truth**)
- **Validation Script**: `scripts/validate-tags.ts`
- **Update CLI**: `scripts/update-tags.ts`

## Schema Documentation

### Tag Structure

```typescript
{
    id: TagId              // enum - must match schema (96 valid values)
    name: string           // required, min 1 char
    description: string    // required, min 1 char
    icon: string           // optional - React icon name (e.g., "FaRobot", "FaTag")
    color: string          // optional - hex format #RRGGBB (e.g., "#FF6B6B")
    featured: boolean      // required
    priority: number       // required, min 1
}
```

### Required Fields

- **id**: Unique identifier (kebab-case, must be added to `TagIdSchema` enum)
- **name**: Display name for the tag
- **description**: Short description of what the tag represents
- **featured**: Whether the tag should appear in featured lists
- **priority**: Determines display order (lower = higher priority)

### Optional Fields

- **icon**: React icon component name from `react-icons` library
- **color**: Hex color code for visual styling (#RRGGBB format)

### Priority Guidelines

- **Featured tags**: 1-8 (lower number = higher priority)
  - 1-2: Core/most important tags (e.g., "obsidian", "pkm")
  - 3-5: Important supporting tags (e.g., "productivity", "ai")
  - 6-8: Less prominent featured tags
- **Non-featured tags**: 21+ (flexible ordering)
  - Use sequential numbers for consistency
  - Current range: 21-96

### Tag Usage in Products

Tags are referenced in products via the `tags` field:

```json
{
  "id": "product-id",
  "name": "Product Name",
  "tags": ["obsidian", "pkm", "templates", "productivity"],
  ...
}
```

- Each product must have at least 1 tag
- Tags are stored as an array of tag IDs
- All tag IDs must exist in `tags.json`

## Quick Update with Interactive CLI (Recommended)

### Interactive Mode

```bash
bun run update:tags
```

Follow the prompts to:
1. Select operation (list/add/modify/remove)
2. Enter tag details
3. Confirm changes
4. Update schema enum manually

### CLI Arguments Mode

**List all tags:**
```bash
bun run update:tags -- --operation list
```

**List featured tags only:**
```bash
bun run update:tags -- --operation list --featured
```

**List as JSON:**
```bash
bun run update:tags -- --operation list --format json
```

**Add tag (auto-generated ID):**
```bash
bun run update:tags -- --operation add \
    --name "Machine Learning" \
    --description "Machine learning and AI training resources" \
    --featured true \
    --priority 6 \
    --icon "FaRobot" \
    --color "#FF6B6B"
```

**Add tag (custom ID):**
```bash
bun run update:tags -- --operation add \
    --id "custom-ml-tag" \
    --name "Machine Learning" \
    --description "ML resources" \
    --featured false \
    --priority 50
```

**Modify tag:**
```bash
bun run update:tags -- --operation modify \
    --id "ai" \
    --description "Updated description for AI tag" \
    --priority 3
```

**Remove tag (will fail if used in products):**
```bash
bun run update:tags -- --operation remove --id "deprecated-tag"
```

**Force remove tag (even if used):**
```bash
bun run update:tags -- --operation remove --id "deprecated-tag" --force
```

## Complete Workflow Examples

### Adding a New Tag

**Interactive:**
```bash
bun run update:tags
# Select "2" or "add"
# Enter tag details when prompted
# ID is auto-suggested from name
# Confirm and save
```

**CLI:**
```bash
bun run update:tags -- --operation add \
    --name "Voice AI" \
    --description "Voice-based AI tools and speech recognition" \
    --featured false \
    --priority 45 \
    --icon "FaMicrophone" \
    --color "#4ECDC4"
```

**Then:**
1. Edit `src/schemas/tag.schema.ts`
2. Add `'voice-ai'` to the `TagIdSchema` enum array (keep alphabetical order)
3. Run `bun run validate:tags` to verify

### Modifying an Existing Tag

**Interactive:**
```bash
bun run update:tags
# Select "3" or "modify"
# Enter tag ID
# Update fields (press Enter to keep current value)
# Confirm and save
```

**CLI (update single field):**
```bash
bun run update:tags -- --operation modify \
    --id "obsidian" \
    --description "Master Obsidian for powerful note-taking and PKM"
```

**CLI (update multiple fields):**
```bash
bun run update:tags -- --operation modify \
    --id "productivity" \
    --featured true \
    --priority 4 \
    --color "#F7B801"
```

**Note**: Cannot modify the `id` field. To change an ID, you must remove and recreate the tag.

### Removing a Tag

**Interactive:**
```bash
bun run update:tags
# Select "4" or "remove"
# Enter tag ID
# Review usage warning
# Confirm removal
```

**CLI (safe removal):**
```bash
# Will fail if tag is used in products
bun run update:tags -- --operation remove --id "old-tag"
```

**CLI (force removal):**
```bash
# Removes even if used (⚠️  breaks product references!)
bun run update:tags -- --operation remove --id "old-tag" --force
```

**Then:**
1. Edit `src/schemas/tag.schema.ts`
2. Remove `'old-tag'` from the `TagIdSchema` enum array
3. Run `bun run validate:tags` to verify
4. If forced removal: update products to remove the tag reference

### Listing Tags

**Interactive:**
```bash
bun run update:tags
# Select "1" or "list"
# View table of all tags
```

**CLI (all tags, table format):**
```bash
bun run update:tags -- --operation list
```

**CLI (featured only):**
```bash
bun run update:tags -- --operation list --featured
```

**CLI (JSON format for scripting):**
```bash
bun run update:tags -- --operation list --format json
bun run update:tags -- --operation list --featured --format json > featured-tags.json
```

## Commands

### Update Tags
```bash
bun run update:tags
```

Interactive CLI tool for managing tags. Supports:
- `list`: View all tags with filtering
- `add`: Create new tags with validation
- `modify`: Update existing tags (except ID)
- `remove`: Delete tags with usage checking

### Validate Tags
```bash
bun run validate:tags
```

Validates:
- All tags in `tags.json` against Zod schema
- Product references (checks for orphaned tags in products)
- Displays summary with featured/non-featured counts
- Exit code 0 on success, 1 on failure

### Validate All
```bash
bun run validate:all
```

Validates tags along with categories, promotion, products, and all relationships.

## Important Notes

- The Zod schema in `src/schemas/tag.schema.ts` is the **source of truth**
- **TagIdSchema enum MUST be manually updated** after add/remove operations
- ID changes are not supported (must delete + recreate to change ID)
- Products must be updated before removing tags used in products
- Priority determines display order (featured first, then by priority)
- Color format: `#RRGGBB` (6-digit hex) - will fail validation if incorrect
- Icon names must be from `react-icons` library (e.g., `FaRobot`, `SiObsidian`)

## Schema Sync Process

**CRITICAL**: When adding or removing tags, the schema enum must be manually updated!

### After Adding a Tag

1. Use CLI to add tag to `tags.json` (creates the data entry)
2. Edit `src/schemas/tag.schema.ts`
3. Add the tag ID to the `TagIdSchema` enum array:

```typescript
export const TagIdSchema = z.enum([
    'ai',
    'ai-assistants',
    'automation',
    'new-tag-id',  // <-- Add your new tag ID here
    'obsidian',
    'pkm',
    // ... rest of tags (keep alphabetical order)
])
```

4. Run `bun run validate:tags` to verify the schema matches the data
5. TypeScript types will be automatically synced via type inference

### After Removing a Tag

1. Use CLI to remove tag from `tags.json`
2. Edit `src/schemas/tag.schema.ts`
3. Remove the tag ID from the `TagIdSchema` enum array
4. Run `bun run validate:tags` to verify
5. If you used `--force`: update products to remove the tag reference

### Why Manual Sync is Required

The schema enum defines **valid tag IDs** at the type level. This provides:
- Type safety in TypeScript
- Validation of product references
- Auto-completion in IDEs
- Compile-time checking

The data file (`tags.json`) and the schema must stay synchronized for validation to work correctly.

## Error Messages

Common validation errors and solutions:

### Tag Validation Errors

**❌ Tag with ID 'duplicate-id' already exists**
- **Solution**: Choose a different ID or modify the existing tag

**❌ Tag: "invalid-color"**
- **Error**: `color: Color must be hex format (#RRGGBB)`
- **Solution**: Use format `#FF6B6B` (6 hex digits with # prefix)

**❌ Tag: "bad-priority"**
- **Error**: `priority: Number must be greater than or equal to 1`
- **Solution**: Use priority 1-8 for featured, 21+ for non-featured

**❌ Tag: "empty-name"**
- **Error**: `name: Tag name is required`
- **Solution**: Provide a non-empty name

**❌ Tag: "empty-description"**
- **Error**: `description: Tag description is required`
- **Solution**: Provide a non-empty description

### Removal Errors

**❌ Tag with ID 'some-tag' not found**
- **Solution**: Check the tag ID spelling, use `--operation list` to see all tags

**❌ Cannot remove tag that is in use**
- **Found usage in 3 product(s):**
  - `product-id-1 (Product Name 1)`
  - `product-id-2 (Product Name 2)`
- **Solution**: Remove tag from products first, or use `--force` flag

### Schema Sync Errors

After adding a tag, if validation fails:

**❌ Error: Tag ID 'new-tag' is not in the schema enum**
- **Solution**: Add `'new-tag'` to `TagIdSchema` in `src/schemas/tag.schema.ts`

## Advanced Usage

### Batch Viewing

Save all tags to a file:
```bash
bun run update:tags -- --operation list --format json > all-tags.json
```

Save featured tags only:
```bash
bun run update:tags -- --operation list --featured --format json > featured-tags.json
```

### Safe Removal Check

Check if a tag is in use without removing it:
```bash
bun run update:tags -- --operation remove --id "tag-to-check"
# Review the usage list
# Press Ctrl+C or answer "no" when asked to confirm
```

The CLI will show all products using the tag before asking for confirmation.

### Priority Management

Featured tags should use priorities strategically:
- **1**: Most important tag (typically "obsidian" for this store)
- **2-3**: Core concepts ("pkm", "productivity", "knowledge-management")
- **4-6**: Supporting concepts ("ai", "journaling", "learning")
- **7-8**: Less prominent but still featured

Non-featured tags use 21+:
- No strict ordering required
- Can use sequential numbers (21, 22, 23, ...)
- Or group by type (AI tags: 21-30, workflow tags: 31-40, etc.)

### Scripting Examples

**Add multiple tags from a script:**
```bash
#!/bin/bash
tags=("tag1:Description 1" "tag2:Description 2" "tag3:Description 3")

for tag_info in "${tags[@]}"; do
    IFS=':' read -r name desc <<< "$tag_info"
    bun run update:tags -- --operation add \
        --name "$name" \
        --description "$desc" \
        --featured false \
        --priority 50
done
```

**Export featured tags for documentation:**
```bash
bun run update:tags -- --operation list --featured --format json | \
    jq '.[] | {id, name, description}' > featured-tags-export.json
```

## Integration with Product Management

After creating or modifying tags, you can use them in products:

1. **Add tag to existing product**:
   ```bash
   # Edit product JSON file
   nano src/data/products/product-name.json

   # Add tag to tags array
   "tags": ["existing-tag", "new-tag-id"]

   # Validate
   bun run validate:products
   ```

2. **Create new product with tags**:
   Use the manage-products skill to create products and reference your tags

3. **Validate relationships**:
   ```bash
   bun run validate:all
   ```

This ensures all tag references are valid and products use only existing tags.
