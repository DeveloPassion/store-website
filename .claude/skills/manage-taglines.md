---
skill: manage-taglines
description: Manage and validate homepage taglines with interactive CLI and schema validation
triggerKeywords: [tagline, taglines, add tagline, edit tagline, remove tagline, validate taglines, tagline schema, taglines.json, update taglines, homepage subtitle]
---

# Tagline Management Skill

## Overview

This skill helps you manage the taglines displayed on the store website homepage. Taglines are motivational/descriptive phrases that rotate on the homepage subtitle. They are stored in a JSON file and validated against a Zod schema. The interactive CLI tool supports add, edit, remove, list, and toggle-featured operations with both interactive and CLI argument modes.

## Tagline Data Location

- **Configuration File**: `src/data/taglines.json` (60+ taglines, array structure)
- **TypeScript Types**: `src/types/tagline.ts`
- **Zod Schema**: `src/schemas/tagline.schema.ts` (**source of truth**)
- **Validation Script**: `scripts/validate-taglines.ts`
- **Update CLI**: `scripts/update-taglines.ts`
- **Utility Functions**: `src/lib/tagline-utils.ts`

## How Taglines Work

- Homepage displays a **random tagline** on each page load
- The tagline changes every time a visitor opens or refreshes the page
- **Weighted selection**: Featured taglines appear **at least 25%** of the time
  - 25% guaranteed featured tagline
  - 75% random from all taglines (could be featured or non-featured)
  - This ensures featured taglines show up regularly while maintaining variety
- Selection is truly random (not seeded)

## Schema Documentation

### Tagline Structure

```typescript
{
    id: string              // unique identifier (e.g., "action-1", "problem-5")
    text: string            // tagline text (1-200 characters)
    category: TaglineCategory  // one of 6 categories
    featured: boolean       // whether to show on homepage
}
```

### Required Fields

- **id**: Unique identifier (kebab-case, e.g., "transformation-3")
- **text**: The tagline text (max 200 characters)
- **category**: Category classification (see categories below)
- **featured**: Whether this tagline can appear on homepage

### Tagline Categories

Six categories for organizing taglines by messaging strategy:

1. **default**: General value propositions
   - Example: "Courses, Systems & Tools for Knowledge Workers and Creators"

2. **problem-focused**: Highlighting pain points
   - Example: "Escape Information Overload. Build Systems That Scale."

3. **transformation-focused**: Before → After messaging
   - Example: "From Chaotic Hustler to Systematic Creator"

4. **outcome-focused**: Results & benefits
   - Example: "Consistent Output. Sustainable Revenue. Creative Freedom."

5. **identity-focused**: Who they become
   - Example: "For Creators Who Build Systems, Not Just Content"

6. **action-focused**: Direct & compelling
   - Example: "Stop Hustling. Start Systematizing."

### Featured Status Guidelines

- **Featured (true)**: Guaranteed to appear at least 25% of the time
  - Use for strongest, most compelling taglines
  - Should be broadly applicable
  - These are your "hero" messages that must show regularly
  - Current count: ~6 featured taglines

- **Non-featured (false)**: Part of the general rotation (75% pool)
  - Provides variety and diversity
  - Good for testing new messaging
  - More experimental or niche messaging
  - Still visible to visitors, just not guaranteed minimum frequency

## Quick Update with Interactive CLI (Recommended)

### Interactive Mode

```bash
bun run update:taglines
```

Features:
- **Arrow-key navigation**: Navigate menus using ↑/↓ arrow keys
- **Interactive prompts**: Text input with validation
- **Visual menus**: Clear options with descriptions
- **Easy to use**: No need to remember command syntax

Operations available:
1. List all taglines (grouped by category)
2. Add a new tagline (with validation)
3. Edit a tagline (update any field)
4. Remove a tagline (with confirmation)
5. Toggle featured status (quick toggle)

### CLI Arguments Mode

**List all taglines:**
```bash
bun run update:taglines -- --operation list
```

**Add tagline:**
```bash
bun run update:taglines -- --operation add \
    --id "custom-1" \
    --text "Build Your Creator Operating System" \
    --category "outcome-focused" \
    --featured false
```

**Edit tagline:**
```bash
bun run update:taglines -- --operation edit \
    --id "action-1" \
    --text "Updated tagline text"
```

**Remove tagline:**
```bash
bun run update:taglines -- --operation remove --id "custom-1"
```

**Toggle featured status:**
```bash
bun run update:taglines -- --operation toggle-featured --id "action-1"
```

