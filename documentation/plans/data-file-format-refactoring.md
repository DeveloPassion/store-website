# Data File Format Refactoring Plan

## Overview

Refactor 97 JSON data files (FAQs, media, testimonials) from invalid root-level arrays to proper JSON objects with a "data" property wrapper.

**Current (INVALID):**

```json
[{ "id": "faq-1", "question": "...", "answer": "...", "order": 0 }]
```

**Target (VALID):**

```json
{
    "data": [{ "id": "faq-1", "question": "...", "answer": "...", "order": 0 }]
}
```

## Scope

**Data Files (97 total):**

- 40 FAQ files: `src/data/products/*-faq.json`
- 37 Testimonial files: `src/data/products/*-testimonials.json`
- 20 Media files: `src/data/products/*-media.json`

**Code Files:**

- Schemas: `src/schemas/{faq,testimonial,media}.schema.ts` (add file-level schemas)
- Scripts: `scripts/update-products.ts` (update 6 I/O functions), `scripts/utils/aggregate-products.ts` (update 3 load functions)
- Tests: `src/schemas/{faq,testimonial,media}.schema.spec.ts` (add file-level tests, CREATE media test)
- Docs: `AGENTS.md`, `.claude/skills/*.md`

## Implementation Steps

### 1. Schema Changes (Foundation)

Add file-level schemas to wrap existing array schemas:

**`src/schemas/faq.schema.ts`:**

```typescript
export const FAQFileSchema = z.object({
    data: FAQsArraySchema
})
export type FAQFile = z.infer<typeof FAQFileSchema>
```

**`src/schemas/testimonial.schema.ts`:**

```typescript
export const TestimonialFileSchema = z.object({
    data: TestimonialsArraySchema
})
export type TestimonialFile = z.infer<typeof TestimonialFileSchema>
```

**`src/schemas/media.schema.ts`:**

```typescript
export const MediaFileSchema = z.object({
    data: MediaArraySchema
})
export type MediaFile = z.infer<typeof MediaFileSchema>
```

**Note:** Keep existing item schemas (`FAQSchema`, `TestimonialSchema`, `MediaItemSchema`) unchanged.

### 2. Test Suite Updates

**Update `src/schemas/faq.schema.spec.ts`:**

- Add describe block for `FAQFileSchema`
- Test valid file with data array, empty array, missing data property, invalid data, non-array data

**Update `src/schemas/testimonial.schema.spec.ts`:**

- Add describe block for `TestimonialFileSchema` with equivalent tests

**CREATE `src/schemas/media.schema.spec.ts`:**

- Comprehensive test suite for MediaItemSchema and MediaFileSchema
- Tests for MediaTypeSchema, MediaGroupSchema, required fields, optional fields
- File format validation tests
- **Critical:** Media schema currently has NO tests - this achieves 100% schema coverage

### 3. Script Updates

**Update `scripts/update-products.ts`** (6 functions):

1. `loadFaqs()` - Use `FAQFileSchema.safeParse()`, return `result.data.data`
2. `saveFaqs()` - Wrap array in `{ data: sorted }`, validate with `FAQFileSchema`
3. `loadTestimonials()` - Use `TestimonialFileSchema.safeParse()`, return `result.data.data`
4. `saveTestimonials()` - Wrap array in `{ data: sorted }`, validate with `TestimonialFileSchema`
5. `loadMedia()` - Use `MediaFileSchema.safeParse()`, return `result.data.data`
6. `saveMedia()` - Wrap array in `{ data: sorted }`, validate with `MediaFileSchema`

**Import updates:**

```typescript
import { FAQsArraySchema, FAQFileSchema } from '../src/schemas/faq.schema.js'
import {
    TestimonialsArraySchema,
    TestimonialFileSchema
} from '../src/schemas/testimonial.schema.js'
import { MediaArraySchema, MediaFileSchema } from '../src/schemas/media.schema.js'
```

**Update `scripts/utils/aggregate-products.ts`** (3 functions):

1. `loadFAQs()` - Return `file.data || []` (handle new format)
2. `loadTestimonials()` - Return `file.data || []`
3. `loadMedia()` - Return `file.data || []`

Add temporary backward compatibility:

```typescript
// Handle both old (array) and new (wrapped) formats during transition
if (Array.isArray(file)) {
    console.warn(`⚠️  Legacy format detected for ${productId}-faq.json`)
    return file
}
return file.data || []
```

**Note:** Remove backward compatibility after migration verified.

### 4. Data Migration

**Create `scripts/migrate-data-files.ts`:**

- Standalone migration script with dry-run mode
- Validates file format before and after migration
- Supports `--dry-run` and `--type=faq|testimonials|media|all` flags
- Reports migration stats (migrated, already-migrated, errors)

**Migration sequence:**

