Plan: Enhance Tag and Category Management CLIs with Featured Management

Summary

Add a comprehensive manage-featured operation to both the tag management
CLI (scripts/update-tags.ts) and category management CLI
(scripts/update-categories.ts) that provides an interactive,
keyboard-navigable interface for managing which tags/categories are
featured and their priorities.

User Requirements

- Bulk promote/demote tags/categories (toggle featured status)
- Reorder featured tags/categories (change priorities)
- Quick view (show featured vs non-featured breakdown)
- Automatic priority renumbering when promoting/demoting
- Great UX with keyboard navigation (like the products CLI)
- Apply same enhancements to BOTH tags and categories CLIs

Current State

Existing Tag Management CLI (scripts/update-tags.ts):

- 798 lines, uses basic readline for prompts
- 5 operations: list, add, modify, remove, remove-unused
- Does NOT use inquirer (unlike update-products.ts)
- Featured field is a simple boolean in tag schema
- 8 featured tags (priority 1-8), 88 non-featured (priority 21+)
- Data structure: Map/Object (TagsMap)
- File: src/data/tags.json

Existing Category Management CLI (scripts/update-categories.ts):

- Similar structure to tags CLI, uses basic readline
- 5 operations: list, add, modify, remove, remove-unused
- Does NOT use inquirer (unlike update-products.ts)
- Featured field is a simple boolean in category schema
- 7 featured categories (priority 1-7), 16 non-featured (priority 8-23)
- Data structure: Array (CategoriesArray)
- File: src/data/categories.json
- Stricter removal rules: Cannot remove if used as mainCategory (even
  with --force)

Key Differences Between Tags and Categories:

- Data Structure: Tags use Map/Object, Categories use Array
- Count: 96 tags vs 23 categories
- Priority Ranges: Tags 1-8/21+, Categories 1-7/8-23
- Removal Rules: Categories have stricter constraints (mainCategory
  blocking)

Available Patterns from update-products.ts:

- inquirer v9.2.0 already in dependencies
- checkbox type for multi-select with visual indicators
- list type for single selection with pagination
- pageSize: 20 for large lists
- Featured items marked with ★ symbol
- Pre-checked items based on current state
- Validation with custom error messages

Proposed Solution

Overview

The same featured management functionality will be implemented in BOTH
scripts/update-tags.ts and scripts/update-categories.ts. The core logic
is identical, with adjustments for:

1. Data Structure: Tags use Map/Object access (tags[id]), Categories use
   Array operations (.find(), .filter())
2. Priority Ranges: Tags (1-8 featured, 21+ non-featured), Categories
   (1-7 featured, 8-23 non-featured)
3. Count Validation: Tags can have up to 8 featured, Categories up to 7
   featured

All code examples below show the tags implementation. The categories
implementation mirrors this with appropriate data structure and range
adjustments.

Implementation Order

Recommended approach:

1. Implement full functionality in scripts/update-tags.ts first
   (Map/Object structure)
2. Test thoroughly with tags data
3. Adapt implementation to scripts/update-categories.ts (Array structure)
4. Test thoroughly with categories data
5. Validate both with npm run validate:all

Rationale: Tags script is larger (798 lines) and has simpler data
structure (Map/Object). Starting here establishes the UX patterns that
will be replicated in categories. Categories script adaptations are then
straightforward (array operations, different ranges).

1. Add New Dependencies

Import inquirer at the top of both scripts/update-tags.ts and
scripts/update-categories.ts:

import inquirer from 'inquirer'

2. Add New Operation: manage-featured

Add to the CLI args interface and operation types:

interface CliArgs {
operation?: 'list' | 'add' | 'modify' | 'remove' | 'remove-unused' |
'manage-featured'
// ... existing fields
}

3. Core Functions to Implement

a) operationManageFeatured() - Main Entry Point

Interactive sub-menu with 5 choices:

1. View Featured Tags (show current breakdown)
2. Promote Tags to Featured (multi-select non-featured)
3. Demote Tags from Featured (multi-select featured)
4. Reorder Featured Tags (reassign priorities 1-8)
5. Exit (return to main menu)

Uses inquirer.prompt() with type: 'list' for menu selection.

b) viewFeaturedTags() - Quick View

Display two tables:

- Featured Tags (8) - ID, Name, Priority, sorted by priority
- Non-Featured Tags (88) - ID, Name, Priority, sorted by priority

Use existing emoji patterns: 🌟 for featured section, 📋 for
non-featured.

c) promoteTags() - Bulk Promote to Featured

Flow:

1. Load all non-featured tags (filter featured === false)
2. Display inquirer checkbox with:

- Sorted by priority
- pageSize: 20 for pagination
- Current priority shown in choice name: "Tag Name (tag-id) [Priority:
  23]"

3. User selects tags to promote (multi-select)
4. Auto-assign new priorities:

- Sort selected tags by name (alphabetical)
- Assign priorities 1, 2, 3, ... N (where N = number selected)
- Shift existing featured tags to N+1, N+2, ... (maintain their
  relative order)

5. Display before/after table showing priority changes
6. Confirm with "Confirm and save? [yes/no]"
7. Update tags, save to file
8. Show success message with reminder to validate

Auto-Priority Logic:
Selected for promotion: ["productivity", "ai", "learning"]
Current featured: ["obsidian" (1), "pkm" (2), ...]

New priorities:

- "ai" → priority 1
- "learning" → priority 2
- "productivity" → priority 3
- "obsidian" → priority 4 (was 1)
- "pkm" → priority 5 (was 2)
  ...

d) demoteTags() - Bulk Demote from Featured

Flow:

1. Load all featured tags (filter featured === true)
2. Display inquirer checkbox with:

- Sorted by priority (1-8)
- Current priority shown: "Obsidian (obsidian) ★ [Priority: 1]"
- pageSize: 20 (though only 8 featured)

3. User selects tags to demote (multi-select)
4. Auto-assign new priorities:

- Find current max non-featured priority (e.g., 105)
- Assign demoted tags: max+1, max+2, ... (sorted alphabetically)
- Renumber remaining featured tags to 1, 2, 3, ... (maintain relative
  order)

5. Display before/after table
6. Confirm with "Confirm and save? [yes/no]"
7. Update tags, save to file

Auto-Priority Logic:
Current featured: ["obsidian" (1), "pkm" (2), "productivity" (3), ...]
Selected for demotion: ["productivity"]
Current max non-featured priority: 105

After demotion:

- "productivity" → priority 106, featured = false
- "obsidian" → priority 1 (unchanged)
- "pkm" → priority 2 (unchanged)
- Remaining featured tags renumbered sequentially 1, 2, 3, ...

e) reorderFeaturedTags() - Interactive Reordering

Flow:

1. Load all featured tags (should be exactly 8)
2. Display current order with priorities
3. Use inquirer to prompt for new order:

- Option A (Recommended): Display numbered list (1-8), user selects
  which tag should be #1, then #2, etc.
- Option B: Use inquirer-sortable-checkbox (if available) for
  drag-and-drop style

4. Assign new priorities 1-8 based on new order
5. Display before/after comparison table
6. Confirm with "Confirm and save? [yes/no]"
7. Update tags, save to file

Interactive Ordering Approach (Option A):
Current order:

1. Obsidian (obsidian)
2. PKM (pkm)
3. Productivity (productivity)
   ...

For position #1, select tag: [list of 8 tags]
User selects: "Productivity"

For position #2, select tag: [remaining 7 tags]
User selects: "Obsidian"

...

4. Helper Functions

sortTagsByPriority(tags: Tag[]): Tag[]

Returns tags sorted by priority (ascending).

displayTagsTable(tags: Tag[], title: string): void

Displays tags in a formatted table with columns: ID (30 chars), Name (25
chars), Featured (10 chars), Priority (10 chars).

displayPriorityChanges(before: Tag[], after: Tag[]): void

Shows a comparison table of priority changes:
Priority Changes:
ID Name Before After

---

obsidian Obsidian 1 4
productivity Productivity 23 1

autoAssignFeaturedPriorities(tags: Tag[]): Tag[]

Automatically assigns priorities 1-N to featured tags (sorted by
priority), returns updated tags.

autoAssignNonFeaturedPriorities(tags: Tag[], startPriority: number):
Tag[]

Assigns priorities starting from startPriority to non-featured tags,
returns updated tags.

5. Integration Points

Update Interactive Mode Menu:

Add option 6 to the interactive menu:

console.log('Operations:')
console.log(' 1. list - View all tags')
console.log(' 2. add - Add a new tag')
console.log(' 3. modify - Modify an existing tag')
console.log(' 4. remove - Remove a tag')
console.log(' 5. remove-unused - Remove all unused tags')
console.log(' 6. manage-featured - Manage featured tags (bulk
promote/demote/reorder)')
console.log('')

Update CLI Mode Handler:

case 'manage-featured':
await operationManageFeatured()
break

6. UX Details

Visual Indicators:

- 🌟 Featured tag operations header
- ★ Symbol for featured tags in lists
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warnings and confirmations
- 📋 List views