## Complete Workflow Examples

### Adding a New Tagline

**Interactive:**
```bash
bun run update:taglines
# Select "2" (Add a new tagline)
# Enter ID, text, category
# Choose featured status
# Confirm and save
```

**CLI:**
```bash
bun run update:taglines -- --operation add \
    --id "transformation-11" \
    --text "From Mental Overload to Mental Clarity" \
    --category "transformation-focused" \
    --featured false
```

**Then:**
```bash
bun run validate:taglines    # Verify the new tagline
bun run build                # Rebuild to see it in action (if featured)
```

### Editing an Existing Tagline

**Interactive:**
```bash
bun run update:taglines
# Select "3" (Edit a tagline)
# Enter tagline ID
# Update fields (press Enter to keep current value)
# Confirm and save
```

**CLI (update text only):**
```bash
bun run update:taglines -- --operation edit \
    --id "default-1" \
    --text "Professional Courses, Systems & Tools for Knowledge Workers"
```

**CLI (update multiple fields):**
```bash
bun run update:taglines -- --operation edit \
    --id "action-5" \
    --text "Stop Guessing. Build Systems That Work." \
    --category "action-focused"
```

**Note**: You can edit any field except the `id`. To change an ID, you must remove and recreate the tagline.

### Removing a Tagline

**Interactive:**
```bash
bun run update:taglines
# Select "4" (Remove a tagline)
# Enter tagline ID
# Review details
# Confirm removal
```

**CLI:**
```bash
bun run update:taglines -- --operation remove --id "old-tagline"
```

### Toggling Featured Status

Featured status determines whether a tagline appears in the homepage rotation.

**Interactive:**
```bash
bun run update:taglines
# Select "5" (Toggle featured status)
# Enter tagline ID
# Status automatically toggles
```

**CLI:**
```bash
bun run update:taglines -- --operation toggle-featured --id "action-2"
```

### Listing Taglines

**Interactive:**
```bash
bun run update:taglines
# Select "1" (List all taglines)
# View grouped by category
```

**CLI:**
```bash
bun run update:taglines -- --operation list
```

## Commands

### Update Taglines
```bash
bun run update:taglines
```

Interactive CLI tool for managing taglines. Supports:
- `list`: View all taglines grouped by category
- `add`: Create new taglines with validation
- `edit`: Update existing taglines (except ID)
- `remove`: Delete taglines
- `toggle-featured`: Toggle featured status

### Validate Taglines
```bash
bun run validate:taglines
```

Validates:
- All taglines in `taglines.json` against Zod schema
- No duplicate IDs
- Text length (1-200 characters)
- Valid categories
- Displays summary with counts by category
- Exit code 0 on success, 1 on failure

### Validate All
```bash
bun run validate:all
```

Validates taglines along with categories, tags, promotion, products, and all relationships.

## Important Notes

- The Zod schema in `src/schemas/tagline.schema.ts` is the **source of truth**
- ID changes are not supported (must delete + recreate to change ID)
- Text is limited to 200 characters for readability
- Categories are fixed in the schema (6 options)
- Featured taglines appear at least 25% of the time
- Selection happens client-side on each page load

## Tagline Selection Logic

### Client-Side Weighted Random Selection

Homepage tagline is selected on each page load using:
```typescript
const tagline = getWeightedRandomTagline(taglines, 0.25)
```

**Selection algorithm:**
1. 25% of the time: guaranteed to select from featured taglines only
2. 75% of the time: select from ALL taglines (both featured and non-featured)

**This means:**
- **Featured taglines**: Appear AT LEAST 25% of the time (could be higher)
- **Non-featured taglines**: Appear in the 75% pool
- **Random**: Different tagline on each page load/refresh
- **Client-side**: Selection happens in the browser
- **Variety**: Visitors see diverse taglines throughout their browsing session

### Testing Taglines

**To test a new featured tagline:**
1. Add tagline with `featured: true`
2. Run `bun run build`
3. Run `bun run preview`
4. Refresh the homepage multiple times to see it in rotation

**To A/B test taglines:**
1. Create multiple featured taglines
2. They will rotate randomly on each page load
3. Monitor engagement/conversion over time
4. Visitors will see variety during their session

## Error Messages

Common validation errors and solutions:

### Tagline Validation Errors

**❌ Tagline with ID 'duplicate-id' already exists**
- **Solution**: Choose a different ID or edit the existing tagline