```bash
# 1. Dry run to preview
bun run scripts/migrate-data-files.ts --dry-run

# 2. Migrate incrementally with validation between each
bun run scripts/migrate-data-files.ts --type=faq
bun run validate:all && bun dev  # Test FAQs

bun run scripts/migrate-data-files.ts --type=testimonials
bun run validate:all && bun dev  # Test testimonials

bun run scripts/migrate-data-files.ts --type=media
bun run validate:all && bun dev  # Test media

# 3. Final validation
bun run validate:all
bun run test:run
bun run build
```

### 5. Documentation Updates

**Update `AGENTS.md`:**

- Update FAQ storage section (~line 8-12) with file format example
- Update Testimonial storage section with file format example
- Update Media File Format section (~line 385) with wrapped format

**Example format to add:**

```markdown
File format:
{
"data": [
{"id": "faq-1", "question": "...", "answer": "...", "order": 0}
]
}
```

**Check `.claude/skills/*.md`:**

- `manage-product-media.md` - No code examples, no updates needed
- `manage-products.md` - Search for JSON examples, update if found

### 6. Validation & Testing

**Commands:**

```bash
bun run validate:all        # All validators pass
bun run test:run            # All tests pass
bun run test:coverage       # Coverage 80%+
bun run build               # Build succeeds
bun dev                     # Manual testing
bun run update:products     # CLI tool works
```

**Manual testing checklist:**

- Product pages display FAQs correctly
- Product pages display testimonials correctly
- Media carousels work (all groups: cover, banner, main, secondary, bonus)
- CLI add/edit/remove operations work for all three types
- No console errors or warnings

**Cleanup after verification:**

- Remove backward compatibility code from `aggregate-products.ts`
- Delete `scripts/migrate-data-files.ts` (optional, can keep for reference)
- Re-test build and validation

## Critical Files

**Schemas:**

- `src/schemas/faq.schema.ts` - Add FAQFileSchema
- `src/schemas/testimonial.schema.ts` - Add TestimonialFileSchema
- `src/schemas/media.schema.ts` - Add MediaFileSchema

**Scripts:**

- `scripts/update-products.ts` - Update 6 I/O functions (loadFaqs, saveFaqs, loadTestimonials, saveTestimonials, loadMedia, saveMedia)
- `scripts/utils/aggregate-products.ts` - Update 3 load functions with backward compat

**Tests:**

- `src/schemas/faq.schema.spec.ts` - Add file-level tests
- `src/schemas/testimonial.schema.spec.ts` - Add file-level tests
- `src/schemas/media.schema.spec.ts` - CREATE comprehensive test suite

**Migration:**

- `scripts/migrate-data-files.ts` - CREATE migration script

**Docs:**

- `AGENTS.md` - Update file format examples

## Success Criteria

1. ✅ All 97 data files migrated to `{ "data": [...] }` format
2. ✅ All existing tests pass
3. ✅ New file-level schema tests added and passing
4. ✅ Media schema has comprehensive test coverage (currently 0%, target 100%)
5. ✅ `bun run validate:all` passes
6. ✅ `bun run build` succeeds
7. ✅ CLI tools work correctly (add/edit/remove/list for all types)
8. ✅ Product pages display FAQs, testimonials, media correctly
9. ✅ Documentation examples updated
10. ✅ No console errors or warnings

## Rollback Plan

If issues arise:

```bash
git checkout HEAD~1 src/data/products/*-{faq,testimonials,media}.json
git checkout HEAD~1 src/schemas/{faq,testimonial,media}.schema.ts
git checkout HEAD~1 scripts/update-products.ts
git checkout HEAD~1 scripts/utils/aggregate-products.ts
bun run validate:all && bun run build
git commit -m "revert: rollback data file format refactoring"
```

## Design Decisions

- **Property name:** Use `"data"` (industry standard, extensible, consistent)
- **Backward compatibility:** Temporary in aggregate-products.ts only (remove after migration)
- **Migration strategy:** Standalone script with dry-run mode (explicit, auditable, incremental)
- **Test strategy:** Add file-level tests, keep item-level tests unchanged
- **Schema naming:** `*FileSchema` pattern (clear distinction from item schemas)
- **Breaking changes:** Accepted per user requirement ("Don't hesitate to break backwards compatibility")

## Estimated Time

- Phase 1-2 (Schemas + Tests): 1.5 hours
- Phase 3 (Script updates): 1 hour
- Phase 4 (Migration): 1 hour
- Phase 5-6 (Docs + Validation): 1.5 hours
- **Total:** 5 hours

## Notes

- User explicitly approved breaking backward compatibility
- No need for migration path or gradual rollout
- All 97 files in git, safe to migrate
- Media schema testing is a bonus improvement (0% → 100% coverage)