Inquirer Configuration:
{
type: 'checkbox',
name: 'tags',
message: 'Select tags to promote (space to toggle, enter to
confirm):',
choices: tagChoices,
pageSize: 20,
validate: (input: string[]) => {
if (input.length === 0) {
return 'Please select at least one tag'
}
// Optional: limit to 8 total featured tags
if (currentFeaturedCount + input.length > 8) {
return `Cannot have more than 8 featured tags (currently
${currentFeaturedCount})`
}
return true
}
}

Choice Format:
// For promote (non-featured tags)
{
name: `${tag.name} (${tag.id}) [Priority: ${tag.priority}]`,
value: tag.id,
checked: false
}

// For demote (featured tags)
{
name: `${tag.name} (${tag.id}) ★ [Priority: ${tag.priority}]`,
value: tag.id,
checked: false
}

7. Validation & Safety

Pre-Save Validation:

- Ensure all featured tags have priorities 1-N (sequential)
- Ensure no duplicate priorities within featured/non-featured groups
- Validate using existing validateTag() function
- Display validation errors before confirming save

Confirmation Pattern:

- Always show before/after summary
- Require explicit "yes" or "y" confirmation
- Cancel operation on "no" or any other input

Post-Save Reminders:

- Remind user that schema enum does NOT need updating (only when
  adding/removing tags)
- Suggest running npm run validate:tags to verify changes

Files to Modify

scripts/update-tags.ts (primary changes for tags)

Add at top (imports):

- import inquirer from 'inquirer'

Add new functions (~400 lines):

1. operationManageFeatured() - ~80 lines
2. viewFeaturedTags() - ~50 lines
3. promoteTags() - ~120 lines
4. demoteTags() - ~120 lines
5. reorderFeaturedTags() - ~100 lines
6. Helper functions - ~50 lines total

- sortTagsByPriority()
- displayTagsTable()
- displayPriorityChanges()
- autoAssignFeaturedPriorities()
- autoAssignNonFeaturedPriorities()

Modify existing sections:

- CliArgs interface - add 'manage-featured' to operation type
- interactiveMode() function - add menu option 6
- cliMode() function - add case for 'manage-featured'

Estimated additions: ~500 lines (total file size ~1300 lines)

scripts/update-categories.ts (parallel changes for categories)

Add at top (imports):

- import inquirer from 'inquirer'

Add new functions (~400 lines):

1. operationManageFeatured() - ~80 lines (adapted for array data
   structure)
2. viewFeaturedCategories() - ~50 lines
3. promoteCategories() - ~120 lines (adapted for array)
4. demoteCategories() - ~120 lines (adapted for array)
5. reorderFeaturedCategories() - ~100 lines
6. Helper functions - ~50 lines total

- sortCategoriesByPriority()
- displayCategoriesTable()
- displayPriorityChanges()
- autoAssignFeaturedPriorities()
- autoAssignNonFeaturedPriorities()

Modify existing sections:

- CliArgs interface - add 'manage-featured' to operation type
- interactiveMode() function - add menu option 6
- cliMode() function - add case for 'manage-featured'

Key adjustments for categories:

- Work with Array instead of Map/Object
- Priority ranges: 1-7 featured, 8-23 non-featured
- Maximum 7 featured categories (not 8)
- Save using array structure with proper indexing

Estimated additions: ~500 lines (total file size for categories script
~1100 lines)

No other files need modification

- Schemas remain unchanged (featured is already a boolean in both)
- Tags data structure unchanged (map/object)
- Categories data structure unchanged (array)
- No changes to products

Testing Strategy

Manual Testing Scenarios for Tags

1. View Featured Tags:

- Run npm run update:tags
- Select option 6 (manage-featured)
- Select "View Featured Tags"
- Verify: 8 featured tags displayed with priorities 1-8
- Verify: 88 non-featured tags displayed with priorities 21+

2. Promote Tags:

- Select "Promote Tags to Featured"
- Select 2-3 non-featured tags via checkbox
- Verify: Before/after table shows correct priority assignments
- Confirm save
- Run npm run validate:tags - should pass
- Check src/data/tags.json - featured field updated, priorities
  sequential

3. Demote Tags:

- Select "Demote Tags from Featured"
- Select 1-2 featured tags via checkbox
- Verify: Before/after table shows demotion and renumbering
- Confirm save
- Validate and verify JSON file

4. Reorder Featured:

- Select "Reorder Featured Tags"
- Interactively select new order (1-8)
- Verify: Before/after shows correct priority changes
- Confirm save
- Validate

5. Edge Cases:

- Try promoting when already 8 featured → validation should prevent
- Try demoting all 8 featured tags → should work, leave 0 featured
- Cancel operations (enter "no") → verify no changes saved
- Select 0 tags → validation error "Please select at least one tag"