**❌ Tagline: "invalid-category"**
- **Error**: `category: Invalid enum value`
- **Solution**: Use one of: default, problem-focused, transformation-focused, outcome-focused, identity-focused, action-focused

**❌ Tagline: "too-long"**
- **Error**: `text: Tagline text too long`
- **Solution**: Keep text under 200 characters

**❌ Tagline: "empty-text"**
- **Error**: `text: Tagline text is required`
- **Solution**: Provide non-empty text

**❌ Duplicate tagline ID(s) found**
- **Solution**: Each tagline must have a unique ID

## Advanced Usage

### Writing Effective Taglines

**Problem-Focused** (highlight pain):
- Pattern: "Stop [problem]. Start [solution]."
- Example: "End the Feast-Famine Revenue Cycle"

**Transformation-Focused** (before/after):
- Pattern: "From [bad state] to [good state]"
- Example: "From Scattered Tools to Integrated Success"

**Outcome-Focused** (results):
- Pattern: "[Benefit]. [Benefit]. [Benefit]."
- Example: "Consistent Output. Sustainable Revenue. Creative Freedom."

**Identity-Focused** (who they are):
- Pattern: "For [target] Who [distinguishing trait]"
- Example: "For Creators Who Build Systems, Not Just Content"

**Action-Focused** (direct):
- Pattern: "[Imperative verb] [object]"
- Example: "Build Your Creator Operating System"

### Featured Tagline Strategy

Keep 4-8 featured taglines for variety:
- 2-3 from top-performing categories
- 1-2 experimental/new messages
- Balance different tones (problem vs. outcome vs. action)

Rotate taglines in/out of featured based on:
- Conversion data
- User feedback
- Seasonal relevance
- Product launches

### Category Distribution

Current distribution (60 taglines):
- Default: 4 taglines
- Problem-focused: 10 taglines
- Transformation-focused: 10 taglines
- Outcome-focused: 10 taglines
- Identity-focused: 10 taglines
- Action-focused: 10 taglines

Maintain balanced representation across categories.

## Utility Functions

Available in `src/lib/tagline-utils.ts`:

```typescript
// Get random tagline (with optional seed)
getRandomTagline(taglines, seed?)

// Get only featured taglines
getFeaturedTaglines(taglines)

// Filter by category
getTaglinesByCategory(taglines, category)

// Get random featured tagline
getRandomFeaturedTagline(taglines, seed?)

// Get weighted random tagline (featured appear at least X% of the time)
getWeightedRandomTagline(taglines, featuredMinWeight?)

// Find by ID
getTaglineById(taglines, id)

// Get all categories
getAllTaglineCategories(taglines)

// Generate daily seed
getDailySeed(date?)
```

## Testing

Run tagline utility tests:
```bash
bun test src/lib/tagline-utils.spec.ts
```

Tests cover:
- Random selection with seeds
- Featured filtering
- Category filtering
- ID lookup
- Daily seed generation
- Edge cases

## Integration with Homepage

Taglines are used in `src/pages/home.tsx`:

```typescript
// Get random tagline (featured at least 25% of the time)
const randomTagline = useMemo(() => {
    const taglines = taglinesData as Tagline[]
    return getWeightedRandomTagline(taglines, 0.25)
}, [])

// Display in subtitle
<p className='text-primary/70 mb-6 text-lg sm:text-xl'>
    {randomTagline.text}
</p>
```

## Best Practices

1. **Keep it concise**: Taglines should be punchy and memorable (under 100 characters ideal)
2. **Test before featuring**: Add as non-featured first, then promote if it performs well
3. **Maintain variety**: Balance categories to appeal to different visitor mindsets
4. **Update regularly**: Refresh taglines quarterly or when launching new products
5. **A/B test**: Use featured rotation to test multiple messages automatically
6. **Validate always**: Run `bun run validate:taglines` after any changes
7. **Semantic IDs**: Use descriptive IDs like "problem-3" or "transformation-5"

## Quick Reference

| Task | Command |
|------|---------|
| List all | `bun run update:taglines -- --operation list` |
| Add new | `bun run update:taglines -- --operation add --id "X" --text "Y" --category "Z" --featured false` |
| Edit | `bun run update:taglines -- --operation edit --id "X" --text "Y"` |
| Remove | `bun run update:taglines -- --operation remove --id "X"` |
| Toggle featured | `bun run update:taglines -- --operation toggle-featured --id "X"` |
| Validate | `bun run validate:taglines` |
| Test | `bun test src/lib/tagline-utils.spec.ts` |