6. CLI Mode:

- npm run update:tags -- --operation manage-featured
- Should enter interactive sub-menu

Manual Testing Scenarios for Categories

1. View Featured Categories:

- Run npm run update:categories
- Select option 6 (manage-featured)
- Select "View Featured Categories"
- Verify: 7 featured categories displayed with priorities 1-7
- Verify: 16 non-featured categories displayed with priorities 8-23

2. Promote Categories:

- Select "Promote Categories to Featured"
- Select 2-3 non-featured categories via checkbox
- Verify: Before/after table shows correct priority assignments (1-7
  range)
- Confirm save
- Run npm run validate:categories - should pass
- Check src/data/categories.json - featured field updated, priorities
  sequential

3. Demote Categories:

- Select "Demote Categories from Featured"
- Select 1-2 featured categories via checkbox
- Verify: Before/after table shows demotion and renumbering
- Confirm save
- Validate and verify JSON file

4. Reorder Featured:

- Select "Reorder Featured Categories"
- Interactively select new order (1-7)
- Verify: Before/after shows correct priority changes
- Confirm save
- Validate

5. Edge Cases:

- Try promoting when already 7 featured → validation should prevent
- Try demoting all 7 featured categories → should work, leave 0
  featured
- Cancel operations (enter "no") → verify no changes saved
- Select 0 categories → validation error "Please select at least one
  category"

6. CLI Mode:

- npm run update:categories -- --operation manage-featured
- Should enter interactive sub-menu

Validation Checks

After each tags operation:

# Validate tags schema

npm run validate:tags

# Manually inspect tags.json

cat src/data/tags.json | grep -A 5 '"featured": true'

# Count featured tags (should be 0-8)

cat src/data/tags.json | grep '"featured": true' | wc -l

After each categories operation:

# Validate categories schema

npm run validate:categories

# Manually inspect categories.json

cat src/data/categories.json | grep -A 5 '"featured": true'

# Count featured categories (should be 0-7)

cat src/data/categories.json | grep '"featured": true' | wc -l

Validate all configurations:

# Run comprehensive validation

npm run validate:all

Success Criteria

For Tags CLI (scripts/update-tags.ts)

✅ User can view featured vs non-featured tags breakdown (8 vs 88)
✅ User can promote multiple tags to featured with automatic priority
assignment (1-8)
✅ User can demote multiple tags from featured with automatic priority
reassignment (21+)
✅ User can reorder featured tags interactively
✅ All operations use inquirer for keyboard-navigable interfaces
✅ Visual indicators (★, emojis) match existing CLI patterns
✅ Before/after summaries shown for all operations
✅ Confirmation step before saving changes
✅ Validation passes after all operations (npm run validate:tags)
✅ No breaking changes to existing operations (list, add, modify, remove,
remove-unused)
✅ Clear error messages and user guidance
✅ Operations are reversible (can promote/demote multiple times)
✅ Maximum 8 featured tags enforced

For Categories CLI (scripts/update-categories.ts)

✅ User can view featured vs non-featured categories breakdown (7 vs 16)
✅ User can promote multiple categories to featured with automatic
priority assignment (1-7)
✅ User can demote multiple categories from featured with automatic
priority reassignment (8-23)
✅ User can reorder featured categories interactively
✅ All operations use inquirer for keyboard-navigable interfaces
✅ Visual indicators (★, emojis) match existing CLI patterns
✅ Before/after summaries shown for all operations
✅ Confirmation step before saving changes
✅ Validation passes after all operations (npm run validate:categories)
✅ No breaking changes to existing operations (list, add, modify, remove,
remove-unused)
✅ Clear error messages and user guidance
✅ Operations are reversible (can promote/demote multiple times)
✅ Maximum 7 featured categories enforced
✅ Array data structure handled correctly (no object/map operations)

General

✅ Both CLIs have identical UX patterns
✅ Code is maintainable and well-commented
✅ inquirer v9.2.0 used consistently across both scripts
✅ All validation scripts pass (npm run validate:all)

Future Enhancements (Out of Scope)

For Both Tags and Categories

- Direct CLI arguments for promote/demote (e.g., --operation promote-tags
  --ids "tag1,tag2")
- Export/import featured configurations as JSON
- Bulk operations from CSV or JSON input
- Undo/redo functionality with history tracking
- Analytics: usage counts across products for featured vs non-featured
- Batch promote/demote across both tags and categories simultaneously
- Visual diff tool to compare featured configurations before/after
- Auto-suggest optimal featured items based on product usage statistics
